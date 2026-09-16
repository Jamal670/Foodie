import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsService } from './order-items.service';
import { OrderItems } from './entity/OrderItems.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItems])],
  providers: [OrderItemsService],
  exports: [OrderItemsService, TypeOrmModule],
})
export class OrderItemsModule {}
