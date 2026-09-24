import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, EntityManager } from 'typeorm';

import { Orders } from './entity/orders.entity';
import { CustCart } from 'src/customer/carts/cart/entity/createCustCart.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Table } from 'src/table-module/table/entity/table.entity';
import { TableStatus } from 'src/table-module/table/entity/enums/enums';
import { Customer } from 'src/customer/entity/customer.entity';
import { CreateOrdersDto } from './dto/createOrders.dto';
import { OrderType, OrderStatus, PaymentMethod } from './enums/orders.enum';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';
import { CartService } from 'src/customer/carts/cart/cart.service';
import { BranchService } from 'src/resturants/branch/branch.service';
import { TableSectionService } from 'src/table-module/table-section/table-section.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderItemsVariationService } from '../order-items-variation/order-items-variation.service';
import { OrderItemsCustomizationService } from '../order-items-customization/order-items-customization.service';
import { OrderItems } from '../order-items/entity/OrderItems.entity';
import { CreatePosOrderDto } from 'src/waiter-and-posoperator/dto/createOrder.dto';
import { WaiterJwtPayload } from 'src/auth/guards/waiter-jwt-auth.guard';

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
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly cartService: CartService,
    private readonly branchService: BranchService,
    private readonly tableSectionService: TableSectionService,
    private readonly orderItemsService: OrderItemsService,
    private readonly orderItemsVariationService: OrderItemsVariationService,
    private readonly orderItemsCustomizationService: OrderItemsCustomizationService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Shared menu item, variation, and customization validation method used by both Customer and POS order flows.
   */
  async validateLineItems(
    items: Array<{
      menuItemId: number;
      quantity: number;
      variationId?: number;
      itemVariationName?: string;
      customizationId?: number;
      itemCustomizationName?: string;
    }>,
    restaurantId: number,
  ): Promise<ValidatedLineItem[]> {
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    const menuItemIds = [
      ...new Set(
        items
          .map((item) => item.menuItemId)
          .filter((id): id is number => id !== undefined && id !== null),
      ),
    ];

    const menuItemRepo = this.dataSource.getRepository(MenuItem);
    const menuItems = await menuItemRepo.find({
      where: {
        id: In(menuItemIds),
        restaurantId,
      },
      relations: ['variations', 'customizations'],
    });

    const menuItemMap = new Map<number, MenuItem>(
      menuItems.map((m) => [m.id, m]),
    );

    const validatedLineItems: ValidatedLineItem[] = [];

    for (const item of items) {
      if (!item.menuItemId) {
        throw new BadRequestException('Item missing menuItemId.');
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new BadRequestException('Item quantity must be greater than zero.');
      }

      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(
          `Menu item #${item.menuItemId} not found or unavailable.`,
        );
      }

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

    return validatedLineItems;
  }

  /**
   * Race-safe branch order sequence generator using pessimistic write locking.
   */
  async generateOrderNumberTransactional(
    entityManager: EntityManager,
    branchId: number,
    branchNo: string | number,
  ): Promise<string> {
    const lastOrder = await entityManager
      .getRepository(Orders)
      .createQueryBuilder('o')
      .where('o.branchId = :branchId', { branchId })
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
    return `ORD-${branchNo}-${formattedSeq}`;
  }

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

    // Step 2: Shared menu validation
    const validatedLineItems = await this.validateLineItems(
      cartItems
        .filter((item): item is typeof item & { menuItemId: number } => item.menuItemId !== undefined && item.menuItemId !== null)
        .map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          variationId: item.variationId,
          itemVariationName: item.itemVariationName,
          customizationId: item.customizationId,
          itemCustomizationName: item.itemCustomizationName,
        })),
      session.restaurantId,
    );

    // Step 3: Financial Calculations
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
      const orderNumber = await this.generateOrderNumberTransactional(
        entityManager,
        session.branchId,
        branch.branchNo,
      );

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
   * POS Operator order creation flow:
   * 1. Validates table by ID within staff's branch/restaurant.
   * 2. Retrieves branch details for tax rates and branch sequence number.
   * 3. Validates line items, variations, customizations using shared validation.
   * 4. Calculates subtotal, tax, total.
   * 5. Single atomic transaction:
   *    - Finds/creates active TableSession and transitions table to OCCUPIED.
   *    - Resolves/creates Customer record.
   *    - Generates race-safe branch order number.
   *    - Persists order, order items, variations, customizations.
   */
  async createOrderByPosOperator(
    dto: CreatePosOrderDto,
    user: WaiterJwtPayload,
  ): Promise<Orders> {
    if (!dto.tableId) {
      throw new BadRequestException('tableId is required.');
    }

    // Step 1: Validate Table in user's branch and restaurant
    const table = await this.tableRepository.findOne({
      where: {
        id: dto.tableId,
        branchId: user.branchId,
        restaurantId: user.restaurantId,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found in your branch.');
    }

    if (table.status === TableStatus.OUT_OF_SERVICE) {
      throw new BadRequestException('Table is out of service.');
    }

    // Step 2: Retrieve branch details for tax & branchNo
    const branch = await this.branchService.findBranchById(user.branchId);
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const paymentMethod = dto.paymentMethod || PaymentMethod.CASH;
    const taxRate =
      paymentMethod === PaymentMethod.CARD
        ? Number(branch.taxCard || 0)
        : Number(branch.taxCash || 0);

    // Step 3: Shared Menu / Variation / Customization Validation
    const validatedLineItems = await this.validateLineItems(
      dto.items,
      user.restaurantId,
    );

    // Step 4: Financial Calculations
    const subtotal = Number(
      validatedLineItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2),
    );
    const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    // Step 5: Single Atomic Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Section A: Find or create active TableSession
      const sessionResult =
        await this.tableSectionService.findOrCreateSession(
          table.id,
          user.restaurantId,
          user.branchId,
          'POS-Operator',
          entityManager,
        );
      const session = sessionResult.session;

      // Transition Table status to OCCUPIED if AVAILABLE
      if (table.status === TableStatus.AVAILABLE) {
        table.status = TableStatus.OCCUPIED;
        await entityManager.getRepository(Table).save(table);
      }

      // Section E: Customer Resolution
      let customer: Customer | null = null;
      const customerRepo = entityManager.getRepository(Customer);

      if (dto.phoneNo || dto.email) {
        const query = customerRepo
          .createQueryBuilder('c')
          .where('c.branchId = :branchId', { branchId: user.branchId });

        if (dto.phoneNo && dto.email) {
          query.andWhere(
            '(c.phoneNo = :phoneNo OR c.email = :email)',
            { phoneNo: dto.phoneNo.trim(), email: dto.email.trim() },
          );
        } else if (dto.phoneNo) {
          query.andWhere('c.phoneNo = :phoneNo', { phoneNo: dto.phoneNo.trim() });
        } else if (dto.email) {
          query.andWhere('c.email = :email', { email: dto.email.trim() });
        }

        customer = await query.getOne();
      }

      if (customer) {
        // Update existing customer info if provided
        let needsUpdate = false;
        if (dto.name && customer.name !== dto.name.trim()) {
          customer.name = dto.name.trim();
          needsUpdate = true;
        }
        if (dto.phoneNo && customer.phoneNo !== dto.phoneNo.trim()) {
          customer.phoneNo = dto.phoneNo.trim();
          needsUpdate = true;
        }
        if (dto.email && customer.email !== dto.email.trim()) {
          customer.email = dto.email.trim();
          needsUpdate = true;
        }
        if (needsUpdate) {
          await customerRepo.save(customer);
        }
      } else {
        // Create new Customer record
        customer = customerRepo.create({
          tableId: table.id,
          branchId: user.branchId,
          sessionId: session.id,
          name: dto.name ? dto.name.trim() : 'Walk-in POS Customer',
          phoneNo: dto.phoneNo ? dto.phoneNo.trim() : undefined,
          email: dto.email ? dto.email.trim() : undefined,
          isActive: true,
        });
        customer = await customerRepo.save(customer);
      }

      // Section D: Race-safe order number generation
      const orderNumber = await this.generateOrderNumberTransactional(
        entityManager,
        user.branchId,
        branch.branchNo,
      );

      // Persist Order
      const newOrder = entityManager.create(Orders, {
        orderNumber,
        branchId: user.branchId,
        tableId: table.id,
        tableSessionId: session.id,
        customerId: customer.id,
        orderType: dto.orderType || OrderType.DINE_IN,
        paymentMethod,
        status: OrderStatus.PENDING,
        subtotal,
        tax,
        total,
      });

      const savedOrder = await entityManager.save(Orders, newOrder);

      // Persist Order Items, Variations, Customizations
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

  /**
   * Fetches active DINE_IN orders for a given branchId, excluding COMPLETED and CANCELLED orders.
   */
  async findActiveDineInOrdersByBranch(branchId: number): Promise<Orders[]> {
    return this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.variations', 'variations')
      .leftJoinAndSelect('items.customizations', 'customizations')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.tableSession', 'tableSession')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.orderType = :orderType', { orderType: OrderType.DINE_IN })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Updates an order's status (e.g. to PREPARING), verifying existence, branch ownership, and allowed status transitions.
   */
  async updateOrderStatus(
    orderId: number,
    branchId: number,
    targetStatus: OrderStatus = OrderStatus.PREPARING,
  ): Promise<boolean> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, branchId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const allowedFrom: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
    ];
    if (!allowedFrom.includes(order.status)) {
      throw new BadRequestException(
        `Cannot transition order status from ${order.status} to ${targetStatus}.`,
      );
    }

    order.status = targetStatus;
    await this.ordersRepository.save(order);
    return true;
  }
}
