// middleware.ts - Node.js runtime middleware to fix __dirname issue
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This should now work with Node.js runtime instead of Edge Runtime
  console.log(`🚀 NODE.JS MIDDLEWARE: ${request.nextUrl.pathname}`)
  
  return NextResponse.next()
}

export const config = {
  // Configure middleware to run in Node.js runtime instead of Edge Runtime
  runtime: 'nodejs',
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) 
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}