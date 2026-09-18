import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { Orders } from './entity/orders.entity';
import { CustCart } from 'src/customer/carts/cart/entity/createCustCart.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Customer } from 'src/customer/entity/customer.entity';
import { CreateOrdersDto } from './dto/createOrders.dto';
import { OrderType, OrderStatus, PaymentMethod } from './enums/orders.enum';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';
import { CartService } from 'src/customer/carts/cart/cart.service';
import { BranchService } from 'src/resturants/branch/branch.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderItemsVariationService } from '../order-items-variation/order-items-variation.service';
import { OrderItemsCustomizationService } from '../order-items-customization/order-items-customization.service';
import { OrderItems } from '../order-items/entity/OrderItems.entity';

export interface ValidatedLineItem {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variationSnapshot: { variationId?: number; name: string; price: number } | null;
  customizationSnapshot: { customizationId?: number; name: string; price: number } | null;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(CustCart)
    private readonly cartRepository: Repository<CustCart>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly cartService: CartService,
    private readonly branchService: BranchService,
    private readonly orderItemsService: OrderItemsService,
    private readonly orderItemsVariationService: OrderItemsVariationService,
    private readonly orderItemsCustomizationService: OrderItemsCustomizationService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Orchestrates the complete order creation flow:
   * 1. Validates dining session and customer context.
   * 2. Retrieves active cart and branch details.
   * 3. Validates menu items, variations, customizations against live DB data.
   * 4. Calculates subtotal, tax rate, and total amount.
   * 5. Executes a single atomic transaction: locks and deactivates cart, generates race-safe branch order number,
   *    persists order, order items, variations, customizations, and updates customer details.
   */
  async createOrder(
    dto: CreateOrdersDto,
    session: TableSession,
    customer: Customer,
  ): Promise<Orders> {
    if (!session || !session.id || !session.branchId || !session.restaurantId) {
      throw new BadRequestException(
        'Invalid or expired dining session context.',
      );
    }

    if (!customer || !customer.id) {
      throw new BadRequestException('Invalid or expired customer context.');
    }

    // Step 1: Concurrent pre-transaction retrieval (Active Cart + Branch Details)
    const [cart, branch] = await Promise.all([
      this.cartService.findCart(session.id),
      this.branchService.findBranchById(session.branchId),
    ]);

    if (!cart) {
      throw new BadRequestException('No active cart found for your session.');
    }

    const cartItems = (await cart.items) || [];
    if (cartItems.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const taxRate =
      dto.paymentMethod === PaymentMethod.CARD
        ? Number(branch.taxCard || 0)
        : Number(branch.taxCash || 0);

    // Step 2: Single eager query for all referenced menu items with variations & customizations
    const menuItemIds = [
      ...new Set(
        cartItems
          .map((item) => item.menuItemId)
          .filter((id): id is number => id !== undefined && id !== null),
      ),
    ];

    const menuItemRepo = this.dataSource.getRepository(MenuItem);
    const menuItems = await menuItemRepo.find({
      where: {
        id: In(menuItemIds),
        restaurantId: session.restaurantId,
      },
      relations: ['variations', 'customizations'],
    });

    const menuItemMap = new Map<number, MenuItem>(
      menuItems.map((m) => [m.id, m]),
    );

    const validatedLineItems: ValidatedLineItem[] = [];

    for (const item of cartItems) {
      if (!item.menuItemId) {
        throw new BadRequestException('Cart item missing menuItemId.');
      }

      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(
          `Menu item #${item.menuItemId} not found or unavailable.`,
        );
      }

      // Verify menu item status is Active
      if (menuItem.status !== 'Active') {
        throw new BadRequestException(
          `Menu item "${menuItem.name}" is no longer active.`,
        );
      }

      let unitPrice = 0;
      let variationSnapshot: {
        variationId?: number;
        name: string;
        price: number;
      } | null = null;
      let customizationSnapshot: {
        customizationId?: number;
        name: string;
        price: number;
      } | null = null;

      // Variation Resolution (skips query if both IDs/names are null)
      const variations = (await menuItem.variations) || [];
      if (
        item.variationId ||
        (item.itemVariationName && item.itemVariationName.trim())
      ) {
        const matchingVar = variations.find((v) => {
          if (item.variationId) return v.id === item.variationId;
          return (
            v.name.trim().toLowerCase() ===
            item.itemVariationName?.trim().toLowerCase()
          );
        });

        if (!matchingVar) {
          throw new BadRequestException(
            `Invalid variation specified for item "${menuItem.name}".`,
          );
        }

        unitPrice = Number(matchingVar.price);
        variationSnapshot = {
          variationId: matchingVar.id,
          name: matchingVar.name,
          price: Number(matchingVar.price),
        };
      } else {
        unitPrice =
          menuItem.discountedPrice && Number(menuItem.discountedPrice) > 0
            ? Number(menuItem.discountedPrice)
            : Number(menuItem.basePrice);
      }

      // Customization Resolution (skips query if both IDs/names are null)
      const customizations = (await menuItem.customizations) || [];
      if (
        item.customizationId ||
        (item.itemCustomizationName && item.itemCustomizationName.trim())
      ) {
        const matchingCustom = customizations.find((c) => {
          if (item.customizationId) return c.id === item.customizationId;
          return (
            c.name.trim().toLowerCase() ===
            item.itemCustomizationName?.trim().toLowerCase()
          );
        });

        if (!matchingCustom) {
          throw new BadRequestException(
            `Invalid customization specified for item "${menuItem.name}".`,
          );
        }

        unitPrice += Number(matchingCustom.price);
        customizationSnapshot = {
          customizationId: matchingCustom.id,
          name: matchingCustom.name,
          price: Number(matchingCustom.price),
        };
      }

      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));

