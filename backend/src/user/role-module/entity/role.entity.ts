import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';

@ObjectType()
@Entity('roles')
export class Role {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  role_id: number;

  // ================= RESTAURANT FK =================
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  restaurantId?: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Promise<Restaurant>;

  // ================= ROLE INFO =================
  @Field()
  @Column()
  role_name: string;

  @Field()
  @Column({ default: false })
  is_system_role: boolean;

  // ================= TIMESTAMP =================
  @Field()
  @CreateDateColumn()
  created_at: Date;
}
