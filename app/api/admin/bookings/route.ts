import { NextRequest, NextResponse } from 'next/server'
import { getBookingService } from '@/lib/di/setup'
import { getAdminUser } from '@/lib/middleware/auth'
import { handleError } from '@/lib/middleware/errorHandler'

export async function GET(request: NextRequest) {
  try {
    getAdminUser(request)
    
    const bookingService = getBookingService()
    const bookings = await bookingService.getAllBookings()
    
    return NextResponse.json(bookings)
  } catch (error) {
    return handleError(error)
  }
}
