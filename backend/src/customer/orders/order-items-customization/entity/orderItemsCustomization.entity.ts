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
import { ItemCustomization } from 'src/menu/menu-items/item-customization/entity/createItemCustomization.entity';

@ObjectType()
@Entity('order_items_customizations')
@Index('IDX_order_items_customizations_order_item_id', ['orderItemId'])
export class OrderItemsCustomization {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'item_customization_id', nullable: true })
  itemCustomizationId?: number | null;

  // ================= SNAPSHOT FIELDS =================

  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  // ================= RELATIONS =================

  @Field(() => OrderItems)
  @ManyToOne(() => OrderItems, (item) => item.customizations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: Promise<OrderItems>;

  @Field(() => ItemCustomization, { nullable: true })
  @ManyToOne(() => ItemCustomization, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'item_customization_id' })
  itemCustomization?: Promise<ItemCustomization | null>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
