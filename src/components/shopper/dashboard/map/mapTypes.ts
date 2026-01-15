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

// Available Order type (from availableOrders prop)
export interface AvailableOrder {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  distance: string;
  items: number;
  total: string;
  estimatedEarnings: string;
  createdAt: string;
  rawCreatedAt?: string;
  updatedAt?: string;
  shopLatitude?: number;
  shopLongitude?: number;
  customerLatitude?: number;
  customerLongitude?: number;
  priorityLevel?: number;
  minutesAgo?: number;
  status?: string;
  orderType?: "regular" | "reel" | "restaurant";
  shopper_id?: string | null;
  earnings?: number; // Added to match some usages
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
  };
  quantity?: number;
  deliveryNote?: string;
  customerName?: string;
  customerPhone?: string;
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

// Map section props type
export interface MapSectionProps {
  mapLoaded: boolean;
  availableOrders: AvailableOrder[];
  isInitializing?: boolean;
  isExpanded?: boolean;
  notifiedOrder?: any;
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
