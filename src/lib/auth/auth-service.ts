/**
 * Main Authentication Service
 * Centralized authentication service for KickHub application
 * Based on KickHub Build Guide Step 4.1 specifications
 */

import { EmailPasswordAuth } from './email-password'
import { CoachRegistration } from './coach-registration'
import { ParentInvitationService } from './parent-invitation'
import { createAuthServerClient, getServerSession } from './client'
import { AuthErrorHandler, withAuthErrorHandling } from './error-handler'
import type { 
  AuthResult, 
  AuthUser, 
  AuthSession,
  CoachRegistrationData, 
  ParentRegistrationData,
  ParentInvitationData,
  UserRole 
} from './types'

export class AuthService {
  private emailPasswordAuth: EmailPasswordAuth
  private coachRegistration: CoachRegistration
  private parentInvitation: ParentInvitationService
  private supabase = createAuthClient()

  constructor() {
    this.emailPasswordAuth = new EmailPasswordAuth()
    this.coachRegistration = new CoachRegistration()
    this.parentInvitation = new ParentInvitationService()
  }

  // =====================
  // Basic Authentication
  // =====================

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    return this.emailPasswordAuth.signIn(email, password)
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    return this.emailPasswordAuth.signOut()
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResult> {
    return this.emailPasswordAuth.getCurrentUser()
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthResult> {
    return this.emailPasswordAuth.getCurrentSession()
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<AuthResult> {
    return this.emailPasswordAuth.refreshSession()
  }

  // =====================
  // Coach Registration
  // =====================

  /**
   * Register new coach with team creation
   */
  async registerCoach(data: CoachRegistrationData): Promise<AuthResult> {
    return this.coachRegistration.registerCoach(data)
  }

  /**
   * Check if team name is available
   */
  async isTeamNameAvailable(teamName: string, ageGroup: string): Promise<boolean> {
    return this.coachRegistration.isTeamNameAvailable(teamName, ageGroup)
  }

  /**
   * Get available age groups
   */
  getAvailableAgeGroups(): string[] {
    return CoachRegistration.getAvailableAgeGroups()
  }

  /**
   * Validate team name
   */
  validateTeamName(teamName: string): { isValid: boolean; error?: string } {
    return CoachRegistration.validateTeamName(teamName)
  }

  // =====================
  // Parent Invitations
  // =====================

  /**
   * Send parent invitation
   */
  async sendParentInvitation(data: ParentInvitationData): Promise<AuthResult> {
    return this.parentInvitation.sendParentInvitation(data)
  }

  /**
   * Validate invitation code
   */
  async validateInvitationCode(code: string): Promise<AuthResult> {
    return this.parentInvitation.validateInvitationCode(code)
  }

  /**
   * Register parent with invitation code
   */
  async registerParentWithCode(data: ParentRegistrationData): Promise<AuthResult> {
    return this.parentInvitation.registerParentWithCode(data)
  }

  // =====================
  // Password Management
  // =====================

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    return this.emailPasswordAuth.requestPasswordReset(email)
  }

  /**
   * Update password (when signed in)
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    return this.emailPasswordAuth.updatePassword(newPassword)
  }

  // =====================
  // User Profile & Roles
  // =====================

  /**
   * Get enhanced user profile with roles and permissions
   */
  async getEnhancedUserProfile(userId?: string): Promise<AuthResult<AuthUser>> {
    return withAuthErrorHandling(async () => {
      const currentUser = userId ? { id: userId } : await getServerSession()
      
      if (!currentUser?.id) {
        return {
          success: false,
          error: { message: 'User not authenticated' }
        }
      }

      const client = await createAuthServerClient()

      // Get user profile
      const { data: profile, error: profileError } = await client
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileError) {
        throw new Error('Failed to get user profile')
      }

      // Get user roles
      const { data: roles, error: rolesError } = await client
        .from('user_roles')
        .select('*, teams:team_id(name, age_group)')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)

      if (rolesError) {
        throw new Error('Failed to get user roles')
      }

      // Get permissions based on roles
      const permissions = this.calculateUserPermissions(roles || [])
      
      // Get active teams
      const activeTeams = (roles || [])
        .filter(role => role.team_id)
        .map(role => role.team_id)

      // Get primary role (first active role)
      const primaryRole = (roles && roles.length > 0) ? roles[0].role : 'fan'

      // Get children user can pay subs for (for parents)
      const canPaySubsFor = await this.getChildrenForSubsPayment(currentUser.id)

      const enhancedUser: AuthUser = {
        ...profile,
        roles: roles || [],
        permissions,
        activeTeams,
        primaryRole,
        canPaySubsFor
      }

      return {
        success: true,
        data: enhancedUser
      }
    }, 'get-enhanced-user-profile')
  }

  /**
   * Calculate user permissions based on roles
   */
  private calculateUserPermissions(roles: any[]): string[] {
    const allPermissions = new Set<string>()

    roles.forEach(roleAssignment => {
      const rolePermissions = this.getPermissionsForRole(roleAssignment.role)
      rolePermissions.forEach(permission => allPermissions.add(permission))
    })

    return Array.from(allPermissions)
  }

  /**
   * Get permissions for a specific role
   */
  private getPermissionsForRole(role: UserRole): string[] {
    const rolePermissions = {
      coach: [
        'manage_team', 'view_team_data', 'manage_team_settings',
        'manage_players', 'view_player_data', 'manage_player_profiles',
        'manage_matches', 'view_match_data', 'record_match_stats',
        'manage_training', 'view_training_data', 'record_attendance',
        'manage_finances', 'view_financial_data', 'process_payments',
        'send_messages', 'view_messages', 'manage_announcements',
        'view_child_data', 'manage_child_profile', 'pay_subs'
      ],
      assistant_coach: [
        'view_team_data', 'manage_players', 'view_player_data', 'manage_player_profiles',
        'manage_matches', 'view_match_data', 'record_match_stats',
        'manage_training', 'view_training_data', 'record_attendance',
        'view_financial_data', 'send_messages', 'view_messages',
        'view_child_data', 'manage_child_profile', 'pay_subs'
      ],
      parent: [
        'view_team_data', 'view_child_data', 'manage_child_profile',
        'pay_child_subs', 'view_messages', 'send_messages'
      ],
      player: [
        'view_own_data', 'update_own_profile', 'view_team_data', 'view_messages'
      ],
      fan: [
        'view_public_data', 'purchase_merchandise'
      ],
      referee: [
        'manage_own_profile', 'view_assigned_matches', 'update_match_results'
      ]
    }

    return rolePermissions[role] || []
  }

  /**
   * Get children user can pay subs for
   */
  private async getChildrenForSubsPayment(userId: string): Promise<string[]> {
    try {
      const client = await createAuthServerClient()

      const { data, error } = await client
        .from('parent_child_relationships')
        .select('child_id')
        .eq('parent_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Error getting children for subs payment:', error)
        return []
      }

      return (data || []).map(rel => rel.child_id)
    } catch (error) {
      console.error('Error getting children for subs payment:', error)
      return []
    }
  }

  // =====================
  // Session Management
  // =====================

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await getServerSession()
    return !!user
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Get auth event listener cleanup function
   */
  createAuthListener(callback: (user: any, session: any) => void) {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          // Get enhanced user profile
          const profileResult = await this.getEnhancedUserProfile(session.user.id)
          callback(profileResult.success ? profileResult.data : null, session)
        } else {
          callback(null, null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }

  // =====================
  // Utility Methods
  // =====================

  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      return { isValid: false, error: 'Email is required' }
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }
    
    return { isValid: true }
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(error: any): string {
    return AuthErrorHandler.getErrorMessage(error)
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    return AuthErrorHandler.isRetryableError(error)
  }

  /**
   * Check if error requires re-authentication
   */
  static requiresReauth(error: any): boolean {
    return AuthErrorHandler.requiresReauth(error)
  }
}
