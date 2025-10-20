import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, _id: false })
export class User {
  @Prop({ type: String })
  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'Customer' })
  role?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Tạo _id tự động nếu không được cung cấp
UserSchema.pre('save', function (next) {
  if (!this._id) {
    this._id = new (require('mongoose').Types.ObjectId)().toString();
  }
  next();
});
