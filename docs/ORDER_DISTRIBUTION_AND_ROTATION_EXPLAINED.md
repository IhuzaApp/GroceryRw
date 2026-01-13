# Order Distribution & Rotation System - How It Works

## 🎯 Current System Architecture

### **BROADCAST MODEL** (Not Round-Robin)

The current system uses a **"broadcast"** approach where:

- ✅ **ALL online shoppers see the SAME best order**
- ✅ **First to accept wins**
- ❌ **NO rotation or fairness tracking**
- ❌ **NO round-robin distribution**

## 📡 How Distribution Works

### Step 1: Each Shopper Polls Independently

```typescript
// NotificationSystem.tsx (runs for EACH shopper)
const checkForNewOrders = async () => {
  // Every 30 seconds, call the API
  const response = await fetch("/api/shopper/smart-assign-order", {
    method: "POST",
    body: JSON.stringify({
      current_location: currentLocation,
      user_id: session.user.id,
    }),
  });
};
```

### Step 2: Smart Matching Algorithm Calculates Best Order

```typescript
// smart-assign-order.ts
// This algorithm runs IDENTICALLY for each shopper
function calculateShopperPriority(shopperLocation, order, performance) {
  // Distance factor (30% weight)
  const distance = calculateDistanceKm(shopper, order);

  // Order age factor (50% weight) - SAME for all shoppers
  let ageFactor;
  if (ageInMinutes >= 30) ageFactor = -5; // Oldest = highest priority
  else if (ageInMinutes >= 15) ageFactor = -2;
  else if (ageInMinutes >= 5) ageFactor = 0;
  else ageFactor = 2; // Newest = lowest priority

  // Shopper rating (15% weight) - DIFFERENT per shopper
  const ratingScore = (5 - avgRating) * 1.5;

  // Completion rate (5% weight) - DIFFERENT per shopper
  const completionScore = (100 - completionRate) * 0.01;

  // Small randomization (5% weight) - DIFFERENT per call
  const randomFactor = Math.random() * 0.3;

  // Final priority (LOWER = BETTER)
  return (
    distance * 0.3 + ratingScore + completionScore + ageFactor + randomFactor
  );
}
```

### Step 3: Same Order Selected for Most Shoppers

**Example Scenario:**

- 5 shoppers online in the same area
- 3 orders available:
  - Order A: 30 mins old, 4km away, 3900 RWF
  - Order B: 10 mins old, 2km away, 4500 RWF
  - Order C: 5 mins old, 6km away, 5000 RWF

**Priority Calculation:**

| Shopper   | Order A Score | Order B Score | Order C Score | Winner  |
| --------- | ------------- | ------------- | ------------- | ------- |
| Shopper 1 | **-3.2** ⭐   | -0.5          | 1.8           | Order A |
| Shopper 2 | **-3.1** ⭐   | -0.6          | 1.7           | Order A |
| Shopper 3 | **-3.3** ⭐   | -0.4          | 1.9           | Order A |
| Shopper 4 | **-3.0** ⭐   | -0.7          | 1.6           | Order A |
| Shopper 5 | **-3.2** ⭐   | -0.5          | 2.0           | Order A |

**Result:** ALL 5 shoppers see Order A simultaneously! 🔔🔔🔔🔔🔔

### Step 4: First to Accept Wins

```
13:15:00 - Order A shown to all 5 shoppers
13:15:03 - Shopper 2 clicks "Accept" ✅
13:15:05 - Shopper 1 clicks "Accept" ❌ (too late, order taken)
13:15:07 - Shopper 4 clicks "Accept" ❌ (too late, order taken)
```

## 🎲 Randomization (Currently 5%)

The randomization is **VERY SMALL**:

```typescript
Math.random() * 0.3; // Only 5% of total priority calculation
```

**Weight Distribution:**

- 📏 **Distance:** 30%
- ⏰ **Order Age:** 50%
- ⭐ **Shopper Rating:** 15%
- ✅ **Completion Rate:** 5%
- 🎲 **Random:** 5% (0-0.3 points)

**Impact:**

- ✅ **Good:** Ensures nearby, older orders are prioritized
- ❌ **Limited:** Not enough to create fair rotation
- ❌ **Problem:** Same shoppers might consistently win

