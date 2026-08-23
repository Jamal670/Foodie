import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ItemVariation } from './entity/createItemVariation.entity';
import { ItemVariationInput } from '../menu-items/DTO/createMenuItem.dto';

@Injectable()
export class ItemVariationService {
  async createVariationsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    variations?: ItemVariationInput[],
  ): Promise<void> {
    if (!variations?.length) {
      return;
    }

    const entities = variations.map((v) =>
      entityManager.create(ItemVariation, {
        itemId: menuItemId,
        name: v.name,
        price: v.price,
      }),
    );

    await Promise.all(
      entities.map((entity) => entityManager.save(ItemVariation, entity)),
    );
  }

  async deleteVariationsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
  ): Promise<void> {
    await entityManager.delete(ItemVariation, { itemId: menuItemId });
  }

  async updateVariationsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    variations?: ItemVariationInput[],
  ): Promise<void> {
    await this.deleteVariationsTransactional(entityManager, menuItemId);
    await this.createVariationsTransactional(
      entityManager,
      menuItemId,
      variations,
    );
  }
}
