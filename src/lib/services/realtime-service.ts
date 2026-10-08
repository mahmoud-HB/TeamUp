import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isDemoMode } from '@/lib/config'

export interface MessageEvent {
  id: string
  sender_id: string
  conversation_id: string
  content: string
  created_at: string
}

export interface NotificationEventPayload {
  id: string
  user_id: string
  type: string
  content: string
  read: boolean
  created_at: string
}

/**
 * Realtime service for WebSocket subscriptions.
 * Handles live messaging and notifications via Supabase Realtime.
 * Demo mode: simulates events with 2s delay.
 */

const MOCK_REALTIME_LISTENERS: Map<string, (data: any) => void> = new Map()

export const realtimeService = {
  /**
   * Subscribe to message updates in a conversation
   */
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: MessageEvent) => void
  ) {
    if (isDemoMode()) {
      // Store listener for demo mode
      MOCK_REALTIME_LISTENERS.set(`messages-${conversationId}`, onMessage)
      return () => {
        MOCK_REALTIME_LISTENERS.delete(`messages-${conversationId}`)
      }
    }

    const supabase = createSupabaseBrowserClient()
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: any) => {
          onMessage({
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            conversation_id: payload.new.conversation_id,
            content: payload.new.content,
            created_at: payload.new.created_at
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  },

  /**
   * Subscribe to notification updates for current user
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: NotificationEventPayload) => void
  ) {
    if (isDemoMode()) {
      MOCK_REALTIME_LISTENERS.set(`notifications-${userId}`, onNotification)
      return () => {
        MOCK_REALTIME_LISTENERS.delete(`notifications-${userId}`)
      }
    }

    const supabase = createSupabaseBrowserClient()
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          onNotification({
            id: payload.new.id,
            user_id: payload.new.user_id,
            type: payload.new.type,
            content: payload.new.content,
            read: payload.new.read,
            created_at: payload.new.created_at
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  },

  /**
   * Emit demo event (for testing realtime in demo mode)
   */
  emitDemoEvent(channel: string, data: any) {
    const listener = MOCK_REALTIME_LISTENERS.get(channel)
    if (listener) {
      setTimeout(() => listener(data), 2000)
    }
  }
}
