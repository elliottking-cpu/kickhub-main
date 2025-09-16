/**
 * Auth Client Configuration
 * 
 * This file provides authentication utilities for both server and client components
 * including user session management and role-based access control.
 */

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

/**
 * Create authenticated server client
 * This is used in server components and layouts for authentication
 */
export const createAuthServerClient = async () => {
  const client = await createSupabaseClient()
  // During build time, client might be null - return gracefully
  if (!client) {
    return null
  }
  return client
}

/**
 * Get current user session on server side
 * Returns user data if authenticated, null if not
 */
export async function getServerSession() {
  const supabase = await createAuthServerClient()
  
  // During build time, supabase client might be null
  if (!supabase) {
    return null
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

/**
 * Require authentication - redirect if not authenticated
 * Use this in layouts and pages that require authentication
 */
export async function requireAuth() {
  const user = await getServerSession()
  
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }
  
  return user
}

/**
 * Get user profile with roles
 * Returns user profile data including roles and permissions
 */
export async function getUserProfile(userId: string) {
  const supabase = await createAuthServerClient()
  
  // During build time, supabase client might be null
  if (!supabase) {
    return null
  }
  
  try {
    // This would typically fetch from a profiles or user_roles table
    // For now, return mock data structure
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

/**
 * Get user roles for RBAC
 * Returns array of roles for the current user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = await createAuthServerClient()
  
  // During build time, supabase client might be null
  if (!supabase) {
    return [] // Return empty array during build
  }
  
  try {
    // This would typically fetch from a user_roles table
    // For now, return mock roles based on user
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user roles:', error)
      return []
    }
    
    return data.map(item => item.role) || []
  } catch (error) {
    console.error('Error in getUserRoles:', error)
    // Return default roles for development
    return ['parent'] // Default role
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes(role)
}

/**
 * Get redirect URL based on user roles
 * Used after login to determine where to redirect user
 */
export async function getRoleRedirectUrl(userId: string): Promise<string> {
  const roles = await getUserRoles(userId)
  
  // Priority order: coach > parent > player > fan > referee
  if (roles.includes('coach')) return '/coach'
  if (roles.includes('parent')) return '/parent'
  if (roles.includes('player')) return '/player'
  if (roles.includes('fan')) return '/fan'
  if (roles.includes('referee')) return '/referee'
  
  // Default to parent dashboard
  return '/parent'
}
