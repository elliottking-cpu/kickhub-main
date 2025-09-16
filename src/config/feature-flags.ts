// config/feature-flags.ts - Feature flags configuration
export const FEATURE_FLAGS = {
  RBAC_ENABLED: true,
  MULTI_ROLE_SUPPORT: true,
  COACH_INHERITS_PARENT: true,
  ASSISTANT_INHERITS_PARENT: true,
  REAL_TIME_ENABLED: true,
  OFFLINE_SUPPORT: true,
  PWA_ENABLED: true,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS