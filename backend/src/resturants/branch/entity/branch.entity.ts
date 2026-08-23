import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

import { Restaurant } from '../../resturant/entity/resturant.entity';
import { ContactPersonDesignation } from './enums/branch.enums';
import { Table } from 'src/table-module/table/entity/table.entity';
import { Customer } from 'src/customer/entity/customer.entity';

@ObjectType()
@Entity('branches')
export class Branch {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================
  @Field(() => Int)
  @Column()
  restaurantId: number;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.branches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Promise<Restaurant>;

  @Field(() => [Table], { nullable: true })
  @OneToMany(() => Table, (table) => table.branch)
  tables: Promise<Table[]>;

  @Field(() => [Customer], { nullable: true })
  @OneToMany(() => Customer, (customer) => customer.branch)
  customers: Promise<Customer[]>;

  // ================= BRANCH INFO =================

  @Field(() => Int)
  @Column({ default: 1 })
  branchNo: number;

  @Field()
  @Column()
  country: string;

  @Field()
  @Column()
  city: string;

  @Field()
  @Column()
  contactPersonName: string;

  @Field()
  @Column({
    type: 'enum',
    enum: ContactPersonDesignation,
    default: ContactPersonDesignation.ADMIN,
  })
  contactPersonDesignation: ContactPersonDesignation;

  @Field()
  @Column()
  contactPersonPhone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contactPersonEmail: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  servingTime: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxCash: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxCard: number;
}
