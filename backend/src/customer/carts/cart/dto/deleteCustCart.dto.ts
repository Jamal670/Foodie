import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';

@InputType()
export class DeleteCustCartItemDto {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  cartItemId: number;
}