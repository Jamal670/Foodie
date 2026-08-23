import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { User } from 'src/user/users/entity/user.entity';

@ObjectType()
@Entity('user_sessions')
export class UserSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ================= USER FK =================
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  // ================= TOKEN =================
  @Field()
  @Column()
  refreshToken: string;

  @Field()
  @Column({ default: true })
  valid: boolean;

  // ================= DEVICE INFO =================
  @Field({ nullable: true })
  @Column({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ipAddress?: string;

  // ================= EXPIRY =================
  @Field()
  @Column()
  expiresAt: Date;

  // ================= TIMESTAMPS =================
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
