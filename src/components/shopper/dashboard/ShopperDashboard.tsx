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
    <div className="h-[300px] md:h-[400px] w-full flex items-center justify-center bg-gray-100">
      <Loader size="lg" content="Loading map..." />
    </div>
  ),
});

// Haversine formula to compute distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute relative time from ISO string
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins >= 60
    ? `${Math.floor(diffMins/60)}h ${diffMins%60}m ago`
    : `${diffMins} mins ago`;
}

export default function ShopperDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat:number,lng:number} | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  // Function to load and filter orders
  const loadOrders = () => {
    if (!currentLocation) return;
    setIsLoading(true);
    fetch('/api/shopper/availableOrders')
      .then((res) => res.json())
      .then((data: any[]) => {
        const filtered = data.filter((o) => {
          const lat = parseFloat(o.address.latitude);
          const lng = parseFloat(o.address.longitude);
          const distKm = getDistanceKm(currentLocation.lat, currentLocation.lng, lat, lng);
          return distKm <= 10;
        });
        const orders = filtered.map((o) => {
          const lat = parseFloat(o.address.latitude);
          const lng = parseFloat(o.address.longitude);
          const distKm = getDistanceKm(currentLocation.lat, currentLocation.lng, lat, lng);
          const distMi = (distKm * 0.621371).toFixed(1);
          const earnings = (parseFloat(o.service_fee || '0') + parseFloat(o.delivery_fee || '0')).toFixed(2);
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
      .catch((err) => console.error('Error fetching available orders:', err))
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

  // Read last known location from cookies or get fresh position
  useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc: Record<string,string>, cur) => {
      const [k,v] = cur.split('='); acc[k]=v; return acc;
    }, {} as Record<string,string>);
    if (cookies['user_latitude'] && cookies['user_longitude']) {
      setCurrentLocation({
        lat: parseFloat(cookies['user_latitude']),
        lng: parseFloat(cookies['user_longitude'])
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Error fetching location:', err),
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
      <div className={`${isMobile ? 'h-full overflow-hidden relative' : 'min-h-screen'} bg-gray-50`}>
        {/* Map Section */}
        <div className="w-full">
          <MapSection mapLoaded={mapLoaded} availableOrders={availableOrders} />
        </div>

        {/* Desktop Title and Sort */}
        {!isMobile && (
          <div className="md:block px-2 pb-2">
            <h1 className="text-2xl font-bold px-4 pt-4">Available Batches</h1>
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <select className="text-sm border rounded p-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border">
                <h3 className="text-lg font-medium mb-2">No Orders Nearby</h3>
                <p className="text-gray-500 mb-4">There are currently no available orders in your area.</p>
                <Button appearance="primary" className="bg-green-500 text-white" onClick={loadOrders}>
                  Refresh Orders
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <div
            className={`fixed bottom-14 left-0 right-0 transition-all duration-300 ease-in-out bg-white rounded-t-2xl border-t-2 z-[1100] ${
              isExpanded ? 'h-[80%]' : 'h-[80px]'
            }`}
          >
            {/* Handle to expand/collapse */}
            <div className="relative">
              <div className="flex justify-center items-center p-2 cursor-pointer" onClick={toggleExpanded}>
                <div className="w-10 h-1.5 rounded-full bg-gray-300 mx-auto" />
              </div>
              {/* Start/Stop in sheet header on mobile when collapsed */}
              {!isExpanded && (
                <button
                  onClick={() => window.dispatchEvent(new Event('toggleGoLive'))}
                  className={`absolute top-2 right-4 font-bold py-1 px-3 rounded shadow ${isOnline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                  {isOnline ? 'Go Offline' : 'Start Plas'}
                </button>
              )}
            </div>

            {isExpanded ? (
              <div className="px-4 overflow-y-auto h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Available Orders</h2>
                  <Button appearance="primary" className="bg-green-500 text-white" onClick={loadOrders}>
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
                  <div className="text-center py-8">
                    <p className="text-gray-500">No available orders nearby.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4">
                <p className="text-sm text-gray-500">Available Orders: {availableOrders.length}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
