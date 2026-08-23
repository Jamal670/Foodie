import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';

import { OrderTypeService } from './order-type.service';
import { CreateOrderTypeDto } from './DTO/menuType.dto';
//Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('order-type')
@UseGuards(JwtAuthGuard)
export class OrderTypeController {
  constructor(private readonly orderTypeService: OrderTypeService) {}

  @Post('create-order-type')
  async createOrderType(
    @Body() createOrderTypeDto: CreateOrderTypeDto,
    @Req() req: any,
  ) {
    const user = req.user as JwtPayload;
    return this.orderTypeService.createOrderType(user.sub, createOrderTypeDto);
  }
}
