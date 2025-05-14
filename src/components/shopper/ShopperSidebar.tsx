"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatCompactCurrency } from "../../lib/formatCurrency";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";

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

export default function PlasaSidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const pathname = usePathname();
  const { toggleRole } = useAuth();

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
      // Use the utility function to handle role switching
      await initiateRoleSwitch("user");

      // Update local state via context
      toggleRole();

      toast.success("Switched to customer mode");
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error("Failed to switch to customer mode");
      setIsSwitchingRole(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sticky top-[73px] hidden min-h-[calc(100vh-73px)] w-64 border-r bg-white md:block">
        <div className="p-4">
          <nav className="space-y-1">
            <Link href="/" passHref>
              <div
                className={`flex items-center rounded-lg px-4 py-3 ${
                  isActive("/") &&
                  !isActive("/Plasa/active-batches") &&
                  !isActive("/Plasa/Earnings") &&
                  !isActive("/Plasa/settings")
                    ? "bg-green-50 text-green-600"
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
                    ? "bg-green-50 text-green-600"
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
                    ? "bg-green-50 text-green-600"
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
                    <div className="h-5 w-12 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {formatCompactCurrency(dailyEarnings)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <Link href="/Plasa/settings" passHref>
              <div
                className={`flex items-center rounded-lg px-4 py-3 ${
                  isActive("/Plasa/settings")
                    ? "bg-green-50 text-green-600"
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
          </nav>

          <div className="mt-8 border-t pt-4">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold uppercase text-gray-500">
                Account
              </h3>
            </div>
            <Link href="/Plasa/ShopperProfile" passHref>
              <div
                className={`flex items-center rounded-lg px-4 py-3 ${
                  isActive("/Plasa/ShopperProfile")
                    ? "bg-green-50 text-green-600"
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
            <div
              onClick={handleSwitchToCustomer}
              className="flex cursor-pointer items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
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
            <div className="flex cursor-pointer items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100">
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
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[1000] flex justify-around border-t bg-white px-4 py-2 md:hidden">
          <Link
            href="/"
            passHref
            className={`flex flex-col items-center p-2 ${
              pathname === "/" ? "text-green-600" : "text-gray-600"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="mt-1 text-xs">Home</span>
          </Link>

          <Link
            href="/Plasa/active-batches"
            passHref
            className={`flex flex-col items-center p-2 ${
              pathname?.startsWith("/Plasa/active-batches")
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
              <path d="M9 17l6-6" />
              <path d="M15 17v-6h-6" />
            </svg>
            <span className="mt-1 text-xs">Active</span>
          </Link>

          <Link
            href="/Plasa/Earnings"
            passHref
            className={`flex flex-col items-center p-2 ${
              pathname?.startsWith("/Plasa/Earnings")
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <span className="mt-1 text-xs">Earnings</span>
          </Link>

          <Link
            href="/Plasa/ShopperProfile"
            passHref
            className={`flex flex-col items-center p-2 ${
              pathname?.startsWith("/Plasa/ShopperProfile")
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="mt-1 text-xs">Profile</span>
          </Link>

          <div
            onClick={handleSwitchToCustomer}
            className="flex cursor-pointer flex-col items-center p-2 text-gray-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="mt-1 text-xs">
              {isSwitchingRole ? "..." : "Customer"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
