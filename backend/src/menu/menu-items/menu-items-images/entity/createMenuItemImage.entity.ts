import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

@ObjectType()
@Entity('menu_item_images')
export class MenuItemImage {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ name: 'item_id' })
  itemId: number;

  @Field()
  @Column({ name: 'image_url' })
  imageUrl: string;

  @Field(() => Boolean)
  @Column({ name: 'is_thumbnail', default: false })
  isThumbnail: boolean;

  @Field(() => MenuItem)
  @ManyToOne(() => MenuItem, (menuItem) => menuItem.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'item_id' })
  menuItem: Promise<MenuItem>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
