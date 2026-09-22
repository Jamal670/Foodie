import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entity/rolePermission.entity';
import { RolePermissionService } from './role-permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  providers: [RolePermissionService],
  exports: [TypeOrmModule, RolePermissionService],
})
export class RolePermissionModule {}
