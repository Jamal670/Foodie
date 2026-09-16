import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemsCustomization } from './entity/orderItemsCustomization.entity';

@Injectable()
export class OrderItemsCustomizationService {
  constructor(
    @InjectRepository(OrderItemsCustomization)
    private readonly repository: Repository<OrderItemsCustomization>,
  ) {}
}
