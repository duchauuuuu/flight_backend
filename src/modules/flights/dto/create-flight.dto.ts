import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsDateString()
  @IsNotEmpty()
  departure: string;

  @IsDateString()
  @IsNotEmpty()
  arrival: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stops: number;

  @IsString()
  @IsNotEmpty()
  airline: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableCabins?: string[];

  @IsObject()
  @IsOptional()
  seatsAvailable?: Record<string, number>;
}
