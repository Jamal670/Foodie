import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderTypeDto {
  @IsOptional()
  @IsBoolean()
  dineIn?: boolean;

  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsOptional()
  @IsBoolean()
  takeaway?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryCharges?: number;
}
