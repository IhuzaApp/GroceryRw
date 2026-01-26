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
import { useSession } from "next-auth/react";
import { logger } from "../../utils/logger";
import TelegramStatusButton from "./TelegramStatusButton";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const pathname = usePathname();
  const { toggleRole, logout } = useAuth();
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

  // Fetch unread message count
  useEffect(() => {
    if (!session?.user?.id) return;

    const conversationsRef = collection(db, "chat_conversations");
    const q = query(
      conversationsRef,
      where("shopperId", "==", session.user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalUnread += data.unreadCount || 0;
      });
      setUnreadMessageCount(totalUnread);
    });

    return () => unsubscribe();
  }, [session?.user?.id]);

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
      toast.success("Logging out...");
      await logout();
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
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M15 18H9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      condition:
        !isActive("/Plasa/active-batches") &&
        !isActive("/Plasa/Earnings") &&
        !isActive("/Plasa/Settings") &&
        !isActive("/Plasa/ShopperProfile") &&
        !isActive("/Plasa/invoices") &&
        !isActive("/Plasa/chat"),
    },
    {
      path: "/Plasa/active-batches",
      label: "Active",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M11 10.8L12.1429 12L15 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      path: "/Plasa/chat",
      label: "Chat",
      icon: (
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 10.5H16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M8 14H13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {unreadMessageCount > 0 && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
            </div>
          )}
        </div>
      ),
    },
    {
      path: "/Plasa/invoices",
      label: "Invoices",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 13H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
      path: "/Plasa/ShopperProfile",
      label: "My Profile",
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
                  <div className="mr-3 p-1.5">
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
                  <div className="mr-3 p-1.5">
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
                    <div className="mr-3 p-1.5">
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
              <Link href="/Plasa/chat" passHref>
                <div
                  className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive("/Plasa/chat")
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className="relative mr-3 p-1.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {unreadMessageCount > 0 && (
                      <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">Chat</span>
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
                  <div className="mr-3 p-1.5">
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
                <div className="mr-3 p-1.5">
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
                <div className="mr-3 p-1.5">
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
              <div className="mr-3 p-1.5">
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
              <div className="mr-3 p-1.5">
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
            ? "border-t border-gray-700 bg-gray-900/95 backdrop-blur-lg"
            : "border-t border-gray-200 bg-white/95 backdrop-blur-lg"
        }`}
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-3">
          {/* Get home item and other items separately */}
          {(() => {
            const homeItem = navigationItems.find((item) => item.path === "/");
            const otherItems = navigationItems.filter(
              (item) => item.path !== "/"
            );
            const homeIsActive =
              isActive("/") &&
              !isActive("/Plasa/active-batches") &&
              !isActive("/Plasa/Earnings") &&
              !isActive("/Plasa/Settings") &&
              !isActive("/Plasa/ShopperProfile") &&
              !isActive("/Plasa/invoices") &&
              !isActive("/Plasa/chat");

            return (
              <>
                {/* Render items before home */}
                {otherItems.slice(0, 2).map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    passHref
                    onClick={item.onClick || handleNavigation(item.path)}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-xl px-3 py-2 transition-all duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                          : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900"
                      }`}
                    >
                      {/* Active indicator dot */}
                      {isActive(item.path) && (
                        <div
                          className={`absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full shadow-sm ${
                            theme === "dark"
                              ? "bg-emerald-400"
                              : "bg-emerald-500"
                          }`}
                        ></div>
                      )}

                      {/* Icon */}
                      <div className="flex items-center justify-center">
                        {React.cloneElement(item.icon, {
                          className: `h-7 w-7 transition-all duration-300 ${
                            isActive(item.path)
                              ? theme === "dark"
                                ? "text-emerald-400 scale-110"
                                : "text-emerald-500 scale-110"
                              : theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`,
                          strokeWidth: "1.5",
                        })}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Central Home Button */}
                {homeItem && (
                  <div className="z-50 -mt-12">
                    <Link href="/" passHref onClick={handleNavigation("/")}>
                      <div
                        className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 ${
                          homeIsActive
                            ? theme === "dark"
                              ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                              : "border-emerald-500 bg-white text-emerald-500 dark:bg-gray-800"
                            : theme === "dark"
                            ? "border-gray-600 bg-gray-800 text-gray-400"
                            : "border-gray-300 bg-white text-gray-500 dark:bg-gray-800"
                        }`}
                      >
                        {React.cloneElement(homeItem.icon, {
                          className: `h-7 w-7 transition-all duration-300 ${
                            homeIsActive
                              ? theme === "dark"
                                ? "text-emerald-400"
                                : "text-emerald-500"
                              : theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`,
                          strokeWidth: "1.5",
                        })}
                      </div>
                    </Link>
                  </div>
                )}

                {/* Render items after home */}
                {otherItems.slice(2).map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    passHref
                    onClick={item.onClick || handleNavigation(item.path)}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-xl px-3 py-2 transition-all duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                          : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900"
                      }`}
                    >
                      {/* Active indicator dot */}
                      {isActive(item.path) && (
                        <div
                          className={`absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full shadow-sm ${
                            theme === "dark"
                              ? "bg-emerald-400"
                              : "bg-emerald-500"
                          }`}
                        ></div>
                      )}

                      {/* Icon */}
                      <div className="flex items-center justify-center">
                        {React.cloneElement(item.icon, {
                          className: `h-7 w-7 transition-all duration-300 ${
                            isActive(item.path)
                              ? theme === "dark"
                                ? "text-emerald-400 scale-110"
                                : "text-emerald-500 scale-110"
                              : theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`,
                          strokeWidth: "1.5",
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            );
          })()}
        </div>

        {/* More Menu */}
        {showMoreMenu && (
          <div
            className={`fixed bottom-16 left-0 right-0 z-50 p-4 ${
              theme === "dark"
                ? "border-t border-gray-700 bg-gray-900/95 backdrop-blur-lg"
                : "border-t border-gray-200 bg-white/95 backdrop-blur-lg"
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
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 transform rounded-r-full bg-white"></div>
                  )}

                  {/* Icon container */}
                  <div
                    className={`mr-4 rounded-xl p-2 transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-white/20"
                        : theme === "dark"
                        ? "bg-gray-800/50"
                        : "bg-gray-100/50"
                    }`}
                  >
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
