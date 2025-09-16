/**
 * Supabase Client Configuration
 * 
 * This file configures the Supabase client for browser-side operations
 * including authentication, database queries, and real-time subscriptions.
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

/**
 * Supabase client for browser-side operations
 * 
 * This client is used for:
 * - Authentication (login, logout, session management)
 * - Database queries from client components
 * - Real-time subscriptions
 * - File uploads to Supabase Storage
 */
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Default client instance
export const supabase = createClient()

// Database table names (will be expanded as schema develops)
export const TABLES = {
  USERS: 'users',
  TEAMS: 'teams',
  PLAYERS: 'players',
  MATCHES: 'matches',
  TRAINING_SESSIONS: 'training_sessions',
  // More tables will be added during database schema implementation
} as const

// Storage bucket names
export const BUCKETS = {
  PLAYER_PHOTOS: 'player-photos',
  TEAM_LOGOS: 'team-logos',
  DOCUMENTS: 'documents',
  MATCH_MEDIA: 'match-media',
  // More buckets will be added as needed
} as const

export type Tables = typeof TABLES
export type Buckets = typeof BUCKETS