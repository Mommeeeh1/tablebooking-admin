import { NextResponse } from 'next/server'

// Open CORS — allows the mobile app (different origin) to call the API
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function withCors(response: NextResponse) {
  const headers = corsHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