## 🔄 Rotation System (Currently NONE)

### What's Missing:

#### ❌ No Shopper Rotation Tracking

```typescript
// NOT IMPLEMENTED
const shopperRotation = {
  "shopper-1": { lastOrderTime: Date.now(), orderCount: 5 },
  "shopper-2": { lastOrderTime: Date.now() - 60000, orderCount: 3 },
  "shopper-3": { lastOrderTime: Date.now() - 120000, orderCount: 1 },
};
```

#### ❌ No Priority Boosting for Inactive Shoppers

```typescript
// NOT IMPLEMENTED
if (timeSinceLastOrder > 5 * 60 * 1000) {
  priorityBoost = -2; // Give priority to shoppers who haven't gotten orders
}
```

#### ❌ No Order Count Balancing

```typescript
// NOT IMPLEMENTED
if (shopperOrderCount < averageOrderCount) {
  priorityBoost = -1.5; // Help shoppers with fewer orders
}
```

## 📊 Current System Pros & Cons

### ✅ Advantages

1. **Speed**: Orders get shown to multiple shoppers instantly
2. **Simplicity**: Easy to understand and maintain
3. **Reliability**: No single point of failure
4. **Competition**: Best/fastest shoppers get orders
5. **Coverage**: If one shopper is slow, others can accept

### ❌ Disadvantages

1. **No Fairness**: Same shoppers might dominate
2. **No Rotation**: New shoppers might never get orders
3. **Wasted Notifications**: 4 shoppers see notification but can't accept
4. **No Load Balancing**: Busy shoppers might get more orders
5. **Geographic Clustering**: Shoppers in same area compete unfairly

## 🎯 What You're Asking About

### Q: "How is distribution working?"

**A:** **BROADCAST to all online shoppers**

- Same order goes to ALL shoppers in the area
- Each shopper's app independently polls the API
- Algorithm calculates best order (usually same for all)
- First to click "Accept" wins

### Q: "How is rotation working?"

**A:** **NO ROTATION CURRENTLY**

- No tracking of who got what order
- No fairness algorithm
- No priority boosting for shoppers who haven't gotten orders
- No cooldown for shoppers who just accepted an order

### Q: "How is randomization working?"

**A:** **MINIMAL (5%)**

- Small random factor: `Math.random() * 0.3`
- Adds 0 to 0.3 points to priority score
- Not enough to significantly change order selection
- Order age (50%) and distance (30%) dominate

## 💡 Potential Improvements

### Option 1: Add Shopper Rotation

```typescript
// Track shopper activity
const shopperStats = new Map<
  string,
  {
    lastOrderTime: number;
    orderCount: number;
    acceptedCount: number;
  }
>();

// Boost priority for shoppers who need orders
function calculatePriorityWithRotation(shopper, order) {
  let priority = calculateShopperPriority(shopper, order);

  const stats = shopperStats.get(shopper.id);
  const timeSinceLastOrder = Date.now() - stats.lastOrderTime;

  // Boost shoppers who haven't gotten orders recently
  if (timeSinceLastOrder > 10 * 60 * 1000) {
    priority -= 3; // Strong boost after 10 mins
  } else if (timeSinceLastOrder > 5 * 60 * 1000) {
    priority -= 1.5; // Moderate boost after 5 mins
  }

  // Boost shoppers with fewer orders
  const avgOrders = getAverageOrderCount();
  if (stats.orderCount < avgOrders * 0.7) {
    priority -= 2; // Help new or slow shoppers
  }

  return priority;
}
```

### Option 2: Smart Assignment (One Shopper at a Time)

```typescript
// Instead of showing to all, assign to best shopper
async function smartAssignToOne(order) {
  const onlineShoppers = await getOnlineShoppers();

  // Calculate score for each shopper
  const shopperScores = onlineShoppers.map((shopper) => ({
    shopper,
    score: calculatePriorityWithRotation(shopper, order),
  }));

  // Sort by score (lowest = best)
  shopperScores.sort((a, b) => a.score - b.score);

  // Show to ONLY the best shopper
  await sendNotificationToShopper(shopperScores[0].shopper, order);

  // If they don't accept in 20 seconds, show to next shopper
  setTimeout(() => {
    if (!orderAccepted) {
      sendNotificationToShopper(shopperScores[1].shopper, order);
    }
  }, 20000);
}
```

