/**
 * Supabase Server Configuration
 * 
 * This file configures the Supabase client for server-side operations
 * including API routes, middleware, and server components.
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Create Supabase client for server components
 * 
 * This client is used for:
 * - Server component data fetching
 * - Authentication in server components
 * - Database operations in API routes
 */
export const createClient = async () => {
  // Defensive check for environment variables - graceful handling during build time
  if (!supabaseUrl || !supabaseAnonKey) {
    // During static generation, env vars might not be available - return null gracefully
    // At runtime on Vercel, the environment variables will be available
    console.log('⚠️  Supabase env vars not available during static generation - skipping client creation')
    return null
  }

  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          // Handle both sync and async cookies with proper type casting
          try {
            return (cookieStore as any).getAll()
          } catch (error) {
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              (cookieStore as any).set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create Supabase client for middleware
 * 
 * This client is used specifically in middleware.ts for:
 * - Route protection
 * - Session refresh
 * - Request/response processing
 */
export const createMiddlewareClient = (request: NextRequest) => {
  // Defensive check for environment variables - graceful handling during build time
  if (!supabaseUrl || !supabaseAnonKey) {
    // During static generation, env vars might not be available - return null gracefully
    // At runtime on Vercel, the environment variables will be available
    console.log('⚠️  Supabase env vars not available during static generation - skipping middleware client creation')
    return null
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  return { supabase, supabaseResponse }
}