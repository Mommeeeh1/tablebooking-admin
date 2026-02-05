import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getBookingService } from '@/lib/di/setup'
import { getAuthenticatedUser } from '@/lib/middleware/auth'
import { handleError } from '@/lib/middleware/errorHandler'
import { createBookingSchema } from '@/lib/validation/bookingSchemas'
import { corsHeaders } from '@/lib/middleware/cors'

// CORS preflight handler for cross-origin requests from the mobile app
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUser(request)
    const body = await request.json()
    
    const validatedData = createBookingSchema.parse(body)
    
    const bookingService = getBookingService()
    const booking = await bookingService.createBooking(userId, validatedData)
    
    return NextResponse.json(booking, { status: 201, headers: corsHeaders() })
  } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.issues },
          { status: 400, headers: corsHeaders() }
        )
      }
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUser(request)
    
    const bookingService = getBookingService()
    const bookings = await bookingService.getUserBookings(userId)
    
    return NextResponse.json(bookings, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}
