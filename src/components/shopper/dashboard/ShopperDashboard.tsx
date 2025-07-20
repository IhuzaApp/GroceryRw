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

      if (!showHistorical) {
        sorted = sorted.filter((order) => order.minutesAgo >= 10);
      }

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
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {lastRefreshed &&
                    `Last updated: ${lastRefreshed.toLocaleTimeString()}`}
                </span>
                <button
                  onClick={toggleAutoRefresh}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    isAutoRefreshing
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  title={
                    isAutoRefreshing
                      ? "Auto-refresh is on (30s)"
                      : "Auto-refresh is off"
                  }
                >
                  {isAutoRefreshing ? "Auto" : "Manual"}
                </button>
                <button
                  onClick={toggleHistorical}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    showHistorical
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {showHistorical
                    ? "Showing All Pending"
                    : "Showing Recent (10+ min)"}
                </button>
                <button
                  className="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
                  onClick={loadOrders}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List Section - Hidden on Mobile */}
        {!isMobile && (
          <div className="px-2">
            <div className="mb-4 mt-2 flex items-center px-4">
              <span className="mr-2 text-sm text-gray-500">Sort by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSortChange("newest")}
                  className={`rounded px-3 py-1 text-sm ${
                    sortBy === "newest"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  title="Orders less than 1 hour old"
                >
                  Newest (1h)
                </button>
                <button
                  onClick={() => handleSortChange("earnings")}
                  className={`rounded px-3 py-1 text-sm ${
                    sortBy === "earnings"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Earnings
                </button>
                <button
                  onClick={() => handleSortChange("distance")}
                  className={`rounded px-3 py-1 text-sm ${
                    sortBy === "distance"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Distance
                </button>
                <button
                  onClick={() => handleSortChange("priority")}
                  className={`rounded px-3 py-1 text-sm ${
                    sortBy === "priority"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  title="All orders by priority level, including older orders"
                >
                  Priority
                </button>
              </div>
            </div>

            {/* Filtering info message */}
            <div className="mb-4 px-4">
              <p className="text-xs text-gray-500">
                {!isOnline
                  ? "Go online to see available batches"
                  : sortBy === "newest"
                  ? "Showing recent batches less than 1 hour old"
                  : sortBy === "priority"
                  ? "Showing batches pending for 1+ hours by priority level"
                  : `Sorting by ${sortBy}`}
                {isOnline &&
                  !showHistorical &&
                  " • Only batches pending for 10+ minutes"}
              </p>
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
                  <Button
                    appearance="primary"
                    className="bg-green-500 text-white"
                    onClick={() =>
                      window.dispatchEvent(new Event("toggleGoLive"))
                    }
                  >
                    Go Online
                  </Button>
                  <p className="mt-4 text-xs text-gray-400">
                    You&apos;ll be asked to allow location access
                  </p>
                </div>
              </div>
            ) : sortedOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOrderAccepted={loadOrders}
                  />
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
                  {showHistorical
                    ? "There are no pending batches in your area."
                    : "There are no batches pending for 10+ minutes in your area."}
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
              isExpanded ? "h-[calc(100%-4rem)]" : "h-[80px]"
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
              {/* Start/Stop in sheet header on mobile when collapsed */}
              {!isExpanded && (
                <div className="absolute right-4 top-2 flex items-center">
                  {/* Status indicator dot */}
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${
                      isOnline ? "animate-pulse bg-green-500" : "bg-gray-400"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                  />

                  {/* Toggle button - RED means "Go Offline" when already online, GREEN means "Start Plas" when offline */}
                  <button
                    onClick={() =>
                      window.dispatchEvent(new Event("toggleGoLive"))
                    }
                    className={`rounded px-3 py-1 font-bold shadow ${
                      isOnline
                        ? theme === "dark"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-red-500 text-white hover:bg-red-600"
                        : theme === "dark"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {isOnline ? "Go Offline" : "Start Plas"}
                  </button>
                </div>
              )}
            </div>

            {isExpanded ? (
              <div className="h-full overflow-y-auto px-4 pb-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Available Batches
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {lastRefreshed && `${lastRefreshed.toLocaleTimeString()}`}
                    </span>
                    <button
                      onClick={toggleAutoRefresh}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        isAutoRefreshing
                          ? theme === "dark"
                            ? "bg-green-900/30 text-green-300"
                            : "bg-green-100 text-green-700"
                          : theme === "dark"
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isAutoRefreshing ? "A" : "M"}
                    </button>
                    <button
                      onClick={toggleHistorical}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        showHistorical
                          ? theme === "dark"
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                          : theme === "dark"
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {showHistorical ? "All Pending" : "10+ min"}
                    </button>
                    <button
                      className="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
                      onClick={loadOrders}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex justify-start space-x-2">
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "newest"
                        ? theme === "dark"
                          ? "bg-green-600 text-white"
                          : "bg-green-600 text-white"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    title="Batches less than 1 hour old"
                  >
                    Recent (1h)
                  </button>
                  <button
                    onClick={() => handleSortChange("earnings")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "earnings"
                        ? theme === "dark"
                          ? "bg-green-600 text-white"
                          : "bg-green-600 text-white"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    Earnings
                  </button>
                  <button
                    onClick={() => handleSortChange("distance")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "distance"
                        ? theme === "dark"
                          ? "bg-green-600 text-white"
                          : "bg-green-600 text-white"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    Distance
                  </button>
                  <button
                    onClick={() => handleSortChange("priority")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "priority"
                        ? theme === "dark"
                          ? "bg-purple-600 text-white"
                          : "bg-purple-600 text-white"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    title="All batches by priority level, including older batches"
                  >
                    Priority
                  </button>
                </div>

                {/* Filtering info message */}
                <div className="mb-4 px-4 md:hidden">
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {!isOnline
                      ? "Go online to see available batches"
                      : sortBy === "newest"
                      ? "Showing batches < 1 hour old"
                      : sortBy === "priority"
                      ? "Batches pending 1+ hours by priority"
                      : `Sorting by ${sortBy}`}
                    {isOnline && !showHistorical && " • 10+ min pending"}
                  </p>
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
                    <Button
                      appearance="primary"
                      className={`${
                        theme === "dark"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-green-500 text-white"
                      }`}
                      onClick={() =>
                        window.dispatchEvent(new Event("toggleGoLive"))
                      }
                      size="sm"
                    >
                      Go Online
                    </Button>
                    <p
                      className={`mt-4 text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      You&apos;ll be asked to allow location access
                    </p>
                  </div>
                ) : sortedOrders.length > 0 ? (
                  <div className="space-y-4 pb-16">
                    {sortedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onOrderAccepted={loadOrders}
                      />
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
                      {showHistorical
                        ? "No pending batches available."
                        : "No batches pending for 10+ minutes."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4">
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {!isOnline
                    ? "Go online to see available batches"
                    : `Available Batches: ${sortedOrders.length}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
