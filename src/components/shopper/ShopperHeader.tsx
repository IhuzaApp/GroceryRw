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
        <div className="flex items-center gap-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Power button - Icon only */}
          <button
            onClick={() => window.dispatchEvent(new Event("toggleGoLive"))}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
              isOnline
                ? theme === "dark"
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                : theme === "dark"
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
            }`}
            title={isOnline ? "Go Offline" : "Go Online"}
          >
            {/* Status indicator ring */}
            {isOnline && (
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20" />
            )}

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
