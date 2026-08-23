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

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    TableModule,
    TableSectionModule,
    MenuCategoryModule,
    MenuItemsModule,
    ResturantModule,
  ],
  providers: [CustomerResolver, CustomerService],
})
export class CustomerModule {}
