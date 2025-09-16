/**
 * Email/Password Authentication Implementation
 * Core authentication functionality for KickHub
 * Based on KickHub Build Guide Step 4.1 specifications
 */

import { createAuthServerClient } from './client'
import { authConfig, type PasswordRequirements } from './auth-config'
import type { AuthResult, AuthError, PasswordValidationResult } from './types'

export class EmailPasswordAuth {
  protected supabase = createAuthServerClient()
  protected config = authConfig

  /**
   * Validate password strength according to requirements
   */
  protected validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = []
    const requirements = this.config.passwordRequirements

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters long`)
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    // Calculate password strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (errors.length === 0) {
      const hasMultipleTypes = [
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
      ].filter(Boolean).length

      if (password.length >= 12 && hasMultipleTypes >= 3) {
        strength = 'strong'
      } else if (password.length >= 10 && hasMultipleTypes >= 2) {
        strength = 'medium'
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: {
    email: string
    password: string
    fullName: string
    metadata?: Record<string, any>
  }): Promise<AuthResult> {
    try {
      // Validate password
      const passwordValidation = this.validatePassword(data.password)
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: { message: passwordValidation.errors.join(', ') }
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: { message: 'Please enter a valid email address' }
        }
      }

      // Validate full name
      if (!data.fullName.trim() || data.fullName.trim().length < 2) {
        return {
          success: false,
          error: { message: 'Please enter your full name' }
        }
      }

      // Create auth user
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            ...data.metadata
          }
        }
      })

      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return {
        success: true,
        data: authData.user
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Registration failed', code: 'signup_error' }
      }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Basic validation
      if (!email || !password) {
        return {
          success: false,
          error: { message: 'Email and password are required' }
        }
      }

      // Sign in with Supabase
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      })

      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Sign in failed', code: 'signin_error' }
      }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Sign out failed', code: 'signout_error' }
      }
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      if (!email) {
        return {
          success: false,
          error: { message: 'Email is required' }
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: { message: 'Please enter a valid email address' }
        }
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      )

      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return { 
        success: true,
        data: { message: 'Password reset email sent' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Password reset request failed', code: 'password_reset_error' }
      }
    }
  }

  /**
   * Update password (when signed in)
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      // Validate new password
      const passwordValidation = this.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: { message: passwordValidation.errors.join(', ') }
        }
      }

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return { 
        success: true,
        data: { message: 'Password updated successfully' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Password update failed', code: 'password_update_error' }
      }
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResult> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return {
        success: true,
        data: user
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to get current user', code: 'get_user_error' }
      }
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthResult> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return {
        success: true,
        data: session
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to get current session', code: 'get_session_error' }
      }
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        return {
          success: false,
          error: { message: error.message, code: error.message }
        }
      }

      return {
        success: true,
        data: data.session
      }
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to refresh session', code: 'refresh_session_error' }
      }
    }
  }
}
