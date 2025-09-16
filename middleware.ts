// middleware.ts - ULTRA-MINIMAL middleware to isolate __dirname error source
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ABSOLUTE MINIMAL MIDDLEWARE - Just log and pass through
  console.log(`🔍 ULTRA-MINIMAL MIDDLEWARE: ${pathname}`)
  
  return NextResponse.next()
}

// TEMPORARILY REMOVED MATCHER TO ISOLATE __dirname ERROR
// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// }