// middleware.ts - Explicit Edge Runtime compatible middleware
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Most basic possible middleware - just pass through
  console.log(`🚀 EDGE MIDDLEWARE: ${request.nextUrl.pathname}`)
  
  return NextResponse.next()
}

// Minimal matcher
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}