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
import { FlightsService } from './flights.service';
import { Flight } from './schemas/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  create(@Body() createFlightDto: CreateFlightDto): Promise<Flight> {
    return this.flightsService.create(createFlightDto);
  }

  @Get('search')
  search(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('airline') airline?: string,
    @Query('date') date?: string,
    @Query('cabinClass') cabinClass?: string,
    @Query('passengers') passengers?: string,
  ): Promise<Flight[]> {
    const passengersNum = passengers ? parseInt(passengers, 10) : undefined;
    return this.flightsService.searchFlights(from, to, airline, date, cabinClass, passengersNum);
  }

  @Post('search-multicity')
  searchMulticity(
    @Body() body: { segments: Array<{ from: string; to: string; date: string }>; cabinClass?: string; passengers?: number },
  ): Promise<Flight[][]> {
    console.log('🟣 [MULTICITY CONTROLLER] Received multicity search request');
    console.log('🟣 [MULTICITY CONTROLLER] Body:', JSON.stringify(body, null, 2));
    return this.flightsService.searchMulticityFlights(body.segments, body.cabinClass, body.passengers);
  }

  // Mock search endpoint for FE without DB
  @Get('mock-search')
  mockSearch(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('date') date?: string,
  ): Flight[] {
    const all: Flight[] = [
      { _id: '1' } as any,
      { _id: '2' } as any,
      { _id: '3' } as any,
    ].map((_, idx) => ({
      _id: String(idx + 1),
      airline: idx % 2 === 0 ? 'VN' : 'VJ',
      from: from || 'SGN',
      to: to || 'HAN',
      departure: new Date(date || new Date().toISOString()).toISOString(),
      arrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      price: 1200000 + idx * 150000,
      durationMinutes: 120 + idx * 10,
    })) as any;

    return all;
  }

  @Get('mock')
  mockList(): Flight[] {
    const now = new Date();
    return [
      {
        _id: 'f1',
        airline: 'VN',
        from: 'SGN',
        to: 'HAN',
        departure: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        arrival: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        price: 1500000,
        durationMinutes: 120,
      },
      {
        _id: 'f2',
        airline: 'VJ',
        from: 'SGN',
        to: 'DAD',
        departure: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        arrival: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        price: 900000,
        durationMinutes: 110,
      },
    ] as any;
  }

  @Get()
  findAll(): Promise<Flight[]> {
    return this.flightsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Flight> {
    return this.flightsService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<Flight> {
    return this.flightsService.update(id, updateFlightDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Flight> {
    return this.flightsService.delete(id);
  }
}
