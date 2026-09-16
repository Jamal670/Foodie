import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { CartItemsModule } from '../cart-items/cart-items.module';
import { CustCart } from './entity/createCustCart.entity';
import { CustomerModule } from '../../customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustCart]),
    CartItemsModule,
    forwardRef(() => CustomerModule),
  ],
  providers: [CartResolver, CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
