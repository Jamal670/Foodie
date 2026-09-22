import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';

import { Permission } from './entity/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async findByIds(
    ids: number[],
    manager?: EntityManager,
  ): Promise<Permission[]> {
    const repo = manager
      ? manager.getRepository(Permission)
      : this.permissionRepo;

    if (!ids || ids.length === 0) return [];
    return await repo.find({
      where: { id: In(ids) },
    });
  }

  async findByKey(
    key: string,
    manager?: EntityManager,
  ): Promise<Permission | null> {
    const repo = manager
      ? manager.getRepository(Permission)
      : this.permissionRepo;

    return await repo.findOne({
      where: { permissionKey: key },
    });
  }
}

