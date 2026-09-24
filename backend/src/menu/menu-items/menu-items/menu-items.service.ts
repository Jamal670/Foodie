import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DataSource, ILike, Not, EntityManager } from 'typeorm';
import { MenuItem } from './entity/createMenuItems.entity';
import { CreateMenuItemDto } from './DTO/createMenuItem.dto';
import { UpdateMenuItemDto } from './DTO/UpdateMenuItem.dto';
import { DeleteMenuItemDto } from './DTO/DeleteMenuItem.dto';
import { DeleteMenuItemListDto } from './DTO/deleteMenuItemList.dto';
import { DeleteResponse } from 'src/common/DTOResponse/DeleteResponse.dto';

import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';

import { MenuItemsImagesService } from '../menu-items-images/menu-items-images.service';
import { ItemAddonsService } from '../item-addons/item-addons.service';
import { ItemVariationService } from '../item-variation/item-variation.service';
import { ItemCustomizationService } from '../item-customization/item-customization.service';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly menuItemsImagesService: MenuItemsImagesService,
    private readonly itemAddonsService: ItemAddonsService,
    private readonly itemVariationService: ItemVariationService,
    private readonly itemCustomizationService: ItemCustomizationService,
  ) { }

  //======================== create menu Itmes ===========================
  async createMenuItem(
    dto: CreateMenuItemDto,
    restaurantId: number,
  ): Promise<MenuItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // 1. Verify restaurant exists
      const restaurant = await entityManager.findOne(Restaurant, {
        where: { id: restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found.`,
        );
      }

      // 2. Verify category belongs to the restaurant
      const category = await entityManager.findOne(MenuCategory, {
        where: { id: dto.categoryId },
      });
      if (!category || category.restaurantId !== restaurantId) {
        throw new BadRequestException(
          `Category with ID ${dto.categoryId} does not belong to restaurant ID ${restaurantId}.`,
        );
      }

      // 3. Verify item name is unique inside the restaurant (case-insensitive)
      const existingItem = await entityManager.findOne(MenuItem, {
        where: {
          restaurantId,
          name: ILike(dto.name),
        },
      });
      if (existingItem) {
        throw new ConflictException(
          `A menu item with name "${dto.name}" already exists in this restaurant.`,
        );
      }

      // 4. Determine item prices based on variations
      const hasVariations =
        Array.isArray(dto.variations) && dto.variations.length > 0;

      let basePrice = dto.basePrice ?? 0;
      let discountedPrice = dto.discountedPrice;

      // If variations exist, use the lowest variation price
      // as the menu item's discountedPrice.
      if (dto.variations && dto.variations.length > 0) {
        const variationPrices = dto.variations
          .map((variation) => Number(variation.price))
          .filter((price) => Number.isFinite(price));

        if (variationPrices.length === 0) {
          throw new BadRequestException(
            'At least one valid variation price is required when variations are provided.',
          );
        }

        discountedPrice = Math.min(...variationPrices);
      }

      if (
        !hasVariations &&
        (discountedPrice === undefined || discountedPrice === null)
      ) {
        throw new BadRequestException(
          'discountedPrice is required when no variations are provided.',
        );
      }

      // Create main MenuItem
      const menuItem = entityManager.create(MenuItem, {
        restaurantId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        basePrice,
        discountedPrice,
        status: dto.status || 'Active',
      });

      const savedMenuItem = await entityManager.save(MenuItem, menuItem);

      // 5. Delegate details creations
      await this.menuItemsImagesService.createImagesTransactional(
        entityManager,
        savedMenuItem.id,
        dto.images,
      );

      await this.itemAddonsService.createAddonsTransactional(
        entityManager,
        savedMenuItem.id,
        dto.addons,
      );

      await this.itemVariationService.createVariationsTransactional(
        entityManager,
        savedMenuItem.id,
        dto.variations,
      );

      await this.itemCustomizationService.createCustomizationsTransactional(
        entityManager,
        savedMenuItem.id,
        dto.customizations,
      );

      // 6. Commit transaction
      await queryRunner.commitTransaction();

      // 7. Return complete MenuItem with relations loaded
      const result = await this.dataSource.manager.findOne(MenuItem, {
        where: { id: savedMenuItem.id },
        relations: ['images', 'variations', 'customizations', 'addons'],
      });

      if (!result) {
        throw new NotFoundException(
          'Failed to retrieve newly created MenuItem.',
        );
      }

      return result;
    } catch (err) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release runner
      await queryRunner.release();
    }
  }

  //======================== get menu Itmes ===========================
  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    const restaurant = await this.dataSource.getRepository(Restaurant).findOne({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return this.dataSource.getRepository(MenuItem).find({
      where: {
        restaurantId,
        status: 'Active',
      },
      relations: {
        images: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  //-------------------------- get Menu Item list By ID ---------------
  async getMenuItem(itemId: number, restaurantId: number): Promise<MenuItem> {
    const menuItem = await this.dataSource.getRepository(MenuItem).findOne({
      where: {
        id: itemId,
        restaurantId,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found.');
    }

    return menuItem;
  }

  async getMenuItemDetailById(
    itemId: number,
    restaurantId: number,
  ) {
    const menuItem = await this.getMenuItem(itemId, restaurantId);

    const variations = (await menuItem.variations) || [];
    const customizations = (await menuItem.customizations) || [];
    const addons = (await menuItem.addons) || [];

    return {
      variations,
      customizations,
      addons,
    };
  }

  async updateMenuItem(
    dto: UpdateMenuItemDto,
    restaurantId: number,
  ): Promise<MenuItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // 1. Verify restaurant exists
      const restaurant = await entityManager.findOne(Restaurant, {
        where: { id: restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found.`,
        );
      }

      // 2. Verify menu item exists and belongs to the authenticated restaurant
      const menuItem = await entityManager.findOne(MenuItem, {
        where: { id: dto.itemId, restaurantId },
      });
      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with ID ${dto.itemId} not found in restaurant.`,
        );
      }

      // 3. Verify the category belongs to the restaurant
      if (dto.categoryId !== undefined) {
        const category = await entityManager.findOne(MenuCategory, {
          where: { id: dto.categoryId },
        });
        if (!category || category.restaurantId !== restaurantId) {
          throw new BadRequestException(
            `Category with ID ${dto.categoryId} does not belong to restaurant ID ${restaurantId}.`,
          );
        }
      }

      // 4. Verify item name is unique inside the restaurant (case-insensitive, ignoring the current item)
      if (dto.name !== undefined) {
        const existingItem = await entityManager.findOne(MenuItem, {
          where: {
            restaurantId,
            name: ILike(dto.name),
            id: Not(dto.itemId),
          },
        });
        if (existingItem) {
          throw new ConflictException(
            `A menu item with name "${dto.name}" already exists in this restaurant.`,
          );
        }
      }

      // 5. Update main MenuItem fields
      const updateData: Partial<MenuItem> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.basePrice !== undefined) updateData.basePrice = dto.basePrice;
      if (dto.discountedPrice !== undefined)
        updateData.discountedPrice = dto.discountedPrice;
      if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
      if (dto.status !== undefined) {
        if (!['Active', 'Inactive'].includes(dto.status)) {
          throw new BadRequestException('Status must be Active or Inactive.');
        }
        updateData.status = dto.status;
      }

      if (Object.keys(updateData).length > 0) {
        await entityManager.update(MenuItem, dto.itemId, updateData);
      }

      // 6. Handle nested tables conditional updates
      if (dto.imagesChanged === true) {
        await this.menuItemsImagesService.updateImagesTransactional(
          entityManager,
          dto.itemId,
          dto.images,
        );
      }

      if (dto.addonsChanged === true) {
        await this.itemAddonsService.updateAddonsTransactional(
          entityManager,
          dto.itemId,
          dto.addons,
        );
      }

      if (dto.variationsChanged === true) {
        await this.itemVariationService.updateVariationsTransactional(
          entityManager,
          dto.itemId,
          dto.variations,
        );
        if (dto.variations && dto.variations.length > 0) {
          const variationPrices = dto.variations
            .map((variation) => Number(variation.price))
            .filter((price) => Number.isFinite(price));
          if (variationPrices.length > 0) {
            await entityManager.update(MenuItem, dto.itemId, {
              discountedPrice: Math.min(...variationPrices),
            });
          }
        }
      }

      if (dto.customizationsChanged === true) {
        await this.itemCustomizationService.updateCustomizationsTransactional(
          entityManager,
          dto.itemId,
          dto.customizations,
        );
      }

      // 7. Commit transaction
      await queryRunner.commitTransaction();

      // 8. Return updated MenuItem with relations loaded using Promise-based relation fields
      const result = await this.dataSource.manager.findOne(MenuItem, {
        where: { id: dto.itemId },
        relations: ['images', 'variations', 'customizations', 'addons'],
      });

      if (!result) {
        throw new NotFoundException('Failed to retrieve updated MenuItem.');
      }

      return result;
    } catch (err) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release runner
      await queryRunner.release();
    }
  }

  async deleteMenuItemTransactional(
    entityManager: EntityManager,
    menuItemId: number,
  ): Promise<void> {
    // 1. Delegate child records deletion using child services' transactional delete methods
    await this.menuItemsImagesService.deleteImagesTransactional(
      entityManager,
      menuItemId,
    );

    await this.itemAddonsService.deleteAddonsTransactional(
      entityManager,
      menuItemId,
    );

    await this.itemVariationService.deleteVariationsTransactional(
      entityManager,
      menuItemId,
    );

    await this.itemCustomizationService.deleteCustomizationsTransactional(
      entityManager,
      menuItemId,
    );

    // 2. Delete the main MenuItem
    await entityManager.delete(MenuItem, { id: menuItemId });
  }

  async deleteMenuItem(
    dto: DeleteMenuItemDto,
    restaurantId: number,
  ): Promise<DeleteResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // 1. Verify restaurant exists
      const restaurant = await entityManager.findOne(Restaurant, {
        where: { id: restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found.`,
        );
      }

      // 2. Verify menu item exists and belongs to the authenticated restaurant
      const menuItem = await entityManager.findOne(MenuItem, {
        where: { id: dto.itemId, restaurantId },
      });
      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with ID ${dto.itemId} not found in restaurant.`,
        );
      }

      // 3. Delegate to internal transactional deletion method
      await this.deleteMenuItemTransactional(entityManager, dto.itemId);

      // 4. Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Menu item deleted successfully.',
      };
    } catch (err) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release runner
      await queryRunner.release();
    }
  }

  async deleteMenuItems(
    dto: DeleteMenuItemListDto,
    restaurantId: number,
  ): Promise<DeleteResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // 1. Verify restaurant exists
      const restaurant = await entityManager.findOne(Restaurant, {
        where: { id: restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found.`,
        );
      }

      // 2. Validate every MenuItem exists and belongs to the authenticated restaurant
      for (const itemId of dto.itemIds) {
        const menuItem = await entityManager.findOne(MenuItem, {
          where: { id: itemId, restaurantId },
        });
        if (!menuItem) {
          throw new NotFoundException(
            `Menu item with ID ${itemId} not found in restaurant.`,
          );
        }
      }

      // 3. Loop through itemIds and call deleteMenuItemTransactional()
      for (const itemId of dto.itemIds) {
        await this.deleteMenuItemTransactional(entityManager, itemId);
      }

      // 4. Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Selected menu items deleted successfully.',
      };
    } catch (err) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release runner
      await queryRunner.release();
    }
  }
}
