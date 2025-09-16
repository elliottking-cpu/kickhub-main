// lib/auth/types.ts - Authentication type definitions
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/roles'

export interface AuthUser extends User {
  roles?: UserRole[]
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}