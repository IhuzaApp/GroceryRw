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

export default function ShopperHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
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
        <div className="flex items-center gap-2">
          {/* Status indicator dot */}
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isOnline ? "animate-pulse bg-green-500" : "bg-gray-400"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />

          {/* Toggle button */}
          <button
            onClick={() => window.dispatchEvent(new Event("toggleGoLive"))}
            className={`relative overflow-hidden rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 active:scale-95 ${
              isOnline
                ? theme === "dark"
                  ? "border border-red-400/20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40"
                  : "border border-red-400/20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40"
                : theme === "dark"
                ? "border border-green-400/20 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/40"
                : "border border-green-400/20 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/40"
            }`}
          >
            {/* Background glow effect */}
            <div
              className={`absolute inset-0 rounded-xl blur-sm ${
                isOnline ? "bg-red-500/20" : "bg-green-500/20"
              }`}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Go Offline
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Go Online
                </>
              )}
            </span>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-500 hover:translate-x-full hover:opacity-100" />

            {/* Ripple effect on tap */}
            <div className="absolute inset-0 scale-0 rounded-xl bg-white/20 transition-transform duration-200 active:scale-100" />
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
