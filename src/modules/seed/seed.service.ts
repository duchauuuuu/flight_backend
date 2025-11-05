import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Airport, AirportDocument } from '../airports/schemas/airport.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Flight, FlightDocument } from '../flights/schemas/flight.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Comment, CommentDocument } from '../comments/schemas/comment.schema';
import {
  Notification,
  NotificationDocument,
} from '../notifications/schemas/notification.schema';
import {
  PaymentTransaction,
  PaymentTransactionDocument,
} from '../payment-transactions/schemas/payment-transaction.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Airport.name) private airportModel: Model<AirportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Flight.name) private flightModel: Model<FlightDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(PaymentTransaction.name)
    private paymentTransactionModel: Model<PaymentTransactionDocument>,
  ) {}

  async seedAll(): Promise<{
    airports: number;
    users: number;
    flights: number;
    bookings: number;
    comments: number;
    notifications: number;
    paymentTransactions: number;
  }> {
    // Xóa dữ liệu cũ (tùy chọn - có thể bỏ qua nếu muốn giữ lại)
    // await this.clearAll();

    const airports = await this.seedAirports();
    const users = await this.seedUsers();
    const flights = await this.seedFlights(airports);
    const bookings = await this.seedBookings(users, flights);
    const comments = await this.seedComments(users, flights);
    const notifications = await this.seedNotifications(users, bookings);
    const paymentTransactions = await this.seedPaymentTransactions(bookings);

    return {
      airports: airports.length,
      users: users.length,
      flights: flights.length,
      bookings: bookings.length,
      comments: comments.length,
      notifications: notifications.length,
      paymentTransactions: paymentTransactions.length,
    };
  }

  async seedAirports(): Promise<Airport[]> {
    const airportsData = [
      // Việt Nam
      {
        code: 'HAN',
        name: 'Sân bay Nội Bài',
        city: 'Hà Nội',
        country: 'Việt Nam',
      },
      {
        code: 'SGN',
        name: 'Sân bay Tân Sơn Nhất',
        city: 'Thành phố Hồ Chí Minh',
        country: 'Việt Nam',
      },
      {
        code: 'DAD',
        name: 'Sân bay Đà Nẵng',
        city: 'Đà Nẵng',
        country: 'Việt Nam',
      },
      {
        code: 'HPH',
        name: 'Sân bay Cát Bi',
        city: 'Hải Phòng',
        country: 'Việt Nam',
      },
      {
        code: 'VCA',
        name: 'Sân bay Cần Thơ',
        city: 'Cần Thơ',
        country: 'Việt Nam',
      },
      {
        code: 'PQC',
        name: 'Sân bay Phú Quốc',
        city: 'Phú Quốc',
        country: 'Việt Nam',
      },
      {
        code: 'NHA',
        name: 'Sân bay Cam Ranh',
        city: 'Nha Trang',
        country: 'Việt Nam',
      },
      {
        code: 'HUI',
        name: 'Sân bay Phú Bài',
        city: 'Huế',
        country: 'Việt Nam',
      },
      // Quốc tế
      {
        code: 'BKK',
        name: 'Suvarnabhumi Airport',
        city: 'Bangkok',
        country: 'Thái Lan',
      },
      {
        code: 'SIN',
        name: 'Changi Airport',
        city: 'Singapore',
        country: 'Singapore',
      },
      {
        code: 'KUL',
        name: 'Kuala Lumpur International Airport',
        city: 'Kuala Lumpur',
        country: 'Malaysia',
      },
      {
        code: 'ICN',
        name: 'Incheon International Airport',
        city: 'Seoul',
        country: 'Hàn Quốc',
      },
      {
        code: 'NRT',
        name: 'Narita International Airport',
        city: 'Tokyo',
        country: 'Nhật Bản',
      },
      {
        code: 'PEK',
        name: 'Beijing Capital International Airport',
        city: 'Bắc Kinh',
        country: 'Trung Quốc',
      },
      {
        code: 'DXB',
        name: 'Dubai International Airport',
        city: 'Dubai',
        country: 'UAE',
      },
      {
        code: 'LAX',
        name: 'Los Angeles International Airport',
        city: 'Los Angeles',
        country: 'Mỹ',
      },
    ];

    // Xóa và tạo mới
    await this.airportModel.deleteMany({});
    const airportsWithIds: Airport[] = airportsData.map((a) => ({
      _id: new Types.ObjectId().toString(),
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
    }));
    await this.airportModel.insertMany(airportsWithIds);
    return airportsWithIds;
  }

  async seedUsers(): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@example.com',
        phone: '0901234567',
        dob: '1990-01-15',
        password: hashedPassword,
        points: 5000,
        role: 'Customer',
      },
      {
        name: 'Trần Thị Bình',
        email: 'tranthibinh@example.com',
        phone: '0902345678',
        dob: '1992-05-20',
        password: hashedPassword,
        points: 2500,
        role: 'Customer',
      },
      {
        name: 'Lê Văn Cường',
        email: 'levancuong@example.com',
        phone: '0903456789',
        dob: '1988-08-10',
        password: hashedPassword,
        points: 12000,
        role: 'Customer',
      },
      {
        name: 'Phạm Thị Dung',
        email: 'phamthidung@example.com',
        phone: '0904567890',
        dob: '1995-03-25',
        password: hashedPassword,
        points: 800,
        role: 'Customer',
      },
      {
        name: 'Hoàng Văn Em',
        email: 'hoangvanem@example.com',
        phone: '0905678901',
        dob: '1991-11-30',
        password: hashedPassword,
        points: 3000,
        role: 'Customer',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '0900000000',
        dob: '1985-01-01',
        password: hashedPassword,
        points: 0,
        role: 'Admin',
      },
    ];

    // Xóa và tạo mới
    await this.userModel.deleteMany({});
    const usersWithIds: User[] = usersData.map((u) => ({
      _id: new Types.ObjectId().toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      dob: u.dob,
      gender: '', // Default empty string
      password: u.password,
      points: u.points,
      role: u.role,
    }));
    await this.userModel.insertMany(usersWithIds);
    return usersWithIds;
  }

  async seedFlights(airports: Airport[]): Promise<Flight[]> {
    const airlines = ['VN', 'VJ', 'BL', 'QH'];

    const flightsData: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tạo các route phổ biến
    const routes = [
      // Routes trong nước - 2 chiều
      { from: 'HAN', to: 'SGN' },
      { from: 'SGN', to: 'HAN' },
      { from: 'HAN', to: 'DAD' },
      { from: 'DAD', to: 'HAN' },
      { from: 'DAD', to: 'SGN' },
      { from: 'SGN', to: 'DAD' },
      { from: 'SGN', to: 'PQC' },
      { from: 'PQC', to: 'SGN' },
      { from: 'HAN', to: 'PQC' },
      { from: 'PQC', to: 'HAN' },
      { from: 'DAD', to: 'PQC' },
      { from: 'PQC', to: 'DAD' },
      // Routes quốc tế
      { from: 'HAN', to: 'BKK' },
      { from: 'BKK', to: 'HAN' },
      { from: 'SGN', to: 'SIN' },
      { from: 'SIN', to: 'SGN' },
      { from: 'HAN', to: 'KUL' },
      { from: 'KUL', to: 'HAN' },
      { from: 'SGN', to: 'ICN' },
      { from: 'ICN', to: 'SGN' },
      { from: 'HAN', to: 'NRT' },
      { from: 'NRT', to: 'HAN' },
      { from: 'SGN', to: 'PEK' },
      { from: 'PEK', to: 'SGN' },
    ];

    let flightNumberCounter = 1;

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);

      for (const route of routes) {
        const fromAirport = airports.find((a) => a.code === route.from);
        const toAirport = airports.find((a) => a.code === route.to);

        if (!fromAirport || !toAirport) continue;

        // Tạo 2-4 chuyến bay mỗi route mỗi ngày
        const flightsPerRoute = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < flightsPerRoute; i++) {
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          const departureHour = Math.floor(Math.random() * 20) + 6; // 6h-2h sáng hôm sau
          const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

          const departure = new Date(currentDate);
          departure.setHours(departureHour, departureMinute, 0, 0);

          // Thời gian bay từ 1-4 giờ (tùy route)
          const flightDuration =
            route.from === route.to
              ? 2
              : route.from.includes('HAN') && route.to.includes('SGN')
                ? 2
                : route.from.length === 3 && route.to.length === 3
                  ? 3
                  : 1.5;

          const arrival = new Date(departure);
          arrival.setHours(arrival.getHours() + flightDuration);

          // Giá từ 800k - 5 triệu
          const basePrice = 800000;
          const priceVariation = Math.random() * 4200000;
          const price = Math.floor(basePrice + priceVariation);

          const cabinClasses = [
            'Economy',
            'Premium Economy',
            'Business',
            'First',
          ];
          const seatsAvailable: Record<string, number> = {};
          cabinClasses.forEach((cabin) => {
            seatsAvailable[cabin] = Math.floor(Math.random() * 50) + 10;
          });

          flightsData.push({
            flightNumber: `${airline}${String(flightNumberCounter).padStart(4, '0')}`,
            from: route.from,
            to: route.to,
            departure: departure,
            arrival: arrival,
            price: price,
            stops: Math.random() > 0.8 ? 1 : 0, // 80% không dừng
            airline: airline,
            availableCabins: cabinClasses,
            seatsAvailable: seatsAvailable,
          });

          flightNumberCounter++;
        }
      }
    }

    // Xóa và tạo mới
    await this.flightModel.deleteMany({});
    const flightsWithIds: Flight[] = flightsData.map((f) => ({
      _id: new Types.ObjectId().toString(),
      flightNumber: f.flightNumber,
      from: f.from,
      to: f.to,
      departure: f.departure,
      arrival: f.arrival,
      price: f.price,
      stops: f.stops,
      airline: f.airline,
      availableCabins: f.availableCabins,
      seatsAvailable: f.seatsAvailable,
    }));
    await this.flightModel.insertMany(
      flightsWithIds,
    );
    return flightsWithIds;
  }

  async seedBookings(users: User[], flights: Flight[]): Promise<Booking[]> {
    const bookingsData: any[] = [];
    const tripTypes = ['One-way', 'Round-trip', 'Multi-city'];
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];

    // Tạo 20-30 bookings
    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const tripType = tripTypes[Math.floor(Math.random() * tripTypes.length)];

      // Chọn 1-2 flights ngẫu nhiên
      const numFlights =
        tripType === 'One-way' ? 1 : Math.floor(Math.random() * 2) + 1;
      const selectedFlights: string[] = [];
      for (let j = 0; j < numFlights; j++) {
        const flight = flights[Math.floor(Math.random() * flights.length)];
        if (flight._id) {
          selectedFlights.push(flight._id);
        }
      }

      const adults = Math.floor(Math.random() * 3) + 1;
      const children = Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0;
      const infants = Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0;

      const cabinClass =
        cabinClasses[Math.floor(Math.random() * cabinClasses.length)];

      // Tạo travellers
      const travellers: any[] = [];
      for (let a = 0; a < adults; a++) {
        travellers.push({
          type: 'Adult',
          name: `Người lớn ${a + 1}`,
        });
      }
      for (let c = 0; c < children; c++) {
        travellers.push({
          type: 'Child',
          name: `Trẻ em ${c + 1}`,
        });
      }
      for (let inf = 0; inf < infants; inf++) {
        travellers.push({
          type: 'Infant',
          name: `Em bé ${inf + 1}`,
        });
      }

      const status = statuses[Math.floor(Math.random() * statuses.length)];

      let payment:
        | {
            method: string;
            amount: number;
            paidAt: Date;
          }
        | undefined = undefined;
      if (status === 'confirmed' || status === 'completed') {
        const totalAmount = selectedFlights.length * 2000000; // Giả sử
        payment = {
          method: Math.random() > 0.5 ? 'credit_card' : 'bank_transfer',
          amount: totalAmount,
          paidAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ), // 7 ngày trước
        };
      }

      bookingsData.push({
        userId: user._id,
        flightIds: selectedFlights,
        tripType: tripType,
        travellerCounts: {
          adults: adults,
          children: children,
          infants: infants,
        },
        travellers: travellers,
        contactDetails: {
          email: user.email,
          phone: user.phone,
        },
        status: status,
        payment: payment,
        cabinClass: cabinClass,
      });
    }

    // Xóa và tạo mới
    await this.bookingModel.deleteMany({});
    const bookingsWithIds: Booking[] = bookingsData.map((b) => ({
      _id: new Types.ObjectId().toString(),
      bookingCode: (b as Booking).bookingCode as any, // sẽ được schema set nếu thiếu
      userId: b.userId,
      flightIds: b.flightIds,
      tripType: b.tripType,
      travellerCounts: b.travellerCounts,
      travellers: b.travellers,
      contactDetails: b.contactDetails,
      status: b.status,
      payment: b.payment,
      cabinClass: b.cabinClass,
    }));
    await this.bookingModel.insertMany(
      bookingsWithIds,
    );
    return bookingsWithIds;
  }

  async seedComments(users: User[], flights: Flight[]): Promise<Comment[]> {
    const commentsData: Array<{
      userId: string;
      flightId: string;
      content: string;
      rating: number;
    }> = [];
    const comments = [
      'Chuyến bay rất tốt, dịch vụ tuyệt vời!',
      'Thời gian bay đúng giờ, nhân viên thân thiện.',
      'Ghế ngồi thoải mái, thức ăn ngon.',
      'Có một chút trễ giờ nhưng vẫn chấp nhận được.',
      'Chuyến bay ổn, giá cả hợp lý.',
      'Dịch vụ tốt, sẽ quay lại sử dụng.',
      'Máy bay mới, sạch sẽ.',
      'Thời gian bay hơi dài nhưng có giải trí trên máy bay.',
      'Rất hài lòng với dịch vụ.',
      'Cần cải thiện thêm về dịch vụ ăn uống.',
    ];

    // Tạo 30-40 comments
    for (let i = 0; i < 35; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const flight = flights[Math.floor(Math.random() * flights.length)];
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 sao
      const comment = comments[Math.floor(Math.random() * comments.length)];

      commentsData.push({
        userId: user._id || '',
        flightId: flight._id || '',
        content: comment,
        rating: rating,
      });
    }

    // Xóa và tạo mới
    await this.commentModel.deleteMany({});
    const commentsWithIds: Comment[] = commentsData.map((c) => ({
      _id: new Types.ObjectId().toString(),
      userId: c.userId,
      flightId: c.flightId,
      content: c.content,
      rating: c.rating,
    }));
    await this.commentModel.insertMany(
      commentsWithIds,
    );
    return commentsWithIds;
  }

  async seedNotifications(
    users: User[],
    bookings: Booking[],
  ): Promise<Notification[]> {
    const notificationsData: any[] = [];

    const notificationTemplates = [
      {
        type: 'booking',
        title: 'Đặt chỗ thành công',
        message: 'Bạn đã đặt chỗ thành công. Mã đặt chỗ: {bookingCode}',
      },
      {
        type: 'payment',
        title: 'Thanh toán thành công',
        message: 'Thanh toán của bạn đã được xử lý thành công.',
      },
      {
        type: 'promotion',
        title: 'Ưu đãi đặc biệt',
        message: 'Giảm 20% cho tất cả chuyến bay nội địa trong tháng này!',
      },
      {
        type: 'system',
        title: 'Thông báo hệ thống',
        message: 'Hệ thống sẽ bảo trì vào đêm nay từ 2h-4h sáng.',
      },
      {
        type: 'booking',
        title: 'Nhắc nhở chuyến bay',
        message:
          'Bạn có chuyến bay sắp tới trong 24 giờ. Vui lòng check-in sớm.',
      },
    ];

    // Tạo 40-50 notifications
    for (let i = 0; i < 45; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const template =
        notificationTemplates[
          Math.floor(Math.random() * notificationTemplates.length)
        ];

      let bookingId: string | undefined = undefined;
      if (template.type === 'booking' || template.type === 'payment') {
        const booking = bookings[Math.floor(Math.random() * bookings.length)];
        bookingId = booking._id;
      }

      let message = template.message;
      if (bookingId && message.includes('{bookingCode}')) {
        const booking = bookings.find((b) => b._id === bookingId);
        if (booking) {
          message = message.replace('{bookingCode}', booking.bookingCode);
        }
      }

      notificationsData.push({
        userId: user._id,
        title: template.title,
        message: message,
        type: template.type,
        isRead: Math.random() > 0.6, // 40% chưa đọc
        bookingId: bookingId,
      });
    }

    // Xóa và tạo mới
    await this.notificationModel.deleteMany({});
    const notificationsWithIds: Notification[] = notificationsData.map((n) => ({
      _id: new Types.ObjectId().toString(),
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      bookingId: n.bookingId,
    }));
    await this.notificationModel.insertMany(
      notificationsWithIds,
    );
    return notificationsWithIds;
  }

  async seedPaymentTransactions(
    bookings: Booking[],
  ): Promise<PaymentTransaction[]> {
    const transactionsData: Array<{
      bookingId: string;
      provider: string;
      amount: number;
      currency: string;
      status: string;
      transactionCode: string;
      bankName?: string;
      bankAccount?: string;
      bankAccountName?: string;
      paidAt?: Date;
    }> = [];
    const banks = ['Vietcombank', 'MBBank', 'Techcombank', 'BIDV', 'Agribank'];

    // Tạo transaction cho các booking đã confirmed hoặc completed
    const paidBookings = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'completed',
    );

    for (const booking of paidBookings) {
      const status = Math.random() > 0.2 ? 'success' : 'pending';
      const transactionCode = `TXN${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const transaction: {
        bookingId: string;
        provider: string;
        amount: number;
        currency: string;
        status: string;
        transactionCode: string;
        bankName?: string;
        bankAccount?: string;
        bankAccountName?: string;
        paidAt?: Date;
      } = {
        bookingId: booking._id || '',
        provider: 'Bank Transfer',
        amount: booking.payment?.amount || 2000000,
        currency: 'VND',
        status: status,
        transactionCode: transactionCode,
      };

      if (status === 'success') {
        transaction.bankName = banks[Math.floor(Math.random() * banks.length)];
        transaction.bankAccount = `123456789${Math.floor(Math.random() * 1000)}`;
        transaction.bankAccountName = 'Payment Gateway';
        transaction.paidAt = new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
      }

      transactionsData.push(transaction);
    }

    // Tạo thêm một số transaction pending
    for (let i = 0; i < 5; i++) {
      const booking = bookings[Math.floor(Math.random() * bookings.length)];
      const transactionCode = `TXN${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      transactionsData.push({
        bookingId: booking._id || '',
        provider: 'Bank Transfer',
        amount: 2000000 + Math.floor(Math.random() * 3000000),
        currency: 'VND',
        status: 'pending',
        transactionCode: transactionCode,
        bankName: banks[Math.floor(Math.random() * banks.length)],
        bankAccount: `123456789${Math.floor(Math.random() * 1000)}`,
        bankAccountName: 'Payment Gateway',
      });
    }

    // Xóa và tạo mới
    await this.paymentTransactionModel.deleteMany({});
    const transactionsWithIds: PaymentTransaction[] = transactionsData.map((t) => ({
      _id: new Types.ObjectId().toString(),
      bookingId: t.bookingId,
      provider: t.provider,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      transactionCode: t.transactionCode,
      bankName: t.bankName,
      bankAccount: t.bankAccount,
      bankAccountName: t.bankAccountName,
      paidAt: t.paidAt,
      webhookRawData: undefined,
    }));
    await this.paymentTransactionModel.insertMany(
      transactionsWithIds,
    );
    return transactionsWithIds;
  }

  async clearAll(): Promise<void> {
    await this.paymentTransactionModel.deleteMany({});
    await this.notificationModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.bookingModel.deleteMany({});
    await this.flightModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.airportModel.deleteMany({});
  }
}
