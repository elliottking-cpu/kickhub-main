/**
 * React Hooks for Real-time Integration
 * Provides easy-to-use hooks for real-time subscriptions
 * Based on KickHub Build Guide Step 3.4 specifications
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { RealtimeManager, type RealtimePayload, type UserPresenceInfo, type ConnectionStatus } from '@/lib/realtime/RealtimeManager'
import { createClient } from '@/lib/supabase/client'

/**
 * Main hook for real-time functionality
 * Provides access to the RealtimeManager and connection status
 */
export function useRealtime() {
  const [realtimeManager] = useState(() => new RealtimeManager())
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(realtimeManager.getConnectionStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [realtimeManager])

  return {
    realtimeManager,
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  }
}

/**
 * Hook for live match updates
 * Subscribes to real-time match data and statistics
 */
export function useMatchUpdates(matchId: string | null) {
  const { realtimeManager } = useRealtime()
  const [matchData, setMatchData] = useState<any>(null)
  const [statistics, setStatistics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!matchId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const handleUpdate = (payload: RealtimePayload) => {
      switch (payload.type) {
        case 'match_update':
          setMatchData(payload.data)
          break
        case 'statistics_update':
          setStatistics(prev => {
            const updated = [...prev]
            const index = updated.findIndex(stat => stat.id === payload.data.id)
            if (index >= 0) {
              updated[index] = payload.data
            } else {
              updated.push(payload.data)
            }
            return updated
          })
          break
      }
    }

    const channel = realtimeManager.subscribeToMatchUpdates(matchId, handleUpdate)
    setIsLoading(false)

    return () => {
      realtimeManager.unsubscribeFromChannel(`match-${matchId}`)
    }
  }, [matchId, realtimeManager])

  return { 
    matchData, 
    statistics, 
    isLoading,
    isSubscribed: !!matchId && !isLoading
  }
}

/**
 * Hook for team notifications
 * Handles real-time notifications and announcements
 */
export function useTeamNotifications(teamId: string | null, userId: string | null) {
  const { realtimeManager } = useRealtime()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!teamId || !userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const handleNotification = (payload: RealtimePayload) => {
      switch (payload.type) {
        case 'notification':
        case 'announcement':
          setNotifications(prev => [payload.data, ...prev])
          if (!payload.data.is_read) {
            setUnreadCount(prev => prev + 1)
          }
          break
      }
    }

    const channel = realtimeManager.subscribeToTeamNotifications(teamId, userId, handleNotification)
    setIsLoading(false)

    return () => {
      realtimeManager.unsubscribeFromChannel(`team-notifications-${teamId}`)
    }
  }, [teamId, userId, realtimeManager])

  const markAsRead = useCallback(async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    )
    setUnreadCount(0)
  }, [userId])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    hasUnread: unreadCount > 0
  }
}

/**
 * Hook for team messages
 * Real-time team messaging functionality
 */
export function useTeamMessages(teamId: string | null) {
  const { realtimeManager } = useRealtime()
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!teamId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const handleMessage = (payload: RealtimePayload) => {
      switch (payload.type) {
        case 'message':
          setMessages(prev => [...prev, payload.data])
          break
        case 'message_update':
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.data.id ? payload.data : msg
            )
          )
          break
      }
    }

    const channel = realtimeManager.subscribeToTeamMessages(teamId, handleMessage)
    setIsLoading(false)

    return () => {
      realtimeManager.unsubscribeFromChannel(`team-messages-${teamId}`)
    }
  }, [teamId, realtimeManager])

  const sendMessage = useCallback(async (content: string) => {
    if (!teamId) return

    const supabase = createClient()
    await supabase
      .from('messages')
      .insert({
        team_id: teamId,
        content,
        created_at: new Date().toISOString()
      })
  }, [teamId])

  return {
    messages,
    isLoading,
    sendMessage,
    hasMessages: messages.length > 0
  }
}

/**
 * Hook for match presence tracking
 * Tracks live user presence during matches
 */
export function useMatchPresence(matchId: string | null, userInfo: UserPresenceInfo | null) {
  const { realtimeManager } = useRealtime()
  const [activeUsers, setActiveUsers] = useState<UserPresenceInfo[]>([])
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    if (!matchId || !userInfo) {
      return
    }

    const handlePresenceSync = (event: CustomEvent) => {
      setActiveUsers(event.detail || [])
    }

    const handleUserJoined = (event: CustomEvent) => {
      setActiveUsers(prev => {
        const exists = prev.some(user => user.id === event.detail.user_id)
        return exists ? prev : [...prev, event.detail]
      })
    }

    const handleUserLeft = (event: CustomEvent) => {
      setActiveUsers(prev => 
        prev.filter(user => user.id !== event.detail.user_id)
      )
    }

    window.addEventListener('presence-sync', handlePresenceSync as EventListener)
    window.addEventListener('user-joined', handleUserJoined as EventListener)
    window.addEventListener('user-left', handleUserLeft as EventListener)

    const channel = realtimeManager.subscribeToMatchPresence(matchId, userInfo)
    setIsTracking(true)

    return () => {
      window.removeEventListener('presence-sync', handlePresenceSync as EventListener)
      window.removeEventListener('user-joined', handleUserJoined as EventListener)
      window.removeEventListener('user-left', handleUserLeft as EventListener)
      realtimeManager.unsubscribeFromChannel(`match-presence-${matchId}`)
      setIsTracking(false)
    }
  }, [matchId, userInfo, realtimeManager])

  return {
    activeUsers,
    isTracking,
    userCount: activeUsers.length,
    isUserActive: userInfo ? activeUsers.some(user => user.id === userInfo.id) : false
  }
}

/**
 * Hook for match broadcast events
 * Handles real-time match events like goals, cards, etc.
 */
export function useMatchBroadcast(matchId: string | null) {
  const { realtimeManager } = useRealtime()
  const [broadcastEvents, setBroadcastEvents] = useState<any[]>([])
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (!matchId) {
      return
    }

    const handleBroadcast = (payload: any) => {
      setBroadcastEvents(prev => [...prev, payload])
    }

    const channel = realtimeManager.subscribeToMatchBroadcast(matchId, handleBroadcast)
    setIsListening(true)

    return () => {
      realtimeManager.unsubscribeFromChannel(`match-broadcast-${matchId}`)
      setIsListening(false)
    }
  }, [matchId, realtimeManager])

  const broadcastEvent = useCallback(async (eventType: string, eventData: any) => {
    if (!matchId) return

    await realtimeManager.broadcastMatchEvent(matchId, eventType, eventData)
  }, [matchId, realtimeManager])

  return {
    broadcastEvents,
    isListening,
    broadcastEvent,
    eventCount: broadcastEvents.length
  }
}

/**
 * Hook for connection status monitoring
 * Provides detailed connection information
 */
export function useConnectionStatus() {
  const { realtimeManager, connectionStatus, isConnected } = useRealtime()
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [lastConnected, setLastConnected] = useState<Date | null>(null)

  useEffect(() => {
    if (isConnected) {
      setLastConnected(new Date())
      setReconnectAttempts(0)
    }
  }, [isConnected])

  const forceReconnect = useCallback(async () => {
    setReconnectAttempts(prev => prev + 1)
    await realtimeManager.forceReconnect()
  }, [realtimeManager])

  return {
    connectionStatus,
    isConnected,
    reconnectAttempts,
    lastConnected,
    forceReconnect,
    activeChannels: realtimeManager.getActiveChannelNames(),
    channelCount: realtimeManager.getActiveChannelsCount()
  }
}
