import { Booking, BookingStatus } from '@prisma/client'

export interface CreateBookingData {
  userId: string
  date: Date
  time: string
  numberOfPeople: number
}

export interface IBookingRepository {
  create(data: CreateBookingData): Promise<Booking>
  findById(id: string): Promise<Booking | null>
  findByUserId(userId: string): Promise<Booking[]>
  findAll(): Promise<Booking[]>
  findAllWithUser(): Promise<(Booking & { user: { id: string; email: string } })[]>
  updateStatus(id: string, status: BookingStatus): Promise<Booking>
  findByIdWithUser(id: string): Promise<Booking & { user: { id: string; email: string } } | null>
}
