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
import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Table } from 'src/table-module/table/entity/table.entity';
import { Customer } from 'src/customer/entity/customer.entity';

@ObjectType()
@Entity('table_sessions')
@Index('IDX_table_sessions_table_id', ['tableId'])
export class TableSession {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column()
  tableId: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  restaurantId?: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  branchId?: number;

  // ================= SESSION INFO =================

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // ================= RELATIONS =================

  @Field(() => Table)
  @ManyToOne(() => Table, (table) => table.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tableId' })
  table: Promise<Table>;

  @Field(() => [Customer], { nullable: true })
  @OneToMany(() => Customer, (customer) => customer.session)
  customers: Promise<Customer[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}