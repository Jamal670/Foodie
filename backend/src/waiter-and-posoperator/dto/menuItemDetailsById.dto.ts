import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt } from 'class-validator';

@InputType()
export class GetMenuItemDetailByIdDto {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  menuItemId: number;
}
