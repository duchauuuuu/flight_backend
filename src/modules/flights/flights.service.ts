import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight, FlightDocument } from './schemas/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';

@Injectable()
export class FlightsService {
  constructor(@InjectModel(Flight.name) private flightModel: Model<FlightDocument>) {}

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    const flight = new this.flightModel(createFlightDto);
    return flight.save();
  }

  async findAll(): Promise<Flight[]> {
    return this.flightModel.find().exec();
  }

  async findById(id: string): Promise<Flight> {
    const flight = await this.flightModel.findById(id).exec();
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  async update(id: string, updateFlightDto: UpdateFlightDto): Promise<Flight> {
    const updated = await this.flightModel.findByIdAndUpdate(id, updateFlightDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Flight not found');
    return updated;
  }

  async delete(id: string): Promise<Flight> {
    const deleted = await this.flightModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Flight not found');
    return deleted;
  }
}
