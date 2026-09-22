import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { RolePermission } from './entity/rolePermission.entity';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async createRolePermissions(
    roleId: number,
    permissionIds: number[],
    manager?: EntityManager,
  ): Promise<RolePermission[]> {
    const repo = manager
      ? manager.getRepository(RolePermission)
      : this.rolePermissionRepo;

    const rolePermissions = permissionIds.map((permissionId) =>
      repo.create({
        roleId,
        permissionId,
      }),
    );

    return await repo.save(rolePermissions);
  }

  async findPermissionsForRole(
    roleId: number,
    manager?: EntityManager,
  ): Promise<RolePermission[]> {
    const repo = manager
      ? manager.getRepository(RolePermission)
      : this.rolePermissionRepo;

    return await repo.find({
      where: { roleId },
      relations: ['permission'],
    });
  }
}

