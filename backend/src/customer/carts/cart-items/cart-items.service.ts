import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource, IsNull } from 'typeorm';

import { CustCartItems } from './entity/createCustCartItems.entity';
import { AddCartItemDto } from '../cart/dto/createCustCart.dto';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

export interface VerifiedItemContext {
  verifiedPrice: number;
  menuItemName: string;
  itemVariationName: string | null;
  itemCustomizationName: string | null;
  image: string | null;
}

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CustCartItems)
    private readonly cartItemsRepository: Repository<CustCartItems>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Eagerly validates menu item existence, tenant boundary (restaurantId), variations, customizations,
   * and verifies server-side price calculation in a single query outside the transaction.
   */
  async validateAndCalculatePrice(
    dto: AddCartItemDto,
    restaurantId: number,
    entityManager?: EntityManager,
  ): Promise<VerifiedItemContext> {
    const menuItemRepo: Repository<MenuItem> = entityManager
      ? entityManager.getRepository(MenuItem)
      : this.dataSource.getRepository(MenuItem);

    // Single eager query replacing multiple lazy relation round-trips
    const menuItem = await menuItemRepo.findOne({
      where: {
        id: dto.menuItemId,
        restaurantId,
      },
      relations: ['variations', 'customizations', 'images'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found.');
    }

    let calculatedPrice: number;
    let resolvedVariationName: string | null = null;
    let resolvedCustomizationName: string | null = null;

    // 1. Resolve variation (by variationId or itemVariationName)
    const variations = (await menuItem.variations) || [];
    if (dto.variationId || (dto.itemVariationName && dto.itemVariationName.trim())) {
      const matchingVar = variations.find((v) => {
        if (dto.variationId) return v.id === dto.variationId;
        return v.name.trim().toLowerCase() === dto.itemVariationName?.trim().toLowerCase();
      });

      if (!matchingVar) {
        throw new BadRequestException('Invalid item variation specified.');
      }
      resolvedVariationName = matchingVar.name;
      calculatedPrice = Number(matchingVar.price);
    } else {
      calculatedPrice =
        menuItem.discountedPrice && Number(menuItem.discountedPrice) > 0
          ? Number(menuItem.discountedPrice)
          : Number(menuItem.basePrice);
    }

    // 2. Resolve customization (by customizationId or itemCustomizationName)
    if (dto.customizationId || (dto.itemCustomizationName && dto.itemCustomizationName.trim())) {
      const customizations = (await menuItem.customizations) || [];
      const matchingCustom = customizations.find((c) => {
        if (dto.customizationId) return c.id === dto.customizationId;
        return c.name.trim().toLowerCase() === dto.itemCustomizationName?.trim().toLowerCase();
      });

      if (!matchingCustom) {
        throw new BadRequestException('Invalid item customization specified.');
      }
      resolvedCustomizationName = matchingCustom.name;
      calculatedPrice += Number(matchingCustom.price);
    }

    // 3. Optional client price validation against server-calculated price
    if (dto.price !== undefined && dto.price !== null) {
      if (Math.abs(Number(dto.price) - calculatedPrice) > 0.01) {
        throw new BadRequestException(
          `Submitted item price (${dto.price}) does not match.`,
        );
      }
    }

    // Resolve snapshot image
    const images = (await menuItem.images) || [];
    const resolvedImage =
      dto.image || (images.length > 0 ? images[0].imageUrl : null);

    return {
      verifiedPrice: calculatedPrice,
      menuItemName: dto.menuItemName || menuItem.name,
      itemVariationName: resolvedVariationName,
      itemCustomizationName: resolvedCustomizationName,
      image: resolvedImage,
    };
  }

  /**
   * Finds existing cart item scoped by (cartId, menuItemId, itemVariationName, itemCustomizationName).
   */
  async findCartItem(
    cartId: number,
    menuItemId: number,
    itemVariationName?: string | null,
    itemCustomizationName?: string | null,
    entityManager?: EntityManager,
  ): Promise<CustCartItems | null> {
    const repo: Repository<CustCartItems> = entityManager
      ? entityManager.getRepository(CustCartItems)
      : this.cartItemsRepository;

    const whereClause: any = {
      cartId,
      menuItemId,
      itemVariationName: itemVariationName ? itemVariationName.trim() : IsNull(),
      itemCustomizationName: itemCustomizationName ? itemCustomizationName.trim() : IsNull(),
    };

    return repo.findOne({ where: whereClause });
  }

  /**
   * Creates a new cart item snapshot row. Catches Postgres 23505 race conditions and falls back to update.
   */
  async createCartItem(
    cartId: number,
    dto: AddCartItemDto,
    context: VerifiedItemContext,
    entityManager?: EntityManager,
  ): Promise<CustCartItems> {
    const repo: Repository<CustCartItems> = entityManager
      ? entityManager.getRepository(CustCartItems)
      : this.cartItemsRepository;

    const newItem = repo.create({
      cartId,
      menuItemId: dto.menuItemId,
      menuItemName: context.menuItemName,
      itemVariationName: context.itemVariationName ? context.itemVariationName.trim() : undefined,
      itemCustomizationName: context.itemCustomizationName ? context.itemCustomizationName.trim() : undefined,
      quantity: dto.quantity,
      price: context.verifiedPrice * dto.quantity,
      image: context.image || undefined,
    });

    try {
      return await repo.save(newItem);
    } catch (err: any) {
      if (err?.code === '23505') {
        const existing = await this.findCartItem(
          cartId,
          dto.menuItemId,
          context.itemVariationName,
          context.itemCustomizationName,
          entityManager,
        );
        if (existing) {
          return this.updateCartItem(existing, dto.quantity, context.verifiedPrice, entityManager);
        }
      }
      throw err;
    }
  }

  /**
   * Increments quantity on an existing line item and updates price/snapshot.
   */
  async updateCartItem(
    existing: CustCartItems,
    addedQuantity: number,
    verifiedPrice: number,
    entityManager?: EntityManager,
  ): Promise<CustCartItems> {
    const repo: Repository<CustCartItems> = entityManager
      ? entityManager.getRepository(CustCartItems)
      : this.cartItemsRepository;

    // Add new quantity
    existing.quantity += addedQuantity;

    // Add the new item's price to the existing total price
    existing.price = Number(existing.price) + verifiedPrice * addedQuantity;

    return repo.save(existing);
  }

  /**
   * Orchestrates cart item check and create vs increment update.
   */
  async addOrUpdateCartItem(
    cartId: number,
    dto: AddCartItemDto,
    context: VerifiedItemContext,
    entityManager: EntityManager,
  ): Promise<CustCartItems> {
    const existing = await this.findCartItem(
      cartId,
      dto.menuItemId,
      context.itemVariationName,
      context.itemCustomizationName,
      entityManager,
    );

    if (existing) {
      return this.updateCartItem(existing, dto.quantity, context.verifiedPrice, entityManager);
    }

    return this.createCartItem(
      cartId,
      dto,
      context,
      entityManager,
    );
  }

  /**
   * Deletes a cart item by item ID, ensuring it belongs to the specified cart.
   */
  async deleteCartItem(
    cartItemId: number,
    cartId: number,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repo: Repository<CustCartItems> = entityManager
      ? entityManager.getRepository(CustCartItems)
      : this.cartItemsRepository;

    const result = await repo.delete({
      id: cartItemId,
      cartId,
    });

    if (!result.affected) {
      throw new NotFoundException(
        'Cart item not found in your active cart.',
      );
    }

    return true;
  }
}
