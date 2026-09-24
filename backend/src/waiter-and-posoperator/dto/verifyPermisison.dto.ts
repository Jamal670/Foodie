import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';

@InputType()
export class VerifyPermissionDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  permissionKey: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  permissionCode: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  orderId?: number;
}
