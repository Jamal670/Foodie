import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleModuleService } from './role-module.service';
import { Role } from './entity/role.entity';
import { RolePermissionModule } from 'src/user/role-permission/role-permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), RolePermissionModule],
  providers: [RoleModuleService],
  exports: [RoleModuleService],
})
export class RoleModuleModule {}
