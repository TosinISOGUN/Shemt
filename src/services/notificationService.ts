import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'billing' | 'insight'

export interface AppNotification {
  id: string
  user_id: string
  project_id?: string | null
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  read_at?: string | null
  created_at: string
}

class NotificationService {
  /**
   * Create a new notification programmatically
   */
  async createNotification(data: {
    user_id: string
    project_id?: string | null
    title: string
    message: string
    type: NotificationType
  }): Promise<boolean> {
    const { error } = await supabase.from('notifications').insert([data])

    if (error) {
      console.error('Error creating notification:', error)
      return false
    }
    return true
  }

  /**
   * Fetch all notifications for a user, sorted by most recent
   */
  async getNotifications(userId: string, limit: number = 20): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
    return data as AppNotification[]
  }

  /**
   * Fetch only the unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
    return count || 0
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
    return true
  }

  /**
   * Mark all notifications as read for a given user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
    return true
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }
    return true
  }

  /**
   * Subscribe to real-time notification changes for a user
   * Useful for instantly updating the badge counter.
   */
  subscribeToNotifications(userId: string, callback: () => void): RealtimeChannel {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime Notification change received!', payload)
          callback()
        }
      )
      .subscribe()

    return channel
  }
}

export const notificationService = new NotificationService()
