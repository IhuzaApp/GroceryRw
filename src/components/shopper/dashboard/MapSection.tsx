"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader, toaster, Message, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import {
  formatCurrencySync,
  getCurrencySymbol,
} from "../../../utils/formatCurrency";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";
import { useWebSocket } from "../../../hooks/useWebSocket";

// Helper function to create popup HTML with proper button styling
const createPopupHTML = (
  order: any,
  theme: "light" | "dark",
  isPending: boolean = false
) => {
  const isDark = theme === "dark";

  if (isPending) {
    return `
      <div style="
        min-width: 280px;
        max-width: 320px;
        background: ${isDark ? "#1f2937" : "#ffffff"};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: ${
          isDark
            ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)"
            : "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.5)"
        };
      ">
        <!-- Header -->
        <div style="
          background: ${isDark ? "#374151" : "#f9fafb"};
          padding: 16px;
          border-bottom: 1px solid ${isDark ? "#4b5563" : "#e5e7eb"};
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="
              font-size: 12px;
              font-weight: 500;
              color: ${isDark ? "#9ca3af" : "#6b7280"};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              Order #${order.id.slice(-6)}
            </span>
            <span style="
              font-size: 18px;
              font-weight: 700;
              color: ${isDark ? "#10b981" : "#059669"};
            ">
              ${formatCurrencySync(order.earnings)}
            </span>
          </div>
          <div style="
            font-size: 16px;
            font-weight: 600;
            color: ${isDark ? "#f3f4f6" : "#111827"};
            margin-bottom: 4px;
          ">
            ${order.shopName}
          </div>
          <div style="
            font-size: 14px;
            color: ${isDark ? "#9ca3af" : "#6b7280"};
          ">
            ${order.shopAddress}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isDark ? "#374151" : "#f3f4f6"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                🛒
              </div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 500;
                  color: ${isDark ? "#f3f4f6" : "#111827"};
                ">
                  ${order.itemsCount} items
                </div>
                <div style="
                  font-size: 12px;
                  color: ${isDark ? "#9ca3af" : "#6b7280"};
                ">
                  ${order.createdAt}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isDark ? "#374151" : "#f3f4f6"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                🚚
              </div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 500;
                  color: ${isDark ? "#f3f4f6" : "#111827"};
                ">
                  Delivery Address
                </div>
                <div style="
                  font-size: 12px;
                  color: ${isDark ? "#9ca3af" : "#6b7280"};
                ">
                  ${order.addressStreet}, ${order.addressCity}
                </div>
              </div>
            </div>
          </div>

          <!-- Accept Button -->
          <button 
            id="accept-batch-${order.id}" 
            style="
              width: 100%;
              margin-top: 20px;
              padding: 12px 16px;
              background: ${isDark ? "#10b981" : "#059669"};
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            "
            onmouseover="this.style.background='${
              isDark ? "#059669" : "#047857"
            }'; this.style.transform='translateY(-1px)'"
            onmouseout="this.style.background='${
              isDark ? "#10b981" : "#059669"
            }'; this.style.transform='translateY(0)'"
          >
            <span>✓</span>
            Accept Batch
          </button>
        </div>
      </div>
    `;
  } else {
    // Available order popup
    const isReelOrder = order.orderType === "reel";
    const isRestaurantOrder = order.orderType === "restaurant";

    const getOrderTypeConfig = () => {
      if (isReelOrder) {
        return {
          color: isDark ? "#8b5cf6" : "#7c3aed",
          bgColor: isDark ? "#4c1d95" : "#ede9fe",
          icon: "🎬",
          label: "REEL ORDER",
          buttonColor: isDark ? "#8b5cf6" : "#7c3aed",
          buttonHover: isDark ? "#7c3aed" : "#6d28d9",
        };
      } else if (isRestaurantOrder) {
        return {
          color: isDark ? "#f97316" : "#ea580c",
          bgColor: isDark ? "#9a3412" : "#fed7aa",
          icon: "🍽️",
          label: "RESTAURANT ORDER",
          buttonColor: isDark ? "#f97316" : "#ea580c",
          buttonHover: isDark ? "#ea580c" : "#c2410c",
        };
      } else {
        return {
          color: isDark ? "#10b981" : "#059669",
          bgColor: isDark ? "#064e3b" : "#d1fae5",
          icon: "🏪",
          label: "REGULAR ORDER",
          buttonColor: isDark ? "#10b981" : "#059669",
          buttonHover: isDark ? "#059669" : "#047857",
        };
      }
    };

    const orderConfig = getOrderTypeConfig();

    return `
      <div style="
        min-width: 280px;
        max-width: 320px;
        background: ${isDark ? "#1f2937" : "#ffffff"};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: ${
          isDark
            ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)"
            : "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.5)"
        };
      ">
        <!-- Header -->
        <div style="
          background: ${isDark ? "#374151" : "#f9fafb"};
          padding: 16px;
          border-bottom: 1px solid ${isDark ? "#4b5563" : "#e5e7eb"};
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="
              font-size: 12px;
              font-weight: 500;
              color: ${isDark ? "#9ca3af" : "#6b7280"};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              Order #${order.id.slice(-6)}
            </span>
            <span style="
              font-size: 18px;
              font-weight: 700;
              color: ${orderConfig.color};
            ">
              ${formatCurrencySync(
                parseFloat(order.estimatedEarnings || order.total || "0")
              )}
            </span>
          </div>
          
          <!-- Order Type Badge -->
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 6px;
            background: ${orderConfig.bgColor};
            color: ${orderConfig.color};
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">
            <span>${orderConfig.icon}</span>
            ${orderConfig.label}
          </div>

          <div style="
            font-size: 16px;
            font-weight: 600;
            color: ${isDark ? "#f3f4f6" : "#111827"};
            margin-bottom: 4px;
          ">
            ${isReelOrder ? order.reel?.title || "Reel Order" : order.shopName}
          </div>
          <div style="
            font-size: 14px;
            color: ${isDark ? "#9ca3af" : "#6b7280"};
          ">
            ${
              isReelOrder
                ? `From: ${order.customerName || "Reel Creator"}`
                : order.shopAddress
            }
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isDark ? "#374151" : "#f3f4f6"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                ${orderConfig.icon}
              </div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 500;
                  color: ${isDark ? "#f3f4f6" : "#111827"};
                ">
                  ${order.items || "N/A"} items
                </div>
                <div style="
                  font-size: 12px;
                  color: ${isDark ? "#9ca3af" : "#6b7280"};
                ">
                  ${order.createdAt}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isDark ? "#374151" : "#f3f4f6"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                🚚
              </div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 500;
                  color: ${isDark ? "#f3f4f6" : "#111827"};
                ">
                  Delivery Address
                </div>
                <div style="
                  font-size: 12px;
                  color: ${isDark ? "#9ca3af" : "#6b7280"};
                ">
                  ${order.customerAddress}
                </div>
              </div>
            </div>

            ${
              isReelOrder && order.deliveryNote
                ? `
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                  width: 32px;
                  height: 32px;
                  border-radius: 8px;
                  background: ${isDark ? "#374151" : "#f3f4f6"};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                ">
                  📝
                </div>
                <div>
                  <div style="
                    font-size: 14px;
                    font-weight: 500;
                    color: ${isDark ? "#f3f4f6" : "#111827"};
                  ">
                    Delivery Note
                  </div>
                  <div style="
                    font-size: 12px;
                    color: ${isDark ? "#9ca3af" : "#6b7280"};
                  ">
                    ${order.deliveryNote}
                  </div>
                </div>
              </div>
            `
                : ""
            }
          </div>

          <!-- Accept Button -->
          <button 
            id="accept-batch-${order.id}" 
            style="
              width: 100%;
              margin-top: 20px;
              padding: 12px 16px;
              background: ${orderConfig.buttonColor};
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            "
            onmouseover="this.style.background='${
              orderConfig.buttonHover
            }'; this.style.transform='translateY(-1px)'"
            onmouseout="this.style.background='${
              orderConfig.buttonColor
            }'; this.style.transform='translateY(0)'"
          >
            <span>✓</span>
            Accept Batch
          </button>
        </div>
      </div>
    `;
  }
};

