import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, PaymentMethod } from 'src/customer/orders/order/enums/orders.enum';

@InputType()
export class PosCartItemDto {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  menuItemId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  quantity: number;

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
}

@InputType()
export class CreatePosOrderDto {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  tableId: number;

  @Field(() => OrderType, { nullable: true, defaultValue: OrderType.DINE_IN })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @Field(() => PaymentMethod, { nullable: true, defaultValue: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phoneNo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field(() => [PosCartItemDto])
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosCartItemDto)
  items: PosCartItemDto[];
}
