import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCustomizationService } from './item-customization.service';
import { ItemCustomization } from './entity/createItemCustomization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCustomization])],
  providers: [ItemCustomizationService],
  exports: [ItemCustomizationService],
})
export class ItemCustomizationModule {}
