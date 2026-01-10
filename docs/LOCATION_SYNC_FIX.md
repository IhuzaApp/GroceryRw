# Location Sync Between Landing Page and Header - Fix

## Problem
When users selected a location on the Landing Page, the location wasn't being reflected in the Header Layout. The header only showed the location after login or manual address change.

## Root Cause
1. **Landing Page** was setting location in `temp_address` cookie only
2. **Header Layout** primarily looks for `delivery_address` cookie (JSON format)
3. No `addressChanged` event was being dispatched from Landing Page
4. Header wasn't being notified of location changes from Landing Page

## Solution

### Changes Made to `LandingPage.tsx`

#### 1. Added Cookies Import
```typescript
import Cookies from "js-cookie";
```

#### 2. Updated Location Selection Handler (Main Autocomplete)
When user selects a location via Google Places Autocomplete:
- ✅ Still sets `temp_address` (backward compatibility)
- ✅ Now sets `delivery_address` in proper JSON format
- ✅ Dispatches `addressChanged` event to notify header
- ✅ Includes coordinates (latitude, longitude)

**Before:**
```typescript
document.cookie = `temp_address=${encodeURIComponent(place.formatted_address)}; path=/`;
// Only temp_address, no event dispatched
```

**After:**
```typescript
// Store in temp_address (backward compatibility)
document.cookie = `temp_address=${encodeURIComponent(place.formatted_address)}; path=/`;

// Store in delivery_address (proper format for header)
const addressData = {
  street: shortAddress,
  city: place.formatted_address.split(",")[1]?.trim() || "",
  postal_code: "",
  latitude: lat,
  longitude: lng,
  altitude: "0",
};
Cookies.set("delivery_address", JSON.stringify(addressData));

// Dispatch event to notify header
window.dispatchEvent(new Event("addressChanged"));
```

#### 3. Updated Sticky Header Autocomplete
Same changes applied to the sticky header's location input for consistency.

#### 4. Updated "Current Location" (Geolocation)
When user selects "Current Location":
- ✅ Gets GPS coordinates
- ✅ Reverse geocodes to get address
- ✅ Sets both cookies
- ✅ Dispatches event
- ✅ Handles fallback cases

### How It Works Now

#### Flow 1: User Selects Address from Autocomplete
1. User types and selects location
2. Google Places API returns formatted address + coordinates
3. **Landing Page:**
   - Extracts street and city
   - Sets `temp_address` cookie
   - Sets `delivery_address` cookie (JSON)
   - Dispatches `addressChanged` event
4. **Header Layout:**
   - Receives `addressChanged` event
   - Reads `delivery_address` cookie
   - Updates displayed location ✅

#### Flow 2: User Clicks "Current Location"
1. User clicks location button
2. Browser gets GPS coordinates
3. Reverse geocode to get address
4. **Landing Page:**
   - Sets both cookies with coordinates
   - Dispatches event
5. **Header Layout:**
   - Updates to show location ✅

#### Flow 3: Fallback Cases
- If geocoding fails → Shows "Current Location"
- If no location selected → Header shows "No address set"
- All cases now properly update the header

## Cookie Structure

### `temp_address` (String)
```
temp_address=Kigali, Rwanda
```

### `delivery_address` (JSON String)
```json
{
  "street": "Kigali",
  "city": "Rwanda",
  "postal_code": "",
  "latitude": "-1.9441",
  "longitude": "29.8739",
  "altitude": "0"
}
```

## Header Layout Logic (Already Working)

The header already had the correct logic:
1. Check `delivery_address` cookie first ✅
2. Fall back to `temp_address` if needed ✅
3. Listen for `addressChanged` event ✅
4. Display "Current Location" for GPS-only addresses ✅

The issue was that Landing Page wasn't setting the cookies properly or dispatching the event.

## Testing

### Test Case 1: Select Location on Landing Page
1. Go to landing page
2. Enter location in search box
3. Select from dropdown
✅ **Expected:** Header immediately shows the selected location

### Test Case 2: Use Current Location
1. Go to landing page  
2. Click "Current Location" button
3. Allow location access
✅ **Expected:** Header shows "Current Location" or geocoded address

### Test Case 3: Change Location via Header
1. Already on dashboard
2. Click "Change Address" in header
3. Select different location
✅ **Expected:** Dashboard updates, header updates

### Test Case 4: Guest User Journey
1. Visit as guest
2. Select location on landing page
3. Browse shops
4. Go to checkout
✅ **Expected:** Location persists throughout session

## Files Modified

- ✅ `/src/components/ui/LandingPage.tsx` - Added cookie sync and event dispatch
- ℹ️ `/src/components/ui/NavBar/headerLayout.tsx` - No changes needed (already working correctly)

## Benefits

1. **Immediate Feedback** - Users see their location in header right away
2. **Consistency** - Same location format used everywhere
3. **Better UX** - No confusion about whether location was set
4. **Works for Guests** - Location tracking works before login
5. **Backward Compatible** - Still sets `temp_address` for any legacy code

## Related Components

These components also read the `delivery_address` cookie:
- `UserDashboardLogic.tsx` - For calculating delivery fees and distances
- `checkoutCard.tsx` - For checkout calculations
- All shop cards - For displaying delivery info

All these will now automatically receive the location from Landing Page! 🎯
