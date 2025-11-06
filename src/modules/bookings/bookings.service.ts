import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Flight } from '../flights/schemas/flight.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Flight.name) private flightModel: Model<Flight>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Normalize flightIds to actual Flight _id strings for reliable populate
    if (Array.isArray(createBookingDto.flightIds)) {
      const normalized: string[] = [];
      for (const fid of createBookingDto.flightIds) {
        if (typeof fid === 'string' && /^[0-9a-fA-F]{24}$/.test(fid)) {
          normalized.push(fid);
        } else if (typeof fid === 'string') {
          const found = await this.flightModel
            .findOne({ flightNumber: fid }, '_id')
            .exec();
          if (found?._id) normalized.push(String(found._id));
        }
      }
      if (normalized.length) createBookingDto.flightIds = normalized;
    }

    const booking = new this.bookingModel(createBookingDto);
    const savedBooking = await booking.save();

    // Tạo notification khi booking được tạo thành công
    try {
      const flightCount = Array.isArray(savedBooking.flightIds)
        ? savedBooking.flightIds.length
        : 1;
      const flightText = flightCount === 1 ? 'vé' : `${flightCount} vé`;

      // Lấy thông tin flights để hiển thị
      const isMulticity = savedBooking.tripType === 'Multi-city';
      let notificationMessage = `Bạn đã đặt thành công ${flightText} với mã đặt chỗ ${savedBooking.bookingCode}.`;

      if (
        isMulticity &&
        savedBooking.flightIds &&
        savedBooking.flightIds.length > 1
      ) {
        // Multi-city: Lấy tất cả flights và hiển thị route đầy đủ
        const allFlights = await Promise.all(
          savedBooking.flightIds.map((id) =>
            this.flightModel.findById(id).exec(),
          ),
        );

        const validFlights = allFlights.filter((f) => f !== null);
        if (validFlights.length > 0) {
          const firstFlight = validFlights[0];

          // Tạo route string: HAN → DAD → SGN
          const routeParts: string[] = [];
          validFlights.forEach((f, idx) => {
            if (idx === 0) {
              routeParts.push(f.from);
            }
            routeParts.push(f.to);
          });
          const routeString = routeParts.join(' → ');

          const depDate = firstFlight.departure
            ? new Date(firstFlight.departure)
            : null;
          if (depDate) {
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const dayOfWeek = dayNames[depDate.getDay()];
            const day = String(depDate.getDate()).padStart(2, '0');
            const month = String(depDate.getMonth() + 1).padStart(2, '0');
            const year = depDate.getFullYear();
            const hours = String(depDate.getHours()).padStart(2, '0');
            const minutes = String(depDate.getMinutes()).padStart(2, '0');

            notificationMessage += ` Chuyến bay nhiều thành phố ${routeString} (${validFlights.length} chặng), khởi hành ${hours}:${minutes} • ${dayOfWeek}, ${day}/${month}/${year}.`;
          }
        }
      } else {
        // Single/Round-trip: Chỉ hiển thị flight đầu tiên
        const firstFlight =
          savedBooking.flightIds && savedBooking.flightIds.length > 0
            ? await this.flightModel.findById(savedBooking.flightIds[0]).exec()
            : null;

        if (firstFlight) {
          const depDate = firstFlight.departure
            ? new Date(firstFlight.departure)
            : null;
          if (depDate) {
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const dayOfWeek = dayNames[depDate.getDay()];
            const day = String(depDate.getDate()).padStart(2, '0');
            const month = String(depDate.getMonth() + 1).padStart(2, '0');
            const year = depDate.getFullYear();
            const hours = String(depDate.getHours()).padStart(2, '0');
            const minutes = String(depDate.getMinutes()).padStart(2, '0');

            notificationMessage += ` Chuyến bay ${firstFlight.from} → ${firstFlight.to}, khởi hành ${hours}:${minutes} • ${dayOfWeek}, ${day}/${month}/${year}.`;
          }
        }
      }

      await this.notificationsService.create({
        userId: savedBooking.userId,
        title: 'Đặt vé thành công',
        message: notificationMessage,
        type: 'booking',
        isRead: false,
        bookingId: savedBooking._id,
      });

      // Tăng điểm cho user khi đặt vé thành công
      // Tính điểm dựa trên giá trị booking (1 điểm = 10000 VNĐ)
      const bookingAmount = savedBooking.payment?.amount || 0;
      const pointsToAdd = Math.floor(bookingAmount / 10000);

      if (pointsToAdd > 0) {
        try {
          // Lấy user hiện tại để kiểm tra điểm trước khi tăng
          const currentUser = await this.usersService.findById(
            savedBooking.userId,
          );
          const currentPoints = currentUser?.points || 0;
          const oldTier = this.usersService.getMembershipTier(currentPoints);

          // Tăng điểm
          await this.usersService.addPoints(savedBooking.userId, pointsToAdd);

          // Lấy user sau khi tăng điểm để kiểm tra hạng mới
          const updatedUser = await this.usersService.findById(
            savedBooking.userId,
          );
          const newPoints = updatedUser?.points || 0;
          const newTier = this.usersService.getMembershipTier(newPoints);

          // Nếu hạng thành viên thay đổi, tạo notification về việc tăng hạng
          if (oldTier !== newTier) {
            await this.notificationsService.create({
              userId: savedBooking.userId,
              title: `Chúc mừng! Bạn đã lên hạng ${newTier}`,
              message: `Bạn đã đạt ${newPoints} điểm và được nâng cấp lên hạng ${newTier}. Hãy tận hưởng các ưu đãi đặc biệt!`,
              type: 'promotion',
              isRead: false,
            });
          }

          // Tạo notification về điểm được tặng
          await this.notificationsService.create({
            userId: savedBooking.userId,
            title: `Bạn được cộng ${pointsToAdd} điểm`,
            message: `Bạn đã được cộng ${pointsToAdd} điểm từ đặt vé. Tổng điểm hiện tại: ${newPoints} điểm.`,
            type: 'promotion',
            isRead: false,
          });
        } catch (error) {
          // Không throw error để không ảnh hưởng đến booking creation
        }
      }
    } catch (error) {
      // Không throw error để không ảnh hưởng đến booking creation
    }

    return savedBooking;
  }

  async findAll(): Promise<Booking[]> {
    const list = await this.bookingModel
      .find()
      .populate('userId', 'name email phone')
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline',
      )
      .exec();
    return list;
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('userId', 'name email phone')
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline',
      )
      .exec();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const list = await this.bookingModel
      .find({ userId })
      .populate('userId', 'name email phone')
      .populate({
        path: 'flightIds',
        select: 'flightNumber from to departure arrival price airline',
        model: 'Flight',
      })
      .exec();


    return list;
  }

  async findByFlightId(flightId: string): Promise<Booking[]> {
    const list = await this.bookingModel
      .find({ flightIds: flightId })
      .populate('userId', 'name email phone')
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline',
      )
      .exec();
    return list;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('userId', 'name email phone')
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline',
      )
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
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline',
      )
      .exec();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async cancel(id: string): Promise<Booking> {
    // Lấy booking trước khi hủy để lấy thông tin flight
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('Booking not found');

    // Nếu đã hủy rồi thì không làm gì
    if (booking.status === 'cancelled') {
      return booking;
    }

    // Cập nhật status thành cancelled
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
      .populate('userId', 'name email phone')
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline availableCabins seatsAvailable',
      )
      .exec();

    if (!updated) throw new NotFoundException('Booking not found');

    // Cập nhật lại số ghế còn lại trong flight (tăng lên khi hủy)
    if (updated.flightIds && Array.isArray(updated.flightIds)) {
      const totalAdults = updated.travellerCounts?.adults || 0;
      const totalChildren = updated.travellerCounts?.children || 0;
      const totalPassengers = totalAdults + totalChildren;
      const cabinClass = updated.cabinClass || 'Economy';

      // Populated flightIds có thể là Flight object hoặc string ID
      for (const flight of updated.flightIds) {
        let flightId: string | null = null;

        if (typeof flight === 'string') {
          flightId = flight;
        } else if (flight && typeof flight === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const flightObj = flight as any;
          if (flightObj._id) {
            flightId = String(flightObj._id);
          }
        }

        if (flightId) {
          const currentFlight = await this.flightModel
            .findById(flightId)
            .exec();

          if (currentFlight && currentFlight.seatsAvailable) {
            const currentSeats = currentFlight.seatsAvailable[cabinClass] || 0;
            const newSeats = currentSeats + totalPassengers;

            await this.flightModel
              .findByIdAndUpdate(flightId, {
                $set: {
                  [`seatsAvailable.${cabinClass}`]: newSeats,
                },
              })
              .exec();
          }
        }
      }
    }

    return updated;
  }

  async findByStatus(status: string): Promise<Booking[]> {
    const list = await this.bookingModel
      .find({ status })
      .populate('userId', 'name email phone')
      .populate(
        'flightIds',
        'flightNumber from to departure arrival price airline',
      )
      .sort({ bookingDate: -1 })
      .exec();
    return list;
  }
}
