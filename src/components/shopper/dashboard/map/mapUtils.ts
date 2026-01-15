import L from "leaflet";
import { Location } from "./mapTypes";

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
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
 * @param map Leaflet map instance
 * @returns true if map is ready
 */
export function isMapReady(map: L.Map | null): boolean {
  if (!map) return false;

  try {
    // Check if map has a valid container
    const container = map.getContainer();
    if (!container) return false;

    // Check if container is attached to DOM
    if (!document.body.contains(container)) return false;

    // Check if map has valid center
    const center = map.getCenter();
    if (!center || isNaN(center.lat) || isNaN(center.lng)) return false;

    // Check if map has valid zoom
    const zoom = map.getZoom();
    if (zoom === undefined || isNaN(zoom)) return false;

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safely add a marker to the map
 * @param marker Leaflet marker
 * @param map Leaflet map instance
 * @param name Marker name for logging
 * @returns true if successful
 */
export function safeAddMarker(
  marker: L.Marker,
  map: L.Map | null,
  name: string
): boolean {
  try {
    if (!map || !marker) {
      console.warn(`Cannot add marker ${name}: missing map or marker`);
      return false;
    }

    if (!isMapReady(map)) {
      console.warn(`Cannot add marker ${name}: map not ready`);
      return false;
    }

    marker.addTo(map);
    return true;
  } catch (error) {
    console.error(`Error safely adding marker for ${name}:`, error);
    return false;
  }
}

/**
 * Get cookies as a key-value map
 * @returns Object with cookie key-value pairs
 */
export function getCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};
  document.cookie.split("; ").forEach((cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) {
      cookies[key] = decodeURIComponent(value);
    }
  });
  return cookies;
}

/**
 * Save location to cookies for persistence
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 */
export function saveLocationToCookies(
  latitude: number,
  longitude: number
): void {
  try {
    const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
    document.cookie = `user_latitude=${latitude}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `user_longitude=${longitude}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (error) {
    console.error("Error saving location to cookies:", error);
  }
}

/**
 * Get single location from browser geolocation API
 * @returns Promise with GeolocationPosition
 */
export function getSingleLocation(): Promise<GeolocationPosition> {
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
}

/**
 * Create a custom divIcon for Leaflet markers
 * @param html HTML string for the icon
 * @param iconSize Size of the icon [width, height]
 * @param iconAnchor Anchor point [x, y]
 * @param popupAnchor Popup anchor point [x, y]
 * @returns Leaflet DivIcon
 */
export function createCustomDivIcon(
  html: string,
  iconSize: [number, number] = [24, 24],
  iconAnchor: [number, number] = [12, 12],
  popupAnchor: [number, number] = [0, -24]
): L.DivIcon {
  return L.divIcon({
    html,
    className: "",
    iconSize,
    iconAnchor,
    popupAnchor,
  });
}

/**
 * Create user marker icon (blue dot)
 * @returns HTML string for user marker
 */
export function createUserMarkerIcon(): string {
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
}

/**
 * Create delivery location marker icon (red pin)
 * @returns HTML string for delivery marker
 */
export function createDeliveryMarkerIcon(): string {
  return `
    <div style="position: relative;">
      <div style="
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        width: 32px;
        height: 32px;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;
}

/**
 * Fit map bounds to show specific coordinates
 * @param map Leaflet map instance
 * @param bounds Bounds to fit
 * @param padding Optional padding [top/bottom, left/right]
 * @param maxZoom Optional maximum zoom level
 */
export function fitMapBounds(
  map: L.Map | null,
  bounds: L.LatLngBounds,
  padding: [number, number] = [50, 50],
  maxZoom: number = 15
): void {
  if (!map || !isMapReady(map)) return;

  try {
    map.fitBounds(bounds, {
      padding,
      maxZoom,
    });
  } catch (error) {
    console.error("Error fitting map bounds:", error);
  }
}
