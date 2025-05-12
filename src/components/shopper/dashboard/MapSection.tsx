"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader, toaster, Message, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { formatCurrency } from "../../../lib/formatCurrency";

interface MapSectionProps {
  mapLoaded: boolean;
  availableOrders: Array<{
    id: string;
    shopName: string;
    shopAddress: string;
    customerAddress: string;
    distance: string;
    items: number;
    total: string;
    estimatedEarnings: string;
    createdAt: string;
    // Additional properties
    shopLatitude?: number;
    shopLongitude?: number;
    customerLatitude?: number;
    customerLongitude?: number;
    priorityLevel?: number;
    minutesAgo?: number;
    status?: string;
  }>;
  isInitializing?: boolean;
}

// Haversine formula to compute distance in km
function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
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

// Shop data type
interface Shop {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

// Pending order data type
interface PendingOrder {
  id: string;
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

// Add this function near the top with other utility functions
function getOrderTimeBadgeColor(createdAtStr: string): string {
  // Get age in minutes
  const created = new Date(createdAtStr);
  const diffMs = Date.now() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  // Color coding:
  // - Blue: Very recent orders (<10 min) - not normally visible in list view with 10 min filter
  // - Green: Recent orders (10-60 min)
  // - Orange: Older orders (1-24 hours)
  // - Purple: Historical orders (>24 hours)
  if (diffMins < 10) {
    return "#3b82f6"; // blue
  } else if (diffMins < 60) {
    return "#10b981"; // green
  } else if (diffMins < 24 * 60) {
    return "#f59e0b"; // orange
  } else {
    return "#8b5cf6"; // purple
  }
}

export default function MapSection({
  mapLoaded,
  availableOrders,
  isInitializing = false,
}: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  // Refs for real-time map and marker
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  // Add a counter to track location failures
  const locationErrorCountRef = useRef<number>(0);
  // Add loading state for location refresh
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  // Add tracking mode state
  const [isActivelyTracking, setIsActivelyTracking] = useState(false);
  // Track active notification types to prevent duplicates
  const activeToastTypesRef = useRef<Set<string>>(new Set());

  // Function to get cookies as an object
  const getCookies = () => {
    return document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);
  };

  // Function to save location to cookies
  const saveLocationToCookies = (lat: number, lng: number) => {
    document.cookie = `user_latitude=${lat}; path=/; max-age=86400`; // 24 hours
    document.cookie = `user_longitude=${lng}; path=/; max-age=86400`;
  };

  // Function that reduces duplicate toast notifications
  const reduceToastDuplicates = (
    toastType: string,
    content: React.ReactNode,
    options: any = {}
  ) => {
    // Skip if we already have this type of toast active
    if (activeToastTypesRef.current.has(toastType)) {
      return;
    }

    // Add to active toasts
    activeToastTypesRef.current.add(toastType);

    // Show toast and clean up when closed
    return toaster.push(content, {
      ...options,
      onClose: () => {
        // Remove from active toast types
        activeToastTypesRef.current.delete(toastType);

        // Call original onClose if provided
        if (options.onClose) {
          options.onClose();
        }
      },
    });
  };

  // Function to get single location from browser
  const getSingleLocation = () => {
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

  const handleGoLive = () => {
    if (!isOnline) {
      // Going online - get current location from cookies or geolocation
      setIsRefreshingLocation(true);

      // Check if we have location saved in cookies
      const cookieMap = getCookies();

      if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
        // Use saved location first
        const lat = parseFloat(cookieMap["user_latitude"]);
        const lng = parseFloat(cookieMap["user_longitude"]);

        try {
          if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
            userMarkerRef.current.addTo(mapInstanceRef.current);
            mapInstanceRef.current.setView([lat, lng], 16);
          }

          setIsOnline(true);
          setIsRefreshingLocation(false);

          // Ask user if they want to enable active tracking
          reduceToastDuplicates(
            "saved-location-prompt",
            <Message
              showIcon
              type="info"
              header="Using Saved Location"
              closable
            >
              <div>
                <p>
                  Using your saved location. Would you like to enable active
                  tracking?
                </p>
                <div className="mt-2 flex space-x-2">
                  <Button
                    appearance="primary"
                    size="sm"
                    onClick={() => {
                      setIsActivelyTracking(true);
                      startLocationTracking();
                    }}
                  >
                    Enable Tracking
                  </Button>
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => {
                      setIsActivelyTracking(false);
                      reduceToastDuplicates(
                        "static-location-info",
                        <Message showIcon type="info">
                          Using static location. Use the refresh button to
                          update.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    }}
                  >
                    Stay Static
                  </Button>
                </div>
              </div>
            </Message>,
            { placement: "topEnd", duration: 10000 }
          );
        } catch (error) {
          console.error("Error setting position from cookies:", error);
          // Fall back to geolocation
          getCurrentPosition();
        }
      } else {
        // No cookies, get current position
        getCurrentPosition();
      }
    } else {
      // Going offline - clear watch and cookies
      setIsOnline(false);
      setIsActivelyTracking(false);

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Clear user location cookies
      document.cookie =
        "user_latitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_longitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      reduceToastDuplicates(
        "going-offline",
        <Message showIcon type="info" header="Offline">
          Your location is now hidden. You are offline.
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
    }
  };

