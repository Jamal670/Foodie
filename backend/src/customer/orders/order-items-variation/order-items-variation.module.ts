import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsVariationService } from './order-items-variation.service';
import { OrderItemsVariation } from './entity/orderItemsVariation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemsVariation])],
  providers: [ OrderItemsVariationService],
  exports: [OrderItemsVariationService, TypeOrmModule],
})
export class OrderItemsVariationModule {}
