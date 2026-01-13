# Smart Matching and FCM Notification Improvements

## Overview
This document describes the improvements made to the smart order matching system and FCM (Firebase Cloud Messaging) notification handling to ensure notifications only trigger when shoppers are genuinely online and active.

## Smart Matching Algorithm

### How It Works
The smart matching system (`/api/shopper/smart-assign-order`) uses a priority-based scoring algorithm to match the best available order to each shopper:

#### Priority Score Calculation (Lower is Better)
```
priorityScore = 
  distance * 0.3 +                    // Distance weight (30%)
  (5 - avgRating) * 1.5 +             // Rating weight (15%)
  (100 - completionRate) * 0.01 +     // Completion rate weight (5%)
  ageFactor +                         // Age-based priority (50%)
  Math.random() * 0.3                 // Small random factor (5%)
```

#### Age Factor (Heavily Prioritizes Older Orders)
- **30+ minutes old**: ageFactor = -5 (strongest priority)
- **15-30 minutes old**: ageFactor = -2 (good priority)
- **5-15 minutes old**: ageFactor = 0 (neutral)
- **Under 5 minutes old**: ageFactor = 2 (lower priority)

### Why This Works
1. **Prevents Order Starvation**: Older orders get significantly higher priority, ensuring they don't get stuck
2. **Fair Distribution**: New orders are still considered, with a small random factor ensuring fairness
3. **Quality Matching**: Considers shopper performance (rating, completion rate) and distance
4. **Dynamic**: Continuously re-evaluates as orders age and shoppers' locations change

## FCM Notification Improvements

### Problem
Notifications were triggering inappropriately:
- On page refresh/reload
- When navigating between pages
- When the browser tab is not visible
- When user is inactive

### Solution
Implemented multiple layers of protection to ensure notifications only show when appropriate:

#### 1. Page Load Cooldown (15 seconds)
```typescript
// Don't show notifications within 15 seconds of page load
if (now - pageLoadTimestamp.current < 15000) {
  // Block notification
  return;
}
```

#### 2. Page Visibility Check
```typescript
// Only show notifications if page is visible
if (!isPageVisible.current) {
  // Block notification
  return;
}
```

#### 3. User Activity Tracking
```typescript
// Block if user inactive for more than 5 minutes
if (now - lastUserActivityTime.current > 300000) {
  // Block notification
  return;
}
```

#### 4. Declined Orders Persistence
```typescript
// Persist declined orders to localStorage
// Survives page refreshes and prevents re-showing declined orders
localStorage.setItem("declined_orders", JSON.stringify(declinedObj));
```

#### 5. Notification Deduplication
```typescript
// Prevent showing same notification multiple times
const lastShown = showToastLock.current.get(order.id);
if (lastShown && now - lastShown < 2000) {
  // Block duplicate
  return;
}
```

#### 6. FCM Hook Visibility Check
```typescript
// In useFCMNotifications hook
if (document.hidden) {
  // Don't dispatch event if page is hidden
  return;
}
```

## Activity Tracking

### User Activity Events
The system tracks these events to determine if user is active:
- `visibilitychange` - Page visibility changes
- `focus` - Window gains focus
- `mousemove` - Mouse movement
- `touchstart` - Touch input
- `click` - Click events
- `keydown` - Keyboard input

### Page Visibility API
Uses the standard `document.hidden` property to check if the page is visible to the user.

## Online Status Requirement

**CRITICAL**: Notifications only work when the shopper is actively online:

### What "Online" Means
- Shopper has clicked "Start Plas" button
- Location cookies (`user_latitude` and `user_longitude`) are set
- Shopper's location is being tracked

### What Happens When Offline
- ❌ FCM is not initialized
- ❌ API polling is stopped
- ❌ No notifications are shown
- ❌ All active notification modals are closed
- ✅ App continues to work normally

### Going Online/Offline Flow
```
Shopper Clicks "Start Plas"
  ↓
Location Cookies Set
  ↓
toggleGoLive Event Dispatched
  ↓
FCM Initializes (if supported)
  ↓
Notification System Starts
  ↓
Ready to Receive Orders!

---

Shopper Clicks "Go Offline"
  ↓
Location Cookies Cleared
  ↓
toggleGoLive Event Dispatched
  ↓
FCM Cleanup
  ↓
Notification System Stops
  ↓
All Notifications Dismissed
```

## Notification Flow

### 1. API Polling (Backup)
```
Shopper Online? ✓
  ↓
User Active + Page Visible + No Recent Notification
  ↓
API Call: /api/shopper/smart-assign-order
  ↓
Best Order Selected (Priority Score)
  ↓
FCM Notification Sent (Server)
  ↓
Order Displayed in UI
```

### 2. FCM Push (Primary)
```
Shopper Clicks "Start Plas"
  ↓
FCM Initializes (if supported)
  ↓
Server Detects New Order
  ↓
FCM Push Sent to Device
  ↓
Service Worker Receives Message
  ↓
useFCMNotifications Hook Processes
  ↓
Check: Shopper Online? Page Visible? User Active? Not Declined?
  ↓
Dispatch Custom Event
  ↓
NotificationSystem Component Receives
  ↓
Additional Checks (Online Status, Page Load, Activity, etc.)
  ↓
Display Notification Modal
```

## Configuration

