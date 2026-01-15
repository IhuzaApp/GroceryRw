"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import OrderCard from "./OrderCard";
import dynamic from "next/dynamic";
import { Button, Loader, Placeholder, Panel, Grid, Row, Col } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/router";
import { useFCMNotifications } from "../../../hooks/useFCMNotifications";
import TodayCompletedOrders from "./TodayCompletedOrders";

// Dynamically load MapSection only on client (disable SSR)
const MapSection = dynamic(() => import("./MapSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full px-4">
      <Placeholder.Graph active height={300} className="w-full rounded-md" />
    </div>
  ),
});

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

// Compute relative time from ISO string
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins >= 60
    ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`
    : `${diffMins} mins ago`;
}

// Define a type for the order objects after formatting
interface FormattedOrder {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  distance: string;
  items: number;
  total: string;
  estimatedEarnings: string;
  createdAt: string;
  rawDistance: number;
  rawEarnings: number;
  rawCreatedAt: number;
  minutesAgo: number;
  priorityLevel: number;
  // Add travel time
  travelTimeMinutes?: number;
  // Keep coordinates for map
  shopLatitude?: number;
  shopLongitude?: number;
  customerLatitude?: number;
  customerLongitude?: number;
  // Add order type and reel-specific fields
  orderType: "regular" | "reel" | "restaurant";
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

export default function ShopperDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isInitialized } = useFCMNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "earnings" | "distance" | "priority"
  >("priority");
  const [showHistorical, setShowHistorical] = useState(false);
  const [sortedOrders, setSortedOrders] = useState<any[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(true);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [notifiedOrder, setNotifiedOrder] = useState<any>(null);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  // Memoize the checkLocationCookies function
  const checkLocationCookies = useCallback(() => {
    const cookies = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    return Boolean(cookies["user_latitude"] && cookies["user_longitude"]);
  }, []);

  // Memoize the updateOnlineStatus function
  const updateOnlineStatus = useCallback(() => {
    const hasLocationCookies = checkLocationCookies();
    setIsOnline(hasLocationCookies);
  }, [checkLocationCookies]);

  // Memoize the loadOrders function
  const loadOrders = useCallback(async () => {
    if (!currentLocation || !isOnline) {
      // Cannot load orders: no location or user offline
      console.log("🗺️ [ShopperDashboard] loadOrders: Skipping (offline or no location)", {
        hasLocation: !!currentLocation,
        isOnline,
      });
      setAvailableOrders([]);
      setSortedOrders([]);
      setIsLoading(false); // Ensure loading state is cleared when offline
      return;
    }

    setIsLoading(true);

    try {
      const safeLocation = {
        lat:
          typeof currentLocation.lat === "string"
            ? parseFloat(currentLocation.lat)
            : currentLocation.lat,
        lng:
          typeof currentLocation.lng === "string"
            ? parseFloat(currentLocation.lng)
            : currentLocation.lng,
      };

      const timestamp = new Date().getTime();
      const url = `/api/shopper/availableOrders?_=${timestamp}&latitude=${safeLocation.lat}&longitude=${safeLocation.lng}&maxTravelTime=15`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const formattedOrders = data
        .map((order: any) => {
          try {
            const createdAtDate = new Date(order.createdAt);
            const minutesAgo = Math.floor(
              (Date.now() - createdAtDate.getTime()) / 60000
            );

            // Handle both regular and reel orders
            const isReelOrder = order.orderType === "reel";
            const isRestaurantOrder = order.orderType === "restaurant";

            return {
              id: order.id,
              shopName: order.shopName || "Unknown Shop",
              shopAddress: order.shopAddress || "No address available",
              customerAddress: order.customerAddress || "No address available",
              distance: `${order.distance} km`,
              items: order.itemsCount || 0,
              total: (order.earnings || 0).toString(),
              estimatedEarnings: (order.earnings || 0).toString(),
              createdAt: relativeTime(order.createdAt),
              rawCreatedAt: order.createdAt, // Keep raw ISO timestamp for filtering
              updatedAt: order.updatedAt || null, // Pass through updatedAt for restaurant orders
              status: order.status || "PENDING",
              rawDistance: order.distance || 0,
              rawEarnings: order.earnings || 0,
              rawCreatedAtTimestamp: createdAtDate.getTime(),
              minutesAgo: minutesAgo,
              priorityLevel: order.priorityLevel || 1,
              shopLatitude: order.shopLatitude,
              shopLongitude: order.shopLongitude,
              customerLatitude: order.customerLatitude,
              customerLongitude: order.customerLongitude,
              travelTimeMinutes: order.travelTimeMinutes,
              orderType: order.orderType || "regular",
              // Reel-specific fields
              reel: order.reel,
              quantity: order.quantity,
              deliveryNote: order.deliveryNote,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
            };
          } catch (err) {
            console.error(`Error formatting order ${order.id}:`, err);
            return null;
          }
        })
        .filter(Boolean);

      setAvailableOrders(formattedOrders);
      const sorted = sortOrders(formattedOrders, sortBy);
      setSortedOrders(sorted);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching available orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, isOnline, sortBy]);

  // Memoize the sortOrders function
  const sortOrders = useCallback(
    (
      orders: FormattedOrder[],
      criteria: "newest" | "earnings" | "distance" | "priority"
    ) => {
      let sorted = [...orders];

      switch (criteria) {
        case "newest":
          // Sort by creation time (oldest first)
          sorted.sort((a, b) => a.rawCreatedAt - b.rawCreatedAt);
          break;
        case "earnings":
          sorted.sort((a, b) => b.rawEarnings - a.rawEarnings);
          break;
        case "distance":
          sorted.sort((a, b) => a.rawDistance - b.rawDistance);
          break;
        case "priority":
          sorted.sort((a, b) => {
            if (a.priorityLevel !== b.priorityLevel) {
              return b.priorityLevel - a.priorityLevel;
            }
            // For same priority, sort by age (oldest first)
            return a.minutesAgo - b.minutesAgo;
          });
          break;
      }

      return sorted;
    },
    []
  );

  // Handle sort change with useCallback
  const handleSortChange = useCallback(
    (newSortBy: "newest" | "earnings" | "distance" | "priority") => {
      setSortBy(newSortBy);
      const sorted = sortOrders(availableOrders, newSortBy);
      setSortedOrders(sorted);
    },
    [availableOrders, sortOrders]
  );

  // Handle toggle for historical vs. current batches
  const toggleHistorical = useCallback(() => {
    setShowHistorical((prev) => !prev);
  }, []);

  // Add automatic refresh with polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isAutoRefreshing && currentLocation && isOnline) {
      // Use longer polling interval when FCM is active for background updates
      const pollingInterval = isInitialized ? 120000 : 30000; // 2 minutes with FCM, 30 seconds without
      intervalId = setInterval(loadOrders, pollingInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentLocation, isAutoRefreshing, isOnline, loadOrders, isInitialized]);

  // Add toggle for auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshing((prev) => !prev);
  }, []);

  // Effect to handle mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Effect to handle map loading simulation
  useEffect(() => {
    console.log("🗺️ [ShopperDashboard] Starting map loading simulation");
    const timer = setTimeout(() => {
      console.log("🗺️ [ShopperDashboard] Setting mapLoaded to true");
      setMapLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Effect to handle cookie changes and online status
  useEffect(() => {
    updateOnlineStatus();
    const handleCustomEvent = () => setTimeout(updateOnlineStatus, 300);
    window.addEventListener("toggleGoLive", handleCustomEvent);
    const intervalId = setInterval(updateOnlineStatus, 5000);

    return () => {
      window.removeEventListener("toggleGoLive", handleCustomEvent);
      clearInterval(intervalId);
    };
  }, [updateOnlineStatus]);

  // Effect to clear orders when user goes offline
  useEffect(() => {
    if (!isOnline) {
      setAvailableOrders([]);
      setSortedOrders([]);
    }
  }, [isOnline]);

  // Effect to handle location
  useEffect(() => {
    const cookies = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    if (cookies["user_latitude"] && cookies["user_longitude"]) {
      setCurrentLocation({
        lat: parseFloat(cookies["user_latitude"]),
        lng: parseFloat(cookies["user_longitude"]),
      });
      setIsOnline(true);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => {
          // Silently handle geolocation errors (timeout, permission denied, etc.)
          // This is expected when cookies aren't available and geolocation fails
          // Only log in development for debugging
          if (process.env.NODE_ENV === "development") {
            console.log("Geolocation unavailable or timed out (this is normal if location cookies aren't set):", err.message);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }, []);

  // Effect to handle initial data loading
  useEffect(() => {
    if (!isInitializing) {
      Promise.all([
        loadOrders(),
        fetch("/api/shopper/todayCompletedEarnings")
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.data) {
              setDailyEarnings(data.data.totalEarnings);
              setCompletedOrdersCount(data.data.orderCount);
            }
          })
          .catch((error) => {
            console.error("Error fetching daily earnings:", error);
            setDailyEarnings(0);
            setCompletedOrdersCount(0);
          }),
      ]).catch((error) => {
        console.error("Error loading initial data:", error);
      });
    }
  }, [isInitializing, loadOrders]);

  // Effect to handle initialization state
  useEffect(() => {
    console.log("🗺️ [ShopperDashboard] Checking initialization state:", {
      currentLocation,
      mapLoaded,
      isInitializing,
    });
    if (currentLocation || mapLoaded) {
      console.log("🗺️ [ShopperDashboard] Setting isInitializing to false");
      setIsInitializing(false);
    }
  }, [currentLocation, mapLoaded]);

  // Handle new order notification
  const handleNewOrder = useCallback(() => {
    loadOrders();
    setLastRefreshed(new Date());
  }, [loadOrders]);

  // Listen for notification events to update map
  useEffect(() => {
    const handleNotificationShown = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { order } = customEvent.detail;
      setNotifiedOrder(order);
    };

    const handleNotificationHidden = (event: Event) => {
      setNotifiedOrder(null);
    };

    window.addEventListener(
      "notification-order-shown",
      handleNotificationShown
    );
    window.addEventListener(
      "notification-order-hidden",
      handleNotificationHidden
    );

    return () => {
      window.removeEventListener(
        "notification-order-shown",
        handleNotificationShown
      );
      window.removeEventListener(
        "notification-order-hidden",
        handleNotificationHidden
      );
    };
  }, []);


  // Show skeleton loading when initializing or map not loaded
  // Don't show skeleton based on isLoading when map is loaded and initialized - map should show even without orders
  const showSkeleton = isInitializing || !mapLoaded;
  
  // Debug skeleton condition
  useEffect(() => {
    console.log("🗺️ [ShopperDashboard] Skeleton condition check:", {
      showSkeleton,
      isInitializing,
      mapLoaded,
      isLoading,
      availableOrdersLength: availableOrders.length,
      isOnline,
      reason: isInitializing ? "isInitializing" : !mapLoaded ? "!mapLoaded" : "none",
    });
  }, [showSkeleton, isInitializing, mapLoaded, isLoading, availableOrders.length, isOnline]);

  // Skeleton loading component
  const SkeletonLoader = () => (
    <ShopperLayout>
      <div
        className={`${
          isMobile ? "relative h-screen overflow-hidden" : "min-h-screen"
        } ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Skeleton Map - Full screen on mobile */}
        <div
          className={isMobile ? "fixed z-0" : "w-full"}
          style={isMobile ? {
            left: 0,
            right: 0,
            top: '3.5rem',
            width: '100vw',
            height: 'calc(100vh - 3.5rem)'
          } : {}}
        >
          <div
            className={`h-full w-full overflow-hidden rounded-none md:h-[600px] md:rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            {/* Map skeleton with animated shimmer */}
            <div className="relative h-full w-full overflow-hidden">
              {/* Animated background */}
              <div
                className={`absolute inset-0 ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                }`}
              />
              {/* Shimmer effect */}
              <div
                className={`absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent ${
                  theme === "dark" ? "via-white/5" : "via-gray-300/20"
                }`}
              />
              {/* Map controls skeleton */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                <div
                  className={`h-8 w-8 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
                <div
                  className={`h-8 w-8 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
              </div>
              {/* Earnings badge skeleton */}
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <div
                  className={`h-12 w-32 rounded-full ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
              </div>
              {/* Map style button skeleton */}
              <div className="absolute right-4 top-4 z-10">
                <div
                  className={`h-10 w-10 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton for Today's Completed Orders (mobile bottom sheet) */}
        {isMobile && (
          <div
            className={`fixed bottom-0 left-0 right-0 z-10 rounded-t-lg border-t ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
            style={{ height: '200px' }}
          >
            <div className="p-4">
              <div
                className={`mb-4 h-1 w-12 rounded-full ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                } mx-auto`}
              />
              <div className="space-y-3">
                <div
                  className={`h-4 w-24 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } animate-pulse`}
                />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-20 flex-1 rounded-lg ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopperLayout>
  );

  // Show skeleton while loading
  if (showSkeleton) {
    console.log("🗺️ [ShopperDashboard] Rendering SkeletonLoader - conditions:", {
      isInitializing,
      mapLoaded,
      isLoading,
      availableOrdersLength: availableOrders.length,
    });
    return <SkeletonLoader />;
  }
  
  console.log("🗺️ [ShopperDashboard] Rendering actual map component");

  return (
    <ShopperLayout>
      <div
        className={`${
          isMobile ? "relative h-screen overflow-hidden" : "min-h-screen"
        } ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Map Section */}
        <div 
          className={isMobile ? "fixed z-10" : "w-full"}
          style={isMobile ? { 
            left: 0,
            right: 0,
            top: '3.5rem',
            width: '100vw',
            height: 'calc(100vh - 3.5rem)',
            pointerEvents: 'auto'
          } : {
            pointerEvents: 'auto'
          }}
        >
          <MapSection
            mapLoaded={mapLoaded}
            availableOrders={availableOrders}
            isInitializing={isInitializing}
            isExpanded={isMobile && isExpanded}
            notifiedOrder={notifiedOrder}
            shopperLocation={currentLocation}
          />
        </div>

        {/* 
          NOTE: NotificationSystem is already rendered in ShopperLayout
          and works across all Plasa pages. We don't need a duplicate here.
          The ShopperLayout instance handles all notification logic.
        */}

        {/* Today's Completed Orders Section */}
        <TodayCompletedOrders
          isMobile={isMobile}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
        />
      </div>
    </ShopperLayout>
  );
}
