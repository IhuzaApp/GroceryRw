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
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.55281 1.60553C7.10941 1.32725 7.77344 1 9 1C10.2265 1 10.8906 1.32722 11.4472 1.6055L11.4631 1.61347C11.8987 1.83131 12.2359 1.99991 13 1.99993C14.2371 1.99998 14.9698 1.53871 15.2141 1.35512C15.5944 1.06932 16.0437 1.09342 16.3539 1.2369C16.6681 1.38223 17 1.72899 17 2.24148L17 13H20C21.6562 13 23 14.3415 23 15.999V19C23 19.925 22.7659 20.6852 22.3633 21.2891C21.9649 21.8867 21.4408 22.2726 20.9472 22.5194C20.4575 22.7643 19.9799 22.8817 19.6331 22.9395C19.4249 22.9742 19.2116 23.0004 19 23H5C4.07502 23 3.3148 22.7659 2.71092 22.3633C2.11331 21.9649 1.72739 21.4408 1.48057 20.9472C1.23572 20.4575 1.11827 19.9799 1.06048 19.6332C1.03119 19.4574 1.01616 19.3088 1.0084 19.2002C1.00194 19.1097 1.00003 19.0561 1 19V2.24146C1 1.72899 1.33184 1.38223 1.64606 1.2369C1.95628 1.09341 2.40561 1.06931 2.78589 1.35509C3.03019 1.53868 3.76289 1.99993 5 1.99993C5.76415 1.99993 6.10128 1.83134 6.53688 1.6135L6.55281 1.60553ZM3.00332 19L3 3.68371C3.54018 3.86577 4.20732 3.99993 5 3.99993C6.22656 3.99993 6.89059 3.67269 7.44719 3.39441L7.46312 3.38644C7.89872 3.1686 8.23585 3 9 3C9.76417 3 10.1013 3.16859 10.5369 3.38643L10.5528 3.39439C11.1094 3.67266 11.7734 3.9999 13 3.99993C13.7927 3.99996 14.4598 3.86581 15 3.68373V19C15 19.783 15.1678 20.448 15.4635 21H5C4.42498 21 4.0602 20.8591 3.82033 20.6992C3.57419 20.5351 3.39761 20.3092 3.26943 20.0528C3.13928 19.7925 3.06923 19.5201 3.03327 19.3044C3.01637 19.2029 3.00612 19.1024 3.00332 19ZM19.3044 20.9667C19.5201 20.9308 19.7925 20.8607 20.0528 20.7306C20.3092 20.6024 20.5351 20.4258 20.6992 20.1797C20.8591 19.9398 21 19.575 21 19V15.999C21 15.4474 20.5529 15 20 15H17L17 19C17 19.575 17.1409 19.9398 17.3008 20.1797C17.4649 20.4258 17.6908 20.6024 17.9472 20.7306C18.2075 20.8607 18.4799 20.9308 18.6957 20.9667C18.8012 20.9843 18.8869 20.9927 18.9423 20.9967C19.0629 21.0053 19.1857 20.9865 19.3044 20.9667Z"
            fill="currentColor"
          ></path>
          <path
            d="M5 8C5 7.44772 5.44772 7 6 7H12C12.5523 7 13 7.44772 13 8C13 8.55229 12.5523 9 12 9H6C5.44772 9 5 8.55229 5 8Z"
            fill="currentColor"
          ></path>
          <path
            d="M5 12C5 11.4477 5.44772 11 6 11H12C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13H6C5.44772 13 5 12.5523 5 12Z"
            fill="currentColor"
          ></path>
          <path
            d="M5 16C5 15.4477 5.44772 15 6 15H12C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17H6C5.44772 17 5 16.5523 5 16Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      label: "Active",
      path: "/Plasa/active-batches",
      icon: (active: boolean) => (
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
            stroke="currentColor"
            strokeWidth="1.5"
          ></path>
          <path
            d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
            stroke="currentColor"
            strokeWidth="1.5"
          ></path>
          <path
            d="M11 10.8L12.1429 12L15 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          ></path>
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
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          ></path>
          <path
            d="M8 12H8.009M11.991 12H12M15.991 12H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
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
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6H20M4 12H20M4 18H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
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
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 15L12 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>
                      <path
                        d="M21.6359 12.9579L21.3572 14.8952C20.8697 18.2827 20.626 19.9764 19.451 20.9882C18.2759 22 16.5526 22 13.1061 22H10.8939C7.44737 22 5.72409 22 4.54903 20.9882C3.37396 19.9764 3.13025 18.2827 2.64284 14.8952L2.36407 12.9579C1.98463 10.3208 1.79491 9.00229 2.33537 7.87495C2.87583 6.7476 4.02619 6.06234 6.32691 4.69181L7.71175 3.86687C9.80104 2.62229 10.8457 2 12 2C13.1543 2 14.199 2.62229 16.2882 3.86687L17.6731 4.69181C19.9738 6.06234 21.1242 6.7476 21.6646 7.87495"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>
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
