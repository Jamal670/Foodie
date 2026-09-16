import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { Table } from 'src/table-module/table/entity/table.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Customer } from 'src/customer/entity/customer.entity';
import { OrderItems } from '../../order-items/entity/OrderItems.entity';
import { OrderType, OrderStatus } from '../enums/orders.enum';

@ObjectType()
@Entity('orders')
@Index('IDX_orders_branch_id', ['branchId'])
@Index('IDX_orders_table_session_id', ['tableSessionId'])
@Index('IDX_orders_customer_id', ['customerId'])
export class Orders {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  // ================= FK =================

  @Field(() => Int)
  @Column({ name: 'branch_id' })
  branchId: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'table_id', nullable: true })
  tableId?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'table_session_id', nullable: true })
  tableSessionId?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'customer_id', nullable: true })
  customerId?: number | null;

  // ================= ORDER INFO =================

  @Field(() => OrderType)
  @Column({
    name: 'order_type',
    type: 'enum',
    enum: OrderType,
    default: OrderType.DINE_IN,
  })
  orderType: OrderType;

  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  // ================= RELATIONS =================

  @Field(() => Branch)
  @ManyToOne(() => Branch, (branch) => branch.orders, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Promise<Branch>;

  @Field(() => Table, { nullable: true })
  @ManyToOne(() => Table, (table) => table.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'table_id' })
  table?: Promise<Table | null>;

  @Field(() => TableSession, { nullable: true })
  @ManyToOne(() => TableSession, (session) => session.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'table_session_id' })
  tableSession?: Promise<TableSession | null>;

  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer?: Promise<Customer | null>;

  @Field(() => [OrderItems])
  @OneToMany(() => OrderItems, (item) => item.order, {
    cascade: true,
  })
  items: Promise<OrderItems[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
