import { Module } from '@nestjs/common';

import { RoleModuleService } from './role-module.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entity/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleModuleService],
  exports: [RoleModuleService],
})
export class RoleModuleModule {}
