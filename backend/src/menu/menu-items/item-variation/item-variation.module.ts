import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemVariationService } from './item-variation.service';
import { ItemVariation } from './entity/createItemVariation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemVariation])],
  providers: [ItemVariationService],
  exports: [ItemVariationService],
})
export class ItemVariationModule {}
