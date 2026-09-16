import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

import { OrderItems } from '../../order-items/entity/OrderItems.entity';
import { ItemVariation } from 'src/menu/menu-items/item-variation/entity/createItemVariation.entity';

@ObjectType()
@Entity('order_items_variations')
@Index('IDX_order_items_variations_order_item_id', ['orderItemId'])
export class OrderItemsVariation {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'item_variation_id', nullable: true })
  itemVariationId?: number | null;

  // ================= SNAPSHOT FIELDS =================

  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  // ================= RELATIONS =================

  @Field(() => OrderItems)
  @ManyToOne(() => OrderItems, (item) => item.variations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: Promise<OrderItems>;

  @Field(() => ItemVariation, { nullable: true })
  @ManyToOne(() => ItemVariation, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'item_variation_id' })
  itemVariation?: Promise<ItemVariation | null>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
