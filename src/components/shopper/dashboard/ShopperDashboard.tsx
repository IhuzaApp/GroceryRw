"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import OrderCard from "./OrderCard";
import dynamic from "next/dynamic";
import { Button, Loader, Placeholder, Panel, Grid, Row, Col } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/router";

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
  orderType: "regular" | "reel";
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
  >("newest");
  const [showHistorical, setShowHistorical] = useState(false);
  const [sortedOrders, setSortedOrders] = useState<any[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(true);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);

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

            return {
              id: order.id,
              shopName: order.shopName || "Unknown Shop",
              shopAddress: order.shopAddress || "No address available",
              customerAddress: order.customerAddress || "No address available",
              distance: `${order.distance} km`,
              items: order.itemsCount || 0,
              total: `$${(order.earnings || 0).toFixed(2)}`,
              estimatedEarnings: `$${(order.earnings || 0).toFixed(2)}`,
              createdAt: relativeTime(order.createdAt),
              status: order.status || "PENDING",
              rawDistance: order.distance || 0,
              rawEarnings: order.earnings || 0,
              rawCreatedAt: createdAtDate.getTime(),
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
          sorted.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt);
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
            return b.minutesAgo - a.minutesAgo;
          });
          break;
      }

      // Remove the 10-minute minimum filter to show all pending batches
      // The showHistorical toggle now controls sorting preference rather than filtering
      // All pending batches will be shown regardless of age

      return sorted;
    },
    [showHistorical]
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
      intervalId = setInterval(loadOrders, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentLocation, isAutoRefreshing, isOnline, loadOrders]);

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
          />
        </div>

        {/* Desktop Title and Sort - Hidden on Mobile */}
        {!isMobile && (
          <div className="px-2 pb-2 md:block">
            <div className="flex items-center justify-between px-4 pt-4">
              <h1 className="text-2xl font-bold">Available Batches</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-gray-100 p-1.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-3 w-3 text-gray-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {lastRefreshed &&
                      `Updated ${lastRefreshed.toLocaleTimeString()}`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleAutoRefresh}
                    className={`flex items-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      isAutoRefreshing
                        ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title={
                      isAutoRefreshing
                        ? "Auto-refresh is on (30s)"
                        : "Auto-refresh is off"
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="mr-1 h-3 w-3"
                    >
                      <path d="M1 4v6h6M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    {isAutoRefreshing ? "Auto" : "Manual"}
                  </button>

                  <button
                    onClick={toggleHistorical}
                    className={`flex items-center rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      showHistorical
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="mr-1 h-3 w-3"
                    >
                      <path d="M3 6h18M3 12h18M3 18h18" />
                    </svg>
                    {showHistorical ? "Priority Sort" : "Time Sort"}
                  </button>
                </div>

                <button
                  className="flex items-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:shadow-green-500/40 active:scale-95"
                  onClick={loadOrders}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mr-1.5 h-4 w-4"
                  >
                    <path d="M1 4v6h6M23 20v-6h-6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List Section - Hidden on Mobile */}
        {!isMobile && (
          <div className="px-2">
            <div className="mb-6 mt-4 flex items-center px-4">
              <div className="mr-4 flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="mr-2 h-4 w-4 text-gray-500"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                <span className="text-sm font-medium text-gray-500">
                  Sort by:
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSortChange("newest")}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    sortBy === "newest"
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Orders less than 1 hour old"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mr-1.5 h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Newest (1h)
                </button>
                <button
                  onClick={() => handleSortChange("earnings")}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    sortBy === "earnings"
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mr-1.5 h-4 w-4"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                  Earnings
                </button>
                <button
                  onClick={() => handleSortChange("distance")}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    sortBy === "distance"
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mr-1.5 h-4 w-4"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Distance
                </button>
                <button
                  onClick={() => handleSortChange("priority")}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    sortBy === "priority"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="All orders by priority level, including older orders"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mr-1.5 h-4 w-4"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" />
                  </svg>
                  Priority
                </button>
              </div>
            </div>

            {/* Filtering info message */}
            <div className="mb-6 px-4">
              <div
                className={`flex items-center rounded-lg px-4 py-3 ${
                  !isOnline
                    ? "border border-yellow-200 bg-yellow-50"
                    : "border border-blue-200 bg-blue-50"
                }`}
              >
                <div
                  className={`mr-3 rounded-full p-1.5 ${
                    !isOnline ? "bg-yellow-100" : "bg-blue-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`h-4 w-4 ${
                      !isOnline ? "text-yellow-600" : "text-blue-600"
                    }`}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      !isOnline ? "text-yellow-800" : "text-blue-800"
                    }`}
                  >
                    {!isOnline
                      ? "Go online to see available batches"
                      : sortBy === "newest"
                      ? "Showing recent batches less than 1 hour old"
                      : sortBy === "priority"
                      ? "Showing batches pending for 1+ hours by priority level"
                      : `Sorting by ${sortBy}`}
                  </p>
                  {isOnline && (
                    <p
                      className={`text-xs ${
                        !isOnline ? "text-yellow-600" : "text-blue-600"
                      }`}
                    >
                      {showHistorical
                        ? "Showing all batches sorted by priority level"
                        : "Showing all batches sorted by time"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="px-4">
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
            ) : !isOnline ? (
              <div
                className={`rounded-lg border p-8 text-center ${
                  theme === "dark" ? "border-gray-700 bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="mb-2 text-lg font-medium">
                  You&apos;re Currently Offline
                </h3>
                <p className="mb-4 text-gray-500">
                  To see available batches, please go online first by enabling
                  your location.
                </p>
                <div className="flex flex-col space-y-3 md:flex-row md:justify-center md:space-x-3 md:space-y-0">
                  <p className="text-sm text-gray-500">
                    Use the "Go Online" button in the top header to enable
                    location and start receiving batches.
                  </p>
                  <p className="mt-4 text-xs text-gray-400">
                    You&apos;ll be asked to allow location access
                  </p>
                </div>
              </div>
            ) : sortedOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    <OrderCard order={order} onOrderAccepted={loadOrders} />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-lg border p-8 text-center ${
                  theme === "dark" ? "border-gray-700 bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="mb-2 text-lg font-medium">No Batches Nearby</h3>
                <p className="mb-4 text-gray-500">
                  There are no pending batches in your area.
                </p>
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                  onClick={loadOrders}
                >
                  Refresh Batches
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <div
            className={`fixed bottom-16 left-0 right-0 z-[1000] rounded-t-2xl border-t-2 transition-all duration-300 ease-in-out ${
              isExpanded ? "h-[calc(100%-16rem)]" : "h-[80px]"
            } ${
              theme === "dark"
                ? "border-gray-800 bg-gray-900 text-gray-100"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            {/* Handle to expand/collapse */}
            <div className="relative">
              <div
                className="flex cursor-pointer items-center justify-center p-2"
                onClick={toggleExpanded}
              >
                <div
                  className={`mx-auto h-1.5 w-10 rounded-full ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`}
                />
              </div>
            </div>

            {isExpanded ? (
              <div className="h-full overflow-y-auto px-4 pb-4">
                <div className="mb-6 flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <div
                      className={`mr-3 rounded-full p-2 ${
                        theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`h-5 w-5 ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        <path d="M12 11h4" />
                        <path d="M12 16h4" />
                        <path d="M8 11h.01" />
                        <path d="M8 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2
                        className={`text-xl font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Available Batches
                      </h2>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {sortedOrders.length} batch
                        {sortedOrders.length !== 1 ? "es" : ""} found
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Combined Auto/Manual Refresh Button */}
                    <button
                      onClick={
                        isAutoRefreshing ? toggleAutoRefresh : loadOrders
                      }
                      className={`flex items-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        isAutoRefreshing
                          ? theme === "dark"
                            ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                            : "bg-green-600 text-white shadow-lg shadow-green-500/30"
                          : theme === "dark"
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="mr-1 h-3 w-3"
                      >
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      {isAutoRefreshing ? "Auto" : "Refresh"}
                    </button>

                    {/* Sort Toggle Button */}
                    <button
                      onClick={toggleHistorical}
                      className={`flex items-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        showHistorical
                          ? theme === "dark"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : theme === "dark"
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="mr-1 h-3 w-3"
                      >
                        <path d="M3 6h18M3 12h18M3 18h18" />
                      </svg>
                      {showHistorical ? "Priority" : "Time"}
                    </button>

                    {/* Last Updated Time */}
                    <div className="flex items-center">
                      <div
                        className={`rounded-full p-1 ${
                          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className={`h-2.5 w-2.5 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <span
                        className={`ml-1 text-xs font-medium ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {lastRefreshed &&
                          `${lastRefreshed.toLocaleTimeString().slice(0, 5)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      sortBy === "newest"
                        ? theme === "dark"
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-green-600 text-white shadow-lg shadow-green-500/30"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Batches less than 1 hour old"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="mr-1 h-3 w-3"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Recent
                  </button>
                  <button
                    onClick={() => handleSortChange("earnings")}
                    className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      sortBy === "earnings"
                        ? theme === "dark"
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-green-600 text-white shadow-lg shadow-green-500/30"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="mr-1 h-3 w-3"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    Earnings
                  </button>
                  <button
                    onClick={() => handleSortChange("distance")}
                    className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      sortBy === "distance"
                        ? theme === "dark"
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-green-600 text-white shadow-lg shadow-green-500/30"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="mr-1 h-3 w-3"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Distance
                  </button>
                  <button
                    onClick={() => handleSortChange("priority")}
                    className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      sortBy === "priority"
                        ? theme === "dark"
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                          : "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="All batches by priority level, including older batches"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="mr-1 h-3 w-3"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" />
                    </svg>
                    Priority
                  </button>
                </div>

                {/* Filtering info message */}
                <div className="mb-4 px-4 md:hidden">
                  <div
                    className={`flex items-center rounded-lg px-2 py-1.5 ${
                      !isOnline
                        ? theme === "dark"
                          ? "border border-yellow-800 bg-yellow-900/20"
                          : "border border-yellow-200 bg-yellow-50"
                        : theme === "dark"
                        ? "border border-blue-800 bg-blue-900/20"
                        : "border border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div
                      className={`mr-2 rounded-full p-1 ${
                        !isOnline
                          ? theme === "dark"
                            ? "bg-yellow-800"
                            : "bg-yellow-100"
                          : theme === "dark"
                          ? "bg-blue-800"
                          : "bg-blue-100"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`h-3 w-3 ${
                          !isOnline
                            ? theme === "dark"
                              ? "text-yellow-400"
                              : "text-yellow-600"
                            : theme === "dark"
                            ? "text-blue-400"
                            : "text-blue-600"
                        }`}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        !isOnline
                          ? theme === "dark"
                            ? "text-yellow-300"
                            : "text-yellow-800"
                          : theme === "dark"
                          ? "text-blue-300"
                          : "text-blue-800"
                      }`}
                    >
                      {!isOnline
                        ? "Go online to see available batches"
                        : sortBy === "newest"
                        ? "Showing batches < 1 hour old"
                        : sortBy === "priority"
                        ? "Batches pending 1+ hours by priority"
                        : `Sorting by ${sortBy}`}
                      {isOnline &&
                        (showHistorical ? " • Priority sort" : " • Time sort")}
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4 px-1">
                    <Panel
                      bordered
                      className={`h-[180px] ${
                        theme === "dark" ? "bg-gray-800 text-gray-100" : ""
                      }`}
                    >
                      <Placeholder.Paragraph rows={3} active />
                      <div className="mt-4 flex justify-between">
                        <Placeholder.Graph active width={70} height={24} />
                        <Placeholder.Graph active width={120} height={24} />
                      </div>
                    </Panel>
                    <Panel
                      bordered
                      className={`h-[180px] ${
                        theme === "dark" ? "bg-gray-800 text-gray-100" : ""
                      }`}
                    >
                      <Placeholder.Paragraph rows={3} active />
                      <div className="mt-4 flex justify-between">
                        <Placeholder.Graph active width={70} height={24} />
                        <Placeholder.Graph active width={120} height={24} />
                      </div>
                    </Panel>
                  </div>
                ) : !isOnline ? (
                  <div
                    className={`py-8 text-center ${
                      theme === "dark" ? "text-gray-100" : ""
                    }`}
                  >
                    <h3 className="mb-2 text-base font-medium">
                      You&apos;re Currently Offline
                    </h3>
                    <p
                      className={`mb-4 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      To see available batches, please go online first by
                      enabling your location.
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Use the "Go Online" button in the top header to enable
                      location and start receiving batches.
                    </p>
                    <p
                      className={`mt-4 text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      You&apos;ll be asked to allow location access
                    </p>
                  </div>
                ) : sortedOrders.length > 0 ? (
                  <div className="space-y-4 pb-20">
                    {sortedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="transform transition-all duration-200 hover:scale-[1.02]"
                      >
                        <OrderCard order={order} onOrderAccepted={loadOrders} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`py-8 text-center ${
                      theme === "dark" ? "text-gray-100" : ""
                    }`}
                  >
                    <p
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }
                    >
                      No pending batches available.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4">
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {!isOnline ? "Available Batches" : "Available Batches"}
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      !isOnline
                        ? theme === "dark"
                          ? "text-gray-500"
                          : "text-gray-400"
                        : theme === "dark"
                        ? "text-green-400"
                        : "text-green-600"
                    }`}
                  >
                    {!isOnline ? "—" : sortedOrders.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
