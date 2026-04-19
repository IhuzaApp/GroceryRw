import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@context/ThemeContext";
import { useSession, signOut } from "next-auth/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { formatCompactCurrency } from "../../lib/formatCurrency";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { toast } from "react-hot-toast";
import { logger } from "../../utils/logger";

export default function ShopperBottomNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const pathname = router.pathname;

  const [moreOpen, setMoreOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/") {
      return (
        pathname === "/" ||
        (pathname.startsWith("/Plasa") &&
          !pathname.includes("/chat") &&
          !pathname.includes("/active-batches") &&
          !pathname.includes("/invoices") &&
          !pathname.includes("/Earnings") &&
          !pathname.includes("/Settings") &&
          !pathname.includes("/ShopperProfile"))
      );
    }
    return pathname
      ? pathname === path || (pathname.startsWith(path) && path !== "/")
      : false;
  };

  // Firebase unread count
  useEffect(() => {
    if (!session?.user?.id) return;
    const conversationsRef = collection(db, "chat_conversations");
    const q = query(
      conversationsRef,
      where("shopperId", "==", session.user.id)
    );

    return onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        total += doc.data().unreadCount || 0;
      });
      setUnreadCount(total);
    });
  }, [session?.user?.id]);

  // Fetch earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await authenticatedFetch(
          "/api/shopper/dailyEarnings?period=today"
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) setDailyEarnings(data.earnings.total);
        }
      } catch (err) {
        logger.error("Error fetching earnings", "ShopperBottomNav", err);
      } finally {
        setIsLoadingEarnings(false);
      }
    };
    fetchEarnings();
    const interval = setInterval(fetchEarnings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close more menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const handleSwitchToCustomer = async () => {
    setIsSwitchingRole(true);
    try {
      await initiateRoleSwitch("user");
      window.location.href = "/";
      toast.success("Switched to customer mode");
    } catch (error) {
      toast.error("Failed to switch role");
      setIsSwitchingRole(false);
    }
  };

  const navItems = [
    {
      label: "Invoices",
      path: "/Plasa/invoices",
      icon: (active: boolean) => (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: "Active",
      path: "/Plasa/active-batches",
      icon: (active: boolean) => (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      label: "Center", // This is the placeholder for the floating button center
      path: "",
      isCenter: true,
    },
    {
      label: "Chat",
      path: "/Plasa/chat",
      badge: unreadCount,
      icon: (active: boolean) => (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      label: "More",
      path: "",
      onClick: () => setMoreOpen(!moreOpen),
      icon: (active: boolean) => (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 2}
        >
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Attached Bottom Navigation Bar - Mirrors src/components/ui/NavBar/bottomBar.tsx */}
      <nav
        className="notranslate fixed bottom-0 left-0 z-[9999] flex w-full items-center justify-around border-t py-4 shadow-lg transition-colors duration-200 md:hidden"
        style={{
          background: isDark ? "var(--bg-primary)" : "#ffffff",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
        }}
      >
        {navItems.map((item, idx) => {
          if (item.isCenter) {
            return (
              <div key="center" className="z-50 -mt-12">
                <Link href="/" passHref>
                  <div className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-emerald-500 bg-white shadow-lg transition-transform active:scale-95 dark:bg-[var(--bg-primary)]">
                    <svg
                      className="h-8 w-8 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            );
          }

          const active = item.path ? isActive(item.path) : false;
          const Content = (
            <div
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                active ? "text-emerald-500" : "text-gray-600 dark:text-gray-400"
              }`}
              onClick={item.onClick}
            >
              <div className="relative">
                {item.icon(active)}
                {item.badge ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#0A0A0A]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>
              {/* Optional labels like consumer bar? Consumer bar NavItem doesn't show label by default, only icon */}
            </div>
          );

          return item.path ? (
            <Link key={item.path} href={item.path}>
              {Content}
            </Link>
          ) : (
            <button key={item.label} onClick={item.onClick}>
              {Content}
            </button>
          );
        })}

        {/* More Dropdown Menu - Styled to match consumer bottomBar.tsx */}
        {moreOpen && (
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
              onClick={() => setMoreOpen(false)}
            />
            <div
              ref={moreRef}
              className={`fixed bottom-[5.5rem] left-1/2 z-[10000] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 transform rounded-b-[1.5rem] rounded-t-[2.5rem] border p-3 shadow-2xl backdrop-blur-2xl duration-300 animate-in slide-in-from-bottom ${
                isDark
                  ? "border-white/10 bg-[#0A0A0A]/95 text-white"
                  : "border-black/5 bg-white/95 text-gray-900"
              }`}
            >
              {/* Earnings/Quick Status Header */}
              <div
                className="mx-4 mb-4 mt-2 flex items-center justify-between border-b pb-3"
                style={{
                  borderColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                }}
              >
                <p className="text-xs font-black uppercase tracking-widest opacity-50">
                  Shopper Portal
                </p>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/20">
                  <span className="text-[10px] font-bold tabular-nums text-emerald-500">
                    {isLoadingEarnings
                      ? "..."
                      : formatCompactCurrency(dailyEarnings)}
                  </span>
                </div>
              </div>

              <MoreMenuItem
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label="My Profile"
                href="/Plasa/ShopperProfile"
                onClick={() => setMoreOpen(false)}
                isDark={isDark}
              />
              <MoreMenuItem
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                label="Settings"
                href="/Plasa/Settings"
                onClick={() => setMoreOpen(false)}
                isDark={isDark}
              />
              <MoreMenuItem
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                label="Invoices"
                href="/Plasa/invoices"
                onClick={() => setMoreOpen(false)}
                isDark={isDark}
              />
              <MoreMenuItem
                icon={
                  isDark ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )
                }
                label={isDark ? "Light Mode" : "Dark Mode"}
                onClick={() => {
                  setTheme(isDark ? "light" : "dark");
                  setMoreOpen(false);
                }}
                isDark={isDark}
              />

              <div
                className={`mx-3 my-2 border-t ${
                  isDark ? "border-white/10" : "border-black/5"
                }`}
              />

              <button
                onClick={handleSwitchToCustomer}
                className={`group relative mx-2 flex items-center space-x-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  isDark
                    ? "text-gray-300 hover:bg-white/5 hover:text-orange-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                }`}
              >
                <span
                  className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                    isDark
                      ? "border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]"
                      : "border border-black/5 bg-white"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </span>
                <span className="flex-1 tracking-wide">Customer Mode</span>
              </button>

              <button
                onClick={() => signOut()}
                className={`group relative mx-2 flex items-center space-x-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  isDark
                    ? "text-gray-300 hover:bg-white/5 hover:text-red-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                <span
                  className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                    isDark
                      ? "border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]"
                      : "border border-black/5 bg-white"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                </span>
                <span className="flex-1 tracking-wide">Logout</span>
              </button>
            </div>
          </>
        )}
      </nav>
    </>
  );
}

function MoreMenuItem({
  icon,
  label,
  href,
  onClick,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick: () => void;
  isDark: boolean;
}) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    if (href && href !== "#") {
      router.push(href, undefined, { shallow: true });
    }
  };

  return (
    <Link href={href || "#"} passHref onClick={handleClick}>
      <div
        className={`group relative mx-2 flex items-center space-x-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
          isDark
            ? "text-gray-300 hover:bg-white/5 hover:text-emerald-400"
            : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
        }`}
      >
        <span
          className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
            isDark
              ? "border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]"
              : "border border-black/5 bg-white"
          }`}
        >
          {icon}
        </span>
        <span className="flex-1 tracking-wide">{label}</span>
      </div>
    </Link>
  );
}
