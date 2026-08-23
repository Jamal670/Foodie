import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ==========================================================
   MENU ITEM IMAGE DTO
========================================================== */

@InputType()
export class MenuItemImageInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Image URL is required.' })
  imageUrl: string;

  @Field()
  @IsBoolean()
  isThumbnail: boolean;
}

/* ==========================================================
   ITEM ADDON DTO
========================================================== */

@InputType()
export class ItemAddonInput {
  @Field(() => Int)
  @IsNumber()
  addonId: number;
}

/* ==========================================================
   ITEM VARIATION DTO
========================================================== */

@InputType()
export class ItemVariationInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Variation name is required.' })
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;
}

/* ==========================================================
   ITEM CUSTOMIZATION DTO
========================================================== */

@InputType()
export class ItemCustomizationInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Customization name is required.' })
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field()
  @IsBoolean()
  multiSelect: boolean;
}

/* ==========================================================
   CREATE MENU ITEM DTO
========================================================== */

@InputType()
export class CreateMenuItemDto {
  // ================= BASIC INFO =================

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty({ message: 'Category ID is required.' })
  categoryId: number;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Item name is required.' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0, { message: 'Base price is required.' })
  basePrice: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0, { message: 'Discounted price is required.' })
  discountedPrice: number;

  // ================= IMAGES =================

  @Field(() => [MenuItemImageInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemImageInput)
  images: MenuItemImageInput[];

  // ================= ADDONS =================

  @Field(() => [ItemAddonInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemAddonInput)
  addons?: ItemAddonInput[];

  // ================= VARIATIONS =================

  @Field(() => [ItemVariationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemVariationInput)
  variations?: ItemVariationInput[];

  // ================= CUSTOMIZATIONS =================

  @Field(() => [ItemCustomizationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCustomizationInput)
  customizations?: ItemCustomizationInput[];
}
