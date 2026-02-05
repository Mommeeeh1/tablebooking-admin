import { container } from './container'
import { UserRepository } from '@/lib/repositories/UserRepository'
import { BookingRepository } from '@/lib/repositories/BookingRepository'
import { NotificationRepository } from '@/lib/repositories/NotificationRepository'
import { UserService } from '@/lib/services/UserService'
import { BookingService } from '@/lib/services/BookingService'
import { NotificationService } from '@/lib/services/NotificationService'
import { IUserRepository } from '@/lib/interfaces/IUserRepository'
import { IBookingRepository } from '@/lib/interfaces/IBookingRepository'
import { INotificationRepository } from '@/lib/interfaces/INotificationRepository'

// Register repository implementations; services resolve these via constructor defaults
container.register<IUserRepository>('IUserRepository', UserRepository)
container.register<IBookingRepository>('IBookingRepository', BookingRepository)
container.register<INotificationRepository>('INotificationRepository', NotificationRepository)

export const getUserRepository = (): IUserRepository => {
  return container.resolve<IUserRepository>('IUserRepository')
}

export const getBookingRepository = (): IBookingRepository => {
  return container.resolve<IBookingRepository>('IBookingRepository')
}

export const getNotificationRepository = (): INotificationRepository => {
  return container.resolve<INotificationRepository>('INotificationRepository')
}

export const getUserService = (): UserService => {
  return new UserService()
}

export const getBookingService = (): BookingService => {
  return new BookingService()
}

export const getNotificationService = (): NotificationService => {
  return new NotificationService()
}
