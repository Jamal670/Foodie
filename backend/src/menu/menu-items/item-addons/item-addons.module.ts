import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAddonsService } from './item-addons.service';
import { ItemAddon } from './entity/createItemAddons.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemAddon])],
  providers: [ItemAddonsService],
  exports: [ItemAddonsService],
})
export class ItemAddonsModule {}
