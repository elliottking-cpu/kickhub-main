/**
 * Coach Registration Implementation
 * Primary entry point for KickHub with team creation
 * Based on KickHub Build Guide Step 4.1 specifications
 */

import { EmailPasswordAuth } from './email-password'
import { createAuthServerClient } from './client'
import { AuthErrorHandler, withAuthErrorHandling } from './error-handler'
import type { CoachRegistrationData, AuthResult } from './types'

export class CoachRegistration extends EmailPasswordAuth {
  private serverClient: any = null

  constructor() {
    super()
    this.initializeServerClient()
  }

  /**
   * Initialize server client for database operations
   */
  private async initializeServerClient() {
    try {
      this.serverClient = await createAuthServerClient()
    } catch (error) {
      console.error('Failed to initialize server client:', error)
    }
  }

  /**
   * Register coach with team creation
   * This is the primary entry point for new users
   */
  async registerCoach(data: CoachRegistrationData): Promise<AuthResult> {
    return withAuthErrorHandling(async () => {
      // Step 1: Validate input data
      const validation = this.validateCoachRegistrationData(data)
      if (!validation.isValid) {
        return {
          success: false,
          error: { message: validation.errors.join(', ') }
        }
      }

      // Step 2: Check team name availability
      const teamAvailable = await this.isTeamNameAvailable(data.teamName, data.ageGroup)
      if (!teamAvailable) {
        return {
          success: false,
          error: { message: `A team named "${data.teamName}" already exists in the ${data.ageGroup} age group. Please choose a different name.` }
        }
      }

      // Step 3: Create auth user
      const authResult = await this.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        metadata: {
          role: 'coach',
          registration_type: 'coach_primary'
        }
      })

      if (!authResult.success || !authResult.data) {
        return authResult
      }

      const authUser = authResult.data

      try {
        // Step 4: Create user profile
        await this.createUserProfile(authUser.id, data)

        // Step 5: Create team
        const team = await this.createTeam(authUser.id, data)

        // Step 6: Assign coach role
        await this.assignCoachRole(authUser.id, team.id)

        // Step 7: Create initial team settings
        await this.createInitialTeamSettings(team.id)

        return {
          success: true,
          data: {
            user: authUser,
            team: team
          }
        }
      } catch (error) {
        // Cleanup on failure
        await this.cleanupFailedRegistration(authUser.id)
        throw error
      }
    }, 'coach-registration')
  }

  /**
   * Validate coach registration data
   */
  private validateCoachRegistrationData(data: CoachRegistrationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address')
    }

    // Validate password
    const passwordValidation = this.validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }

    // Validate full name
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long')
    }

    if (data.fullName && data.fullName.length > 100) {
      errors.push('Full name must be less than 100 characters')
    }

    // Validate team name
    if (!data.teamName || data.teamName.trim().length < 2) {
      errors.push('Team name must be at least 2 characters long')
    }

    if (data.teamName && data.teamName.length > 50) {
      errors.push('Team name must be less than 50 characters')
    }

    // Validate age group
    const validAgeGroups = [
      'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18',
      'Open Age', 'Adult'
    ]
    
    if (!data.ageGroup || !validAgeGroups.includes(data.ageGroup)) {
      errors.push('Please select a valid age group')
    }

    // Validate phone (optional)
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Please enter a valid phone number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if team name is available in the age group
   */
  async isTeamNameAvailable(teamName: string, ageGroup: string): Promise<boolean> {
    try {
      const client = this.serverClient || this.supabase

      const { data, error } = await client
        .from('teams')
        .select('id')
        .eq('name', teamName.trim())
        .eq('age_group', ageGroup)
        .limit(1)

      if (error) {
        console.error('Team name availability check error:', error)
        return true // Allow registration if check fails
      }

      return !data || data.length === 0
    } catch (error) {
      console.error('Team name availability check error:', error)
      return true // Allow registration if check fails
    }
  }

  /**
   * Create user profile in the database
   */
  private async createUserProfile(userId: string, data: CoachRegistrationData): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('users')
      .insert({
        id: userId,
        email: data.email.toLowerCase().trim(),
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('User profile creation error:', error)
      throw new Error('Failed to create user profile')
    }
  }

  /**
   * Create team in the database
   */
  private async createTeam(userId: string, data: CoachRegistrationData): Promise<any> {
    const client = this.serverClient || this.supabase

    const { data: teamData, error } = await client
      .from('teams')
      .insert({
        name: data.teamName.trim(),
        age_group: data.ageGroup,
        club_name: data.clubName?.trim() || null,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Team creation error:', error)
      throw new Error('Failed to create team')
    }

    return teamData
  }

  /**
   * Assign coach role to user
   */
  private async assignCoachRole(userId: string, teamId: string): Promise<void> {
    const client = this.serverClient || this.supabase

    const { error } = await client
      .from('user_roles')
      .insert({
        user_id: userId,
        team_id: teamId,
        role: 'coach',
        is_active: true,
        assigned_by: userId,
        assigned_at: new Date().toISOString()
      })

    if (error) {
      console.error('Coach role assignment error:', error)
      throw new Error('Failed to assign coach role')
    }
  }

  /**
   * Create initial team settings
   */
  private async createInitialTeamSettings(teamId: string): Promise<void> {
    const client = this.serverClient || this.supabase

    // Create basic team settings
    const { error } = await client
      .from('team_settings')
      .insert({
        team_id: teamId,
        settings: {
          training_day: null,
          training_time: null,
          match_day: null,
          notifications_enabled: true,
          parent_invitations_enabled: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Team settings creation error:', error)
      // Don't throw error for settings - it's not critical for registration
      console.log('Team settings creation failed, but registration continues')
    }
  }

  /**
   * Cleanup failed registration
   */
  private async cleanupFailedRegistration(userId: string): Promise<void> {
    try {
      const client = this.serverClient || this.supabase

      // Delete user roles
      await client
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      // Delete teams created by this user
      await client
        .from('teams')
        .delete()
        .eq('created_by', userId)

      // Delete user profile
      await client
        .from('users')
        .delete()
        .eq('id', userId)

      console.log('Registration cleanup completed for user:', userId)
    } catch (error) {
      console.error('Registration cleanup error:', error)
      // Don't throw error - cleanup is best effort
    }
  }

  /**
   * Get available age groups
   */
  static getAvailableAgeGroups(): string[] {
    return [
      'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18',
      'Open Age', 'Adult'
    ]
  }

  /**
   * Validate team name format
   */
  static validateTeamName(teamName: string): { isValid: boolean; error?: string } {
    if (!teamName || teamName.trim().length < 2) {
      return { isValid: false, error: 'Team name must be at least 2 characters long' }
    }

    if (teamName.length > 50) {
      return { isValid: false, error: 'Team name must be less than 50 characters' }
    }

    // Check for prohibited characters
    if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(teamName)) {
      return { isValid: false, error: 'Team name contains invalid characters' }
    }

    return { isValid: true }
  }
}
