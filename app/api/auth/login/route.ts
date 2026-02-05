import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserService } from '@/lib/di/setup'
import { handleError } from '@/lib/middleware/errorHandler'
import { loginSchema } from '@/lib/validation/bookingSchemas'
import { corsHeaders } from '@/lib/middleware/cors'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== /api/auth/login REQUEST ===')
    console.log('Body received:', body)
    
    const validatedData = loginSchema.parse(body)
    console.log('Validation passed:', validatedData)
    
    const userService = getUserService()
    const result = await userService.login(validatedData)
    
    // Ensure Date objects are ISO strings for JSON serialization
    const response = {
      user: {
        ...result.user,
        createdAt: result.user.createdAt instanceof Date 
          ? result.user.createdAt.toISOString() 
          : result.user.createdAt,
      },
      token: result.token,
    }
    
    console.log('Login successful for user:', result.user.email)
    return NextResponse.json(response, { headers: corsHeaders() })
  } catch (error) {
    console.error('=== /api/auth/login ERROR ===')
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
