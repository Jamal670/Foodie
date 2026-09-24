import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { Role } from './entity/role.entity';
import { RoleStatus } from './entity/enums/role.enums';
import { RolePermissionService } from 'src/user/role-permission/role-permission.service';

@Injectable()
export class RoleModuleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async validateRoleAndPermissions(roleId?: number): Promise<{
    status: boolean;
    role: Role | null;
    permission: any;
  }> {
    if (!roleId) {
      return {
        status: false,
        role: null,
        permission: {},
      };
    }

    const role = await this.roleRepo.findOne({
      where: { role_id: roleId },
    });

    if (!role) {
      return {
        status: false,
        role: null,
        permission: {},
      };
    }

    const isActive = role.status === RoleStatus.ACTIVE;

    if (!isActive) {
      return {
        status: false,
        role,
        permission: {},
      };
    }

    const permissions =
      await this.rolePermissionService.findPermissionsForRole(roleId);

    return {
      status: true,
      role,
      permission: permissions,
    };
  }

  async verifyPermission(
    roleId: number,
    restaurantId: number,
    permissionKey: string,
    permissionCode: string,
  ): Promise<boolean> {
    if (!roleId || !restaurantId || !permissionKey || !permissionCode) {
      return false;
    }

    const role = await this.roleRepo.findOne({
      where: {
        role_id: roleId,
        restaurantId: restaurantId,
      },
    });

    if (!role) {
      return false;
    }

    if (role.status === RoleStatus.INACTIVE) {
      throw new UnauthorizedException('Your Account has temporarily Blocked');
    }

    if (role.status !== RoleStatus.ACTIVE) {
      return false;
    }

    const rolePermissions =
      await this.rolePermissionService.findPermissionsForRole(roleId);

    if (!rolePermissions || rolePermissions.length === 0) {
      return false;
    }

    for (const rp of rolePermissions) {
      const perm = await rp.permission;
      if (
        perm &&
        perm.permissionKey === permissionKey &&
        perm.permissionCode === permissionCode
      ) {
        return true;
      }
    }

    return false;
  }

  async CreateNewUserRole() {
    const role = this.roleRepo.create({
      role_name: 'admin',
      is_system_role: true,
    });
    return this.roleRepo.save(role);
  }

  async createRole(
    data: {
      role_name: string;
      restaurantId: number;
      status?: RoleStatus;
      is_system_role?: boolean;
    },
    manager?: EntityManager,
  ): Promise<Role> {
    const repo = manager ? manager.getRepository(Role) : this.roleRepo;

    const normalizedName = data.role_name.trim().toLowerCase();

    // Check case-insensitive duplicate role name within the same restaurant
    const existingRole = await repo
      .createQueryBuilder('role')
      .where('role.restaurantId = :restaurantId', {
        restaurantId: data.restaurantId,
      })
      .andWhere('LOWER(role.role_name) = :roleName', {
        roleName: normalizedName,
      })
      .getOne();

    if (existingRole) {
      throw new ConflictException(
        'A role with this name already exists in your restaurant',
      );
    }

    const systemRoles = ['manager', 'pos operator', 'waiter'];
    const isSystemRole =
      data.is_system_role !== undefined
        ? data.is_system_role
        : systemRoles.includes(normalizedName);

    const role = repo.create({
      role_name: data.role_name,
      restaurantId: data.restaurantId,
      status: data.status || RoleStatus.ACTIVE,
      is_system_role: isSystemRole,
    });

    return await repo.save(role);
  }
}

