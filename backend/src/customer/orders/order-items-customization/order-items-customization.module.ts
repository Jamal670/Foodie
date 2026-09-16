import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsCustomizationService } from './order-items-customization.service';
import { OrderItemsCustomization } from './entity/orderItemsCustomization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemsCustomization])],
  providers: [ OrderItemsCustomizationService],
  exports: [OrderItemsCustomizationService, TypeOrmModule],
})
export class OrderItemsCustomizationModule {}
