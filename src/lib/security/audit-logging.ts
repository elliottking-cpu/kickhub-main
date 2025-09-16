// src/lib/security/audit-logging.ts - Security Audit Logging
import { createClient } from '@/lib/supabase/server'

export interface SecurityEvent {
  type: 'unauthorized_access' | 'role_violation' | 'csrf_violation' | 'rate_limit_exceeded' | 'auth_failure' | 'permission_denied'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  sessionId?: string
  ip: string
  userAgent: string
  path: string
  method: string
  details?: Record<string, any>
  timestamp?: Date
}

export interface AuditLogEntry extends SecurityEvent {
  id: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  notes?: string
}

export class SecurityAuditLogger {
  private static readonly MAX_BATCH_SIZE = 100
  private static readonly BATCH_TIMEOUT = 5000 // 5 seconds
  private static eventQueue: SecurityEvent[] = []
  private static batchTimer: NodeJS.Timeout | null = null

  /**
   * Log a security event
   */
  static async logEvent(event: SecurityEvent): Promise<void> {
    // Add timestamp if not provided
    const eventWithTimestamp: SecurityEvent = {
      ...event,
      timestamp: event.timestamp || new Date()
    }

    // For critical events, log immediately
    if (event.severity === 'critical') {
      await this.writeEventToDatabase(eventWithTimestamp)
      return
    }

    // For other events, batch them for performance
    this.eventQueue.push(eventWithTimestamp)

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushEventQueue()
      }, this.BATCH_TIMEOUT)
    }

    // Flush immediately if batch is full
    if (this.eventQueue.length >= this.MAX_BATCH_SIZE) {
      this.flushEventQueue()
    }
  }

  /**
   * Log unauthorized access attempt
   */
  static async logUnauthorizedAccess(details: {
    userId?: string
    ip: string
    userAgent: string
    path: string
    method: string
    requiredRoles?: string[]
    userRoles?: string[]
    reason?: string
  }): Promise<void> {
    await this.logEvent({
      type: 'unauthorized_access',
      severity: 'medium',
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      path: details.path,
      method: details.method,
      details: {
        requiredRoles: details.requiredRoles,
        userRoles: details.userRoles,
        reason: details.reason
      }
    })
  }

  /**
   * Log role violation
   */
  static async logRoleViolation(details: {
    userId: string
    ip: string
    userAgent: string
    path: string
    method: string
    requiredRole: string
    actualRoles: string[]
  }): Promise<void> {
    await this.logEvent({
      type: 'role_violation',
      severity: 'high',
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      path: details.path,
      method: details.method,
      details: {
        requiredRole: details.requiredRole,
        actualRoles: details.actualRoles
      }
    })
  }

  /**
   * Log CSRF violation
   */
  static async logCSRFViolation(details: {
    userId?: string
    ip: string
    userAgent: string
    path: string
    method: string
  }): Promise<void> {
    await this.logEvent({
      type: 'csrf_violation',
      severity: 'high',
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      path: details.path,
      method: details.method
    })
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(details: {
    userId?: string
    ip: string
    userAgent: string
    path: string
    method: string
    limit: number
    attempts: number
  }): Promise<void> {
    await this.logEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      path: details.path,
      method: details.method,
      details: {
        limit: details.limit,
        attempts: details.attempts
      }
    })
  }

  /**
   * Log authentication failure
   */
  static async logAuthFailure(details: {
    email?: string
    ip: string
    userAgent: string
    path: string
    method: string
    reason: string
  }): Promise<void> {
    await this.logEvent({
      type: 'auth_failure',
      severity: 'medium',
      ip: details.ip,
      userAgent: details.userAgent,
      path: details.path,
      method: details.method,
      details: {
        email: details.email,
        reason: details.reason
      }
    })
  }

  /**
   * Log permission denied
   */
  static async logPermissionDenied(details: {
    userId: string
    ip: string
    userAgent: string
    path: string
    method: string
    permission: string
    resource?: string
  }): Promise<void> {
    await this.logEvent({
      type: 'permission_denied',
      severity: 'medium',
      userId: details.userId,
      ip: details.ip,
      userAgent: details.userAgent,
      path: details.path,
      method: details.method,
      details: {
        permission: details.permission,
        resource: details.resource
      }
    })
  }

  /**
   * Flush event queue to database
   */
  private static async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const eventsToFlush = [...this.eventQueue]
    this.eventQueue = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      await this.writeBatchToDatabase(eventsToFlush)
    } catch (error) {
      console.error('Failed to write security audit log batch:', error)
      // Re-queue events for retry (but don't let queue grow indefinitely)
      if (this.eventQueue.length < this.MAX_BATCH_SIZE * 2) {
        this.eventQueue.unshift(...eventsToFlush)
      }
    }
  }

  /**
   * Write single event to database
   */
  private static async writeEventToDatabase(event: SecurityEvent): Promise<void> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          type: event.type,
          severity: event.severity,
          user_id: event.userId,
          session_id: event.sessionId,
          ip_address: event.ip,
          user_agent: event.userAgent,
          path: event.path,
          method: event.method,
          details: event.details || {},
          timestamp: event.timestamp || new Date(),
          resolved: false
        })

      if (error) {
        console.error('Failed to write security audit log:', error)
      }
    } catch (error) {
      console.error('Security audit logging error:', error)
    }
  }

  /**
   * Write batch of events to database
   */
  private static async writeBatchToDatabase(events: SecurityEvent[]): Promise<void> {
    if (events.length === 0) return

    try {
      const supabase = await createClient()
      
      const records = events.map(event => ({
        type: event.type,
        severity: event.severity,
        user_id: event.userId,
        session_id: event.sessionId,
        ip_address: event.ip,
        user_agent: event.userAgent,
        path: event.path,
        method: event.method,
        details: event.details || {},
        timestamp: event.timestamp || new Date(),
        resolved: false
      }))

      const { error } = await supabase
        .from('security_audit_log')
        .insert(records)

      if (error) {
        console.error('Failed to write security audit log batch:', error)
        throw error
      }
    } catch (error) {
      console.error('Security audit logging batch error:', error)
      throw error
    }
  }

  /**
   * Get recent security events
   */
  static async getRecentEvents(
    limit = 100,
    severity?: SecurityEvent['severity'],
    type?: SecurityEvent['type']
  ): Promise<AuditLogEntry[]> {
    try {
      const supabase = await createClient()
      
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (severity) {
        query = query.eq('severity', severity)
      }

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch security audit log:', error)
        return []
      }

      return data?.map(record => ({
        id: record.id,
        type: record.type,
        severity: record.severity,
        userId: record.user_id,
        sessionId: record.session_id,
        ip: record.ip_address,
        userAgent: record.user_agent,
        path: record.path,
        method: record.method,
        details: record.details,
        timestamp: new Date(record.timestamp),
        resolved: record.resolved,
        resolvedAt: record.resolved_at ? new Date(record.resolved_at) : undefined,
        resolvedBy: record.resolved_by,
        notes: record.notes
      })) || []
    } catch (error) {
      console.error('Error fetching security audit log:', error)
      return []
    }
  }

  /**
   * Mark security event as resolved
   */
  static async resolveEvent(
    eventId: string,
    resolvedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('security_audit_log')
        .update({
          resolved: true,
          resolved_at: new Date(),
          resolved_by: resolvedBy,
          notes
        })
        .eq('id', eventId)

      if (error) {
        console.error('Failed to resolve security event:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error resolving security event:', error)
      return false
    }
  }

  /**
   * Get security statistics
   */
  static async getSecurityStats(days = 7): Promise<{
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    topIPs: Array<{ ip: string, count: number }>
    resolvedPercentage: number
  }> {
    try {
      const supabase = await createClient()
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('type, severity, ip_address, resolved')
        .gte('timestamp', since.toISOString())

      if (error || !data) {
        return {
          totalEvents: 0,
          eventsByType: {},
          eventsBySeverity: {},
          topIPs: [],
          resolvedPercentage: 0
        }
      }

      const eventsByType: Record<string, number> = {}
      const eventsBySeverity: Record<string, number> = {}
      const ipCounts: Record<string, number> = {}
      let resolvedCount = 0

      for (const event of data) {
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
        ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1
        
        if (event.resolved) {
          resolvedCount++
        }
      }

      const topIPs = Object.entries(ipCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))

      const resolvedPercentage = data.length > 0 
        ? Math.round((resolvedCount / data.length) * 100)
        : 0

      return {
        totalEvents: data.length,
        eventsByType,
        eventsBySeverity,
        topIPs,
        resolvedPercentage
      }
    } catch (error) {
      console.error('Error fetching security stats:', error)
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        topIPs: [],
        resolvedPercentage: 0
      }
    }
  }

  /**
   * Force flush any pending events (call on shutdown)
   */
  static async shutdown(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    
    await this.flushEventQueue()
  }
}
