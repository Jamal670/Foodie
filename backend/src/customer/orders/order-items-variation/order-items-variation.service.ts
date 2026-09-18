import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemsVariation } from './entity/orderItemsVariation.entity';

import { EntityManager } from 'typeorm';

@Injectable()
export class OrderItemsVariationService {
  constructor(
    @InjectRepository(OrderItemsVariation)
    private readonly repository: Repository<OrderItemsVariation>,
  ) {}

  async createOrderItemVariationTransactional(
    entityManager: EntityManager,
    orderItemId: number,
    itemVariationId: number | null | undefined,
    name: string,
    price: number,
  ): Promise<OrderItemsVariation> {
    const entity = entityManager.create(OrderItemsVariation, {
      orderItemId,
      itemVariationId: itemVariationId ?? null,
      name,
      price,
    });
    return entityManager.save(OrderItemsVariation, entity);
  }
}
