# Map Components

This directory contains modularized components for the MapSection, broken down to improve performance and maintainability.

## 📁 File Structure

```
map/
├── index.ts              # Main exports
├── mapTypes.ts           # TypeScript interfaces and types
├── mapUtils.ts           # Utility functions (distance, cookies, etc.)
├── MapPopups.tsx         # Popup HTML creation
├── RouteDrawer.tsx       # Route drawing with OSRM API
├── LocationSyncer.tsx    # Location syncing logic
└── README.md             # This file
```

## 🎯 Purpose

The original `MapSection.tsx` was **3,582 lines** - too large and causing loading issues. This refactoring splits it into focused, reusable modules.

## 📦 Components & Utilities

### mapTypes.ts
All TypeScript interfaces and types:
- `Shop`, `Restaurant`, `PendingOrder`
- `Location`, `LocationHistoryEntry`
- `MapRefs`, `MapState`
- `NotifiedOrder`, `MapSectionProps`
- Constants: `MAP_STYLES`, `DEFAULT_MAP_CENTER`, etc.

### mapUtils.ts
Helper functions:
- `calculateDistanceKm()` - Haversine distance calculation
- `isMapReady()` - Check if map is initialized
- `safeAddMarker()` - Safely add markers to map
- `getCookies()` / `saveLocationToCookies()` - Cookie management
- `getSingleLocation()` - Get browser geolocation
- `createCustomDivIcon()` - Create Leaflet icons
- `createUserMarkerIcon()` / `createDeliveryMarkerIcon()` - Icon HTML
- `fitMapBounds()` - Fit map to bounds

### MapPopups.tsx
Popup HTML creation:
- `createPopupHTML()` - Main popup for orders
- `createShopPopupContent()` - Shop marker popups
- `createOrderPopupContent()` - Order marker popups

### RouteDrawer.tsx
Route drawing logic:
- `useRouteDrawer()` - Custom hook for drawing routes
- Uses OSRM API for road-based routing
- Fallback to straight lines if API fails
- Real-time updates when location/order changes

### LocationSyncer.tsx
Location syncing:
- `useLocationSyncer()` - Sync shopperLocation prop to user marker
- `getInitialLocation()` - Get initial location from props or cookies
- `initializeUserMarkerPosition()` - Set initial marker position

## 🔧 Usage Example

```typescript
import {
  // Types
  Location,
  NotifiedOrder,
  MapSectionProps,
  
  // Utils
  calculateDistanceKm,
  saveLocationToCookies,
  getCookies,
  
  // Popups
  createPopupHTML,
  
  // Hooks
  useRouteDrawer,
  useLocationSyncer,
  getInitialLocation,
} from "./map";

// In your component
function MapSection({ shopperLocation, notifiedOrder }: MapSectionProps) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [routePolyline, setRoutePolyline] = useState<L.Polyline | null>(null);
  const [routeEndMarker, setRouteEndMarker] = useState<L.Marker | null>(null);
  
  // Sync location to map
  useLocationSyncer({
    shopperLocation,
    userMarkerRef,
    mapInstanceRef,
    setCurrentLocation,
  });
  
  // Draw routes
  useRouteDrawer({
    mapInstance,
    mapInstanceRef,
    shopperLocation,
    currentLocation,
    notifiedOrder,
    routePolyline,
    setRoutePolyline,
    routeEndMarker,
    setRouteEndMarker,
  });
  
  // ... rest of component
}
```

## ✅ Benefits

1. **Better Performance**: Smaller files load faster
2. **Code Reusability**: Functions can be used elsewhere
3. **Easier Testing**: Each module can be tested independently
4. **Better Maintainability**: Changes are isolated to specific files
5. **Clearer Organization**: Related code is grouped together

## 🚀 Next Steps

To complete the refactoring:

1. Update `MapSection.tsx` to import from `./map`
2. Replace inline functions with imported utilities
3. Extract marker management logic
4. Extract map controls/UI components
5. Test thoroughly to ensure no regressions

## 📝 Notes

- All console logs include emojis for easy filtering (🗺️, ✅, ❌, ⚠️)
- Functions include JSDoc comments for better IDE support
- Error handling is built into utility functions
- Location always syncs in real-time via `useLocationSyncer`
- Routes redraw automatically when location/order changes
