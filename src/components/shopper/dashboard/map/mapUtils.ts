import L from "leaflet";
import { formatCurrencySync } from "../../../../utils/formatCurrency";
import { logger } from "../../../../utils/logger";

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a Leaflet map is ready and fully initialized
 */
export const isMapReady = (map: L.Map | null): boolean => {
  try {
    return (
      !!map &&
      typeof map.setView === "function" &&
      !!map.getContainer() &&
      !!(map as any)._loaded
    );
  } catch (error) {
    console.error("Error checking map readiness:", error);
    return false;
  }
};

/**
 * Get cookies as a key-value map
 */
export const getCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (typeof document === "undefined") return cookies;
  document.cookie.split("; ").forEach((cookie) => {
    const [name, value] = cookie.split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
};

/**
 * Save location to cookies for persistence
 */
export const saveLocationToCookies = (lat: number, lng: number) => {
  if (typeof document === "undefined") return;
  const previousCookies = getCookies();

  document.cookie = `user_latitude=${lat}; path=/; max-age=86400`; // 24 hours
  document.cookie = `user_longitude=${lng}; path=/; max-age=86400`;

  logger.info("Location cookies updated", "mapUtils", {
    previous: {
      latitude: previousCookies["user_latitude"],
      longitude: previousCookies["user_longitude"],
    },
    current: { latitude: lat, longitude: lng },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Format earnings for marker display
 */
export const formatEarningsDisplay = (amount: string) => {
  const value = parseFloat(amount.replace(/[^0-9.]/g, ""));
  if (isNaN(value)) return amount;
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return Math.round(value).toString();
};

/**
 * Calculate offset for clustered markers
 */
export const calculateMarkerOffset = (
  index: number,
  total: number,
  baseRadius: number = 30
) => {
  if (total === 1) return { lat: 0, lng: 0 };
  const angle = (2 * Math.PI * index) / total;
  return {
    lat: (baseRadius / 111111) * Math.cos(angle),
    lng: (baseRadius / 111111) * Math.sin(angle),
  };
};

/**
 * Safely add a marker to the map
 */
export const safeAddMarker = (
  marker: L.Marker,
  map: L.Map | null,
  name: string
): boolean => {
  try {
    if (!map) return false;
    const container = map.getContainer();
    if (!container || !document.body.contains(container)) return false;
    if (!(map as any)._loaded) return false;

    const panes = (map as any)._panes;
    if (!panes || !panes.overlayPane || !document.body.contains(panes.overlayPane)) {
      setTimeout(() => {
        if (map && (map as any)._panes?.overlayPane) {
          try { marker.addTo(map); } catch (err) {}
        }
      }, 100);
      return false;
    }

    marker.addTo(map);
    return true;
  } catch (error) {
    console.error(`Error safely adding marker for ${name}:`, error);
    return false;
  }
};

/**
 * Get single location from browser
 */
export const getSingleLocation = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

/**
 * Create user marker icon
 */
export const createUserMarkerIcon = () => {
  return `
    <div style="
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `;
};
