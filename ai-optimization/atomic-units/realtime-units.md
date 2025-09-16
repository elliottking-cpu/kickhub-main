# Step 3.4 Real-time Subscriptions - Atomic Development Units

## 🔧 **ATOMIC DEVELOPMENT UNITS**

Each unit represents an independent, testable, and deployable component that can be developed in isolation.

---

## **UNIT 1: Database Real-time Foundation**
**Estimated Time:** 20 minutes  
**Dependencies:** Step 3.1 (Database Schema)  
**Validation:** Migration executes successfully

### **Components:**
- `supabase/migrations/20240101000022_enable_realtime_subscriptions.sql`

### **Implementation Steps:**
1. Create migration file with table publications
2. Add performance indexes for real-time queries
3. Create helper function `get_realtime_tables()`
4. Test migration on clean database
5. Verify tables appear in publication

### **Acceptance Criteria:**
- [ ] 7 critical tables enabled for real-time
- [ ] 4+ performance indexes created
- [ ] Helper function returns publication tables
- [ ] Migration runs without errors
- [ ] All tables accessible via real-time API

### **Testing:**
```sql
-- Verify publication setup
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Test helper function
SELECT * FROM get_realtime_tables();
```

---

## **UNIT 2: RealtimeManager Core Class**
**Estimated Time:** 45 minutes  
**Dependencies:** Unit 1, Supabase Client  
**Validation:** TypeScript compiles, basic subscriptions work

### **Components:**
- `src/lib/realtime/RealtimeManager.ts`

### **Implementation Steps:**
1. Create RealtimeManager class with constructor
2. Implement connection monitoring setup
3. Add basic subscription method template
4. Implement channel management (Map storage)
5. Add connection status tracking
6. Implement cleanup methods

### **Acceptance Criteria:**
- [ ] Class instantiates without errors
- [ ] Connection status properly tracked
- [ ] Channels stored and managed correctly  
- [ ] Cleanup methods remove channels
- [ ] TypeScript compilation successful

### **Testing:**
```javascript
// Unit test template
const manager = new RealtimeManager()
expect(manager.getConnectionStatus()).toBe('disconnected')
expect(manager.getActiveChannelsCount()).toBe(0)
```

---

## **UNIT 3: Match Updates Subscription**
**Estimated Time:** 30 minutes  
**Dependencies:** Unit 2  
**Validation:** Match subscriptions receive events

### **Components:**
- `RealtimeManager.subscribeToMatchUpdates()` method

### **Implementation Steps:**
1. Implement `subscribeToMatchUpdates` method
2. Add postgres_changes listeners for matches table
3. Add postgres_changes listeners for match_statistics table  
4. Implement callback payload formatting
5. Add subscription status handling
6. Test with mock match data

### **Acceptance Criteria:**
- [ ] Method accepts matchId and callback
- [ ] Subscribes to both matches and match_statistics tables
- [ ] Formats payloads correctly with timestamp
- [ ] Handles subscription status changes
- [ ] Returns RealtimeChannel instance

### **Testing:**
```javascript
// Test subscription creation
const channel = manager.subscribeToMatchUpdates('match-123', (payload) => {
  console.log('Match update:', payload)
})
expect(channel).toBeDefined()
```

---

## **UNIT 4: Notification Subscriptions**  
**Estimated Time:** 25 minutes  
**Dependencies:** Unit 2  
**Validation:** Notification events received correctly

### **Components:**
- `RealtimeManager.subscribeToTeamNotifications()` method

### **Implementation Steps:**
1. Implement team notifications subscription method
2. Add listeners for notifications table (user-specific)
3. Add listeners for team_announcements table
4. Implement browser notification integration
5. Add payload type differentiation
6. Test notification delivery

### **Acceptance Criteria:**
- [ ] Subscribes to user-specific notifications
- [ ] Subscribes to team-wide announcements  
- [ ] Shows browser notifications when permitted
- [ ] Differentiates between notification types
- [ ] Proper error handling for permissions

