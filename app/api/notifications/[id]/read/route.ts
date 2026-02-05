import { NextRequest, NextResponse } from 'next/server'
import { getNotificationService } from '@/lib/di/setup'
import { getAuthenticatedUser } from '@/lib/middleware/auth'
import { handleError } from '@/lib/middleware/errorHandler'
import { corsHeaders } from '@/lib/middleware/cors'

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthenticatedUser(request)
    const { id } = await params
    const notificationId = id
    
    const notificationService = getNotificationService()
    const notification = await notificationService.markAsRead(notificationId, userId)
    
    return NextResponse.json(notification, { headers: corsHeaders() })
  } catch (error) {
    const errorResponse = handleError(error)
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })
    return errorResponse
  }
}
