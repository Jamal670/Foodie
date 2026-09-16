import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class AddCartItemDto {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  menuItemId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  menuItemName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  variationId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  itemVariationName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  customizationId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  itemCustomizationName?: string;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  quantity: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;
}
