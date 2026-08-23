import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';
import { MenuItemImage } from 'src/menu/menu-items/menu-items-images/entity/createMenuItemImage.entity';
import { ItemVariation } from 'src/menu/menu-items/item-variation/entity/createItemVariation.entity';
import { ItemCustomization } from 'src/menu/menu-items/item-customization/entity/createItemCustomization.entity';
import { ItemAddon } from 'src/menu/menu-items/item-addons/entity/createItemAddons.entity';

@ObjectType()
@Entity('menu_items')
export class MenuItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ name: 'restaurant_id' })
  restaurantId: number;

  @Field(() => Int)
  @Column({ name: 'category_id' })
  categoryId: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Int)
  @Column('decimal', { name: 'base_price', precision: 10, scale: 2 })
  basePrice: number;

  @Field(() => Int, { nullable: true })
  @Column('decimal', {
    name: 'discounted_price',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountedPrice?: number;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Promise<Restaurant>;

  @Field(() => MenuCategory)
  @ManyToOne(() => MenuCategory, (category) => category.menuItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Promise<MenuCategory>;

  @Field(() => [MenuItemImage])
  @OneToMany(() => MenuItemImage, (image) => image.menuItem)
  images: Promise<MenuItemImage[]>;

  @Field(() => [ItemVariation])
  @OneToMany(() => ItemVariation, (variation) => variation.menuItem)
  variations: Promise<ItemVariation[]>;

  @Field(() => [ItemCustomization])
  @OneToMany(() => ItemCustomization, (customization) => customization.menuItem)
  customizations: Promise<ItemCustomization[]>;

  @Field(() => [ItemAddon])
  @OneToMany(() => ItemAddon, (addon) => addon.menuItem)
  addons: Promise<ItemAddon[]>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