      validatedLineItems.push({
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        variationSnapshot,
        customizationSnapshot,
      });
    }

    // Step 3: Financial Calculations (Section D: Subtotal pre-tax, tax, total = subtotal + tax)
    const subtotal = Number(
      validatedLineItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2),
    );
    const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    // Step 4: Single Atomic Database Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Section A: Lock cart row and claim/deactivate cart
      const activeCart = await entityManager.getRepository(CustCart).findOne({
        where: { id: cart.id, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!activeCart) {
        throw new BadRequestException(
          'Cart was already submitted or is no longer active.',
        );
      }

      activeCart.isActive = false;
      await entityManager.save(CustCart, activeCart);

      // Section C: Race-safe branch order sequence generation
      const lastOrder = await entityManager
        .getRepository(Orders)
        .createQueryBuilder('o')
        .where('o.branchId = :branchId', { branchId: session.branchId })
        .orderBy('o.id', 'DESC')
        .setLock('pessimistic_write')
        .getOne();

      let sequence = 1;
      if (lastOrder && lastOrder.orderNumber) {
        const parts = lastOrder.orderNumber.split('-');
        if (parts.length === 3) {
          const lastSeq = parseInt(parts[2], 10);
          if (!isNaN(lastSeq)) {
            sequence = lastSeq + 1;
          }
        }
      }

      const formattedSeq = String(sequence).padStart(4, '0');
      const orderNumber = `ORD-${branch.branchNo}-${formattedSeq}`;

      // Persist Order
      const newOrder = entityManager.create(Orders, {
        orderNumber,
        branchId: session.branchId,
        tableId: session.tableId,
        tableSessionId: session.id,
        customerId: customer.id,
        orderType: dto.orderType || OrderType.DINE_IN,
        paymentMethod: dto.paymentMethod,
        status: OrderStatus.PENDING,
        subtotal,
        tax,
        total,
      });

      const savedOrder = await entityManager.save(Orders, newOrder);

      // Persist Order Items, Variations, Customizations using dedicated services
      const savedItemsList: OrderItems[] = [];

      for (const line of validatedLineItems) {
        const savedOrderItem =
          await this.orderItemsService.createOrderItemTransactional(
            entityManager,
            savedOrder.id,
            line.menuItemId,
            line.menuItemName,
            line.quantity,
            line.unitPrice,
            line.lineTotal,
          );

        if (line.variationSnapshot) {
          const savedVar =
            await this.orderItemsVariationService.createOrderItemVariationTransactional(
              entityManager,
              savedOrderItem.id,
              line.variationSnapshot.variationId,
              line.variationSnapshot.name,
              line.variationSnapshot.price,
            );
          savedOrderItem.variations = Promise.resolve([savedVar]);
        } else {
          savedOrderItem.variations = Promise.resolve([]);
        }

        if (line.customizationSnapshot) {
          const savedCust =
            await this.orderItemsCustomizationService.createOrderItemCustomizationTransactional(
              entityManager,
              savedOrderItem.id,
              line.customizationSnapshot.customizationId,
              line.customizationSnapshot.name,
              line.customizationSnapshot.price,
            );
          savedOrderItem.customizations = Promise.resolve([savedCust]);
        } else {
          savedOrderItem.customizations = Promise.resolve([]);
        }

        savedItemsList.push(savedOrderItem);
      }

      savedOrder.items = Promise.resolve(savedItemsList);

      // Section 16: Customer Info Update
      if (dto.name || dto.phoneNo || dto.email) {
        const updatePayload: Partial<Customer> = {};
        if (dto.name) updatePayload.name = dto.name.trim();
        if (dto.phoneNo) updatePayload.phoneNo = dto.phoneNo.trim();
        if (dto.email) updatePayload.email = dto.email.trim();

        await entityManager.update(Customer, customer.id, updatePayload);
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Helper to fetch an order by ID.
   */
  async findOrderById(orderId: number): Promise<Orders | null> {
    return this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }
}
