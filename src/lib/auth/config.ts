// lib/auth/config.ts - Authentication configuration
export const AUTH_CONFIG = {
  redirects: {
    afterSignIn: '/coach/dashboard',
    afterSignUp: '/coach/team/setup',
    afterSignOut: '/',
  },
  roles: {
    default: 'coach',
    admin: 'admin',
  },
} as const