### Timing Constants
- **Page Load Cooldown**: 15 seconds (prevents refresh spam)
- **API Polling Interval**: 30 seconds (or 2 minutes with FCM)
- **User Inactivity Timeout**: 5 minutes
- **Decline Cooldown**: 10 seconds
- **Notification Cooldown**: 25 seconds
- **Order Expiration**: 90 seconds (1.5 minutes)
- **Declined Order Expiration**: 5 minutes

### FCM Notification Cache
The smart-assign-order API maintains an in-memory cache to prevent duplicate FCM notifications:
```typescript
const cacheKey = `${user_id}:${bestOrder.id}`;
// Only send if not sent in last 90 seconds
if (!lastSent || now - lastSent > 90000) {
  await sendNewOrderNotification(user_id, orderData);
  notificationCache.set(cacheKey, now);
}
```

## Testing Smart Matching

### How to Verify Smart Matching Works
1. **Create Multiple Orders** with different ages
2. **Go Online as a Shopper**
3. **Observe Order Selection**: Older orders should appear first
4. **Check Console Logs**: Look for priority scores
5. **Monitor Order Assignment**: Verify oldest orders get picked up first

### Console Log Examples
```javascript
// Smart assignment log
console.log("Best order selected:", {
  id: bestOrder.id,
  type: bestOrder.orderType,
  priority: bestOrder.priority,
});

// Priority calculation
console.log("Priority score:", {
  distance: distance * 0.3,
  rating: (5 - avgRating) * 1.5,
  completion: (100 - completionRate) * 0.01,
  ageFactor: ageFactor,
});
```

## Benefits

### For Shoppers
✅ **Only receive notifications when actively online and ready to work**  
✅ No spam notifications on page refresh  
✅ Only see notifications when actively using the app  
✅ Don't see declined orders again  
✅ Get matched with best orders based on multiple factors  
✅ Clear control - "Start Plas" to go online, "Go Offline" to stop

### For Customers
✅ Older orders get prioritized (faster fulfillment)  
✅ Fair order distribution among shoppers  
✅ Better shopper matching (rating, completion rate)  
✅ Only notified to shoppers who are ready and available

### For System
✅ **No wasted notifications to offline shoppers**  
✅ Reduced server load (fewer duplicate notifications)  
✅ Better user experience  
✅ More efficient order fulfillment  
✅ Prevents notification fatigue  
✅ Battery-friendly (FCM not running when offline)

## Protection Layers Summary

Every notification must pass through **ALL** these checks:

1. ✅ **Online Status** - Shopper has clicked "Start Plas" and has location cookies
2. ✅ **Page Load Cooldown** - At least 15 seconds since page loaded
3. ✅ **Page Visibility** - Browser tab is visible to user
4. ✅ **User Activity** - User has been active within last 5 minutes
5. ✅ **Not Declined** - Order wasn't previously declined by shopper
6. ✅ **Not Duplicate** - Order not already showing
7. ✅ **Cooldown Period** - At least 25 seconds since last notification

If **ANY** check fails, notification is blocked with clear logging.

## Files Modified

### Notification System
- `/src/components/shopper/NotificationSystem.tsx`
  - **Added online status tracking** - Monitor location cookies
  - Added page load tracking
  - Added visibility/activity tracking
  - Persist declined orders to localStorage
  - Multiple notification guard clauses
  - **Stop notifications when shopper goes offline**
  - **Auto-dismiss notifications on offline**

### FCM Hook
- `/src/hooks/useFCMNotifications.ts`
  - **Only initialize FCM when shopper is online**
  - **Monitor online status changes via location cookies**
  - **Auto-cleanup FCM when shopper goes offline**
  - Check page visibility before dispatching events
  - Add comprehensive logging for debugging
  - Listen to `toggleGoLive` events

### FCM Client
- `/src/services/fcmClient.ts`
  - Improved error handling (non-critical)
  - Better debug messages
  - Validate Firebase config before initialization

### Smart Assignment API
- `/pages/api/shopper/smart-assign-order.ts`
  - Already implements notification cache
  - Priority-based order matching
  - Age-weighted scoring

## Monitoring

### Key Metrics to Watch
1. **Notification Show Rate**: % of FCM messages that result in displayed notifications
2. **Decline Rate**: % of shown notifications that get declined
3. **Order Age at Assignment**: Average age of orders when accepted
4. **Duplicate Notification Rate**: Should be near 0%

### Debug Logging
All notification decisions are logged with context:
```javascript
console.log("🚫 FCM: Blocking - page just loaded/refreshed", {
  orderId: order.id,
  timeSincePageLoad: now - pageLoadTimestamp.current,
});
```

Look for these emoji prefixes in console:
- 📲 FCM event received
- 🚫 Notification blocked (with reason)
- ✅ Notification shown
- 🔴 Order declined
- 🟢 Order accepted
- 🔍 API polling check

## Future Improvements

### Potential Enhancements
1. **Machine Learning**: Learn optimal matching patterns from historical data
2. **Dynamic Weighting**: Adjust priority weights based on time of day, location density
3. **Shopper Preferences**: Allow shoppers to set preferences (max distance, order types)
4. **Predictive Notification**: Send notifications before order becomes critical
5. **Multi-Order Batching**: Suggest optimal routes for multiple orders

### Performance Optimizations
1. **WebSocket Integration**: Real-time order updates without polling
2. **Service Worker Caching**: Cache declined orders in service worker
3. **Background Sync**: Queue notifications for offline shoppers
