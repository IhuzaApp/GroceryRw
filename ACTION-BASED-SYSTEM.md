# 🎯 Action-Based Order Assignment System

## ✅ What Changed

### **OLD SYSTEM (Time-Based)**
- ❌ 60-second countdown timer
- ❌ Auto-expires if no action
- ❌ Automatic rotation to next shopper
- ❌ Shoppers could see multiple orders
- ❌ Background cron job needed for expiry

### **NEW SYSTEM (Action-Based)**
- ✅ **No time limit** - Offer stays until action taken
- ✅ **Explicit actions only** - Shopper must accept or decline
- ✅ **One order at a time** - Cannot work on multiple orders
- ✅ **Complete before new offers** - Must deliver current order first
- ✅ **Simpler architecture** - No expiry rotation needed

---

## 🔄 Complete Flow

### 1️⃣ **Order becomes available**
```
New order created (status: PENDING)
        ↓
No active offers exist
        ↓
System selects best nearby shopper
        ↓
Creates exclusive offer (no expiry)
        ↓
Sends FCM notification
```

### 2️⃣ **Shopper sees offer**
```
Notification appears on shopper's device
        ↓
Offer stays visible (no countdown!)
        ↓
Shopper can take their time to review
        ↓
Must choose: ACCEPT or DECLINE
```

### 3️⃣ **If Shopper DECLINES**
```
Shopper clicks "Decline"
        ↓
Offer marked as DECLINED
        ↓
System immediately finds next shopper
        ↓
Creates new offer for next shopper
        ↓
Original shopper can see other orders
```

### 4️⃣ **If Shopper ACCEPTS**
```
Shopper clicks "Accept"
        ↓
Offer marked as ACCEPTED
        ↓
Order.shopper_id = shopper's ID
        ↓
Order.status = "accepted"
        ↓
🚫 Shopper CANNOT see new orders
        ↓
Works exclusively on this order
```

### 5️⃣ **After Delivery**
```
Shopper completes delivery
        ↓
Order.status = "delivered"
        ↓
✅ Shopper available for new offers again
        ↓
Can see available orders
```

---

## 🔒 One Order at a Time Rule

### **Before accepting any order, system checks:**

```typescript
// Check if shopper has active orders
if (shopper has orders with status in ["accepted", "in_progress", "picked_up"]) {
  return {
    message: "Complete your current order before accepting new ones",
    reason: "ACTIVE_ORDER_IN_PROGRESS"
  };
}
```

### **Shopper Statuses:**

| Status | Can See New Offers? | Reason |
|--------|-------------------|--------|
| **No active orders** | ✅ YES | Available to work |
| **Has OFFERED** | ✅ YES | Just viewing, not committed |
| **Has ACCEPTED** | ❌ NO | Working on order |
| **Has IN_PROGRESS** | ❌ NO | Currently shopping |
| **Has PICKED_UP** | ❌ NO | Delivering order |
| **Delivered all orders** | ✅ YES | Available again |

---

## 📊 Database Changes

### **order_offers Table:**

```sql
-- Before (60 second expiry)
expires_at: NOW() + 60 seconds

-- After (no expiry)
expires_at: NOW() + 7 days  -- Effectively "until action"
```

### **Offer Lifecycle:**

```
OFFERED → Waiting for action (no time limit)
   ↓
   ├─→ ACCEPTED (shopper accepted)
   └─→ DECLINED (shopper declined)
```

**Note:** `EXPIRED` status no longer created by system

---

## 🎨 UI/UX Changes

### **Notification Card:**

**Before:**
```
New Order Available!
⏰ 60 seconds remaining
[Accept] [Decline]
```

**After:**
```
New Order Available!
Take your time to review
[Accept] [Decline]
```

### **What Shoppers Will Notice:**

1. ✅ **No countdown timer** - Less pressure
2. ✅ **Can review carefully** - Read all details
3. ✅ **Must take action** - Cannot ignore
4. ✅ **Clear messaging** - "Accept or Decline"
5. ✅ **One at a time** - No overwhelming with multiple orders

