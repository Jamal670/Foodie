import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemsImagesService } from './menu-items-images.service';
import { MenuItemImage } from './entity/createMenuItemImage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemImage])],
  providers: [MenuItemsImagesService],
  exports: [MenuItemsImagesService],
})
export class MenuItemsImagesModule {}
