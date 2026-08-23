import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { MenuItemsService } from './menu-items.service';
import { MenuItem } from './entity/createMenuItems.entity';
import { CreateMenuItemDto } from './DTO/createMenuItem.dto';

import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { GetMenuItemDto } from './DTO/getMenuItem.dto';
import { UpdateMenuItemDto } from './DTO/UpdateMenuItem.dto';
import { DeleteMenuItemDto } from './DTO/DeleteMenuItem.dto';
import { DeleteMenuItemListDto } from './DTO/deleteMenuItemList.dto';
import { DeleteResponse } from 'src/common/DTOResponse/DeleteResponse.dto';

@Resolver(() => MenuItem)
export class MenuItemsResolver {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  //-------------------------- create Menu Item --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => MenuItem)
  async createMenuItem(
    @Args('dto') dto: CreateMenuItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.menuItemsService.createMenuItem(dto, user.restaurantId);
  }

  //-------------------------- Get Menu Items --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [MenuItem])
  async getMenuItems(@CurrentUser() user: JwtPayload) {
    return this.menuItemsService.getMenuItems(user.restaurantId);
  }

  //-------------------------- Get Menu Item By ID ---------------
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => MenuItem)
  async getMenuItem(
    @Args('dto') dto: GetMenuItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.menuItemsService.getMenuItem(dto.itemId, user.restaurantId);
  }

  //-------------------------- Update Menu Item By ID ---------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => MenuItem)
  async updateMenuItem(
    @Args('dto') dto: UpdateMenuItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.menuItemsService.updateMenuItem(dto, user.restaurantId);
  }

  //-------------------------- Delete Menu Item By ID ---------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => DeleteResponse)
  async deleteMenuItem(
    @Args('dto') dto: DeleteMenuItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.menuItemsService.deleteMenuItem(dto, user.restaurantId);
  }

  //-------------------------- Bulk Delete Menu Items ----------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => DeleteResponse)
  async deleteMenuItems(
    @Args('dto') dto: DeleteMenuItemListDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.menuItemsService.deleteMenuItems(dto, user.restaurantId);
  }
}
