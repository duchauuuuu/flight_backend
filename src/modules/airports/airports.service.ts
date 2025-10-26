import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Airport, AirportDocument } from './schemas/airport.schema';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Injectable()
export class AirportsService {
  constructor(
    @InjectModel(Airport.name) private airportModel: Model<AirportDocument>,
  ) {}

  async create(createAirportDto: CreateAirportDto): Promise<Airport> {
    const airport = new this.airportModel(createAirportDto);
    return airport.save();
  }

  async findAll(): Promise<Airport[]> {
    return this.airportModel.find().sort({ code: 1 }).exec();
  }

  async findById(id: string): Promise<Airport> {
    const airport = await this.airportModel.findById(id).exec();
    if (!airport) throw new NotFoundException('Airport not found');
    return airport;
  }

  async findByCode(code: string): Promise<Airport | null> {
    return this.airportModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async findByCity(city: string): Promise<Airport[]> {
    return this.airportModel
      .find({ city: new RegExp(city, 'i') })
      .sort({ code: 1 })
      .exec();
  }

  async findByCountry(country: string): Promise<Airport[]> {
    return this.airportModel
      .find({ country: new RegExp(country, 'i') })
      .sort({ code: 1 })
      .exec();
  }

  async search(keyword: string): Promise<Airport[]> {
    return this.airportModel
      .find({
        $or: [
          { code: new RegExp(keyword, 'i') },
          { name: new RegExp(keyword, 'i') },
          { city: new RegExp(keyword, 'i') },
          { country: new RegExp(keyword, 'i') },
        ],
      })
      .sort({ code: 1 })
      .exec();
  }

  async update(
    id: string,
    updateAirportDto: UpdateAirportDto,
  ): Promise<Airport> {
    const updated = await this.airportModel
      .findByIdAndUpdate(id, updateAirportDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Airport not found');
    return updated;
  }

  async delete(id: string): Promise<Airport> {
    const deleted = await this.airportModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Airport not found');
    return deleted;
  }
}
