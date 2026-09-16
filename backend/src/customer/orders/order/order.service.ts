import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Orders } from './entity/orders.entity';
import { OrderItems } from '../order-items/entity/OrderItems.entity';
import { OrderItemsVariation } from '../order-items-variation/entity/orderItemsVariation.entity';
import { OrderItemsCustomization } from '../order-items-customization/entity/orderItemsCustomization.entity';
import { CustCart } from 'src/customer/carts/cart/entity/createCustCart.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Customer } from 'src/customer/entity/customer.entity';
import { CreateOrdersDto } from './dto/createOrders.dto';
import { OrderType, OrderStatus } from './enums/orders.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(CustCart)
    private readonly cartRepository: Repository<CustCart>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generates a race-safe, unique order number using a PostgreSQL sequence.
   */
  private async generateOrderNumber(queryRunnerManager: any): Promise<string> {
    try {
      // Create sequence if not exists
      await queryRunnerManager.query(
        `CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000 INCREMENT BY 1`,
      );

      const result = await queryRunnerManager.query(
        `SELECT nextval('order_number_seq') as seq`,
      );

      const seqNumber = result[0]?.seq || Date.now();
      const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      return `ORD-${datePrefix}-${String(seqNumber).padStart(5, '0')}`;
    } catch (error) {
      // Fallback fallback generator if database custom query fails
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `ORD-${Date.now()}-${randomSuffix}`;
    }
  }

  /**
   * Primary Customer Order Creation Flow:
   * Creates an order directly from the verified customer's active cart.
   */
  async createOrderFromCart(
    dto: CreateOrdersDto,
    session: TableSession,
    customer?: Customer,
  ): Promise<Orders> {
    if (!session || !session.id || !session.branchId) {
      throw new BadRequestException('Invalid or expired dining session context.');
    }

    // 1. Fetch active cart for session
    const cart = await this.cartRepository.findOne({
      where: { sessionId: session.id, isActive: true },
      relations: ['items'],
    });

    const items = (await cart?.items) || [];
    if (!cart || items.length === 0) {
      throw new BadRequestException(
        'Cannot place an order: Your active cart is empty.',
      );
    }

    // 2. Fetch branch tax rates
    const branch = await this.branchRepository.findOne({
      where: { id: session.branchId },
    });
    const taxRate = branch?.taxCash ? Number(branch.taxCash) / 100 : 0;

    // 3. Compute subtotal, tax, total server-side
    const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    // 4. Concurrency & Transaction-wrapped order placement
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const em = queryRunner.manager;

      // Generate race-safe sequence order number
      const orderNumber = await this.generateOrderNumber(em);

      // Create Orders row
      const newOrder = em.create(Orders, {
        orderNumber,
        branchId: session.branchId,
        tableId: session.tableId,
        tableSessionId: session.id,
        customerId: customer?.id || null,
        orderType: dto?.orderType || OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        subtotal,
        tax,
        total,
      });

      const savedOrder = await em.save(Orders, newOrder);

      // Create OrderItems and child variations/customizations
      for (const cartItem of items) {
        const qty = cartItem.quantity > 0 ? cartItem.quantity : 1;
        const lineTotalPrice = Number(cartItem.price);
        const unitPrice = Math.round((lineTotalPrice / qty) * 100) / 100;

        const orderItem = em.create(OrderItems, {
          orderId: savedOrder.id,
          menuItemId: cartItem.menuItemId || null,
          menuItemName: cartItem.menuItemName,
          quantity: qty,
          unitPrice,
          totalPrice: lineTotalPrice,
        });

        const savedOrderItem = await em.save(OrderItems, orderItem);

        // Snapshot variation if present
        if (cartItem.itemVariationName) {
          const varItem = em.create(OrderItemsVariation, {
            orderItemId: savedOrderItem.id,
            name: cartItem.itemVariationName,
            price: 0, // embedded in unit price
          });
          await em.save(OrderItemsVariation, varItem);
        }

        // Snapshot customization if present
        if (cartItem.itemCustomizationName) {
          const custItem = em.create(OrderItemsCustomization, {
            orderItemId: savedOrderItem.id,
            name: cartItem.itemCustomizationName,
            price: 0, // embedded in unit price
          });
          await em.save(OrderItemsCustomization, custItem);
        }
      }

      // Deactivate active cart
      cart.isActive = false;
      await em.save(CustCart, cart);

      await queryRunner.commitTransaction();

      // Fetch completed order with items relation populated
      return await this.ordersRepository.findOneOrFail({
        where: { id: savedOrder.id },
        relations: ['items', 'items.variations', 'items.customizations'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException(
            `Failed to create order: ${error?.message || error}`,
          );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find order by ID scoped to current dining session.
   */
  async getOrderById(orderId: number, sessionId?: number): Promise<Orders> {
    const where: any = { id: orderId };
    if (sessionId) {
      where.tableSessionId = sessionId;
    }

    const order = await this.ordersRepository.findOne({
      where,
      relations: ['items', 'items.variations', 'items.customizations'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found.`);
    }

    return order;
  }

  /**
   * Find all orders for current dining session.
   */
  async getOrdersForSession(sessionId: number): Promise<Orders[]> {
    return this.ordersRepository.find({
      where: { tableSessionId: sessionId },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.variations', 'items.customizations'],
    });
  }
}
