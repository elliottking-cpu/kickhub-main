/**
 * RealtimeManager - Comprehensive real-time subscription management
 * Handles all real-time subscriptions, connection management, and error handling
 * Based on KickHub Build Guide Step 3.4 specifications (Lines 5027-5374)
 */

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Types for real-time events
export interface RealtimePayload {
  type: 'match_update' | 'statistics_update' | 'notification' | 'announcement' | 'message' | 'message_update'
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  data: any
  timestamp: Date
}

export interface UserPresenceInfo {
  id: string
  name: string
  role: string
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

export class RealtimeManager {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private connectionStatus: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.setupConnectionMonitoring()
  }

  /**
   * Subscribe to live match updates for coaches and parents
   * Handles both match data changes and statistics updates
   */
  subscribeToMatchUpdates(matchId: string, callback: (payload: RealtimePayload) => void): RealtimeChannel {
    const channelName = `match-${matchId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('Match update:', payload)
          callback({
            type: 'match_update',
            event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            data: payload.new || payload.old,
            timestamp: new Date()
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_statistics',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Match statistics update:', payload)
          callback({
            type: 'statistics_update',
            event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            data: payload.new || payload.old,
            timestamp: new Date()
          })
        }
      )
      .subscribe((status) => {
        console.log(`Match channel ${channelName} status:`, status)
        if (status === 'SUBSCRIBED') {
          this.connectionStatus = 'connected'
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to team notifications for all team members
   * Handles both personal notifications and team announcements
   */
  subscribeToTeamNotifications(teamId: string, userId: string, callback: (payload: RealtimePayload) => void): RealtimeChannel {
    const channelName = `team-notifications-${teamId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification:', payload)
          callback({
            type: 'notification',
            event: 'INSERT',
            data: payload.new,
            timestamp: new Date()
          })
          
          // Show browser notification if permission granted
          this.showBrowserNotification(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_announcements',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('Team announcement:', payload)
          callback({
            type: 'announcement',
            event: 'INSERT',
            data: payload.new,
            timestamp: new Date()
          })
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to real-time team messaging
   * Handles message creation and updates
   */
  subscribeToTeamMessages(teamId: string, callback: (payload: RealtimePayload) => void): RealtimeChannel {
    const channelName = `team-messages-${teamId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('New message:', payload)
          callback({
            type: 'message',
            event: 'INSERT',
            data: payload.new,
            timestamp: new Date()
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('Message updated:', payload)
          callback({
            type: 'message_update',
            event: 'UPDATE',
            data: payload.new,
            timestamp: new Date()
          })
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to presence tracking for live match participation
   * Tracks who's actively participating in a match
   */
  subscribeToMatchPresence(matchId: string, userInfo: UserPresenceInfo): RealtimeChannel {
    const channelName = `match-presence-${matchId}`
    
    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        console.log('Match presence sync:', newState)
        this.handlePresenceSync(newState)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined match:', key, newPresences)
        this.handlePresenceJoin(key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left match:', key, leftPresences)
        this.handlePresenceLeave(key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userInfo.id,
            name: userInfo.name,
            role: userInfo.role,
            online_at: new Date().toISOString(),
            match_id: matchId
          })
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribe to broadcast events for real-time match events
   * Handles goals, cards, substitutions, formation changes
   */
  subscribeToMatchBroadcast(matchId: string, callback: (payload: any) => void): RealtimeChannel {
    const channelName = `match-broadcast-${matchId}`
    
    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: 'match_event' }, (payload) => {
        console.log('Match event broadcast:', payload)
        callback(payload)
      })
      .on('broadcast', { event: 'formation_change' }, (payload) => {
        console.log('Formation change broadcast:', payload)
        callback(payload)
      })
      .on('broadcast', { event: 'substitution' }, (payload) => {
        console.log('Substitution broadcast:', payload)
        callback(payload)
      })
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Broadcast match events to all subscribers
   * Used by coaches and stat takers to send live updates
   */
  async broadcastMatchEvent(matchId: string, eventType: string, eventData: any): Promise<void> {
    const channelName = `match-broadcast-${matchId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload: {
          ...eventData,
          timestamp: new Date().toISOString(),
          match_id: matchId
        }
      })
    }
  }

  /**
   * Connection management and error handling
   * Sets up monitoring for connection state changes
   */
  private setupConnectionMonitoring(): void {
    // Monitor connection status
    this.supabase.realtime.onOpen(() => {
      console.log('Realtime connection opened')
      this.connectionStatus = 'connected'
      this.reconnectAttempts = 0
    })

    this.supabase.realtime.onClose(() => {
      console.log('Realtime connection closed')
      this.connectionStatus = 'disconnected'
      this.handleReconnection()
    })

    this.supabase.realtime.onError((error) => {
      console.error('Realtime connection error:', error)
      this.connectionStatus = 'disconnected'
      this.handleReconnection()
    })
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.connectionStatus = 'connecting'
    this.reconnectAttempts++
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      // Resubscribe to all channels
      this.resubscribeAllChannels()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  /**
   * Resubscribe to all active channels after reconnection
   */
  private async resubscribeAllChannels(): Promise<void> {
    for (const [channelName, channel] of this.channels) {
      try {
        await channel.subscribe()
        console.log(`Resubscribed to channel: ${channelName}`)
      } catch (error) {
        console.error(`Failed to resubscribe to channel ${channelName}:`, error)
      }
    }
  }

  /**
   * Handle presence synchronization events
   */
  private handlePresenceSync(presenceState: any): void {
    // Update UI with current presence information
    const activeUsers = Object.keys(presenceState).map(key => presenceState[key][0])
    console.log('Active users in match:', activeUsers)
    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('presence-sync', { detail: activeUsers }))
  }

  /**
   * Handle user joining presence
   */
  private handlePresenceJoin(key: string, newPresences: any[]): void {
    console.log('User joined:', newPresences)
    window.dispatchEvent(new CustomEvent('user-joined', { detail: newPresences[0] }))
  }

  /**
   * Handle user leaving presence
   */
  private handlePresenceLeave(key: string, leftPresences: any[]): void {
    console.log('User left:', leftPresences)
    window.dispatchEvent(new CustomEvent('user-left', { detail: leftPresences[0] }))
  }

  /**
   * Show browser notifications for important events
   */
  private async showBrowserNotification(notification: any): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      })
    }
  }

  // Public API methods

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribeFromChannel(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all channels and cleanup
   */
  unsubscribeAll(): void {
    for (const [channelName, channel] of this.channels) {
      this.supabase.removeChannel(channel)
    }
    this.channels.clear()
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /**
   * Get list of active channel names
   */
  getActiveChannelNames(): string[] {
    return Array.from(this.channels.keys())
  }

  /**
   * Get count of active channels
   */
  getActiveChannelsCount(): number {
    return this.channels.size
  }

  /**
   * Force connection reset
   */
  async forceReconnect(): Promise<void> {
    this.reconnectAttempts = 0
    await this.handleReconnection()
  }
}
