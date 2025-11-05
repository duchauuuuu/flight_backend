import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TravellerCountsDto {
  @IsNumber()
  @Min(0)
  adults: number;

  @IsNumber()
  @Min(0)
  children: number;

  @IsNumber()
  @Min(0)
  infants: number;
}

export class TravellerDto {
  @IsString()
  @IsNotEmpty()
  type: string; // Adult, Child, Infant

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ContactDetailsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  paidAt: string;
}

export class CreateBookingDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  bookingCode?: string; // BE sẽ tự sinh nếu không truyền

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  flightIds: string[];

  @IsString()
  @IsNotEmpty()
  tripType: string; // One-way, Round-trip, Multi-city

  @ValidateNested()
  @Type(() => TravellerCountsDto)
  travellerCounts: TravellerCountsDto;

  @IsString()
  @IsNotEmpty()
  cabinClass: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravellerDto)
  @IsOptional()
  travellers?: TravellerDto[];

  @ValidateNested()
  @Type(() => ContactDetailsDto)
  @IsOptional()
  contactDetails?: ContactDetailsDto;

  @IsString()
  @IsOptional()
  status?: string;

  @ValidateNested()
  @Type(() => PaymentDto)
  @IsOptional()
  payment?: PaymentDto;
}
