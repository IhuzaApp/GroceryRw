# Order Replacement & 60-Second Timeout Fix

## Problems Fixed

### 1. ❌ Better Orders Not Replacing Current Ones
**Problem:** Shopper seeing order with 3900 earnings while system found order with 4500 earnings
- System had `hasCurrentAssignment` check that blocked ALL new orders
- Once a notification was shown, no better orders could replace it
- Shopper missed out on higher-paying orders

**Example from logs:**
```
13:17:59 - Shows order af0f7a8d (3900 earnings)
13:18:27 - API finds order 23b5c595 (4500 earnings) 
           ❌ BLOCKED: hasCurrentAssignment: true
13:19:25 - API finds order 23b5c595 (4500 earnings) again
           ❌ BLOCKED: hasCurrentAssignment: true
```

### 2. ❌ Order Timeout Too Long (90 seconds)
**Problem:** Shoppers had 90 seconds to respond, causing orders to sit too long
- User requested 60 seconds
- Needed to match across all components

### 3. ❌ Notification Mismatch
**Problem:** Terminal showing one order, UI showing different order
- API returning correct order
- But UI not updating due to blocking logic

## Solutions Implemented

### 1. **Smart Order Replacement**

Now allows better orders to replace current ones:

```typescript
// Check if a better order is available (higher earnings)
const currentOrderEarnings = currentUserAssignment
  ? selectedOrder?.estimatedEarnings || 0
  : 0;
const newOrderEarnings = order.estimatedEarnings || 0;
const isBetterOrder = newOrderEarnings > currentOrderEarnings;

// Show order if: no current assignment OR this is a better order
if ((!currentUserAssignment || isBetterOrder) && !wasDeclined) {
  // If replacing, remove old one first
  if (currentUserAssignment && isBetterOrder) {
    console.log("🔄 Replacing current order with better one", {
      oldOrderId: currentUserAssignment.orderId,
      oldEarnings: currentOrderEarnings,
      newOrderId: order.id,
      newEarnings: newOrderEarnings,
    });
    
    // Remove old assignment and notification
    removeToastForOrder(currentUserAssignment.orderId);
  }
  
  // Show new better order
  showToast(orderForNotification);
}
```

### 2. **60-Second Timeout Everywhere**

Changed from 90 seconds to 60 seconds in:

#### NotificationSystem.tsx
```typescript
expiresAt: currentTime + 60000, // Expires in 60 seconds
```

#### smart-assign-order.ts
```typescript
const expireTime = 60000; // 60 seconds
if (!lastSent || now - lastSent > 60000) {
  // Send FCM
}
```

#### fcmService.ts
```typescript
expiresIn: "60000", // 60 seconds
```

#### useFCMNotifications.ts
```typescript
expiresIn: parseInt(data.expiresIn || "60000"), // Default to 60 seconds
```

### 3. **Better Logging**

Added earnings to logs for easier tracking:

```typescript
console.log(
  "✅ FCM notification sent to shopper:",
  user_id,
  "for order:",
  bestOrder.id,
  "| Earnings:",
  orderForNotification.estimatedEarnings
);
```

## How It Works Now

### Scenario 1: No Current Order
```
API finds order A (3900 earnings)
  ↓
No current assignment
  ↓
Show order A ✅
```

### Scenario 2: Better Order Available
```
Currently showing order A (3900 earnings)
  ↓
API finds order B (4500 earnings)
  ↓
4500 > 3900 = Better order!
  ↓
Remove order A notification
  ↓
Show order B ✅
```

### Scenario 3: Worse Order (Ignore)
```
Currently showing order B (4500 earnings)
  ↓
API finds order A (3900 earnings)
  ↓
3900 < 4500 = Worse order
  ↓
Skip order A ❌
Keep showing order B ✅
```

### Scenario 4: Declined Order (Never Show Again)
```
Shopper declined order A
  ↓
Order A in declined list
  ↓
API finds order A again
  ↓
Check declined list
  ↓
Skip order A ❌
```

## Timeline Changes

### Before (90 seconds)
```
0:00 - Order shown
0:30 - Still showing
0:60 - Still showing
0:90 - Expires (too long!)
```

### After (60 seconds)
```
0:00 - Order shown
0:30 - Still showing
0:60 - Expires ✅
```

## Console Logs to Watch

### Order Replacement
```javascript
🔄 Replacing current order with better one {
  oldOrderId: "af0f7a8d...",
  oldEarnings: 3900,
  newOrderId: "23b5c595...",
  newEarnings: 4500
}
```

### Smart Matching
```javascript
🔍 API POLLING CHECK {
  orderId: "23b5c595...",
  currentOrderEarnings: 3900,
  newOrderEarnings: 4500,
  isBetterOrder: true,
  willShow: true
}
```

