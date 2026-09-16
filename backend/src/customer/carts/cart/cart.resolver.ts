import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';

import { CartService } from './cart.service';
import { CustCart } from './entity/createCustCart.entity';
import { AddCartItemDto } from './dto/createCustCart.dto';
import { DeleteCustCartItemDto } from './dto/deleteCustCart.dto';

import { CustomerJwtAuthGuard } from 'src/auth/guards/customer-jwt-auth.guard';
import { CurrentSession } from 'src/auth/decorators/current-customer.decorator';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';

@Resolver(() => CustCart)
export class CartResolver {
  constructor(private readonly cartService: CartService) { }

  //================================> Add To Cart ================================
  @UseGuards(CustomerJwtAuthGuard)
  @Mutation(() => CustCart)
  async addToCart(
    @Args('dto') dto: AddCartItemDto,
    @CurrentSession() session: TableSession,
  ): Promise<CustCart> {
    if (!session || !session.id || !session.restaurantId) {
      throw new BadRequestException(
        'Dining session has expired. Please rescan the QR code to continue.',
      );
    }
    return this.cartService.addCartItem(dto, session);
  }

  //================================> Get Cart details ================================  
  @UseGuards(CustomerJwtAuthGuard)
  @Query(() => CustCart, { nullable: true })
  async getMyCart(
    @CurrentSession() session: TableSession,
  ): Promise<CustCart | null> {
    if (!session || !session.id) {
      throw new BadRequestException(
        'Dining session has expired. Please rescan the QR code to continue.',
      );
    }
    return this.cartService.getCartBySessionId(session.id);
  }

  //==============================> delete cart item ================================
  @UseGuards(CustomerJwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteCartItem(
    @Args('dto') dto: DeleteCustCartItemDto,
    @CurrentSession() session: TableSession,
  ): Promise<boolean> {
    return this.cartService.deleteCartItem(dto, session);
  }
}
