"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { formatCompactCurrency } from "../../lib/formatCurrency";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { useTheme } from "../../context/ThemeContext";
import { logger } from "../../utils/logger";
import TelegramStatusButton from "./TelegramStatusButton";
import { authenticatedFetch } from "@lib/authenticatedFetch";

// Define interface for earnings response
interface EarningsResponse {
  success: boolean;
  earnings: {
    active: number;
    completed: number;
    total: number;
  };
  orderCounts: {
    active: number;
    completed: number;
    total: number;
  };
}

export default function ShopperSidebar() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const pathname = usePathname();
  const { toggleRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (path: string) =>
    pathname ? pathname === path || pathname.startsWith(`${path}/`) : false;

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(path, undefined, { shallow: true });
  };

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch today's earnings
  useEffect(() => {
    const fetchDailyEarnings = async () => {
      setLoadingEarnings(true);
      try {
        const response = await authenticatedFetch("/api/shopper/dailyEarnings");
        if (!response.ok) {
          throw new Error("Failed to fetch earnings data");
        }

        const data: EarningsResponse = await response.json();

        if (
          data &&
          data.success &&
          data.earnings &&
          typeof data.earnings.total === "number"
        ) {
          setDailyEarnings(data.earnings.total);
        } else {
          logger.warn(
            "Earnings data incomplete or invalid",
            "ShopperSidebar",
            data
          );
          setDailyEarnings(0);
        }
      } catch (error) {
        logger.error("Error fetching daily earnings", "ShopperSidebar", error);
        setDailyEarnings(0);
      } finally {
        setLoadingEarnings(false);
      }
    };

    fetchDailyEarnings();
    const interval = setInterval(fetchDailyEarnings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchToCustomer = async () => {
    setIsSwitchingRole(true);
    try {
      await initiateRoleSwitch("user");
      toggleRole();
      toast.success("Switched to customer mode");
    } catch (error) {
      logger.error("Error switching role", "ShopperSidebar", error);
      toast.error("Failed to switch to customer mode");
      setIsSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Use custom logout API to avoid redirect loops
      const response = await authenticatedFetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Clear client-side storage
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to home page
        window.location.href = "/";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      logger.error("Error signing out", "ShopperSidebar", error);
      toast.error("Failed to sign out");
    }
  };

  const getNavLinkClasses = (path: string, additionalCheck = true): string => {
    const isPathActive = isActive(path) && additionalCheck;
    return `flex flex-col items-center justify-center py-3 px-2 text-xs font-medium rounded-xl transition-all duration-200 ${
      isPathActive
        ? theme === "dark"
          ? "text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/25"
          : "text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25"
        : theme === "dark"
        ? "text-gray-400 hover:text-white hover:bg-gray-800"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    }`;
  };

  const getIconClasses = (path: string, additionalCheck = true): string => {
    const isPathActive = isActive(path) && additionalCheck;
    return `mb-1 h-6 w-6 transition-all duration-200 ${
      isPathActive && theme === "dark"
        ? "text-white"
        : isPathActive
        ? "text-white"
        : theme === "dark"
        ? "text-gray-400"
        : "text-gray-500"
    }`;
  };

  // Navigation items configuration
  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
      condition:
        !isActive("/Plasa/active-batches") &&
        !isActive("/Plasa/Earnings") &&
        !isActive("/Plasa/Settings") &&
        !isActive("/Plasa/ShopperProfile") &&
        !isActive("/Plasa/invoices"),
    },
    {
      path: "/Plasa/active-batches",
      label: "Active",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 12l2 2 4-4" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" />
          <path d="M16 3.13a4 4 0 011.45 1.45" />
        </svg>
      ),
    },
    {
      path: "/Plasa/ShopperProfile",
      label: "Profile",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      path: "/Plasa/invoices",
      label: "Invoices",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      ),
    },
    {
      path: "#",
      label: "More",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      ),
      onClick: () => setShowMoreMenu(!showMoreMenu),
    },
  ];

  const moreMenuItems = [
    {
      path: "/Plasa/Earnings",
      label: (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <span>Earnings</span>
          </div>
          <div className="flex items-center">
            {loadingEarnings ? (
              <div className="h-5 w-12 animate-pulse rounded bg-gray-200"></div>
            ) : (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {formatCompactCurrency(dailyEarnings)}
              </span>
            )}
          </div>
        </div>
      ),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      path: "/Plasa/Settings",
      label: "Settings",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      path: "/switch-to-customer",
      label: "Switch to Customer",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M20 8v6M23 11h-6" />
        </svg>
      ),
      onClick: handleSwitchToCustomer,
    },
    {
      path: "/toggle-theme",
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon:
        theme === "dark" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ),
      onClick: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setShowMoreMenu(false);
      },
    },
    {
      path: "/logout",
      label: "Logout",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
      onClick: () => {
        handleLogout();
        setShowMoreMenu(false);
      },
    },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r md:block ${
          theme === "dark"
            ? "border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 shadow-2xl"
            : "border-gray-200 bg-gradient-to-b from-white to-gray-50 text-gray-900 shadow-xl"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link href="/" passHref>
                <div
                  className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive("/") &&
                    !isActive("/Plasa/active-batches") &&
                    !isActive("/Plasa/Earnings") &&
                    !isActive("/Plasa/Settings")
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className={`mr-3 rounded-md p-1.5 ${
                    isActive("/") &&
                    !isActive("/Plasa/active-batches") &&
                    !isActive("/Plasa/Earnings") &&
                    !isActive("/Plasa/Settings")
                      ? "bg-white/20"
                      : theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  </div>
                  <span className="font-medium">Available batches</span>
                </div>
              </Link>
              <Link href="/Plasa/active-batches" passHref>
                <div
                  className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive("/Plasa/active-batches")
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className={`mr-3 rounded-md p-1.5 ${
                    isActive("/Plasa/active-batches")
                      ? "bg-white/20"
                      : theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M12 11h4" />
                      <path d="M12 16h4" />
                      <path d="M8 11h.01" />
                      <path d="M8 16h.01" />
                  </svg>
                  </div>
                  <span className="font-medium">Active batches</span>
                </div>
              </Link>
              <Link href="/Plasa/Earnings" passHref>
                <div
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive("/Plasa/Earnings")
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/25"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 rounded-md p-1.5 ${
                      isActive("/Plasa/Earnings")
                        ? "bg-white/20"
                        : theme === "dark"
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path d="M12 1v6l3-3m-6 3l3 3" />
                        <path d="M12 8v13" />
                        <path d="M20 12h2l-2 2-2-2" />
                        <path d="M4 12H2l2-2 2 2" />
                        <path d="M12 20l2-2-2-2" />
                        <path d="M12 4l2 2-2 2" />
                    </svg>
                    </div>
                    <span className="font-medium">Earnings</span>
                  </div>
                  {/* Daily Earnings Badge */}
                  <div className="flex items-center">
                    {loadingEarnings ? (
                      <div
                        className={`h-6 w-14 animate-pulse rounded-full ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      ></div>
                    ) : (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isActive("/Plasa/Earnings")
                            ? "bg-white/20 text-white"
                            : theme === "dark"
                            ? "bg-green-900 text-green-200"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {formatCompactCurrency(dailyEarnings)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <Link href="/Plasa/ShopperProfile" passHref>
                <div
                  className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive("/Plasa/ShopperProfile")
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className={`mr-3 rounded-md p-1.5 ${
                    isActive("/Plasa/ShopperProfile")
                      ? "bg-white/20"
                      : theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                      className="h-5 w-5"
                  >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                  </svg>
                  </div>
                  <span className="font-medium">My Profile</span>
                </div>
              </Link>
              <Link href="/Plasa/invoices" passHref>
                <div
                  className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive("/Plasa/invoices")
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className={`mr-3 rounded-md p-1.5 ${
                    isActive("/Plasa/invoices")
                      ? "bg-white/20"
                      : theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                      className="h-5 w-5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  </div>
                  <span className="font-medium">Invoices</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Bottom section with Settings and Logout */}
          <div
            className={`border-t p-4 ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <Link href="/Plasa/Settings" passHref>
              <div
                className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive("/Plasa/Settings")
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25"
                      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
              >
                <div className={`mr-3 rounded-md p-1.5 ${
                  isActive("/Plasa/Settings")
                    ? "bg-white/20"
                    : theme === "dark"
                    ? "bg-gray-700"
                    : "bg-gray-100"
                }`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                    className="h-5 w-5"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                </div>
                <span className="font-medium">Settings</span>
              </div>
            </Link>
            <div
              onClick={handleSwitchToCustomer}
              className={`mt-2 flex cursor-pointer items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
              }`}
            >
              <div className={`mr-3 rounded-md p-1.5 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11h-6" />
              </svg>
              </div>
              <span className="font-medium">
                {isSwitchingRole ? "Switching..." : "Switch to Customer"}
              </span>
            </div>
            <div
              onClick={handleLogout}
              className={`mt-2 flex cursor-pointer items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-red-900/20 hover:text-red-300 hover:shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
              }`}
            >
              <div className={`mr-3 rounded-md p-1.5 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                  className="h-5 w-5"
              >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              </div>
              <span className="font-medium">Log Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
          theme === "dark"
            ? "bg-gray-900/95 backdrop-blur-lg border-t border-gray-700"
            : "bg-white/95 backdrop-blur-lg border-t border-gray-200"
        }`}
      >
        <div className="mx-auto flex max-w-md justify-around px-1 py-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              passHref
              onClick={item.onClick || handleNavigation(item.path)}
            >
              <div className={`relative flex items-center justify-center py-2 px-2 rounded-xl transition-all duration-300 ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}>
                {/* Active indicator dot */}
                {isActive(item.path) && item.condition && (
                  <div className={`absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-sm ${
                    theme === "dark" ? "bg-emerald-400" : "bg-emerald-500"
                  }`}></div>
                )}
                
                {/* Icon with enhanced styling */}
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800/50"
                    : "bg-gray-100/50"
                }`}>
                {React.cloneElement(item.icon, {
                    className: `h-5 w-5 transition-all duration-300 ${
                      isActive(item.path) && item.condition
                        ? theme === "dark"
                          ? "text-emerald-400 scale-110"
                          : "text-emerald-500 scale-110"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`,
                    strokeWidth: "2.5",
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* More Menu */}
        {showMoreMenu && (
          <div
            className={`fixed bottom-16 left-0 right-0 z-50 p-4 ${
              theme === "dark"
                ? "bg-gray-900/95 backdrop-blur-lg border-t border-gray-700"
                : "bg-white/95 backdrop-blur-lg border-t border-gray-200"
            }`}
          >
            <div className="mx-auto max-w-md space-y-2">
              {/* Telegram Connect/Disconnect Button for mobile - Hidden on mobile */}
              <div className="mb-4 hidden md:block">
                <TelegramStatusButton
                  className="w-full"
                  size="md"
                  variant="primary"
                />
              </div>
              {moreMenuItems.map((item) => (
                <div
                  key={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      handleNavigation(item.path)(e);
                    }
                  }}
                  className={`relative flex cursor-pointer items-center rounded-2xl px-4 py-4 text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100/50 hover:text-gray-900"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={`mr-4 rounded-xl p-2 transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-white/20"
                      : theme === "dark"
                      ? "bg-gray-800/50"
                      : "bg-gray-100/50"
                  }`}>
                  {React.cloneElement(item.icon, {
                        className: `h-6 w-6 flex-shrink-0 transition-all duration-300 ${
                      isActive(item.path)
                            ? "text-white scale-110"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`,
                        strokeWidth: "2.5",
                    })}
                  </div>
                  
                  {/* Label */}
                  <span className="flex-1 font-semibold">{item.label}</span>
                  
                  {/* Arrow indicator for non-active items */}
                  {!isActive(item.path) && (
                    <svg
                      className={`h-4 w-4 transition-all duration-300 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
