/**
 * Enhanced Authentication Hook
 * Comprehensive authentication state management with AuthService integration
 * Based on KickHub Build Guide Step 4.1 specifications
 */
'use client'

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { AuthService } from '@/lib/auth/auth-service'
import type { 
  AuthUser, 
  AuthSession, 
  UserRole, 
  Permission,
  UseAuthReturn,
  AuthContextValue
} from '@/lib/auth/types'

// Create Auth Context
const AuthContext = createContext<AuthContextValue | null>(null)

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hook that provides auth functionality
function useProvideAuth(): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = new AuthService()

  // Initialize auth state and set up listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initialize = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const sessionResult = await authService.getCurrentSession()
        
        if (sessionResult.success && sessionResult.data) {
          // Get enhanced user profile
          const userResult = await authService.getEnhancedUserProfile()
          
          if (userResult.success && userResult.data) {
            setUser(userResult.data)
            setSession({
              user: userResult.data,
              session: sessionResult.data,
              expiresAt: sessionResult.data.expires_at || '',
              refreshToken: sessionResult.data.refresh_token || ''
            })
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }

      // Set up auth state change listener
      unsubscribe = authService.createAuthListener(
        async (enhancedUser, supabaseSession) => {
          setUser(enhancedUser)
          
          if (enhancedUser && supabaseSession) {
            setSession({
              user: enhancedUser,
              session: supabaseSession,
              expiresAt: supabaseSession.expires_at?.toString() || '',
              refreshToken: supabaseSession.refresh_token || ''
            })
          } else {
            setSession(null)
          }
          
          setLoading(false)
        }
      )
    }

    initialize()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false
    return user.roles.some(roleAssignment => 
      roleAssignment.role === role && roleAssignment.is_active
    )
  }, [user])

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: Permission, teamId?: string): boolean => {
    if (!user) return false
    
    // Check if user has the permission globally
    if (user.permissions.includes(permission)) {
      // If teamId is specified, check if user has access to that team
      if (teamId) {
        return user.activeTeams.includes(teamId)
      }
      return true
    }
    
    return false
  }, [user])

  // Check if user can pay subs for a specific child
  const canPaySubsForChild = useCallback((childId: string): boolean => {
    if (!user) return false
    return user.canPaySubsFor.includes(childId)
  }, [user])

  // Sign out user
  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const result = await authService.refreshSession()
      if (result.success && result.data) {
        // Get updated user profile
        const userResult = await authService.getEnhancedUserProfile()
        if (userResult.success && userResult.data) {
          setUser(userResult.data)
          setSession(prev => prev ? {
            ...prev,
            session: result.data,
            expiresAt: result.data.expires_at?.toString() || '',
            refreshToken: result.data.refresh_token || ''
          } : null)
        }
      }
    } catch (error) {
      console.error('Refresh session error:', error)
    }
  }, [])

  // Initialize method for AuthContextValue
  const initialize = useCallback(async (): Promise<void> => {
    // This is handled in the useEffect above
  }, [])

  // Sign in method for AuthContextValue
  const signIn = useCallback(async (email: string, password: string) => {
    return authService.signIn(email, password)
  }, [])

  // Sign up method for AuthContextValue
  const signUp = useCallback(async (data: any) => {
    return authService.registerCoach(data)
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    canPaySubsForChild,
    signOut,
    refreshSession,
    initialize,
    signIn,
    signUp
  }
}

// Standalone hook for components not using AuthProvider
function useAuthStandalone(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = new AuthService()

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initialize = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const sessionResult = await authService.getCurrentSession()
        
        if (sessionResult.success && sessionResult.data) {
          // Get enhanced user profile
          const userResult = await authService.getEnhancedUserProfile()
          
          if (userResult.success && userResult.data) {
            setUser(userResult.data)
            setSession({
              user: userResult.data,
              session: sessionResult.data,
              expiresAt: sessionResult.data.expires_at || '',
              refreshToken: sessionResult.data.refresh_token || ''
            })
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }

      // Set up auth state change listener
      unsubscribe = authService.createAuthListener(
        async (enhancedUser, supabaseSession) => {
          setUser(enhancedUser)
          
          if (enhancedUser && supabaseSession) {
            setSession({
              user: enhancedUser,
              session: supabaseSession,
              expiresAt: supabaseSession.expires_at?.toString() || '',
              refreshToken: supabaseSession.refresh_token || ''
            })
          } else {
            setSession(null)
          }
          
          setLoading(false)
        }
      )
    }

    initialize()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false
    return user.roles.some(roleAssignment => 
      roleAssignment.role === role && roleAssignment.is_active
    )
  }, [user])

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: Permission, teamId?: string): boolean => {
    if (!user) return false
    
    // Check if user has the permission globally
    if (user.permissions.includes(permission)) {
      // If teamId is specified, check if user has access to that team
      if (teamId) {
        return user.activeTeams.includes(teamId)
      }
      return true
    }
    
    return false
  }, [user])

  // Check if user can pay subs for a specific child
  const canPaySubsForChild = useCallback((childId: string): boolean => {
    if (!user) return false
    return user.canPaySubsFor.includes(childId)
  }, [user])

  // Sign out user
  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const result = await authService.refreshSession()
      if (result.success && result.data) {
        // Get updated user profile
        const userResult = await authService.getEnhancedUserProfile()
        if (userResult.success && userResult.data) {
          setUser(userResult.data)
          setSession(prev => prev ? {
            ...prev,
            session: result.data,
            expiresAt: result.data.expires_at?.toString() || '',
            refreshToken: result.data.refresh_token || ''
          } : null)
        }
      }
    } catch (error) {
      console.error('Refresh session error:', error)
    }
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    canPaySubsForChild,
    signOut,
    refreshSession
  }
}

// Export both versions for backward compatibility
export { useAuthStandalone }