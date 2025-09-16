// middleware.ts - Enhanced route protection middleware (Build Guide Step 4.4)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { RouteProtectionCache } from '@/lib/auth/performance-cache'
import { CSRFProtection, withCSRFProtection } from '@/lib/security/csrf-protection'
import { RateLimiter } from '@/lib/security/rate-limiting'
import { SecurityAuditLogger } from '@/lib/security/audit-logging'

// Define route protection rules
const ROUTE_PROTECTION_RULES = {
  // Public routes (no authentication required)
  public: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ],
  
  // Authentication required but no specific role
  authenticated: [
    '/profile',
    '/settings',
    '/notifications'
  ],
  
  // Role-specific routes
  roleSpecific: {
    coach: [
      '/coach',
      '/coach/dashboard',
      '/coach/team',
      '/coach/matches',
      '/coach/training',
      '/coach/finances',
      '/coach/players',
      '/coach/reports'
    ],
    parent: [
      '/parent',
      '/parent/dashboard',
      '/parent/children',
      '/parent/payments',
      '/parent/schedule'
    ],
    player: [
      '/player',
      '/player/dashboard',
      '/player/stats',
      '/player/character',
      '/player/achievements'
    ],
    fan: [
      '/fan',
      '/fan/dashboard',
      '/fan/matches',
      '/fan/merchandise'
    ],
    referee: [
      '/referee',
      '/referee/dashboard',
      '/referee/matches',
      '/referee/availability',
      '/referee/payments'
    ]
  },
  
  // Multi-role routes (accessible by multiple roles)
  multiRole: {
    '/team/[teamId]': ['coach', 'assistant_coach', 'parent', 'player'],
    '/match/[matchId]': ['coach', 'assistant_coach', 'parent', 'player', 'fan', 'referee'],
    '/training/[sessionId]': ['coach', 'assistant_coach', 'parent', 'player'],
    '/messages': ['coach', 'assistant_coach', 'parent'],
    '/calendar': ['coach', 'assistant_coach', 'parent', 'player']
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const method = request.method
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Rate limiting check first
  const rateLimitResult = RateLimiter.checkMiddlewareLimit(request)
  if (!rateLimitResult.success) {
    await SecurityAuditLogger.logRateLimitExceeded({
      ip,
      userAgent,
      path: pathname + search,
      method,
      limit: rateLimitResult.limit,
      attempts: rateLimitResult.limit + 1
    })
    
    const response = NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
    RateLimiter.addHeaders(response.headers, rateLimitResult)
    return response
  }
  
  // Update session first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Skip protection for public routes
  if (isPublicRoute(pathname)) {
    // Still apply CSRF protection to public routes with forms
    return withCSRFProtection(request, response)
  }
  
  // Apply CSRF protection
  response = withCSRFProtection(request, response)
  if (response.status === 403) {
    await SecurityAuditLogger.logCSRFViolation({
      ip,
      userAgent,
      path: pathname + search,
      method
    })
    return response
  }
  
  // Get user session and roles with caching
  const { user, roles, error } = await getUserWithRoles(supabase)
  
  // Handle authentication errors
  if (error) {
    console.error('Middleware auth error:', error)
    return redirectToLogin(request)
  }
  
  // Redirect unauthenticated users
  if (!user) {
    return redirectToLogin(request)
  }
  
  // Check cached route access first
  const cacheKey = RouteProtectionCache.generateRouteCacheKey(user.id, pathname, roles)
  const cachedAccess = RouteProtectionCache.getCachedRouteAccess(cacheKey)
  
  let accessResult
  if (cachedAccess !== null) {
    accessResult = { hasAccess: cachedAccess, accessType: 'cached' as const }
  } else {
    // Check route access permissions and cache result
    accessResult = checkRouteAccess(pathname, roles)
    RouteProtectionCache.setCachedRouteAccess(cacheKey, accessResult.hasAccess)
  }
  
  if (!accessResult.hasAccess) {
    // Log unauthorized access attempt
    await SecurityAuditLogger.logUnauthorizedAccess({
      userId: user?.id,
      ip,
      userAgent,
      path: pathname + search,
      method,
      requiredRoles: accessResult.requiredRoles,
      userRoles: roles,
      reason: `Access denied for ${accessResult.accessType} route`
    })
    
    return handleUnauthorizedAccess(request, user, roles, accessResult)
  }
  
  // Add user context to headers for pages
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-roles', JSON.stringify(roles))
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  return ROUTE_PROTECTION_RULES.public.some(route => {
    if (route === pathname) return true
    // Handle dynamic routes
    if (route.includes('[') && route.includes(']')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    return false
  })
}

// Get user with roles from request
async function getUserWithRoles(supabase: any): Promise<{
  user: any | null
  roles: string[]
  error: any
}> {
  try {
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { user: null, roles: [], error: userError }
    }

    // Get user roles with caching
    const roles = await RouteProtectionCache.getUserRoles(user.id)
    return { user, roles, error: null }
  } catch (error) {
    return { user: null, roles: [], error }
  }
}

