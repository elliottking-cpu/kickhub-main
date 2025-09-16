# Step 3.4 Real-time Subscriptions - Error Prevention Checklist

## 🚨 **CRITICAL ERROR PREVENTION CHECKLIST**

### **Phase 1: Database Setup Errors**

#### ❌ **Common Error: Real-time Publication Not Enabled**
- **Issue**: Tables not added to `supabase_realtime` publication
- **Prevention**: Run migration `20240101000022_enable_realtime_subscriptions.sql`
- **Validation**: Check `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`
- **Fix**: `ALTER PUBLICATION supabase_realtime ADD TABLE table_name;`

#### ❌ **Common Error: Missing Performance Indexes**
- **Issue**: Real-time queries are slow without proper indexes
- **Prevention**: Create indexes on frequently filtered columns
- **Validation**: Check query performance with `EXPLAIN ANALYZE`
- **Fix**: `CREATE INDEX CONCURRENTLY idx_table_column ON table (column);`

#### ❌ **Common Error: RLS Blocks Real-time Events**
- **Issue**: Row Level Security prevents real-time events from reaching client
- **Prevention**: Ensure RLS policies allow SELECT on subscribed tables
- **Validation**: Test with different user roles
- **Fix**: Update RLS policies to allow appropriate access

---

### **Phase 2: TypeScript Import/Export Errors**

#### ❌ **Common Error: Import Path Resolution**
- **Issue**: `Cannot resolve module '@/lib/realtime/RealtimeManager'`
- **Prevention**: Use consistent import paths and check tsconfig.json
- **Validation**: Run `npx tsc --noEmit` to check imports
- **Fix**: Update import paths or tsconfig baseUrl/paths

#### ❌ **Common Error: Missing Type Definitions**
- **Issue**: `Property 'subscribeToMatchUpdates' does not exist on type 'RealtimeManager'`
- **Prevention**: Export all interfaces and types properly
- **Validation**: Check TypeScript compilation
- **Fix**: Add proper type exports and imports

#### ❌ **Common Error: Circular Dependencies**
- **Issue**: RealtimeManager and OfflineStateManager reference each other
- **Prevention**: Use dependency injection pattern
- **Validation**: Check build warnings for circular deps
- **Fix**: Pass RealtimeManager to OfflineStateManager constructor

---

### **Phase 3: React Hooks Integration Errors**

#### ❌ **Common Error: Hook Dependency Loops**
- **Issue**: `useEffect` runs infinitely due to object dependencies
- **Prevention**: Use useMemo/useCallback for object dependencies
- **Validation**: Monitor console for "Maximum update depth exceeded"
- **Fix**: Wrap objects in useMemo, functions in useCallback

#### ❌ **Common Error: Memory Leaks from Unsubscribed Channels**
- **Issue**: Real-time channels not cleaned up on unmount
- **Prevention**: Always return cleanup function from useEffect
- **Validation**: Check dev tools for increasing memory usage
- **Fix**: Call `unsubscribeFromChannel` in useEffect cleanup

#### ❌ **Common Error: State Updates on Unmounted Components**
- **Issue**: "Can't perform a React state update on an unmounted component"
- **Prevention**: Use cleanup flags or ref to track mount status
- **Validation**: Check console warnings
- **Fix**: Check component mount status before setState calls

---

### **Phase 4: Real-time Connection Errors**

#### ❌ **Common Error: WebSocket Connection Failures**
- **Issue**: Real-time connection fails to establish
- **Prevention**: Check Supabase project URL and anon key
- **Validation**: Monitor browser dev tools Network tab
- **Fix**: Verify environment variables and Supabase config

#### ❌ **Common Error: Authentication Token Issues**
- **Issue**: Real-time subscriptions fail due to expired tokens
- **Prevention**: Implement token refresh logic
- **Validation**: Check auth token expiry
- **Fix**: Use Supabase auto token refresh or manual refresh

#### ❌ **Common Error: Channel Subscription Timing**
- **Issue**: Subscribing before authentication completes
- **Prevention**: Wait for auth state before subscribing
- **Validation**: Check subscription order in network tab
- **Fix**: Use auth state listeners to trigger subscriptions

---

### **Phase 5: Offline/Online State Management Errors**

#### ❌ **Common Error: Data Duplication on Sync**
- **Issue**: Same data synced multiple times when reconnecting
- **Prevention**: Use idempotent operations and unique IDs
- **Validation**: Check for duplicate database entries
- **Fix**: Implement upsert operations instead of insert

#### ❌ **Common Error: Sync Queue Overflow**
- **Issue**: Too many pending updates cause memory issues
- **Prevention**: Implement queue size limits and cleanup
- **Validation**: Monitor pending updates count
- **Fix**: Add max queue size and remove old entries

