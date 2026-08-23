import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Confirm Password is required' })
  @MinLength(8, { message: 'Confirm Password must be at least 8 characters' })
  @IsString()
  confirmPassword: string;

  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token: string;
}
