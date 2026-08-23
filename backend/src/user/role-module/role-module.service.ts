import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entity/role.entity';

@Injectable()
export class RoleModuleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async CreateNewUserRole() {
    const role = this.roleRepo.create({
      role_name: 'admin',
      is_system_role: true,
    });
    return this.roleRepo.save(role);
  }

  async verifyUser(userId: number) {
    //return this.roleRepo.update(userId);
  }
}
