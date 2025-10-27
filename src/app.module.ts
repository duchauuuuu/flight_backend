import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsModule } from './modules/flights/flights.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentTransactionsModule } from './modules/payment-transactions/payment-transactions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AirportsModule } from './modules/airports/airports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    AuthModule,
    FlightsModule,
    UsersModule,
    BookingsModule,
    PaymentTransactionsModule,
    CommentsModule,
    AirportsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
