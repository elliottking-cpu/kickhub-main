/**
 * React Hook for Offline State Management
 * Provides offline/online state management and sync capabilities
 * Based on KickHub Build Guide Step 3.4 specifications
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { OfflineStateManager, type PendingUpdate, type SyncStats } from '@/lib/realtime/OfflineStateManager'
import { useRealtime } from './useRealtime'

/**
 * Hook for managing offline/online state and data synchronization
 * Provides access to the OfflineStateManager and sync status
 */
export function useOfflineState() {
  const { realtimeManager } = useRealtime()
  const [offlineManager] = useState(() => new OfflineStateManager(realtimeManager))
  const [syncStats, setSyncStats] = useState<SyncStats>(offlineManager.getSyncStats())
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null)
  const syncInProgress = useRef(false)

  // Update sync stats periodically
  useEffect(() => {
    const updateStats = () => {
      setSyncStats(offlineManager.getSyncStats())
    }

    const interval = setInterval(updateStats, 2000) // Check every 2 seconds
    updateStats() // Initial update

    return () => clearInterval(interval)
  }, [offlineManager])

  // Listen for sync completion events
  useEffect(() => {
    const handleSyncCompleted = (event: CustomEvent) => {
      setSyncStats(offlineManager.getSyncStats())
      setLastSyncAttempt(new Date())
      syncInProgress.current = false
      
      console.log('Sync completed:', event.detail)
    }

    window.addEventListener('sync-completed', handleSyncCompleted as EventListener)

    return () => {
      window.removeEventListener('sync-completed', handleSyncCompleted as EventListener)
    }
  }, [offlineManager])

  // Queue an update for offline sync
  const queueUpdate = useCallback((update: Omit<PendingUpdate, 'id' | 'timestamp' | 'retries' | 'maxRetries'>) => {
    offlineManager.queueUpdate(update)
    setSyncStats(offlineManager.getSyncStats())
  }, [offlineManager])

  // Force a sync attempt
  const forceSyncAttempt = useCallback(async () => {
    if (syncInProgress.current || !syncStats.isOnline) {
      return false
    }

    try {
      syncInProgress.current = true
      setLastSyncAttempt(new Date())
      await offlineManager.forceSyncAttempt()
      return true
    } catch (error) {
      console.error('Force sync failed:', error)
      return false
    } finally {
      syncInProgress.current = false
      setSyncStats(offlineManager.getSyncStats())
    }
  }, [offlineManager, syncStats.isOnline])

  // Clear failed updates
  const clearFailedUpdates = useCallback(() => {
    offlineManager.clearFailedUpdates()
    setSyncStats(offlineManager.getSyncStats())
  }, [offlineManager])

  // Retry a specific failed update
  const retryFailedUpdate = useCallback(async (updateId: string) => {
    const success = await offlineManager.retryFailedUpdate(updateId)
    setSyncStats(offlineManager.getSyncStats())
    return success
  }, [offlineManager])

  // Get pending updates (for debugging)
  const getPendingUpdates = useCallback(() => {
    return offlineManager.getPendingUpdates()
  }, [offlineManager])

  // Get failed updates (for debugging)  
  const getFailedUpdates = useCallback(() => {
    return offlineManager.getFailedUpdates()
  }, [offlineManager])

  // Manually set online status (for testing)
  const setOnlineStatus = useCallback((isOnline: boolean) => {
    offlineManager.setOnlineStatus(isOnline)
    setSyncStats(offlineManager.getSyncStats())
  }, [offlineManager])

  return {
    // Core state
    isOnline: syncStats.isOnline,
    pendingUpdatesCount: syncStats.pendingCount,
    isSyncing: syncStats.isSyncing,
    hasFailedUpdates: syncStats.hasFailedUpdates,
    lastSyncAttempt: syncStats.lastSyncAttempt || lastSyncAttempt,
    syncError: syncStats.syncError,

    // Actions
    queueUpdate,
    forceSyncAttempt,
    clearFailedUpdates,
    retryFailedUpdate,
    
    // Utility
    canSync: offlineManager.canSync(),
    needsSync: offlineManager.needsSync(),
    getPendingUpdates,
    getFailedUpdates,
    setOnlineStatus, // For testing

    // Complete sync stats object
    syncStats
  }
}

