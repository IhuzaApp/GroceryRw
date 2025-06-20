"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader, toaster, Message, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { formatCurrency } from "../../../lib/formatCurrency";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";

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
  isExpanded?: boolean;
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

export default function MapSection({
  mapLoaded,
  availableOrders,
  isInitializing = false,
  isExpanded = false,
}: MapSectionProps) {
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const shopMarkersRef = useRef<L.Marker[]>([]);
  const orderMarkersRef = useRef<L.Marker[]>([]);
  const locationErrorCountRef = useRef<number>(0);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isActivelyTracking, setIsActivelyTracking] = useState(false);
  const activeToastTypesRef = useRef<Set<string>>(new Set());
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderMarkers, setOrderMarkers] = useState<L.Marker[]>([]);
  const [shopMarkers, setShopMarkers] = useState<L.Marker[]>([]);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [locationErrorCount, setLocationErrorCount] = useState(0);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(
    null
  );
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<
    Array<{
      lat: number;
      lng: number;
      timestamp: Date;
      accuracy: number;
    }>
  >([]);

  // Refs
  const mapInitializedRef = useRef(false);
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const locationUpdateCountRef = useRef(0);
  const lastAccuracyRef = useRef<number | null>(null);
  const locationHistoryRef = useRef<
    Array<{
      lat: number;
      lng: number;
      timestamp: Date;
      accuracy: number;
    }>
  >([]);

  // Cookie monitoring refs
  const cookieSnapshotRef = useRef<string>("");

  // Map style URLs using better contrasted tiles
  const mapStyles = {
    light: "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",
    dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  };

  // Function to update map style based on theme
  const updateMapStyle = () => {
    setMapStyle(theme === "dark" ? "dark-v11" : "streets-v12");
  };

  // Get cookies helper function
  const getCookies = () => {
    const cookies: Record<string, string> = {};
    document.cookie.split("; ").forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  };

  // Monitor cookies effect
  useEffect(() => {
    const currentCookies = getCookies();
    const cookieSnapshot = JSON.stringify(currentCookies);
    cookieSnapshotRef.current = cookieSnapshot;

    const checkCookies = () => {
      const newCookies = getCookies();
      const newSnapshot = JSON.stringify(newCookies);

      // If cookies changed
      if (newSnapshot !== cookieSnapshotRef.current) {
        // Log the change
        logger.info("Cookie state changed", "MapSection", {
          previous: JSON.parse(cookieSnapshotRef.current),
          current: newCookies,
          timestamp: new Date().toISOString(),
        });

        // Update snapshot
        cookieSnapshotRef.current = newSnapshot;
      }
    };

    // Check every 2 minutes
    const interval = setInterval(checkCookies, 120000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Add theme effect
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      updateMapStyle();
    }
  }, [theme, mapLoaded]);

  // Modify saveLocationToCookies to include logging
  const saveLocationToCookies = (lat: number, lng: number) => {
    const previousCookies = getCookies();

    document.cookie = `user_latitude=${lat}; path=/; max-age=86400`; // 24 hours
    document.cookie = `user_longitude=${lng}; path=/; max-age=86400`;

    // Log the location update
    logger.info("Location cookies updated", "MapSection", {
      previous: {
        latitude: previousCookies["user_latitude"],
        longitude: previousCookies["user_longitude"],
      },
      current: {
        latitude: lat,
        longitude: lng,
      },
      timestamp: new Date().toISOString(),
    });
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

  // Helper function to check if map is ready for interaction
  const isMapReady = (map: L.Map): boolean => {
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

  // Standardize the marker safety function
  const safeAddMarker = (
    marker: L.Marker,
    map: L.Map,
    name: string
  ): boolean => {
    try {
      // Extra validation to prevent appendChild errors
      if (!map) {
        console.warn(`Map is undefined when adding marker for ${name}`);
        return false;
      }

      // Check if the map container exists and is in the DOM
      const container = map.getContainer();
      if (!container) {
        console.warn(
          `Map container is undefined when adding marker for ${name}`
        );
        return false;
      }

      // Check if container is actually in the DOM
      if (!document.body.contains(container)) {
        console.warn(
          `Map container is not in DOM when adding marker for ${name}`
        );
        return false;
      }

      // Verify map is properly initialized
      if (!(map as any)._loaded) {
        console.warn(`Map not fully loaded when adding marker for ${name}`);
        return false;
      }

      // If all checks pass, add the marker
      marker.addTo(map);
      return true;
    } catch (error) {
      console.error(`Error safely adding marker for ${name}:`, error);
      return false;
    }
  };

  // Helper function to display location troubleshooting guidance
  const showLocationTroubleshootingGuide = () => {
    reduceToastDuplicates(
      "location-troubleshooting",
      <Message
        showIcon
        type="info"
        header="Location Troubleshooting"
        className={theme === "dark" ? "rs-message-dark" : ""}
      >
        <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
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

              // Check if map is fully initialized using our helper
              if (isMapReady(mapInstanceRef.current)) {
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
              <Message
                showIcon
                type="error"
                header="Location Permission"
                className={theme === "dark" ? "rs-message-dark" : ""}
              >
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
              <Message
                showIcon
                type="warning"
                header="Location Unavailable"
                className={theme === "dark" ? "rs-message-dark" : ""}
              >
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
                  <Message
                    showIcon
                    type="info"
                    header="Active Tracking Issue"
                    className={theme === "dark" ? "rs-message-dark" : ""}
                  >
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
                                className={
                                  theme === "dark" ? "rs-message-dark" : ""
                                }
                              >
                                Using static location. Use the refresh button to
                                update manually.
                              </Message>,
                              { placement: "topEnd", duration: 3000 }
                            );
                          }}
                          className={`rounded px-3 py-1 text-sm text-white ${
                            theme === "dark"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          Disable Tracking
                        </button>
                        <button
                          onClick={() => {
                            // Just close the notification
                          }}
                          className={`rounded px-3 py-1 text-sm text-white ${
                            theme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
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
              <Message
                showIcon
                type="warning"
                header="Location Timeout"
                className={theme === "dark" ? "rs-message-dark" : ""}
              >
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

  // Helper function to attach the accept order handler to markers
  const attachAcceptHandler = (
    marker: L.Marker,
    orderId: string,
    map: L.Map
  ) => {
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
                  <Message showIcon type="warning" header="Wallet Required">
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
                                      Your wallet has been created successfully.
                                    </Message>,
                                    { placement: "topEnd" }
                                  );

                                  // Try accepting the batch again after wallet creation
                                  setTimeout(() => {
                                    fetch("/api/shopper/assignOrder", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
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
                                            prev.filter((o) => o.id !== orderId)
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
                                              {data.error || "Unknown error"}
                                            </Message>,
                                            { placement: "topEnd" }
                                          );
                                          btn.disabled = false;
                                          btn.style.background = "#3b82f6";
                                          btn.innerHTML = "Accept Batch";
                                        }
                                      })
                                      .catch((err) => {
                                        console.error("Assign failed:", err);
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
                                console.error("Wallet creation failed:", err);
                                reduceToastDuplicates(
                                  "wallet-creation-failed",
                                  <Message showIcon type="error" header="Error">
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
              setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
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

  // Helper function to format earnings amount
  const formatEarningsDisplay = (amount: string) => {
    // Remove currency symbol and commas, then parse as number
    const value = parseFloat(amount.replace(/[^0-9.]/g, ""));

    if (isNaN(value)) return amount;

    if (value >= 1000) {
      // Format to one decimal place for thousands, no currency
      return `${(value / 1000).toFixed(1)}k`;
    }

    // For hundreds, just return the number without currency
    return Math.round(value).toString();
  };

  // Helper function to calculate offset for clustered markers
  const calculateMarkerOffset = (
    index: number,
    total: number,
    baseRadius: number = 30
  ) => {
    if (total === 1) return { lat: 0, lng: 0 };

    // Calculate angle for even distribution in a circle
    const angle = (2 * Math.PI * index) / total;

    // Calculate offset using trigonometry
    return {
      lat: (baseRadius / 111111) * Math.cos(angle), // Convert meters to degrees (roughly)
      lng: (baseRadius / 111111) * Math.sin(angle), // 111111 meters = 1 degree at equator
    };
  };

  // Helper function to group markers by location
  const groupMarkersByLocation = (
    orders: MapSectionProps["availableOrders"]
  ) => {
    const groups = new Map<string, Array<typeof orders[0]>>();

    orders.forEach((order) => {
      if (!order.shopLatitude || !order.shopLongitude) return;

      // Create a key with reduced precision to group nearby points
      const key = `${order.shopLatitude.toFixed(
        4
      )},${order.shopLongitude.toFixed(4)}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(order);
    });

    return groups;
  };

  // Helper function to create consistent marker icon
  const createOrderMarkerIcon = (earnings: string) => {
    const simplifiedEarnings = formatEarningsDisplay(earnings);
    return L.divIcon({
      html: `
        <div style="
          background: ${theme === "dark" ? "#065f46" : "#10b981"};
          border: 2px solid ${theme === "dark" ? "#047857" : "#059669"};
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 4px ${
            theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)"
          };
          z-index: 1000;
        ">
          ${simplifiedEarnings}
        </div>`,
      className: "",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };

  // Helper function to create shop marker icon
  const createShopMarkerIcon = (isActive: boolean) => {
    return L.divIcon({
      html: `
        <div style="
          background: ${
            theme === "dark"
              ? "rgba(31, 41, 55, 0.95)"
              : "rgba(255, 255, 255, 0.95)"
          };
          border: 2px solid ${theme === "dark" ? "#374151" : "#d1d5db"};
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px ${
            theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)"
          };
          backdrop-filter: blur(8px);
        ">
          <img 
            src="https://static-00.iconduck.com/assets.00/shop-icon-2048x1878-qov4lrv1.png" 
            style="
              width: 24px; 
              height: 24px; 
              filter: ${isActive ? "none" : "grayscale(100%)"};
              opacity: ${isActive ? "1" : "0.6"};
            "
          />
        </div>
      `,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  // First popup template for pending orders
  const createPopupContent = (order: PendingOrder, theme: string) => `
    <div class="${
      theme === "dark" ? "dark-theme-popup" : "light-theme-popup"
    }" style="
      font-size: 14px;
      line-height: 1.6;
      min-width: 240px;
      background: ${theme === "dark" ? "#1f2937" : "#ffffff"};
      color: ${theme === "dark" ? "#e5e7eb" : "#111827"};
      border-radius: 8px;
      padding: 12px;
    ">
      <div style="
        border-bottom: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        padding-bottom: 8px;
        margin-bottom: 8px;
      ">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 16px;">🆔</span>
          <strong style="color: ${theme === "dark" ? "#60a5fa" : "#2563eb"};">${
    order.id
  }</strong>
            </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 16px;">💰</span>
          <strong style="color: ${
            theme === "dark" ? "#34d399" : "#059669"
          };">${formatCurrency(order.earnings)}</strong>
            </div>
            </div>
      
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🏪</span>
          <span style="flex: 1;">${order.shopName}</span>
            </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">📍</span>
          <span style="flex: 1;">${order.shopAddress}</span>
            </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">⏱️</span>
          <span style="flex: 1;">${order.createdAt}</span>
            </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🛒</span>
          <span style="flex: 1;">Items: ${order.itemsCount}</span>
            </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🚚</span>
          <span style="flex: 1;">Deliver to: ${order.addressStreet}, ${
    order.addressCity
  }</span>
            </div>
      </div>

      <button 
        id="accept-batch-${order.id}" 
        style="
          width: 100%;
          margin-top: 12px;
          padding: 8px 16px;
          background: ${theme === "dark" ? "#059669" : "#10b981"};
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.background='${
          theme === "dark" ? "#047857" : "#059669"
        }'"
        onmouseout="this.style.background='${
          theme === "dark" ? "#059669" : "#10b981"
        }'"
      >
              Accept Batch
            </button>
          </div>
        `;

  // Second popup template for available orders
  const createAvailableOrderPopupContent = (
    order: MapSectionProps["availableOrders"][0],
    theme: string
  ) => `
    <div class="${
      theme === "dark" ? "dark-theme-popup" : "light-theme-popup"
    }" style="
      font-size: 14px;
      line-height: 1.6;
      min-width: 240px;
      background: ${theme === "dark" ? "#1f2937" : "#ffffff"};
      color: ${theme === "dark" ? "#e5e7eb" : "#111827"};
      border-radius: 8px;
      padding: 12px;
    ">
      <div style="
        border-bottom: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        padding-bottom: 8px;
        margin-bottom: 8px;
      ">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 16px;">🆔</span>
          <strong style="color: ${theme === "dark" ? "#60a5fa" : "#2563eb"};">${
    order.id
  }</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 16px;">💰</span>
          <strong style="color: ${theme === "dark" ? "#34d399" : "#059669"};">${
    order.estimatedEarnings
  }</strong>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🏪</span>
          <span style="flex: 1;">${order.shopName}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">📍</span>
          <span style="flex: 1;">${order.shopAddress}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">⏱️</span>
          <span style="flex: 1;">${order.createdAt}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🚚</span>
          <span style="flex: 1;">Deliver to: ${order.customerAddress}</span>
        </div>
      </div>

      <button 
        id="accept-batch-${order.id}" 
        style="
          width: 100%;
          margin-top: 12px;
          padding: 8px 16px;
          background: ${theme === "dark" ? "#059669" : "#10b981"};
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.background='${
          theme === "dark" ? "#047857" : "#059669"
        }'"
        onmouseout="this.style.background='${
          theme === "dark" ? "#059669" : "#10b981"
        }'"
      >
        Accept Batch
      </button>
    </div>
  `;

  // Helper function to render a pending order marker
  const renderPendingOrderMarker = (order: PendingOrder, map: L.Map) => {
    try {
      const lat = order.shopLat;
      const lng = order.shopLng;

      const marker = L.marker([lat, lng], {
        icon: createOrderMarkerIcon(formatCurrency(order.earnings)),
        zIndexOffset: 1000,
      });

      if (safeAddMarker(marker, map, `pending order ${order.id}`)) {
        marker.bindPopup(createPopupContent(order, theme), {
          maxWidth: 300,
          className: `${
            theme === "dark" ? "dark-theme-popup" : "light-theme-popup"
          }`,
          closeButton: true,
          closeOnClick: false,
        });
        attachAcceptHandler(marker, order.id, map);
      }
    } catch (error) {
      console.error(
        `Error rendering pending order marker for ${order.id}:`,
        error
      );
    }
  };

  // Add getCurrentPosition function
  const getCurrentPosition = async () => {
    setIsRefreshingLocation(true);
    try {
      const position = await getSingleLocation();
      const { latitude, longitude } = position.coords;

      // Save to cookies
      saveLocationToCookies(latitude, longitude);

      // Update marker position and recenter map
      if (userMarkerRef.current && mapInstanceRef.current) {
        userMarkerRef.current.setLatLng([latitude, longitude]);
        userMarkerRef.current.addTo(mapInstanceRef.current);
        mapInstanceRef.current.setView([latitude, longitude], 16);
      }

      setIsOnline(true);
      locationErrorCountRef.current = 0;
    } catch (error) {
      console.error("Error getting current position:", error);
      locationErrorCountRef.current += 1;

      if (locationErrorCountRef.current >= 3) {
        showLocationTroubleshootingGuide();
      }

      reduceToastDuplicates(
        "location-error",
        <Message
          showIcon
          type="error"
          header="Location Error"
          className={theme === "dark" ? "rs-message-dark" : ""}
        >
          Could not get your location. Please check your settings.
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  // Add refreshLocation function
  const refreshLocation = async () => {
    if (isRefreshingLocation) return;
    await getCurrentPosition();
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
              className={theme === "dark" ? "rs-message-dark" : ""}
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
                    className={theme === "dark" ? "rs-btn-dark" : ""}
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
                        <Message
                          showIcon
                          type="info"
                          header="Static Location"
                          className={theme === "dark" ? "rs-message-dark" : ""}
                        >
                          Using static location. Use the refresh button to
                          update.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    }}
                    className={theme === "dark" ? "rs-btn-dark" : ""}
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
          void getCurrentPosition();
        }
      } else {
        // No cookies, get current position
        void getCurrentPosition();
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
      } else {
        console.warn("Map not ready for resetting view");
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
    // Listen for dashboard toggle event
    const onToggle = () => handleGoLive();
    window.addEventListener("toggleGoLive", onToggle);
    return () => window.removeEventListener("toggleGoLive", onToggle);
  }, [handleGoLive]);

  // Main map initialization effect
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    let mapInstance: L.Map | null = null;

    // Wait for next frame to ensure DOM is ready
    const timer = requestAnimationFrame(() => {
      try {
        // Cleanup existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Create new map instance with type assertion and null check
        if (mapRef.current) {
          mapInstance = L.map(mapRef.current as HTMLElement, {
            center: [-1.9706, 30.1044],
            zoom: 14,
            minZoom: 3,
            maxZoom: 19,
            scrollWheelZoom: true,
            attributionControl: false,
          });

          // Store map instance
          mapInstanceRef.current = mapInstance;

          // Add initial tile layer without attribution
          L.tileLayer(mapStyles[theme], {
            maxZoom: 19,
            minZoom: 3,
            attribution: "",
          }).addTo(mapInstance);
        }

        // Initialize user marker with improved dark theme styling
        const userIconHtml = `
      <div style="
            background: ${theme === "dark" ? "#1f2937" : "white"};
            border: 2px solid ${theme === "dark" ? "#60a5fa" : "#3b82f6"};
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
            box-shadow: 0 2px 4px ${
              theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"
            };
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

        userMarkerRef.current = L.marker([-1.9706, 30.1044], {
          icon: userIcon,
        });

        // Check for saved location in cookies
        const cookieMap = getCookies();
        if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
          const lat = parseFloat(cookieMap["user_latitude"]);
          const lng = parseFloat(cookieMap["user_longitude"]);

          if (!isNaN(lat) && !isNaN(lng)) {
            if (userMarkerRef.current && mapInstance) {
              userMarkerRef.current.setLatLng([lat, lng]);
              if (isOnline) {
                userMarkerRef.current.addTo(mapInstance);
                mapInstance.setView([lat, lng], 16);
              }
            }
          }
        }

        // Wait for next frame before initializing markers
        requestAnimationFrame(() => {
          if (mapInstance && mapInstance.getContainer()) {
            initMapSequence(mapInstance);
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    });

    // Cleanup function
    return () => {
      cancelAnimationFrame(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, theme]);

  // Function to initialize map sequence
  const initMapSequence = async (map: L.Map) => {
    if (!map || !map.getContainer()) return;

    try {
      // Load all data in parallel
      const [shopsResponse, pendingOrdersResponse] = await Promise.all([
        fetch("/api/shopper/shops"),
        isOnline
          ? fetch("/api/shopper/pendingOrders")
          : Promise.resolve({ json: () => [] }),
      ]);

      const [shops, pendingOrders] = await Promise.all([
        shopsResponse.json() as Promise<Shop[]>,
        pendingOrdersResponse.json() as Promise<PendingOrder[]>,
      ]);

      // Process shops
      setShops(shops);
      if (map && map.getContainer()) {
        shops.forEach((shop: Shop) => {
          try {
            const lat = parseFloat(shop.latitude);
            const lng = parseFloat(shop.longitude);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Invalid coordinates for shop ${shop.name}`);
              return;
            }

            if (map && map.getContainer()) {
              const marker = L.marker([lat, lng], {
                icon: createShopMarkerIcon(shop.is_active),
                zIndexOffset: 500,
              });

              if (safeAddMarker(marker, map, `shop ${shop.name}`)) {
                marker.bindPopup(
                  `<div style="
                    background: ${theme === "dark" ? "#1f2937" : "#fff"}; 
                    color: ${theme === "dark" ? "#e5e7eb" : "#111827"};
                      padding: 8px;
                      border-radius: 8px;
                      min-width: 150px;
                      text-align: center;
                    ">
                      <strong>${shop.name}</strong>
                    ${
                      !shop.is_active
                        ? '<br><span style="color: #ef4444;">(Disabled)</span>'
                        : ""
                    }
                    </div>`,
                  { offset: [0, -10] }
                );
              }
            }
          } catch (error) {
            console.error(`Error adding shop marker for ${shop.name}:`, error);
          }
        });
      }

      // Process pending orders with grouping
      if (isOnline && map && map.getContainer()) {
        // Group pending orders by location
        const groupedPendingOrders = new Map<string, PendingOrder[]>();
        pendingOrders.forEach((order) => {
          if (!order.shopLat || !order.shopLng) return;
          const key = `${order.shopLat.toFixed(5)},${order.shopLng.toFixed(5)}`;
          if (!groupedPendingOrders.has(key)) {
            groupedPendingOrders.set(key, []);
          }
          groupedPendingOrders.get(key)?.push(order);
        });

        // Log grouped orders information
        logger.info("Pending orders grouped by location", "MapSection", {
          totalOrders: pendingOrders.length,
          groupCount: groupedPendingOrders.size,
          groupSizes: Array.from(groupedPendingOrders.entries()).map(
            ([key, orders]) => ({
              location: key,
              orderCount: orders.length,
              orderIds: orders.map((o) => o.id),
            })
          ),
        });

        // Process each group of orders
        groupedPendingOrders.forEach((orders, locationKey) => {
          const [baseLat, baseLng] = locationKey.split(",").map(Number);

          orders.forEach((order, index) => {
            try {
              // Calculate offset based on position in group
              const offset = calculateMarkerOffset(index, orders.length);
              const adjustedLat = baseLat + offset.lat;
              const adjustedLng = baseLng + offset.lng;

              const marker = L.marker([adjustedLat, adjustedLng], {
                icon: createOrderMarkerIcon(formatCurrency(order.earnings)),
                zIndexOffset: 1000 + index,
              });

              if (safeAddMarker(marker, map, `pending order ${order.id}`)) {
                marker.bindPopup(createPopupContent(order, theme), {
                  maxWidth: 300,
                  className: `${
                    theme === "dark" ? "dark-theme-popup" : "light-theme-popup"
                  }`,
                  closeButton: true,
                  closeOnClick: false,
                });
                attachAcceptHandler(marker, order.id, map);
              }
            } catch (error) {
              logger.error(
                "Error rendering pending order marker",
                "MapSection",
                {
                  orderId: order.id,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                  location: locationKey,
                  groupSize: orders.length,
                  indexInGroup: index,
                }
              );
            }
          });
        });
      }

      // Process available orders with grouping
      if (
        isOnline &&
        availableOrders?.length > 0 &&
        map &&
        map.getContainer()
      ) {
        // Group available orders by location
        const groupedAvailableOrders = new Map<
          string,
          typeof availableOrders
        >();
        availableOrders.forEach((order) => {
          if (!order.shopLatitude || !order.shopLongitude) return;
          const key = `${order.shopLatitude.toFixed(
            5
          )},${order.shopLongitude.toFixed(5)}`;
          if (!groupedAvailableOrders.has(key)) {
            groupedAvailableOrders.set(key, []);
          }
          groupedAvailableOrders.get(key)?.push(order);
        });

        // Log grouped orders information
        logger.info("Available orders grouped by location", "MapSection", {
          totalOrders: availableOrders.length,
          groupCount: groupedAvailableOrders.size,
          groupSizes: Array.from(groupedAvailableOrders.entries()).map(
            ([key, orders]) => ({
              location: key,
              orderCount: orders.length,
              orderIds: orders.map((o) => o.id),
            })
          ),
        });

        // Process each group of orders
        groupedAvailableOrders.forEach((orders, locationKey) => {
          const [baseLat, baseLng] = locationKey.split(",").map(Number);

          orders.forEach((order, index) => {
            try {
              // Calculate offset based on position in group
              const offset = calculateMarkerOffset(index, orders.length);
              const adjustedLat = baseLat + offset.lat;
              const adjustedLng = baseLng + offset.lng;

              const marker = L.marker([adjustedLat, adjustedLng], {
                icon: createOrderMarkerIcon(order.estimatedEarnings),
                zIndexOffset: 1000 + index,
              });

              if (safeAddMarker(marker, map, `order ${order.id}`)) {
                marker.bindPopup(
                  createAvailableOrderPopupContent(order, theme),
                  {
                    maxWidth: 300,
                    className: `${
                      theme === "dark"
                        ? "dark-theme-popup"
                        : "light-theme-popup"
                    }`,
                    closeButton: true,
                    closeOnClick: false,
                  }
                );
                attachAcceptHandler(marker, order.id, map);
                orderMarkersRef.current.push(marker);
              }
            } catch (error) {
              logger.error(
                "Error rendering available order marker",
                "MapSection",
                {
                  orderId: order.id,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                  location: locationKey,
                  groupSize: orders.length,
                  indexInGroup: index,
                }
              );
            }
          });
        });
      }
    } catch (error) {
      console.error("Error in map sequence:", error);
    }
  };

  // Update useEffect to fetch today's completed earnings
  useEffect(() => {
    const fetchTodayCompletedEarnings = async () => {
      setLoadingEarnings(true);
      try {
        const response = await fetch("/api/shopper/todayCompletedEarnings");
        if (!response.ok) {
          throw new Error("Failed to fetch earnings data");
        }

        const data = await response.json();
        if (data && data.success && data.data) {
          setDailyEarnings(data.data.totalEarnings);
          setCompletedOrdersCount(data.data.orderCount);
        } else {
          console.warn("Earnings data incomplete or invalid:", data);
          setDailyEarnings(0);
          setCompletedOrdersCount(0);
        }
      } catch (error) {
        console.error("Error fetching daily earnings:", error);
        setDailyEarnings(0);
        setCompletedOrdersCount(0);
      } finally {
        setLoadingEarnings(false);
      }
    };

    fetchTodayCompletedEarnings();
    // Refresh earnings every 5 minutes
    const interval = setInterval(fetchTodayCompletedEarnings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to clear order markers
  const clearOrderMarkers = () => {
    orderMarkersRef.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    orderMarkersRef.current = [];
  };

  // Helper function to clear shop markers
  const clearShopMarkers = () => {
    shopMarkersRef.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    shopMarkersRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOrderMarkers();
      clearShopMarkers();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
    };
  }, []);

  // If the dashboard is initializing, show a simpler loading state
  if (isInitializing) {
    return (
      <div className="relative w-full">
        <div
          ref={mapRef}
          className={`h-[calc(100vh-4rem-5.5rem)] overflow-hidden rounded-lg md:h-[600px] ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-100"
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <Loader size="lg" content="Initializing..." />
        </div>
      </div>
    );
  }

  // Show map loading state when map is not ready but dashboard is initialized
  if (!mapLoaded) {
    return (
      <div
        className={`flex h-[300px] w-full items-center justify-center md:h-[400px] ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <Loader
          size="lg"
          content="Loading map..."
          className={theme === "dark" ? "rs-loader-dark" : ""}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Daily Earnings Badge */}
      {!isExpanded && (
        <div
          className={`absolute left-1/2 top-4 z-[1001] -translate-x-1/2 transform rounded-full px-4 py-2 shadow-lg ${
            theme === "dark"
              ? "bg-gray-800 bg-opacity-90 text-white backdrop-blur-lg"
              : "bg-white bg-opacity-90 text-gray-900 backdrop-blur-lg"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-5 w-5 ${
                theme === "dark" ? "text-green-400" : "text-green-500"
              }`}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Today&apos;s earnings
                </span>
                {loadingEarnings ? (
                  <div
                    className={`h-4 w-6 animate-pulse rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                ) : (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      theme === "dark"
                        ? "bg-green-900/30 text-green-300"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {completedOrdersCount}
                  </span>
                )}
              </div>
              {loadingEarnings ? (
                <div
                  className={`h-6 w-20 animate-pulse rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
              ) : (
                <span
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    maximumFractionDigits: 0,
                  }).format(dailyEarnings)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className={`h-[calc(100vh-4rem-5.5rem)] overflow-hidden rounded-lg md:h-[600px] ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      />
      {!mapLoaded && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            theme === "dark" ? "bg-gray-900/90" : "bg-gray-100/90"
          }`}
        >
          <Loader
            size="lg"
            content="Loading map..."
            className={theme === "dark" ? "rs-loader-dark" : ""}
          />
        </div>
      )}

      {mapLoaded && (
        <>
          <button
            onClick={handleGoLive}
            className={`absolute bottom-5 left-1/2 z-[1000] hidden w-[90%] -translate-x-1/2 transform rounded-full py-2 font-bold shadow-lg backdrop-blur-lg md:block md:w-auto md:px-4 ${
              isOnline
                ? theme === "dark"
                  ? "bg-red-600/90 text-white hover:bg-red-700"
                  : "bg-red-500/90 text-white hover:bg-red-600"
                : theme === "dark"
                ? "bg-green-600/90 text-white hover:bg-green-700"
                : "bg-green-500/90 text-white hover:bg-green-600"
            }`}
          >
            {isOnline ? "Go Offline" : "Start Plas"}
          </button>

          {/* Add tracking mode indicator */}
          {isOnline && (
            <div
              className={`absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 transform rounded-full px-3 py-1 text-sm font-semibold shadow-md backdrop-blur-lg ${
                theme === "dark"
                  ? "bg-gray-800/90 text-gray-100"
                  : "bg-white/90 text-gray-900"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`mr-2 inline-block h-3 w-3 rounded-full ${
                    isActivelyTracking
                      ? theme === "dark"
                        ? "animate-pulse bg-green-400"
                        : "animate-pulse bg-green-500"
                      : theme === "dark"
                      ? "bg-blue-400"
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
                          className={theme === "dark" ? "rs-message-dark" : ""}
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
                          className={theme === "dark" ? "rs-message-dark" : ""}
                        >
                          Your location will update automatically as you move.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    }
                  }}
                  className={`ml-3 text-xs ${
                    theme === "dark"
                      ? "text-blue-400 hover:text-blue-300 hover:underline"
                      : "text-blue-600 hover:text-blue-800 hover:underline"
                  }`}
                >
                  {isActivelyTracking ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          )}

          {/* Add refresh location button - visible on both mobile and desktop */}
          {isOnline && !isExpanded && (
            <button
              onClick={refreshLocation}
              disabled={isRefreshingLocation}
              className={`absolute bottom-24 right-5 z-[1001] h-12 w-12 rounded-full p-3 shadow-lg backdrop-blur-lg md:bottom-5 md:h-10 md:w-10 md:p-2 ${
                theme === "dark"
                  ? isRefreshingLocation
                    ? "bg-blue-700/90 text-gray-300"
                    : "bg-blue-600/90 text-white hover:bg-blue-700"
                  : isRefreshingLocation
                  ? "bg-blue-300/90 text-white"
                  : "bg-blue-500/90 text-white hover:bg-blue-600"
              }`}
              title="Refresh location"
            >
              {isRefreshingLocation ? (
                <span
                  className={`inline-block h-full w-full animate-spin rounded-full border-2 ${
                    theme === "dark"
                      ? "border-gray-300 border-t-transparent"
                      : "border-white border-t-transparent"
                  }`}
                ></span>
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
