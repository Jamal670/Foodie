import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RoleEmailVerifyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  token: string;
}