  useEffect(() => {
    // Check cookies on mount to set online status
    const cookieMap = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
      setIsOnline(true);

      // Log found cookies for debugging
      console.log("Found location cookies:", {
        lat: cookieMap["user_latitude"],
        lng: cookieMap["user_longitude"],
      });
    }
  }, []);

  useEffect(() => {
    // Start or stop continuous location tracking based on online status
    if (isOnline) {
      // Check if we already have location cookies
      const cookieMap = getCookies();

      // If cookies exist, use them first
      if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
        const lat = parseFloat(cookieMap["user_latitude"]);
        const lng = parseFloat(cookieMap["user_longitude"]);

        try {
          // Update marker position from cookies
          if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
            userMarkerRef.current.addTo(mapInstanceRef.current);

            if (
              typeof mapInstanceRef.current.setView === "function" &&
              mapInstanceRef.current.getContainer() &&
              (mapInstanceRef.current as any)._loaded
            ) {
              mapInstanceRef.current.setView([lat, lng], 16);
            }
          }
        } catch (error) {
          console.error("Error setting position from cookies:", error);
        }
      }

      // Only start tracking if actively tracking is enabled
      if (isActivelyTracking) {
        console.log("Starting active location tracking");
        startLocationTracking();
      }
    } else {
      // Stop tracking when going offline
      if (watchIdRef.current !== null) {
        console.log("Stopping location tracking");
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Remove the user marker from the map when offline
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Reset active tracking state
      setIsActivelyTracking(false);

      // Reset map view when offline
      if (
        mapInstanceRef.current &&
        typeof mapInstanceRef.current.setView === "function" &&
        mapInstanceRef.current.getContainer() &&
        (mapInstanceRef.current as any)._loaded
      ) {
        try {
          mapInstanceRef.current.setView([-1.9706, 30.1044], 14);
        } catch (error) {
          console.error("Error resetting map view:", error);
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOnline, isActivelyTracking]); // Added isActivelyTracking dependency

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      center: [-1.9706, 30.1044],
      zoom: 14,
      minZoom: 10,
      maxBounds: [
        [-2.8, 28.8],
        [-1.0, 31.5],
      ],
      scrollWheelZoom: false,
      attributionControl: false,
    });
    // Store map instance for real-time updates
    mapInstanceRef.current = map;

    // Muted, light-themed basemap (CartoDB Positron)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        // attributionControl disabled, no attribution shown
      }
    ).addTo(map);

    // Custom avatar icon for user location
    const userIconHtml = `
      <div style="
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 16px;">👤</span>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userIconHtml,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
    // Add user marker and store reference at default location
    userMarkerRef.current = L.marker([-1.9706, 30.1044], { icon: userIcon })
      .addTo(map)
      .bindPopup("Your Location");
    // Check for stored location in cookies
    const initCookies = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);
    if (initCookies["user_latitude"] && initCookies["user_longitude"]) {
      const lat = parseFloat(initCookies["user_latitude"]);
      const lng = parseFloat(initCookies["user_longitude"]);
      try {
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
        }
        if (
          map &&
          typeof map.setView === "function" &&
          map.getContainer() &&
          (map as any)._loaded
        ) {
          map.setView([lat, lng], 18);
        }
      } catch (error) {
        console.error(
          "Error setting initial map position from cookies:",
          error
        );
      }
    } else if (navigator.geolocation) {
      // No stored location, use live geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          try {
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
            }
            if (
              mapInstanceRef.current &&
              typeof mapInstanceRef.current.setView === "function" &&
              mapInstanceRef.current.getContainer() &&
              (mapInstanceRef.current as any)._loaded
            ) {
              mapInstanceRef.current.setView([latitude, longitude], 18);
            }
          } catch (error) {
            console.error(
              "Error setting initial map position from geolocation:",
              error
            );
          }
        },
        (error) => {
          console.error("Error obtaining initial location:", error);

          // Use fallback location (Kigali city center) when location is unavailable
          const fallbackLat = -1.9706;
          const fallbackLng = 30.1044;

          // Show appropriate error message based on error code
          let errorMessage = "Could not access your location.";
          const errorKey = `init-location-error-${error.code}`;

          if (error.code === 1) {
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
          } else if (error.code === 2) {
            errorMessage =
              "Location unavailable. Using default location instead.";
          } else if (error.code === 3) {
            errorMessage =
              "Location request timed out. Using default location instead.";
          }

          reduceToastDuplicates(
            errorKey,
            <Message showIcon type="info" header="Location Notice">
              {errorMessage}
            </Message>,
            { placement: "topEnd", duration: 5000 }
          );

          // After a short delay, show the manual positioning hint
          setTimeout(() => {
            reduceToastDuplicates(
              "init-manual-position",
              <Message showIcon type="info" header="Manual Position Available">
                You can click anywhere on the map to set your position manually.
              </Message>,
              { placement: "topEnd", duration: 6000 }
            );
          }, 5500);

          // Center map on fallback location with a wider view
          try {
            if (
              mapInstanceRef.current &&
              typeof mapInstanceRef.current.setView === "function" &&
              mapInstanceRef.current.getContainer() &&
              (mapInstanceRef.current as any)._loaded
            ) {
              const map = mapInstanceRef.current;
              map.setView([fallbackLat, fallbackLng], 13);

              // Set up manual position selection
              const setupManualPositioning = () => {
                map.on("click", function onMapClick(e) {
                  const { lat, lng } = e.latlng;

                  // Update user marker position
                  if (userMarkerRef.current) {
                    userMarkerRef.current.setLatLng([lat, lng]);
                    userMarkerRef.current.addTo(map);
                  }

                  // Store the position in cookies
                  document.cookie = `user_latitude=${lat}; path=/`;
                  document.cookie = `user_longitude=${lng}; path=/`;

                  reduceToastDuplicates(
                    "manual-position-set",
                    <Message showIcon type="success" header="Position Set">
                      Your position has been manually set.
                    </Message>,
                    { placement: "topEnd", duration: 3000 }
                  );

                  // Remove the handler after first use
                  map.off("click", onMapClick);
                });
              };

              setupManualPositioning();
            }
          } catch (error) {
            console.error("Error setting fallback map position:", error);
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );
    }
    // Hide the user marker if offline on initial load
    if (!isOnline && userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Fetch and render shop markers with custom icons
    fetch("/api/shopper/shops")
      .then((res) => res.json())
      .then((data: Shop[]) => {
        setShops(data);
        data.forEach((shop) => {
          const lat = parseFloat(shop.latitude);
          const lng = parseFloat(shop.longitude);
          const shopIconHtml = `
            <img src="https://static-00.iconduck.com/assets.00/shop-icon-2048x1878-qov4lrv1.png" style="
              width: 32px;
              height: 32px;
              filter: ${shop.is_active ? "none" : "grayscale(100%)"};
            " />
          `;
          const shopIcon = L.divIcon({
            html: shopIconHtml,
            className: "",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });
          L.marker([lat, lng], { icon: shopIcon })
            .addTo(map)
            .bindPopup(`${shop.name}${shop.is_active ? "" : " (Disabled)"}`);
        });
      })
      .catch((err) => console.error("Shop fetch error:", err));

    // Fetch and display older pending orders (>20min unassigned)
    fetch("/api/shopper/pendingOrders")
      .then((res) => res.json())
      .then((data: PendingOrder[]) => {
        setPendingOrders(data);
        data.forEach((order) => {
          renderPendingOrderMarker(order, map);
        });
      })
      .catch((err) => console.error("Pending orders fetch error:", err));

    // Also, render the available orders from availableOrders prop
    // These are more recent orders (within 24 hours)
    if (availableOrders && availableOrders.length > 0) {
      console.log(`MapSection: Preparing to render ${availableOrders.length} order markers`);
      
      // Render markers for each available order
      availableOrders.forEach((order) => {
        // Skip if missing coordinates
        if (!order.shopLatitude || !order.shopLongitude || 
            isNaN(order.shopLatitude) || isNaN(order.shopLongitude)) {
          console.warn(`MapSection: Skipping order ${order.id} due to missing coordinates`);
          return;
        }
        
        const badgeColor = getOrderTimeBadgeColor(order.createdAt);
        const earningsStr = order.estimatedEarnings;
        
        // Earnings badge icon with color based on time
        const orderIcon = L.divIcon({
          html: `<div style="background:#fff;border:2px solid ${badgeColor};border-radius:12px;padding:4px 12px;font-size:12px;color:${badgeColor};white-space:nowrap;">${earningsStr}</div>`,
          className: "",
          iconSize: [90, 30],
          iconAnchor: [60, 15],
          popupAnchor: [0, -15],
        });
        
        const marker = L.marker([order.shopLatitude, order.shopLongitude], {
          icon: orderIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        
        // Calculate time since creation based on createdAt
        const timeStr = order.createdAt;
        
        // Calculate distance between shop and delivery address
        let distanceStr = "Unknown";
        if (order.shopLatitude && order.shopLongitude && 
            order.customerLatitude && order.customerLongitude) {
          const distKm = getDistanceKm(
            order.shopLatitude,
            order.shopLongitude,
            order.customerLatitude,
            order.customerLongitude
          );
          distanceStr = `${Math.round(distKm * 10) / 10} km`;
        }
        
        // Enhanced popup with icons and flex layout
        const popupContent = `
          <div style="font-size:14px; line-height:1.4; min-width:200px;">
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">🆔</span><strong>${order.id}</strong>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">🏪</span><span>${order.shopName}</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">📍</span><span>${order.shopAddress}</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">⏱️</span><span>${timeStr}</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">📏</span><span>Distance: ${distanceStr}</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">🛒</span><span>Items: ${order.items}</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="margin-right:6px;">🚚</span><span>Deliver to: ${order.customerAddress}</span>
            </div>
            <div style="display:flex;align-items:center;">
              <span style="margin-right:6px;">💰</span><span>Estimated Earnings: ${earningsStr}</span>
            </div>
            <button id="accept-batch-${order.id}" style="margin-top:8px;padding:6px 12px;background:#10b981;color:#fff;border:none;border-radius:4px;cursor:pointer;">
              Accept Batch
            </button>
          </div>
        `;
        
        // Bind popup with max width
        marker.bindPopup(popupContent, { maxWidth: 250 });
        attachAcceptHandler(marker, order.id, map);
      });
    }

    return () => {
      map.remove();
    };
  }, [mapLoaded, availableOrders]);

  useEffect(() => {
    // Listen for dashboard toggle event
    const onToggle = () => handleGoLive();
    window.addEventListener("toggleGoLive", onToggle);
    return () => window.removeEventListener("toggleGoLive", onToggle);
  }, [handleGoLive]);

  // Get the user's current position once
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      reduceToastDuplicates(
        "geolocation-not-supported",
        <Message showIcon type="error" header="Geolocation Error">
          Geolocation is not supported by your browser. Please use a different
          browser.
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
      setIsRefreshingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;

        // Save to cookies
        saveLocationToCookies(latitude, longitude);

        // Update map marker
        if (userMarkerRef.current && mapInstanceRef.current) {
          try {
            userMarkerRef.current.setLatLng([latitude, longitude]);
            userMarkerRef.current.addTo(mapInstanceRef.current);
            mapInstanceRef.current.setView([latitude, longitude], 16);

            setIsOnline(true);
            setIsRefreshingLocation(false);

            // Show success message
            reduceToastDuplicates(
              "location-updated",
              <Message showIcon type="success" header="Location Updated">
                Your current location has been detected. ✅
              </Message>,
              { placement: "topEnd", duration: 3000 }
            );

            // Ask user if they want to enable active tracking
            setTimeout(() => {
              reduceToastDuplicates(
                "tracking-prompt",
                <Message
                  showIcon
                  type="info"
                  header="Location Tracking"
                  closable
                >
                  <div>
                    <p>Would you like to enable active location tracking?</p>
                    <div className="mt-2 flex space-x-2">
                      <Button
                        appearance="primary"
                        size="sm"
                        onClick={() => {
                          setIsActivelyTracking(true);
                          startLocationTracking();
                        }}
                      >
                        Enable Tracking
                      </Button>
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => {
                          setIsActivelyTracking(false);
                          reduceToastDuplicates(
                            "static-location-info",
                            <Message showIcon type="info">
                              Using static location. Use the refresh button to
                              update.
                            </Message>,
                            { placement: "topEnd", duration: 3000 }
                          );
                        }}
                      >
                        Stay Static
                      </Button>
                    </div>
                  </div>
                </Message>,
                { placement: "topEnd", duration: 10000 }
              );
            }, 1000);
          } catch (error) {
            console.error("Error updating map:", error);
            setIsRefreshingLocation(false);
          }
        }
      },
      // Error callback
      (error) => {
        console.error("Geolocation error:", error);
        setIsRefreshingLocation(false);

        // Show error message based on error code
        const errorKey = `location-error-${error.code}`;
        const errorMessage =
          error.code === 1
            ? "Location permission denied. Please enable location access in your browser settings."
            : error.code === 2
            ? "Location unavailable. Please check your device settings."
            : error.code === 3
            ? "Location request timed out. Please try again."
            : "Error getting your location. Please try again.";

        reduceToastDuplicates(
          errorKey,
          <Message showIcon type="error" header="Location Error">
            {errorMessage}
          </Message>,
          { placement: "topEnd", duration: 5000 }
        );

        // Set up manual location mode
        if (mapInstanceRef.current) {
          reduceToastDuplicates(
            "manual-mode-info",
            <Message showIcon type="info" header="Manual Mode">
              Click anywhere on the map to set your location manually.
            </Message>,
            { placement: "topEnd", duration: 5000 }
          );

          try {
            const mapInstance = mapInstanceRef.current;
            const onMapClick = (e: L.LeafletMouseEvent) => {
              const { lat, lng } = e.latlng;

              // Save the position to cookies
              saveLocationToCookies(lat, lng);

              // Update marker
              if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([lat, lng]);
                userMarkerRef.current.addTo(mapInstance);
              }

              reduceToastDuplicates(
                "manual-location-set",
                <Message showIcon type="success" header="Location Set">
                  Your position has been manually set.
                </Message>,
                { placement: "topEnd", duration: 3000 }
              );

              setIsOnline(true);

              // Remove handler after first use
              mapInstance.off("click", onMapClick);
            };

            mapInstance.on("click", onMapClick);
          } catch (mapError) {
            console.error("Error setting up manual mode:", mapError);
          }
        }
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Helper function to display location troubleshooting guidance
  const showLocationTroubleshootingGuide = () => {
    reduceToastDuplicates(
      "location-troubleshooting",
      <Message showIcon type="info" header="Location Troubleshooting">
        <div>
          <p>Try the following steps to fix location issues:</p>
          <ol className="mt-1 list-decimal pl-4">
            <li>Make sure you&#39;re outdoors or near a window</li>
            <li>
              Check that location services are enabled in your device settings
            </li>
            <li>Ensure your browser has permission to access your location</li>
            <li>Try using a different browser or device</li>
          </ol>
        </div>
      </Message>,
      { placement: "topEnd", duration: 10000 }
    );
  };

  // Helper function to start location tracking
  const startLocationTracking = () => {
    // Clear any existing watch first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (navigator.geolocation) {
      // Reset the error counter
      locationErrorCountRef.current = 0;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reset error counter on success
          locationErrorCountRef.current = 0;

          // Save to cookies
          saveLocationToCookies(latitude, longitude);

          // Update marker position and recenter map
          if (userMarkerRef.current && mapInstanceRef.current) {
            try {
              userMarkerRef.current.setLatLng([latitude, longitude]);
              // Check if map is fully initialized
              if (
                typeof mapInstanceRef.current.setView === "function" &&
                mapInstanceRef.current.getContainer() &&
                (mapInstanceRef.current as any)._loaded
              ) {
                mapInstanceRef.current.setView(
                  [latitude, longitude],
                  mapInstanceRef.current.getZoom()
                );
              }
            } catch (error) {
              console.error("Error updating map position:", error);
            }
          }
        },
        (error) => {
          console.error("Error watching location:", error);

          // Increment the error counter
          locationErrorCountRef.current += 1;

          // Handle different error cases
          if (error.code === 1) {
            // Permission denied
            reduceToastDuplicates(
              "location-permission-denied",
              <Message showIcon type="error" header="Location Permission">
                Location tracking was denied. Please enable location access.
              </Message>,
              { placement: "topEnd", duration: 5000 }
            );

            // Automatically stop tracking if permission denied
            setIsActivelyTracking(false);
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
          } else if (error.code === 2) {
            // Position unavailable
            reduceToastDuplicates(
              "location-unavailable",
              <Message showIcon type="warning" header="Location Unavailable">
                Your location is currently unavailable. Using your last saved
                position.
              </Message>,
              { placement: "topEnd", duration: 5000 }
            );

            // If we've had multiple failures, show the troubleshooting guide
            if (locationErrorCountRef.current >= 3) {
              showLocationTroubleshootingGuide();

              // After persistent failures, suggest turning off tracking
              if (locationErrorCountRef.current >= 5) {
                reduceToastDuplicates(
                  "tracking-issues",
                  <Message showIcon type="info" header="Active Tracking Issue">
                    <div>
                      <p>
                        Automatic location tracking is not working well. Would
                        you like to disable it?
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setIsActivelyTracking(false);
                            if (watchIdRef.current !== null) {
                              navigator.geolocation.clearWatch(
                                watchIdRef.current
                              );
                              watchIdRef.current = null;
                            }

                            reduceToastDuplicates(
                              "tracking-disabled",
                              <Message
                                showIcon
                                type="success"
                                header="Tracking Disabled"
                              >
                                Using static location. Use the refresh button to
                                update manually.
                              </Message>,
                              { placement: "topEnd", duration: 3000 }
                            );
                          }}
                          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                        >
                          Disable Tracking
                        </button>
                        <button
                          onClick={() => {
                            // Just close the notification
                          }}
                          className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                        >
                          Keep Trying
                        </button>
                      </div>
                    </div>
                  </Message>,
                  { placement: "topEnd", duration: 10000 }
                );
              }
            }
          } else if (error.code === 3) {
            // Timeout
            reduceToastDuplicates(
              "location-timeout",
              <Message showIcon type="warning" header="Location Timeout">
                Location request timed out. Will retry automatically.
              </Message>,
              { placement: "topEnd", duration: 3000 }
            );
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );

      setIsActivelyTracking(true);
    } else {
      reduceToastDuplicates(
        "geolocation-not-supported",
        <Message showIcon type="error" header="Not Supported">
          Geolocation is not supported by your browser.
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
      setIsActivelyTracking(false);
    }
  };

  // Function to manually refresh location
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      reduceToastDuplicates(
        "geolocation-not-supported",
        <Message showIcon type="error" header="Not Supported">
          Geolocation is not supported by your browser.
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
      return;
    }

    setIsRefreshingLocation(true);

    // Show loading toast
    reduceToastDuplicates(
      "location-updating",
      <Message showIcon type="info" header="Updating Location">
        Getting your current location...
      </Message>,
      { placement: "topEnd", duration: 3000 }
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Save to cookies
        saveLocationToCookies(latitude, longitude);

        // Update marker and map view
        if (userMarkerRef.current && mapInstanceRef.current) {
          try {
            userMarkerRef.current.setLatLng([latitude, longitude]);
            userMarkerRef.current.addTo(mapInstanceRef.current);

            if (
              typeof mapInstanceRef.current.setView === "function" &&
              mapInstanceRef.current.getContainer() &&
              (mapInstanceRef.current as any)._loaded
            ) {
              mapInstanceRef.current.setView([latitude, longitude], 16);
            }

            // Success message
            reduceToastDuplicates(
              "location-updated",
              <Message showIcon type="success" header="Location Updated">
                Your location has been successfully updated.
              </Message>,
              { placement: "topEnd", duration: 3000 }
            );
          } catch (error) {
            console.error("Error updating map on refresh:", error);
          }
        }

        setIsRefreshingLocation(false);
      },
      (error) => {
        console.error("Error refreshing location:", error);
        setIsRefreshingLocation(false);

        // Error message based on error type
        let errorMessage = "Could not update your location.";
        const errorKey = `location-error-${error.code}`;

        if (error.code === 1) {
          errorMessage =
            "Location permission denied. Please enable location access.";
        } else if (error.code === 2) {
          errorMessage =
            "Location unavailable. Using your saved location instead.";
        } else if (error.code === 3) {
          errorMessage =
            "Location request timed out. Using your saved location instead.";
        }

        reduceToastDuplicates(
          errorKey,
          <Message showIcon type="error" header="Location Error">
            {errorMessage}
          </Message>,
          { placement: "topEnd", duration: 5000 }
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  // Helper function to render a pending order marker
  const renderPendingOrderMarker = (order: PendingOrder, map: L.Map) => {
    // Use shop coordinates instead of delivery address
    const lat = order.shopLat;
    const lng = order.shopLng;
    
    // time since creation
    const created = new Date(order.createdAt);
    const diffMs = Date.now() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const timeStr =
      diffMins >= 60
        ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`
        : `${diffMins} mins ago`;
    
    // distance between shop and delivery address
    const distKm = getDistanceKm(
      order.shopLat,
      order.shopLng,
      order.latitude,
      order.longitude
    );
    const distanceStr = `${Math.round(distKm * 10) / 10} km`;
    const earningsStr = formatCurrency(order.earnings);
    
    // Use purple color for older pending orders
    const pendingIcon = L.divIcon({
      html: `<div style="background:#fff;border:2px solid #8b5cf6;border-radius:12px;padding:4px 12px;font-size:12px;color:#8b5cf6;white-space:nowrap;">${earningsStr}</div>`,
      className: "",
      iconSize: [90, 30],
      iconAnchor: [60, 15],
      popupAnchor: [0, -15],
    });
    
    const marker = L.marker([lat, lng], {
      icon: pendingIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    
    // Enhanced popup with icons and flex layout
    const popupContent = `
      <div style="font-size:14px; line-height:1.4; min-width:200px;">
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">🆔</span><strong>${order.id}</strong>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">🏪</span><span>${order.shopName}</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">📍</span><span>${order.shopAddress}</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">⏱️</span><span>${timeStr}</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">📏</span><span>Distance: ${distanceStr}</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">🛒</span><span>Items: ${order.itemsCount}</span>
        </div>
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="margin-right:6px;">🚚</span><span>Deliver to: ${order.addressStreet}, ${order.addressCity}</span>
        </div>
        <div style="display:flex;align-items:center;">
          <span style="margin-right:6px;">💰</span><span>Estimated Earnings: ${earningsStr}</span>
        </div>
        <button id="accept-batch-${order.id}" style="margin-top:8px;padding:6px 12px;background:#10b981;color:#fff;border:none;border-radius:4px;cursor:pointer;">
          Accept Batch
        </button>
      </div>
    `;
    
    // Bind popup with max width
    marker.bindPopup(popupContent, { maxWidth: 250 });
    attachAcceptHandler(marker, order.id, map);
  };

  // Helper function to attach the accept order handler to markers
  const attachAcceptHandler = (marker: L.Marker, orderId: string, map: L.Map) => {
    marker.on("popupopen", () => {
      const btn = document.getElementById(
        `accept-batch-${orderId}`
      ) as HTMLButtonElement | null;
      
      if (btn) {
        btn.addEventListener("click", () => {
          // Show loading state on button
          btn.disabled = true;
          // Change button to green and show spinner
          btn.style.background = "#10b981";
          btn.innerHTML =
            '<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>Assigning...';
          // Toast assigning
          reduceToastDuplicates(
            "order-assigning",
            <Message showIcon type="info" header="Assigning">
              Assigning order...
            </Message>,
            { placement: "topEnd" }
          );
          
          fetch("/api/shopper/assignOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: orderId }),
          })
            .then((res) => res.json())
            .then((data) => {
              // Check if there's a wallet error
              if (data.error === "no_wallet") {
                // Show toast with create wallet button
                reduceToastDuplicates(
                  "no-wallet",
                  <Message
                    showIcon
                    type="warning"
                    header="Wallet Required"
                  >
                    <div>
                      <p>You need a wallet to accept batches.</p>
                      <div className="mt-2">
                        <Button
                          appearance="primary"
                          size="sm"
                          onClick={() => {
                            fetch("/api/queries/createWallet", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            })
                              .then((res) => res.json())
                              .then((data) => {
                                if (data.success) {
                                  reduceToastDuplicates(
                                    "wallet-created",
                                    <Message
                                      showIcon
                                      type="success"
                                      header="Wallet Created"
                                    >
                                      Your wallet has been created
                                      successfully.
                                    </Message>,
                                    { placement: "topEnd" }
                                  );

                                  // Try accepting the batch again after wallet creation
                                  setTimeout(() => {
                                    fetch("/api/shopper/assignOrder", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type":
                                          "application/json",
                                      },
                                      body: JSON.stringify({
                                        orderId: orderId,
                                      }),
                                    })
                                      .then((res) => res.json())
                                      .then((data) => {
                                        if (data.success) {
                                          // Success toast
                                          reduceToastDuplicates(
                                            "order-assigned",
                                            <Message
                                              showIcon
                                              type="success"
                                              header="Assigned"
                                            >
                                              Order assigned!
                                            </Message>,
                                            { placement: "topEnd" }
                                          );
                                          // Remove marker and update state
                                          map.removeLayer(marker);
                                          setPendingOrders((prev) =>
                                            prev.filter(
                                              (o) => o.id !== orderId
                                            )
                                          );
                                        } else {
                                          // Error toast
                                          reduceToastDuplicates(
                                            "order-assign-failed",
                                            <Message
                                              showIcon
                                              type="error"
                                              header="Error"
                                            >
                                              Failed to assign:{" "}
                                              {data.error ||
                                                "Unknown error"}
                                            </Message>,
                                            { placement: "topEnd" }
                                          );
                                          btn.disabled = false;
                                          btn.style.background =
                                            "#3b82f6";
                                          btn.innerHTML = "Accept Batch";
                                        }
                                      })
                                      .catch((err) => {
                                        console.error(
                                          "Assign failed:",
                                          err
                                        );
                                        reduceToastDuplicates(
                                          "order-assign-failed",
                                          <Message
                                            showIcon
                                            type="error"
                                            header="Error"
                                          >
                                            Failed to assign.
                                          </Message>,
                                          { placement: "topEnd" }
                                        );
                                        btn.disabled = false;
                                        btn.style.background = "#3b82f6";
                                        btn.innerHTML = "Accept Batch";
                                      });
                                  }, 1000); // Small delay to let the wallet creation complete
                                } else {
                                  reduceToastDuplicates(
                                    "wallet-creation-failed",
                                    <Message
                                      showIcon
                                      type="error"
                                      header="Error"
                                    >
                                      Failed to create wallet.
                                    </Message>,
                                    { placement: "topEnd" }
                                  );
                                }
                              })
                              .catch((err) => {
                                console.error(
                                  "Wallet creation failed:",
                                  err
                                );
                                reduceToastDuplicates(
                                  "wallet-creation-failed",
                                  <Message
                                    showIcon
                                    type="error"
                                    header="Error"
                                  >
                                    Failed to create wallet.
                                  </Message>,
                                  { placement: "topEnd" }
                                );
                              });
                          }}
                        >
                          Create Wallet
                        </Button>
                      </div>
                    </div>
                  </Message>,
                  { placement: "topEnd", duration: 10000 }
                );

                // Reset button
                btn.disabled = false;
                btn.style.background = "#3b82f6";
                btn.innerHTML = "Accept Batch";
                return;
              }

              // Success toast
              reduceToastDuplicates(
                "order-assigned",
                <Message showIcon type="success" header="Assigned">
                  Order assigned!
                </Message>,
                { placement: "topEnd" }
              );
              // Remove marker and update state
              map.removeLayer(marker);
              setPendingOrders((prev) =>
                prev.filter((o) => o.id !== orderId)
              );
            })
            .catch((err) => {
              console.error("Assign failed:", err);
              reduceToastDuplicates(
                "order-assign-failed",
                <Message showIcon type="error" header="Error">
                  Failed to assign.
                </Message>,
                { placement: "topEnd" }
              );
              btn.disabled = false;
              btn.style.background = "#3b82f6";
              btn.innerHTML = "Accept Batch";
            });
        });
      }
    });
  };

  // If the dashboard is initializing, show a simpler loading state
  if (isInitializing) {
    return (
      <div className="h-[300px] w-full bg-gray-100 md:h-[400px]">
        {/* Intentionally empty during initialization - parent handles loading UI */}
      </div>
    );
  }

  // Show map loading state when map is not ready but dashboard is initialized
  if (!mapLoaded) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center bg-gray-100 md:h-[400px]">
        <Loader size="lg" content="Loading map..." />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[calc(100vh-4rem-3.5rem)] overflow-hidden rounded-lg md:h-[600px]"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader size="lg" content="Loading map..." />
        </div>
      )}

      {mapLoaded && (
        <>
          <button
            onClick={handleGoLive}
            className={`absolute bottom-5 left-1/2 z-[1000] hidden w-[90%] -translate-x-1/2 transform rounded-full py-2 font-bold shadow-lg md:block md:w-auto md:px-4 ${
              isOnline ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isOnline ? "Go Offline" : "Start Plas"}
          </button>

          {/* Add tracking mode indicator */}
          {isOnline && (
            <div className="absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 transform rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-md">
              <div className="flex items-center">
                <span
                  className={`mr-2 inline-block h-3 w-3 rounded-full ${
                    isActivelyTracking
                      ? "animate-pulse bg-green-500"
                      : "bg-blue-500"
                  }`}
                ></span>
                {isActivelyTracking ? "Live Tracking" : "Static Location"}

                <button
                  onClick={() => {
                    if (isActivelyTracking) {
                      // Disable tracking
                      setIsActivelyTracking(false);
                      if (watchIdRef.current !== null) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                      }
                      reduceToastDuplicates(
                        "tracking-disabled",
                        <Message
                          showIcon
                          type="info"
                          header="Tracking Disabled"
                        >
                          Using static location. Use the refresh button to
                          update.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    } else {
                      // Enable tracking
                      startLocationTracking();
                      reduceToastDuplicates(
                        "tracking-enabled",
                        <Message
                          showIcon
                          type="success"
                          header="Tracking Enabled"
                        >
                          Your location will update automatically as you move.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    }
                  }}
                  className="ml-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {isActivelyTracking ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          )}

          {/* Add refresh location button - visible on both mobile and desktop */}
          {isOnline && (
            <button
              onClick={refreshLocation}
              disabled={isRefreshingLocation}
              className="absolute bottom-24 right-5 z-[1001] h-12 w-12 rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 disabled:bg-blue-300 md:bottom-5 md:h-10 md:w-10 md:p-2"
              title="Refresh location"
            >
              {isRefreshingLocation ? (
                <span className="inline-block h-full w-full animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
