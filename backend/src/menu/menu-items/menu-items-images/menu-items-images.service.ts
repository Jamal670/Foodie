import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { MenuItemImage } from './entity/createMenuItemImage.entity';
import { MenuItemImageInput } from '../menu-items/DTO/createMenuItem.dto';

@Injectable()
export class MenuItemsImagesService {
  async createImagesTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    images?: MenuItemImageInput[],
  ): Promise<void> {
    if (!images?.length) {
      return;
    }

    const entities = images.map((img) =>
      entityManager.create(MenuItemImage, {
        itemId: menuItemId,
        imageUrl: img.imageUrl,
        isThumbnail: img.isThumbnail,
      }),
    );

    await Promise.all(
      entities.map((entity) => entityManager.save(MenuItemImage, entity)),
    );
  }

  async deleteImagesTransactional(
    entityManager: EntityManager,
    menuItemId: number,
  ): Promise<void> {
    await entityManager.delete(MenuItemImage, { itemId: menuItemId });
  }

  async updateImagesTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    images?: MenuItemImageInput[],
  ): Promise<void> {
    await this.deleteImagesTransactional(entityManager, menuItemId);
    await this.createImagesTransactional(entityManager, menuItemId, images);
  }
}
