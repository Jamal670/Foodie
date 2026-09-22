import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { Field, ObjectType, Int } from '@nestjs/graphql';

import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { User } from 'src/user/users/entity/user.entity';
import { RolePermission } from 'src/user/role-permission/entity/rolePermission.entity';
import { RoleStatus } from './enums/role.enums';

@ObjectType()
@Entity('roles')
@Index('UQ_roles_restaurant_role_name', ['restaurantId', 'role_name'], {
  unique: true,
})
export class Role {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  role_id: number;

  // ================= RESTAURANT =================
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

  // ================= STATUS =================
  @Field()
  @Column({
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;

  // ================= USERS =================
  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.role)
  users?: Promise<User[]>;

  // ================= ROLE PERMISSIONS =================
  @Field(() => [RolePermission], { nullable: true })
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions?: Promise<RolePermission[]>;

  // ================= TIMESTAMP =================
  @Field()
  @CreateDateColumn()
  created_at: Date;
}