"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatCompactCurrency } from "../../lib/formatCurrency";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { useTheme } from "../../context/ThemeContext";

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
  const [isMobile, setIsMobile] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const pathname = usePathname();
  const { toggleRole } = useAuth();
  const { theme } = useTheme();

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
        // Fetch earnings using the new API endpoint
        const response = await fetch("/api/shopper/dailyEarnings");
        if (!response.ok) {
          throw new Error("Failed to fetch earnings data");
        }

        const data: EarningsResponse = await response.json();

        // Add proper null checks for data and data.earnings
        if (
          data &&
          data.success &&
          data.earnings &&
          typeof data.earnings.total === "number"
        ) {
          setDailyEarnings(data.earnings.total);
        } else {
          console.warn("Earnings data incomplete or invalid:", data);
          setDailyEarnings(0);
        }
      } catch (error) {
        console.error("Error fetching daily earnings:", error);
        setDailyEarnings(0);
      } finally {
        setLoadingEarnings(false);
      }
    };

    fetchDailyEarnings();
    // Set up an interval to refresh the earnings every 5 minutes
    const interval = setInterval(fetchDailyEarnings, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) =>
    pathname ? pathname === path || pathname.startsWith(`${path}/`) : false;

  const handleSwitchToCustomer = async () => {
    setIsSwitchingRole(true);
    try {
      await initiateRoleSwitch("user");
      toggleRole();
      toast.success("Switched to customer mode");
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error("Failed to switch to customer mode");
      setIsSwitchingRole(false);
    }
  };

  const getNavLinkClasses = (path: string, additionalCheck = true): string => {
    const isPathActive = isActive(path) && additionalCheck;
    return `flex flex-col items-center justify-center py-4 text-xs font-medium ${
      isPathActive
        ? theme === 'dark' ? 'text-white' : 'text-gray-900'
        : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
    }`;
  };

  const getIconClasses = (path: string, additionalCheck = true): string => {
    const isPathActive = isActive(path) && additionalCheck;
    return `mb-1 h-6 w-6 ${
      isPathActive && theme === 'dark'
        ? 'text-white'
        : isPathActive
        ? 'text-gray-900'
        : theme === 'dark'
        ? 'text-gray-400'
        : 'text-gray-500'
    }`;
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside 
        className={`hidden h-screen w-64 flex-shrink-0 flex-col border-r transition-colors duration-200 md:flex ${
          theme === 'dark' 
            ? 'border-gray-800 bg-gray-900 text-gray-100' 
            : 'border-gray-200 bg-white text-gray-900'
        }`}
      >
        <nav className="flex-1 space-y-1 px-2 py-4">
          <Link href="/" passHref>
            <div
              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive("/") && !isActive("/Plasa/active-batches") && !isActive("/Plasa/Earnings") && !isActive("/Plasa/settings")
                  ? theme === 'dark'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                  isActive("/") && !isActive("/Plasa/active-batches") && !isActive("/Plasa/Earnings") && !isActive("/Plasa/settings")
                    ? theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                    : ''
                }`}
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Available batches</span>
            </div>
          </Link>
          <Link href="/Plasa/active-batches" passHref>
            <div
              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive("/Plasa/active-batches")
                  ? theme === 'dark'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                  isActive("/Plasa/active-batches") && theme === 'dark'
                    ? 'text-white'
                    : isActive("/Plasa/active-batches")
                    ? 'text-gray-900'
                    : ''
                }`}
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
              className={`group flex items-center justify-between rounded-lg px-4 py-3 ${
                isActive("/Plasa/Earnings")
                  ? theme === 'dark'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                    isActive("/Plasa/Earnings") && theme === 'dark'
                      ? 'text-white'
                      : isActive("/Plasa/Earnings")
                      ? 'text-gray-900'
                      : ''
                  }`}
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <span>Earnings</span>
              </div>
              {/* Daily Earnings Badge */}
              <div className="flex items-center">
                {loadingEarnings ? (
                  <div className="h-5 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                ) : (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {formatCompactCurrency(dailyEarnings)}
                  </span>
                )}
              </div>
            </div>
          </Link>
          <Link href="/Plasa/settings" passHref>
            <div
              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive("/Plasa/settings")
                  ? theme === 'dark'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                  isActive("/Plasa/settings") && theme === 'dark'
                    ? 'text-white'
                    : isActive("/Plasa/settings")
                    ? 'text-gray-900'
                    : ''
                }`}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
          </Link>

          {/* Switch to Customer Mode Button */}
          <button
            onClick={handleSwitchToCustomer}
            disabled={isSwitchingRole}
            className={`mt-4 flex w-full items-center justify-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-200 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2 h-5 w-5"
            >
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            {isSwitchingRole ? "Switching..." : "Switch to Customer Mode"}
          </button>
        </nav>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-[2000] border-t md:hidden ${
        theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex justify-around">
          <Link href="/">
            <div className={getNavLinkClasses("/", !isActive("/Plasa/active-batches"))}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={getIconClasses("/", !isActive("/Plasa/active-batches"))}
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Available</span>
            </div>
          </Link>

          <Link href="/Plasa/active-batches">
            <div className={getNavLinkClasses("/Plasa/active-batches")}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={getIconClasses("/Plasa/active-batches")}
              >
                <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
                <path d="M15 17v-6h-6" />
              </svg>
              <span>Active</span>
            </div>
          </Link>

          <Link href="/Plasa/Earnings">
            <div className={getNavLinkClasses("/Plasa/Earnings")}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={getIconClasses("/Plasa/Earnings")}
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span>Earnings</span>
            </div>
          </Link>

          <Link href="/Plasa/settings">
            <div className={getNavLinkClasses("/Plasa/settings")}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={getIconClasses("/Plasa/settings")}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}
