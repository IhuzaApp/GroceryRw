# Order Offers System - Complete Implementation Guide

## Overview

This document describes the **exclusive order offer system** that manages order dispatch to shoppers. This system follows the DoorDash/Uber Eats model where orders are offered to one shopper at a time, with automatic rotation if not accepted.

## System Architecture

### Two-Layer System

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Business Truth (Orders Table)                     │
│  ✓ Is the order assigned to a shopper?                      │
│  ✓ Fields: status, shopper_id                               │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Dispatch Truth (order_offers Table)               │
│  ✓ Who can currently see this order?                        │
│  ✓ Fields: shopper_id, status, expires_at                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Transport (FCM)                                   │
│  ✓ Delivers notifications only, no logic                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Principle

**ONE ORDER = ONE SHOPPER AT A TIME**

Each order can only be offered to ONE shopper at any given moment. The `order_offers` table acts as an **exclusive lock** with expiration.

## Database Schema

### `order_offers` Table

```sql
CREATE TABLE order_offers (
  id UUID PRIMARY KEY,
  
  -- Polymorphic order reference (only ONE should be non-null)
  order_id UUID REFERENCES Orders(id),
  reel_order_id UUID REFERENCES reel_orders(id),
  restaurant_order_id UUID REFERENCES restaurant_orders(id),
  business_order_id UUID REFERENCES business_product_orders(id),
  
  -- The shopper who has the exclusive offer
  shopper_id UUID NOT NULL REFERENCES Shoppers(id),
  
  -- Offer lifecycle
  status TEXT NOT NULL CHECK (status IN ('OFFERED', 'ACCEPTED', 'EXPIRED', 'DECLINED')),
  offered_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Rotation tracking
  round_number INTEGER NOT NULL,
  order_type TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding active offers
CREATE INDEX idx_order_offers_active 
ON order_offers(status, expires_at) 
WHERE status = 'OFFERED' AND expires_at > NOW();

-- Index for finding expired offers
CREATE INDEX idx_order_offers_expired 
ON order_offers(status, expires_at) 
WHERE status = 'OFFERED' AND expires_at <= NOW();
```

### Offer Status States

| Status | Meaning |
|--------|---------|
| `OFFERED` | Active offer, waiting for shopper response |
| `ACCEPTED` | Shopper accepted the order |
| `EXPIRED` | 60 seconds passed without response |
| `DECLINED` | Shopper explicitly skipped the order |

## Complete Dispatch Flow

### 🟢 STEP 1: Find Eligible Orders

**Query Logic:**
```graphql
Orders(
  where: {
    _and: [
      { status: { _eq: "PENDING" } }
      { shopper_id: { _is_null: true } }
      {
        _not: {
          orderOffers: {
            _and: [
              { status: { _eq: "OFFERED" } }
              { expires_at: { _gt: "now()" } }
            ]
          }
        }
      }
    ]
  }
)
```

**Translation:**
- Order is `PENDING`
- Order is not assigned (`shopper_id IS NULL`)
- Order does NOT have an active offer

### 🧠 STEP 2: Select the Next Shopper

**Smart Algorithm:**
```javascript
priorityScore = 
  distance * 0.3 +                    // 30% weight
  (5 - avgRating) * 1.5 +            // 15% weight (inverted)
  (100 - completionRate) * 0.01 +    // 5% weight
  ageFactor +                         // 50% weight
  Math.random() * 0.3                 // 5% randomness
```

**Age Factor:**
- Orders 30+ minutes old: `ageFactor = -5` (highest priority)
- Orders 15-30 minutes old: `ageFactor = -2`
- Orders 5-15 minutes old: `ageFactor = 0`
- Orders under 5 minutes: `ageFactor = 2` (lower priority)

### 🔒 STEP 3: Create Exclusive Offer (THE LOCK)

**API:** `/api/shopper/smart-assign-order`

```javascript
INSERT INTO order_offers (
  order_id,           // or reel_order_id, restaurant_order_id
  shopper_id,         // The selected shopper
  status,             // 'OFFERED'
  offered_at,         // NOW()
  expires_at,         // NOW() + 60 seconds
  round_number        // Current round + 1
)
```

**This row is the exclusive lock.** From now until `expires_at`:
- ✅ Only this shopper can see the order
- ❌ No other shopper will be notified
- ⏱️ Automatic rotation after 60 seconds

### 🔔 STEP 4: Send FCM Notification

**FCM Payload:**
```javascript
{
  type: "new_order",
  orderId: "...",
  orderType: "regular|reel|restaurant",
  expiresIn: "60000",  // MUST match database expires_at
  timestamp: "..."
}
```

**Critical Rule:** 
> `expiresIn` in FCM MUST be calculated from the database `expires_at`, never hardcoded.

### ⏱️ STEP 5: Shopper UI Countdown

**Client Side:**
- Receives FCM notification
- Displays countdown timer
- Shows Accept/Skip buttons
- Auto-hides after expiration

### ✅ STEP 6: Accept Flow (Atomic)

**API:** `/api/shopper/accept-batch`

