"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "rsuite/dist/rsuite.min.css";
import { useRouter } from "next/router";
import { useTheme } from "@context/ThemeContext";
import { Button } from "rsuite";
import TelegramStatusButton from "./TelegramStatusButton";
import NotificationCenter from "./NotificationCenter";
export default function ShopperHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();
  const pathname = router.pathname;
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

  if (isMobile) {
    return (
      <header
        className="sticky top-0 z-[100] flex items-center justify-between border-b border-transparent dark:border-white/5 px-4 py-3 bg-[var(--bg-primary)]/80 backdrop-blur-2xl transition-all duration-300 w-full"
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
              onClick={async () => {
                if (isOnline) {
                  document.cookie = "user_latitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  document.cookie = "user_longitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  setIsOnline(false);
                } else {
                  if (navigator.geolocation) {
                    try {
                      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
                      });
                      const lat = position.coords.latitude;
                      const lng = position.coords.longitude;
                      document.cookie = `user_latitude=${lat}; path=/; max-age=86400; SameSite=Lax`;
                      document.cookie = `user_longitude=${lng}; path=/; max-age=86400; SameSite=Lax`;
                      setIsOnline(true);
                    } catch (error) {
                      console.error("Error getting location:", error);
                      toast.error("Could not get your location. Please check your settings.");
                    }
                  } else {
                    console.error("Geolocation is not supported");
                  }
                }
                window.dispatchEvent(new Event("toggleGoLive"));
              }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-90 hover:shadow-lg ${
                isOnline
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                  : "bg-green-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              }`}
              title={isOnline ? "Go Offline" : "Go Online"}
            >
              {isOnline && <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />}

            {/* Power icon - standard power symbol */}
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
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-[100] flex items-center justify-between border-b border-transparent dark:border-white/5 px-6 py-4 bg-[var(--bg-primary)]/80 backdrop-blur-2xl transition-all duration-300 shadow-sm"
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
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-4 w-4 text-[var(--text-secondary)] transition-colors group-focus-within:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search orders, products..."
            className="block w-full rounded-2xl py-2.5 pl-11 pr-4 text-sm bg-[var(--bg-secondary)] border border-transparent dark:border-white/5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
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
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-90 hover:shadow-md"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-yellow-500">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-indigo-500">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
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
