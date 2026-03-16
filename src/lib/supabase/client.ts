/**
 * Supabase Client Configuration for Shemt
 * 
 * Handles authentication and database operations.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication may not work.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

/**
 * Type definitions for Supabase
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          plan: string
          avatar_url?: string
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          plan?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          plan?: string
          avatar_url?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
