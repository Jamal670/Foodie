import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class DeleteTableQrDto {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number;
}
