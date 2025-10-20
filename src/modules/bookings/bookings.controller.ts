import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('flightId') flightId?: string,
    @Query('status') status?: string,
  ): Promise<Booking[]> {
    if (userId) {
      return this.bookingsService.findByUserId(userId);
    }
    if (flightId) {
      return this.bookingsService.findByFlightId(flightId);
    }
    if (status) {
      return this.bookingsService.findByStatus(status);
    }
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Booking> {
    return this.bookingsService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Booking> {
    return this.bookingsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Booking> {
    return this.bookingsService.delete(id);
  }
}
