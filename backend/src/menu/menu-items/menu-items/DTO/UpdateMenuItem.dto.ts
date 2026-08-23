import { IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { PartialType, InputType, Field, Int } from '@nestjs/graphql';

import { CreateMenuItemDto } from './createMenuItem.dto';

@InputType()
export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty({ message: 'Item ID is required.' })
  itemId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  imagesChanged?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  addonsChanged?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  variationsChanged?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  customizationsChanged?: boolean;
}
