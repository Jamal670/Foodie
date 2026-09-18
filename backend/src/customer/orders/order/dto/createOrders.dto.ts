import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { OrderType, PaymentMethod } from '../enums/orders.enum';

@InputType()
export class CreateOrdersDto {
  @Field(() => OrderType, { defaultValue: OrderType.DINE_IN, nullable: true })
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

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
  @IsEmail()
  email?: string;
}
