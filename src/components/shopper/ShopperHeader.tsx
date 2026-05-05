"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "rsuite/dist/rsuite.min.css";
import { useRouter } from "next/router";
import { useTheme } from "@context/ThemeContext";
import { Avatar, Button } from "rsuite";
import { useSession } from "next-auth/react";
import { useShopperProfile } from "../../hooks/useShopperProfile";
import TelegramStatusButton from "./TelegramStatusButton";
import NotificationCenter from "./NotificationCenter";
import { toast } from "react-hot-toast";

export default function ShopperHeader() {
  const { data: session } = useSession();
  const {
    profileImage,
    displayName,
    isLoading: isProfileLoading,
  } = useShopperProfile();
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
      <header className="bg-[var(--bg-primary)]/80 sticky top-0 z-[100] flex w-full items-center justify-between border-b border-transparent px-4 py-3 backdrop-blur-2xl transition-all duration-300 dark:border-white/5">
        {/* Logo Section - Mobile */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logos/plas.png"
              alt="Plas Logo"
              width={80}
              height={30}
              className={`h-8 w-auto ${theme === "dark" ? "brightness-0 invert" : ""
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
                document.cookie =
                  "user_latitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie =
                  "user_longitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                setIsOnline(false);
              } else {
                if (navigator.geolocation) {
                  try {
                    const position = await new Promise<GeolocationPosition>(
                      (resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                          resolve,
                          reject,
                          {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0,
                          }
                        );
                      }
                    );
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.cookie = `user_latitude=${lat}; path=/; max-age=86400; SameSite=Lax`;
                    document.cookie = `user_longitude=${lng}; path=/; max-age=86400; SameSite=Lax`;
                    setIsOnline(true);
                  } catch (error) {
                    console.error("Error getting location:", error);
                    toast.error(
                      "Could not get your location. Please check your settings."
                    );
                  }
                } else {
                  console.error("Geolocation is not supported");
                }
              }
              window.dispatchEvent(new Event("toggleGoLive"));
            }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:shadow-lg active:scale-90 ${isOnline
                ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                : "bg-green-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              }`}
            title={isOnline ? "Go Offline" : "Go Online"}
          >
            {isOnline && (
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />
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
    <header className="bg-[var(--bg-primary)]/80 sticky top-0 z-[100] flex items-center justify-between border-b border-transparent px-6 py-4 shadow-sm backdrop-blur-2xl transition-all duration-300 dark:border-white/5">
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/logos/PlasLogo.svg"
            alt="Plas Logo"
            width={120}
            height={40}
            className={`ml-8 h-8 w-auto ${theme === "dark" ? "brightness-0 invert" : ""
              }`}
            priority
          />
        </Link>
      </div>

      {/* Search Section */}
      <div className="mx-8 max-w-md flex-1">
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-4 w-4 text-[var(--text-secondary)] transition-colors group-focus-within:text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search orders, products..."
            className="block w-full rounded-2xl border border-transparent bg-[var(--bg-secondary)] py-2.5 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:border-white/5"
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
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all duration-300 hover:text-[var(--text-primary)] hover:shadow-md active:scale-90"
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"></circle>
                <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M4 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M22 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <path
                  d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center">
          <Avatar
            src={profileImage || undefined}
            alt={displayName}
            circle
            size="sm"
            className={`cursor-pointer border border-transparent ring-2 ring-emerald-500/10 transition-all duration-300 hover:border-emerald-500 ${isProfileLoading ? "animate-pulse opacity-50" : ""
              }`}
          >
            {displayName ? displayName[0].toUpperCase() : "U"}
          </Avatar>
        </div>
      </div>
    </header>
  );
}
