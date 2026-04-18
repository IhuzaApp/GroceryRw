"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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

interface ShopperSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function ShopperSidebar({ isCollapsed, onToggle }: ShopperSidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const pathname = router.pathname;

  const isActive = (path: string) =>
    pathname ? pathname === path || pathname.startsWith(`${path}/`) : false;

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch today's earnings
  useEffect(() => {
    const fetchDailyEarnings = async () => {
      setLoadingEarnings(true);
      try {
        const response = await authenticatedFetch(
          "/api/shopper/dailyEarnings?period=today"
        );
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
      // window.location.href = "/"; // Usually handled by switch
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

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] border-r transition-all duration-300 md:block backdrop-blur-2xl shadow-sm ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          theme === "dark" 
            ? "border-white/10 bg-[#0A0A0A]/80 text-white" 
            : "border-black/5 bg-white/80 text-gray-900"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Toggle Button & Branding Padding */}
          <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
             {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Shopper Menu</span>}
             <button 
               onClick={onToggle}
               className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 border border-transparent ${
                 theme === "dark" ? "hover:bg-white/5 hover:border-white/10" : "hover:bg-black/5 hover:border-black/5"
               }`}
             >
               <svg 
                 className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor" 
                 strokeWidth={2.5}
               >
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
               </svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-none">
            <nav className="space-y-1.5 font-medium">
              <SidebarItem 
                href="/"
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>}
                label="Available"
                active={isActive("/") && !isActive("/Plasa/active-batches") && !isActive("/Plasa/Earnings") && !isActive("/Plasa/Settings")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
              />
              <SidebarItem 
                href="/Plasa/active-batches"
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>}
                label="Active Batches"
                active={isActive("/Plasa/active-batches")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
              />
              <SidebarItem 
                href="/Plasa/Earnings"
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 1v6l3-3m-6 3l3 3M12 8v13M20 12h2l-2 2-2-2M4 12H2l2-2 2 2M12 20l2-2-2-2M12 4l2 2-2 2" /></svg>}
                label="Earnings"
                active={isActive("/Plasa/Earnings")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
                badge={!loadingEarnings ? formatCompactCurrency(dailyEarnings) : null}
              />
              <SidebarItem 
                href="/Plasa/chat"
                icon={<div className="relative"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>{unreadMessageCount > 0 && <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-black">{unreadMessageCount > 9 ? "9+" : unreadMessageCount}</span>}</div>}
                label="Chat"
                active={isActive("/Plasa/chat")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
              />
              <SidebarItem 
                href="/Plasa/invoices"
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>}
                label="Invoices"
                active={isActive("/Plasa/invoices")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
              />
            </nav>
          </div>

          {/* Settings & Logout Section */}
          <div className={`p-3 border-t ${theme === "dark" ? "border-white/10" : "border-black/5"}`}>
             <SidebarItem 
                href="/Plasa/ShopperProfile"
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                label="My Profile"
                active={isActive("/Plasa/ShopperProfile")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
              />
             <SidebarItem 
                href="/Plasa/Settings"
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
                label="Settings"
                active={isActive("/Plasa/Settings")}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
              />
              <SidebarItem 
                onClick={handleSwitchToCustomer}
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>}
                label={isSwitchingRole ? "Switching..." : "Customer Mode"}
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
                className="mt-1"
              />
              <SidebarItem 
                onClick={handleLogout}
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
                label="Log Out"
                collapsed={isCollapsed}
                theme={theme === "dark" ? "dark" : "light"}
                colorVariant="red"
              />
          </div>
        </div>
      </div>
    </>
  );
}

interface SidebarItemProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  theme: "dark" | "light";
  badge?: string | null;
  className?: string;
  colorVariant?: "emerald" | "red";
}

function SidebarItem({ 
  href, 
  onClick, 
  icon, 
  label, 
  active, 
  collapsed, 
  theme, 
  badge, 
  className = "",
  colorVariant = "emerald"
}: SidebarItemProps) {
  const isDark = theme === "dark";

  const baseClasses = `group relative flex items-center transition-all duration-300 rounded-xl overflow-hidden ${
    collapsed ? "justify-center px-0 h-11" : "px-4 py-3"
  } ${className}`;

  const activeClasses = active
    ? colorVariant === "emerald" 
      ? isDark 
        ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
        : "bg-emerald-50 text-emerald-600 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]"
      : ""
    : isDark 
      ? "text-gray-400 hover:bg-white/5 hover:text-white" 
      : "text-gray-600 hover:bg-black/5 hover:text-gray-900";

  const hoverColorClass = colorVariant === "red" ? "hover:text-red-500 hover:bg-red-500/10" : "";

  const content = (
    <div 
      className={`${baseClasses} ${activeClasses} ${hoverColorClass}`}
      title={collapsed ? label : undefined}
      onClick={onClick}
    >
      <div className={`flex items-center justify-center transition-transform duration-300 ${collapsed ? "group-hover:scale-110" : ""}`}>
        {icon}
      </div>
      
      {!collapsed && (
        <>
          <span className="ml-3 flex-1 font-semibold truncate text-[13px] tracking-wide">{label}</span>
          {badge && (
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              active 
                ? "bg-emerald-500 text-white" 
                : isDark ? "bg-white/10 text-gray-400" : "bg-black/5 text-gray-500"
            }`}>
              {badge}
            </span>
          )}
        </>
      )}

      {/* Active Indicator Strip */}
      {active && !collapsed && (
        <div className="absolute left-0 h-6 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block no-underline">
      {content}
    </Link>
  ) : (
    <div className="cursor-pointer">
      {content}
    </div>
  );
}
