import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentTransactionDocument =
  HydratedDocument<PaymentTransaction>;

@Schema({ timestamps: true, _id: false })
export class PaymentTransaction {
  @Prop({ type: String })
  _id?: string;

  @Prop({ type: String, ref: 'Booking', required: true })
  bookingId: string;

  @Prop({ required: true })
  provider: string; // "SePay"

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string; // "VND"

  @Prop({ required: true })
  status: string; // "pending" | "success" | "failed"

  @Prop({ required: true })
  transactionCode: string; // mã định danh mà người dùng phải chuyển kèm (VD: "SEP123ABC")

  @Prop()
  bankName?: string; // Vietcombank, MBBank,...

  @Prop()
  bankAccount?: string; // số tài khoản nhận

  @Prop()
  bankAccountName?: string; // tên người nhận tiền

  @Prop()
  paidAt?: Date; // thời gian SePay xác nhận thanh toán

  @Prop({ type: Object })
  webhookRawData?: Record<string, any>; // dữ liệu gốc SePay gửi về
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(
  PaymentTransaction,
);

PaymentTransactionSchema.pre('save', function (next) {
  if (!this._id)
    this._id = new (require('mongoose').Types.ObjectId)().toString();
  next();
});
