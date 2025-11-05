import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, _id: false })
export class User {
  @Prop({ type: String })
  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  dob: string;

  @Prop({ default: '' })
  gender: string;

  @Prop({ default: '', select: false })
  password: string;

  @Prop({ default: '', select: false })
  refreshToken?: string;

  @Prop({ default: 0 })
  points?: number;

  @Prop({ default: 'Customer' })
  role?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Tạo _id tự động nếu không được cung cấp
UserSchema.pre('save', function (next) {
  if (!this._id) {
    this._id = new Types.ObjectId().toString();
  }
  next();
});
