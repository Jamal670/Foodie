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
  @Mutation(() => Orders, { description: 'Places an order from the active dining session cart' })
  async createOrder(
    @Args('dto', { nullable: true }) dto: CreateOrdersDto,
    @CurrentSession() session: TableSession,
    @CurrentCustomer() customer: Customer,
  ): Promise<Orders> {
    if (!session || !session.id) {
      throw new BadRequestException(
        'Dining session has expired. Please rescan QR code to continue.',
      );
    }
    return this.orderService.createOrderFromCart(
      dto || {},
      session,
      customer,
    );
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Query(() => Orders, { description: 'Gets details of a specific order in the current session' })
  async getOrderById(
    @Args('id', { type: () => Int }) id: number,
    @CurrentSession() session: TableSession,
  ): Promise<Orders> {
    if (!session || !session.id) {
      throw new BadRequestException(
        'Dining session has expired. Please rescan QR code to continue.',
      );
    }
    return this.orderService.getOrderById(id, session.id);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Query(() => [Orders], { description: 'Gets all orders placed during the current dining session' })
  async getMyOrders(
    @CurrentSession() session: TableSession,
  ): Promise<Orders[]> {
    if (!session || !session.id) {
      throw new BadRequestException(
        'Dining session has expired. Please rescan QR code to continue.',
      );
    }
    return this.orderService.getOrdersForSession(session.id);
  }
}
