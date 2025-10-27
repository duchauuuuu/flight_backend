import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Notification[]> {
    if (userId) {
      return this.notificationsService.findByUserId(userId);
    }
    return this.notificationsService.findAll();
  }

  @Get('user/:userId/unread')
  findUnreadByUserId(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUserId(userId);
  }

  @Get('user/:userId/unread-count')
  countUnreadByUserId(@Param('userId') userId: string): Promise<number> {
    return this.notificationsService.countUnreadByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findById(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string): Promise<void> {
    return this.notificationsService.markAllAsReadByUserId(userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.delete(id);
  }

  @Delete('user/:userId/all')
  async deleteAllByUserId(@Param('userId') userId: string): Promise<void> {
    return this.notificationsService.deleteAllByUserId(userId);
  }
}
