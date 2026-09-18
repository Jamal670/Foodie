import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

import { Restaurant } from '../../resturant/entity/resturant.entity';

@ObjectType('RestaurantOrderType')
@Entity('order_types')
export class OrderType {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================
  @Field(() => Int)
  @Column()
  restaurantId: number;

  @Field(() => Restaurant)
  @OneToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Promise<Restaurant>;

  // ================= FLAGS =================

  @Field()
  @Column({ default: false })
  dineIn: boolean;

  @Field()
  @Column({ default: false })
  delivery: boolean;

  @Field()
  @Column({ default: false })
  takeaway: boolean;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryCharges: number;
}
