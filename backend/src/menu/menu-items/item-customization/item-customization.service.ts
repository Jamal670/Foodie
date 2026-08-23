import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ItemCustomization } from './entity/createItemCustomization.entity';
import { ItemCustomizationInput } from '../menu-items/DTO/createMenuItem.dto';

@Injectable()
export class ItemCustomizationService {
  async createCustomizationsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    customizations?: ItemCustomizationInput[],
  ): Promise<void> {
    if (!customizations?.length) {
      return;
    }

    const entities = customizations.map((c) =>
      entityManager.create(ItemCustomization, {
        itemId: menuItemId,
        name: c.name,
        price: c.price,
        multiSelect: c.multiSelect,
      }),
    );

    await Promise.all(
      entities.map((entity) => entityManager.save(ItemCustomization, entity)),
    );
  }

  async deleteCustomizationsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
  ): Promise<void> {
    await entityManager.delete(ItemCustomization, { itemId: menuItemId });
  }

  async updateCustomizationsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    customizations?: ItemCustomizationInput[],
  ): Promise<void> {
    await this.deleteCustomizationsTransactional(entityManager, menuItemId);
    await this.createCustomizationsTransactional(
      entityManager,
      menuItemId,
      customizations,
    );
  }
}
