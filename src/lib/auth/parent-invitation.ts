/**
 * Parent Invitation System
 * Secure parent onboarding with unique login codes
 * Based on KickHub Build Guide Step 4.1 specifications
 */

import { EmailPasswordAuth } from './email-password'
import { createAuthServerClient } from './client'
import { AuthErrorHandler, withAuthErrorHandling } from './error-handler'
import type { ParentInvitationData, ParentRegistrationData, ParentInvitation, AuthResult } from './types'

export class ParentInvitationService extends EmailPasswordAuth {
  private serverClient: any = null

  constructor() {
    super()
    this.initializeServerClient()
  }

  /**
   * Initialize server client
   */
  private async initializeServerClient() {
    try {
      this.serverClient = await createAuthServerClient()
    } catch (error) {
      console.error('Failed to initialize server client:', error)
    }
  }

  /**
   * Send parent invitation with login code
   */
  async sendParentInvitation(data: ParentInvitationData): Promise<AuthResult> {
    return withAuthErrorHandling(async () => {
      // Step 1: Validate invitation data
      const validation = this.validateInvitationData(data)
      if (!validation.isValid) {
        return {
          success: false,
          error: { message: validation.errors.join(', ') }
        }
      }

      // Step 2: Check if parent already has an account
      const existingUser = await this.checkExistingParentAccount(data.parentEmail)
      if (existingUser) {
        return {
          success: false,
          error: { message: 'A parent account with this email already exists. Please use the login page instead.' }
        }
      }

      // Step 3: Create child profile first
      const childProfile = await this.createChildProfile(data)

      // Step 4: Generate unique invitation code
      const invitationCode = this.generateInvitationCode()

      // Step 5: Create invitation record
      const invitation = await this.createInvitationRecord({
        email: data.parentEmail,
        child_id: childProfile.id,
        team_id: data.teamId,
        invitation_code: invitationCode,
        invited_by: data.coachId
      })

      // Step 6: Send invitation email (placeholder - would integrate with email service)
      await this.sendInvitationEmail(data.parentEmail, invitationCode, childProfile.full_name)

      return {
        success: true,
        data: {
          invitation,
          child: childProfile,
          invitationCode // For testing purposes - remove in production
        }
      }
    }, 'parent-invitation')
  }

  /**
   * Register parent with invitation code
   */
  async registerParentWithCode(data: ParentRegistrationData): Promise<AuthResult> {
    return withAuthErrorHandling(async () => {
      // Step 1: Validate invitation code
      const invitationResult = await this.validateInvitationCode(data.invitationCode)
      if (!invitationResult.success || !invitationResult.data) {
        return invitationResult
      }

      const invitation = invitationResult.data

      // Step 2: Create auth user for parent
      const authResult = await this.signUp({
        email: invitation.email,
        password: data.password,
        fullName: data.fullName,
        metadata: {
          role: 'parent',
          registration_type: 'parent_invitation'
        }
      })

      if (!authResult.success || !authResult.data) {
        return authResult
      }

      const authUser = authResult.data

      try {
        // Step 3: Create parent profile
        await this.createParentProfile(authUser.id, invitation.email, data)

        // Step 4: Create parent-child relationship
        await this.createParentChildRelationship(authUser.id, invitation.child_id)

        // Step 5: Assign parent role
        await this.assignParentRole(authUser.id, invitation.team_id, invitation.invited_by)

        // Step 6: Update child with parent's email
        await this.updateChildWithParentEmail(invitation.child_id, invitation.email)

        // Step 7: Mark invitation as used
        await this.markInvitationAsUsed(invitation.id)

        return {
          success: true,
          data: {
            user: authUser,
            childId: invitation.child_id
          }
        }
      } catch (error) {
        // Cleanup auth user on failure
        await this.cleanupAuthUser(authUser.id)
        throw error
      }
    }, 'parent-registration')
  }

