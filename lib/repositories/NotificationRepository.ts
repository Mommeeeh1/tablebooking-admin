import { Notification } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { INotificationRepository, CreateNotificationData } from '@/lib/interfaces/INotificationRepository'

export class NotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationData): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        bookingId: data.bookingId,
        type: data.type,
        message: data.message,
      },
    })
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  }
}
