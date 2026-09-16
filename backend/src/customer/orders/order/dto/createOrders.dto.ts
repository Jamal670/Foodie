import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderType } from '../enums/orders.enum';

@InputType()
export class CreateOrdersDto {
  @Field(() => OrderType, { defaultValue: OrderType.DINE_IN, nullable: true })
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;
}
