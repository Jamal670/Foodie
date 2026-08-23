import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ResturantService } from './resturant.service';
import { CreateResturantDto } from './DTO/resturnat.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('resturant')
@UseGuards(JwtAuthGuard)
export class RestaurantController {
  constructor(private readonly restaurantService: ResturantService) {}

  @Post('create-resturant')
  async createRestaurantInfo(@Body() dto: CreateResturantDto, @Req() req) {
    return this.restaurantService.createRestaurantInfo(dto, req.user);
  }
}
