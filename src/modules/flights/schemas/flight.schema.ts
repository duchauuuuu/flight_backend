import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FlightDocument = HydratedDocument<Flight>;

@Schema({ timestamps: true, _id: false })
export class Flight {
  @Prop({ type: String })
  _id?: string;

  @Prop({ required: true, unique: true })
  flightNumber: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  departure: Date;

  @Prop({ required: true })
  arrival: Date;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 0 })
  stops: number;

  @Prop({ required: true })
  airline: string;

  @Prop({ type: [String], default: ['Economy','Premium Economy','Business','First'] })
  availableCabins: string[];

  @Prop({ type: Object, default: { Economy: 100, 'Premium Economy': 50, Business: 20, First: 10 } })
  seatsAvailable: Record<string, number>; // theo cabin class
}

export const FlightSchema = SchemaFactory.createForClass(Flight);

FlightSchema.pre('save', function (next) {
  if (!this._id) this._id = new (require('mongoose').Types.ObjectId)().toString();
  next();
});
