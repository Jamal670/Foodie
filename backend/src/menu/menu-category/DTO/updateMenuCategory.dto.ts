import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateMenuCategoryDto {
  // ================= REQUIRED =================

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty({ message: 'Current category id is required' })
  @Type(() => Number)
  id: number;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Image URL is required' })
  imageUrl: string;
  // ================= OPTIONAL =================

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentCategoryName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
