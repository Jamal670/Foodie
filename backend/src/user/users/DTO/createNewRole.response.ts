import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateNewRoleResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  roleId: number;

  @Field()
  roleName: string;

  @Field()
  roleEmail: string;
}