### Option 3: Increase Randomization

```typescript
// Current: 5% random
const priorityScore = distance * 0.3 + ageFactor + Math.random() * 0.3;

// More random: 20%
const priorityScore = distance * 0.3 + ageFactor + Math.random() * 2.0;

// Even more random: 50%
const priorityScore = distance * 0.3 + ageFactor + Math.random() * 5.0;
```

### Option 4: Zone-Based Distribution

```typescript
// Divide city into zones
const zones = [
  { id: 1, name: "Downtown", bounds: { lat: ..., lng: ... } },
  { id: 2, name: "Suburbs", bounds: { lat: ..., lng: ... } },
];

// Rotate shoppers within zones
function assignOrderInZone(order, zone) {
  const shoppersInZone = getShoppersInZone(zone);
  const nextShopperIndex = zone.currentRotationIndex;

  // Round-robin within zone
  const selectedShopper = shoppersInZone[nextShopperIndex];
  zone.currentRotationIndex = (nextShopperIndex + 1) % shoppersInZone.length;

  return selectedShopper;
}
```

## 🧪 Testing Current System

### Test 1: Verify All Shoppers See Same Order

```bash
# Have 3+ shoppers online in same location
# Watch console logs on each device
# Should see same order ID on all devices within ~30 seconds
```

**Expected:**

```
Shopper 1: 🔔 Order af0f7a8d (3900 RWF) shown
Shopper 2: 🔔 Order af0f7a8d (3900 RWF) shown  ✅ SAME
Shopper 3: 🔔 Order af0f7a8d (3900 RWF) shown  ✅ SAME
```

### Test 2: Verify First Accept Wins

```bash
# All 3 shoppers click "Accept" at different times
# First one should succeed, others should fail
```

**Expected:**

```
Shopper 2 (13:15:03): ✅ Order assigned successfully
Shopper 1 (13:15:05): ❌ Order no longer available
Shopper 3 (13:15:07): ❌ Order no longer available
```

### Test 3: Verify No Rotation

```bash
# Have same shopper keep accepting orders quickly
# They should be able to get ALL orders if fastest
```

**Expected:**

```
13:15 - Shopper 2 accepts order 1 ✅
13:18 - Shopper 2 accepts order 2 ✅
13:21 - Shopper 2 accepts order 3 ✅
# No cooldown, no rotation
```

## 📈 Recommendations

### For Current "Broadcast" System:

1. **Keep if you want competition-based assignment**

   - Fast shoppers get rewarded
   - Orders get picked up quickly
   - Simple to maintain

2. **Add rotation tracking**

   - Track when each shopper last got an order
   - Boost priority for shoppers who haven't gotten orders
   - Balance order distribution

3. **Increase randomization**
   - Change from 5% to 15-20%
   - More variety in who sees what first
   - Better fairness

### For Better Fairness:

1. **Implement round-robin**

   - Track shopper order in queue
   - Rotate who gets shown orders first
   - Guarantee everyone gets a chance

2. **Add cooldown period**

   - After accepting order, shopper gets lower priority for 5 mins
   - Allows other shoppers to catch up
   - Better distribution

3. **Zone-based assignment**
   - Divide city into zones
   - Rotate shoppers within zones
   - Prevent clustering

## 🎯 Summary

### Current System:

✅ **Broadcast Model** - All see same order
✅ **First Come First Served** - Fastest wins
✅ **No Rotation** - Same shoppers can dominate
✅ **5% Random** - Minimal variety
✅ **Age + Distance Priority** - Oldest orders first

### To Add Fairness:

📝 Track shopper order history
📝 Boost priority for inactive shoppers
📝 Add cooldown after accepting
📝 Increase randomization
📝 Implement round-robin

### Trade-offs:

⚖️ **Speed vs Fairness**
⚖️ **Competition vs Rotation**
⚖️ **Simplicity vs Complexity**

The current system optimizes for **SPEED** and **COMPETITION**. If you want **FAIRNESS** and **ROTATION**, we need to add tracking and rotation logic.

What would you prefer? 🤔
