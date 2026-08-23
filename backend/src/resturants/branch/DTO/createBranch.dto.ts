import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ContactPersonDesignation } from '../entity/enums/branch.enums';

export class CreateBranchDto {
  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  contactPersonName: string;

  @IsOptional()
  @IsEnum(ContactPersonDesignation)
  contactPersonDesignation?: ContactPersonDesignation;

  @IsNotEmpty()
  @IsString()
  contactPersonPhone: string;

  @IsOptional()
  contactPersonEmail?: string;

  @IsOptional()
  servingTime?: string;
}
