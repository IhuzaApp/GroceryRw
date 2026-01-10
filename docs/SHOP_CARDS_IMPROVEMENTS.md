# Shop Cards Improvements - Implementation Summary

## Overview
Updated shop cards to display legitimate delivery fees based on actual distance calculations and real ratings from the database, ensuring consistency with checkout logic.

## Changes Made

### 1. Delivery Fee Calculation
**Before:** Hardcoded fee calculation
```typescript
const fee = distKm <= 3 ? "1000 frw" : `${1000 + Math.round((distKm - 3) * 300)} frw`;
```

**After:** System configuration-based calculation matching checkout logic
```typescript
const baseDeliveryFee = systemConfig ? parseInt(systemConfig.baseDeliveryFee) : 1000;
const extraDistance = Math.max(0, distKm - 3);
const distanceSurcharge = Math.ceil(extraDistance) * 
  (systemConfig ? parseInt(systemConfig.distanceSurcharge) : 300);
const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
const cappedDistanceFee = systemConfig ? parseInt(systemConfig.cappedDistanceFee) : 3000;
const finalDistanceFee = rawDistanceFee > cappedDistanceFee ? cappedDistanceFee : rawDistanceFee;
```

### 2. Ratings Display
**Before:** Mock ratings
```typescript
const rating = "96%";
const ratingCount = "39";
```

**After:** Real ratings from database
```typescript
const shopRating = shopRatings[shop.id];
const rating = shopRating ? shopRating.averageRating : 0;
const ratingCount = shopRating ? shopRating.totalRatings : 0;
```

### 3. Shop Logo Styling
Updated shop logos on cards with:
- Circular design (changed from square/rounded to fully circular)
- Gradient border (green → blue → purple)
- Enhanced shadow for better visibility
- Applied to both desktop and mobile views

### 4. Text Color Improvements
Ensured white text stays white by adding `!text-white` to:
- Clear filter button
- Open/Closed status badges

## Files Modified

### Core Logic
- `src/components/user/dashboard/shared/UserDashboardLogic.tsx`
  - Added system configuration fetching
  - Added shop ratings fetching
  - Updated delivery fee calculation to match checkout logic
  - Updated shop dynamics to include rating and ratingCount

### Components
- `src/components/user/dashboard/ShopCard.tsx`
  - Updated to accept and display real ratings
  - Enhanced logo styling with circular gradient border
  - Improved text colors with !important flag

- `src/components/user/dashboard/MobileShopCard.tsx`
  - Updated interface to include rating data
  - Enhanced logo styling to match desktop
  - Improved text colors

- `src/components/user/dashboard/DesktopUserDashboard.tsx`
  - Fixed clear filter button text color

### API Endpoints Created
- `pages/api/queries/system-config.ts`
  - Fetches system configuration including delivery fee parameters
  - Returns: baseDeliveryFee, serviceFee, shoppingTime, unitsSurcharge, extraUnits, cappedDistanceFee, distanceSurcharge

- `pages/api/queries/shop-ratings.ts`
  - Aggregates ratings by shop_id from Orders and Ratings tables
  - Calculates average rating and total count per shop
  - Returns array of {shop_id, averageRating, totalRatings}

## Benefits

1. **Consistency**: Delivery fees on shop cards now match exactly what users see at checkout
2. **Accuracy**: Fees are calculated based on actual system configuration, not hardcoded values
3. **Real Data**: Ratings come from actual customer feedback in the database
4. **Maintainability**: Fee calculation logic is centralized and configuration-driven
5. **Better UX**: 
   - Shop logos are more visible with gradient borders and shadows
   - White text maintains readability in all themes
   - Users see accurate delivery costs before entering a shop

## Affected Components
Components using `useUserDashboardLogic` hook automatically benefit:
- ✅ DesktopUserDashboard
- ✅ MobileUserDashboard

Components with standalone implementations (may need manual update):
- ⚠️ UserDashboard.tsx (legacy component - still uses hardcoded fees)

## Testing Recommendations
1. Test delivery fee calculations with various distances (< 3km, > 3km, > capped distance)
2. Verify ratings display correctly for shops with and without ratings
3. Test shop logo visibility on different image backgrounds
4. Verify text colors in both light and dark mode
5. Compare delivery fees shown on cards with checkout amounts