---

## 🔧 API Changes

### **`/api/shopper/smart-assign-order`**

**Response when shopper is available:**
```json
{
  "success": true,
  "message": "Exclusive offer created - shopper must accept or decline",
  "order": { ... },
  "offerId": "...",
  "expiresIn": null,
  "note": "Action-based system: offer stays until shopper accepts or declines"
}
```

**Response when shopper has active order:**
```json
{
  "success": false,
  "message": "Complete your current order before accepting new ones",
  "reason": "ACTIVE_ORDER_IN_PROGRESS",
  "activeOrderId": "...",
  "activeOrderStatus": "accepted"
}
```

### **`/api/shopper/decline-offer`**

**Still works the same:**
- Marks offer as DECLINED
- Immediately triggers rotation to next shopper
- Returns list of available orders

### **`/api/shopper/accept-batch`**

**Enhanced with active order check:**
- Verifies shopper doesn't have active orders
- Atomically accepts offer and assigns order
- Prevents accepting while working on another order

---

## 🚫 What Was Removed

### **1. Time-Based Expiry Logic**
```typescript
// ❌ REMOVED
const OFFER_DURATION_MS = 60000;
expiresAt = now + OFFER_DURATION_MS;
```

### **2. Auto-Rotation Cron Job**
```typescript
// ❌ NOT NEEDED ANYMORE
// pages/api/shopper/rotate-expired-offers.ts
```

**Why?** Offers don't expire on time - only on action!

### **3. Countdown Timers in UI**
```typescript
// ❌ REMOVED from frontend
<Timer expiresAt={offer.expires_at} />
```

---

## ✅ What to Test

### **Test Case 1: Basic Flow**
1. Create a new order
2. Shopper receives notification
3. No countdown timer visible
4. Shopper can wait and review
5. Shopper accepts → gets exclusive access
6. ✅ Cannot see new orders while working

### **Test Case 2: Decline Flow**
1. Shopper receives offer
2. Shopper clicks "Decline"
3. Offer goes to next shopper immediately
4. First shopper can see other available orders
5. ✅ System finds next eligible shopper

### **Test Case 3: One at a Time**
1. Shopper accepts Order A
2. API called for new offers
3. System responds: "Complete your current order"
4. ✅ Shopper doesn't see Order B until A is delivered

### **Test Case 4: After Delivery**
1. Shopper delivers Order A
2. Order status = "delivered"
3. API called for new offers
4. ✅ System shows available orders again

---

## 📝 Logs to Look For

### **Shopper Available:**
```
✅ Shopper has no active orders - can receive new offers
Creating exclusive offer: { orderId: '...', note: 'No time limit' }
✅ FCM notification sent | No time limit - waiting for explicit action
```

### **Shopper Busy:**
```
🚫 Shopper already has active order: {
  shopperId: '...',
  activeOrderId: '...',
  status: 'accepted'
}
```

### **Offer Created:**
```
✅ Exclusive offer created: {
  offerId: '...',
  round: 1,
  note: 'No time limit - shopper must accept or decline'
}
```

---

## 🎯 Benefits

1. **✅ Simpler System** - No expiry management
2. **✅ Better UX** - No pressure from countdown
3. **✅ Clearer Intent** - Shoppers must decide explicitly  
4. **✅ One Focus** - Work on one order at a time
5. **✅ No Spam** - Can't be overwhelmed with multiple orders
6. **✅ Professional** - Like Uber Eats/DoorDash model

---

## 🚀 Next Steps

1. ✅ **Code updated** - Action-based system implemented
2. 🧪 **Test the flow** - Accept/Decline/One-at-a-time
3. 🎨 **Update frontend** - Remove countdown timers
4. 📊 **Monitor logs** - Check for "ACTIVE_ORDER_IN_PROGRESS"
5. 🗑️ **Optional:** Delete `rotate-expired-offers.ts` (not needed)

**Your dispatch system is now action-based!** 🎉
