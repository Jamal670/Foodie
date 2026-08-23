import { Field, InputType, Int } from '@nestjs/graphql';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

@InputType()
export class DeleteMenuItemListDto {
  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty({ message: 'Item IDs list cannot be empty.' })
  @IsInt({ each: true, message: 'Each Item ID must be an integer.' })
  itemIds: number[];
}
