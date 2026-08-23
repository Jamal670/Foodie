import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './DTO/user.created.dto';

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
}
