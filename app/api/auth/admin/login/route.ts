import { NextRequest, NextResponse } from 'next/server'
import { getUserService } from '@/lib/di/setup'
import { handleError } from '@/lib/middleware/errorHandler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    const userService = getUserService()
    const token = await userService.adminLogin(email, password)
    
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Admin login error:', error)
    return handleError(error)
  }
}