// Add CSS for dark theme popup styling
const addDarkThemePopupStyles = () => {
  const existingStyle = document.getElementById("leaflet-dark-popup-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement("style");
  style.id = "leaflet-dark-popup-styles";
  style.textContent = `
    /* Override Leaflet's default popup styles with maximum specificity */
    .leaflet-popup-content-wrapper,
    .leaflet-popup-content-wrapper.dark-theme-popup,
    .leaflet-popup-content-wrapper.dark-theme-popup:before,
    .leaflet-popup-content-wrapper.dark-theme-popup:after,
    div.leaflet-popup-content-wrapper,
    div.leaflet-popup-content-wrapper.dark-theme-popup {
      background: #1f2937 !important;
      color: #f3f4f6 !important;
      border: 1px solid #4b5563 !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3) !important;
    }
    
    .leaflet-popup-content,
    .leaflet-popup-content-wrapper.dark-theme-popup .leaflet-popup-content,
    .leaflet-popup-content-wrapper.dark-theme-popup .leaflet-popup-content *,
    div.leaflet-popup-content {
      background: transparent !important;
      color: #f3f4f6 !important;
      margin: 0 !important;
    }
    
    .leaflet-popup-tip,
    .leaflet-popup-tip.dark-theme-popup,
    .leaflet-popup-tip.dark-theme-popup:before,
    .leaflet-popup-tip.dark-theme-popup:after,
    div.leaflet-popup-tip,
    div.leaflet-popup-tip.dark-theme-popup {
      background: #1f2937 !important;
      border: 1px solid #4b5563 !important;
    }
    
    .leaflet-popup-close-button,
    .leaflet-popup-close-button.dark-theme-popup {
      color: #9ca3af !important;
      font-size: 18px !important;
      padding: 4px !important;
      background: transparent !important;
    }
    
    .leaflet-popup-close-button:hover,
    .leaflet-popup-close-button.dark-theme-popup:hover {
      color: #f3f4f6 !important;
      background: rgba(75, 85, 99, 0.3) !important;
    }

    /* Ensure all popup content inherits dark theme */
    .leaflet-popup-content-wrapper * {
      color: inherit !important;
    }
    
    /* Force button styling */
    .leaflet-popup-content button {
      background: #10b981 !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    
    .leaflet-popup-content button:hover {
      background: #059669 !important;
      transform: translateY(-1px) !important;
    }
  `;

  // Insert at the end to ensure it has higher priority
  document.head.appendChild(style);

  // Add additional global override for dark theme
  const globalStyle = document.createElement("style");
  globalStyle.id = "leaflet-global-dark-override";
  globalStyle.textContent = `
    /* Global dark theme override for all Leaflet popups when dark theme is active */
    body.dark .leaflet-popup-content-wrapper {
      background: #1f2937 !important;
      color: #f3f4f6 !important;
      border: 1px solid #4b5563 !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3) !important;
    }
    
    body.dark .leaflet-popup-content {
      background: transparent !important;
      color: #f3f4f6 !important;
    }
    
    body.dark .leaflet-popup-tip {
      background: #1f2937 !important;
      border: 1px solid #4b5563 !important;
    }
    
    body.dark .leaflet-popup-content button {
      background: #10b981 !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    
    body.dark .leaflet-popup-content button:hover {
      background: #059669 !important;
      transform: translateY(-1px) !important;
    }
  `;
  document.head.appendChild(globalStyle);
};

// Function to force apply dark theme styles to popup elements
const forceApplyDarkThemeStyles = (popupElement: HTMLElement) => {
  if (!popupElement) return;

  const wrapper = popupElement.closest(".leaflet-popup-content-wrapper");
  const tip = popupElement.closest(".leaflet-popup-tip");
  const closeButton = popupElement.querySelector(".leaflet-popup-close-button");
  const content = popupElement.querySelector(".leaflet-popup-content");

  // Apply to wrapper
  if (wrapper) {
    wrapper.classList.add("dark-theme-popup");
    const wrapperEl = wrapper as HTMLElement;
    wrapperEl.style.setProperty("background", "#1f2937", "important");
    wrapperEl.style.setProperty("color", "#f3f4f6", "important");
    wrapperEl.style.setProperty("border", "1px solid #4b5563", "important");
    wrapperEl.style.setProperty(
      "box-shadow",
      "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)",
      "important"
    );
  }

  // Apply to content
  if (content) {
    const contentEl = content as HTMLElement;
    contentEl.style.setProperty("background", "transparent", "important");
    contentEl.style.setProperty("color", "#f3f4f6", "important");
    contentEl.style.setProperty("margin", "0", "important");

    // Apply to all child elements
    const allElements = contentEl.querySelectorAll("*");
    allElements.forEach((el) => {
      const element = el as HTMLElement;
      if (!element.style.color || element.style.color === "rgb(51, 51, 51)") {
        element.style.setProperty("color", "#f3f4f6", "important");
      }
    });

    // Force button styling
    const buttons = contentEl.querySelectorAll("button");
    buttons.forEach((btn) => {
      const button = btn as HTMLElement;
      button.style.setProperty("background", "#10b981", "important");
      button.style.setProperty("color", "white", "important");
      button.style.setProperty("border", "none", "important");
      button.style.setProperty("border-radius", "8px", "important");
      button.style.setProperty("padding", "12px 16px", "important");
      button.style.setProperty("font-size", "14px", "important");
      button.style.setProperty("font-weight", "600", "important");
      button.style.setProperty("cursor", "pointer", "important");
      button.style.setProperty("transition", "all 0.2s ease", "important");
      button.style.setProperty("display", "flex", "important");
      button.style.setProperty("align-items", "center", "important");
      button.style.setProperty("justify-content", "center", "important");
      button.style.setProperty("gap", "8px", "important");
    });
  }

  // Apply to tip
  if (tip) {
    tip.classList.add("dark-theme-popup");
    const tipEl = tip as HTMLElement;
    tipEl.style.setProperty("background", "#1f2937", "important");
    tipEl.style.setProperty("border", "1px solid #4b5563", "important");
  }

  // Apply to close button
  if (closeButton) {
    closeButton.classList.add("dark-theme-popup");
    const closeBtn = closeButton as HTMLElement;
    closeBtn.style.setProperty("color", "#9ca3af", "important");
    closeBtn.style.setProperty("background", "transparent", "important");
  }
};

interface MapSectionProps {
  mapLoaded: boolean;
  availableOrders: Array<{
    id: string;
    shopName: string;
    shopAddress: string;
    customerAddress: string;
    distance: string;
    items: number;
    total: string;
    estimatedEarnings: string;
    createdAt: string;
    rawCreatedAt?: string; // Add raw ISO timestamp for filtering
    updatedAt?: string; // Add updatedAt for restaurant orders
    // Additional properties
    shopLatitude?: number;
    shopLongitude?: number;
    customerLatitude?: number;
    customerLongitude?: number;
    priorityLevel?: number;
    minutesAgo?: number;
    status?: string;
    // Add order type and reel-specific fields
    orderType?: "regular" | "reel" | "restaurant";
    shopper_id?: string | null; // null = unassigned
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
  }>;
  isInitializing?: boolean;
  isExpanded?: boolean;
}

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

// Shop data type
interface Shop {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  logo?: string | null;
}

// Restaurant data type
interface Restaurant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  lat?: string;
  long?: string;
  profile?: string;
  verified?: boolean;
  created_at: string;
}

// Pending order data type
interface PendingOrder {
  id: string;
  status: string;
  shop_id: string;
  customer_id: string;
  latitude: number;
  longitude: number;
  earnings: number;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  createdAt: string;
  itemsCount: number;
  addressStreet: string;
  addressCity: string;
}

