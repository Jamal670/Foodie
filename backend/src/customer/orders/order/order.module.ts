import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { Orders } from './entity/orders.entity';
import { OrderItems } from '../order-items/entity/OrderItems.entity';
import { OrderItemsVariation } from '../order-items-variation/entity/orderItemsVariation.entity';
import { OrderItemsCustomization } from '../order-items-customization/entity/orderItemsCustomization.entity';
import { CustCart } from 'src/customer/carts/cart/entity/createCustCart.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { CustomerModule } from '../../customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orders,
      OrderItems,
      OrderItemsVariation,
      OrderItemsCustomization,
      CustCart,
      Branch,
    ]),
    forwardRef(() => CustomerModule),
  ],
  providers: [OrderResolver, OrderService],
  exports: [OrderService, TypeOrmModule],
})
export class OrderModule {}
