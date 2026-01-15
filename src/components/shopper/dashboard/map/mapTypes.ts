import L from "leaflet";

// Shop data type
export interface Shop {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  logo?: string | null;
}

// Restaurant data type
export interface Restaurant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  lat?: string;
  long?: string;
  profile?: string;
  verified?: boolean;
  created_at: string;
}

// Pending order data type
export interface PendingOrder {
  id: string;
  status: string;
  shop_id: string;
  customer_id: string;
  latitude: number;
  longitude: number;
  earnings: number;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  createdAt: string;
  itemsCount: number;
  addressStreet: string;
  addressCity: string;
}

// Location type
export interface Location {
  lat: number;
  lng: number;
}

// Location history entry
export interface LocationHistoryEntry {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy: number;
}

// Map refs type
export interface MapRefs {
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  userMarkerRef: React.MutableRefObject<L.Marker | null>;
  shopMarkersRef: React.MutableRefObject<L.Marker[]>;
  orderMarkersRef: React.MutableRefObject<L.Marker[]>;
  watchIdRef: React.MutableRefObject<number | null>;
  locationErrorCountRef: React.MutableRefObject<number>;
  activeToastTypesRef: React.MutableRefObject<Set<string>>;
  busyAreaCirclesRef: React.MutableRefObject<L.Circle[]>;
  locationUpdateTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  locationRetryTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  lastLocationRef: React.MutableRefObject<Location | null>;
  locationUpdateCountRef: React.MutableRefObject<number>;
  lastAccuracyRef: React.MutableRefObject<number | null>;
  locationHistoryRef: React.MutableRefObject<LocationHistoryEntry[]>;
  cookieSnapshotRef: React.MutableRefObject<string>;
}

// Map state type
export interface MapState {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  isRefreshingLocation: boolean;
  setIsRefreshingLocation: (refreshing: boolean) => void;
  isActivelyTracking: boolean;
  setIsActivelyTracking: (tracking: boolean) => void;
  routePolyline: L.Polyline | null;
  setRoutePolyline: (polyline: L.Polyline | null) => void;
  routeEndMarker: L.Marker | null;
  setRouteEndMarker: (marker: L.Marker | null) => void;
  mapInstance: L.Map | null;
  setMapInstance: (map: L.Map | null) => void;
  locationError: string | null;
  setLocationError: (error: string | null) => void;
  locationAccuracy: number | null;
  setLocationAccuracy: (accuracy: number | null) => void;
  lastLocationUpdate: Date | null;
  setLastLocationUpdate: (date: Date | null) => void;
  locationHistory: LocationHistoryEntry[];
  setLocationHistory: (history: LocationHistoryEntry[]) => void;
}

// Notified order type (from props)
export interface NotifiedOrder {
  id: string;
  shopName: string;
  distance: number;
  customerAddress: string;
  customerLatitude?: number;
  customerLongitude?: number;
  shopLatitude?: number;
  shopLongitude?: number;
  itemsCount?: number;
  estimatedEarnings?: number;
  orderType?: "regular" | "reel" | "restaurant";
}

// Map section props type
export interface MapSectionProps {
  mapLoaded: boolean;
  availableOrders: any[];
  isInitializing?: boolean;
  isExpanded?: boolean;
  notifiedOrder?: NotifiedOrder | null;
  shopperLocation?: Location | null;
}

// Map styles
export const MAP_STYLES = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

// Default map center (Kigali, Rwanda)
export const DEFAULT_MAP_CENTER: [number, number] = [-1.9706, 30.1044];
export const DEFAULT_MAP_ZOOM = 14;
export const MAX_MAP_ZOOM = 19;
export const MIN_MAP_ZOOM = 3;
