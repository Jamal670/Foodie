import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class ScanQrInput {
  @Field(() => String, { description: 'QR Token' })
  @IsNotEmpty({ message: 'Please scan the QR code.' })
  @IsString({ message: 'QR Token must be a string.' })
  qrToken: string;

  @Field(() => String, { nullable: true, description: 'Optional Device ID' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

