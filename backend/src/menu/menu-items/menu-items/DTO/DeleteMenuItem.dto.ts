import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class DeleteMenuItemDto {
  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'Item ID is required.' })
  itemId: number;
}