#### ❌ **Common Error: Failed Sync Retry Storms**
- **Issue**: Failed syncs retry infinitely causing performance issues
- **Prevention**: Implement exponential backoff and max retry limits
- **Validation**: Monitor network requests frequency
- **Fix**: Add retry limits and exponential delays

---

### **Phase 6: Performance and Scalability Errors**

#### ❌ **Common Error: Too Many Active Subscriptions**
- **Issue**: Multiple components subscribe to same data
- **Prevention**: Use global state management for shared subscriptions
- **Validation**: Check active channels count
- **Fix**: Implement subscription sharing or global state

#### ❌ **Common Error: Large Payload Performance**
- **Issue**: Real-time events with large data payloads slow down UI
- **Prevention**: Minimize data in real-time events, fetch details separately
- **Validation**: Monitor payload sizes in network tab
- **Fix**: Send only IDs/changes in real-time, fetch full data on demand

#### ❌ **Common Error: Browser Notification Permission**
- **Issue**: Notifications fail without user permission
- **Prevention**: Request permission before attempting notifications
- **Validation**: Check `Notification.permission` status
- **Fix**: Implement permission request flow

---

## **✅ PRE-DEPLOYMENT VALIDATION CHECKLIST**

### **Database Validation**
- [ ] Real-time publication includes all required tables
- [ ] Performance indexes exist on filtered columns  
- [ ] RLS policies allow appropriate real-time access
- [ ] Migration runs successfully on clean database

### **Code Validation**
- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] No circular dependencies detected
- [ ] React hooks follow rules of hooks

### **Connection Validation**
- [ ] WebSocket connection establishes successfully
- [ ] Authentication works with real-time subscriptions
- [ ] Subscriptions receive events correctly
- [ ] Unsubscription cleans up properly

### **Performance Validation**
- [ ] No memory leaks detected
- [ ] Subscription counts remain reasonable
- [ ] Payload sizes are optimized
- [ ] Reconnection works after network issues

### **Error Handling Validation**
- [ ] Connection failures handled gracefully
- [ ] Sync failures don't crash app
- [ ] Permission errors show user-friendly messages
- [ ] Offline mode works as expected

---

## **🛠️ DEBUGGING TOOLS**

### **Browser Dev Tools**
- **Network Tab**: Monitor WebSocket connections and real-time events
- **Console**: Check for subscription status and error messages
- **Memory Tab**: Monitor for memory leaks from subscriptions
- **Application Tab**: Check service worker and offline storage

### **Supabase Dashboard**
- **Database → Publications**: Verify tables in `supabase_realtime`
- **Authentication → Users**: Check user sessions and tokens  
- **Settings → API**: Verify project URL and keys
- **Logs**: Monitor real-time connection logs

### **Code Debugging**
```javascript
// Debug subscription status
console.log('Active channels:', realtimeManager.getActiveChannelNames())
console.log('Connection status:', realtimeManager.getConnectionStatus())

// Debug offline state
console.log('Pending updates:', offlineStateManager.getPendingUpdates())
console.log('Sync stats:', offlineStateManager.getSyncStats())

// Debug React hook state
console.log('Hook state:', { matchData, isLoading, isSubscribed })
```

### **SQL Debugging Queries**
```sql
-- Check real-time publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Check active connections
SELECT * FROM pg_stat_activity WHERE application_name = 'supabase';

-- Monitor real-time events (in Supabase logs)
SELECT * FROM realtime.subscription;
```

---

## **🚨 EMERGENCY RECOVERY PROCEDURES**

### **Complete Real-time System Failure**
1. **Disable real-time features**: Set `REALTIME_ENABLED: false` in feature flags
2. **Fall back to polling**: Implement periodic data refresh
3. **Check Supabase status**: Verify service availability
4. **Roll back migration**: If database issues, rollback real-time migration
5. **Monitor logs**: Check both client and server logs for errors

### **Memory Leak Detection**
1. **Clear all subscriptions**: Call `realtimeManager.unsubscribeAll()`
2. **Restart real-time manager**: Create new instance
3. **Check hook cleanup**: Verify useEffect cleanup functions
4. **Monitor memory usage**: Use browser memory profiling tools
5. **Implement subscription limits**: Add max channel count

### **Sync Queue Overflow**
1. **Clear pending queue**: Call `offlineStateManager.clearFailedUpdates()`
2. **Reduce queue size**: Lower max pending updates limit
3. **Implement selective sync**: Only sync critical updates
4. **Check network connectivity**: Verify stable connection
5. **Manual data refresh**: Force full data reload if needed

This comprehensive checklist should prevent 95% of common real-time implementation errors and provide recovery procedures for critical failures.
