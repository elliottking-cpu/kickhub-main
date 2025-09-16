// src/lib/security/rate-limiting.ts - Rate Limiting for Route Protection
import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  requests: number[]
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

export class RateLimiter {
  private static store = new Map<string, RateLimitEntry>()
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private static cleanupTimer: NodeJS.Timeout | null = null

  // Default rate limit configurations
  private static readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    // General API rate limiting
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    },
    
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // Strict limit for login attempts
    },
    
    // Password reset
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
    },
    
    // File uploads
    upload: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
    },
    
    // Route protection middleware
    middleware: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 200, // High limit for normal browsing
    }
  }

  static {
    // Start cleanup timer for server-side only
    if (typeof window === 'undefined') {
      this.startCleanup()
    }
  }

  /**
   * Check if request should be rate limited
   */
  static checkLimit(
    identifier: string,
    configName: keyof typeof RateLimiter.DEFAULT_CONFIGS = 'api'
  ): RateLimitResult {
    const config = this.DEFAULT_CONFIGS[configName]
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get or create rate limit entry
    let entry = this.store.get(identifier)
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        requests: []
      }
      this.store.set(identifier, entry)
    }

    // Clean old requests outside the window
    entry.requests = entry.requests.filter(time => time > windowStart)
    entry.count = entry.requests.length

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      const oldestRequest = Math.min(...entry.requests)
      const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000)
      
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: oldestRequest + config.windowMs,
        retryAfter: Math.max(retryAfter, 1)
      }
    }

    // Add current request
    entry.requests.push(now)
    entry.count = entry.requests.length
    entry.resetTime = now + config.windowMs

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Get client identifier from request
   */
  static getClientIdentifier(request: NextRequest): string {
    // Try to get user ID from headers (set by auth middleware)
    const userId = request.headers.get('x-user-id')
    if (userId) {
      return `user:${userId}`
    }

    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return `ip:${ip}`
  }

  /**
   * Create rate limit key for specific endpoints
   */
  static createKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`
  }

  /**
   * Check rate limit for authentication endpoints
   */
  static checkAuthLimit(request: NextRequest): RateLimitResult {
    const identifier = this.getClientIdentifier(request)
    const key = this.createKey(identifier, 'auth')
    return this.checkLimit(key, 'auth')
  }

  /**
   * Check rate limit for API endpoints
   */
  static checkAPILimit(request: NextRequest, endpoint?: string): RateLimitResult {
    const identifier = this.getClientIdentifier(request)
    const key = endpoint 
      ? this.createKey(identifier, endpoint)
      : identifier
    return this.checkLimit(key, 'api')
  }

  /**
   * Check rate limit for middleware (general browsing)
   */
  static checkMiddlewareLimit(request: NextRequest): RateLimitResult {
    const identifier = this.getClientIdentifier(request)
    return this.checkLimit(identifier, 'middleware')
  }

  /**
   * Reset rate limit for a specific identifier
   */
  static resetLimit(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Get current rate limit status without incrementing
   */
  static getStatus(identifier: string, configName: keyof typeof RateLimiter.DEFAULT_CONFIGS = 'api'): RateLimitResult {
    const config = this.DEFAULT_CONFIGS[configName]
    const now = Date.now()
    const windowStart = now - config.windowMs

    const entry = this.store.get(identifier)
    if (!entry) {
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      }
    }

    // Count requests in current window
    const validRequests = entry.requests.filter(time => time > windowStart)
    const remaining = Math.max(0, config.maxRequests - validRequests.length)

    return {
      success: remaining > 0,
      limit: config.maxRequests,
      remaining,
      resetTime: entry.resetTime
    }
  }

  /**
   * Add rate limit headers to response
   */
  static addHeaders(headers: Headers, result: RateLimitResult): void {
    headers.set('X-RateLimit-Limit', result.limit.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
    
    if (result.retryAfter) {
      headers.set('Retry-After', result.retryAfter.toString())
    }
  }

  /**
   * Start cleanup timer to remove expired entries
   */
  private static startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * Clean up expired rate limit entries
   */
  private static cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.store) {
      // Remove entries that are completely expired
      if (entry.resetTime < now) {
        this.store.delete(key)
        continue
      }

      // Clean old requests from entries
      const oldestValidTime = now - Math.max(
        ...Object.values(this.DEFAULT_CONFIGS).map(c => c.windowMs)
      )
      
      entry.requests = entry.requests.filter(time => time > oldestValidTime)
      entry.count = entry.requests.length

      // Remove entries with no recent requests
      if (entry.requests.length === 0 && entry.resetTime < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get rate limiter statistics
   */
  static getStats(): {
    totalEntries: number
    totalRequests: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const now = Date.now()
    let totalRequests = 0
    let oldestEntry: number | null = null
    let newestEntry: number | null = null

    for (const entry of this.store.values()) {
      totalRequests += entry.requests.length
      
      if (entry.requests.length > 0) {
        const oldest = Math.min(...entry.requests)
        const newest = Math.max(...entry.requests)
        
        if (oldestEntry === null || oldest < oldestEntry) {
          oldestEntry = oldest
        }
        
        if (newestEntry === null || newest > newestEntry) {
          newestEntry = newest
        }
      }
    }

    return {
      totalEntries: this.store.size,
      totalRequests,
      oldestEntry,
      newestEntry
    }
  }
}
