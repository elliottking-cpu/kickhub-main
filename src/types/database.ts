// types/database.ts - Database type definitions (Build Guide Step 2.4)
// This file will be expanded in Step 3.1 when database schema is implemented

/**
 * Database type definitions for Supabase
 * 
 * TODO: This will be replaced with generated types from Supabase CLI
 * when the database schema is implemented in Step 3.1
 * 
 * For now, providing basic structure to support the App Router implementation
 */
export interface Database {
  public: {
    Tables: {
      // User management tables
      users: {
        Row: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          updated_at?: string
        }
      }
      
      // Role management tables (from Step 2.3 RBAC)
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          team_id?: string
          is_active: boolean
          created_at: string
          expires_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          team_id?: string
          is_active?: boolean
          created_at?: string
          expires_at?: string
        }
        Update: {
          role?: string
          team_id?: string
          is_active?: boolean
          expires_at?: string
        }
      }
      
      // Placeholder for other tables (will be expanded in Step 3.1)
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          name?: string
        }
      }
    }
    Views: {
      // Database views will be defined here
    }
    Functions: {
      // Database functions will be defined here
    }
    Enums: {
      // Database enums will be defined here
      user_role: 'super_admin' | 'admin' | 'club_official' | 'coach' | 'assistant_coach' | 'parent' | 'player' | 'fan' | 'referee'
    }
  }
}

// Type helpers for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]