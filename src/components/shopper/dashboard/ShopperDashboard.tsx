"use client";

import React, { useState, useEffect } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import OrderCard from "./OrderCard";
import dynamic from "next/dynamic";
import { Button, Loader, Placeholder, Panel, Grid, Row, Col } from "rsuite";
import "rsuite/dist/rsuite.min.css";

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
}

export default function ShopperDashboard() {
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

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  // Function to check if user has active location cookies
  const checkLocationCookies = () => {
    const cookies = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    const hasLocationCookies =
      cookies["user_latitude"] && cookies["user_longitude"];
    return hasLocationCookies;
  };

  // Check and update online status based on cookies
  const updateOnlineStatus = () => {
    const hasLocationCookies = checkLocationCookies();
    setIsOnline(Boolean(hasLocationCookies));
  };

  // Enhanced loadOrders function with better debugging and handling for all PENDING orders
  const loadOrders = () => {
    if (!currentLocation) {
      console.log("Cannot load orders: No current location available");
      return;
    }

    if (!isOnline) {
      console.log("Cannot load orders: User is offline");
      setAvailableOrders([]);
      setSortedOrders([]);
      return;
    }

    setIsLoading(true);
    console.log("Fetching available orders...");

    // Convert location strings to numbers if they're strings
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

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    // Include shopper's location and set max travel time to 15 minutes
    const url = `/api/shopper/availableOrders?_=${timestamp}&latitude=${safeLocation.lat}&longitude=${safeLocation.lng}&maxTravelTime=15`;

    console.log(`Requesting orders with URL: ${url}`);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(
          `Received ${data.length} orders from API within 15 min travel time`
        );

        // Debug: Log all received orders first
        data.forEach((order: any, idx: number) => {
          console.log(`Order ${idx + 1}/${data.length}:`, {
            id: order.id,
            created: new Date(order.createdAt).toLocaleString(),
            status: order.status || "PENDING",
            shop: order.shopName,
            shopCoords: `${order.shopLatitude}, ${order.shopLongitude}`,
            customerCoords: `${order.customerLatitude}, ${order.customerLongitude}`,
            items: order.itemsCount,
            travelTime: `${order.travelTimeMinutes} min`,
            distance: `${order.distance} km`,
          });
        });

        // Format orders for the OrderCard component - use formatted data from API
        const formattedOrders = data
          .map((order: any) => {
            try {
              // Calculate createdAt as Date for sorting
              const createdAtDate = new Date(order.createdAt);
              const minutesAgo = Math.floor(
                (Date.now() - createdAtDate.getTime()) / 60000
              );

              // Format timestamps
              const createdTimeFormatted = relativeTime(order.createdAt);

              // Note - now using API-calculated distance in km
              const distanceStr = `${order.distance} km`;

              return {
                id: order.id,
                shopName: order.shopName || "Unknown Shop",
                shopAddress: order.shopAddress || "No address available",
                customerAddress:
                  order.customerAddress || "No address available",
                distance: distanceStr,
                items: order.itemsCount || 0,
                total: `$${(order.earnings || 0).toFixed(2)}`,
                estimatedEarnings: `$${(order.earnings || 0).toFixed(2)}`,
                createdAt: createdTimeFormatted,
                status: order.status || "PENDING",
                // Add additional properties for sorting and filtering
                rawDistance: order.distance || 0,
                rawEarnings: order.earnings || 0,
                rawCreatedAt: createdAtDate.getTime(),
                minutesAgo: minutesAgo,
                priorityLevel: order.priorityLevel || 1,
                // Keep original coordinates for map rendering
                shopLatitude: order.shopLatitude,
                shopLongitude: order.shopLongitude,
                customerLatitude: order.customerLatitude,
                customerLongitude: order.customerLongitude,
                // Add travel time
                travelTimeMinutes: order.travelTimeMinutes,
              };
            } catch (err) {
              console.error(`Error formatting order ${order.id}:`, err);
              return null; // Skip orders with formatting errors
            }
          })
          .filter(Boolean); // Remove any null entries from formatting errors

        console.log(`Formatted ${formattedOrders.length} orders for display`);

        // Set available orders
        setAvailableOrders(formattedOrders);

        // Apply sort
        const sorted = sortOrders(formattedOrders, sortBy);
        setSortedOrders(sorted);

        setLastRefreshed(new Date());
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching available orders:", err);
        setIsLoading(false);
      });
  };

  // Function to sort orders based on the selected criteria
  const sortOrders = (
    orders: FormattedOrder[],
    criteria: "newest" | "earnings" | "distance" | "priority"
  ) => {
    let sorted = [...orders];

    // Apply sorting based on criteria
    if (criteria === "newest") {
      sorted.sort((a, b) => b.rawCreatedAt - a.rawCreatedAt);
    } else if (criteria === "earnings") {
      sorted.sort((a, b) => b.rawEarnings - a.rawEarnings);
    } else if (criteria === "distance") {
      sorted.sort((a, b) => a.rawDistance - b.rawDistance);
    } else if (criteria === "priority") {
      // First by priority level (descending), then by age within each priority level
      sorted.sort((a, b) => {
        if (a.priorityLevel !== b.priorityLevel) {
          return b.priorityLevel - a.priorityLevel; // Higher priority first
        }
        return b.minutesAgo - a.minutesAgo; // Older orders first within same priority
      });
    }

    // Additionally, apply filtering - changed from 10 to 15 minutes
    if (!showHistorical) {
      // Show only orders pending for at least 15 minutes
      sorted = sorted.filter((order) => order.minutesAgo >= 15);
    }

    return sorted;
  };

  // Handle sort change
  const handleSortChange = (
    newSortBy: "newest" | "earnings" | "distance" | "priority"
  ) => {
    setSortBy(newSortBy);
    sortOrders(availableOrders, newSortBy);
  };

  // Handle toggle for historical vs. current batches
  const toggleHistorical = () => {
    setShowHistorical(!showHistorical);
    // Reload orders when this changes to get the correct time window
    loadOrders();
  };

  // Add automatic refresh with polling
  useEffect(() => {
    // Set up polling for automatic refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;

    if (isAutoRefreshing && currentLocation && isOnline) {
      console.log("Setting up auto-refresh for orders (30s interval)");
      intervalId = setInterval(() => {
        console.log("Auto-refreshing orders...");
        loadOrders();
      }, 30000); // Refresh every 30 seconds
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalId) {
        console.log("Clearing auto-refresh interval");
        clearInterval(intervalId);
      }
    };
  }, [currentLocation, isAutoRefreshing, showHistorical, sortBy, isOnline]);

  // Add toggle for auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefreshing((prev) => !prev);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for cookie changes and online status updates
  useEffect(() => {
    // Initial check
    updateOnlineStatus();

    // Create a custom event listener to detect when toggling online/offline
    const handleCustomEvent = () => {
      // Give the cookies time to be set or cleared
      setTimeout(updateOnlineStatus, 300);
    };

    window.addEventListener("toggleGoLive", handleCustomEvent);

    // Also check periodically for any cookie changes
    const intervalId = setInterval(updateOnlineStatus, 5000);

    return () => {
      window.removeEventListener("toggleGoLive", handleCustomEvent);
      clearInterval(intervalId);
    };
  }, []);

  // Effect to clear orders when user goes offline
  useEffect(() => {
    if (!isOnline) {
      console.log("User went offline, clearing order data");
      setAvailableOrders([]);
      setSortedOrders([]);
    }
  }, [isOnline]);

  // Read last known location from cookies or get fresh position
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

  // Fetch available orders based on location
  useEffect(() => {
    if (currentLocation && isOnline) {
      loadOrders();
    }
  }, [currentLocation, showHistorical, isOnline]);

  // Track initialization state
  useEffect(() => {
    // Consider dashboard initialized when location is set and map is loaded
    if (currentLocation && mapLoaded) {
      // Add slight delay to ensure smooth transition
      const timer = setTimeout(() => setIsInitializing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentLocation, mapLoaded]);

  // Add this useEffect to update sorting when sortBy changes
  useEffect(() => {
    if (availableOrders.length > 0) {
      sortOrders(availableOrders, sortBy);
    }
  }, [sortBy, availableOrders]);

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
        } bg-gray-50`}
      >
        {/* Map Section */}
        <div className="w-full">
          <MapSection
            mapLoaded={mapLoaded}
            availableOrders={availableOrders}
            isInitializing={isInitializing}
          />
        </div>

        {/* Desktop Title and Sort */}
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
                    : "Showing Recent (15+ min)"}
                </button>
                <button
                  onClick={loadOrders}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                >
                  Refresh
                </button>
              </div>
            </div>

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
                  ? "Go online to see available orders"
                  : sortBy === "newest"
                  ? "Showing recent orders less than 1 hour old"
                  : sortBy === "priority"
                  ? "Showing orders pending for 1+ hours by priority level"
                  : `Sorting by ${sortBy}`}
                {isOnline &&
                  !showHistorical &&
                  " • Only orders pending for 15+ minutes"}
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
              <div className="rounded-lg border bg-white p-8 text-center">
                <h3 className="mb-2 text-lg font-medium">
                  You&apos;re Currently Offline
                </h3>
                <p className="mb-4 text-gray-500">
                  To see available orders, please go online first by enabling
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
              <div className="rounded-lg border bg-white p-8 text-center">
                <h3 className="mb-2 text-lg font-medium">No Orders Nearby</h3>
                <p className="mb-4 text-gray-500">
                  {showHistorical
                    ? "There are no pending orders in your area."
                    : "There are no orders pending for 15+ minutes in your area."}
                </p>
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                  onClick={loadOrders}
                >
                  Refresh Orders
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <div
            className={`fixed bottom-14 left-0 right-0 z-[1100] rounded-t-2xl border-t-2 bg-white transition-all duration-300 ease-in-out ${
              isExpanded ? "h-[80%]" : "h-[80px]"
            }`}
          >
            {/* Handle to expand/collapse */}
            <div className="relative">
              <div
                className="flex cursor-pointer items-center justify-center p-2"
                onClick={toggleExpanded}
              >
                <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-300" />
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
                        ? "bg-red-500 text-white" // Red when online (action: Go Offline)
                        : "bg-green-500 text-white" // Green when offline (action: Start Plas)
                    }`}
                  >
                    {isOnline ? "Go Offline" : "Start Plas"}
                  </button>
                </div>
              )}
            </div>

            {isExpanded ? (
              <div className="h-full overflow-y-auto px-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Available Orders</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {lastRefreshed && `${lastRefreshed.toLocaleTimeString()}`}
                    </span>
                    <button
                      onClick={toggleAutoRefresh}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        isAutoRefreshing
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isAutoRefreshing ? "A" : "M"}
                    </button>
                    <button
                      onClick={toggleHistorical}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        showHistorical
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {showHistorical ? "All Pending" : "15+ min"}
                    </button>
                    <Button
                      appearance="primary"
                      className="bg-green-500 text-white"
                      onClick={loadOrders}
                      size="sm"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex justify-start space-x-2">
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "newest"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    title="Orders less than 1 hour old"
                  >
                    Recent (1h)
                  </button>
                  <button
                    onClick={() => handleSortChange("earnings")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "earnings"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    Earnings
                  </button>
                  <button
                    onClick={() => handleSortChange("distance")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "distance"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    Distance
                  </button>
                  <button
                    onClick={() => handleSortChange("priority")}
                    className={`rounded px-3 py-1 text-xs ${
                      sortBy === "priority"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    title="All orders by priority level, including older orders"
                  >
                    Priority
                  </button>
                </div>

                {/* Filtering info message */}
                <div className="mb-4 px-4 md:hidden">
                  <p className="text-xs text-gray-500">
                    {!isOnline
                      ? "Go online to see available orders"
                      : sortBy === "newest"
                      ? "Showing orders < 1 hour old"
                      : sortBy === "priority"
                      ? "Orders pending 1+ hours by priority"
                      : `Sorting by ${sortBy}`}
                    {isOnline && !showHistorical && " • 15+ min pending"}
                  </p>
                </div>

                {isLoading ? (
                  <div className="space-y-4 px-1">
                    <Panel bordered className="h-[180px]">
                      <Placeholder.Paragraph rows={3} active />
                      <div className="mt-4 flex justify-between">
                        <Placeholder.Graph active width={70} height={24} />
                        <Placeholder.Graph active width={120} height={24} />
                      </div>
                    </Panel>
                    <Panel bordered className="h-[180px]">
                      <Placeholder.Paragraph rows={3} active />
                      <div className="mt-4 flex justify-between">
                        <Placeholder.Graph active width={70} height={24} />
                        <Placeholder.Graph active width={120} height={24} />
                      </div>
                    </Panel>
                  </div>
                ) : !isOnline ? (
                  <div className="py-8 text-center">
                    <h3 className="mb-2 text-base font-medium">
                      You&apos;re Currently Offline
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      To see available orders, please go online first by
                      enabling your location.
                    </p>
                    <Button
                      appearance="primary"
                      className="bg-green-500 text-white"
                      onClick={() =>
                        window.dispatchEvent(new Event("toggleGoLive"))
                      }
                      size="sm"
                    >
                      Go Online
                    </Button>
                    <p className="mt-4 text-xs text-gray-400">
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
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      {showHistorical
                        ? "No pending orders available."
                        : "No orders pending for 15+ minutes."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4">
                <p className="text-sm text-gray-500">
                  {!isOnline
                    ? "Go online to see available orders"
                    : `Available Orders: ${sortedOrders.length}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
