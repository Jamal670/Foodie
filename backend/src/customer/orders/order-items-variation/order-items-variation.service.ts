import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemsVariation } from './entity/orderItemsVariation.entity';

@Injectable()
export class OrderItemsVariationService {
  constructor(
    @InjectRepository(OrderItemsVariation)
    private readonly repository: Repository<OrderItemsVariation>,
  ) {}
}
