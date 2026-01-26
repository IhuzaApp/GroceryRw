import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface Order {
  id: string;
  OrderID: string | number;
  orderIDs?: Array<string | number>;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopNames?: string[];
  shopAddress: string;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?: "regular" | "reel" | "restaurant" | "combined";
  reel?: {
    id: string;
    title: string;
    restaurant_id?: string | null;
    user_id?: string | null;
  };
  quantity?: number;
  deliveryNote?: string | null;
}

interface BatchCardMobileProps {
  order: Order;
  currentTime: Date;
}

export function BatchCardMobile({ order, currentTime }: BatchCardMobileProps) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isReelOrder = order.orderType === "reel";
  const isRestaurantOrder = order.orderType === "restaurant";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleContactSupport = () => {
    setShowMenu(false);
    // TODO: Implement contact support functionality
    alert(`Contact support about order #${order.OrderID}`);
  };

  // Get icon color - always green for mobile
  const getIconColor = () => {
    return "bg-green-500";
  };


  // Get service/provider name
  const getServiceName = () => {
    if (isReelOrder) {
      return order.reel?.title || "Quick Batch";
    }
    if (isRestaurantOrder) {
      return order.shopName || "Restaurant Order";
    }
    return order.shopName || "Batch";
  };

  // Get destination text
  const getDestination = () => {
    if (isReelOrder) {
      return `${order.customerName || "Customer"}`;
    }
    return `${order.shopName} to ${order.customerName}`;
  };

  // Get status label text
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "picked":
        return "Picked Up";
      case "shopping":
        return "Shopping";
      case "on_the_way":
        return "On The Way";
      case "at_customer":
        return "At Customer";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    }
  };

  // Calculate delivery countdown (same as desktop)
  const getDeliveryCountdown = (deliveryTime: string) => {
    const deliveryDate = new Date(deliveryTime);
    const timeDiff = deliveryDate.getTime() - currentTime.getTime();

    if (timeDiff <= 0) {
      // Calculate overdue time
      const overdueMinutes = Math.ceil(Math.abs(timeDiff) / (1000 * 60));
      const overdueHours = Math.floor(overdueMinutes / 60);
      const overdueMins = overdueMinutes % 60;
      return { 
        isOverdue: true, 
        minutes: overdueMins, 
        hours: overdueHours, 
        totalMinutes: overdueMinutes 
      };
    }

    const totalMinutes = Math.ceil(timeDiff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { isOverdue: false, minutes, hours, totalMinutes };
  };

  // Format overdue time in a human-readable way
  const formatOverdueTime = (totalMinutes: number) => {
    const minutes = totalMinutes;
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      const remainingMonths = Math.floor((days % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
      }
      return `${years} year${years > 1 ? "s" : ""}`;
    }

    if (months > 0) {
      const remainingDays = days % 30;
      if (remainingDays > 0) {
        return `${months} month${months > 1 ? "s" : ""} ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
      }
      return `${months} month${months > 1 ? "s" : ""}`;
    }

    if (weeks > 0) {
      const remainingDays = days % 7;
      if (remainingDays > 0) {
        return `${weeks} week${weeks > 1 ? "s" : ""} ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
      }
      return `${weeks} week${weeks > 1 ? "s" : ""}`;
    }

    if (days > 0) {
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days} day${days > 1 ? "s" : ""} ${remainingHours}h`;
      }
      return `${days} day${days > 1 ? "s" : ""}`;
    }

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${hours}h`;
    }

    return `${minutes}m`;
  };

  // Format expected delivery time with countdown
  const formatExpectedDeliveryTime = () => {
    if (!order.deliveryTime) {
      return { text: "N/A", color: "text-gray-600" };
    }

    const countdown = getDeliveryCountdown(order.deliveryTime);
    const deliveryDate = new Date(order.deliveryTime);

    if (countdown.isOverdue) {
      const overdueText = `Delayed by ${formatOverdueTime(countdown.totalMinutes)}`;
      return { text: overdueText, color: "text-red-600" };
    }

    // Format the delivery time
    const timeString = deliveryDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Determine color based on remaining time
    let colorClass = "text-green-600"; // Default: green (plenty of time)
    
    if (countdown.totalMinutes <= 30) {
      // Yellow when getting close (30 minutes or less)
      colorClass = "text-yellow-600";
    }

    // Add countdown
    let timeText = "";
    if (countdown.totalMinutes <= 30) {
      timeText = `${timeString} (${countdown.totalMinutes}m remaining)`;
    } else if (countdown.hours > 0) {
      timeText = `${timeString} (${countdown.hours}h ${countdown.minutes}m remaining)`;
    } else {
      timeText = `${timeString} (${countdown.minutes}m remaining)`;
    }

    return { text: timeText, color: colorClass };
  };

  // Get delivery time info once
  const deliveryTimeInfo = formatExpectedDeliveryTime();

  return (
    <div
      className={`relative rounded-2xl bg-white p-4 shadow-sm ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Ellipsis Menu Button - Top Right */}
      <div className="absolute right-4 top-4" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`rounded-lg p-1.5 transition-colors ${
            theme === "dark"
              ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className={`absolute right-0 top-10 z-50 min-w-[180px] rounded-lg border shadow-lg ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="py-1">
              {/* Contact Support */}
              <button
                onClick={handleContactSupport}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  theme === "dark"
                    ? "text-gray-200 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Service/Provider Header */}
      <div className="mb-4 flex items-center gap-3">
        {/* Circular Icon - Green with OrderID */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${getIconColor()} text-white font-bold text-sm`}
        >
          #{order.OrderID}
        </div>
        {/* Service Name */}
        <h3
          className={`text-lg font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {getServiceName()}
        </h3>
      </div>

      {/* Details Section */}
      <div className="mb-4 space-y-2">
        {/* Destination */}
        <div>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Destination
          </p>
          <p
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {getDestination()}
          </p>
        </div>

        {/* Earning */}
        <div>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Earning
          </p>
          <p
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {formatCurrencySync(order.estimatedEarnings || 0)}
          </p>
        </div>

        {/* Expected Delivery Time */}
        <div>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Expected delivery time
          </p>
          <p
            className={`text-sm font-medium ${
              theme === "dark" 
                ? deliveryTimeInfo.color === "text-red-600"
                  ? "text-red-400"
                  : deliveryTimeInfo.color === "text-yellow-600"
                  ? "text-yellow-400"
                  : "text-green-400"
                : deliveryTimeInfo.color
            }`}
          >
            {deliveryTimeInfo.text}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Status Badge/Label */}
        <div className="flex-1">
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Detail Arrow Button - Navigate to order details */}
        <Link href={`/Plasa/active-batches/batch/${order.id}`}>
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
            } transition-colors`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
