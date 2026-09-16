import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItems } from './entity/OrderItems.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItems)
    private readonly orderItemsRepository: Repository<OrderItems>,
  ) {}

  async findByOrderId(orderId: number): Promise<OrderItems[]> {
    return this.orderItemsRepository.find({
      where: { orderId },
      relations: ['variations', 'customizations'],
    });
  }
}
