import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = new this.bookingModel(createBookingDto);
    return booking.save();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .exec();
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .exec();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ userId })
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .exec();
  }

  async findByFlightId(flightId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ flightIds: flightId })
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .exec();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .exec();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async delete(id: string): Promise<Booking> {
    const deleted = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Booking not found');
    return deleted;
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .exec();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async findByStatus(status: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ status })
      .populate('userId', 'name email phone')
      .populate('flightIds', 'flightNumber from to departure arrival price')
      .sort({ bookingDate: -1 })
      .exec();
  }
}
