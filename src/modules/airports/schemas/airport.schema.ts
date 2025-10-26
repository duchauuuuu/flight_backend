import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AirportDocument = HydratedDocument<Airport>;

@Schema({ timestamps: true, _id: false })
export class Airport {
  @Prop({ type: String })
  _id?: string;

  @Prop({ required: true, unique: true })
  code: string; // Ví dụ: SGN, HAN, LAX

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;
}

export const AirportSchema = SchemaFactory.createForClass(Airport);

AirportSchema.pre('save', function (next) {
  if (!this._id)
    this._id = new (require('mongoose').Types.ObjectId)().toString();
  next();
});
