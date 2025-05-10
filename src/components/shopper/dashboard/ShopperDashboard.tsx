"use client";

import React, { useState, useEffect } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import OrderCard from "./OrderCard";
import dynamic from "next/dynamic";
import { Button, Loader } from "rsuite";
import "rsuite/dist/rsuite.min.css";

// Dynamically load MapSection only on client (disable SSR)
const MapSection = dynamic(() => import("./MapSection"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center bg-gray-100 md:h-[400px]">
      <Loader size="lg" content="Loading map..." />
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

export default function ShopperDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

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
    
    const hasLocationCookies = cookies["user_latitude"] && cookies["user_longitude"];
    return hasLocationCookies;
  };

  // Check and update online status based on cookies
  const updateOnlineStatus = () => {
    const hasLocationCookies = checkLocationCookies();
    setIsOnline(Boolean(hasLocationCookies));
  };

  // Function to load and filter orders
  const loadOrders = () => {
    if (!currentLocation) return;
    setIsLoading(true);
    fetch("/api/shopper/availableOrders")
      .then((res) => res.json())
      .then((data: any[]) => {
        const filtered = data.filter((o) => {
          const lat = parseFloat(o.address.latitude);
          const lng = parseFloat(o.address.longitude);
          const distKm = getDistanceKm(
            currentLocation.lat,
            currentLocation.lng,
            lat,
            lng
          );
          return distKm <= 10;
        });
        const orders = filtered.map((o) => {
          const lat = parseFloat(o.address.latitude);
          const lng = parseFloat(o.address.longitude);
          const distKm = getDistanceKm(
            currentLocation.lat,
            currentLocation.lng,
            lat,
            lng
          );
          const distMi = (distKm * 0.621371).toFixed(1);
          const earnings = (
            parseFloat(o.service_fee || "0") + parseFloat(o.delivery_fee || "0")
          ).toFixed(2);
          return {
            id: o.id,
            shopName: o.shop.name,
            shopAddress: o.shop.address,
            customerAddress: `${o.address.street}, ${o.address.city}`,
            distance: `${distMi} mi`,
            items: o.Order_Items_aggregate.aggregate?.count ?? 0,
            total: `$${earnings}`,
            estimatedEarnings: `$${earnings}`,
            createdAt: relativeTime(o.created_at),
          };
        });
        setAvailableOrders(orders);
      })
      .catch((err) => console.error("Error fetching available orders:", err))
      .finally(() => setIsLoading(false));
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
    loadOrders();
  }, [currentLocation]);

  return (
    <ShopperLayout>
      <div
        className={`${
          isMobile ? "relative h-full overflow-hidden" : "min-h-screen"
        } bg-gray-50`}
      >
        {/* Map Section */}
        <div className="w-full">
          <MapSection mapLoaded={mapLoaded} availableOrders={availableOrders} />
        </div>

        {/* Desktop Title and Sort */}
        {!isMobile && (
          <div className="px-2 pb-2 md:block">
            <h1 className="px-4 pt-4 text-2xl font-bold">Available Batches</h1>
            <div className="mb-2 flex items-center justify-between px-4">
              <span className="mr-2 text-sm text-gray-500">Sort by:</span>
              <select className="rounded border p-1 text-sm">
                <option>Newest</option>
                <option>Distance</option>
                <option>Earnings</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader content="Loading orders..." />
              </div>
            ) : availableOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-white p-8 text-center">
                <h3 className="mb-2 text-lg font-medium">No Orders Nearby</h3>
                <p className="mb-4 text-gray-500">
                  There are currently no available orders in your area.
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
                      isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
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
                        ? "bg-red-500 text-white"  // Red when online (action: Go Offline)
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
                  <Button
                    appearance="primary"
                    className="bg-green-500 text-white"
                    onClick={loadOrders}
                  >
                    Refresh
                  </Button>
                </div>
                {isLoading ? (
                  <Loader content="Loading orders..." />
                ) : availableOrders.length > 0 ? (
                  <div className="space-y-4 pb-16">
                    {availableOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No available orders nearby.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4">
                <p className="text-sm text-gray-500">
                  Available Orders: {availableOrders.length}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
