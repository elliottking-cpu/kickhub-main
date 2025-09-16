// src/lib/auth/performance-cache.ts - Route Protection Performance Cache
import { createClient } from '@/lib/supabase/server'

interface CachedUserData {
  roles: string[]
  permissions: string[]
  activeTeams: string[]
  expiry: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalRequests: number
}

export class RouteProtectionCache {
  private static userCache = new Map<string, CachedUserData>()
  private static routeCache = new Map<string, { hasAccess: boolean, expiry: number }>()
  private static stats: CacheStats = { hits: 0, misses: 0, evictions: 0, totalRequests: 0 }
  
  // Cache TTL configurations
  private static readonly USER_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly ROUTE_CACHE_TTL = 2 * 60 * 1000 // 2 minutes
  private static readonly MAX_CACHE_SIZE = 1000
  private static readonly CLEANUP_INTERVAL = 10 * 60 * 1000 // 10 minutes

  static {
    // Periodic cache cleanup
    if (typeof window === 'undefined') { // Server-side only
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
    }
  }

  /**
   * Get cached user roles with automatic database fallback
   */
  static async getUserRoles(userId: string): Promise<string[]> {
    this.stats.totalRequests++
    
    const cached = this.userCache.get(userId)
    if (cached && cached.expiry > Date.now()) {
      this.stats.hits++
      return cached.roles
    }

    this.stats.misses++
    
    try {
      // Fetch from database
      const userData = await this.fetchUserDataFromDB(userId)
      
      // Cache the result
      this.setUserCache(userId, userData)
      
      return userData.roles
    } catch (error) {
      console.error('Failed to fetch user roles:', error)
      // Return cached data even if expired in case of database error
      return cached?.roles || []
    }
  }

