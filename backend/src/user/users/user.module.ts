import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { RoleModuleModule } from 'src/user/role-module/role-module.module';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModuleModule],
  providers: [UserService, UsersResolver],
  exports: [UserService],
})
export class UserModule {}
