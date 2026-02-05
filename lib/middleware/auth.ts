import { NextRequest } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt'
import { AppError } from './errorHandler'

// Extracts userId from JWT — used by all user-facing API routes
export function getAuthenticatedUser(request: NextRequest): string {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw new AppError('Authentication required', 401)
  }

  try {
    const payload = verifyToken(token)
    return payload.userId
  } catch (error) {
    throw new AppError('Invalid or expired token', 401)
  }
}

// Verifies JWT contains admin role — used by admin-only API routes
export function getAdminUser(request: NextRequest): void {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw new AppError('Authentication required', 401)
  }

  try {
    const payload = verifyToken(token)
    if (payload.role !== 'admin') {
      throw new AppError('Admin access required', 403)
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Invalid or expired token', 401)
  }
}
