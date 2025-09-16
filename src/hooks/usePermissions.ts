// hooks/usePermissions.ts - Permissions hook
'use client'

import { useRBAC } from '@/components/providers/RBACProvider'
import type { UserRole } from '@/types/roles'

export function usePermissions() {
  const { userRoles, hasRole, hasPermission } = useRBAC()

  const canAccessRoute = (route: string): boolean => {
    const routePermissions: Record<string, UserRole[]> = {
      '/coach': ['coach', 'assistant_coach', 'admin'],
      '/parent': ['parent', 'coach', 'assistant_coach', 'admin'],
      '/player': ['player', 'parent', 'coach', 'admin'],
      '/referee': ['referee', 'admin'],
      '/fan': ['fan', 'admin'],
      '/club': ['club_official', 'admin'],
    }

    for (const [routePrefix, allowedRoles] of Object.entries(routePermissions)) {
      if (route.startsWith(routePrefix)) {
        return allowedRoles.some(role => hasRole(role))
      }
    }

    return false
  }

  return {
    userRoles,
    hasRole,
    hasPermission,
    canAccessRoute,
  }
}