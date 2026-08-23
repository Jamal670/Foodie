import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantController } from './resturant.controller';
import { ResturantService } from './resturant.service';
import { Restaurant } from './entity/resturant.entity';
//modules
import { UserModule } from 'src/user/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant]), UserModule],
  controllers: [RestaurantController],
  providers: [ResturantService],
  exports: [ResturantService],
})
export class ResturantModule {}
