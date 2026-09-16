import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsService } from './cart-items.service';
import { CustCartItems } from './entity/createCustCartItems.entity';
import { MenuItemsModule } from 'src/menu/menu-items/menu-items/menu-items.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustCartItems]), MenuItemsModule],
  providers: [CartItemsService],
  exports: [CartItemsService, TypeOrmModule],
})
export class CartItemsModule {}
