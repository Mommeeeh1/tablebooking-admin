import { Notification, NotificationType } from '@prisma/client'

export interface CreateNotificationData {
  userId: string
  bookingId?: string
  type: NotificationType
  message: string
}

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>
  findByUserId(userId: string): Promise<Notification[]>
  markAsRead(notificationId: string, userId?: string): Promise<Notification>
  markAllAsRead(userId: string): Promise<void>
}
