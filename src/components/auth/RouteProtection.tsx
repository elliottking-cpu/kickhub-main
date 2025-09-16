// src/components/auth/RouteProtection.tsx - Client-side route protection
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

interface RouteProtectionProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  fallbackComponent?: React.ReactNode
  redirectTo?: string
}

export function RouteProtection({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackComponent,
  redirectTo
}: RouteProtectionProps) {
  const { user, loading: authLoading } = useAuth()
  const { hasRole, hasAnyRole, hasPermission, loading: permissionsLoading } = usePermissions()
  const router = useRouter()
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth and permissions to load
      if (authLoading || permissionsLoading) return

      // Check authentication
      if (!user) {
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
        }
        return
      }

      // Check role requirements
      if (requiredRoles.length > 0) {
        const hasRequiredRole = hasAnyRole(requiredRoles)
        if (!hasRequiredRole) {
          handleUnauthorizedAccess()
          return
        }
      }

      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const permissionChecks = await Promise.all(
          requiredPermissions.map(permission => hasPermission(permission))
        )
        
        const hasAllPermissions = permissionChecks.every(Boolean)
        if (!hasAllPermissions) {
          handleUnauthorizedAccess()
          return
        }
      }

      setAccessGranted(true)
    }

    checkAccess()
  }, [user, authLoading, permissionsLoading, requiredRoles, requiredPermissions])

  const handleUnauthorizedAccess = () => {
    if (redirectTo) {
      router.push(redirectTo)
    } else if (fallbackComponent) {
      // Will render fallback component
    } else {
      // Redirect to appropriate dashboard based on user's primary role
      const primaryRole = user?.roles?.[0]?.role
      switch (primaryRole) {
        case 'coach':
        case 'assistant_coach':
          router.push('/coach/dashboard?message=insufficient_permissions')
          break
        case 'parent':
          router.push('/parent/dashboard?message=insufficient_permissions')
          break
        case 'player':
          router.push('/player/dashboard?message=insufficient_permissions')
          break
        case 'fan':
          router.push('/fan/dashboard?message=insufficient_permissions')
          break
        case 'referee':
          router.push('/referee/dashboard?message=insufficient_permissions')
          break
        default:
          router.push('/profile/setup')
      }
    }
  }

  // Show loading state
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show unauthorized fallback
  if (!accessGranted && fallbackComponent) {
    return <>{fallbackComponent}</>
  }

  // Show unauthorized message if no fallback and no redirect
  if (!accessGranted && !redirectTo && !fallbackComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Render protected content
  return accessGranted ? <>{children}</> : null
}

// Higher-order component for route protection
export function withRouteProtection<T extends object>(
  Component: React.ComponentType<T>,
  protectionConfig: Omit<RouteProtectionProps, 'children'>
) {
  return function ProtectedComponent(props: T) {
    return (
      <RouteProtection {...protectionConfig}>
        <Component {...props} />
      </RouteProtection>
    )
  }
}

// Hook for checking route access
export function useRouteAccess(
  requiredRoles: string[] = [],
  requiredPermissions: string[] = []
) {
  const { user, loading: authLoading } = useAuth()
  const { hasAnyRole, hasPermission, loading: permissionsLoading } = usePermissions()
  const [accessState, setAccessState] = useState({
    hasAccess: false,
    loading: true,
    reason: null as string | null
  })

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading || permissionsLoading) {
        setAccessState({ hasAccess: false, loading: true, reason: null })
        return
      }

      if (!user) {
        setAccessState({ hasAccess: false, loading: false, reason: 'not_authenticated' })
        return
      }

      // Check roles
      if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        setAccessState({ hasAccess: false, loading: false, reason: 'insufficient_roles' })
        return
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const permissionChecks = await Promise.all(
          requiredPermissions.map(permission => hasPermission(permission))
        )
        
        if (!permissionChecks.every(Boolean)) {
          setAccessState({ hasAccess: false, loading: false, reason: 'insufficient_permissions' })
          return
        }
      }

      setAccessState({ hasAccess: true, loading: false, reason: null })
    }

    checkAccess()
  }, [user, authLoading, permissionsLoading, requiredRoles, requiredPermissions])

  return accessState
}

