"use client";
import React, { useState, useEffect } from "react";
import ShopperHeader from "@components/shopper/ShopperHeader";
import ShopperSidebar from "@components/shopper/ShopperSidebar";
import NotificationSystem from "@components/shopper/NotificationSystem";
import { useSession } from "next-auth/react";
import { useTheme } from "@context/ThemeContext";
import { logger } from "../../utils/logger";

interface ShopperLayoutProps {
  children: React.ReactNode;
}

export default function ShopperLayout({ children }: ShopperLayoutProps) {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Check location cookies and update online status
  useEffect(() => {
    const checkLocationCookies = () => {
      const cookies = document.cookie
        .split("; ")
        .reduce((acc: Record<string, string>, cur) => {
          const [k, v] = cur.split("=");
          acc[k] = v;
          return acc;
        }, {} as Record<string, string>);

      return Boolean(cookies["user_latitude"] && cookies["user_longitude"]);
    };

    const updateOnlineStatus = () => {
      const hasLocationCookies = checkLocationCookies();
      setIsOnline(hasLocationCookies);
    };

    updateOnlineStatus();
    const handleCustomEvent = () => setTimeout(updateOnlineStatus, 300);
    window.addEventListener("toggleGoLive", handleCustomEvent);
    const intervalId = setInterval(updateOnlineStatus, 5000);

    return () => {
      window.removeEventListener("toggleGoLive", handleCustomEvent);
      clearInterval(intervalId);
    };
  }, []);

  // Handle location detection
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

  useEffect(() => {
    if (session) {
      logger.debug("Session data", "ShopperLayout", {
        user: session.user,
        expires: session.expires,
      });
    }
  }, [session]);

  // Handle new order notification - refresh the current page or navigate to dashboard
  const handleNewOrder = () => {
    // If we're on the dashboard, we can trigger a refresh
    // For other pages, we could navigate to dashboard or show a notification
    if (typeof window !== "undefined") {
      // Dispatch a custom event that pages can listen to
      window.dispatchEvent(new CustomEvent("newOrderAvailable"));

      // Optionally navigate to dashboard if not already there
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/Plasa") ||
        currentPath.includes("/active-batches")
      ) {
        // Already on dashboard or active batches, just refresh
        window.location.reload();
      } else {
        // Navigate to dashboard to see new orders
        window.location.href = "/Plasa/active-batches";
      }
    }
  };

  // session contains user: { id, name, email, phone, gender, address }
  // status is 'authenticated' | 'loading' | 'unauthenticated'
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <ShopperHeader />
      <div className="flex">
        <ShopperSidebar />
        <main
          className={`relative flex-1 transition-colors duration-200 ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-gray-50 text-gray-900"
          } ${isMobile ? "p-0 pb-24" : "p-4 pl-64"}`}
        >
          <div className="relative z-0">{children}</div>
        </main>
      </div>

      {/* NotificationSystem works across all Plasa pages */}
      <NotificationSystem
        currentLocation={isOnline ? currentLocation : null}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