/**
 * Hook for offline-capable match statistics recording
 * Queues statistics when offline and syncs when online
 */
export function useMatchStatisticsOffline(matchId: string | null) {
  const { queueUpdate, isOnline, isSyncing } = useOfflineState()
  const [recordedStats, setRecordedStats] = useState<any[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const recordStatistic = useCallback(async (statData: {
    player_id: string
    stat_type: string
    value: number
    minute: number
    half: string
  }) => {
    if (!matchId) throw new Error('No match ID provided')

    setIsRecording(true)
    
    try {
      const statisticRecord = {
        ...statData,
        match_id: matchId,
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      }

      // Add to local state immediately for UI feedback
      setRecordedStats(prev => [...prev, statisticRecord])

      if (isOnline) {
        // Try to save directly if online
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { error } = await supabase
          .from('match_statistics')
          .insert(statisticRecord)

        if (error) {
          // If direct save fails, queue for later
          queueUpdate({
            type: 'match_statistic',
            data: statisticRecord
          })
        }
      } else {
        // Queue for offline sync
        queueUpdate({
          type: 'match_statistic', 
          data: statisticRecord
        })
      }
    } finally {
      setIsRecording(false)
    }
  }, [matchId, isOnline, queueUpdate])

  const clearLocalStats = useCallback(() => {
    setRecordedStats([])
  }, [])

  return {
    recordStatistic,
    recordedStats,
    isRecording,
    isOfflineMode: !isOnline,
    isSyncing,
    clearLocalStats,
    localStatsCount: recordedStats.length
  }
}

/**
 * Hook for offline-capable team messaging
 * Queues messages when offline and syncs when online
 */
export function useTeamMessagesOffline(teamId: string | null) {
  const { queueUpdate, isOnline, isSyncing } = useOfflineState()
  const [pendingMessages, setPendingMessages] = useState<any[]>([])
  const [isSending, setIsSending] = useState(false)

  const sendMessage = useCallback(async (content: string, messageType: string = 'text') => {
    if (!teamId || !content.trim()) return

    setIsSending(true)

    try {
      const messageRecord = {
        team_id: teamId,
        content: content.trim(),
        message_type: messageType,
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        is_pending: true
      }

      // Add to pending messages for immediate UI feedback
      setPendingMessages(prev => [...prev, messageRecord])

      if (isOnline) {
        // Try to send directly if online
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { error } = await supabase
          .from('messages')
          .insert(messageRecord)

        if (error) {
          // If direct send fails, queue for later
          queueUpdate({
            type: 'message',
            data: messageRecord
          })
        } else {
          // Remove from pending if successful
          setPendingMessages(prev => prev.filter(msg => msg.id !== messageRecord.id))
        }
      } else {
        // Queue for offline sync
        queueUpdate({
          type: 'message',
          data: messageRecord
        })
      }
    } finally {
      setIsSending(false)
    }
  }, [teamId, isOnline, queueUpdate])

  const clearPendingMessages = useCallback(() => {
    setPendingMessages([])
  }, [])

  return {
    sendMessage,
    pendingMessages,
    isSending,
    isOfflineMode: !isOnline,
    isSyncing,
    clearPendingMessages,
    pendingCount: pendingMessages.length
  }
}

/**
 * Hook for offline state debugging and monitoring
 * Provides detailed information about offline state for development
 */
export function useOfflineStateDebug() {
  const offlineState = useOfflineState()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        navigator_online: navigator.onLine,
        pending_updates: offlineState.getPendingUpdates(),
        failed_updates: offlineState.getFailedUpdates(),
        sync_stats: offlineState.syncStats,
        browser_support: {
          service_worker: 'serviceWorker' in navigator,
          indexeddb: 'indexedDB' in window,
          websockets: 'WebSocket' in window,
          notifications: 'Notification' in window
        }
      })
    }

    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [offlineState])

  return {
    ...offlineState,
    debugInfo,
    exportDebugInfo: () => JSON.stringify(debugInfo, null, 2)
  }
}
