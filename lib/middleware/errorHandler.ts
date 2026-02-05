import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Maps thrown errors to JSON responses; AppError carries its own status code
export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Check if error has a statusCode property (for compatibility)
    const statusCode = (error as any).statusCode || 500
    return NextResponse.json(
      { error: error.message },
      { status: statusCode }
    )
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}
