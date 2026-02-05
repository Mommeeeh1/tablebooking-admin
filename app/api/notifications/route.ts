import { NextRequest, NextResponse } from 'next/server'
import { getNotificationService } from '@/lib/di/setup'
import { getAuthenticatedUser } from '@/lib/middleware/auth'
import { handleError } from '@/lib/middleware/errorHandler'
import { corsHeaders } from '@/lib/middleware/cors'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUser(request)
    
    const notificationService = getNotificationService()
    const notifications = await notificationService.getUserNotifications(userId)
    
    return NextResponse.json(notifications, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}
