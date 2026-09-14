import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  QueryFailedError,
  DataSource,
  EntityManager,
} from 'typeorm';

import { MenuCategory } from './Entity/createMenuCategory.entity';
import { CreateMenuCategoryDto } from './DTO/createMenuCategory.dto';
import { UpdateMenuCategoryDto } from './DTO/updateMenuCategory.dto';
import { DeleteResponses } from './DTO/ResponseDTO/DeleteResponses.dto';
import { MenuItemsService } from '../menu-items/menu-items/menu-items.service';
import { MenuItem } from '../menu-items/menu-items/entity/createMenuItems.entity';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly menuCategoryRepository: Repository<MenuCategory>,
    private readonly dataSource: DataSource,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  //================== Get Menu Categories Tree ==================
  async getMenuCategoriesTree(restaurantId: number) {
    try {
      const categories = await this.getCategories(restaurantId);

      return this.buildTree(categories);
    } catch (error) {
      console.error('Get Menu Categories Tree Error:', error);

      throw new InternalServerErrorException(
        'Failed to fetch menu categories.',
      );
    }
  }

  //================== Get Categories ==================
  async getCategories(restaurantId: number): Promise<MenuCategory[]> {
    return this.menuCategoryRepository.find({
      where: { restaurantId },
      order: {
        level: 'ASC',
        id: 'ASC',
      },
    });
  }

  //================== Build Category Tree ==================
  private buildTree(categories: MenuCategory[]) {
    const categoryMap = new Map<number, any>();

    // Create lookup map
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    const tree: any[] = [];

    categories.forEach((category) => {
      const current = categoryMap.get(category.id);

      // Root Category (level 1 or no parent)
      if (!category.parentCategoryId || category.level === 1) {
        tree.push(current);
        return;
      }

      // Child Category
      const parent = categoryMap.get(category.parentCategoryId);

      if (parent) {
        parent.children.push(current);
      } else {
        tree.push(current);
      }
    });

    return tree;
  }

  //================== Create Menu Category ==================
  async createMenuCategory(dto: CreateMenuCategoryDto, restaurantId: number) {
    try {
      const category = this.menuCategoryRepository.create({
        ...dto,
        restaurantId,
      });

      if (dto.parentCategoryName) {
        const parentCategory = await this.menuCategoryRepository.findOne({
          where: {
            name: dto.parentCategoryName,
            restaurantId,
          },
        });

        if (!parentCategory) {
          throw new NotFoundException('Parent category not found.');
        }

        category.parentCategoryId = parentCategory.id;
        category.level = parentCategory.level + 1;
      } else {
        category.parentCategoryId = undefined;
        category.level = 1;
      }

      return await this.menuCategoryRepository.save(category);
    } catch (error) {
      console.error('Create Menu Category Error:', error);

      if (error instanceof QueryFailedError) {
        switch ((error as any).driverError.code) {
          case '23503':
            throw new BadRequestException(
              'Invalid restaurant or parent category selected.',
            );

          case '23502':
            throw new BadRequestException('Required fields are missing.');

          case '23505':
            throw new ConflictException('Category already exists.');

          default:
            throw new InternalServerErrorException(
              'Database operation failed.',
            );
        }
      }

      throw error;
    }
  }

  //================== Get Level 1 and Level 2 Categories ==================
  async getLevel1And2Categories(restaurantId: number) {
    try {
      const categories = await this.menuCategoryRepository.find({
        where: {
          restaurantId,
          level: In([1, 2]),
        },
      });

      return categories;
    } catch (error) {
      console.error('Get Level 1 and Level 2 Categories Error:', error);
      throw error;
    }
  }

  //================== Update Menu Category ==================
  async updateMenuCategory(dto: UpdateMenuCategoryDto, restaurantId: number) {
    try {
      const category = await this.menuCategoryRepository.findOne({
        where: {
          id: dto.id,
          restaurantId,
        },
      });

      if (!category) {
        throw new NotFoundException('Menu category not found.');
      }

      // Parent Category Selected
      if (dto.parentCategoryName) {
        console.log(dto.parentCategoryName);
        console.log(restaurantId);
        const parentCategory = await this.menuCategoryRepository.findOne({
          where: {
            name: dto.parentCategoryName,
            restaurantId: restaurantId,
          },
        });
        console.log(parentCategory);

        if (!parentCategory) {
          throw new NotFoundException('Parent category not found.');
        }

        category.parentCategoryId = parentCategory.id;
        category.level = parentCategory.level + 1;
      } else {
        category.parentCategoryId = undefined;
        category.level = 1;
      }

      category.name = dto.name;
      category.imageUrl = dto.imageUrl;
      category.description = dto.description;

      return await this.menuCategoryRepository.save(category);
    } catch (error) {
      console.error('Update Menu Category Error:', error);

      if (error instanceof QueryFailedError) {
        switch ((error as any).driverError.code) {
          case '23505':
            throw new ConflictException('Category already exists.');

          case '23503':
            throw new BadRequestException('Invalid parent category.');

          case '23502':
            throw new BadRequestException('Required fields are missing.');

          default:
            throw new InternalServerErrorException(
              'Database operation failed.',
            );
        }
      }

      throw error;
    }
  }

  //================== Delete Menu Category ==================
  async deleteMenuCategory(
    id: number,
    restaurantId: number,
    force = false,
  ): Promise<DeleteResponses> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Check category exists
      const category = await entityManager.findOne(MenuCategory, {
        where: { id, restaurantId },
      });

      if (!category) {
        throw new NotFoundException('Menu category not found.');
      }

      // Check direct children
      const children = await entityManager.find(MenuCategory, {
        where: {
          parentCategoryId: id,
          restaurantId,
        },
        select: {
          id: true,
        },
      });

      // Has children and user hasn't confirmed
      if (children.length > 0 && !force) {
        // Rollback first since we are returning early
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          hasChildren: true,
          childrenCount: children.length,
          message:
            'This category contains subcategories. Please confirm to delete everything.',
        };
      }

      // Delete recursively (passing entityManager)
      await this.deleteCategoryAndItemsRecursive(
        entityManager,
        id,
        restaurantId,
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        hasChildren: false,
        childrenCount: 0,
        message: 'Menu category deleted successfully.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Delete Menu Category Error:', error);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException('Database operation failed.');
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //*-*-*-*-*-*-*-*-*-*-*-*-* PRIVATE FUNCTION *-*-*-*-*-*-*-*-*-*-*-*-*
  private async deleteCategoryAndItemsRecursive(
    entityManager: EntityManager,
    categoryId: number,
    restaurantId: number,
  ): Promise<void> {
    // 1. Find all MenuItems belonging to current category
    const menuItems = await entityManager.find(MenuItem, {
      where: { categoryId, restaurantId },
      select: { id: true },
    });

    // 2. Delete each MenuItem transactionally
    for (const item of menuItems) {
      await this.menuItemsService.deleteMenuItemTransactional(
        entityManager,
        item.id,
      );
    }

    // 3. Find subcategories of current category
    const childCategories = await entityManager.find(MenuCategory, {
      where: { parentCategoryId: categoryId, restaurantId },
    });

    // 4. Process each child category recursively
    for (const child of childCategories) {
      await this.deleteCategoryAndItemsRecursive(
        entityManager,
        child.id,
        restaurantId,
      );
    }

    // 5. Finally, delete the category itself
    await entityManager.delete(MenuCategory, { id: categoryId, restaurantId });
  }
}
