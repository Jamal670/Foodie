import { Module } from '@nestjs/common';
import { CustomerResolver } from './customer.resolver';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';

import { TableModule } from 'src/table-module/table/table.module';
import { TableSectionModule } from 'src/table-module/table-section/table-section.module';
import { MenuCategoryModule } from 'src/menu/menu-category/menu-category.module';
import { MenuItemsModule } from 'src/menu/menu-items/menu-items/menu-items.module';
import { ResturantModule } from 'src/resturants/resturant/resturant.module';
import { BranchModule } from 'src/resturants/branch/branch.module';
import { CartModule } from './carts/cart/cart.module';
import { CartItemsModule } from './carts/cart-items/cart-items.module';
import { OrderModule } from './orders/order/order.module';
import { OrderItemsModule } from './orders/order-items/order-items.module';
import { OrderItemsVariationModule } from './orders/order-items-variation/order-items-variation.module';
import { OrderItemsCustomizationModule } from './orders/order-items-customization/order-items-customization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    TableModule,
    TableSectionModule,
    MenuCategoryModule,
    MenuItemsModule,
    ResturantModule,
    BranchModule,
    CartModule,
    CartItemsModule,
    OrderModule,
    OrderItemsModule,
    OrderItemsVariationModule,
    OrderItemsCustomizationModule,
  ],
  providers: [CustomerResolver, CustomerService],
  exports: [CustomerService],
})
export class CustomerModule { }

