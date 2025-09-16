// components/providers/RBACProvider.tsx - RBAC context provider (Build Guide Step 2.3)
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/roles'

interface RBACContextType {
  userRoles: UserRole[]
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  isLoading: boolean
}

const RBACContext = createContext<RBACContextType | undefined>(undefined)

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // TODO: Replace with actual database role lookup in Step 3.1
      const email = user.email || ''
      const roles: UserRole[] = []
      
      if (email.includes('coach')) roles.push('coach')
      if (email.includes('parent')) roles.push('parent')
      if (email.includes('admin')) roles.push('admin')
      
      if (roles.length === 0) roles.push('coach') // Default
      
      setUserRoles(roles)
    }
    setIsLoading(false)
  }, [user])

  const hasRole = (role: UserRole) => userRoles.includes(role)
  
  const hasPermission = (permission: string) => {
    // Simplified permission check
    return userRoles.includes('admin') || userRoles.includes('coach')
  }

  return (
    <RBACContext.Provider value={{ userRoles, hasRole, hasPermission, isLoading }}>
      {children}
    </RBACContext.Provider>
  )
}

export function useRBAC() {
  const context = useContext(RBACContext)
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider')
  }
  return context
}