import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsString()
  userId: string;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  fromCity: string;

  @IsString()
  toCity: string;

  @IsString()
  departDate: string;

  @IsString()
  @IsOptional()
  returnDate?: string;

  @IsString()
  @IsEnum(['round', 'oneway', 'multicity'])
  tripType: string;

  @IsNumber()
  passengers: number;

  @IsString()
  seatClass: string;
}

