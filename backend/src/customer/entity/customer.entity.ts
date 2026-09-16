import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Table } from 'src/table-module/table/entity/table.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Orders } from 'src/customer/orders/order/entity/orders.entity';

@ObjectType()
@Entity('customers')
export class Customer {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column()
  tableId: number;

  @Field(() => Int)
  @Column()
  branchId: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  sessionId?: number;

  // ================= CUSTOMER INFO =================

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phoneNo?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  token?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deviceId?: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  // ================= RELATIONS =================

  @Field(() => Table)
  @ManyToOne(() => Table, (table) => table.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tableId' })
  table: Promise<Table>;

  @Field(() => Branch)
  @ManyToOne(() => Branch, (branch) => branch.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branchId' })
  branch: Promise<Branch>;

  @Field(() => TableSession, { nullable: true })
  @ManyToOne(() => TableSession, (session) => session.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: Promise<TableSession>;

  @Field(() => [Orders], { nullable: true })
  @OneToMany(() => Orders, (order) => order.customer)
  orders?: Promise<Orders[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

