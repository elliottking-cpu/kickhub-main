// middleware.ts - Next.js 14 middleware for authentication and RBAC (Build Guide Step 2.3)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 14 Middleware for Authentication and RBAC
 * 
 * This middleware handles:
 * - Session refresh for authenticated users
 * - Route protection based on user roles
 * - Redirection to appropriate dashboards
 * - Public route access control
 * 
 * Per Build Guide Step 2.3: Complete RBAC implementation with middleware
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register/coach',
    '/register/referee',
    '/forgot-password',
    '/reset-password',
    '/help',
    '/privacy',
    '/terms',
    '/api/health',
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/public'))

  // Allow access to public routes
  if (isPublicRoute) {
    return res
  }

  // Redirect to login if not authenticated
  if (!session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-based route protection
  const user = session.user
  const email = user.email || ''

  // TODO: Replace with actual database role lookup when schema is implemented in Step 3.1
  // For now, using email-based role detection for development
  const userRoles = getUserRolesFromEmail(email)

  // Route-to-role mapping
  const routeAccess = {
    '/coach': ['coach', 'assistant_coach', 'admin', 'super_admin'],
    '/parent': ['parent', 'coach', 'assistant_coach', 'admin', 'super_admin'],
    '/player': ['player', 'parent', 'coach', 'assistant_coach', 'admin', 'super_admin'],
    '/referee': ['referee', 'admin', 'super_admin'],
    '/fan': ['fan', 'admin', 'super_admin'],
    '/club': ['club_official', 'admin', 'super_admin'],
  }

  // Check route access
  for (const [route, allowedRoles] of Object.entries(routeAccess)) {
    if (pathname.startsWith(route)) {
      const hasAccess = userRoles.some(role => allowedRoles.includes(role))
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      
      break
    }
  }

  return res
}

/**
 * Temporary function to determine user roles from email
 * TODO: Replace with actual database lookup in Step 3.1
 */
function getUserRolesFromEmail(email: string): string[] {
  const roles: string[] = []

  // Admin detection
  if (email.includes('admin') || email.includes('kickhub.com')) {
    roles.push('admin')
  }

  // Role detection based on email patterns
  if (email.includes('coach')) {
    roles.push('coach')
  }
  if (email.includes('parent')) {
    roles.push('parent')
  }
  if (email.includes('player')) {
    roles.push('player')
  }
  if (email.includes('referee')) {
    roles.push('referee')
  }
  if (email.includes('fan')) {
    roles.push('fan')
  }

  // Default role assignment if no specific role detected
  if (roles.length === 0) {
    // Default to coach for development
    roles.push('coach')
  }

  return roles
}

/**
 * Middleware configuration
 * 
 * Specifies which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}