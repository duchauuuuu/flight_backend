import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SearchHistoryDocument = HydratedDocument<SearchHistory>;

@Schema({ timestamps: true, _id: false })
export class SearchHistory {
  @Prop({ type: String })
  _id?: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  from: string; // Airport code (e.g., 'SGN')

  @Prop({ required: true })
  to: string; // Airport code (e.g., 'HAN')

  @Prop({ required: true })
  fromCity: string; // Full city name (e.g., 'Thành phố Hồ Chí Minh')

  @Prop({ required: true })
  toCity: string; // Full city name (e.g., 'Hà Nội')

  @Prop({ required: true })
  departDate: string; // Date in display format (e.g., '29 Thg 10, 2025')

  @Prop({ required: false })
  returnDate?: string; // Optional return date for round-trip

  @Prop({ required: true, default: 'round' })
  tripType: string; // 'round', 'oneway', 'multicity'

  @Prop({ required: true, default: 1 })
  passengers: number;

  @Prop({ required: true, default: 'Phổ thông' })
  seatClass: string; // 'Phổ thông', 'Phổ thông cao cấp', 'Thương gia', 'Hạng nhất'
}

export const SearchHistorySchema = SchemaFactory.createForClass(SearchHistory);

SearchHistorySchema.pre('save', function (next) {
  if (!this._id) {
    this._id = new Types.ObjectId().toString();
  }
  next();
});