export default function MapSection({
  mapLoaded,
  availableOrders,
  isInitializing = false,
  isExpanded = false,
}: MapSectionProps) {
  const { theme } = useTheme();
  const { isConnected } = useWebSocket();
  const [realTimeAgedOrders, setRealTimeAgedOrders] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const shopMarkersRef = useRef<L.Marker[]>([]);
  const orderMarkersRef = useRef<L.Marker[]>([]);
  const locationErrorCountRef = useRef<number>(0);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isActivelyTracking, setIsActivelyTracking] = useState(false);
  const activeToastTypesRef = useRef<Set<string>>(new Set());
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderMarkers, setOrderMarkers] = useState<L.Marker[]>([]);
  const [shopMarkers, setShopMarkers] = useState<L.Marker[]>([]);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [locationErrorCount, setLocationErrorCount] = useState(0);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(
    null
  );
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<
    Array<{
      lat: number;
      lng: number;
      timestamp: Date;
      accuracy: number;
    }>
  >([]);

  // Refs
  const mapInitializedRef = useRef(false);
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const locationUpdateCountRef = useRef(0);
  const lastAccuracyRef = useRef<number | null>(null);
  const locationHistoryRef = useRef<
    Array<{
      lat: number;
      lng: number;
      timestamp: Date;
      accuracy: number;
    }>
  >([]);

  // Cookie monitoring refs
  const cookieSnapshotRef = useRef<string>("");

  // Filter aged unassigned orders (30+ minutes old, shopper_id is null)
  const filterAgedUnassignedOrders = (
    orders: MapSectionProps["availableOrders"]
  ) => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const filtered = orders.filter((order) => {
      // For restaurant orders, check updated_at; for others, check created_at
      let referenceTimestamp;
      if (order.orderType === "restaurant") {
        // Restaurant orders are aged based on updated_at, not created_at
        const updatedAt = (order as any).updatedAt;
        referenceTimestamp =
          updatedAt && updatedAt !== "null" && updatedAt !== ""
            ? updatedAt
            : order.createdAt;
      } else {
        // Regular and reel orders are aged based on created_at (use raw timestamp)
        referenceTimestamp = (order as any).rawCreatedAt || order.createdAt;
      }

      const orderTimestamp = new Date(referenceTimestamp);

      // Check if the date is valid
      if (isNaN(orderTimestamp.getTime())) {
        console.error(
          `❌ Invalid timestamp for order ${order.id}:`,
          referenceTimestamp
        );
        return false; // Skip orders with invalid timestamps
      }

      const isAged = orderTimestamp <= thirtyMinutesAgo;

      // Check if order is unassigned (shopper_id is null)
      const isUnassigned = !order.shopper_id || order.shopper_id === null;

      const shouldInclude = isAged && isUnassigned;

      return shouldInclude;
    });

    return filtered;
  };

  // Use the filtered orders
  const agedUnassignedOrders = useMemo(() => {
    return filterAgedUnassignedOrders(availableOrders || []);
  }, [availableOrders]);

  // Combine props orders with real-time aged orders
  const allAgedOrders = useMemo(() => {
    return [...agedUnassignedOrders, ...realTimeAgedOrders];
  }, [agedUnassignedOrders, realTimeAgedOrders]);

  // Listen for WebSocket events
  useEffect(() => {
    const handleWebSocketNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { order } = customEvent.detail;
      // Check if order is aged and unassigned
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const orderCreatedAt = new Date(order.createdAt);
      const isAged = orderCreatedAt <= thirtyMinutesAgo;
      const isUnassigned = !order.shopper_id || order.shopper_id === null;

      if (isAged && isUnassigned) {
        setRealTimeAgedOrders((prev) => [...prev, order]);
      }
    };

    const handleWebSocketOrderExpired = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { orderId } = customEvent.detail;
      setRealTimeAgedOrders((prev) =>
        prev.filter((order) => order.id !== orderId)
      );
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
  }, []);

  // Map style URLs using free OpenStreetMap tiles
  const mapStyles = {
    light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  };

  // Function to update map style based on theme
  const updateMapStyle = () => {
    setMapStyle(theme === "dark" ? "dark-v11" : "streets-v12");
  };

  // Get cookies helper function
  const getCookies = () => {
    const cookies: Record<string, string> = {};
    document.cookie.split("; ").forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  };

  // Monitor cookies effect
  useEffect(() => {
    const currentCookies = getCookies();
    const cookieSnapshot = JSON.stringify(currentCookies);
    cookieSnapshotRef.current = cookieSnapshot;

    const checkCookies = () => {
      const newCookies = getCookies();
      const newSnapshot = JSON.stringify(newCookies);

      // If cookies changed
      if (newSnapshot !== cookieSnapshotRef.current) {
        // Log the change
        logger.info("Cookie state changed", "MapSection", {
          previous: JSON.parse(cookieSnapshotRef.current),
          current: newCookies,
          timestamp: new Date().toISOString(),
        });

        // Update snapshot
        cookieSnapshotRef.current = newSnapshot;
      }
    };

    // Check every 2 minutes
    const interval = setInterval(checkCookies, 120000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Add theme effect
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      updateMapStyle();
    }
  }, [theme, mapLoaded]);

  // Modify saveLocationToCookies to include logging
  const saveLocationToCookies = (lat: number, lng: number) => {
    const previousCookies = getCookies();

    document.cookie = `user_latitude=${lat}; path=/; max-age=86400`; // 24 hours
    document.cookie = `user_longitude=${lng}; path=/; max-age=86400`;

    // Log the location update
    logger.info("Location cookies updated", "MapSection", {
      previous: {
        latitude: previousCookies["user_latitude"],
        longitude: previousCookies["user_longitude"],
      },
      current: {
        latitude: lat,
        longitude: lng,
      },
      timestamp: new Date().toISOString(),
    });
  };

  // Function that reduces duplicate toast notifications
  const reduceToastDuplicates = (
    toastType: string,
    content: React.ReactNode,
    options: any = {}
  ) => {
    // Skip if we already have this type of toast active
    if (activeToastTypesRef.current.has(toastType)) {
      return;
    }

    // Add to active toasts
    activeToastTypesRef.current.add(toastType);

    // Show toast and clean up when closed
    return toaster.push(content, {
      ...options,
      onClose: () => {
        // Remove from active toast types
        activeToastTypesRef.current.delete(toastType);

        // Call original onClose if provided
        if (options.onClose) {
          options.onClose();
        }
      },
    });
  };

  // Helper function to check if map is ready for interaction
  const isMapReady = (map: L.Map): boolean => {
    try {
      return (
        !!map &&
        typeof map.setView === "function" &&
        !!map.getContainer() &&
        !!(map as any)._loaded
      );
    } catch (error) {
      console.error("Error checking map readiness:", error);
      return false;
    }
  };

  // Standardize the marker safety function
  const safeAddMarker = (
    marker: L.Marker,
    map: L.Map,
    name: string
  ): boolean => {
    try {
      // Extra validation to prevent appendChild errors
      if (!map) {
        console.warn(`Map is undefined when adding marker for ${name}`);
        return false;
      }

      // Check if the map container exists and is in the DOM
      const container = map.getContainer();
      if (!container) {
        console.warn(
          `Map container is undefined when adding marker for ${name}`
        );
        return false;
      }

      // Check if container is actually in the DOM
      if (!document.body.contains(container)) {
        console.warn(
          `Map container is not in DOM when adding marker for ${name}`
        );
        return false;
      }

      // Verify map is properly initialized
      if (!(map as any)._loaded) {
        console.warn(`Map not fully loaded when adding marker for ${name}`);
        return false;
      }

      // If all checks pass, add the marker
      marker.addTo(map);
      return true;
    } catch (error) {
      console.error(`Error safely adding marker for ${name}:`, error);
      return false;
    }
  };

  // Helper function to display location troubleshooting guidance
  const showLocationTroubleshootingGuide = () => {
    reduceToastDuplicates(
      "location-troubleshooting",
      <Message
        showIcon
        type="info"
        header="Location Troubleshooting"
        className={theme === "dark" ? "rs-message-dark" : ""}
      >
        <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
          <p>Try the following steps to fix location issues:</p>
          <ol className="mt-1 list-decimal pl-4">
            <li>Make sure you&#39;re outdoors or near a window</li>
            <li>
              Check that location services are enabled in your device settings
            </li>
            <li>Ensure your browser has permission to access your location</li>
            <li>Try using a different browser or device</li>
          </ol>
        </div>
      </Message>,
      { placement: "topEnd", duration: 10000 }
    );
  };

  // Function to get single location from browser
  const getSingleLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  // Helper function to start location tracking
  const startLocationTracking = () => {
    // Clear any existing watch first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (navigator.geolocation) {
      // Reset the error counter
      locationErrorCountRef.current = 0;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reset error counter on success
          locationErrorCountRef.current = 0;

          // Save to cookies
          saveLocationToCookies(latitude, longitude);

          // Update marker position and recenter map
          if (userMarkerRef.current && mapInstanceRef.current) {
            try {
              userMarkerRef.current.setLatLng([latitude, longitude]);

              // Check if map is fully initialized using our helper
              if (isMapReady(mapInstanceRef.current)) {
                mapInstanceRef.current.setView(
                  [latitude, longitude],
                  mapInstanceRef.current.getZoom()
                );
              }
            } catch (error) {
              console.error("Error updating map position:", error);
            }
          }
        },
        (error) => {
          console.error("Error watching location:", error);

          // Increment the error counter
          locationErrorCountRef.current += 1;

          // Handle different error cases
          if (error.code === 1) {
            // Permission denied
            reduceToastDuplicates(
              "location-permission-denied",
              <Message
                showIcon
                type="error"
                header="Location Permission"
                className={theme === "dark" ? "rs-message-dark" : ""}
              >
                Location tracking was denied. Please enable location access.
              </Message>,
              { placement: "topEnd", duration: 5000 }
            );

            // Automatically stop tracking if permission denied
            setIsActivelyTracking(false);
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
          } else if (error.code === 2) {
            // Position unavailable
            reduceToastDuplicates(
              "location-unavailable",
              <Message
                showIcon
                type="warning"
                header="Location Unavailable"
                className={theme === "dark" ? "rs-message-dark" : ""}
              >
                Your location is currently unavailable. Using your last saved
                position.
              </Message>,
              { placement: "topEnd", duration: 5000 }
            );

            // If we've had multiple failures, show the troubleshooting guide
            if (locationErrorCountRef.current >= 3) {
              showLocationTroubleshootingGuide();

              // After persistent failures, suggest turning off tracking
              if (locationErrorCountRef.current >= 5) {
                reduceToastDuplicates(
                  "tracking-issues",
                  <Message
                    showIcon
                    type="info"
                    header="Active Tracking Issue"
                    className={theme === "dark" ? "rs-message-dark" : ""}
                  >
                    <div>
                      <p>
                        Automatic location tracking is not working well. Would
                        you like to disable it?
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setIsActivelyTracking(false);
                            if (watchIdRef.current !== null) {
                              navigator.geolocation.clearWatch(
                                watchIdRef.current
                              );
                              watchIdRef.current = null;
                            }

                            reduceToastDuplicates(
                              "tracking-disabled",
                              <Message
                                showIcon
                                type="success"
                                header="Tracking Disabled"
                                className={
                                  theme === "dark" ? "rs-message-dark" : ""
                                }
                              >
                                Using static location. Use the refresh button to
                                update manually.
                              </Message>,
                              { placement: "topEnd", duration: 3000 }
                            );
                          }}
                          className={`rounded px-3 py-1 text-sm text-white ${
                            theme === "dark"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          Disable Tracking
                        </button>
                        <button
                          onClick={() => {
                            // Just close the notification
                          }}
                          className={`rounded px-3 py-1 text-sm text-white ${
                            theme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          Keep Trying
                        </button>
                      </div>
                    </div>
                  </Message>,
                  { placement: "topEnd", duration: 10000 }
                );
              }
            }
          } else if (error.code === 3) {
            // Timeout
            reduceToastDuplicates(
              "location-timeout",
              <Message
                showIcon
                type="warning"
                header="Location Timeout"
                className={theme === "dark" ? "rs-message-dark" : ""}
              >
                Location request timed out. Will retry automatically.
              </Message>,
              { placement: "topEnd", duration: 3000 }
            );
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );

      setIsActivelyTracking(true);
    } else {
      reduceToastDuplicates(
        "geolocation-not-supported",
        <Message showIcon type="error" header="Not Supported">
          Geolocation is not supported by your browser.
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
      setIsActivelyTracking(false);
    }
  };

  // Helper function to create popup content using the new HTML generator
  const createOrderPopupContent = (order: any, isPending: boolean = false) => {
    return createPopupHTML(order, theme, isPending);
  };

  // Helper function to attach the accept order handler to markers
  const attachAcceptHandler = (
    marker: L.Marker,
    orderId: string,
    map: L.Map,
    orderType: "regular" | "reel" | "restaurant" = "regular"
  ) => {
    marker.on("popupopen", () => {
      const btn = document.getElementById(
        `accept-batch-${orderId}`
      ) as HTMLButtonElement | null;

      if (btn) {
        btn.addEventListener("click", () => {
          // Show loading state on button
          btn.disabled = true;
          // Change button to green and show spinner
          btn.style.background = orderType === "reel" ? "#8b5cf6" : "#10b981";
          btn.innerHTML =
            '<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>Assigning...';
          // Toast assigning
          reduceToastDuplicates(
            "order-assigning",
            <Message showIcon type="info" header="Assigning">
              Assigning order...
            </Message>,
            { placement: "topEnd" }
          );

          fetch("/api/shopper/assignOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              orderType: orderType,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              // Check if there's a wallet error
              if (data.error === "no_wallet") {
                // Show toast with create wallet button
                reduceToastDuplicates(
                  "no-wallet",
                  <Message showIcon type="warning" header="Wallet Required">
                    <div>
                      <p>You need a wallet to accept batches.</p>
                      <div className="mt-2">
                        <Button
                          appearance="primary"
                          size="sm"
                          onClick={() => {
                            fetch("/api/queries/createWallet", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            })
                              .then((res) => res.json())
                              .then((data) => {
                                if (data.success) {
                                  reduceToastDuplicates(
                                    "wallet-created",
                                    <Message
                                      showIcon
                                      type="success"
                                      header="Wallet Created"
                                    >
                                      Your wallet has been created successfully.
                                    </Message>,
                                    { placement: "topEnd" }
                                  );

                                  // Try accepting the batch again after wallet creation
                                  setTimeout(() => {
                                    fetch("/api/shopper/assignOrder", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        orderId: orderId,
                                        orderType: orderType,
                                      }),
                                    })
                                      .then((res) => res.json())
                                      .then((data) => {
                                        if (data.success) {
                                          // Success toast
                                          reduceToastDuplicates(
                                            "order-assigned",
                                            <Message
                                              showIcon
                                              type="success"
                                              header="Assigned"
                                            >
                                              Order assigned!
                                            </Message>,
                                            { placement: "topEnd" }
                                          );
                                          // Remove marker and update state
                                          map.removeLayer(marker);
                                          setPendingOrders((prev) =>
                                            prev.filter((o) => o.id !== orderId)
                                          );
                                        } else {
                                          // Error toast
                                          reduceToastDuplicates(
                                            "order-assign-failed",
                                            <Message
                                              showIcon
                                              type="error"
                                              header="Error"
                                            >
                                              Failed to assign:{" "}
                                              {data.error || "Unknown error"}
                                            </Message>,
                                            { placement: "topEnd" }
                                          );
                                          btn.disabled = false;
                                          btn.style.background =
                                            orderType === "reel"
                                              ? "#8b5cf6"
                                              : "#3b82f6";
                                          btn.innerHTML = "Accept Batch";
                                        }
                                      })
                                      .catch((err) => {
                                        console.error("Assign failed:", err);
                                        reduceToastDuplicates(
                                          "order-assign-failed",
                                          <Message
                                            showIcon
                                            type="error"
                                            header="Error"
                                          >
                                            Failed to assign.
                                          </Message>,
                                          { placement: "topEnd" }
                                        );
                                        btn.disabled = false;
                                        btn.style.background =
                                          orderType === "reel"
                                            ? "#8b5cf6"
                                            : "#3b82f6";
                                        btn.innerHTML = "Accept Batch";
                                      });
                                  }, 1000); // Small delay to let the wallet creation complete
                                } else {
                                  reduceToastDuplicates(
                                    "wallet-creation-failed",
                                    <Message
                                      showIcon
                                      type="error"
                                      header="Error"
                                    >
                                      Failed to create wallet.
                                    </Message>,
                                    { placement: "topEnd" }
                                  );
                                }
                              })
                              .catch((err) => {
                                console.error("Wallet creation failed:", err);
                                reduceToastDuplicates(
                                  "wallet-creation-failed",
                                  <Message showIcon type="error" header="Error">
                                    Failed to create wallet.
                                  </Message>,
                                  { placement: "topEnd" }
                                );
                              });
                          }}
                        >
                          Create Wallet
                        </Button>
                      </div>
                    </div>
                  </Message>,
                  { placement: "topEnd", duration: 10000 }
                );

                // Reset button
                btn.disabled = false;
                btn.style.background =
                  orderType === "reel" ? "#8b5cf6" : "#3b82f6";
                btn.innerHTML = "Accept Batch";
                return;
              }

              // Success toast
              reduceToastDuplicates(
                "order-assigned",
                <Message showIcon type="success" header="Assigned">
                  Order assigned!
                </Message>,
                { placement: "topEnd" }
              );
              // Remove marker and update state
              map.removeLayer(marker);
              setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
            })
            .catch((err) => {
              console.error("Assign failed:", err);
              reduceToastDuplicates(
                "order-assign-failed",
                <Message showIcon type="error" header="Error">
                  Failed to assign.
                </Message>,
                { placement: "topEnd" }
              );
              btn.disabled = false;
              btn.style.background =
                orderType === "reel" ? "#8b5cf6" : "#3b82f6";
              btn.innerHTML = "Accept Batch";
            });
        });
      }
    });
  };

  // Helper function to format earnings amount
  const formatEarningsDisplay = (amount: string) => {
    // Remove currency symbol and commas, then parse as number
    const value = parseFloat(amount.replace(/[^0-9.]/g, ""));

    if (isNaN(value)) return amount;

    if (value >= 1000) {
      // Format to one decimal place for thousands, no currency
      return `${(value / 1000).toFixed(1)}k`;
    }

    // For hundreds, just return the number without currency
    return Math.round(value).toString();
  };

  // Helper function to calculate offset for clustered markers
  const calculateMarkerOffset = (
    index: number,
    total: number,
    baseRadius: number = 30
  ) => {
    if (total === 1) return { lat: 0, lng: 0 };

    // Calculate angle for even distribution in a circle
    const angle = (2 * Math.PI * index) / total;

    // Calculate offset using trigonometry
    return {
      lat: (baseRadius / 111111) * Math.cos(angle), // Convert meters to degrees (roughly)
      lng: (baseRadius / 111111) * Math.sin(angle), // 111111 meters = 1 degree at equator
    };
  };

  // Helper function to group markers by location
  const groupMarkersByLocation = (
    orders: MapSectionProps["availableOrders"]
  ) => {
    const groups = new Map<string, Array<typeof orders[0]>>();

    orders.forEach((order) => {
      if (!order.shopLatitude || !order.shopLongitude) return;

      // Create a key with reduced precision to group nearby points
      const key = `${order.shopLatitude.toFixed(
        4
      )},${order.shopLongitude.toFixed(4)}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(order);
    });

    return groups;
  };

  // Helper function to create consistent marker icon
  const createOrderMarkerIcon = (
    earnings: string,
    orderType: "regular" | "reel" | "restaurant" = "regular"
  ) => {
    const simplifiedEarnings = formatEarningsDisplay(earnings);
    const bgColor =
      orderType === "reel"
        ? theme === "dark"
          ? "#7c3aed"
          : "#8b5cf6"
        : orderType === "restaurant"
        ? theme === "dark"
          ? "#ea580c"
          : "#f97316"
        : theme === "dark"
        ? "#065f46"
        : "#10b981";
    const borderColor =
      orderType === "reel"
        ? theme === "dark"
          ? "#6d28d9"
          : "#7c3aed"
        : orderType === "restaurant"
        ? theme === "dark"
          ? "#c2410c"
          : "#ea580c"
        : theme === "dark"
        ? "#047857"
        : "#059669";

    return L.divIcon({
      html: `
        <div style="
          background: ${bgColor};
          border: 2px solid ${borderColor};
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 4px ${
            theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)"
          };
          z-index: 1000;
        ">
          ${simplifiedEarnings}
        </div>`,
      className: "",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };

  // Helper function to create shop marker icon
  const createShopMarkerIcon = (
    isActive: boolean,
    shopName?: string | null
  ) => {
    return L.divIcon({
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 800;
          color: ${
            isActive
              ? theme === "dark"
                ? "#ffffff"
                : "#1f2937"
              : theme === "dark"
              ? "#9ca3af"
              : "#6b7280"
          };
          opacity: 1;
          text-shadow: 
            0 0 4px ${
              theme === "dark" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)"
            },
            0 0 8px ${
              theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"
            },
            0 2px 4px ${
              theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)"
            };
        ">
          <span style="
            font-size: 18px; 
            filter: drop-shadow(0 0 4px ${
              theme === "dark" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)"
            });
            display: inline-block;
            margin-right: 4px;
          ">🛒</span>
          <span style="text-shadow: inherit; font-weight: 800;">${
            shopName || "Shop"
          }</span>
        </div>
      `,
      className: "",
      iconSize: [0, 0], // No fixed size, let content determine size
      iconAnchor: [0, 0],
    });
  };

  // Helper function to create restaurant marker icon
  const createRestaurantMarkerIcon = (
    isVerified: boolean,
    restaurantName?: string | null
  ) => {
    return L.divIcon({
      html: `
      <div style="
          display: flex;
          align-items: center;
          gap: 6px;
      font-size: 14px;
          font-weight: 800;
          color: ${
            isVerified
              ? theme === "dark"
                ? "#ffffff"
                : "#1f2937"
              : theme === "dark"
              ? "#9ca3af"
              : "#6b7280"
          };
          opacity: 1;
          text-shadow: 
            0 0 4px ${
              theme === "dark" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)"
            },
            0 0 8px ${
              theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"
            },
            0 2px 4px ${
              theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)"
            };
        ">
          <span style="
            font-size: 18px; 
            filter: drop-shadow(0 0 4px ${
              theme === "dark" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)"
            });
            display: inline-block;
            margin-right: 4px;
          ">🍽️</span>
          <span style="text-shadow: inherit; font-weight: 800;">${
            restaurantName || "Restaurant"
          }</span>
        </div>
      `,
      className: "",
      iconSize: [0, 0], // No fixed size, let content determine size
      iconAnchor: [0, 0],
    });
  };

  // Helper function to render a pending order marker
  const renderPendingOrderMarker = (order: PendingOrder, map: L.Map) => {
    try {
      const lat = order.shopLat;
      const lng = order.shopLng;

      const marker = L.marker([lat, lng], {
        icon: createOrderMarkerIcon(
          formatCurrencySync(order.earnings),
          "regular"
        ),
        zIndexOffset: 1000,
      });

      if (safeAddMarker(marker, map, `pending order ${order.id}`)) {
        marker.bindPopup(createOrderPopupContent(order, false), {
          maxWidth: 300,
          className: `${
            theme === "dark" ? "dark-theme-popup" : "light-theme-popup"
          }`,
          closeButton: true,
          closeOnClick: false,
        });
        attachAcceptHandler(marker, order.id, map, "regular"); // Pass "regular" for pending orders
      }
    } catch (error) {
      console.error(
        `Error rendering pending order marker for ${order.id}:`,
        error
      );
    }
  };

  // Add getCurrentPosition function
  const getCurrentPosition = async () => {
    setIsRefreshingLocation(true);
    try {
      const position = await getSingleLocation();
      const { latitude, longitude } = position.coords;

      // Save to cookies
      saveLocationToCookies(latitude, longitude);

      // Update marker position and recenter map
      if (userMarkerRef.current && mapInstanceRef.current) {
        userMarkerRef.current.setLatLng([latitude, longitude]);
        userMarkerRef.current.addTo(mapInstanceRef.current);
        mapInstanceRef.current.setView([latitude, longitude], 16);
      }

      setIsOnline(true);
      locationErrorCountRef.current = 0;
    } catch (error) {
      console.error("Error getting current position:", error);
      locationErrorCountRef.current += 1;

      if (locationErrorCountRef.current >= 3) {
        showLocationTroubleshootingGuide();
      }

      reduceToastDuplicates(
        "location-error",
        <Message
          showIcon
          type="error"
          header="Location Error"
          className={theme === "dark" ? "rs-message-dark" : ""}
        >
          Could not get your location. Please check your settings.
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  // Add refreshLocation function
  const refreshLocation = async () => {
    if (isRefreshingLocation) return;
    await getCurrentPosition();
  };

  const handleGoLive = () => {
    if (!isOnline) {
      // Going online - get current location from cookies or geolocation
      setIsRefreshingLocation(true);

      // Check if we have location saved in cookies
      const cookieMap = getCookies();

      if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
        // Use saved location first
        const lat = parseFloat(cookieMap["user_latitude"]);
        const lng = parseFloat(cookieMap["user_longitude"]);

        try {
          if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
            userMarkerRef.current.addTo(mapInstanceRef.current);
            mapInstanceRef.current.setView([lat, lng], 16);
          }

          setIsOnline(true);
          setIsRefreshingLocation(false);

          // Ask user if they want to enable active tracking
          reduceToastDuplicates(
            "saved-location-prompt",
            <Message
              showIcon
              type="info"
              header="Using Saved Location"
              closable
              className={theme === "dark" ? "rs-message-dark" : ""}
            >
              <div>
                <p>
                  Using your saved location. Would you like to enable active
                  tracking?
                </p>
                <div className="mt-2 flex space-x-2">
                  <Button
                    appearance="primary"
                    size="sm"
                    onClick={() => {
                      setIsActivelyTracking(true);
                      startLocationTracking();
                    }}
                    className={theme === "dark" ? "rs-btn-dark" : ""}
                  >
                    Enable Tracking
                  </Button>
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => {
                      setIsActivelyTracking(false);
                      reduceToastDuplicates(
                        "static-location-info",
                        <Message
                          showIcon
                          type="info"
                          header="Static Location"
                          className={theme === "dark" ? "rs-message-dark" : ""}
                        >
                          Using static location. Use the refresh button to
                          update.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    }}
                    className={theme === "dark" ? "rs-btn-dark" : ""}
                  >
                    Stay Static
                  </Button>
                </div>
              </div>
            </Message>,
            { placement: "topEnd", duration: 10000 }
          );
        } catch (error) {
          console.error("Error setting position from cookies:", error);
          // Fall back to geolocation
          void getCurrentPosition();
        }
      } else {
        // No cookies, get current position
        void getCurrentPosition();
      }
    } else {
      // Going offline - clear watch and cookies
      setIsOnline(false);
      setIsActivelyTracking(false);

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Clear user location cookies
      document.cookie =
        "user_latitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_longitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      reduceToastDuplicates(
        "going-offline",
        <Message showIcon type="info" header="Offline">
          Your location is now hidden. You are offline.
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
    }
  };

  useEffect(() => {
    // Check cookies on mount to set online status
    const cookieMap = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
      setIsOnline(true);
    }
  }, []);

  useEffect(() => {
    // Start or stop continuous location tracking based on online status
    if (isOnline) {
      // Check if we already have location cookies
      const cookieMap = getCookies();

      // If cookies exist, use them first
      if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
        const lat = parseFloat(cookieMap["user_latitude"]);
        const lng = parseFloat(cookieMap["user_longitude"]);

        try {
          // Update marker position from cookies
          if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
            userMarkerRef.current.addTo(mapInstanceRef.current);

            if (
              typeof mapInstanceRef.current.setView === "function" &&
              mapInstanceRef.current.getContainer() &&
              (mapInstanceRef.current as any)._loaded
            ) {
              mapInstanceRef.current.setView([lat, lng], 16);
            }
          }
        } catch (error) {
          console.error("Error setting position from cookies:", error);
        }
      }

      // Only start tracking if actively tracking is enabled
      if (isActivelyTracking) {
        startLocationTracking();
      }
    } else {
      // Stop tracking when going offline
      if (watchIdRef.current !== null) {
        console.log("Stopping location tracking");
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Remove the user marker from the map when offline
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Reset active tracking state
      setIsActivelyTracking(false);

      // Reset map view when offline
      if (
        mapInstanceRef.current &&
        typeof mapInstanceRef.current.setView === "function" &&
        mapInstanceRef.current.getContainer() &&
        (mapInstanceRef.current as any)._loaded
      ) {
        try {
          mapInstanceRef.current.setView([-1.9706, 30.1044], 14);
        } catch (error) {
          console.error("Error resetting map view:", error);
        }
      } else {
        console.warn("Map not ready for resetting view");
      }
    }

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOnline, isActivelyTracking]); // Added isActivelyTracking dependency

  useEffect(() => {
    // Listen for dashboard toggle event
    const onToggle = () => handleGoLive();
    window.addEventListener("toggleGoLive", onToggle);
    return () => window.removeEventListener("toggleGoLive", onToggle);
  }, [handleGoLive]);

  // Add dark theme popup styles on mount
  useEffect(() => {
    addDarkThemePopupStyles();

    // Add a global observer to catch any popups created dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const popupWrapper = element.querySelector?.(
              ".leaflet-popup-content-wrapper"
            );
            if (popupWrapper && theme === "dark") {
              setTimeout(() => {
                forceApplyDarkThemeStyles(popupWrapper as HTMLElement);
              }, 10);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [theme]);

  // Main map initialization effect
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    let mapInstance: L.Map | null = null;

    // Wait for next frame to ensure DOM is ready
    const timer = requestAnimationFrame(() => {
      try {
        // Cleanup existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Create new map instance with type assertion and null check
        if (mapRef.current) {
          mapInstance = L.map(mapRef.current as HTMLElement, {
            center: [-1.9706, 30.1044],
            zoom: 14,
            minZoom: 3,
            maxZoom: 19,
            scrollWheelZoom: true,
            attributionControl: false,
          });

          // Store map instance
          mapInstanceRef.current = mapInstance;

          // Add initial tile layer with proper subdomain configuration
          L.tileLayer(mapStyles[theme], {
            maxZoom: 19,
            minZoom: 3,
            attribution:
              theme === "dark"
                ? '&copy; <a href="https://carto.com/">CARTO</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains:
              theme === "dark" ? ["a", "b", "c", "d"] : ["a", "b", "c"],
          }).addTo(mapInstance);
        }

        // Initialize user marker with improved dark theme styling
        const userIconHtml = `
      <div style="
            background: ${theme === "dark" ? "#1f2937" : "white"};
            border: 2px solid ${theme === "dark" ? "#60a5fa" : "#3b82f6"};
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
            box-shadow: 0 2px 4px ${
              theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"
            };
      ">
        <span style="font-size: 16px;">👤</span>
      </div>
    `;

        const userIcon = L.divIcon({
          html: userIconHtml,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        userMarkerRef.current = L.marker([-1.9706, 30.1044], {
          icon: userIcon,
        });

        // Check for saved location in cookies
        const cookieMap = getCookies();
        if (cookieMap["user_latitude"] && cookieMap["user_longitude"]) {
          const lat = parseFloat(cookieMap["user_latitude"]);
          const lng = parseFloat(cookieMap["user_longitude"]);

          if (!isNaN(lat) && !isNaN(lng)) {
            if (userMarkerRef.current && mapInstance) {
              userMarkerRef.current.setLatLng([lat, lng]);
              if (isOnline) {
                userMarkerRef.current.addTo(mapInstance);
                mapInstance.setView([lat, lng], 16);
              }
            }
          }
        }

        // Wait for next frame before initializing markers
        requestAnimationFrame(() => {
          if (mapInstance && mapInstance.getContainer()) {
            initMapSequence(mapInstance);
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    });

    // Cleanup function
    return () => {
      cancelAnimationFrame(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, theme]);

  // Re-render map when aged orders change (only when online)
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded && isOnline) {
      // Clear existing order markers
      clearOrderMarkers();

      // Re-initialize map sequence with updated orders
      initMapSequence(mapInstanceRef.current);
    }
  }, [allAgedOrders, mapLoaded, isOnline]);

  // Re-render map when going online/offline to show/hide order markers
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      // Clear existing order markers when going offline
      if (!isOnline) {
        clearOrderMarkers();
      } else {
        // Re-initialize map sequence when going online
        initMapSequence(mapInstanceRef.current);
      }
    }
  }, [isOnline, mapLoaded]);

  // Function to initialize map sequence
  const initMapSequence = async (map: L.Map) => {
    if (!map || !map.getContainer()) return;

    try {
      // Load all data in parallel
      const [shopsResponse, restaurantsResponse, pendingOrdersResponse] =
        await Promise.all([
          fetch("/api/shopper/shops"),
          fetch("/api/queries/restaurants"),
          isOnline
            ? fetch("/api/shopper/pendingOrders")
            : Promise.resolve({ json: () => [] }),
        ]);

      const [shops, restaurantsData, pendingOrders] = await Promise.all([
        shopsResponse.json() as Promise<Shop[]>,
        restaurantsResponse.json() as Promise<{ restaurants: Restaurant[] }>,
        pendingOrdersResponse.json() as Promise<PendingOrder[]>,
      ]);

      const restaurants = restaurantsData.restaurants || [];

      // Process shops (always visible regardless of online status)
      setShops(shops);
      if (map && map.getContainer()) {
        shops.forEach((shop: Shop) => {
          try {
            const lat = parseFloat(shop.latitude);
            const lng = parseFloat(shop.longitude);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Invalid coordinates for shop ${shop.name}`);
              return;
            }

            if (map && map.getContainer()) {
              const marker = L.marker([lat, lng], {
                icon: createShopMarkerIcon(shop.is_active, shop.name),
                zIndexOffset: 500,
              });

              if (safeAddMarker(marker, map, `shop ${shop.name}`)) {
                const popup = marker.bindPopup(
                  `<div style="
                    background: ${theme === "dark" ? "#1f2937" : "#fff"}; 
                    color: ${theme === "dark" ? "#e5e7eb" : "#111827"};
                      padding: 8px;
                      border-radius: 8px;
                      min-width: 150px;
                      text-align: center;
                    ">
                      <strong>${shop.name}</strong>
                    ${
                      !shop.is_active
                        ? '<br><span style="color: #ef4444;">(Disabled)</span>'
                        : ""
                    }
                    </div>`,
                  {
                    offset: [0, -10],
                    className:
                      theme === "dark"
                        ? "dark-theme-popup"
                        : "light-theme-popup",
                  }
                );

                // Apply dark theme class to popup wrapper for shop popups
                marker.on("popupopen", () => {
                  if (marker) {
                    const popup = marker.getPopup();
                    if (popup) {
                      const popupElement = popup.getElement();
                      if (popupElement && theme === "dark") {
                        // Use setTimeout to ensure DOM is ready
                        setTimeout(() => {
                          forceApplyDarkThemeStyles(popupElement);
                        }, 10);
                      }
                    }
                  }
                });
              }
            }
          } catch (error) {
            console.error(`Error adding shop marker for ${shop.name}:`, error);
          }
        });
      }

      // Process restaurants (always visible regardless of online status)
      setRestaurants(restaurants);
      if (map && map.getContainer()) {
        restaurants.forEach((restaurant: Restaurant) => {
          try {
            if (!restaurant.lat || !restaurant.long) {
              console.warn(
                `Missing coordinates for restaurant ${restaurant.name}`
              );
              return;
            }

            const lat = parseFloat(restaurant.lat);
            const lng = parseFloat(restaurant.long);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(
                `Invalid coordinates for restaurant ${restaurant.name}`
              );
              return;
            }

            if (map && map.getContainer()) {
              const marker = L.marker([lat, lng], {
                icon: createRestaurantMarkerIcon(
                  restaurant.verified || false,
                  restaurant.name
                ),
                zIndexOffset: 400,
              });

              if (safeAddMarker(marker, map, `restaurant ${restaurant.name}`)) {
                const popup = marker.bindPopup(
                  `<div style="
                          background: ${theme === "dark" ? "#1f2937" : "#fff"}; 
                          color: ${theme === "dark" ? "#e5e7eb" : "#111827"};
                            padding: 8px;
                            border-radius: 8px;
                            min-width: 150px;
                            text-align: center;
                          ">
                            <strong>🍽️ ${restaurant.name}</strong>
                          ${
                            restaurant.verified
                              ? '<br><span style="color: #10b981;">✓ Verified</span>'
                              : '<br><span style="color: #6b7280;">Unverified</span>'
                          }
                          ${
                            restaurant.location
                              ? `<br><span style="color: #6b7280; font-size: 12px;">${restaurant.location}</span>`
                              : ""
                          }
                          </div>`,
                  {
                    offset: [0, -10],
                    className:
                      theme === "dark"
                        ? "dark-theme-popup"
                        : "light-theme-popup",
                  }
                );

                // Apply dark theme class to popup wrapper for restaurant popups
                marker.on("popupopen", () => {
                  if (marker) {
                    const popup = marker.getPopup();
                    if (popup) {
                      const popupElement = popup.getElement();
                      if (popupElement && theme === "dark") {
                        // Use setTimeout to ensure DOM is ready
                        setTimeout(() => {
                          forceApplyDarkThemeStyles(popupElement);
                        }, 10);
                      }
                    }
                  }
                });
              }
            }
          } catch (error) {
            console.error(
              `Error adding restaurant marker for ${restaurant.name}:`,
              error
            );
          }
        });
      }

      // Process pending orders with grouping
      if (isOnline && map && map.getContainer()) {
        // Group pending orders by location
        const groupedPendingOrders = new Map<string, PendingOrder[]>();
        pendingOrders.forEach((order) => {
          if (!order.shopLat || !order.shopLng) return;
          const key = `${order.shopLat.toFixed(5)},${order.shopLng.toFixed(5)}`;
          if (!groupedPendingOrders.has(key)) {
            groupedPendingOrders.set(key, []);
          }
          groupedPendingOrders.get(key)?.push(order);
        });

        // Log grouped orders information
        logger.info("Pending orders grouped by location", "MapSection", {
          totalOrders: pendingOrders.length,
          groupCount: groupedPendingOrders.size,
          groupSizes: Array.from(groupedPendingOrders.entries()).map(
            ([key, orders]) => ({
              location: key,
              orderCount: orders.length,
              orderIds: orders.map((o) => o.id),
            })
          ),
        });

        // Process each group of orders
        groupedPendingOrders.forEach((orders, locationKey) => {
          const [baseLat, baseLng] = locationKey.split(",").map(Number);

          orders.forEach((order, index) => {
            try {
              // Calculate offset based on position in group
              const offset = calculateMarkerOffset(index, orders.length);
              const adjustedLat = baseLat + offset.lat;
              const adjustedLng = baseLng + offset.lng;

              const marker = L.marker([adjustedLat, adjustedLng], {
                icon: createOrderMarkerIcon(
                  formatCurrencySync(order.earnings),
                  "regular"
                ),
                zIndexOffset: 1000 + index,
              });

              if (safeAddMarker(marker, map, `pending order ${order.id}`)) {
                const popup = marker.bindPopup(
                  createOrderPopupContent(order, true),
                  {
                    maxWidth: 300,
                    className: `${
                      theme === "dark"
                        ? "dark-theme-popup"
                        : "light-theme-popup"
                    }`,
                    closeButton: true,
                    closeOnClick: false,
                  }
                );

                // Apply dark theme class to popup wrapper
                marker.on("popupopen", () => {
                  if (marker) {
                    const popup = marker.getPopup();
                    if (popup) {
                      const popupElement = popup.getElement();
                      if (popupElement && theme === "dark") {
                        // Use setTimeout to ensure DOM is ready
                        setTimeout(() => {
                          forceApplyDarkThemeStyles(popupElement);
                        }, 10);
                      }
                    }
                  }
                });

                attachAcceptHandler(marker, order.id, map, "regular"); // Pass "regular" for pending orders
              }
            } catch (error) {
              logger.error(
                "Error rendering pending order marker",
                "MapSection",
                {
                  orderId: order.id,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                  location: locationKey,
                  groupSize: orders.length,
                  indexInGroup: index,
                }
              );
            }
          });
        });
      }

      // Process aged unassigned orders with grouping
      if (isOnline && allAgedOrders?.length > 0 && map && map.getContainer()) {
        // Group aged orders by location
        const groupedAgedOrders = new Map<string, typeof allAgedOrders>();
        allAgedOrders.forEach((order) => {
          if (!order.shopLatitude || !order.shopLongitude) {
            return;
          }
          const key = `${order.shopLatitude.toFixed(
            5
          )},${order.shopLongitude.toFixed(5)}`;
          if (!groupedAgedOrders.has(key)) {
            groupedAgedOrders.set(key, []);
          }
          groupedAgedOrders.get(key)?.push(order);
        });

        // Log grouped orders information
        logger.info(
          "Aged unassigned orders grouped by location",
          "MapSection",
          {
            totalOrders: allAgedOrders.length,
            groupCount: groupedAgedOrders.size,
            groupSizes: Array.from(groupedAgedOrders.entries()).map(
              ([key, orders]) => ({
                location: key,
                orderCount: orders.length,
                orderIds: orders.map((o) => o.id),
              })
            ),
          }
        );

        // Process each group of orders
        groupedAgedOrders.forEach((orders, locationKey) => {
          const [baseLat, baseLng] = locationKey.split(",").map(Number);

          orders.forEach((order, index) => {
            try {
              // Calculate offset based on position in group
              const offset = calculateMarkerOffset(index, orders.length);
              const adjustedLat = baseLat + offset.lat;
              const adjustedLng = baseLng + offset.lng;

              const marker = L.marker([adjustedLat, adjustedLng], {
                icon: createOrderMarkerIcon(
                  order.estimatedEarnings || order.earnings || "0",
                  order.orderType
                ),
                zIndexOffset: 1000 + index,
              });

              if (safeAddMarker(marker, map, `order ${order.id}`)) {
                const popup = marker.bindPopup(
                  createOrderPopupContent(order, false),
                  {
                    maxWidth: 300,
                    className: `${
                      theme === "dark"
                        ? "dark-theme-popup"
                        : "light-theme-popup"
                    }`,
                    closeButton: true,
                    closeOnClick: false,
                  }
                );

                // Apply dark theme class to popup wrapper
                marker.on("popupopen", () => {
                  if (marker) {
                    const popup = marker.getPopup();
                    if (popup) {
                      const popupElement = popup.getElement();
                      if (popupElement && theme === "dark") {
                        // Use setTimeout to ensure DOM is ready
                        setTimeout(() => {
                          forceApplyDarkThemeStyles(popupElement);
                        }, 10);
                      }
                    }
                  }
                });

                attachAcceptHandler(marker, order.id, map, order.orderType); // Pass orderType for available orders
                orderMarkersRef.current.push(marker);
              }
            } catch (error) {
              logger.error(
                "Error rendering available order marker",
                "MapSection",
                {
                  orderId: order.id,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                  location: locationKey,
                  groupSize: orders.length,
                  indexInGroup: index,
                }
              );
            }
          });
        });
      }
    } catch (error) {
      console.error("Error in map sequence:", error);
    }
  };

  // Update useEffect to fetch today's completed earnings
  useEffect(() => {
    const fetchTodayCompletedEarnings = async () => {
      setLoadingEarnings(true);
      try {
        const response = await fetch("/api/shopper/todayCompletedEarnings");
        if (!response.ok) {
          throw new Error("Failed to fetch earnings data");
        }

        const data = await response.json();
        if (data && data.success && data.data) {
          setDailyEarnings(data.data.totalEarnings);
          setCompletedOrdersCount(data.data.orderCount);
        } else {
          console.warn("Earnings data incomplete or invalid:", data);
          setDailyEarnings(0);
          setCompletedOrdersCount(0);
        }
      } catch (error) {
        console.error("Error fetching daily earnings:", error);
        setDailyEarnings(0);
        setCompletedOrdersCount(0);
      } finally {
        setLoadingEarnings(false);
      }
    };

    fetchTodayCompletedEarnings();
    // Refresh earnings every 5 minutes
    const interval = setInterval(fetchTodayCompletedEarnings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to clear order markers
  const clearOrderMarkers = () => {
    orderMarkersRef.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    orderMarkersRef.current = [];
  };

  // Helper function to clear shop markers
  const clearShopMarkers = () => {
    shopMarkersRef.current.forEach((marker) => {
      if (marker) marker.remove();
    });
    shopMarkersRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOrderMarkers();
      clearShopMarkers();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
    };
  }, []);

  // If the dashboard is initializing, show a simpler loading state
  if (isInitializing) {
    return (
      <div className="relative w-full">
        <div
          ref={mapRef}
          className={`h-[calc(100vh-4rem-5.5rem)] overflow-hidden rounded-lg md:h-[600px] ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-100"
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <Loader size="lg" content="Initializing..." />
        </div>
      </div>
    );
  }

  // Show map loading state when map is not ready but dashboard is initialized
  if (!mapLoaded) {
    return (
      <div
        className={`flex h-[300px] w-full items-center justify-center md:h-[400px] ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <Loader
          size="lg"
          content="Loading map..."
          className={theme === "dark" ? "rs-loader-dark" : ""}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Daily Earnings Badge */}
      {!isExpanded && (
        <div
          className={`absolute left-1/2 top-4 z-[1001] -translate-x-1/2 transform rounded-full px-4 py-2 shadow-lg ${
            theme === "dark"
              ? "bg-gray-800 bg-opacity-90 text-white backdrop-blur-lg"
              : "bg-white bg-opacity-90 text-gray-900 backdrop-blur-lg"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-5 w-5 ${
                theme === "dark" ? "text-green-400" : "text-green-500"
              }`}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Today&apos;s earnings
                </span>
                {loadingEarnings ? (
                  <div
                    className={`h-4 w-6 animate-pulse rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                ) : (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      theme === "dark"
                        ? "bg-green-900/30 text-green-300"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {completedOrdersCount}
                  </span>
                )}
              </div>
              {loadingEarnings ? (
                <div
                  className={`h-6 w-20 animate-pulse rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
              ) : (
                <span
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: getCurrencySymbol(),
                    maximumFractionDigits: 0,
                  }).format(dailyEarnings)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className={`h-[calc(100vh-4rem-5.5rem)] overflow-hidden rounded-lg md:h-[600px] ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      />
      {!mapLoaded && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            theme === "dark" ? "bg-gray-900/90" : "bg-gray-100/90"
          }`}
        >
          <Loader
            size="lg"
            content="Loading map..."
            className={theme === "dark" ? "rs-loader-dark" : ""}
          />
        </div>
      )}

      {mapLoaded && (
        <>
          <button
            onClick={handleGoLive}
            className={`absolute bottom-5 left-1/2 z-[1000] hidden w-[90%] -translate-x-1/2 transform rounded-xl px-6 py-3 font-bold shadow-lg backdrop-blur-lg transition-all duration-200 hover:shadow-xl active:scale-95 md:block md:w-auto ${
              isOnline
                ? theme === "dark"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30 hover:shadow-red-500/40"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30 hover:shadow-red-500/40"
                : theme === "dark"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/40"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/40"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Go Offline
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Start Plasa
                </>
              )}
            </span>
          </button>

          {/* Add tracking mode indicator */}
          {isOnline && (
            <div
              className={`absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 transform rounded-xl px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-lg transition-all duration-200 ${
                theme === "dark"
                  ? "border border-gray-700/50 bg-gray-800/90 text-gray-100"
                  : "border border-gray-200/50 bg-white/90 text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${
                      isActivelyTracking
                        ? theme === "dark"
                          ? "animate-pulse bg-green-400"
                          : "animate-pulse bg-green-500"
                        : theme === "dark"
                        ? "bg-blue-400"
                        : "bg-blue-500"
                    }`}
                  ></span>
                  <span className="font-semibold">
                    {isActivelyTracking ? "Live Tracking" : "Static Location"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (isActivelyTracking) {
                      // Disable tracking
                      setIsActivelyTracking(false);
                      if (watchIdRef.current !== null) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                      }
                      reduceToastDuplicates(
                        "tracking-disabled",
                        <Message
                          showIcon
                          type="info"
                          header="Tracking Disabled"
                          className={theme === "dark" ? "rs-message-dark" : ""}
                        >
                          Using static location. Use the refresh button to
                          update.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    } else {
                      // Enable tracking
                      startLocationTracking();
                      reduceToastDuplicates(
                        "tracking-enabled",
                        <Message
                          showIcon
                          type="success"
                          header="Tracking Enabled"
                          className={theme === "dark" ? "rs-message-dark" : ""}
                        >
                          Your location will update automatically as you move.
                        </Message>,
                        { placement: "topEnd", duration: 3000 }
                      );
                    }
                  }}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
                    isActivelyTracking
                      ? theme === "dark"
                        ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                      : theme === "dark"
                      ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {isActivelyTracking ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          )}

          {/* Add refresh location button - visible on both mobile and desktop */}
          {isOnline && !isExpanded && (
            <button
              onClick={refreshLocation}
              disabled={isRefreshingLocation}
              className={`absolute bottom-24 right-5 z-[1001] h-12 w-12 rounded-xl shadow-lg backdrop-blur-lg transition-all duration-200 hover:shadow-xl active:scale-95 md:bottom-5 md:h-10 md:w-10 ${
                theme === "dark"
                  ? isRefreshingLocation
                    ? "bg-gradient-to-r from-blue-700 to-blue-800 text-gray-300 shadow-blue-700/30"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/40"
                  : isRefreshingLocation
                  ? "bg-gradient-to-r from-blue-300 to-blue-400 text-white shadow-blue-300/30"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/40"
              }`}
              title="Refresh location"
            >
              <div className="flex h-full w-full items-center justify-center p-2">
                {isRefreshingLocation ? (
                  <span
                    className={`inline-block h-full w-full animate-spin rounded-full border-2 ${
                      theme === "dark"
                        ? "border-gray-300 border-t-transparent"
                        : "border-white border-t-transparent"
                    }`}
                  ></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 4v6h6M23 20v-6h-6"
                    />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </>
      )}
    </div>
  );
}
