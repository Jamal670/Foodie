import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  ArrayNotEmpty,
  ArrayMaxSize,
  ArrayUnique,
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateNewRoleDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[A-Za-z0-9 _-]+$/, {
    message: 'roleName must contain only letters, numbers, spaces, underscores, or hyphens',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  roleName: string;

  @Field()
  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  roleEmail: string;

  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  permissionIds: number[];
}
