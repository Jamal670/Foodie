import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// mail
import { MailModule } from './common/mail/mail.module';

//modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/users/user.module';

//controller and services
import { RoleModuleModule } from './user/role-module/role-module.module';
import { UserSessionModule } from './user/user-session/module.module';
import { ResturantModule } from './resturants/resturant/resturant.module';
import { BranchModule } from './resturants/branch/branch.module';
import { OrderTypeModule } from './resturants/order-type/order-type.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MenuCategoryModule } from './menu/menu-category/menu-category.module';
import { UploadModule } from './common/upload/upload.module';
import { MenuItemsImagesModule } from './menu/menu-items/menu-items-images/menu-items-images.module';
import { ItemAddonsModule } from './menu/menu-items/item-addons/item-addons.module';
import { ItemVariationModule } from './menu/menu-items/item-variation/item-variation.module';
import { ItemCustomizationModule } from './menu/menu-items/item-customization/item-customization.module';
import { MenuItemsModule } from './menu/menu-items/menu-items/menu-items.module';
import { TableModule } from './table-module/table/table.module';
import { TableSectionModule } from './table-module/table-section/table-section.module';
import { CustomerModule } from './customer/customer.module';
import { RolePermissionModule } from './user/role-permission/role-permission.module';
import { PermissionModule } from './user/permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: true, // remove in production OR set to false
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    AuthModule,
    UserModule,
    MailModule,
    RoleModuleModule,
    UserSessionModule,
    ResturantModule,
    BranchModule,
    OrderTypeModule,
    MenuCategoryModule,
    MenuItemsModule,
    UploadModule,
    MenuItemsImagesModule,
    ItemAddonsModule,
    ItemVariationModule,
    ItemCustomizationModule,
    TableModule,
    TableSectionModule,
    CustomerModule,
    RolePermissionModule,
    PermissionModule,
  ],
})
export class AppModule {}
