import { NextRequest, NextResponse } from 'next/server'
import { getBookingService } from '@/lib/di/setup'
import { getAdminUser } from '@/lib/middleware/auth'
import { handleError } from '@/lib/middleware/errorHandler'
import { corsHeaders } from '@/lib/middleware/cors'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    getAdminUser(request)
    const { id } = await params
    const bookingId = id
    
    const bookingService = getBookingService()
    const booking = await bookingService.rejectBooking(bookingId)
    
    return NextResponse.json(booking, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}
