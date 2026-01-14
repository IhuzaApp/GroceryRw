"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "rsuite/dist/rsuite.min.css";
import { usePathname } from "next/navigation";
import { useTheme } from "@context/ThemeContext";
import { Button } from "rsuite";
import TelegramStatusButton from "./TelegramStatusButton";
import NotificationCenter from "./NotificationCenter";
import toast from "react-hot-toast";
export default function ShopperHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

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

  // Handle online/offline toggle
  const handleToggleOnline = async () => {
    if (isTogglingOnline) return; // Prevent multiple clicks
    
    setIsTogglingOnline(true);
    
    try {
      if (isOnline) {
        // Go offline: Clear location cookies
        document.cookie = "user_latitude=; path=/; max-age=0";
        document.cookie = "user_longitude=; path=/; max-age=0";
        setIsOnline(false);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("toggleGoLive"));
        
        toast.success("You're now offline. You won't receive new order notifications.", {
          icon: "🔴",
          duration: 3000,
        });
        
        console.log("🔴 Shopper went offline");
      } else {
        // Go online: Get location and set cookies
        if (navigator.geolocation) {
          const loadingToast = toast.loading("Getting your location...");
          
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              });
            });

            const { latitude, longitude } = position.coords;
            
            // Set location cookies (1 hour expiry)
            const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
            document.cookie = `user_latitude=${latitude}; path=/; expires=${expires}`;
            document.cookie = `user_longitude=${longitude}; path=/; expires=${expires}`;
            
            setIsOnline(true);
            
            // Dispatch event to notify other components
            window.dispatchEvent(new Event("toggleGoLive"));
            
            toast.dismiss(loadingToast);
            toast.success("You're now online! You'll receive order notifications.", {
              icon: "🟢",
              duration: 3000,
            });
            
            console.log("🟢 Shopper went online", { latitude, longitude });
          } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error getting location:", error);
            toast.error("Please enable location access to go online and receive orders.", {
              duration: 5000,
            });
          }
        } else {
          toast.error("Geolocation is not supported by your browser. Please use a modern browser to go online.", {
            duration: 5000,
          });
        }
      }
    } finally {
      setIsTogglingOnline(false);
    }
  };

  if (isMobile) {
    return (
      <header
        className={`sticky top-0 z-[100] flex items-center justify-between border-b px-4 py-3 ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* Logo Section - Mobile */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logos/PlasLogo.svg"
              alt="Plas Logo"
              width={80}
              height={30}
              className={`h-8 w-auto ${
                theme === "dark" ? "brightness-0 invert" : ""
              }`}
            />
          </Link>
        </div>

        {/* Right actions - Mobile */}
        <div className="flex items-center gap-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Power button - Icon only */}
          <button
            onClick={handleToggleOnline}
            disabled={isTogglingOnline}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
              isTogglingOnline
                ? theme === "dark"
                  ? "cursor-wait bg-gray-500/20 text-gray-400"
                  : "cursor-wait bg-gray-500/10 text-gray-600"
                : isOnline
                ? theme === "dark"
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                : theme === "dark"
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
            }`}
            title={isTogglingOnline ? "Processing..." : isOnline ? "Go Offline (Stop Receiving Orders)" : "Go Online (Start Receiving Orders)"}
          >
            {/* Status indicator ring */}
            {isOnline && !isTogglingOnline && (
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20" />
            )}

            {/* Loading spinner or Power icon */}
            {isTogglingOnline ? (
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                />
              </svg>
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-[100] flex items-center justify-between border-b px-6 py-4 ${
        theme === "dark"
          ? "border-gray-800 bg-gray-900"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/logos/PlasLogo.svg"
            alt="Plas Logo"
            width={120}
            height={40}
            className={`ml-8 h-8 w-auto ${
              theme === "dark" ? "brightness-0 invert" : ""
            }`}
            priority
          />
        </Link>
      </div>

      {/* Search Section */}
      <div className="mx-8 max-w-md flex-1">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search orders, products..."
            className={`block w-full rounded-lg border py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 md:flex">
          <NotificationCenter />
          <TelegramStatusButton
            variant="primary"
            size="md"
            className="bg-blue-500 text-white hover:bg-blue-600"
          />
          <Button
            appearance="subtle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center rounded-md px-3 py-2"
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-yellow-500"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-gray-600"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </Button>
        </div>
        <div className="flex items-center">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <Image
              src="/placeholder.svg"
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
