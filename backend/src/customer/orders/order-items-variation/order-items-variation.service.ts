import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { OrderItemsVariation } from './entity/orderItemsVariation.entity';

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

  async findByOrderItemId(orderItemId: number): Promise<OrderItemsVariation[]> {
    return await this.repository.find({
      where: { orderItemId },
    });
  }

  async findByOrderItemIds(
    orderItemIds: number[],
  ): Promise<OrderItemsVariation[]> {
    if (!orderItemIds || orderItemIds.length === 0) return [];
    return await this.repository.find({
      where: { orderItemId: In(orderItemIds) },
    });
  }
}
