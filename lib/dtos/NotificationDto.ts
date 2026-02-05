import { NotificationType } from '@prisma/client'

export interface NotificationResponseDto {
  id: string
  userId: string
  bookingId: string | null
  type: NotificationType
  message: string
  read: boolean
  createdAt: Date
}
