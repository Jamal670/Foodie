import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteResponses {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  hasChildren: boolean;

  @Field(() => Int)
  childrenCount: number;
}
