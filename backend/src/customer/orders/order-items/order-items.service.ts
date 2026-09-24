import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItems } from './entity/OrderItems.entity';

import { EntityManager } from 'typeorm';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItems)
    private readonly orderItemsRepository: Repository<OrderItems>,
  ) {}

  async createOrderItemTransactional(
    entityManager: EntityManager,
    orderId: number,
    menuItemId: number,
    menuItemName: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number,
  ): Promise<OrderItems> {
    const item = entityManager.create(OrderItems, {
      orderId,
      menuItemId,
      menuItemName,
      quantity,
      unitPrice,
      totalPrice,
    });
    return entityManager.save(OrderItems, item);
  }

  async findOrderItemsByOrderId(
    orderId: number,
    branchId: number,
  ): Promise<OrderItems[]> {
    return await this.orderItemsRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.variations', 'variations')
      .leftJoinAndSelect('orderItem.customizations', 'customizations')
      .where('orderItem.orderId = :orderId', { orderId })
      .andWhere('order.branchId = :branchId', { branchId })
      .getMany();
  }
}
