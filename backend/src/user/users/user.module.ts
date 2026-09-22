import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UsersResolver } from './users.resolver';
import { RoleModuleModule } from 'src/user/role-module/role-module.module';
import { RolePermissionModule } from 'src/user/role-permission/role-permission.module';
import { PermissionModule } from 'src/user/permission/permission.module';
import { UserSessionModule } from 'src/user/user-session/module.module';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { RolePermission } from 'src/user/role-permission/entity/rolePermission.entity';
import { UserSession } from 'src/user/user-session/entity/userSession.entity';
import { Permission } from 'src/user/permission/entity/permission.entity';

import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Branch, RolePermission, Permission, UserSession]),
    RoleModuleModule,
    RolePermissionModule,
    PermissionModule,
    UserSessionModule,
    MailModule,
  ],
  providers: [UserService, UsersResolver],
  exports: [UserService],
})
export class UserModule {}
