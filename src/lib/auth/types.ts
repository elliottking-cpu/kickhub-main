/**
 * Authentication Type Definitions
 * Comprehensive types for KickHub authentication system
 * Based on KickHub Build Guide Step 4.1 specifications
 */

import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'

// User roles in the system
export type UserRole = 'coach' | 'assistant_coach' | 'parent' | 'player' | 'fan' | 'referee'

// Admin roles (separate from main app)
export type AdminRole = 'admin' | 'super_admin'

/**
 * User Profile Interface
 * Represents a user's basic profile information
 */
export interface UserProfile {
  id: string
  email: string
  full_name: string
  profile_photo_url?: string
  phone?: string
  date_of_birth?: string
  is_child?: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

/**
 * User Role Assignment Interface
 * Represents a user's role within a team/organization
 */
export interface UserRoleAssignment {
  id: string
  user_id: string
  team_id?: string
  role: UserRole
  is_active: boolean
  assigned_by: string
  assigned_at: string
  expires_at?: string
  metadata?: Record<string, any>
}

/**
 * Enhanced Auth User Interface
 * Combines Supabase user with profile and role information
 */
export interface AuthUser extends UserProfile {
  roles: UserRoleAssignment[]
  permissions: string[]
  activeTeams: string[]
  primaryRole: UserRole
  canPaySubsFor: string[] // Child IDs user can pay subs for
}

/**
 * Authentication Session Interface
 * Enhanced session with user profile and permissions
 */
export interface AuthSession {
  user: AuthUser
  session: SupabaseSession
  expiresAt: string
  refreshToken: string
}

/**
 * Registration Data Interfaces
 */
export interface CoachRegistrationData {
  email: string
  password: string
  fullName: string
  teamName: string
  ageGroup: string
  clubName?: string
  phone?: string
}

export interface ParentRegistrationData {
  invitationCode: string
  password: string
  fullName: string
  phone?: string
}

export interface ParentInvitationData {
  parentEmail: string
  childName: string
  teamId: string
  coachId: string
  childDateOfBirth?: string
  position?: string
}

/**
 * Parent Invitation Interface
 */
export interface ParentInvitation {
  id: string
  email: string
  child_id: string
  team_id: string
  invitation_code: string
  invited_by: string
  expires_at: string
  is_used: boolean
  used_at?: string
  created_at: string
}

/**
 * Parent-Child Relationship Interface
 */
export interface ParentChildRelationship {
  id: string
  parent_id: string
  child_id: string
  is_active: boolean
  created_at: string
}

/**
 * Authentication Result Interfaces
 */
export interface AuthResult<T = any> {
  data?: T
  error?: AuthError
  success: boolean
}

export interface AuthError {
  message: string
  code?: string
  details?: any
}

/**
 * Password Validation Result
 */
export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

/**
 * Rate Limiting Interface
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Auth Event Types for Audit Logging
 */
export type AuthEventType = 
  | 'signup'
  | 'signin' 
  | 'signout'
  | 'password_reset_request'
  | 'password_reset_confirm'
  | 'password_update'
  | 'session_refresh'
  | 'invitation_sent'
  | 'invitation_used'
  | 'role_assigned'
  | 'role_revoked'
  | 'profile_updated'

/**
 * Auth Event Interface for Audit Logging
 */
export interface AuthEvent {
  id: string
  event_type: AuthEventType
  user_id?: string
  email?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: string
}

/**
 * Session Management Types
 */
export interface SessionInfo {
  sessionId: string
  userId: string
  deviceInfo?: {
    userAgent: string
    ipAddress: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
  }
  createdAt: string
  lastActiveAt: string
  expiresAt: string
}

/**
 * Permission Types
 */
export type Permission = 
  // Team management
  | 'manage_team'
  | 'view_team_data'
  | 'manage_team_settings'
  
  // Player management
  | 'manage_players'
  | 'view_player_data'
  | 'manage_player_profiles'
  
  // Match management
  | 'manage_matches'
  | 'view_match_data'
  | 'record_match_stats'
  
  // Training management
  | 'manage_training'
  | 'view_training_data'
  | 'record_attendance'
  
