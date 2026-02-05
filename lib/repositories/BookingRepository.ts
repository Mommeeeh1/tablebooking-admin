import { Booking, BookingStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { IBookingRepository, CreateBookingData } from '@/lib/interfaces/IBookingRepository'

export class BookingRepository implements IBookingRepository {
  async create(data: CreateBookingData): Promise<Booking> {
    return prisma.booking.create({
      data: {
        userId: data.userId,
        date: data.date,
        time: data.time,
        numberOfPeople: data.numberOfPeople,
        status: 'PENDING',
      },
    })
  }

  async findById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAll(): Promise<Booking[]> {
    return prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAllWithUser(): Promise<(Booking & { user: { id: string; email: string } })[]> {
    return prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { status },
    })
  }

  async findByIdWithUser(id: string): Promise<Booking & { user: { id: string; email: string } } | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
  }
}
