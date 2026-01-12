"use client";
import React, { useState, useEffect } from "react";
import ShopperHeader from "@components/shopper/ShopperHeader";
import ShopperSidebar from "@components/shopper/ShopperSidebar";
import NotificationSystem from "@components/shopper/NotificationSystem";
import FCMStatusIndicator from "@components/shopper/FCMStatusIndicator";
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

  // Handle accept batch - assign order to shopper
  const handleAcceptBatch = async (orderId: string) => {
    try {
      logger.info("Accepting batch", "ShopperLayout", { orderId });

      // First, try to determine if it's a regular batch or reel batch
      // We'll try regular batch first, and if it fails, try reel batch
      let orderType = "regular";
      let response = await fetch("/api/shopper/assignOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          orderType: orderType,
        }),
      });

      let data = await response.json();

      // If regular batch assignment fails, try reel batch
      if (!data.success && data.error !== "no_wallet") {
        logger.info(
          "Regular batch assignment failed, trying reel batch",
          "ShopperLayout",
          { orderId }
        );
        orderType = "reel";
        response = await fetch("/api/shopper/assignOrder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            orderType: orderType,
          }),
        });
        data = await response.json();
      }

      if (data.success) {
        logger.info("Order assigned successfully", "ShopperLayout", {
          orderId,
        });

        // Show success notification
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("orderAssigned", {
              detail: { orderId, success: true },
            })
          );
        }

        // Navigate to the order details page
        window.location.href = `/Plasa/active-batches/batch/${orderId}`;
      } else if (data.error === "no_wallet") {
        logger.warn("No wallet found for shopper", "ShopperLayout");

        // Try to create wallet automatically
        try {
          const walletResponse = await fetch("/api/queries/createWallet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const walletData = await walletResponse.json();

          if (walletData.success) {
            logger.info(
              "Wallet created successfully, retrying order assignment",
              "ShopperLayout"
            );

            // Retry the order assignment
            const retryResponse = await fetch("/api/shopper/assignOrder", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderId,
                orderType: "regular",
              }),
            });

            const retryData = await retryResponse.json();

            if (retryData.success) {
              logger.info(
                "Order assigned successfully after wallet creation",
                "ShopperLayout",
                { orderId }
              );
              window.location.href = `/Plasa/active-batches/batch/${orderId}`;
            } else {
              logger.error(
                "Failed to assign order after wallet creation",
                "ShopperLayout",
                { error: retryData.error }
              );
            }
          } else {
            logger.error("Failed to create wallet", "ShopperLayout", {
              error: walletData.error,
            });
          }
        } catch (walletError) {
          logger.error("Error creating wallet", "ShopperLayout", walletError);
        }
      } else {
        logger.error("Failed to assign order", "ShopperLayout", {
          error: data.error,
        });
      }
    } catch (error) {
      logger.error("Error accepting batch", "ShopperLayout", error);
    }
  };

  // session contains user: { id, name, email, phone, gender, address }
  // status is 'authenticated' | 'loading' | 'unauthenticated'
  return (
    <div
      className={`h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <ShopperHeader />
      <div className="flex h-full">
        <ShopperSidebar />
        <main
          className={`relative flex-1 transition-colors duration-200 ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-gray-50 text-gray-900"
          } ${isMobile ? "p-3 pb-24" : "p-4 pl-64"}`}
        >
          <div className="relative z-0 h-full">{children}</div>
        </main>
      </div>

      {/* NotificationSystem works across all Plasa pages */}
      <NotificationSystem
        currentLocation={isOnline ? currentLocation : null}
        onNewOrder={handleNewOrder}
        onAcceptBatch={handleAcceptBatch}
      />

      {/* FCM Status Indicator (only shows in development) */}
      <FCMStatusIndicator />
    </div>
  );
}