### **Testing:**
```javascript
// Test team notifications
const channel = manager.subscribeToTeamNotifications('team-123', 'user-456', callback)
// Simulate notification insert
// Verify callback called with correct payload
```

---

## **UNIT 5: Presence Tracking System**
**Estimated Time:** 35 minutes  
**Dependencies:** Unit 2  
**Validation:** User presence tracked during matches

### **Components:**
- `RealtimeManager.subscribeToMatchPresence()` method

### **Implementation Steps:**
1. Implement match presence subscription
2. Add presence event listeners (sync, join, leave)
3. Implement user tracking on subscription
4. Add presence state management
5. Implement custom event dispatching
6. Test presence join/leave scenarios

### **Acceptance Criteria:**
- [ ] Tracks user presence in match channels
- [ ] Handles presence sync, join, leave events
- [ ] Dispatches custom DOM events for UI updates
- [ ] Automatically tracks user on subscription
- [ ] Proper cleanup when unsubscribing

### **Testing:**
```javascript
// Test presence tracking
const channel = manager.subscribeToMatchPresence('match-123', userInfo)
// Verify tracking started
// Simulate user join/leave
// Check custom events dispatched
```

---

## **UNIT 6: OfflineStateManager Core**
**Estimated Time:** 40 minutes  
**Dependencies:** Unit 2  
**Validation:** Offline/online state properly managed

### **Components:**
- `src/lib/realtime/OfflineStateManager.ts`

### **Implementation Steps:**
1. Create OfflineStateManager class with constructor
2. Implement online/offline event listeners
3. Add update queue management (Map/Array storage)
4. Implement basic sync logic structure
5. Add visibility change handling
6. Create sync statistics tracking

### **Acceptance Criteria:**
- [ ] Class instantiates with RealtimeManager dependency
- [ ] Online/offline events properly handled
- [ ] Update queue stores pending operations
- [ ] Sync statistics tracked accurately
- [ ] Visibility change triggers sync attempts

### **Testing:**
```javascript
// Test offline state management
const offlineManager = new OfflineStateManager(realtimeManager)
expect(offlineManager.getOnlineStatus()).toBe(navigator.onLine)
expect(offlineManager.getSyncStats().pendingCount).toBe(0)
```

---

## **UNIT 7: Offline Queue and Sync Logic**
**Estimated Time:** 35 minutes  
**Dependencies:** Unit 6, Database Schema  
**Validation:** Updates queue offline and sync when online

### **Components:**
- `OfflineStateManager.queueUpdate()` method
- `OfflineStateManager.syncPendingUpdates()` method

### **Implementation Steps:**
1. Implement update queuing with unique IDs
2. Add sync processing by update type
3. Implement retry logic with max attempts
4. Add failed update tracking
5. Implement periodic sync attempts
6. Test offline → online sync scenarios

### **Acceptance Criteria:**
- [ ] Updates queued with proper metadata
- [ ] Sync processes different update types correctly
- [ ] Retry logic prevents infinite failures
- [ ] Failed updates tracked separately
- [ ] Periodic sync attempts when online

### **Testing:**
```javascript
// Test offline queueing
offlineManager.setOnlineStatus(false)
offlineManager.queueUpdate({ type: 'match_statistic', data: {...} })
expect(offlineManager.getPendingUpdates().length).toBe(1)

// Test sync on reconnection
offlineManager.setOnlineStatus(true)
// Wait for sync
expect(offlineManager.getPendingUpdates().length).toBe(0)
```

---

## **UNIT 8: React Hook Integration**
**Estimated Time:** 30 minutes  
**Dependencies:** Units 2-7  
**Validation:** Hooks work in React components without errors

### **Components:**
- `src/hooks/useRealtime.ts` (updated imports)
- `src/hooks/useOfflineState.ts` (updated imports)

