import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';

import { OrderService } from './order.service';
import { Orders } from './entity/orders.entity';
import { CreateOrdersDto } from './dto/createOrders.dto';
import { CustomerJwtAuthGuard } from 'src/auth/guards/customer-jwt-auth.guard';
import {
  CurrentSession,
  CurrentCustomer,
} from 'src/auth/decorators/current-customer.decorator';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Customer } from 'src/customer/entity/customer.entity';

@Resolver(() => Orders)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(CustomerJwtAuthGuard)
  @Mutation(() => Orders)
  async createOrder(
    @Args('input') input: CreateOrdersDto,
    @CurrentSession() session: TableSession,
    @CurrentCustomer() customer: Customer,
  ): Promise<Orders> {
    return this.orderService.createOrder(input, session, customer);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Query(() => Orders, { nullable: true })
  async getOrder(
    @Args('orderId', { type: () => Int }) orderId: number,
  ): Promise<Orders | null> {
    return this.orderService.findOrderById(orderId);
  }
}
