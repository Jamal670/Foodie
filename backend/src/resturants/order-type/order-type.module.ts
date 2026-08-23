import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderTypeService } from './order-type.service';
import { OrderType } from './entity/orderType.entity';
import { OrderTypeController } from './order-type.controller';
//modules
import { ResturantModule } from '../resturant/resturant.module';
import { UserModule } from 'src/user/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderType]), ResturantModule, UserModule],
  providers: [OrderTypeService],
  exports: [OrderTypeService],
  controllers: [OrderTypeController],
})
export class OrderTypeModule {}
