import { INotificationRepository } from '@/lib/interfaces/INotificationRepository'
import { getNotificationRepository } from '@/lib/di/setup'
import { NotificationResponseDto } from '@/lib/dtos/NotificationDto'

export class NotificationService {
  private notificationRepository: INotificationRepository

  constructor(notificationRepository?: INotificationRepository) {
    this.notificationRepository = notificationRepository || getNotificationRepository()
  }

  async getUserNotifications(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepository.findByUserId(userId)
    return notifications.map((notification) => this.toNotificationDto(notification))
  }

  // Verifies ownership: only the notification's owner can mark it as read
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponseDto> {
    const notifications = await this.notificationRepository.findByUserId(userId)
    const notification = notifications.find((n) => n.id === notificationId)
    
    if (!notification) {
      throw new Error('Notification not found or unauthorized')
    }

    const updated = await this.notificationRepository.markAsRead(notificationId)
    return this.toNotificationDto(updated)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId)
  }

  private toNotificationDto(notification: {
    id: string
    userId: string
    bookingId: string | null
    type: string
    message: string
    read: boolean
    createdAt: Date
  }): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      bookingId: notification.bookingId,
      type: notification.type as any,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    }
  }
}
