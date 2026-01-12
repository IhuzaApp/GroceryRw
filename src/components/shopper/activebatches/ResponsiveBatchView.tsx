"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { BatchTableDesktop } from "./BatchTableDesktop";
import { BatchCardMobile } from "./BatchCardMobile";
import { BatchFilters, FilterState } from "./BatchFilters";

interface Order {
  id: string;
  OrderID: string;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?: "regular" | "reel" | "restaurant";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
    restaurant_id?: string | null;
    user_id?: string | null;
    isRestaurantUserReel?: boolean;
  };
  quantity?: number;
  deliveryNote?: string | null;
  customerPhone?: string;
}

interface ResponsiveBatchViewProps {
  orders: Order[];
}

export function ResponsiveBatchView({ orders }: ResponsiveBatchViewProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);

  // Check screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Use 1024px as breakpoint for table view
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update filtered orders when orders prop changes
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const calculateUrgency = (order: Order): string => {
    const now = currentTime.getTime();
    
    // Check if newly accepted (status is accepted and created within last hour)
    if (order.status === "accepted") {
      const createdTime = new Date(order.createdAt).getTime();
      const hourAgo = now - 60 * 60 * 1000;
      if (createdTime > hourAgo) {
        return "newly_accepted";
      }
    }

    // Check delivery time urgency
    if (order.deliveryTime) {
      const deliveryTime = new Date(order.deliveryTime).getTime();
      const timeDiff = deliveryTime - now;
      const minutesRemaining = timeDiff / (1000 * 60);

      // Late: past delivery time
      if (minutesRemaining <= 0) {
        return "late";
      }
      
      // Urgent: 10 minutes or less
      if (minutesRemaining <= 10) {
        return "urgent";
      }
    }

    // Everything else is okay
    return "okay";
  };

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...orders];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.OrderID.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.shopName.toLowerCase().includes(searchLower) ||
          order.customerAddress.toLowerCase().includes(searchLower)
      );
    }

    // Apply order type filter
    if (filters.orderType) {
      filtered = filtered.filter((order) => order.orderType === filters.orderType);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Apply urgency filter
    if (filters.urgency) {
      filtered = filtered.filter((order) => calculateUrgency(order) === filters.urgency);
    }

    setFilteredOrders(filtered);
  };

  return (
    <div>
      {/* Filters - Show on both desktop and mobile */}
      <BatchFilters onFilterChange={handleFilterChange} />

      {/* Desktop Table View */}
      {!isMobile && <BatchTableDesktop orders={filteredOrders} />}

      {/* Mobile Card View */}
      {isMobile && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredOrders.map((order) => (
            <BatchCardMobile
              key={order.id}
              order={order}
              currentTime={currentTime}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div
          className={`rounded-xl border p-8 text-center ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-8 w-8 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p
            className={`mb-2 text-lg font-bold sm:text-xl ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            No Batches Found
          </p>
          <p
            className={`text-sm sm:text-base ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No batches match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
