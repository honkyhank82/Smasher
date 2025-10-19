import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.notificationService.getUserNotifications(req.user.userId, limitNum);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') notificationId: string) {
    await this.notificationService.markAsRead(notificationId);
    return { message: 'Notification marked as read' };
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.userId);
    return { message: 'All notifications marked as read' };
  }
}
