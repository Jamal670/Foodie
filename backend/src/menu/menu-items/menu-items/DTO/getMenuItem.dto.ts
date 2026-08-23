import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class GetMenuItemDto {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty({ message: 'Item ID is required.' })
  itemId: number;
}
