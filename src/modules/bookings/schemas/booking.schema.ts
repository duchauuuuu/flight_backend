import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ _id: false })
export class Traveller {
  @Prop({ required: true })
  type: string; // Adult, Child, Infant

  @Prop({ required: true })
  name: string;
}

const TravellerSchema = SchemaFactory.createForClass(Traveller);

@Schema({ _id: false })
export class ContactDetails {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;
}

const ContactDetailsSchema = SchemaFactory.createForClass(ContactDetails);

@Schema({ _id: false })
export class Payment {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  paidAt: Date;
}

const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema({ timestamps: true, _id: false })
export class Booking {
  @Prop({ type: String })
  _id?: string;

  @Prop({ required: true, unique: true, default: () => generatePNR() })
  bookingCode: string; // PNR/Mã đặt chỗ chính thức

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ type: [String], ref: 'Flight', required: true })
  flightIds: string[];

  @Prop({ required: true })
  tripType: string; // One-way, Round-trip, Multi-city

  @Prop({ type: Object, required: true })
  travellerCounts: { adults: number; children: number; infants: number }; // khi search

  @Prop({ type: [TravellerSchema] })
  travellers?: Traveller[]; // chỉ nhập sau khi chọn flight

  @Prop({ type: ContactDetailsSchema })
  contactDetails?: ContactDetails; // sau khi chọn flight

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ type: PaymentSchema })
  payment?: Payment; // sau khi thanh toán

  @Prop({ required: true })
  cabinClass: string; // cabin class đã chọn
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.pre('save', function (next) {
  if (!this._id) {
    this._id = new Types.ObjectId().toString();
  }
  next();
});

function generatePNR(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
