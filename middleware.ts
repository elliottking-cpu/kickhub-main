// MIDDLEWARE TEST: Testing Vercel-Supabase Integration
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    console.log('🧪 MIDDLEWARE TEST: Request received for:', request.nextUrl.pathname)
    
    // Test 1: Check if environment variables are available at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🧪 ENV TEST:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0
    })
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ MISSING ENV VARS AT RUNTIME')
      return new Response('Environment variables not available', { status: 500 })
    }
    
    // Test 2: Test basic response
    const response = NextResponse.next()
    response.headers.set('x-test-middleware', 'working')
    
    console.log('✅ MIDDLEWARE TEST: Basic functionality working')
    return response
    
  } catch (error) {
    console.error('❌ MIDDLEWARE ERROR:', error)
    return new Response(`Middleware Error: ${error.message}`, { status: 500 })
  }
}

// Test configuration  
export const config = {
  matcher: [
    // Test on all routes to verify environment variables
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}