  /**
   * Get cached user permissions with automatic database fallback
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    this.stats.totalRequests++
    
    const cached = this.userCache.get(userId)
    if (cached && cached.expiry > Date.now()) {
      this.stats.hits++
      return cached.permissions
    }

    this.stats.misses++
    
    try {
      const userData = await this.fetchUserDataFromDB(userId)
      this.setUserCache(userId, userData)
      return userData.permissions
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
      return cached?.permissions || []
    }
  }

  /**
   * Cache route access decisions for faster subsequent checks
   */
  static getCachedRouteAccess(cacheKey: string): boolean | null {
    const cached = this.routeCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      this.stats.hits++
      return cached.hasAccess
    }
    this.stats.misses++
    return null
  }

  /**
   * Set route access cache
   */
  static setCachedRouteAccess(cacheKey: string, hasAccess: boolean): void {
    // Prevent cache from growing too large
    if (this.routeCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestRouteEntries()
    }

    this.routeCache.set(cacheKey, {
      hasAccess,
      expiry: Date.now() + this.ROUTE_CACHE_TTL
    })
  }

  /**
   * Generate cache key for route access decisions
   */
  static generateRouteCacheKey(userId: string, pathname: string, roles: string[]): string {
    return `${userId}:${pathname}:${roles.sort().join(',')}`
  }

  /**
   * Invalidate user cache (call when roles change)
   */
  static invalidateUser(userId: string): void {
    this.userCache.delete(userId)
    
    // Also invalidate related route cache entries
    for (const [key] of this.routeCache) {
      if (key.startsWith(`${userId}:`)) {
        this.routeCache.delete(key)
      }
    }
  }

  /**
   * Invalidate all caches (emergency use)
   */
  static invalidateAll(): void {
    this.userCache.clear()
    this.routeCache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0, totalRequests: 0 }
  }

  /**
   * Get cache performance statistics
   */
  static getStats(): CacheStats & { hitRate: number, userCacheSize: number, routeCacheSize: number } {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      userCacheSize: this.userCache.size,
      routeCacheSize: this.routeCache.size
    }
  }

  /**
   * Fetch user data from database
   */
  private static async fetchUserDataFromDB(userId: string): Promise<CachedUserData> {
    const supabase = await createClient()

    // Handle case where supabase client is null during build time
    if (!supabase) {
      return {
        roles: [],
        teams: [],
        permissions: [],
        lastUpdated: Date.now()
      }
    }

    // Fetch user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role, team_id')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (rolesError) {
      throw new Error(`Failed to fetch user roles: ${rolesError.message}`)
    }

    // Fetch user permissions (from role_permissions table)
    const roles = userRoles?.map(r => r.role) || []
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select('permission')
      .in('role', roles)

    if (permissionsError) {
      throw new Error(`Failed to fetch role permissions: ${permissionsError.message}`)
    }

    const permissions = [...new Set(rolePermissions?.map(p => p.permission) || [])]
    const activeTeams = [...new Set(userRoles?.map(r => r.team_id).filter(Boolean) || [])]

    return {
      roles,
      permissions,
      activeTeams,
      expiry: Date.now() + this.USER_CACHE_TTL
    }
  }

  /**
   * Set user cache with size management
   */
  private static setUserCache(userId: string, userData: CachedUserData): void {
    // Prevent cache from growing too large
    if (this.userCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestUserEntries()
    }

    this.userCache.set(userId, userData)
  }

  /**
   * Evict oldest user cache entries
   */
  private static evictOldestUserEntries(): void {
    const entries = Array.from(this.userCache.entries())
    entries.sort((a, b) => a[1].expiry - b[1].expiry)
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      this.userCache.delete(entries[i][0])
      this.stats.evictions++
    }
  }

  /**
   * Evict oldest route cache entries
   */
  private static evictOldestRouteEntries(): void {
    const entries = Array.from(this.routeCache.entries())
    entries.sort((a, b) => a[1].expiry - b[1].expiry)
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      this.routeCache.delete(entries[i][0])
      this.stats.evictions++
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private static cleanup(): void {
    const now = Date.now()
    
    // Clean user cache
    for (const [userId, userData] of this.userCache) {
      if (userData.expiry <= now) {
        this.userCache.delete(userId)
      }
    }

    // Clean route cache
    for (const [key, routeData] of this.routeCache) {
      if (routeData.expiry <= now) {
        this.routeCache.delete(key)
      }
    }
  }

  /**
   * Get cache entry for a user (for use by other classes)
   */
  static getUserCacheEntry(userId: string): CachedUserData | undefined {
    return this.userCache.get(userId)
  }

  /**
   * Set cache entry for a user (for use by other classes)
   */
  static setUserCacheEntry(userId: string, data: CachedUserData): void {
    this.userCache.set(userId, data)
  }
}

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Batch multiple user role requests
   */
  static async batchGetUserRoles(userIds: string[]): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>()
    const uncachedIds: string[] = []

    // Check cache first
    for (const userId of userIds) {
      const cached = RouteProtectionCache.getUserCacheEntry(userId)
      if (cached && cached.expiry > Date.now()) {
        results.set(userId, cached.roles)
      } else {
        uncachedIds.push(userId)
      }
    }

    // Batch fetch uncached users
    if (uncachedIds.length > 0) {
      const supabase = await createClient()
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', uncachedIds)
        .eq('is_active', true)

      if (!error && userRoles) {
        // Group by user_id
        const rolesByUser = userRoles.reduce((acc, row) => {
          if (!acc[row.user_id]) acc[row.user_id] = []
          acc[row.user_id].push(row.role)
          return acc
        }, {} as Record<string, string[]>)

        // Cache and add to results
        for (const userId of uncachedIds) {
          const roles = rolesByUser[userId] || []
          results.set(userId, roles)
          
          // Cache for future use
          RouteProtectionCache.setUserCacheEntry(userId, {
            roles,
            permissions: [], // Will be fetched separately if needed
            activeTeams: [],
            expiry: Date.now() + RouteProtectionCache['USER_CACHE_TTL']
          })
        }
      }
    }

    return results
  }

  /**
   * Preload user data for common routes
   */
  static async preloadCommonUsers(userIds: string[]): Promise<void> {
    await Promise.all(
      userIds.map(userId => RouteProtectionCache.getUserRoles(userId))
    )
  }
}
