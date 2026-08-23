import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class CreateTableDto {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  tableNumber: number;
}
