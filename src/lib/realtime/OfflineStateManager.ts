/**
 * OfflineStateManager - Handles offline/online state management and data synchronization
 * Queues updates when offline and syncs when connection is restored
 * Based on KickHub Build Guide Step 3.4 specifications (Lines 5484-5566)
 */

import { createClient } from '@/lib/supabase/client'
import type { RealtimeManager } from './RealtimeManager'

export interface PendingUpdate {
  id: string
  type: 'match_statistic' | 'match_event' | 'message' | 'notification'
  data: any
  timestamp: string
  retries: number
  maxRetries: number
}

export interface SyncStats {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  hasFailedUpdates: boolean
  lastSyncAttempt?: Date
  syncError?: string
}

export class OfflineStateManager {
  private isOnline = navigator.onLine
  private pendingUpdates: PendingUpdate[] = []
  private failedUpdates: PendingUpdate[] = []
  private isSyncing = false
  private realtimeManager: RealtimeManager
  private supabase = createClient()
  private syncAttempts = 0
  private maxSyncAttempts = 3
  private lastSyncAttempt?: Date
  private syncError?: string

  constructor(realtimeManager: RealtimeManager) {
    this.realtimeManager = realtimeManager
    this.setupEventListeners()
    this.startPeriodicSync()
  }

  /**
   * Set up browser online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored')
      this.isOnline = true
      this.syncError = undefined
      this.syncPendingUpdates()
      this.resubscribeToChannels()
    })

    window.addEventListener('offline', () => {
      console.log('Connection lost')
      this.isOnline = false
    })

    // Listen for visibility changes to sync when app becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.pendingUpdates.length > 0) {
        this.syncPendingUpdates()
      }
    })
  }

  /**
   * Queue an update when offline or when online sync fails
   */
  queueUpdate(update: Omit<PendingUpdate, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): void {
    const pendingUpdate: PendingUpdate = {
      id: this.generateUpdateId(),
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3,
      ...update
    }

    this.pendingUpdates.push(pendingUpdate)
    console.log('Update queued for sync:', pendingUpdate)

    // Try to sync immediately if online
    if (this.isOnline && !this.isSyncing) {
      this.syncPendingUpdates()
    }
  }

  /**
   * Sync all pending updates when back online
   */
  async syncPendingUpdates(): Promise<void> {
    if (this.isSyncing || this.pendingUpdates.length === 0) return

    this.isSyncing = true
    this.lastSyncAttempt = new Date()
    this.syncError = undefined

    console.log(`Syncing ${this.pendingUpdates.length} pending updates`)
    
    const updatesToSync = [...this.pendingUpdates]
    const syncedUpdates: string[] = []
    
    for (const update of updatesToSync) {
      try {
        await this.processUpdate(update)
        syncedUpdates.push(update.id)
        console.log('Update synced successfully:', update.id)
      } catch (error) {
        console.error('Failed to sync update:', update.id, error)
        
        // Increment retry count
        update.retries++
        
        // Move to failed updates if max retries exceeded
        if (update.retries >= update.maxRetries) {
          this.failedUpdates.push(update)
          syncedUpdates.push(update.id) // Remove from pending even though failed
          console.error('Update failed permanently:', update.id)
        }
      }
    }

    // Remove synced/failed updates from pending
    this.pendingUpdates = this.pendingUpdates.filter(
      update => !syncedUpdates.includes(update.id)
    )

    this.isSyncing = false
    this.syncAttempts++

    // Emit sync completion event
    window.dispatchEvent(new CustomEvent('sync-completed', {
      detail: {
        syncedCount: syncedUpdates.length,
        pendingCount: this.pendingUpdates.length,
        failedCount: this.failedUpdates.length
      }
    }))
  }

  /**
   * Process individual update by type
   */
  private async processUpdate(update: PendingUpdate): Promise<void> {
    switch (update.type) {
      case 'match_statistic':
        await this.supabase.from('match_statistics').insert(update.data)
        break
      
      case 'match_event':
        await this.supabase.from('match_events').insert(update.data)
        break
      
      case 'message':
        await this.supabase.from('messages').insert(update.data)
        break
      
      case 'notification':
        await this.supabase.from('notifications').insert(update.data)
        break
      
      default:
        console.warn('Unknown update type:', update.type)
        throw new Error(`Unknown update type: ${update.type}`)
    }
  }

  /**
   * Resubscribe to real-time channels after reconnection
   */
  private resubscribeToChannels(): void {
    console.log('Resubscribing to real-time channels')
    // This would trigger the RealtimeManager's reconnection logic
    this.realtimeManager.forceReconnect()
  }

  /**
   * Start periodic sync attempts for failed updates
   */
  private startPeriodicSync(): void {
    // Attempt sync every 30 seconds if there are pending updates
    setInterval(() => {
      if (this.isOnline && this.pendingUpdates.length > 0 && !this.isSyncing) {
        this.syncPendingUpdates()
      }
    }, 30000) // 30 seconds
  }

  /**
   * Generate unique ID for updates
   */
  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Force a sync attempt regardless of current state
   */
  async forceSyncAttempt(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline')
    }
    
    this.isSyncing = false // Reset syncing state
    await this.syncPendingUpdates()
  }

  /**
   * Clear all failed updates (admin action)
   */
  clearFailedUpdates(): void {
    this.failedUpdates = []
    console.log('Failed updates cleared')
  }

  /**
   * Retry specific failed update
   */
  async retryFailedUpdate(updateId: string): Promise<boolean> {
    const failedUpdate = this.failedUpdates.find(update => update.id === updateId)
    if (!failedUpdate) return false

    try {
      await this.processUpdate(failedUpdate)
      this.failedUpdates = this.failedUpdates.filter(update => update.id !== updateId)
      console.log('Failed update retried successfully:', updateId)
      return true
    } catch (error) {
      console.error('Retry failed for update:', updateId, error)
      return false
    }
  }

  /**
   * Get current synchronization statistics
   */
  getSyncStats(): SyncStats {
    return {
      isOnline: this.isOnline,
      pendingCount: this.pendingUpdates.length,
      isSyncing: this.isSyncing,
      hasFailedUpdates: this.failedUpdates.length > 0,
      lastSyncAttempt: this.lastSyncAttempt,
      syncError: this.syncError
    }
  }

  /**
   * Get all pending updates (for debugging)
   */
  getPendingUpdates(): PendingUpdate[] {
    return [...this.pendingUpdates]
  }

  /**
   * Get all failed updates (for debugging)
   */
  getFailedUpdates(): PendingUpdate[] {
    return [...this.failedUpdates]
  }

  /**
   * Check if sync is needed
   */
  needsSync(): boolean {
    return this.pendingUpdates.length > 0 || this.failedUpdates.length > 0
  }

  /**
   * Check if sync is possible
   */
  canSync(): boolean {
    return this.isOnline && !this.isSyncing
  }

  /**
   * Get online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline
  }

  /**
   * Manually set online status (for testing)
   */
  setOnlineStatus(isOnline: boolean): void {
    const wasOnline = this.isOnline
    this.isOnline = isOnline
    
    if (!wasOnline && isOnline) {
      // Transitioned from offline to online
      this.syncPendingUpdates()
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Remove event listeners if needed
    window.removeEventListener('online', this.syncPendingUpdates)
    window.removeEventListener('offline', () => { this.isOnline = false })
    document.removeEventListener('visibilitychange', this.syncPendingUpdates)
  }
}

