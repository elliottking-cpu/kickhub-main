/**
 * Authentication Configuration
 * Centralized configuration for KickHub authentication system
 * Based on KickHub Build Guide Step 4.1 specifications
 */

export const authConfig = {
  // Disable email confirmation for streamlined process
  emailConfirmation: false,
  
  // Password requirements
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  
  // Session configuration
  sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
  refreshTokenTimeout: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // Rate limiting configuration
  rateLimits: {
    signUp: { attempts: 5, window: 60 * 60 }, // 5 attempts per hour
    signIn: { attempts: 10, window: 15 * 60 }, // 10 attempts per 15 minutes
    passwordReset: { attempts: 3, window: 60 * 60 } // 3 attempts per hour
  },

  // Registration flow configuration
  registrationFlows: {
    coachRegistration: {
      enabled: true,
      createsTeam: true,
      primaryUser: true,
      requiredFields: ['email', 'password', 'fullName', 'teamName', 'ageGroup']
    },
    parentInvitations: {
      enabled: true,
      invitationCodes: true,
      codeExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
      childLinking: true,
      requiredFields: ['email', 'password', 'fullName']
    },
    refereeRegistration: {
      enabled: true,
      separateFlow: true,
      verificationRequired: false
    }
  },

  // Security features
  security: {
    auditLogging: true,
    sessionMonitoring: true,
    csrfProtection: true,
    rateLimiting: true
  },

  // Supabase-specific settings (to be configured in Supabase dashboard)
  supabaseSettings: {
    siteUrl: process.env.NODE_ENV === 'production' 
      ? 'https://kickhub.com' 
      : 'http://localhost:3000',
    redirectUrls: [
      process.env.NODE_ENV === 'production' 
        ? 'https://kickhub.com/auth/callback'
        : 'http://localhost:3000/auth/callback'
    ],
    emailConfirmations: false, // Disabled for streamlined process
    enableSignups: true,
    jwtExpiry: 3600 // 1 hour in seconds
  }
} as const

// Type definitions for configuration
export type AuthConfig = typeof authConfig
export type PasswordRequirements = typeof authConfig.passwordRequirements
export type RateLimits = typeof authConfig.rateLimits
export type RegistrationFlows = typeof authConfig.registrationFlows

// Validation helpers
export const validateAuthConfig = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}

// Export environment-specific URLs
export const getAuthUrls = () => ({
  siteUrl: authConfig.supabaseSettings.siteUrl,
  callbackUrl: authConfig.supabaseSettings.redirectUrls[0],
  resetPasswordUrl: `${authConfig.supabaseSettings.siteUrl}/auth/reset-password`
})
