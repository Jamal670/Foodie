import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategory } from './Entity/createMenuCategory.entity';
import { MenuCategoryResolver } from './menu-category.resolver';

import { UploadModule } from 'src/common/upload/upload.module';
import { MenuItemsModule } from '../menu-items/menu-items/menu-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuCategory]),
    UploadModule,
    MenuItemsModule,
  ],
  providers: [MenuCategoryService, MenuCategoryResolver],
  exports: [MenuCategoryService],
})
export class MenuCategoryModule {}
