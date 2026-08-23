import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { TableService } from './table.service';
import { Table } from './entity/table.entity';
import { CreateTableDto } from './DTO/CreateTable.dto';
import { SuccessResponse } from 'src/common/DTOResponse/success-response.dto';

import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { DeleteTableQrDto } from './DTO/deleteTableQr.dto';

@Resolver(() => Table)
export class TableResolver {
  constructor(private readonly tableService: TableService) {}

  //================== Get all the QR code ====================
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [Table])
  async getAllTables(@CurrentUser() user: JwtPayload) {
    return this.tableService.getAllTables(user.restaurantId, user.branchId);
  }

  //================== Create Tables QR Code ==================
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async createTables(
    @Args('dto') dto: CreateTableDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tableService.createTables(
      dto,
      user.restaurantId,
      user.branchId,
    );
  }

  //================== Create Takeaway QR Code ==================
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async createTakeawayQr(@CurrentUser() user: JwtPayload) {
    return this.tableService.createTakeawayQr(user.restaurantId, user.branchId);
  }

  //================== Add one more table ==================
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async createOneMoreTable(@CurrentUser() user: JwtPayload) {
    return this.tableService.createOneMoreTable(
      user.restaurantId,
      user.branchId,
    );
  }

  //================== Delete Table QR Code By ID ==================
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => SuccessResponse)
  async deleteTableQr(
    @Args('dto') dto: DeleteTableQrDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tableService.deleteTableQr(
      dto.id,
      user.restaurantId,
      user.branchId,
    );
  }
}
