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
  ): Promise<Flight[]> {
    return this.flightsService.searchFlights(from, to, airline);
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
