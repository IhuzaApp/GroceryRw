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
  const { theme } = useTheme();

  const isActive = (path: string) =>
    pathname ? pathname === path || pathname.startsWith(`${path}/`) : false;

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(path);
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
      await signOut({ callbackUrl: "/auth/signin" });
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
      label: "Available batches",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      condition: !isActive("/Plasa/active-batches") && !isActive("/Plasa/Earnings") && !isActive("/Plasa/Settings") && !isActive("/Plasa/ShopperProfile")
    },
    {
      path: "/Plasa/active-batches",
      label: "Active batches",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
          <path d="M9 17l6-6" />
          <path d="M15 17v-6h-6" />
        </svg>
      )
    },
    {
      path: "/Plasa/Earnings",
      label: (
        <div className="flex items-center justify-between w-full">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      )
    },
    {
      path: "/Plasa/Settings",
      label: "Settings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      condition: true
    },
    {
      path: "/Plasa/ShopperProfile",
      label: "Profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      condition: true
    }
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col border-r transition-colors duration-200 md:flex ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900 text-gray-100"
            : "border-gray-200 bg-white text-gray-900"
        }`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                passHref
                onClick={handleNavigation(item.path)}
                className="block"
              >
                <div
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path) && (item.condition !== undefined ? item.condition : true)
                      ? theme === "dark"
                        ? "bg-gray-800 text-white"
                        : item.path === "/Plasa/Earnings"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-900"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {React.cloneElement(item.icon, {
                    className: `mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                      isActive(item.path) && (item.condition !== undefined ? item.condition : true)
                        ? theme === "dark"
                          ? "text-white"
                          : item.path === "/Plasa/Earnings"
                          ? "text-green-600"
                          : "text-gray-900"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`
                  })}
                  <span className="flex-1">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div
            className={`sticky bottom-0 border-t p-4 ${
              theme === "dark"
                ? "border-gray-800 bg-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <button
              onClick={handleSwitchToCustomer}
              disabled={isSwitchingRole}
              className={`flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {isSwitchingRole ? (
                <div
                  className={`h-5 w-5 animate-spin rounded-full border-2 ${
                    theme === "dark"
                      ? "border-gray-300 border-t-transparent"
                      : "border-gray-900 border-t-transparent"
                  }`}
                />
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-5 w-5"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  Switch to Customer
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
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
              onClick={handleNavigation(item.path)}
            >
              <div className={getNavLinkClasses(item.path, item.condition)}>
                {React.cloneElement(item.icon, {
                  className: getIconClasses(item.path, item.condition)
                })}
                {typeof item.label === 'string' ? (
                  <span>{item.label}</span>
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Earnings</span>
                    {loadingEarnings ? (
                      <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                    ) : (
                      <span className="text-xs font-semibold text-green-600">
                        {formatCompactCurrency(dailyEarnings)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
