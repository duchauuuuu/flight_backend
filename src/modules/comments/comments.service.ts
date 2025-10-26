import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = new this.commentModel(createCommentDto);
    return comment.save();
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel
      .find()
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber from to airline')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber from to airline')
      .exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async findByFlightId(flightId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ flightId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ userId })
      .populate('flightId', 'flightNumber from to airline')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAverageRating(flightId: string): Promise<number> {
    const result = await this.commentModel.aggregate([
      { $match: { flightId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? result[0].avgRating : 0;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber from to airline')
      .exec();
    if (!updated) throw new NotFoundException('Comment not found');
    return updated;
  }

  async delete(id: string): Promise<Comment> {
    const deleted = await this.commentModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Comment not found');
    return deleted;
  }
}
