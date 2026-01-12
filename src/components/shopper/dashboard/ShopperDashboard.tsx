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
import NotificationSystem from "../NotificationSystem";

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
      setAvailableOrders([]);
      setSortedOrders([]);
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
    const timer = setTimeout(() => setMapLoaded(true), 1500);
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
        (err) => console.error("Error fetching location:", err),
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
    if (currentLocation || mapLoaded) {
      setIsInitializing(false);
    }
  }, [currentLocation, mapLoaded]);

  // Handle new order notification
  const handleNewOrder = useCallback(() => {
    loadOrders();
    setLastRefreshed(new Date());
  }, [loadOrders]);

  // WebSocket event listeners for seamless background updates
  useEffect(() => {
    const handleWebSocketNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { order } = customEvent.detail;

      // Add new order to the list seamlessly (no age filtering)
      setAvailableOrders((prev) => {
        const exists = prev.some(
          (existingOrder) => existingOrder.id === order.id
        );
        if (!exists) {
          const orderCreatedAt = new Date(order.createdAt);
          const newOrder = {
              id: order.id,
              shopName: order.shopName || "Unknown Shop",
              shopAddress: order.shopAddress || "No address available",
              customerAddress: order.customerAddress || "No address available",
              distance: `${order.distance} km`,
              items: order.itemsCount || 0,
              total: (order.earnings || 0).toString(),
              estimatedEarnings: (order.earnings || 0).toString(),
              createdAt: relativeTime(order.createdAt),
              status: order.status || "PENDING",
              rawDistance:
                typeof order.distance === "number"
                  ? order.distance
                  : parseFloat(order.distance) || 0,
              rawEarnings:
                typeof order.earnings === "number"
                  ? order.earnings
                  : parseFloat(order.earnings) || 0,
              rawCreatedAt: orderCreatedAt.getTime(),
              minutesAgo: Math.floor(
                (Date.now() - orderCreatedAt.getTime()) / 60000
              ),
              priorityLevel: order.priorityLevel || 1,
              shopLatitude: order.shopLatitude,
              shopLongitude: order.shopLongitude,
              customerLatitude: order.customerLatitude,
              customerLongitude: order.customerLongitude,
              travelTimeMinutes: order.travelTimeMinutes,
              orderType: order.orderType || "regular",
              reel: order.reel,
              quantity: order.quantity,
              deliveryNote: order.deliveryNote,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
            };
            return [newOrder, ...prev];
          }
          return prev;
        });

        // Update sorted orders
        setSortedOrders((prev) => {
          const exists = prev.some(
            (existingOrder) => existingOrder.id === order.id
          );
          if (!exists) {
            const orderCreatedAt = new Date(order.createdAt);
            const newOrder = {
              id: order.id,
              shopName: order.shopName || "Unknown Shop",
              shopAddress: order.shopAddress || "No address available",
              customerAddress: order.customerAddress || "No address available",
              distance: `${order.distance} km`,
              items: order.itemsCount || 0,
              total: (order.earnings || 0).toString(),
              estimatedEarnings: (order.earnings || 0).toString(),
              createdAt: relativeTime(order.createdAt),
              status: order.status || "PENDING",
              rawDistance:
                typeof order.distance === "number"
                  ? order.distance
                  : parseFloat(order.distance) || 0,
              rawEarnings:
                typeof order.earnings === "number"
                  ? order.earnings
                  : parseFloat(order.earnings) || 0,
              rawCreatedAt: orderCreatedAt.getTime(),
              minutesAgo: Math.floor(
                (Date.now() - orderCreatedAt.getTime()) / 60000
              ),
              priorityLevel: order.priorityLevel || 1,
              shopLatitude: order.shopLatitude,
              shopLongitude: order.shopLongitude,
              customerLatitude: order.customerLatitude,
              customerLongitude: order.customerLongitude,
              travelTimeMinutes: order.travelTimeMinutes,
              orderType: order.orderType || "regular",
              reel: order.reel,
              quantity: order.quantity,
              deliveryNote: order.deliveryNote,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
            };
            return sortOrders([newOrder, ...prev], sortBy);
          }
          return prev;
        });
    };

    const handleWebSocketOrderExpired = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { orderId } = customEvent.detail;

      // Remove order from both lists seamlessly
      setAvailableOrders((prev) =>
        prev.filter((order) => order.id !== orderId)
      );
      setSortedOrders((prev) => prev.filter((order) => order.id !== orderId));
    };

    window.addEventListener("websocket-new-order", handleWebSocketNewOrder);
    window.addEventListener(
      "websocket-order-expired",
      handleWebSocketOrderExpired
    );

    return () => {
      window.removeEventListener(
        "websocket-new-order",
        handleWebSocketNewOrder
      );
      window.removeEventListener(
        "websocket-order-expired",
        handleWebSocketOrderExpired
      );
    };
  }, [sortBy, sortOrders]);

  // Initializing loading screen
  if (isInitializing) {
    return (
      <ShopperLayout>
        <div className="flex h-screen w-full flex-col bg-gray-50 pt-6">
          {/* Skeleton Map */}
          <div className="px-4">
            <Placeholder.Graph
              active
              height={300}
              className="w-full rounded-md"
            />
          </div>

          {/* Skeleton Header */}
          <div className="px-6 pt-6">
            <Grid fluid>
              <Row>
                <Col xs={12}>
                  <Placeholder.Paragraph rows={1} graph="circle" active />
                </Col>
                <Col xs={12}>
                  <div className="flex justify-end">
                    <Placeholder.Graph active width={150} height={32} />
                  </div>
                </Col>
              </Row>
            </Grid>
          </div>

          {/* Skeleton Sort Buttons */}
          <div className="px-6 pb-4 pt-3">
            <Grid fluid>
              <Row>
                <Col xs={24}>
                  <div className="flex space-x-2">
                    <Placeholder.Graph active width={80} height={28} />
                    <Placeholder.Graph active width={80} height={28} />
                    <Placeholder.Graph active width={80} height={28} />
                    <Placeholder.Graph active width={80} height={28} />
                  </div>
                </Col>
              </Row>
            </Grid>
          </div>

          {/* Skeleton Orders */}
          <div className="px-6 pt-2">
            <Grid fluid>
              <Row className="gap-4">
                <Col xs={24} md={12} lg={8}>
                  <Panel bordered className="h-[180px]">
                    <Placeholder.Paragraph rows={3} active />
                    <div className="mt-4 flex justify-between">
                      <Placeholder.Graph active width={70} height={24} />
                      <Placeholder.Graph active width={120} height={24} />
                    </div>
                  </Panel>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Panel bordered className="h-[180px]">
                    <Placeholder.Paragraph rows={3} active />
                    <div className="mt-4 flex justify-between">
                      <Placeholder.Graph active width={70} height={24} />
                      <Placeholder.Graph active width={120} height={24} />
                    </div>
                  </Panel>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Panel bordered className="h-[180px]">
                    <Placeholder.Paragraph rows={3} active />
                    <div className="mt-4 flex justify-between">
                      <Placeholder.Graph active width={70} height={24} />
                      <Placeholder.Graph active width={120} height={24} />
                    </div>
                  </Panel>
                </Col>
              </Row>
            </Grid>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div
        className={`${
          isMobile ? "relative h-full overflow-hidden" : "min-h-screen"
        } ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Map Section */}
        <div className="w-full">
          <MapSection
            mapLoaded={mapLoaded}
            availableOrders={availableOrders}
            isInitializing={isInitializing}
            isExpanded={isMobile && isExpanded}
            notifiedOrder={notifiedOrder}
            shopperLocation={currentLocation}
          />
        </div>

        {/* Notification System - Overlays on Map */}
        <NotificationSystem
          currentLocation={currentLocation}
          onNewOrder={handleNewOrder}
          onAcceptBatch={(orderId) => {
            // Refresh orders after accepting
            loadOrders();
          }}
          onNotificationShow={(order) => {
            // Update notified order to show route on map
            setNotifiedOrder(order);
          }}
        />

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
