import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Customer } from 'src/customer/entity/customer.entity';
import { QrType, TableStatus } from './enums/enums';

@ObjectType()
@Entity('tables')
export class Table {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column()
  restaurantId: number;

  @Field(() => Int)
  @Column()
  branchId: number;

  // ================= TABLE INFO =================

  @Field()
  @Column({ unique: true })
  qrToken: string;

  @Field(() => Int)
  @Column()
  tableNumber: number;

  @Field()
  @Column({
    type: 'enum',
    enum: QrType,
  })
  qrType: QrType;

  @Field()
  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  // ================= RELATIONS =================

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Promise<Restaurant>;

  @Field(() => Branch)
  @ManyToOne(() => Branch, (branch) => branch.tables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branchId' })
  branch: Promise<Branch>;

  @Field(() => TableSession, { nullable: true })
  @OneToOne(() => TableSession, (session) => session.table)
  session: Promise<TableSession>;

  @Field(() => [Customer], { nullable: true })
  @OneToMany(() => Customer, (customer) => customer.table)
  customers: Promise<Customer[]>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
