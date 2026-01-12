import { useEffect } from "react";
import L from "leaflet";
import { Location } from "./mapTypes";
import { saveLocationToCookies, isMapReady } from "./mapUtils";

interface LocationSyncerProps {
  shopperLocation: Location | null;
  userMarkerRef: React.MutableRefObject<L.Marker | null>;
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  setCurrentLocation: (location: Location | null) => void;
}

/**
 * Hook that syncs shopperLocation prop with user marker position in real-time
 * This ensures the user's blue dot on the map stays updated as they move
 */
export function useLocationSyncer({
  shopperLocation,
  userMarkerRef,
  mapInstanceRef,
  setCurrentLocation,
}: LocationSyncerProps) {
  useEffect(() => {
    if (shopperLocation && userMarkerRef.current && mapInstanceRef.current) {
      console.log("🗺️ SYNCING SHOPPER LOCATION TO MAP", {
        lat: shopperLocation.lat,
        lng: shopperLocation.lng,
        timestamp: new Date().toISOString(),
      });

      try {
        // Update user marker position
        userMarkerRef.current.setLatLng([shopperLocation.lat, shopperLocation.lng]);

        // Ensure marker is visible on the map
        if (!mapInstanceRef.current.hasLayer(userMarkerRef.current)) {
          userMarkerRef.current.addTo(mapInstanceRef.current);
        }

        // Update local state
        setCurrentLocation(shopperLocation);

        // Save to cookies for persistence
        saveLocationToCookies(shopperLocation.lat, shopperLocation.lng);

        console.log("✅ USER MARKER UPDATED ON MAP");
      } catch (error) {
        console.error("❌ Error updating user marker:", error);
      }
    }
  }, [shopperLocation, userMarkerRef, mapInstanceRef, setCurrentLocation]);
}

/**
 * Get initial location from shopperLocation prop or cookies
 * @param shopperLocation Location from props
 * @param getCookies Function to get cookies
 * @returns Initial location or null
 */
export function getInitialLocation(
  shopperLocation: Location | null,
  getCookies: () => Record<string, string>
): Location | null {
  // Prioritize shopperLocation prop from parent (most current)
  if (shopperLocation) {
    console.log("🗺️ Using shopperLocation prop for initial position", shopperLocation);
    return shopperLocation;
  }

  // Fall back to cookies
  const cookieMap = getCookies();
  if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
    const lat = parseFloat(cookieMap["user_latitude"]);
    const lng = parseFloat(cookieMap["user_longitude"]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log("🗺️ Using cookie location for initial position", { lat, lng });
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Initialize user marker position on map
 * @param userMarker Leaflet marker ref
 * @param mapInstance Leaflet map instance
 * @param initialLocation Initial location to set
 */
export function initializeUserMarkerPosition(
  userMarker: L.Marker | null,
  mapInstance: L.Map | null,
  initialLocation: Location | null
): void {
  if (!initialLocation || !userMarker || !mapInstance || !isMapReady(mapInstance)) {
    return;
  }

  try {
    userMarker.setLatLng([initialLocation.lat, initialLocation.lng]);
    // ALWAYS add marker to map if we have a location (regardless of online status)
    userMarker.addTo(mapInstance);
    mapInstance.setView([initialLocation.lat, initialLocation.lng], 16);
    console.log("✅ User marker added to map at initial position");
  } catch (error) {
    console.error("❌ Error initializing user marker position:", error);
  }
}
