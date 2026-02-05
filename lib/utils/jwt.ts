import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  role?: string
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remove "Bearer " prefix
}
