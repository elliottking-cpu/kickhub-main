// src/lib/auth/server-protection.ts - Server-side route protection utilities
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedPermissionSystem } from '@/lib/auth/permissions'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(requiredRoles: string[]) {
  const user = await requireAuth()
  const permissionSystem = new UnifiedPermissionSystem()
  const userPermissions = await permissionSystem.getUserPermissions(user.id)
  
  const hasRequiredRole = userPermissions.roles.some(role => 
    requiredRoles.includes(role.role) && role.isActive
  )

  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user's roles
    const primaryRole = userPermissions.roles[0]?.role
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

  return { user, permissions: userPermissions }
}

export async function requirePermission(
  requiredPermissions: string[],
  resourceType?: string,
  resourceId?: string
) {
  const user = await requireAuth()
  const permissionSystem = new UnifiedPermissionSystem()
  
  for (const permission of requiredPermissions) {
    const hasPermission = await permissionSystem.hasPermission(
      user.id,
      permission,
      resourceType,
      resourceId
    )
    
    if (!hasPermission) {
      redirect('/unauthorized?reason=insufficient_permissions')
    }
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

