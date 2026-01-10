# Testing Shop Ratings & Delivery Fees - Debug Guide

## Issue
Shop cards were showing "N/A" for ratings even though ratings exist in the database.

## Fixes Applied

### 1. Fixed API Query Structure
**Before:** Querying Orders and trying to get Ratings as nested relationship
**After:** Querying Ratings directly and getting Order.shop_id relationship

### 2. Added Default Values
Fixed TypeScript errors by adding `rating: 0` and `ratingCount: 0` to default dynamics object in:
- `DesktopUserDashboard.tsx`
- `MobileUserDashboard.tsx`
- `UserDashboard.tsx`

### 3. Added Debug Logging
Added console logs to help identify issues:
- In `/api/queries/shop-ratings` - logs number of ratings processed
- In `UserDashboardLogic` - logs fetched ratings and shop IDs

## How to Test

### Step 1: Check API Endpoint
Open your browser console and run:
```javascript
fetch('/api/queries/shop-ratings')
  .then(r => r.json())
  .then(data => console.log('Ratings API:', data));
```

**Expected Output:**
```json
{
  "ratings": [
    {
      "shop_id": "uuid-here",
      "averageRating": 3.75,
      "totalRatings": 8,
      "shopName": "Super Fresh Market"
    }
  ]
}
```

### Step 2: Check Shop IDs Match
In the browser console, look for these logs when the page loads:
```
Fetched shop ratings: [...]
Ratings map created: {...}
=== First Shop Debug ===
Shop ID: [shop-uuid]
Shop Name: [shop-name]
All Shop Ratings available: [array of shop IDs]
Shop Rating for this shop: {...}
Calculated Rating: X Count: Y
=======================
```

**What to Check:**
1. Does the "Shop ID" match any of the IDs in "All Shop Ratings available"?
2. If NO match → The shop_id in Orders table doesn't match the shop.id
3. If YES match → Ratings should display correctly

### Step 3: Verify Display
Look at shop cards on the dashboard:
- **Before fix:** "N/A (0)"
- **After fix:** "75% (8)" or "New (0)" if no ratings

### Step 4: Check Server Logs
In your terminal (where Next.js is running), look for:
```
Processing X ratings...
First rating data: {
  rating: 4,
  shop_id: 'uuid-here',
  shop_name: 'Super Fresh Market'
}
Found X shops with ratings: [...]
```

## Common Issues & Solutions

### Issue 1: "No ratings data received"
**Cause:** API endpoint is failing
**Solution:** Check Hasura connection and GraphQL query

### Issue 2: Shop IDs Don't Match
**Cause:** Orders.shop_id might be null or different from Shops.id
**Solution:** Check your database:
```sql
-- Check if shop_id exists in Orders
SELECT DISTINCT shop_id FROM "Orders" WHERE shop_id IS NOT NULL;

-- Check if these IDs exist in Shops
SELECT id, name FROM "Shops" WHERE id IN (
  SELECT DISTINCT shop_id FROM "Orders" WHERE shop_id IS NOT NULL
);
```

### Issue 3: Still Showing "N/A" or "New"
**Possible Causes:**
1. No ratings for that specific shop
2. Shop IDs don't match between Orders and Shops tables
3. Ratings query is not returning Order.shop_id correctly

**Debug Steps:**
1. Check console logs for shop IDs
2. Verify the shop_id in database matches
3. Test the API endpoint directly

## Database Structure Verification

Your ratings structure should look like:
```
Ratings
├── id (uuid)
├── rating (integer 1-5)
├── order_id (uuid) → References Orders.id
└── Order (relationship)
    ├── shop_id (uuid) → References Shops.id
    └── Shop (relationship)
        ├── id (uuid)
        └── name (text)
```

## Expected Behavior After Fixes

1. **Shop with ratings:** Shows "80% (5)" - means average rating of 4 stars from 5 reviews
2. **Shop without ratings:** Shows "New (0)" - means no ratings yet
3. **Delivery fees:** Match the exact amounts shown at checkout
4. **System config:** Fees calculated using baseDeliveryFee + distanceSurcharge from database

## Files Modified for Debugging

1. `/pages/api/queries/shop-ratings.ts` - Added extensive logging
2. `/src/components/user/dashboard/shared/UserDashboardLogic.tsx` - Added debug logs
3. All dashboard components - Added default rating values

## Next Steps

1. Load the dashboard page
2. Open browser console (F12)
3. Look for the debug messages
4. Share the console output if ratings still show "N/A"
5. Share the API response from `/api/queries/shop-ratings`

This will help identify exactly where the issue is occurring.
