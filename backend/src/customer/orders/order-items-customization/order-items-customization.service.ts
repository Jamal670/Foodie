import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { OrderItemsCustomization } from './entity/orderItemsCustomization.entity';

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

  async findByOrderItemId(
    orderItemId: number,
  ): Promise<OrderItemsCustomization[]> {
    return await this.repository.find({
      where: { orderItemId },
    });
  }

  async findByOrderItemIds(
    orderItemIds: number[],
  ): Promise<OrderItemsCustomization[]> {
    if (!orderItemIds || orderItemIds.length === 0) return [];
    return await this.repository.find({
      where: { orderItemId: In(orderItemIds) },
    });
  }
}
