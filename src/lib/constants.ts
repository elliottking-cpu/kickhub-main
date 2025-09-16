/**
 * Application Constants
 * 
 * This file contains all application-wide constants including
 * configuration values, enums, and static data used throughout KickHub.
 */

// ===== APPLICATION CONFIG =====

export const APP_NAME = 'KickHub'
export const APP_DESCRIPTION = 'Grassroots football management platform'
export const APP_VERSION = '1.0.0'
export const APP_AUTHOR = 'KickHub Team'

// ===== URL CONSTANTS =====

export const URLS = {
  MAIN_SITE: 'https://kickhub.com',
  ADMIN_PANEL: 'https://admin.kickhub.com',
  SUPPORT: 'https://support.kickhub.com',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',
} as const

// ===== ROUTE CONSTANTS =====

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  
  // Coach routes
  COACH: {
    DASHBOARD: '/coach/dashboard',
    TEAM_MANAGEMENT: '/coach/team-management',
    MATCH_PLANNING: '/coach/match-planning',
    TRAINING: '/coach/training',
    PLAYERS: '/coach/players',
    FINANCES: '/coach/finances',
    SETTINGS: '/coach/settings',
  },
  
  // Parent routes
  PARENT: {
    DASHBOARD: '/parent/dashboard',
    CHILDREN: '/parent/children',
    PAYMENTS: '/parent/payments',
    COMMUNICATIONS: '/parent/communications',
    VOLUNTEER: '/parent/volunteer',
    SETTINGS: '/parent/settings',
  },
  
  // Player routes
  PLAYER: {
    DASHBOARD: '/player/dashboard',
    CHARACTER: '/player/character',
    ACHIEVEMENTS: '/player/achievements',
    STATS: '/player/stats',
    TEAMS: '/player/teams',
  },
  
  // Referee routes
  REFEREE: {
    DASHBOARD: '/referee/dashboard',
    ASSIGNMENTS: '/referee/assignments',
    PROFILE: '/referee/profile',
    PAYMENTS: '/referee/payments',
    RATINGS: '/referee/ratings',
  },
  
  // Fan routes
  FAN: {
    DASHBOARD: '/fan/dashboard',
    TEAMS: '/fan/teams',
    MATCHES: '/fan/matches',
    MERCHANDISE: '/fan/merchandise',
    SUBSCRIPTION: '/fan/subscription',
  },
} as const

// ===== AGE GROUPS =====

export const AGE_GROUPS = [
  'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12',
  'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'Open'
] as const

export type AgeGroup = typeof AGE_GROUPS[number]

// ===== PLAYER POSITIONS =====

export const POSITIONS = [
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Forward',
  'Utility'
] as const

export type Position = typeof POSITIONS[number]

// ===== MATCH TYPES =====

export const MATCH_TYPES = [
  'League',
  'Cup',
  'Tournament',
  'Friendly',
  'Training Match'
] as const

export type MatchType = typeof MATCH_TYPES[number]

// ===== MATCH STATUS =====

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  HALF_TIME: 'half_time',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS]

// ===== TRAINING SESSION STATUS =====

export const TRAINING_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type TrainingStatus = typeof TRAINING_STATUS[keyof typeof TRAINING_STATUS]

// ===== PAYMENT STATUS =====

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// ===== SUBSCRIPTION STATUS =====

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

// ===== USER ROLES =====

export const USER_ROLES = {
  COACH: 'coach',
  PARENT: 'parent',
  PLAYER: 'player',
  REFEREE: 'referee',
  FAN: 'fan',
  ADMIN: 'admin',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// ===== NOTIFICATION TYPES =====

export const NOTIFICATION_TYPES = {
  MATCH_REMINDER: 'match_reminder',
  TRAINING_REMINDER: 'training_reminder',
  PAYMENT_DUE: 'payment_due',
  TEAM_UPDATE: 'team_update',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  MESSAGE_RECEIVED: 'message_received',
  REFEREE_ASSIGNED: 'referee_assigned',
  VOLUNTEER_REQUEST: 'volunteer_request',
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

// ===== CURRENCY =====

export const CURRENCY = {
  CODE: 'GBP',
  SYMBOL: '£',
  LOCALE: 'en-GB',
} as const

// ===== DATE FORMATS =====

export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, h:mm a',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm',
  FULL: 'EEEE, dd MMMM yyyy',
} as const

// ===== PAGINATION =====

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const

// ===== FILE UPLOAD =====

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const

// ===== TEAM COLORS =====

export const TEAM_COLORS = [
  { name: 'Red', value: '#DC2626' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Yellow', value: '#CA8A04' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Indigo', value: '#4338CA' },
  { name: 'Gray', value: '#6B7280' },
] as const

// ===== FORMATION TYPES =====

export const FORMATIONS = {
  '4-4-2': { defenders: 4, midfielders: 4, forwards: 2 },
  '4-3-3': { defenders: 4, midfielders: 3, forwards: 3 },
  '3-5-2': { defenders: 3, midfielders: 5, forwards: 2 },
  '4-2-3-1': { defenders: 4, midfielders: 5, forwards: 1 },
  '3-4-3': { defenders: 3, midfielders: 4, forwards: 3 },
  '5-3-2': { defenders: 5, midfielders: 3, forwards: 2 },
} as const

export type Formation = keyof typeof FORMATIONS

// ===== STATISTICAL CATEGORIES =====

export const STAT_CATEGORIES = {
  ATTACKING: 'attacking',
  DEFENDING: 'defending',
  GENERAL: 'general',
} as const

export type StatCategory = typeof STAT_CATEGORIES[keyof typeof STAT_CATEGORIES]

// ===== ERROR MESSAGES =====

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to view this content.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const

// ===== SUCCESS MESSAGES =====

export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  CREATE_SUCCESS: 'Item created successfully!',
  UPDATE_SUCCESS: 'Item updated successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  PASSWORD_RESET: 'Password reset link sent to your email.',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
} as const

// ===== LOCAL STORAGE KEYS =====

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'kickhub_user_preferences',
  THEME: 'kickhub_theme',
  MATCH_DATA: 'kickhub_match_data',
  OFFLINE_QUEUE: 'kickhub_offline_queue',
  ONBOARDING_COMPLETE: 'kickhub_onboarding_complete',
} as const

// ===== API ENDPOINTS (relative paths) =====

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
  },
  TEAMS: {
    LIST: '/api/teams',
    CREATE: '/api/teams',
    GET: (id: string) => `/api/teams/${id}`,
    UPDATE: (id: string) => `/api/teams/${id}`,
    DELETE: (id: string) => `/api/teams/${id}`,
  },
  PLAYERS: {
    LIST: '/api/players',
    CREATE: '/api/players',
    GET: (id: string) => `/api/players/${id}`,
    UPDATE: (id: string) => `/api/players/${id}`,
    DELETE: (id: string) => `/api/players/${id}`,
  },
  MATCHES: {
    LIST: '/api/matches',
    CREATE: '/api/matches',
    GET: (id: string) => `/api/matches/${id}`,
    UPDATE: (id: string) => `/api/matches/${id}`,
    DELETE: (id: string) => `/api/matches/${id}`,
  },
} as const