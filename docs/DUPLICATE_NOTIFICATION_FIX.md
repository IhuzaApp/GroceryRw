# Duplicate Notification System Fix

## Problem Identified

The Smart Assignment API was being called **multiple times simultaneously**, causing:
- 🔴 Duplicate database queries to Hasura
- 🔴 Multiple FCM notifications for the same order
- 🔴 Wasted server resources
- 🔴 Confusing logs

### Root Cause

**TWO instances of `NotificationSystem` component were rendering:**

1. ✅ **ShopperLayout.tsx** (line 268) - Intended global instance for all Plasa pages
2. ❌ **ShopperDashboard.tsx** (line 649) - **DUPLICATE** that only rendered on dashboard

When a shopper was on the dashboard page, **BOTH components were active**, each:
- Running their own API polling intervals
- Initializing their own FCM listeners
- Calling `/api/shopper/smart-assign-order` independently
- Sending duplicate FCM notifications

## Solution Applied

### 1. Removed Duplicate Instance
**File:** `src/components/shopper/dashboard/ShopperDashboard.tsx`

```typescript
// REMOVED:
<NotificationSystem
  currentLocation={currentLocation}
  onNewOrder={handleNewOrder}
  onAcceptBatch={(orderId) => {
    loadOrders();
  }}
  onNotificationShow={(order) => {
    setNotifiedOrder(order);
  }}
/>

// REPLACED WITH:
/* 
  NOTE: NotificationSystem is already rendered in ShopperLayout
  and works across all Plasa pages. We don't need a duplicate here.
*/
```

### 2. Added Communication via Custom Events
Since the dashboard needs to know when notifications are shown (to display routes on map), we added custom events:

**File:** `src/components/shopper/NotificationSystem.tsx`

```typescript
// When notification is shown:
window.dispatchEvent(
  new CustomEvent("notification-order-shown", {
    detail: { order },
  })
);

// When notification is hidden:
window.dispatchEvent(
  new CustomEvent("notification-order-hidden", {
    detail: { orderId },
  })
);
```

**File:** `src/components/shopper/dashboard/ShopperDashboard.tsx`

```typescript
// Listen for notification events
useEffect(() => {
  const handleNotificationShown = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { order } = customEvent.detail;
    setNotifiedOrder(order);
  };

  const handleNotificationHidden = (event: Event) => {
    setNotifiedOrder(null);
  };

  window.addEventListener("notification-order-shown", handleNotificationShown);
  window.addEventListener("notification-order-hidden", handleNotificationHidden);

  return () => {
    window.removeEventListener("notification-order-shown", handleNotificationShown);
    window.removeEventListener("notification-order-hidden", handleNotificationHidden);
  };
}, []);
```

### 3. Added Better Debugging
**File:** `src/components/shopper/NotificationSystem.tsx`

Added component ID tracking to identify multiple instances:

```typescript
const componentId = useRef<string>(Math.random().toString(36).substring(7));

useEffect(() => {
  console.log("🔧 NotificationSystem mounted", {
    componentId: componentId.current,
  });

  return () => {
    console.log("🔧 NotificationSystem unmounted", {
      componentId: componentId.current,
    });
  };
}, []);
```

Added lock acquisition logging:

```typescript
// When acquiring lock:
console.log("🔒 API POLLING: Lock acquired", {
  timestamp: new Date().toISOString(),
});

// When lock already held:
console.log("🔒 API POLLING: Already checking for orders, skipping");

// When releasing lock:
console.log("🔓 API POLLING: Lock released", {
  timestamp: new Date().toISOString(),
});
```

### 4. Improved Documentation
**File:** `src/components/shopper/ShopperLayout.tsx`

Added clear documentation about the NotificationSystem:

```typescript
{/* 
  NotificationSystem - Single instance for all Plasa pages
  This component handles:
  - FCM push notifications
  - API polling for new orders
  - Smart order matching
  - Notification display modal
  
  Only renders when shopper is online (has location cookies)
*/}
```

## Architecture Now

### Single NotificationSystem Instance

```
ShopperLayout (renders on ALL Plasa pages)
  └── NotificationSystem (SINGLE INSTANCE)
      ├── Monitors online status
      ├── Initializes FCM
      ├── Polls for orders (when online)
      ├── Shows notification modal
      └── Dispatches custom events
```

### Event Flow

```
NotificationSystem
  ↓ (notification shown)
  window.dispatchEvent("notification-order-shown")
  ↓
ShopperDashboard listens
  ↓
Updates notifiedOrder state
  ↓
MapSection displays route
```

## Testing

### Expected Behavior Now

1. **On Dashboard Load:**
   ```
   🔧 NotificationSystem mounted { componentId: "abc123" }
   🟢 Starting smart notification system - shopper is online
   🔒 API POLLING: Lock acquired
   === Smart Assignment API called === (ONCE)
   🔓 API POLLING: Lock released
   ```

2. **On Dashboard Refresh:**
   ```
   🔧 NotificationSystem unmounted { componentId: "abc123" }
   🔧 NotificationSystem mounted { componentId: "def456" }
   ```

3. **No More Duplicates:**
   - ✅ Only ONE "Smart Assignment API called" per polling interval
   - ✅ Only ONE FCM notification per order
   - ✅ Only ONE database query per check

### How to Verify

1. **Check Console Logs:**
   - Should only see ONE "NotificationSystem mounted" message
   - Should only see ONE "Smart Assignment API called" per interval
   - Should see lock acquire/release messages

2. **Check Server Logs:**
   - Should only see ONE API call per 30 seconds (or 2 minutes with FCM)
   - Should only see ONE FCM notification sent per order

3. **Check Network Tab:**
   - Filter for `/api/shopper/smart-assign-order`
   - Should see calls at regular intervals, not duplicates

## Benefits

### Performance
- ✅ 50% reduction in API calls (removed duplicate instance)
- ✅ 50% reduction in database queries
- ✅ 50% reduction in FCM notifications
- ✅ Lower server load
- ✅ Lower cloud costs

### Reliability
- ✅ No race conditions between instances
- ✅ Consistent notification behavior
- ✅ Cleaner logs for debugging

### User Experience
- ✅ No duplicate notifications
- ✅ Faster response times
- ✅ More efficient battery usage

## Files Modified

1. **src/components/shopper/dashboard/ShopperDashboard.tsx**
   - Removed duplicate NotificationSystem
   - Removed import
   - Added event listeners for notification updates

2. **src/components/shopper/NotificationSystem.tsx**
   - Added component ID for debugging
   - Added custom event dispatching
   - Added better lock logging
   - Added mount/unmount logging

3. **src/components/shopper/ShopperLayout.tsx**
   - Added documentation comments
   - Clarified single instance architecture

## Lessons Learned

1. **Always check for duplicate component instances** when debugging unexpected behavior
2. **Use component IDs** in logs to track multiple instances
3. **Custom events** are a good pattern for cross-component communication without prop drilling
4. **Single source of truth** - only one component should own a specific responsibility
5. **Document architecture decisions** in code comments to prevent future issues

## Future Improvements

1. **Add global state management** (Redux/Zustand) for notification state instead of custom events
2. **Add server-side rate limiting** as an additional safety net
3. **Add metrics tracking** to monitor duplicate calls in production
4. **Add automated tests** to catch duplicate instance issues
