import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserService } from '@/lib/di/setup'
import { handleError } from '@/lib/middleware/errorHandler'
import { registerSchema } from '@/lib/validation/bookingSchemas'
import { corsHeaders } from '@/lib/middleware/cors'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== /api/auth/register REQUEST ===')
    console.log('Body received:', body)
    
    const validatedData = registerSchema.parse(body)
    console.log('Validation passed:', validatedData)

    const userService = getUserService()
    const result = await userService.register(validatedData)

    // Serialize dates to strings
    const response = {
      user: {
        ...result.user,
        createdAt: result.user.createdAt instanceof Date 
          ? result.user.createdAt.toISOString() 
          : result.user.createdAt,
      },
      token: result.token,
    }

    console.log('Registration successful for user:', result.user.email)
    return NextResponse.json(response, { status: 201, headers: corsHeaders() })
  } catch (error) {
    console.error('=== /api/auth/register ERROR ===')
    console.error('Error:', error)
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.issues)
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
