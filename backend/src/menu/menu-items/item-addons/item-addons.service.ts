import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ItemAddon } from './entity/createItemAddons.entity';
import { ItemAddonInput } from '../menu-items/DTO/createMenuItem.dto';

@Injectable()
export class ItemAddonsService {
  async createAddonsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    addons?: ItemAddonInput[],
  ): Promise<void> {
    if (!addons?.length) {
      return;
    }

    const entities = addons.map((addon) =>
      entityManager.create(ItemAddon, {
        itemId: menuItemId,
        addonId: addon.addonId,
      }),
    );

    await Promise.all(
      entities.map((entity) => entityManager.save(ItemAddon, entity)),
    );
  }

  async deleteAddonsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
  ): Promise<void> {
    await entityManager.delete(ItemAddon, { itemId: menuItemId });
  }

  async updateAddonsTransactional(
    entityManager: EntityManager,
    menuItemId: number,
    addons?: ItemAddonInput[],
  ): Promise<void> {
    await this.deleteAddonsTransactional(entityManager, menuItemId);
    await this.createAddonsTransactional(entityManager, menuItemId, addons);
  }
}
