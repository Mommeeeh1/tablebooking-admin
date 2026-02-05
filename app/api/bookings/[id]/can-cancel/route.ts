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
    const result = await bookingService.canCancelBooking(bookingId)
    
    return NextResponse.json(result, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}
