import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { MenuCategory } from './Entity/createMenuCategory.entity';
import { MenuCategoryService } from './menu-category.service';
import { CreateMenuCategoryDto } from './DTO/createMenuCategory.dto';

import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UpdateMenuCategoryDto } from './DTO/updateMenuCategory.dto';
import { DeleteMenuCategoryDto } from './DTO/DeleteMenuCategory.dto';
import { DeleteResponses } from './DTO/ResponseDTO/DeleteResponses.dto';

@Resolver(() => MenuCategory)
export class MenuCategoryResolver {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  //-------------------------- Get Menu Categories Tree --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [MenuCategory])
  async getMenuCategoriesTree(@CurrentUser() user: JwtPayload) {
    return this.menuCategoryService.getMenuCategoriesTree(user.restaurantId);
  }

  //-------------------------- Create Menu Category --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => MenuCategory)
  async createMenuCategory(
    @Args('dto') dto: CreateMenuCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.menuCategoryService.createMenuCategory(
      dto,
      user.restaurantId,
    );
  }

  //-------------------------- Get Level 1 and 2 Categories --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [MenuCategory])
  async getLevel1And2Categories(@CurrentUser() user: JwtPayload) {
    return await this.menuCategoryService.getLevel1And2Categories(
      user.restaurantId,
    );
  }

  //-------------------------- Update Menu Category --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => MenuCategory)
  async updateMenuCategory(
    @Args('dto') dto: UpdateMenuCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.menuCategoryService.updateMenuCategory(dto, user.restaurantId);
  }

  //-------------------------- Delete Menu Category --------------------------
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => DeleteResponses)
  async deleteMenuCategory(
    @Args('dto') dto: DeleteMenuCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.menuCategoryService.deleteMenuCategory(
      dto.id,
      user.restaurantId,
      dto.force,
    );
  }
}
