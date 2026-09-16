import { ObjectType, Field, Int } from '@nestjs/graphql';
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

import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { Table } from 'src/table-module/table/entity/table.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { CustCartItems } from '../../cart-items/entity/createCustCartItems.entity';

@ObjectType()
@Entity('cust_carts')
@Index('UQ_cust_carts_session_active', ['sessionId'], { unique: true, where: '"isActive" = true' })
export class CustCart {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column()
  branchId: number;

  @Field(() => Int)
  @Column()
  tableId: number;

  @Field(() => Int)
  @Column()
  sessionId: number;

  // ================= CART INFO =================

  @Field()
  @Column({ default: true })
  isActive: boolean;

  // ================= RELATIONS =================

  @Field(() => Branch)
  @ManyToOne(() => Branch, (branch) => branch.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branchId' })
  branch: Promise<Branch>;

  @Field(() => Table)
  @ManyToOne(() => Table, (table) => table.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tableId' })
  table: Promise<Table>;

  @Field(() => TableSession)
  @ManyToOne(() => TableSession, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: Promise<TableSession>;

  @Field(() => [CustCartItems], { nullable: true })
  @OneToMany(() => CustCartItems, (item) => item.cart)
  items: Promise<CustCartItems[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
