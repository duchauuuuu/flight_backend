import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight, FlightDocument } from './schemas/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';

@Injectable()
export class FlightsService {
  constructor(
    @InjectModel(Flight.name) private flightModel: Model<FlightDocument>,
  ) {}

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    const flight = new this.flightModel(createFlightDto);
    return flight.save();
  }

  async findAll(): Promise<Flight[]> {
    return this.flightModel.find().sort({ departure: 1 }).exec();
  }

  async findById(id: string): Promise<Flight> {
    const flight = await this.flightModel.findById(id).exec();
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  async findByRoute(from: string, to: string): Promise<Flight[]> {
    return this.flightModel.find({ from, to }).sort({ departure: 1 }).exec();
  }

  async findByAirline(airline: string): Promise<Flight[]> {
    return this.flightModel.find({ airline }).sort({ departure: 1 }).exec();
  }

  async searchFlights(
    from?: string,
    to?: string,
    airline?: string,
    date?: string,
    cabinClass?: string,
    passengers?: number,
  ): Promise<Flight[]> {
    const query: any = {};
    if (from) query.from = from;
    if (to) query.to = to;
    if (airline) query.airline = airline;

    // Filter by date if provided (format: YYYY-MM-DD)
    if (date) {
      try {
        let searchDate: Date;

        // Check if date is already in ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
          // Parse YYYY-MM-DD format (local timezone)
          const [year, month, day] = date.split('-').map(Number);
          searchDate = new Date(year, month - 1, day);
        } else {
          // Try to parse display format like "6 Thg 11, 2025" or "7 Thg 11, 2025"
          const cleaned = String(date).replace(',', '').trim();
          const parts = cleaned.split(' ').filter(Boolean);

          if (parts.length >= 4) {
            // Format: "6 Thg 11, 2025" -> [6, 'Thg', 11, 2025]
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[2], 10);
            const year = parseInt(parts[3], 10);

            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              // Create date with month (0-indexed in JavaScript Date)
              searchDate = new Date(year, month - 1, day);
            } else {
              // Fallback to current date if parsing fails
              searchDate = new Date();
            }
          } else {
            // Try standard Date parsing
            searchDate = new Date(date);
          }
        }

        if (!isNaN(searchDate.getTime())) {
          // Set time to start of day (00:00:00) in UTC
          const startOfDay = new Date(
            Date.UTC(
              searchDate.getFullYear(),
              searchDate.getMonth(),
              searchDate.getDate(),
              0,
              0,
              0,
              0,
            ),
          );

          // Set time to end of day (23:59:59.999) in UTC
          const endOfDay = new Date(
            Date.UTC(
              searchDate.getFullYear(),
              searchDate.getMonth(),
              searchDate.getDate(),
              23,
              59,
              59,
              999,
            ),
          );

          // Filter flights where departure is between start and end of day
          // MongoDB stores dates in UTC, so we use UTC dates for comparison
          query.departure = {
            $gte: startOfDay,
            $lte: endOfDay,
          };
        }
      } catch (error) {
        // If date parsing fails, don't filter by date
      }
    }

    // Filter by cabin class and passengers if provided
    let flights = await this.flightModel
      .find(query)
      .sort({ departure: 1 })
      .exec();

    // Filter by cabin class if provided
    if (cabinClass) {
      // Map Vietnamese cabin class names to English
      const cabinMap: Record<string, string> = {
        'Phổ thông': 'Economy',
        'Phổ thông cao cấp': 'Premium Economy',
        'Thương gia': 'Business',
        'Hạng nhất': 'First',
      };

      const cabinClassEn = cabinMap[cabinClass] || cabinClass;
      flights = flights.filter((flight) => {
        return flight.availableCabins?.includes(cabinClassEn);
      });
    }

    // Filter by available seats if passengers count is provided
    if (passengers && passengers > 0 && cabinClass) {
      const cabinMap: Record<string, string> = {
        'Phổ thông': 'Economy',
        'Phổ thông cao cấp': 'Premium Economy',
        'Thương gia': 'Business',
        'Hạng nhất': 'First',
      };

      const cabinClassEn = cabinMap[cabinClass] || cabinClass;
      flights = flights.filter((flight) => {
        const availableSeats = flight.seatsAvailable?.[cabinClassEn] || 0;
        return availableSeats >= passengers;
      });
    }

    return flights;
  }

  async searchMulticityFlights(
    segments: Array<{ from: string; to: string; date: string }>,
    cabinClass?: string,
    passengers?: number,
  ): Promise<Flight[][]> {
    // Tìm kiếm cho từng segment
    const results: Flight[][] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      const segmentFlights = await this.searchFlights(
        segment.from,
        segment.to,
        undefined,
        segment.date,
        cabinClass,
        passengers,
      );

      results.push(segmentFlights);
    }

    return results;
  }

  async update(id: string, updateFlightDto: UpdateFlightDto): Promise<Flight> {
    const updated = await this.flightModel
      .findByIdAndUpdate(id, updateFlightDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Flight not found');
    return updated;
  }

  async delete(id: string): Promise<Flight> {
    const deleted = await this.flightModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Flight not found');
    return deleted;
  }
}
