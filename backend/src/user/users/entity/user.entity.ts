import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { UserStatus } from './enums/user.enum';
import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { Role } from 'src/user/role-module/entity/role.entity';
import { UserSession } from 'src/user/user-session/entity/userSession.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  user_id: number;

  // ================= RESTAURANT =================
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  restaurantId?: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Promise<Restaurant>;

  // ================= BRANCH =================
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  branchId?: number;

  @Field(() => Branch, { nullable: true })
  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch?: Promise<Branch>;

  // ================= ROLE =================
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  roleId?: number;

  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'roleId' })
  role?: Promise<Role>;

  //================== USER SESSIONS ==================
  @Field(() => [UserSession], { nullable: true })
  @OneToMany(() => UserSession, (session) => session.user)
  sessions?: Promise<UserSession[]>;

  // ================= BASIC INFO =================
  @Field({ nullable: true })
  @Column({ nullable: true })
  full_name?: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Field()
  @Column({ default: 'email/password' })
  login_provider: string;

  // ================= STATUS =================
  @Field()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  isVerified: UserStatus;

  @Field(() => Boolean)
  @Column({ default: false })
  OnBoardingStatus: boolean;
}