### **Implementation Steps:**
1. Update hook imports to use new RealtimeManager
2. Test hook instantiation in React components
3. Verify useEffect cleanup functions work
4. Check for memory leaks and subscription cleanup
5. Test hook re-renders and dependency changes
6. Validate TypeScript type safety

### **Acceptance Criteria:**
- [ ] Hooks import RealtimeManager without errors
- [ ] React component integration works smoothly
- [ ] useEffect cleanup prevents memory leaks
- [ ] Hook re-renders don't cause subscription loops
- [ ] TypeScript types resolve correctly

### **Testing:**
```javascript
// Test hook integration
import { useRealtime } from '@/hooks/useRealtime'

function TestComponent() {
  const { realtimeManager, isConnected } = useRealtime()
  return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>
}
```

---

## **UNIT 9: Configuration Integration**
**Estimated Time:** 15 minutes  
**Dependencies:** All previous units  
**Validation:** Configuration files enable/disable features correctly

### **Components:**
- `kickhub.config.json` (realtime section)
- `src/config/feature-flags.ts` (realtime flags)

### **Implementation Steps:**
1. Verify realtime configuration section
2. Test feature flag integration
3. Check configuration validation
4. Ensure flags control feature availability
5. Test configuration-driven behavior
6. Validate JSON schema compliance

### **Acceptance Criteria:**
- [ ] Realtime configuration section complete
- [ ] Feature flags control realtime features
- [ ] Configuration validates correctly
- [ ] Flags properly disable features when false
- [ ] JSON structure is valid and parseable

### **Testing:**
```javascript
// Test configuration loading
import { REALTIME_FLAGS } from '@/config/feature-flags'
expect(REALTIME_FLAGS.REALTIME_ENABLED).toBe(true)

// Test feature flag behavior
if (REALTIME_FLAGS.MATCH_SUBSCRIPTIONS) {
  // Real-time subscriptions enabled
}
```

---

## **UNIT 10: Comprehensive Validation**
**Estimated Time:** 20 minutes  
**Dependencies:** All previous units  
**Validation:** All Step 3.4 criteria pass validation script

### **Components:**
- `ai-optimization/validation-scripts/validate-step-3-4.js`

### **Implementation Steps:**
1. Run complete validation script
2. Fix any failing validation checks
3. Verify TypeScript compilation
4. Check all file existence requirements  
5. Validate database setup
6. Confirm configuration completeness

### **Acceptance Criteria:**
- [ ] Validation script passes all checks (≥90%)
- [ ] TypeScript compiles without errors
- [ ] All required files exist and are accessible
- [ ] Database real-time setup verified
- [ ] Configuration sections complete

### **Testing:**
```bash
# Run validation script
node ai-optimization/validation-scripts/validate-step-3-4.js

# Expected output: ≥90% completion rate
# 🎉 Step 3.4 Real-time Subscriptions: READY FOR PRODUCTION
```

---

## **DEVELOPMENT WORKFLOW**

### **Sequential Development Order:**
1. **Foundation First**: Units 1-2 (Database + Core Class)
2. **Feature Layer**: Units 3-5 (Subscriptions + Presence) 
3. **Offline Support**: Units 6-7 (Offline State Management)
4. **Integration**: Units 8-9 (React + Configuration)
5. **Validation**: Unit 10 (Complete Testing)

### **Parallel Development Options:**
- Units 3, 4, 5 can be developed simultaneously after Unit 2
- Units 6, 7 can be developed in parallel with Units 3-5
- Units 8, 9 can be developed simultaneously after core units complete

### **Testing Strategy:**
- **Unit-level**: Each unit has specific test cases
- **Integration**: Units 8-10 test cross-unit interactions
- **End-to-end**: Unit 10 validates complete Step 3.4

### **Deployment Readiness:**
Each unit can be individually deployed and tested. The complete system becomes functional after Unit 8, with Unit 10 providing production readiness validation.

**Total Estimated Development Time: 295 minutes (≈5 hours)**  
**Production-Ready Milestone: Unit 10 completion**
