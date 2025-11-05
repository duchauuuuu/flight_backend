import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { AirportsService } from './airports.service';
import { Airport } from './schemas/airport.schema';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Controller('airports')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @Post()
  create(@Body() createAirportDto: CreateAirportDto): Promise<Airport> {
    return this.airportsService.create(createAirportDto);
  }

  @Get('search')
  search(@Query('keyword') keyword: string): Promise<Airport[]> {
    return this.airportsService.search(keyword);
  }

  // Mock data endpoint for FE without DB
  @Get('mock')
  mockList(): Airport[] {
    return [
      {
        code: 'SGN',
        name: 'Sân bay quốc tế Tân Sơn Nhất',
        city: 'TP Hồ Chí Minh',
        country: 'Việt Nam',
      } as Airport,
      {
        code: 'HAN',
        name: 'Sân bay quốc tế Nội Bài',
        city: 'Hà Nội',
        country: 'Việt Nam',
      } as Airport,
      {
        code: 'DAD',
        name: 'Sân bay quốc tế Đà Nẵng',
        city: 'Đà Nẵng',
        country: 'Việt Nam',
      } as Airport,
      {
        code: 'CXR',
        name: 'Sân bay quốc tế Cam Ranh',
        city: 'Nha Trang',
        country: 'Việt Nam',
      } as Airport,
      {
        code: 'HPH',
        name: 'Sân bay quốc tế Cát Bi',
        city: 'Hải Phòng',
        country: 'Việt Nam',
      } as Airport,
      {
        code: 'VCA',
        name: 'Sân bay quốc tế Cần Thơ',
        city: 'Cần Thơ',
        country: 'Việt Nam',
      } as Airport,
      {
        code: 'DLI',
        name: 'Sân bay Liên Khương',
        city: 'Đà Lạt',
        country: 'Việt Nam',
      } as Airport,
    ];
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
  ): Promise<Airport[]> {
    if (city) {
      return this.airportsService.findByCity(city);
    }
    if (country) {
      return this.airportsService.findByCountry(country);
    }
    return this.airportsService.findAll();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<Airport | null> {
    return this.airportsService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Airport> {
    return this.airportsService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<Airport> {
    return this.airportsService.update(id, updateAirportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Airport> {
    return this.airportsService.delete(id);
  }
}
