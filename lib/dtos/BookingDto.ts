import { BookingStatus } from '@prisma/client'

export interface CreateBookingDto {
  date: string // ISO date string
  time: string // "HH:mm" format
  numberOfPeople: number
}

export interface BookingResponseDto {
  id: string
  userId: string
  date: Date
  time: string
  numberOfPeople: number
  status: BookingStatus
  createdAt: Date
  updatedAt: Date
}

export interface BookingWithUserDto extends BookingResponseDto {
  user: {
    id: string
    email: string
  }
}

export interface UpdateBookingStatusDto {
  status: BookingStatus
}
