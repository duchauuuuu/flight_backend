import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel
      .find()
      .populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('bookingId')
      .exec();
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId })
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId, isRead: false })
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }

  async markAsRead(id: string): Promise<Notification> {
    const updated = await this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .populate('userId', 'name email')
      .populate('bookingId')
      .exec();
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const updated = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .populate('userId', 'name email')
      .populate('bookingId')
      .exec();
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async delete(id: string): Promise<Notification> {
    const deleted = await this.notificationModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Notification not found');
    return deleted;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId });
  }
}
