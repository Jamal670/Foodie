import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { MenuItem } from '../../menu-items/entity/createMenuItems.entity';

@ObjectType()
@Entity('item_variations')
export class ItemVariation {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ name: 'item_id' })
  itemId: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Int)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => MenuItem)
  @ManyToOne(() => MenuItem, (menuItem) => menuItem.variations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'item_id' })
  menuItem: Promise<MenuItem>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
