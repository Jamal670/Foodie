import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { RolePermission } from 'src/user/role-permission/entity/rolePermission.entity';

@ObjectType()
@Entity('permission')
export class Permission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= PERMISSION KEY =================
  @Field()
  @Column({ unique: true })
  permissionKey: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  permissionCode: string;

  // ================= GROUP =================
  @Field()
  @Column()
  groupname: string;

  // ================= ROLE PERMISSIONS =================
  @Field(() => [RolePermission], { nullable: true })
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions?: Promise<RolePermission[]>;
}

