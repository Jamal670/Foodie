import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Table } from 'src/table-module/table/entity/table.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';

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

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
