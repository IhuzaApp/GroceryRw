# 🧹 Clean Up Duplicate Order Offers

## Problem
The system was creating multiple offers for the same shopper-order combination, resulting in duplicate records.

## ✅ Fix Applied
The code now:
1. **Checks** if shopper already has an active offer for an order
2. **Extends** the expiry time instead of creating a new offer
3. **Prevents** duplicate records going forward

## 🗑️ Clean Up Existing Duplicates

### Option 1: Keep Only Latest Offer (Recommended)

Run this in your Hasura console:

```sql
-- Delete duplicate offers, keeping only the most recent one per shopper-order combination
DELETE FROM order_offers
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY shopper_id, 
        COALESCE(order_id, reel_order_id, restaurant_order_id, business_order_id)
        ORDER BY created_at DESC
      ) as row_num
    FROM order_offers
    WHERE status = 'OFFERED'
  ) t
  WHERE row_num > 1
);
```

### Option 2: Keep Only Latest Offer Per Shopper (More Aggressive)

```sql
-- Delete all OFFERED offers except the very latest one for each shopper
DELETE FROM order_offers
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY shopper_id
        ORDER BY created_at DESC
      ) as row_num
    FROM order_offers
    WHERE status = 'OFFERED'
  ) t
  WHERE row_num > 1
);
```

### Option 3: Delete All Old OFFERED Offers (Clean Slate)

```sql
-- Delete all OFFERED offers that are expired
DELETE FROM order_offers
WHERE status = 'OFFERED' 
AND expires_at < NOW();
```

## 🔍 Check Before Cleanup

See how many duplicates you have:

```sql
-- Count offers per shopper-order combination
SELECT 
  shopper_id,
  COALESCE(order_id, reel_order_id, restaurant_order_id, business_order_id) as order_id,
  order_type,
  COUNT(*) as offer_count,
  MAX(created_at) as latest_offer
FROM order_offers
WHERE status = 'OFFERED'
GROUP BY 
  shopper_id, 
  COALESCE(order_id, reel_order_id, restaurant_order_id, business_order_id),
  order_type
HAVING COUNT(*) > 1
ORDER BY offer_count DESC;
```

## 📊 Verify After Cleanup

Check that duplicates are gone:

```sql
-- Should return 0 rows if duplicates are cleaned up
SELECT 
  shopper_id,
  COALESCE(order_id, reel_order_id, restaurant_order_id, business_order_id) as order_id,
  COUNT(*) as offer_count
FROM order_offers
WHERE status = 'OFFERED'
GROUP BY shopper_id, COALESCE(order_id, reel_order_id, restaurant_order_id, business_order_id)
HAVING COUNT(*) > 1;
```

## 🎯 What Happens Now

### Before (Problem):
```
API called → Create new offer (duplicate!)
API called → Create new offer (duplicate!)
API called → Create new offer (duplicate!)
```

### After (Fixed):
```
API called → Create new offer ✅
API called → Extend existing offer ✅ (no duplicate)
API called → Extend existing offer ✅ (no duplicate)
```

## 📝 Logs You'll See

### When extending an existing offer:
```
🔄 Extending existing offer (preventing duplicate): {
  existingOfferId: '...',
  orderId: '...',
  shopperId: '...',
  currentExpiry: '2026-01-13T16:00:37.851Z',
  newExpiry: '2026-01-13T16:01:37.851Z',
  round: 1
}
✅ Offer expiry extended
```

### When creating a new offer:
```
Creating exclusive offer: {
  orderId: '...',
  shopperId: '...',
  round: 1
}
✅ Exclusive offer created
```

## ⚠️ Important Notes

1. **Accepted/Declined offers are NOT affected** - Only `OFFERED` status offers are checked
2. **Round numbers are preserved** - Extended offers keep their original round number
3. **Expiry time is refreshed** - Shopper gets a full new expiry window
4. **No FCM spam** - Shopper only gets notified when offer is first created

## 🚀 Next Steps

1. Run one of the cleanup queries above in Hasura
2. Restart your dev server to pick up the code changes
3. Test that repeated API calls don't create duplicates
4. Check the console logs for "🔄 Extending existing offer" messages
