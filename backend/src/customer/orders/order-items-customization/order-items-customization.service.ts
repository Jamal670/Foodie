import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemsCustomization } from './entity/orderItemsCustomization.entity';

import { EntityManager } from 'typeorm';

@Injectable()
export class OrderItemsCustomizationService {
  constructor(
    @InjectRepository(OrderItemsCustomization)
    private readonly repository: Repository<OrderItemsCustomization>,
  ) {}

  async createOrderItemCustomizationTransactional(
    entityManager: EntityManager,
    orderItemId: number,
    itemCustomizationId: number | null | undefined,
    name: string,
    price: number,
  ): Promise<OrderItemsCustomization> {
    const entity = entityManager.create(OrderItemsCustomization, {
      orderItemId,
      itemCustomizationId: itemCustomizationId ?? null,
      name,
      price,
    });
    return entityManager.save(OrderItemsCustomization, entity);
  }
}
