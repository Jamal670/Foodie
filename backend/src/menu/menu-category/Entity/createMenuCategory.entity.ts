import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

@ObjectType()
@Entity('menu_categories')
export class MenuCategory {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= RESTAURANT RELATION =================
  @Field(() => Int)
  @Column()
  restaurantId: number;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Promise<Restaurant>;

  // ================= SELF RELATION (PARENT CATEGORY) =================
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentCategoryId?: number;

  @Field(() => MenuCategory, { nullable: true })
  @ManyToOne(() => MenuCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentCategoryId' })
  parent?: Promise<MenuCategory>;

  // ================= CHILDREN =================
  @Field(() => [MenuCategory], { nullable: true })
  @OneToMany(() => MenuCategory, (category) => category.parent)
  children?: Promise<MenuCategory[]>;

  // ================= MENU ITEMS =================
  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.category)
  menuItems?: Promise<MenuItem[]>;

  // ================= BASIC FIELDS =================
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column({ default: 1 })
  level: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageUrl?: string;
}
