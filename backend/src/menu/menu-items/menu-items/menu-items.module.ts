import { Module } from '@nestjs/common';
import { MenuItemsResolver } from './menu-items.resolver';
import { MenuItemsService } from './menu-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entity/createMenuItems.entity';

import { MenuItemsImagesModule } from '../menu-items-images/menu-items-images.module';
import { ItemAddonsModule } from '../item-addons/item-addons.module';
import { ItemVariationModule } from '../item-variation/item-variation.module';
import { ItemCustomizationModule } from '../item-customization/item-customization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem]),
    MenuItemsImagesModule,
    ItemAddonsModule,
    ItemVariationModule,
    ItemCustomizationModule,
  ],
  providers: [MenuItemsResolver, MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
