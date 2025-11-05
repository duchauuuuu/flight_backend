import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Airport, AirportSchema } from '../airports/schemas/airport.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Flight, FlightSchema } from '../flights/schemas/flight.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Comment, CommentSchema } from '../comments/schemas/comment.schema';
import {
  Notification,
  NotificationSchema,
} from '../notifications/schemas/notification.schema';
import {
  PaymentTransaction,
  PaymentTransactionSchema,
} from '../payment-transactions/schemas/payment-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Airport.name, schema: AirportSchema },
      { name: User.name, schema: UserSchema },
      { name: Flight.name, schema: FlightSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

