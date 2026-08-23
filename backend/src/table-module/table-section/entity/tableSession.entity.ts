import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Table } from 'src/table-module/table/entity/table.entity';

@ObjectType()
@Entity('table_sessions')
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
  @Column()
  token: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deviceId?: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // ================= RELATIONS =================

  @Field(() => Table)
  @OneToOne(() => Table, (table) => table.session, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tableId' })
  table: Promise<Table>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
