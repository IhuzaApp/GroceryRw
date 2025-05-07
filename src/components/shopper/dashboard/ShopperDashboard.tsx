"use client"

import React, { useState, useEffect } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import OrderCard from "./OrderCard";
import dynamic from "next/dynamic";
import { Button, Loader } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import Link from "next/link";
import Image from "next/image";

// Dynamically load MapSection only on client (disable SSR)
const MapSection = dynamic(() => import("./MapSection"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 p-4">
      <Loader size="lg" content="Loading map..." />
    </div>
  ),
});

export default function ShopperDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mockOrders = [
    { id: "ORD-1234", shopName: "FreshMart", shopAddress: "123 Market St, Mesa, AZ", customerAddress: "456 Pine Ave, Mesa, AZ", distance: "1.2 mi", items: 8, total: "$45.67", estimatedEarnings: "$12.50", createdAt: "10 mins ago" },
    { id: "ORD-5678", shopName: "GreenGrocer", shopAddress: "789 Oak Rd, Mesa, AZ", customerAddress: "101 Maple Dr, Mesa, AZ", distance: "2.5 mi", items: 12, total: "$78.90", estimatedEarnings: "$15.75", createdAt: "15 mins ago" },
    { id: "ORD-9012", shopName: "Value Foods", shopAddress: "202 Cedar Ln, Mesa, AZ", customerAddress: "303 Elm St, Mesa, AZ", distance: "3.1 mi", items: 5, total: "$32.45", estimatedEarnings: "$10.25", createdAt: "22 mins ago" },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const timer = setTimeout(() => {
      setAvailableOrders(mockOrders);
      setIsLoading(false);
      setMapLoaded(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <ShopperLayout>
      <div className={`min-h-screen bg-gray-50 ${isMobile ? "pb-16" : ""}`}>
        {/* Map Section */}
        <MapSection mapLoaded={mapLoaded} availableOrders={availableOrders} />
        {/* Desktop Title and Sort */}
        <div className="hidden md:flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Available Orders</h1>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort by:</span>
            <select className="text-sm border rounded p-1">
              <option>Newest</option>
              <option>Distance</option>
              <option>Earnings</option>
            </select>
          </div>
        </div>
        {/* Orders List */}
        <div className="p-4">
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-gray-400">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Orders Nearby</h3>
              <p className="text-gray-500 mb-4">There are currently no available orders in your area.</p>
              <Button appearance="primary" className="bg-green-500 text-white">
                Refresh Orders
              </Button>
            </div>
          )}
        </div>
      </div>
    </ShopperLayout>
  );
} 