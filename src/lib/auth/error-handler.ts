/**
 * Authentication Error Handler
 * Centralized error handling for authentication operations
 * Based on KickHub Build Guide Step 4.1 specifications
 */

import type { AuthError } from './types'

export class AuthErrorHandler {
  /**
   * Convert Supabase auth errors to user-friendly messages
   */
  static getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred'

    // Handle Supabase-specific errors
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      
      case 'Email not confirmed':
        return 'Please confirm your email address before signing in.'
      
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.'
      
      case 'Password should be at least 6 characters':
        return 'Password must be at least 8 characters long.'
      
      case 'Signup is disabled':
        return 'New registrations are currently disabled. Please contact support.'
      
      case 'Too many requests':
        return 'Too many attempts. Please wait a few minutes before trying again.'
      
      case 'Invalid email':
        return 'Please enter a valid email address.'
      
      case 'Weak password':
        return 'Password is too weak. Please choose a stronger password.'
      
      case 'Email rate limit exceeded':
        return 'Too many email requests. Please wait before requesting another.'
      
      case 'Invalid refresh token':
        return 'Your session has expired. Please sign in again.'
      
      case 'Session not found':
        return 'Your session has expired. Please sign in again.'
      
      case 'Invalid JWT':
        return 'Authentication error. Please sign in again.'
      
      case 'JWT expired':
        return 'Your session has expired. Please sign in again.'
      
      case 'Network request failed':
        return 'Network error. Please check your connection and try again.'
      
      case 'Failed to fetch':
        return 'Connection error. Please check your internet connection.'
      
      // Custom KickHub errors
      case 'Team name already exists':
        return 'A team with this name already exists. Please choose a different name.'
      
      case 'Invalid invitation code':
        return 'The invitation code is invalid or has expired. Please check the code or request a new invitation.'
      
      case 'Invitation already used':
        return 'This invitation has already been used. Please contact your coach for a new invitation.'
      
      case 'Child profile creation failed':
        return 'Failed to create child profile. Please try again or contact support.'
      
      case 'Role assignment failed':
        return 'Failed to assign user role. Please try again or contact support.'
      
      case 'Parent-child relationship failed':
        return 'Failed to link parent and child accounts. Please try again or contact support.'
      
      default:
        // Return the original message if it's user-friendly, otherwise generic message
        if (error.message && error.message.length < 100 && !error.message.toLowerCase().includes('error')) {
          return error.message
        }
        return 'An error occurred. Please try again.'
    }
  }

  /**
   * Create a standardized AuthError object
   */
  static createAuthError(error: any): AuthError {
    return {
      message: this.getErrorMessage(error),
      code: error.code || error.error_code || 'unknown',
      details: error.details || error
    }
  }

  /**
   * Check if an error is retryable
   */
  static isRetryableError(error: any): boolean {
    if (!error) return false
    
    const retryableErrors = [
      'Network request failed',
      'Failed to fetch',
      'Too many requests',
      'Service temporarily unavailable',
      'Connection timeout',
      'Request timeout',
      'Server error',
      'Internal server error'
    ]
    
    const message = error.message?.toLowerCase() || ''
    return retryableErrors.some(retryable => 
      message.includes(retryable.toLowerCase())
    )
  }

  /**
   * Check if an error requires re-authentication
   */
  static requiresReauth(error: any): boolean {
    if (!error) return false
    
    const reauthErrors = [
      'Invalid refresh token',
      'Session not found',
      'Invalid JWT',
      'JWT expired',
      'Authentication required',
      'Unauthorized'
    ]
    
    const message = error.message?.toLowerCase() || ''
    return reauthErrors.some(reauthError => 
      message.includes(reauthError.toLowerCase())
    )
  }

  /**
   * Get error severity level
   */
  static getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'low'
    
    const message = error.message?.toLowerCase() || ''
    
    // Critical errors that require immediate attention
    if (message.includes('service unavailable') || 
        message.includes('internal server error') ||
        message.includes('database error')) {
      return 'critical'
    }
    
    // High severity errors that block user progress
    if (message.includes('signup is disabled') ||
        message.includes('account suspended') ||
        message.includes('access denied')) {
      return 'high'
    }
    
    // Medium severity errors that can be resolved by user
    if (message.includes('invalid credentials') ||
        message.includes('email already exists') ||
        message.includes('weak password')) {
      return 'medium'
    }
    
    // Low severity errors (validation, temporary issues)
    return 'low'
  }

  /**
   * Get suggested user action based on error
   */
  static getSuggestedAction(error: any): string {
    if (!error) return 'Please try again.'
    
    const message = error.message?.toLowerCase() || ''
    
    if (message.includes('invalid credentials')) {
      return 'Please check your email and password and try again.'
    }
    
    if (message.includes('email already exists')) {
      return 'Try signing in instead, or use the password reset option if you forgot your password.'
    }
    
    if (message.includes('weak password')) {
      return 'Please choose a stronger password with uppercase, lowercase, and numbers.'
    }
    
    if (message.includes('too many requests')) {
      return 'Please wait a few minutes before trying again.'
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return 'Please check your internet connection and try again.'
    }
    
    if (message.includes('session expired') || message.includes('jwt')) {
      return 'Please sign in again to continue.'
    }
    
    if (message.includes('invitation')) {
      return 'Please check your invitation code or contact your coach for a new invitation.'
    }
    
    return 'Please try again or contact support if the problem persists.'
  }

  /**
   * Log error for debugging (development only)
   */
  static logError(error: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Auth Error${context ? ` (${context})` : ''}`)
      console.error('Original error:', error)
      console.log('User message:', this.getErrorMessage(error))
      console.log('Severity:', this.getErrorSeverity(error))
      console.log('Retryable:', this.isRetryableError(error))
      console.log('Requires reauth:', this.requiresReauth(error))
      console.log('Suggested action:', this.getSuggestedAction(error))
      console.groupEnd()
    }
  }

  /**
   * Create error report for monitoring/analytics
   */
  static createErrorReport(error: any, context?: {
    userId?: string
    action?: string
    userAgent?: string
    timestamp?: string
  }) {
    return {
      message: this.getErrorMessage(error),
      originalError: error.message || 'Unknown error',
      code: error.code || 'unknown',
      severity: this.getErrorSeverity(error),
      retryable: this.isRetryableError(error),
      requiresReauth: this.requiresReauth(error),
      context: context || {},
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Utility function to handle async auth operations with error handling
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AuthError }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    AuthErrorHandler.logError(error, context)
    return { error: AuthErrorHandler.createAuthError(error) }
  }
}

/**
 * Retry wrapper for auth operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !AuthErrorHandler.isRetryableError(error)) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}