**Verification Checks:**
1. Verify `order_offers` row exists
2. Verify `shopper_id = current_user`
3. Verify `status = 'OFFERED'`
4. Verify `expires_at > now()`
5. Verify order is still `PENDING`

**Atomic Transaction:**
```sql
-- Step 1: Mark offer as accepted
UPDATE order_offers 
SET status = 'ACCEPTED' 
WHERE id = $offer_id;

-- Step 2: Assign order to shopper
UPDATE Orders 
SET shopper_id = $shopper_id, 
    status = 'accepted',
    assigned_at = NOW()
WHERE id = $order_id;
```

**Response Codes:**

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | Order assigned |
| `403` | `NO_VALID_OFFER` | Offer expired or doesn't exist |
| `409` | `ALREADY_ASSIGNED` | Another shopper got it first |

### 🔄 STEP 7: Rotation Flow

**API:** `/api/shopper/rotate-expired-offers`

**Trigger:** 
- Cron job every 10-15 seconds
- When shopper declines an offer

**Process:**
1. Find all offers where `status = 'OFFERED' AND expires_at < now()`
2. Mark them as `EXPIRED`
3. For each expired offer:
   - Get list of shoppers already offered
   - Exclude them from next round
   - Select next best shopper
   - Create new offer with `round_number + 1`
   - Send FCM to next shopper

**Rotation Logic:**
```javascript
// Get shoppers who already received this order
const offeredShopperIds = await getShoppersAlreadyOffered(orderId);

// Filter them out
const eligibleShoppers = allShoppers.filter(
  shopper => !offeredShopperIds.has(shopper.id)
);

// If all shoppers have been offered, order might need escalation
if (eligibleShoppers.length === 0) {
  // Handle: increase incentive, notify admin, etc.
}
```

### 🚫 STEP 8: Decline Flow

**API:** `/api/shopper/decline-offer`

**Process:**
1. Verify offer belongs to shopper
2. Mark offer as `DECLINED`
3. Immediately trigger rotation

**Benefits:**
- Faster rotation (don't wait 60 seconds)
- Better shopper experience
- More accurate analytics

## API Endpoints

### 1. Smart Assignment (Create Offer)

**Endpoint:** `POST /api/shopper/smart-assign-order`

**Request:**
```json
{
  "user_id": "shopper-uuid",
  "current_location": {
    "lat": 12.345,
    "lng": 67.890
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "shopName": "Shop Name",
    "distance": 2.5,
    "estimatedEarnings": 150,
    "expiresIn": 60000
  },
  "offerId": "offer-uuid",
  "message": "Exclusive offer created"
}
```

### 2. Accept Offer

**Endpoint:** `POST /api/shopper/accept-batch`

**Request:**
```json
{
  "orderId": "order-uuid",
  "userId": "shopper-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order-uuid",
  "offerId": "offer-uuid",
  "roundNumber": 1
}
```

### 3. Decline Offer

**Endpoint:** `POST /api/shopper/decline-offer`

**Request:**
```json
{
  "orderId": "order-uuid",
  "userId": "shopper-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order-uuid",
  "offerId": "offer-uuid"
}
```

### 4. Rotate Expired Offers (Cron)

**Endpoint:** `POST /api/shopper/rotate-expired-offers`

**Request:** None (called by cron)

**Response:**
```json
{
  "success": true,
  "rotatedCount": 5,
  "results": [...]
}
```

## Cron Job Setup

**Recommendation:** Run every 10-15 seconds

**Using Vercel Cron:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/shopper/rotate-expired-offers",
      "schedule": "*/10 * * * * *"  // Every 10 seconds
    }
  ]
}
```

**Using External Cron (e.g., EasyCron):**
```
URL: https://yourapp.com/api/shopper/rotate-expired-offers
Method: POST
Interval: Every 10 seconds
```

## Testing Checklist

### ✅ Test Case 1: Basic Offer Creation
1. Create a new order
2. Call smart-assign-order
3. Verify offer is created in database
4. Verify shopper receives FCM
5. Verify countdown matches database

### ✅ Test Case 2: Accept Flow
1. Create offer
2. Shopper accepts within 60 seconds
3. Verify order is assigned
4. Verify offer status is ACCEPTED
5. Verify no more offers are created

### ✅ Test Case 3: Expiration and Rotation
1. Create offer
2. Wait 60+ seconds
3. Run rotation API
4. Verify first offer is EXPIRED
5. Verify new offer created for different shopper
6. Verify second shopper receives FCM

### ✅ Test Case 4: Decline and Immediate Rotation
1. Create offer
2. Shopper declines
3. Verify offer status is DECLINED
4. Verify new offer immediately created
5. Verify next shopper receives FCM

### ✅ Test Case 5: Race Condition Prevention
1. Create offer for Shopper A
2. Shopper B tries to accept same order
3. Verify Shopper B gets 403 error
4. Verify order remains unassigned

### ✅ Test Case 6: Expired Offer Acceptance
1. Create offer
2. Wait 60+ seconds
3. Shopper tries to accept
4. Verify 403 error
5. Verify order not assigned

## Common Errors and Solutions

### Error: "NO_VALID_OFFER"

**Cause:** Offer expired or doesn't exist

**Solution:**
- Check if 60 seconds passed
- Check if rotation created new offer
- Shopper should refresh to get new offer

### Error: "ALREADY_ASSIGNED"

**Cause:** Another shopper accepted first

**Solution:**
- Normal race condition resolution
- Show "Order no longer available"
- Fetch next available order

### Error: Multiple shoppers seeing same order

**Cause:** Bug in offer creation or rotation

**Debug:**
1. Check `order_offers` table for multiple active offers
2. Verify expiration logic
3. Check cron job is running

### Error: FCM countdown doesn't match server

**Cause:** Hardcoded `expiresIn` value

**Fix:**
- Always calculate from `expires_at` timestamp
- Never use hardcoded values like `90000`

## Performance Optimization

### Database Indexes

```sql
-- For finding eligible orders
CREATE INDEX idx_orders_eligible 
ON Orders(status, shopper_id, created_at)
WHERE status = 'PENDING' AND shopper_id IS NULL;

