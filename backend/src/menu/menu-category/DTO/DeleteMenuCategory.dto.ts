import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class DeleteMenuCategoryDto {
  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'Category ID is required.' })
  id: number;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
