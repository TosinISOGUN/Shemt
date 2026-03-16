/**
 * Analytics Service Layer for Shemt
 * 
 * Handles fetching analytics data from Supabase.
 */

import { supabase } from '@/lib/supabase/client'

export interface DashboardMetrics {
  revenue: number
  activeUsers: number
  conversionRate: number
}

export interface ChartData {
  date: string
  value: number
}

export const analyticsService = {
  /**
   * Get overall dashboard metrics for a user
   */
  getDashboardMetrics: async (userId: string): Promise<DashboardMetrics> => {
    const { data, error } = await supabase
      .from('metrics_summary')
      .select('revenue, active_users, conversion_rate')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching dashboard metrics:', error)
      // Return defaults if not found
      return { revenue: 0, activeUsers: 0, conversionRate: 0 }
    }

    return {
      revenue: data.revenue,
      activeUsers: data.active_users,
      conversionRate: data.conversion_rate
    }
  },

  /**
   * Get revenue history for the revenue trend chart
   */
  getRevenueHistory: async (userId: string): Promise<ChartData[]> => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at, value')
      .eq('user_id', userId)
      .eq('event_type', 'revenue')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching revenue history:', error)
      return []
    }

    // Group by month/day depending on resolution (simplified here)
    return data.map(event => ({
      date: new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: event.value
    }))
  },

  /**
   * Get user growth data for the user growth chart
   */
  getUserGrowth: async (userId: string): Promise<ChartData[]> => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at, value')
      .eq('user_id', userId)
      .eq('event_type', 'user_signup')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching user growth history:', error)
      return []
    }

    return data.map(event => ({
      date: new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: event.value
    }))
  },

  /**
   * Seed sample data for a new user
   * (Helper function for demo purposes)
   */
  seedSampleData: async (userId: string) => {
    // Check if data already exists
    const { count } = await supabase
      .from('metrics_summary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count > 0) return

    // Insert metrics summary
    await supabase.from('metrics_summary').insert({
      user_id: userId,
      revenue: 32500,
      active_users: 926,
      conversion_rate: 3.2
    })

    // Insert sample revenue events
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const values = [4500, 5200, 4800, 6100, 5500, 6700]
    
    const events = months.map((month, i) => ({
      user_id: userId,
      event_type: 'revenue',
      value: values[i],
      created_at: new Date(2024, i, 1).toISOString()
    }))

    // Insert sample user signup events
    const userValues = [120, 145, 132, 178, 156, 195]
    const userEvents = months.map((month, i) => ({
      user_id: userId,
      event_type: 'user_signup',
      value: userValues[i],
      created_at: new Date(2024, i, 1).toISOString()
    }))

    await supabase.from('analytics_events').insert([...events, ...userEvents])
  }
}
