import {
  Controller, Get, Post, Put, Delete,
  Param, Query, ParseUUIDPipe, ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UserId } from '@shared/decorators';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  findAll(
    @UserId() userId: string,
    @Query('unreadOnly', new ParseBoolPipe({ optional: true })) unreadOnly?: boolean,
  ) {
    return this.service.findAll(userId, unreadOnly);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@UserId() userId: string) {
    return this.service.getUnreadCount(userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.markAsRead(userId, id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@UserId() userId: string) {
    return this.service.markAllRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(userId, id);
  }
}
