import { useEffect } from "react";
import L from "leaflet";
import { Location, NotifiedOrder } from "./mapTypes";
import {
  createCustomDivIcon,
  createDeliveryMarkerIcon,
  fitMapBounds,
  isMapReady,
} from "./mapUtils";

interface RouteDrawerProps {
  mapInstance: L.Map | null;
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  shopperLocation: Location | null;
  currentLocation: Location | null;
  notifiedOrder: NotifiedOrder | null;
  routePolyline: L.Polyline | null;
  setRoutePolyline: (polyline: L.Polyline | null) => void;
  routeEndMarker: L.Marker | null;
  setRouteEndMarker: (marker: L.Marker | null) => void;
}

/**
 * Component that handles drawing routes from shopper location to delivery address
 * Uses OSRM API for road-based routing with fallback to straight lines
 */
export function useRouteDrawer({
  mapInstance,
  mapInstanceRef,
  shopperLocation,
  currentLocation,
  notifiedOrder,
  routePolyline,
  setRoutePolyline,
  routeEndMarker,
  setRouteEndMarker,
}: RouteDrawerProps) {
  useEffect(() => {
    // Use shopperLocation passed from parent for route display
    const locationForRoute = shopperLocation || currentLocation;

    console.log("🗺️ ROUTE DRAWING EFFECT TRIGGERED", {
      hasMapInstance: !!mapInstance,
      hasLocationForRoute: !!locationForRoute,
      hasNotifiedOrder: !!notifiedOrder,
      locationForRoute,
      notifiedOrderId: notifiedOrder?.id,
      timestamp: new Date().toISOString(),
    });

    if (!mapInstance || !locationForRoute || !notifiedOrder) {
      console.log("🗺️ Clearing routes - missing requirements", {
        hasMapInstance: !!mapInstance,
        hasLocationForRoute: !!locationForRoute,
        hasNotifiedOrder: !!notifiedOrder,
      });

      // Clear route and markers if no notified order
      if (routePolyline) {
        routePolyline.remove();
        setRoutePolyline(null);
      }
      if (routeEndMarker) {
        routeEndMarker.remove();
        setRouteEndMarker(null);
      }
      return;
    }

    console.log("🗺️ Drawing route from shopper to customer", {
      from: locationForRoute,
      to: {
        lat: notifiedOrder.customerLatitude,
        lng: notifiedOrder.customerLongitude,
      },
      orderId: notifiedOrder.id,
    });

    // Clear existing route and markers
    if (routePolyline) {
      routePolyline.remove();
    }
    if (routeEndMarker) {
      routeEndMarker.remove();
    }

    // Get customer delivery address coordinates
    const deliveryLat = notifiedOrder.customerLatitude;
    const deliveryLng = notifiedOrder.customerLongitude;

    if (!deliveryLat || !deliveryLng) {
      console.warn("⚠️ Missing delivery coordinates", {
        deliveryLat,
        deliveryLng,
      });
      return;
    }

    // Fetch route from OSRM (follows actual roads)
    const fetchRoute = async () => {
      try {
        // OSRM API endpoint (using public demo server)
        // Format: longitude,latitude (note: OSRM uses lon,lat not lat,lon)
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${locationForRoute.lng},${locationForRoute.lat};${deliveryLng},${deliveryLat}?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          console.warn(
            "⚠️ OSRM returned no routes, falling back to straight line"
          );
          throw new Error("No route found");
        }

        // Use ref instead of state to get current map instance
        const currentMapInstance = mapInstanceRef.current;

        // Check if map instance is still valid
        if (!currentMapInstance || !isMapReady(currentMapInstance)) {
          console.warn("⚠️ Map instance no longer available");
          return;
        }

        // Get the route geometry (array of [lng, lat] coordinates)
        const routeGeometry = data.routes[0].geometry.coordinates;

        // Convert from [lng, lat] to [lat, lng] for Leaflet
        const routeCoords: L.LatLngExpression[] = routeGeometry.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        // Create polyline with green color following roads
        const polyline = L.polyline(routeCoords, {
          color: "#10b981", // green-500
          weight: 7,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(currentMapInstance);

        setRoutePolyline(polyline);

        // silent

        // Create end marker (customer delivery location) - Red pin
        const endMarkerIcon = createCustomDivIcon(
          createDeliveryMarkerIcon(),
          [32, 32],
          [16, 32],
          [0, -32]
        );

        const endMarker = L.marker([deliveryLat, deliveryLng], {
          icon: endMarkerIcon,
          zIndexOffset: 1001,
        }).addTo(currentMapInstance);

        endMarker.bindPopup(
          `<b>Delivery Address</b><br>${notifiedOrder.customerAddress}`
        );
        setRouteEndMarker(endMarker);

        // Fit map bounds to show the entire route
        fitMapBounds(currentMapInstance, polyline.getBounds(), [80, 80], 15);
      } catch (error) {
        // Use ref instead of state to get current map instance
        const currentMapInstance = mapInstanceRef.current;

        // Check if map instance is still valid before fallback
        if (!currentMapInstance || !isMapReady(currentMapInstance)) {
          console.warn("⚠️ Map instance no longer available for fallback");
          return;
        }

        // Fallback: Draw straight line if routing service fails
        const fallbackCoords: L.LatLngExpression[] = [
          [locationForRoute.lat, locationForRoute.lng],
          [deliveryLat, deliveryLng],
        ];

        const polyline = L.polyline(fallbackCoords, {
          color: "#10b981",
          weight: 7,
          opacity: 0.9,
          dashArray: "12, 8",
        }).addTo(currentMapInstance);

        setRoutePolyline(polyline);

        console.log("✅ FALLBACK ROUTE DRAWN (straight line)", {
          from: fallbackCoords[0],
          to: fallbackCoords[1],
          orderId: notifiedOrder.id,
          timestamp: new Date().toISOString(),
        });

        // Create end marker (customer delivery location) - Red pin
        const endMarkerIcon = createCustomDivIcon(
          createDeliveryMarkerIcon(),
          [32, 32],
          [16, 32],
          [0, -32]
        );

        const endMarker = L.marker([deliveryLat, deliveryLng], {
          icon: endMarkerIcon,
          zIndexOffset: 1001,
        }).addTo(currentMapInstance);

        endMarker.bindPopup(
          `<b>Delivery Address</b><br>${notifiedOrder.customerAddress}`
        );
        setRouteEndMarker(endMarker);

        fitMapBounds(currentMapInstance, polyline.getBounds(), [80, 80], 14);
      }
    };

    fetchRoute();

    // Cleanup function
    return () => {
      if (routePolyline) {
        routePolyline.remove();
      }
      if (routeEndMarker) {
        routeEndMarker.remove();
      }
    };
  }, [
    mapInstance,
    mapInstanceRef,
    shopperLocation,
    currentLocation,
    notifiedOrder,
    setRoutePolyline,
    setRouteEndMarker,
  ]);
}
