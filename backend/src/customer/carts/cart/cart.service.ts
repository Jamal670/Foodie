import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';

import { CustCart } from './entity/createCustCart.entity';
import { AddCartItemDto } from './dto/createCustCart.dto';
import { CartItemsService } from '../cart-items/cart-items.service';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { DeleteCustCartItemDto } from './dto/deleteCustCart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CustCart)
    private readonly cartRepository: Repository<CustCart>,
    private readonly cartItemsService: CartItemsService,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Finds active cart for a specific table session.
   */
  async findCart(
    sessionId: number,
    entityManager?: EntityManager,
  ): Promise<CustCart | null> {
    const repo: Repository<CustCart> = entityManager
      ? entityManager.getRepository(CustCart)
      : this.cartRepository;

    return repo.findOne({
      where: { sessionId, isActive: true },
      relations: ['items'],
    });
  }

  /**
   * Creates a new active cart for a session. Catches Postgres 23505 race condition on unique active cart.
   */
  async createCart(
    branchId: number,
    tableId: number,
    sessionId: number,
    entityManager?: EntityManager,
  ): Promise<CustCart> {
    const repo: Repository<CustCart> = entityManager
      ? entityManager.getRepository(CustCart)
      : this.cartRepository;

    const newCart = repo.create({
      branchId,
      tableId,
      sessionId,
      isActive: true,
    });

    try {
      return await repo.save(newCart);
    } catch (err: any) {
      if (
        err?.code === '23505' ||
        (err?.message && err.message.includes('UQ_cust_carts_session_active'))
      ) {
        const activeCart = await this.findCart(sessionId, entityManager);
        if (activeCart) return activeCart;
      }
      throw err;
    }
  }

  /**
   * Finds an existing active cart or creates one inside the active transaction.
   */
  async findOrCreateCart(
    branchId: number,
    tableId: number,
    sessionId: number,
    entityManager?: EntityManager,
  ): Promise<CustCart> {
    const existing = await this.findCart(sessionId, entityManager);
    if (existing) return existing;

    return this.createCart(branchId, tableId, sessionId, entityManager);
  }

  /**
   * Optimized add-to-cart flow:
   * 1. Read verification & price calculation executed outside transaction.
   * 2. Transaction performs atomic findOrCreateCart + item write.
   * 3. Response is returned directly using in-memory saved entities, eliminating post-commit re-fetch.
   */
  async addCartItem(
    dto: AddCartItemDto,
    session: TableSession,
  ): Promise<CustCart> {
    if (
      !session ||
      !session.id ||
      !session.tableId ||
      !session.branchId ||
      !session.restaurantId
    ) {
      throw new BadRequestException('Invalid or expired dining session context.');
    }

    // Step 1: Pre-transaction validation and price calculation (outside transaction)
    const itemContext = await this.cartItemsService.validateAndCalculatePrice(
      dto,
      session.restaurantId,
    );

    // Step 2: Open single tight transaction for database writes
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Find or create session-scoped active cart
      const cart = await this.findOrCreateCart(
        session.branchId,
        session.tableId,
        session.id,
        entityManager,
      );

      // Add or update cart item inside transaction
      const savedItem = await this.cartItemsService.addOrUpdateCartItem(
        cart.id,
        dto,
        itemContext,
        entityManager,
      );

      await queryRunner.commitTransaction();

      // Step 3: Fast in-memory response construction (eliminates 1 full SELECT query)
      const currentItems = (await cart.items) || [];
      const itemIndex = currentItems.findIndex((i) => i.id === savedItem.id);
      if (itemIndex >= 0) {
        currentItems[itemIndex] = savedItem;
      } else {
        currentItems.push(savedItem);
      }
      cart.items = Promise.resolve(currentItems);

      return cart;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Helper to fetch cart by session ID.
   */
  async getCartBySessionId(sessionId: number): Promise<CustCart | null> {
    return this.findCart(sessionId);
  }

  // ==============================> Delete Cart Item <==============================

  async deleteCartItem(
    dto: DeleteCustCartItemDto,
    session: TableSession,
  ): Promise<boolean> {
    if (!session?.id) {
      throw new BadRequestException(
        'Invalid or expired dining session context.',
      );
    }

    if (!dto?.cartItemId || dto.cartItemId <= 0) {
      throw new BadRequestException(
        'Valid cart item ID must be provided.',
      );
    }

    // Get only the active cart ID first.
    // No need to load all cart items at this stage.
    const cart = await this.cartRepository.findOne({
      where: {
        sessionId: session.id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        'Active cart not found for this session.',
      );
    }

    // Delete only the requested item belonging to this cart.
    await this.cartItemsService.deleteCartItem(
      dto.cartItemId,
      cart.id,
    );

    // Return the updated cart with its remaining items.
    // const updatedCart = await this.findCart(session.id);

    // if (!updatedCart) {
    //   throw new NotFoundException(
    //     'Cart not found after deletion.',
    //   );
    // }

    return true;
  }
}
