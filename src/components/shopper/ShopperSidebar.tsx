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
        const response = await fetch("/api/shopper/dailyEarnings");
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
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Clear client-side storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to home page
        window.location.href = '/';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      logger.error("Error signing out", "ShopperSidebar", error);
      toast.error("Failed to sign out");
    }
  };

  const getNavLinkClasses = (path: string, additionalCheck = true): string => {
    const isPathActive = isActive(path) && additionalCheck;
    return `flex flex-col items-center justify-center py-4 text-xs font-medium ${
      isPathActive
        ? theme === "dark"
          ? "text-white"
          : "text-gray-900"
        : theme === "dark"
        ? "text-gray-400 hover:text-white"
        : "text-gray-500 hover:text-gray-900"
    }`;
  };

  const getIconClasses = (path: string, additionalCheck = true): string => {
    const isPathActive = isActive(path) && additionalCheck;
    return `mb-1 h-6 w-6 ${
      isPathActive && theme === "dark"
        ? "text-white"
        : isPathActive
        ? "text-gray-900"
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
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
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
      label: "Active batches",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
          <path d="M9 17l6-6" />
          <path d="M15 17v-6h-6" />
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
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 00-4 4v2" />
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
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
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
          strokeWidth="2"
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
          strokeWidth="2"
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
          strokeWidth="2"
        >
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
          strokeWidth="2"
        >
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
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
            strokeWidth="2"
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
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
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
            ? "border-gray-800 bg-gray-900 text-gray-100"
            : "border-gray-200 bg-white text-gray-900"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link href="/" passHref>
                <div
                  className={`flex items-center rounded-lg px-4 py-3 ${
                    isActive("/") &&
                    !isActive("/Plasa/active-batches") &&
                    !isActive("/Plasa/Earnings") &&
                    !isActive("/Plasa/Settings")
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-green-50 text-green-600"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-3 h-5 w-5"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Available batches</span>
                </div>
              </Link>
              <Link href="/Plasa/active-batches" passHref>
                <div
                  className={`flex items-center rounded-lg px-4 py-3 ${
                    isActive("/Plasa/active-batches")
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-green-50 text-green-600"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-3 h-5 w-5"
                  >
                    <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
                    <path d="M9 17l6-6" />
                    <path d="M15 17v-6h-6" />
                  </svg>
                  <span>Active batches</span>
                </div>
              </Link>
              <Link href="/Plasa/Earnings" passHref>
                <div
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    isActive("/Plasa/Earnings")
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-green-50 text-green-600"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-3 h-5 w-5"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    <span>Earnings</span>
                  </div>
                  {/* Daily Earnings Badge */}
                  <div className="flex items-center">
                    {loadingEarnings ? (
                      <div
                        className={`h-5 w-12 animate-pulse rounded ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      ></div>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          theme === "dark"
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
                  className={`flex items-center rounded-lg px-4 py-3 ${
                    isActive("/Plasa/ShopperProfile")
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-green-50 text-green-600"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-3 h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>My Profile</span>
                </div>
              </Link>
              <Link href="/Plasa/invoices" passHref>
                <div
                  className={`flex items-center rounded-lg px-4 py-3 ${
                    isActive("/Plasa/invoices")
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-green-50 text-green-600"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-3 h-5 w-5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  <span>Invoices</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Bottom section with Settings and Logout */}
          <div
            className={`border-t p-4 ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <Link href="/Plasa/Settings" passHref>
              <div
                className={`flex items-center rounded-lg px-4 py-3 ${
                  isActive("/Plasa/Settings")
                    ? theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-green-50 text-green-600"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-3 h-5 w-5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                </svg>
                <span>Settings</span>
              </div>
            </Link>
            <div
              onClick={handleSwitchToCustomer}
              className={`mt-2 flex cursor-pointer items-center rounded-lg px-4 py-3 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-3 h-5 w-5"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>
                {isSwitchingRole ? "Switching..." : "Switch to Customer"}
              </span>
            </div>
            <div
              onClick={handleLogout}
              className={`mt-2 flex cursor-pointer items-center rounded-lg px-4 py-3 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-3 h-5 w-5"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 border-t md:hidden ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-md justify-around">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              passHref
              onClick={item.onClick || handleNavigation(item.path)}
            >
              <div className={getNavLinkClasses(item.path, item.condition)}>
                {React.cloneElement(item.icon, {
                  className: getIconClasses(item.path, item.condition),
                })}
              </div>
            </Link>
          ))}
        </div>

        {/* More Menu */}
        {showMoreMenu && (
          <div
            className={`fixed bottom-16 left-0 right-0 z-50 border-t p-4 ${
              theme === "dark"
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mx-auto max-w-md space-y-2">
              {/* Telegram Connect/Disconnect Button for mobile */}
              <div className="mt-2">
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
                  className={`flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {React.cloneElement(item.icon, {
                    className: `mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                      isActive(item.path)
                        ? theme === "dark"
                          ? "text-white"
                          : "text-gray-900"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`,
                  })}
                  <span className="flex-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