### FCM Notification
```javascript
✅ FCM notification sent to shopper: 36672ccc-...
   for order: 23b5c595-...
   | Earnings: 4500
```

## Benefits

### For Shoppers
✅ **Always see the best available order**
✅ **Don't miss higher-paying opportunities**
✅ **Faster order assignment (60s instead of 90s)**
✅ **Fair rotation - orders reassigned quicker**

### For Customers
✅ **Orders get picked up faster**
✅ **Better shopper matching**
✅ **Less waiting time**

### For System
✅ **More efficient order distribution**
✅ **Better shopper utilization**
✅ **Higher acceptance rates**

## Testing Checklist

### ✅ Test Order Replacement

1. **Go online as shopper**
2. **Wait for first order** (e.g., 3900 earnings)
3. **Don't accept, wait for polling**
4. **Better order should replace it** (e.g., 4500 earnings)
5. **Check console:** Should see "🔄 Replacing current order"

### ✅ Test 60-Second Timeout

1. **Show order notification**
2. **Wait 60 seconds without responding**
3. **Order should disappear**
4. **New order should be eligible for same shopper**

### ✅ Test Declined Orders

1. **Decline an order**
2. **Wait for it to appear in smart matching again**
3. **Should NOT show to you again**
4. **Check console:** Should see "wasDeclined: true"

### ✅ Test Same Order for Multiple Shoppers

1. **Have 2+ shoppers online**
2. **Single order available**
3. **ALL shoppers should see it simultaneously**
4. **First to accept gets it**

## Edge Cases Handled

### 1. Order Already Showing
```typescript
if (activeToasts.current.has(order.id)) {
  console.log("Skipping - order already showing");
  return;
}
```

### 2. Same Earnings (No Replacement)
```typescript
const isBetterOrder = newOrderEarnings > currentOrderEarnings;
// Must be GREATER, not equal
```

### 3. Declined Orders Never Return
```typescript
const wasDeclined = declinedOrders.current.has(order.id);
if (wasDeclined) {
  console.log("Skipping - order was declined");
  return;
}
```

### 4. FCM Notification Cache
```typescript
// Prevents duplicate FCM sends within 60 seconds
if (!lastSent || now - lastSent > 60000) {
  await sendNewOrderNotification(...);
}
```

## Files Modified

1. **src/components/shopper/NotificationSystem.tsx**
   - ✅ Added order replacement logic
   - ✅ Changed timeout to 60 seconds
   - ✅ Added earnings comparison
   - ✅ Better console logs

2. **pages/api/shopper/smart-assign-order.ts**
   - ✅ Changed FCM cache to 60 seconds
   - ✅ Added earnings to logs
   - ✅ Cleanup interval adjusted

3. **src/services/fcmService.ts**
   - ✅ Changed expiresIn to 60000
   - ✅ Both single and batch notifications

4. **src/hooks/useFCMNotifications.ts**
   - ✅ Changed default expiry to 60 seconds
   - ✅ Both new_order and batch_orders events

## Troubleshooting

### Issue: Not seeing better orders

**Check:**
1. Better order actually has higher earnings
2. Current order hasn't expired yet
3. New order wasn't declined
4. Console shows "isBetterOrder: true"

**Solution:**
- Check `newOrderEarnings > currentOrderEarnings`
- Verify smart matching is returning different orders
- Check declined orders list in localStorage

### Issue: Orders expiring too fast

**Check:**
- Should expire at 60 seconds
- Check `expiresAt` timestamp in logs

**Solution:**
- All timeouts should be 60000 (60 seconds)
- If seeing different value, check for old code

### Issue: Same order to all shoppers not working

**Check:**
- Multiple shoppers online
- Smart matching returning same order
- FCM cache not blocking

**Solution:**
- Smart matching picks ONE best order
- ALL online shoppers get notified
- First to accept wins

## Performance Impact

### Before
- ⏱️ Orders held for 90 seconds
- 🚫 Better orders blocked
- 📉 Missed opportunities

### After
- ⏱️ Orders held for 60 seconds (33% faster)
- ✅ Better orders replace worse ones
- 📈 Optimal order distribution

## Success Metrics

Track these to measure improvement:

1. **Order Acceptance Rate** - Should increase
2. **Average Time to Accept** - Should decrease
3. **Shopper Earnings** - Should increase
4. **Order Fulfillment Time** - Should decrease

## Conclusion

✅ **Better orders now replace current ones**
✅ **60-second timeout consistently applied**
✅ **Notifications match API responses**
✅ **All shoppers see same orders simultaneously**
✅ **Declined orders never return**
✅ **System optimized for speed and fairness**

The smart matching system is now truly "smart"! 🎉
