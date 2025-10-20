import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { Flight, FlightSchema } from './schemas/flight.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flight.name, schema: FlightSchema }])],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
