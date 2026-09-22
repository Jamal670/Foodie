import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Role } from 'src/user/role-module/entity/role.entity';
import { Permission } from 'src/user/permission/entity/permission.entity';

@ObjectType()
@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
export class RolePermission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= ROLE =================
  @Field(() => Int)
  @Column()
  roleId: number;

  @Field(() => Role)
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Promise<Role>;

  // ================= PERMISSION =================
  @Field(() => Int)
  @Column()
  permissionId: number;

  @Field(() => Permission)
  @ManyToOne(
    () => Permission,
    (permission) => permission.rolePermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'permissionId' })
  permission: Promise<Permission>;
}

