import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true, _id: false })
export class Comment {
  @Prop({ type: String })
  _id?: string;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, ref: 'Flight', required: true })
  flightId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // 1-5 sao
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.pre('save', function (next) {
  if (!this._id)
    this._id = new (require('mongoose').Types.ObjectId)().toString();
  next();
});
