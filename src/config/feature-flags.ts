// config/feature-flags.ts - Feature Flags Configuration (Build Guide Steps 2.5, 3.3, 3.4)

/**
 * KickHub Feature Flags Configuration
 * Controls the availability of features throughout the application
 * Based on Build Guide Step 3.4 Real-time specifications
 */

// Core RBAC Feature Flags
export const RBAC_FLAGS = {
  RBAC_ENABLED: true,
  MULTI_ROLE_SUPPORT: true,
  COACH_INHERITS_PARENT: true,
  ASSISTANT_INHERITS_PARENT: true,
} as const

// Storage Feature Flags (Step 3.3)
export const STORAGE_FLAGS = {
  STORAGE_BUCKETS: true,
  STORAGE_POLICIES: true,
  RLS_STORAGE_ENABLED: true,
  FILE_UPLOAD_VALIDATION: true,
  IMAGE_OPTIMIZATION: true,
  CDN_INTEGRATION: true,
} as const

// Real-time Feature Flags (Step 3.4)
export const REALTIME_FLAGS = {
  // Core Real-time Features
  REALTIME_ENABLED: true,
  REALTIME_PUBLICATION: true,
  WEBSOCKET_CONNECTION: true,
  
  // Subscription Features
  MATCH_SUBSCRIPTIONS: true,
  NOTIFICATION_SUBSCRIPTIONS: true,
  MESSAGE_SUBSCRIPTIONS: true,
  ANNOUNCEMENT_SUBSCRIPTIONS: true,
  
  // Live Features
  LIVE_MATCH_UPDATES: true,
  LIVE_STATISTICS: true,
  LIVE_SCORING: true,
  LIVE_COMMENTARY: true,
  
  // Presence Features
  PRESENCE_TRACKING: true,
  MATCH_PRESENCE: true,
  USER_PRESENCE: true,
  STAT_TAKER_PRESENCE: true,
  
  // Connection Features
  CONNECTION_MONITORING: true,
  AUTO_RECONNECTION: true,
  OFFLINE_QUEUE: true,
  CONNECTION_STATUS: true,
  
  // Advanced Features
  BROWSER_NOTIFICATIONS: true,
  PUSH_NOTIFICATIONS: false, // Not implemented in Step 3.4
  CHANNEL_MANAGEMENT: true,
  PERFORMANCE_MONITORING: true,
} as const

// Combined Feature Flags
export const FEATURE_FLAGS = {
  ...RBAC_FLAGS,
  ...STORAGE_FLAGS,
  ...REALTIME_FLAGS,
  
  // General Features
  PWA_ENABLED: true,
  OFFLINE_SUPPORT: true,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
export type RBACFlag = keyof typeof RBAC_FLAGS
export type StorageFlag = keyof typeof STORAGE_FLAGS
export type RealtimeFlag = keyof typeof REALTIME_FLAGS