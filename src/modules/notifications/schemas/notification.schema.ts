import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, _id: false })
export class Notification {
  @Prop({ type: String })
  _id?: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'booking' })
  type: string; // 'booking' | 'payment' | 'promotion' | 'system'

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: String, ref: 'Booking' })
  bookingId?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.pre('save', function (next) {
  if (!this._id)
    this._id = new (require('mongoose').Types.ObjectId)().toString();
  next();
});
