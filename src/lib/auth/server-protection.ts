// src/lib/auth/server-protection.ts - Server-side route protection utilities
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedPermissionSystem } from '@/lib/auth/permissions'

export async function requireAuth() {
  const supabase = await createClient()
  
  // Handle case where supabase client is null during build time
  if (!supabase) {
    // During build time, skip auth requirement
    console.log('Auth requirement skipped during build time')
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(requiredRoles: string[]) {
  const user = await requireAuth()
  
  // This would fetch user roles from database in real implementation
  const userRoles = ['parent'] // Mock data - replace with actual database query
  
  const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role))

  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user's primary role
    const primaryRole = userRoles[0]
    switch (primaryRole) {
      case 'coach':
      case 'assistant_coach':
        redirect('/coach/dashboard?message=insufficient_permissions')
      case 'parent':
        redirect('/parent/dashboard?message=insufficient_permissions')
      case 'player':
        redirect('/player/dashboard?message=insufficient_permissions')
      case 'fan':
        redirect('/fan/dashboard?message=insufficient_permissions')
      case 'referee':
        redirect('/referee/dashboard?message=insufficient_permissions')
      default:
        redirect('/profile/setup')
    }
  }

  return { user, roles: userRoles }
}

export async function requirePermission(
  resource: string,
  action: string,
  context?: Record<string, any>
) {
  const user = await requireAuth()
  
  // This would fetch user roles and context from database in real implementation
  const userRoles = ['parent'] // Mock data
  const permissionSystem = new UnifiedPermissionSystem({
    userId: user.id,
    roles: userRoles
  })
  
  const hasPermission = permissionSystem.hasPermission(resource, action, context)
  
  if (!hasPermission) {
    redirect('/unauthorized?reason=insufficient_permissions')
  }

  return user
}

// Usage in server components and API routes
export async function getServerSideProps(context: any) {
  try {
    const user = await requireRole(['coach', 'assistant_coach'])
    
    return {
      props: {
        user,
        // Other props
      }
    }
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }
}