// Check if user has access to route
function checkRouteAccess(pathname: string, userRoles: string[]): {
  hasAccess: boolean
  requiredRoles?: string[]
  accessType: 'public' | 'authenticated' | 'role-specific' | 'multi-role'
  suggestedRedirect?: string
} {
  // Check authenticated routes
  if (ROUTE_PROTECTION_RULES.authenticated.includes(pathname)) {
    return {
      hasAccess: userRoles.length > 0,
      accessType: 'authenticated'
    }
  }

  // Check role-specific routes
  for (const [role, routes] of Object.entries(ROUTE_PROTECTION_RULES.roleSpecific)) {
    if (routes.some(route => matchesRoute(pathname, route))) {
      const hasRole = userRoles.includes(role)
      return {
        hasAccess: hasRole,
        requiredRoles: [role],
        accessType: 'role-specific',
        suggestedRedirect: hasRole ? undefined : getSuggestedRedirect(userRoles)
      }
    }
  }

  // Check multi-role routes
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_PROTECTION_RULES.multiRole)) {
    if (matchesRoute(pathname, routePattern)) {
      const hasAccess = userRoles.some(role => allowedRoles.includes(role))
      return {
        hasAccess,
        requiredRoles: allowedRoles,
        accessType: 'multi-role',
        suggestedRedirect: hasAccess ? undefined : getSuggestedRedirect(userRoles)
      }
    }
  }

  // Default: require authentication
  return {
    hasAccess: userRoles.length > 0,
    accessType: 'authenticated'
  }
}

// Match pathname against route pattern (including dynamic routes)
function matchesRoute(pathname: string, routePattern: string): boolean {
  if (pathname === routePattern) return true
  
  // Handle dynamic routes
  if (routePattern.includes('[') && routePattern.includes(']')) {
    const pattern = routePattern.replace(/\[.*?\]/g, '[^/]+')
    const regex = new RegExp(`^${pattern}$`)
    return regex.test(pathname)
  }
  
  return false
}

// Get suggested redirect based on user roles
function getSuggestedRedirect(userRoles: string[]): string {
  if (userRoles.length === 0) return '/login'
  
  // Redirect to primary role dashboard
  const primaryRole = userRoles[0]
  
  switch (primaryRole) {
    case 'coach':
    case 'assistant_coach':
      return '/coach/dashboard'
    case 'parent':
      return '/parent/dashboard'
    case 'player':
      return '/player/dashboard'
    case 'fan':
      return '/fan/dashboard'
    case 'referee':
      return '/referee/dashboard'
    default:
      return '/profile/setup'
  }
}

// Redirect to login with return URL
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

// Handle unauthorized access
function handleUnauthorizedAccess(
  request: NextRequest,
  user: any,
  userRoles: string[],
  accessResult: any
): NextResponse {
  // If user has roles but not the right ones, redirect to appropriate dashboard
  if (userRoles.length > 0 && accessResult.suggestedRedirect) {
    const redirectUrl = new URL(accessResult.suggestedRedirect, request.url)
    redirectUrl.searchParams.set('message', 'insufficient_permissions')
    return NextResponse.redirect(redirectUrl)
  }
  
  // If no roles, redirect to profile setup
  if (userRoles.length === 0) {
    return NextResponse.redirect(new URL('/profile/setup', request.url))
  }
  
  // Default: redirect to login
  return redirectToLogin(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}