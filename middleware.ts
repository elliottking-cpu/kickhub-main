// middleware.ts - Minimal Edge Runtime compatible middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Just log and pass through - no complex logic
  console.log(`🎯 WORKING MIDDLEWARE: ${request.nextUrl.pathname}`)
  
  return NextResponse.next()
}

// Start with no matcher - run on all routes for now
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}