-- For finding active offers
CREATE INDEX idx_offers_active 
ON order_offers(order_id, status, expires_at)
WHERE status = 'OFFERED' AND expires_at > NOW();
```

### Caching Strategy

**DO NOT cache:**
- ❌ Offer status
- ❌ Order availability
- ❌ Expiration times

**OK to cache (short TTL):**
- ✅ Shopper performance data (30 seconds)
- ✅ Shop/restaurant details (5 minutes)

## Analytics and Monitoring

### Key Metrics

1. **Average Time to Assignment**
   - Target: < 5 minutes
   - Alert if > 15 minutes

2. **Rotation Count per Order**
   - Normal: 1-3 rotations
   - Alert if > 10 rotations

3. **Offer Acceptance Rate**
   - Target: > 60%
   - Optimize if < 40%

4. **Expiration Rate**
   - Target: < 30%
   - Investigate if > 50%

### Query for Analytics

```sql
-- Orders with multiple rotations
SELECT 
  order_id,
  COUNT(*) as rotation_count,
  MAX(round_number) as max_round
FROM order_offers
GROUP BY order_id
HAVING COUNT(*) > 5;

-- Acceptance rates by shopper
SELECT 
  shopper_id,
  COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted,
  COUNT(*) FILTER (WHERE status = 'EXPIRED') as expired,
  COUNT(*) FILTER (WHERE status = 'DECLINED') as declined,
  ROUND(COUNT(*) FILTER (WHERE status = 'ACCEPTED')::numeric / COUNT(*) * 100, 2) as acceptance_rate
FROM order_offers
GROUP BY shopper_id
ORDER BY acceptance_rate DESC;
```

## Migration from Old System

### Step-by-Step Migration

1. **Create `order_offers` table**
2. **Deploy new APIs** (they coexist with old system)
3. **Update shopper app** to use new accept flow
4. **Enable rotation cron job**
5. **Monitor for 24-48 hours**
6. **Remove old notification cache logic**

### Backward Compatibility

During migration, both systems can run in parallel:
- Old system: in-memory cache + direct assignment
- New system: database offers + rotation

Shoppers on new app version use new flow, others use old flow.

## FAQs

**Q: Can a shopper see an order they previously declined?**

A: No. Once a shopper has any record in `order_offers` for an order, they're excluded from future rotations for that order.

**Q: What happens if all shoppers have been offered?**

A: The rotation stops. Consider implementing:
- Increased incentives
- Admin notifications
- Broader geographic radius

**Q: How do we handle urgent orders?**

A: Options:
1. Reduce offer duration for urgent orders (30 seconds instead of 60)
2. Broadcast to multiple shoppers (breaks exclusive model)
3. Auto-assign to highest-rated nearby shopper

**Q: Can we adjust the 60-second timer?**

A: Yes, change `OFFER_DURATION_MS` constant. Consider:
- 30 seconds: Faster rotation, more pressure
- 60 seconds: Current standard
- 90 seconds: More time to decide, slower rotation

## Support and Troubleshooting

### Debug Mode

Enable detailed logging:

```javascript
// In smart-assign-order.ts
console.log("=== ORDER OFFER DEBUG ===");
console.log("Order ID:", orderId);
console.log("Shopper ID:", shopperId);
console.log("Round:", roundNumber);
console.log("Expires At:", expiresAt);
```

### Health Check Endpoint

Create monitoring endpoint:

```javascript
GET /api/shopper/offers-health

Response:
{
  "activeOffers": 5,
  "expiredOffers": 2,
  "oldestOfferAge": 45,  // seconds
  "pendingOrders": 10
}
```

## Conclusion

This system provides:
- ✅ Exclusive order offers (one shopper at a time)
- ✅ Automatic rotation after expiration
- ✅ Fair distribution using smart algorithm
- ✅ Race condition prevention
- ✅ Scalable architecture

The key is maintaining **order_offers as the single source of truth** for who can see an order at any given moment.
