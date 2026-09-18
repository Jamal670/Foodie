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
import { BranchModule } from 'src/resturants/branch/branch.module';
import { CartModule } from 'src/customer/carts/cart/cart.module';
import { MenuItemsModule } from 'src/menu/menu-items/menu-items/menu-items.module';
import { ItemVariationModule } from 'src/menu/menu-items/item-variation/item-variation.module';
import { ItemCustomizationModule } from 'src/menu/menu-items/item-customization/item-customization.module';
import { OrderItemsModule } from '../order-items/order-items.module';
import { OrderItemsVariationModule } from '../order-items-variation/order-items-variation.module';
import { OrderItemsCustomizationModule } from '../order-items-customization/order-items-customization.module';
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
    BranchModule,
    CartModule,
    MenuItemsModule,
    ItemVariationModule,
    ItemCustomizationModule,
    OrderItemsModule,
    OrderItemsVariationModule,
    OrderItemsCustomizationModule,
    forwardRef(() => CustomerModule),
  ],
  providers: [OrderResolver, OrderService],
  exports: [OrderService, TypeOrmModule],
})
export class OrderModule { }
