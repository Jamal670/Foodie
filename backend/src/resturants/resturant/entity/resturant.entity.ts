import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Branch } from '../../branch/entity/branch.entity';
import { OrderType } from '../../order-type/entity/orderType.entity';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';
import { Table } from 'src/table-module/table/entity/table.entity';

@ObjectType()
@Entity('restaurants')
export class Restaurant {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  restName: string;

  @Field(() => Int)
  @Column({ default: 0 })
  totalBranch: number;

  // ================= RELATIONS =================

  @Field(() => [Branch], { nullable: true })
  @OneToMany(() => Branch, (branch) => branch.restaurant)
  branches: Promise<Branch[]>;

  @Field(() => OrderType, { nullable: true })
  @OneToOne(() => OrderType, (orderType) => orderType.restaurant)
  orderType: Promise<OrderType>;

  @Field(() => [MenuCategory], { nullable: true })
  @OneToMany(() => MenuCategory, (category) => category.restaurant)
  menuCategories: Promise<MenuCategory[]>;

  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems: Promise<MenuItem[]>;

  @Field(() => [Table], { nullable: true })
  @OneToMany(() => Table, (table) => table.restaurant)
  tables: Promise<Table[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
