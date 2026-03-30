/**
 * Auth Context - Authentication state management for Shemt
 * 
 * Provides:
 * - Current user state
 * - Session management
 * - Auth methods (signUp, signIn, signOut, resetPassword)
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  Session,
  AuthError 
} from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { User as AppUser } from '@/lib/supabase/client'
import { notificationService } from '@/services/notificationService'

interface AuthContextType {
  user: AppUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from users table
  const fetchUserProfile = async (userId: string, email?: string, name?: string): Promise<AppUser | null> => {
    console.log(`AuthProvider: [Profile] Fetching for ${userId}...`)
    try {
      // Add a 3-second timeout to the database query itself
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile Query Timeout')), 3000)
      )

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.warn('AuthProvider: [Profile] Not found or error:', error.message)
        return {
          id: userId,
          email: email || '',
          name: name || 'User',
          plan: 'free',
          created_at: new Date().toISOString()
        } as AppUser
      }

      console.log('AuthProvider: [Profile] Successfully fetched.')
      return data as AppUser
    } catch (error: any) {
      console.warn('AuthProvider: [Profile] Fallback triggered due to:', error.message)
      return {
        id: userId,
        email: email || '',
        name: name || 'User',
        plan: 'free',
        created_at: new Date().toISOString()
      } as AppUser
    }
  }

  // Initialize auth state
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn('AuthProvider: Loading safety timeout triggered.')
        setLoading(false)
      }
    }, 6000)

    const initializeAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('getSession Timeout')), 4000));
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session?.user) {
          setSession(session)
          const profile = await fetchUserProfile(
            session.user.id, 
            session.user.email,
            session.user.user_metadata?.name
          )
          setUser(profile)
        }
      } catch (error: any) {
        console.error('AuthProvider: Initialization error:', error.message)
      } finally {
        setLoading(false)
        clearTimeout(safetyTimer)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          // Set skeleton user immediately
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            plan: 'free',
            created_at: new Date().toISOString()
          } as AppUser)

          setLoading(false)

          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name
          )
          setUser(profile)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign up
  const signUp = async (
    email: string, 
    password: string, 
    name: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) return { error }

      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            plan: 'free',
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        } else {
          // Send automatic onboarding notification!
          await notificationService.createNotification({
            user_id: data.user.id,
            title: 'Welcome to Shemt! 🎉',
            message: 'Your account is fully set up. Head over to your dashboard to create your first project and start tracking analytics.',
            type: 'success'
          })
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign in
  const signIn = async (
    email: string, 
    password: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Reset password
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<AppUser>): Promise<{ error: Error | null }> => {
    if (!user?.id) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
