import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateResturantDto {
  @IsString()
  @IsNotEmpty()
  restName: string;

  @IsNumber()
  @Min(1)
  totalBranch: number;
}
