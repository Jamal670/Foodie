import { Module } from '@nestjs/common';
import { WaiterAndPosoperatorResolver } from './waiter-and-posoperator.resolver';
import { WaiterAndPosoperatorService } from './waiter-and-posoperator.service';
import { RoleModuleModule } from 'src/user/role-module/role-module.module';
import { OrderModule } from 'src/customer/orders/order/order.module';
import { CustomerModule } from 'src/customer/customer.module';
import { OrderItemsModule } from 'src/customer/orders/order-items/order-items.module';
import { OrderItemsVariationModule } from 'src/customer/orders/order-items-variation/order-items-variation.module';
import { OrderItemsCustomizationModule } from 'src/customer/orders/order-items-customization/order-items-customization.module';
import { MenuItemsModule } from 'src/menu/menu-items/menu-items/menu-items.module';
import { MenuCategoryModule } from 'src/menu/menu-category/menu-category.module';
import { TableModule } from 'src/table-module/table/table.module';

@Module({
  imports: [
    RoleModuleModule,
    OrderModule,
    CustomerModule,
    OrderItemsModule,
    OrderItemsVariationModule,
    OrderItemsCustomizationModule,
    MenuItemsModule,
    MenuCategoryModule,
    TableModule,
  ],
  providers: [WaiterAndPosoperatorResolver, WaiterAndPosoperatorService],
})
export class WaiterAndPosoperatorModule {}