  /**
   * Validate invitation code
   */
  async validateInvitationCode(code: string): Promise<AuthResult<ParentInvitation>> {
    try {
      if (!code || code.length !== 8) {
        return {
          success: false,
          error: { message: 'Invalid invitation code format' }
        }
      }

      const client = this.serverClient || this.supabase

      const { data, error } = await client
        .from('parent_invitations')
        .select('*, children:child_id(full_name)')
        .eq('invitation_code', code.toUpperCase())
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return {
          success: false,
          error: { message: 'Invalid or expired invitation code' }
        }
      }

      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to validate invitation code' }
      }
    }
  }

  /**
   * Generate unique 8-character invitation code
   */
  private generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Validate invitation data
   */
  private validateInvitationData(data: ParentInvitationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate parent email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.parentEmail || !emailRegex.test(data.parentEmail)) {
      errors.push('Please enter a valid parent email address')
    }

    // Validate child name
    if (!data.childName || data.childName.trim().length < 2) {
      errors.push('Child name must be at least 2 characters long')
    }

    // Validate team ID
    if (!data.teamId) {
      errors.push('Team ID is required')
    }

    // Validate coach ID
    if (!data.coachId) {
      errors.push('Coach ID is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if parent already has an account
   */
  private async checkExistingParentAccount(email: string): Promise<boolean> {
    try {
      const client = this.serverClient || this.supabase

      const { data, error } = await client
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      return !error && data && data.length > 0
    } catch (error) {
      console.error('Check existing parent account error:', error)
      return false
    }
  }

  /**
   * Create child profile
   */
  private async createChildProfile(data: ParentInvitationData): Promise<any> {
    const client = this.serverClient || this.supabase

    const { data: childData, error } = await client
      .from('players')
      .insert({
        full_name: data.childName.trim(),
        team_id: data.teamId,
        date_of_birth: data.childDateOfBirth || null,
        preferred_position: data.position || null,
        is_child: true,
        created_by: data.coachId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Child profile creation error:', error)
      throw new Error('Failed to create child profile')
    }

    return childData
  }

  /**
   * Create invitation record
   */
  private async createInvitationRecord(invitation: {
    email: string
    child_id: string
    team_id: string
    invitation_code: string
    invited_by: string
  }): Promise<any> {
    const client = this.serverClient || this.supabase

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const { data, error } = await client
      .from('parent_invitations')
      .insert({
        email: invitation.email.toLowerCase().trim(),
        child_id: invitation.child_id,
        team_id: invitation.team_id,
        invitation_code: invitation.invitation_code,
        invited_by: invitation.invited_by,
        expires_at: expiresAt.toISOString(),
        is_used: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Invitation record creation error:', error)
      throw new Error('Failed to create invitation record')
    }

    return data
  }

  /**
   * Send invitation email (placeholder)
   */
  private async sendInvitationEmail(email: string, code: string, childName: string): Promise<void> {
    // This would integrate with your email service (SendGrid, etc.)
    console.log(`
      Invitation Email for ${email}:
      
      Your child ${childName} has been added to a team on KickHub!
      
      Use this code to create your parent account: ${code}
      
      Visit: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/register/parent
    `)
    
    // For now, just log it - in production this would send an actual email
  }

  /**
   * Create parent profile
   */
  private async createParentProfile(userId: string, email: string, data: ParentRegistrationData): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Parent profile creation error:', error)
      throw new Error('Failed to create parent profile')
    }
  }

  /**
   * Create parent-child relationship
   */
  private async createParentChildRelationship(parentId: string, childId: string): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('parent_child_relationships')
      .insert({
        parent_id: parentId,
        child_id: childId,
        is_active: true,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Parent-child relationship creation error:', error)
      throw new Error('Failed to create parent-child relationship')
    }
  }

  /**
   * Assign parent role
   */
  private async assignParentRole(userId: string, teamId: string, assignedBy: string): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('user_roles')
      .insert({
        user_id: userId,
        team_id: teamId,
        role: 'parent',
        is_active: true,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString()
      })

    if (error) {
      console.error('Parent role assignment error:', error)
      throw new Error('Failed to assign parent role')
    }
  }

  /**
   * Update child with parent's email
   */
  private async updateChildWithParentEmail(childId: string, parentEmail: string): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('players')
      .update({
        parent_email: parentEmail.toLowerCase().trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', childId)

    if (error) {
      console.error('Child email update error:', error)
      throw new Error('Failed to update child with parent email')
    }
  }

  /**
   * Mark invitation as used
   */
  private async markInvitationAsUsed(invitationId: string): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('parent_invitations')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (error) {
      console.error('Mark invitation as used error:', error)
      // Don't throw error - this is not critical
      console.log('Failed to mark invitation as used, but registration continues')
    }
  }

  /**
   * Cleanup auth user on failed registration
   */
  private async cleanupAuthUser(userId: string): Promise<void> {
    try {
      // Delete the auth user if registration failed
      // This would require admin access to Supabase auth
      console.log('Registration cleanup needed for user:', userId)
      // In production, this might involve calling a Supabase Edge Function with service role
    } catch (error) {
      console.error('Auth user cleanup error:', error)
    }
  }
}
