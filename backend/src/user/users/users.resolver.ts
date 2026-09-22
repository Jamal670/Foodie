import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './DTO/user.created.dto';
import { CreateNewRoleDto } from './DTO/createNewRole.dto';
import { CreateNewRoleResponse } from './DTO/createNewRole.response';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userSevice: UserService) {}

  @Query(() => [User], { name: 'users' })
  async findall() {
    return await this.userSevice.findAllUsers();
  }

  @Query(() => User)
  async getOneUser(@Args('id') id: number) {
    return await this.userSevice.findUserById(id);
  }

  @Mutation(() => User)
  async createNewUser(@Args('dto') createUserDto: CreateUserDto) {
    return await this.userSevice.CreateNewUser(createUserDto);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => CreateNewRoleResponse)
  async createNewRole(
    @Args(
      'dto',
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    dto: CreateNewRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<CreateNewRoleResponse> {
    return await this.userSevice.createNewRole(dto, currentUser);
  }
}
