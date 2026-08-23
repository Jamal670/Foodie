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
@Entity('item_addons')
export class ItemAddon {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  itemId: number;

  @Field(() => Int)
  @Column()
  addonId: number;

  @Field(() => MenuItem)
  @ManyToOne(() => MenuItem, (menuItem) => menuItem.addons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'itemId' })
  menuItem: Promise<MenuItem>;

  @Field(() => MenuItem)
  @ManyToOne(() => MenuItem, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'addonId' })
  addonItem: Promise<MenuItem>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