  // Financial management
  | 'manage_finances'
  | 'view_financial_data'
  | 'process_payments'
  | 'pay_subs'
  
  // Communication
  | 'send_messages'
  | 'view_messages'
  | 'manage_announcements'
  
  // Parent-specific
  | 'view_child_data'
  | 'manage_child_profile'
  | 'pay_child_subs'
  
  // Player-specific
  | 'view_own_data'
  | 'update_own_profile'
  
  // Fan-specific
  | 'view_public_data'
  | 'purchase_merchandise'
  
  // Referee-specific
  | 'manage_own_profile'
  | 'view_assigned_matches'
  | 'update_match_results'

/**
 * Role Permission Mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  coach: [
    'manage_team',
    'view_team_data',
    'manage_team_settings',
    'manage_players',
    'view_player_data',
    'manage_player_profiles',
    'manage_matches',
    'view_match_data',
    'record_match_stats',
    'manage_training',
    'view_training_data',
    'record_attendance',
    'manage_finances',
    'view_financial_data',
    'process_payments',
    'send_messages',
    'view_messages',
    'manage_announcements',
    'view_child_data', // Inherited parent permissions for all team children
    'manage_child_profile', // Inherited parent permissions for all team children
    'pay_subs' // Only for own children (restriction applied in business logic)
  ],
  assistant_coach: [
    'view_team_data',
    'manage_players',
    'view_player_data',
    'manage_player_profiles',
    'manage_matches',
    'view_match_data',
    'record_match_stats',
    'manage_training',
    'view_training_data',
    'record_attendance',
    'view_financial_data', // Can view but not manage finances
    'send_messages',
    'view_messages',
    'view_child_data', // Inherited parent permissions for all team children
    'manage_child_profile', // Inherited parent permissions for all team children
    'pay_subs' // Only for own children (restriction applied in business logic)
  ],
  parent: [
    'view_team_data',
    'view_child_data',
    'manage_child_profile',
    'pay_child_subs',
    'view_messages',
    'send_messages'
  ],
  player: [
    'view_own_data',
    'update_own_profile',
    'view_team_data',
    'view_messages'
  ],
  fan: [
    'view_public_data',
    'purchase_merchandise'
  ],
  referee: [
    'manage_own_profile',
    'view_assigned_matches',
    'update_match_results'
  ]
}

/**
 * Auth Hook Return Types
 */
export interface UseAuthReturn {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: Permission, teamId?: string) => boolean
  canPaySubsForChild: (childId: string) => boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

/**
 * Registration Hook Return Types
 */
export interface UseCoachRegistrationReturn {
  register: (data: CoachRegistrationData) => Promise<AuthResult>
  loading: boolean
  error: AuthError | null
  isTeamNameAvailable: (teamName: string, ageGroup: string) => Promise<boolean>
}

export interface UseParentInvitationReturn {
  validateCode: (code: string) => Promise<AuthResult<ParentInvitation>>
  register: (data: ParentRegistrationData) => Promise<AuthResult>
  loading: boolean
  error: AuthError | null
}

/**
 * Password Management Types
 */
export interface UsePasswordResetReturn {
  requestReset: (email: string) => Promise<AuthResult>
  confirmReset: (newPassword: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
  loading: boolean
  error: AuthError | null
}

/**
 * Form Validation Types
 */
export interface AuthFormErrors {
  email?: string
  password?: string
  fullName?: string
  teamName?: string
  ageGroup?: string
  invitationCode?: string
  phone?: string
  general?: string
}

/**
 * Auth Context Types
 */
export interface AuthContextValue extends UseAuthReturn {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (data: CoachRegistrationData) => Promise<AuthResult>
}

/**
 * Type Guards
 */
export const isAuthUser = (user: any): user is AuthUser => {
  return user && typeof user === 'object' && 'roles' in user && 'permissions' in user
}

export const isValidUserRole = (role: string): role is UserRole => {
  return ['coach', 'assistant_coach', 'parent', 'player', 'fan', 'referee'].includes(role)
}

export const isValidPermission = (permission: string): permission is Permission => {
  return Object.values(ROLE_PERMISSIONS).flat().includes(permission as Permission)
}