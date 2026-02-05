import { BookingStatus } from '@prisma/client'
import { IBookingRepository } from '@/lib/interfaces/IBookingRepository'
import { INotificationRepository } from '@/lib/interfaces/INotificationRepository'
import { getBookingRepository, getNotificationRepository } from '@/lib/di/setup'
import { CreateBookingDto, BookingResponseDto, BookingWithUserDto } from '@/lib/dtos/BookingDto'
import { AppError } from '@/lib/middleware/errorHandler'

export class BookingService {
  private bookingRepository: IBookingRepository
  private notificationRepository: INotificationRepository

  // Optional params enable constructor injection for testing; defaults resolve from DI container
  constructor(
    bookingRepository?: IBookingRepository,
    notificationRepository?: INotificationRepository
  ) {
    this.bookingRepository = bookingRepository || getBookingRepository()
    this.notificationRepository = notificationRepository || getNotificationRepository()
  }

  async createBooking(userId: string, data: CreateBookingDto): Promise<BookingResponseDto> {
    const bookingDate = new Date(data.date)
    const now = new Date()

    if (bookingDate < now) {
      throw new Error('Booking date must be in the future')
    }

    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
      throw new Error('Invalid time format. Use HH:mm (e.g., 18:00)')
    }

    if (data.numberOfPeople < 1) {
      throw new Error('Number of people must be at least 1')
    }

    const booking = await this.bookingRepository.create({
      userId,
      date: bookingDate,
      time: data.time,
      numberOfPeople: data.numberOfPeople,
    })

    return this.toBookingDto(booking)
  }

  async getUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findByUserId(userId)
    return bookings.map((booking) => this.toBookingDto(booking))
  }

  async getAllBookings(): Promise<BookingWithUserDto[]> {
    const bookings = await this.bookingRepository.findAllWithUser()
    
    return bookings.map((booking) => ({
      ...this.toBookingDto(booking),
      user: booking.user,
    }))
  }

  async getBookingById(id: string): Promise<BookingWithUserDto | null> {
    const booking = await this.bookingRepository.findByIdWithUser(id)
    if (!booking) {
      return null
    }

    return {
      ...this.toBookingDto(booking),
      user: booking.user,
    }
  }

  async canCancelBooking(bookingId: string): Promise<{ canCancel: boolean; reason?: string }> {
    const booking = await this.bookingRepository.findById(bookingId)
    
    if (!booking) {
      return { canCancel: false, reason: 'Booking not found' }
    }

    // Rule 1: Booking must be PENDING or APPROVED
    if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
      return { 
        canCancel: false, 
        reason: `Booking status does not allow cancellation. Only PENDING or APPROVED bookings can be cancelled. Current status: ${booking.status}` 
      }
    }

    // Rule 2: There must be more than 24 hours remaining before the booking start time
    const now = new Date()
    const bookingDate = new Date(booking.date)
    
    // Parse the time string (HH:mm) and add it to the booking date
    const [hours, minutes] = booking.time.split(':').map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)
    
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking <= 24) {
      if (hoursUntilBooking <= 0) {
        return { 
          canCancel: false, 
          reason: 'Cannot cancel booking. The booking time has already passed.' 
        }
      }
      const hoursRemaining = Math.ceil(hoursUntilBooking)
      return { 
        canCancel: false, 
        reason: `Cannot cancel within 24 hours of the booking start time. There are ${hoursRemaining} hour(s) remaining until the booking.` 
      }
    }

    return { canCancel: true }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId)
    
    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    if (booking.userId !== userId) {
      throw new AppError('Unauthorized: You can only cancel your own bookings', 403)
    }

    const { canCancel, reason } = await this.canCancelBooking(bookingId)
    if (!canCancel) {
      // Use 400 for business rule violations (status or time restrictions)
      throw new AppError(reason || 'Cannot cancel this booking', 400)
    }

    const updatedBooking = await this.bookingRepository.updateStatus(bookingId, 'CANCELLED')
    
    return this.toBookingDto(updatedBooking)
  }

  async approveBooking(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId)
    
    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== 'PENDING') {
      throw new Error(`Cannot approve booking with status: ${booking.status}`)
    }

    const updatedBooking = await this.bookingRepository.updateStatus(bookingId, 'APPROVED')

    // Side effect: create in-app notification so the user sees the decision in the mobile app
    const message = `Your booking on ${booking.date.toLocaleDateString()} at ${booking.time} has been approved!`
    
    await this.notificationRepository.create({
      userId: booking.userId,
      bookingId: booking.id,
      type: 'BOOKING_APPROVED',
      message,
    })

    return this.toBookingDto(updatedBooking)
  }

  async rejectBooking(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId)
    
    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== 'PENDING') {
      throw new Error(`Cannot reject booking with status: ${booking.status}`)
    }

    const updatedBooking = await this.bookingRepository.updateStatus(bookingId, 'REJECTED')

    // Side effect: create in-app notification for the user
    const message = `Your booking on ${booking.date.toLocaleDateString()} at ${booking.time} has been rejected.`
    
    await this.notificationRepository.create({
      userId: booking.userId,
      bookingId: booking.id,
      type: 'BOOKING_REJECTED',
      message,
    })

    return this.toBookingDto(updatedBooking)
  }

  private toBookingDto(booking: {
    id: string
    userId: string
    date: Date
    time: string
    numberOfPeople: number
    status: BookingStatus
    createdAt: Date
    updatedAt: Date
  }): BookingResponseDto {
    return {
      id: booking.id,
      userId: booking.userId,
      date: booking.date,
      time: booking.time,
      numberOfPeople: booking.numberOfPeople,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }
  }
}
