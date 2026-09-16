import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

import { Orders } from '../../order/entity/orders.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';
import { OrderItemsVariation } from '../../order-items-variation/entity/orderItemsVariation.entity';
import { OrderItemsCustomization } from '../../order-items-customization/entity/orderItemsCustomization.entity';

@ObjectType()
@Entity('order_items')
@Index('IDX_order_items_order_id', ['orderId'])
export class OrderItems {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column({ name: 'order_id' })
  orderId: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'menu_item_id', nullable: true })
  menuItemId?: number | null;

  // ================= SNAPSHOT / DENORMALIZED FIELDS =================

  @Field()
  @Column({ name: 'menu_item_name' })
  menuItemName: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field(() => Float)
  @Column('decimal', { name: 'unit_price', precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => Float)
  @Column('decimal', { name: 'total_price', precision: 10, scale: 2 })
  totalPrice: number;

  // ================= RELATIONS =================

  @Field(() => Orders)
  @ManyToOne(() => Orders, (order) => order.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'order_id' })
  order: Promise<Orders>;

  @Field(() => MenuItem, { nullable: true })
  @ManyToOne(() => MenuItem, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem?: Promise<MenuItem | null>;

  @Field(() => [OrderItemsVariation], { nullable: true })
  @OneToMany(() => OrderItemsVariation, (v) => v.orderItem, {
    cascade: true,
  })
  variations?: Promise<OrderItemsVariation[]>;

  @Field(() => [OrderItemsCustomization], { nullable: true })
  @OneToMany(() => OrderItemsCustomization, (c) => c.orderItem, {
    cascade: true,
  })
  customizations?: Promise<OrderItemsCustomization[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
