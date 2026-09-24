import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { WaiterAndPosoperatorService } from './waiter-and-posoperator.service';
import { VerifyPermissionDto } from './dto/verifyPermisison.dto';
import { GetMenuItemDetailByIdDto } from './dto/menuItemDetailsById.dto';
import { CreatePosOrderDto } from './dto/createOrder.dto';
import { WaiterPOSMenuResponse } from './Response/waiter-pos-menu-response.dto';
import { ProductDetailsResponse } from 'src/customer/dto/product-details.dto';
import { Orders } from 'src/customer/orders/order/entity/orders.entity';
import { OrderItems } from 'src/customer/orders/order-items/entity/OrderItems.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';
import { Table } from 'src/table-module/table/entity/table.entity';
import {
  WaiterJwtAuthGuard,
  WaiterJwtPayload,
} from 'src/auth/guards/waiter-jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Resolver(() => Orders)
export class WaiterAndPosoperatorResolver {
  constructor(
    private readonly waiterAndPosoperatorService: WaiterAndPosoperatorService,
  ) { }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Waiter ORDERS =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  //-------------------------------- Waiter View ORDERS ----------------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => [Orders])
  async waiterViewOrders(
    @Args('input') input: VerifyPermissionDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<Orders[]> {
    return this.waiterAndPosoperatorService.waiterViewOrders(input, user);
  }

  //------------------------ Waiter View ORDERS ITEM DETAILS -----------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => [OrderItems])
  async showMenuItemsDetails(
    @Args('input') input: VerifyPermissionDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<OrderItems[]> {
    return this.waiterAndPosoperatorService.showMenuItemsDetails(input, user);
  }

  //----------------------------- Waiter Update ORDER STATUS -----------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => Boolean)
  async updateOrderStatus(
    @Args('input') input: VerifyPermissionDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<boolean> {
    return this.waiterAndPosoperatorService.updateOrderStatus(input, user);
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Waiter POS =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  //--------------------- Waiter Get POS CATEGORY&MENUITEMS --------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => WaiterPOSMenuResponse)
  async GetWaiterPOSMenuItems(
    @Args('input') input: VerifyPermissionDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<WaiterPOSMenuResponse> {
    return this.waiterAndPosoperatorService.GetWaiterPOSMenuItems(input, user);
  }

  //-------------------- Waiter POS <MENU ITEM Detail By Id> -------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => ProductDetailsResponse)
  async getMenuItemDetailById(
    @Args('permissionInput') permissionInput: VerifyPermissionDto,
    @Args('input') input: GetMenuItemDetailByIdDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<ProductDetailsResponse> {
    return this.waiterAndPosoperatorService.getMenuItemDetailById(
      permissionInput,
      input,
      user,
    );
  }

  //-------------------- Waiter POS <Get available table numbers> -------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => [Table])
  async AvailableTablesNumbers(
    @Args('input') input: VerifyPermissionDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<Table[]> {
    return this.waiterAndPosoperatorService.AvailableTablesNumbers(input, user);
  }


  //-------------------- Waiter POS <CREATE ORDER> -------------------
  @UseGuards(WaiterJwtAuthGuard)
  @Mutation(() => Boolean)
  async createOrderByPosOperator(
    @Args('permissionInput') permissionInput: VerifyPermissionDto,
    @Args('input') input: CreatePosOrderDto,
    @CurrentUser() user: WaiterJwtPayload,
  ): Promise<boolean> {
    return this.waiterAndPosoperatorService.createOrderByPosOperator(
      permissionInput,
      input,
      user,
    );
  }
}
