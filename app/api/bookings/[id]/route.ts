import { NextRequest, NextResponse } from 'next/server'
import { getBookingService } from '@/lib/di/setup'
import { getAuthenticatedUser } from '@/lib/middleware/auth'
import { handleError } from '@/lib/middleware/errorHandler'
import { corsHeaders } from '@/lib/middleware/cors'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthenticatedUser(request)
    const { id } = await params
    const bookingId = id
    
    const bookingService = getBookingService()
    const booking = await bookingService.getBookingById(bookingId)
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404, headers: corsHeaders() })
    }
    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders() })
    }
    return NextResponse.json(booking, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}

// DELETE = cancel booking (enforces 24h rule and ownership in service layer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthenticatedUser(request)
    const { id } = await params
    const bookingId = id
    
    const bookingService = getBookingService()
    const booking = await bookingService.cancelBooking(bookingId, userId)
    
    return NextResponse.json(booking, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}
