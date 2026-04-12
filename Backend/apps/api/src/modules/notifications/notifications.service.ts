import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: { ...dto, userId },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}
