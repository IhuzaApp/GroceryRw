import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../../../context/CartContext";
import { useTheme } from "../../../context/ThemeContext";
import { useLanguage } from "../../../context/LanguageContext";
import { Input, Modal, Button, Loader } from "rsuite";
import { useSession } from "next-auth/react";
import { useAuth } from "../../../context/AuthContext";
import { useAuth as useAuthHook } from "../../../hooks/useAuth";
import { authenticatedFetch } from "../../../lib/authenticatedFetch";
import { Briefcase, Car } from "lucide-react";
import GuestUpgradeModal from "../GuestUpgradeModal";
import HomeActionsModal from "./HomeActionsModal";
import PackageDeliveryModal from "./PackageDeliveryModal";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useHideBottomBar } from "../../../context/HideBottomBarContext";
import { useAnyModalOpen } from "../../../hooks/useAnyModalOpen";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function NavItem({ icon, label, href }: NavItemProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <Link href={href} passHref onClick={handleClick}>
      <div className="flex flex-col items-center text-xs text-gray-600 transition-colors duration-200 hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400">
        <span className="text-lg">{icon}</span>
      </div>
    </Link>
  );
}

interface MoreMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: () => void;
  badgeCount?: number;
}

function MoreMenuItem({
  icon,
  label,
  href,
  onClick,
  badgeCount = 0,
}: MoreMenuItemProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    router.push(href, undefined, { shallow: true });
  };

  return (
    <Link href={href} passHref onClick={handleClick}>
      <div
        className={`group relative mx-2 flex items-center space-x-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
          theme === "dark"
            ? "text-gray-300 hover:bg-white/5 hover:text-emerald-400"
            : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
        }`}
      >
        <span
          className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
            theme === "dark"
              ? "border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]"
              : "border border-black/5 bg-white"
          }`}
        >
          {icon}
          {badgeCount > 0 && (
            <span
              className={`absolute -right-1.5 -top-1.5 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-black text-white shadow-sm ring-2 ${
                theme === "dark" ? "ring-[#0A0A0A]" : "ring-white"
              }`}
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </span>
        <span className="flex-1 tracking-wide">{label}</span>
      </div>
    </Link>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  href?: string;
  onClick?: () => void;
  isCircle?: boolean;
  tooltip?: string;
  bgColor?: string;
}

const ActionButton = ({
  icon,
  label,
  href,
  onClick,
  isCircle = false,
  tooltip,
  bgColor = "bg-white",
}: ActionButtonProps) => {
  const classes = `flex items-center justify-center ${
    isCircle ? "h-12 w-12 rounded-full" : "px-3 py-2 rounded-md"
  } ${bgColor} text-white shadow-md cursor-pointer hover:opacity-90`;

  const content = (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-xs text-gray-700 hover:text-green-600"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

interface DesktopActionButtonProps {
  icon: React.ReactNode;
  tooltip?: string;
  href?: string;
  label?: string;
  onClick?: () => void;
  bgColor?: string;
}

const DesktopActionButton = ({
  icon,
  tooltip,
  href,
  onClick,
  bgColor = "bg-blue-600 hover:bg-blue-700",
}: DesktopActionButtonProps) => {
  const button = (
    <div
      title={tooltip}
      onClick={onClick}
      className={`flex h-[64px] w-[64px] cursor-pointer items-center justify-center rounded-full text-white shadow-md ${bgColor}`}
    >
      {icon}
    </div>
  );

  return href ? <Link href={href}>{button}</Link> : button;
};

export default function BottomBar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();
  const { hideFloatingUI } = useHideBottomBar();
  const { logout } = useAuth();
  const { isGuest } = useAuthHook();
  const { count } = useCart();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const moreRef = useRef<HTMLDivElement>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [marketplaceNotificationCount, setMarketplaceNotificationCount] =
    useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showHomeActions, setShowHomeActions] = useState(false);
  const isModalOpen = useAnyModalOpen();

  const homePressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const handleHomeTouchStart = () => {
    isLongPressActive.current = false;
    homePressTimerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      setShowHomeActions(true);
    }, 500); // 500ms long press threshold
  };

  const handleHomeTouchEnd = () => {
    if (homePressTimerRef.current) {
      clearTimeout(homePressTimerRef.current);
      homePressTimerRef.current = null;
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (isLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Normal click logic
    router.push("/", undefined, { shallow: true });
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Refresh cart count
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Close more dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }

    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreOpen]);

  // Fetch pending orders count (Orders + reel + restaurant, not delivered) — same as sidebar
  useEffect(() => {
    if (!session?.user?.id) {
      setPendingOrdersCount(0);
      return;
    }

    const fetchPendingOrders = async () => {
      try {
        // Use limit=50 for navbar badge - most users won't have more than 50 pending orders
        const response = await authenticatedFetch(
          "/api/queries/user-orders?limit=50&minimal=1"
        );
        if (!response.ok) return;
        const data = await response.json();
        if (!data?.orders) return;
        const pending = data.orders.filter(
          (order: any) => order.status !== "delivered"
        );
        setPendingOrdersCount(pending.length);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
        setPendingOrdersCount(0);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 60000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Fetch marketplace notifications (RFQ + new RFQs + business orders only — same as sidebar)
  // Uses fcmClient (via useFCMNotifications) to receive fcm-marketplace-update; API uses fcmService to send
  useEffect(() => {
    if (!session?.user?.id) {
      setMarketplaceNotificationCount(0);
      return;
    }

    const fetchMarketplaceNotifications = async () => {
      try {
        const response = await fetch("/api/queries/marketplace-notifications");
        const data = await response.json();
        const marketplaceOnly =
          (data.rfqResponsesCount || 0) +
          (data.newRFQsCount || 0) +
          (data.newBusinessOrdersCount || 0);
        setMarketplaceNotificationCount(marketplaceOnly);
      } catch (error) {
        console.error("Error fetching marketplace notifications:", error);
      }
    };

    fetchMarketplaceNotifications();
    const interval = setInterval(fetchMarketplaceNotifications, 30000);

    const onMarketplaceUpdate = () => fetchMarketplaceNotifications();
    window.addEventListener("fcm-marketplace-update", onMarketplaceUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("fcm-marketplace-update", onMarketplaceUpdate);
    };
  }, [session?.user?.id]);

  // Listen for unread message count (customer: customerId; shopper: shopperId)
  useEffect(() => {
    if (!session?.user?.id || !db) {
      setMessageUnreadCount(0);
      return;
    }

    const role = (session.user as any)?.role;
    const isShopper = role === "shopper";
    const conversationsRef = collection(db, "chat_conversations");
    const field = isShopper ? "shopperId" : "customerId";
    const q = query(conversationsRef, where(field, "==", session.user.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const total = snapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().unreadCount || 0),
        0
      );
      setMessageUnreadCount(total);
    });

    return () => unsubscribe();
  }, [session?.user?.id, (session?.user as any)?.role]);

  return (
    <>
      {/* Floating Buttons (Ask, Help) */}

      {/* Floating Cart Button (Lifted) - hidden on store & checkout pages */}
      {!hideFloatingUI &&
        !isModalOpen &&
        router.pathname !== "/Cart" &&
        router.pathname !== "/Reels" &&
        router.pathname !== "/Myprofile" &&
        router.pathname !== "/Myprofile/become-shopper" &&
        router.pathname !== "/stores/[id]" &&
        router.pathname !== "/stores/[id]/checkout" &&
        router.pathname !== "/plasBusiness/store/[storeId]" &&
        !router.pathname.startsWith("/Cars") && (
          <div className="notranslate fixed bottom-24 right-4 z-50 md:hidden">
            <Link href="/Cart" passHref>
              <div className="relative flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#115e59] text-white shadow-lg transition hover:bg-[#115e59]">
                {count > 0 && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {count}
                  </div>
                )}
                <span className="text-2xl">
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        opacity="0.5"
                        d="M10 2C9.0335 2 8.25 2.7835 8.25 3.75C8.25 4.7165 9.0335 5.5 10 5.5H14C14.9665 5.5 15.75 4.7165 15.75 3.75C15.75 2.7835 14.9665 2 14 2H10Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        opacity="0.5"
                        d="M3.86327 16.2052C3.00532 12.7734 2.57635 11.0575 3.47718 9.90376C4.37801 8.75 6.14672 8.75 9.68413 8.75H14.3148C17.8522 8.75 19.6209 8.75 20.5218 9.90376C21.4226 11.0575 20.9936 12.7734 20.1357 16.2052C19.59 18.3879 19.3172 19.4792 18.5034 20.1146C17.6896 20.75 16.5647 20.75 14.3148 20.75H9.68413C7.43427 20.75 6.30935 20.75 5.49556 20.1146C4.68178 19.4792 4.40894 18.3879 3.86327 16.2052Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        d="M15.5805 4.5023C15.6892 4.2744 15.75 4.01931 15.75 3.75C15.75 3.48195 15.6897 3.22797 15.582 3.00089C16.2655 3.00585 16.7983 3.03723 17.2738 3.22309C17.842 3.44516 18.3362 3.82266 18.6999 4.31242C19.0669 4.8065 19.2391 5.43979 19.4762 6.31144L19.5226 6.48181L20.0353 9.44479C19.6266 9.16286 19.0996 8.99533 18.418 8.89578L18.0567 6.80776C17.7729 5.76805 17.6699 5.44132 17.4957 5.20674C17.2999 4.94302 17.0337 4.73975 16.7278 4.62018C16.508 4.53427 16.2424 4.50899 15.5805 4.5023Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        d="M8.41799 3.00089C8.31027 3.22797 8.25 3.48195 8.25 3.75C8.25 4.01931 8.31083 4.27441 8.41951 4.50231C7.75766 4.509 7.49208 4.53427 7.27227 4.62018C6.96633 4.73975 6.70021 4.94302 6.50436 5.20674C6.33015 5.44132 6.22715 5.76805 5.94337 6.80776L5.58207 8.89569C4.90053 8.99518 4.37353 9.1626 3.96484 9.44433L4.47748 6.48181L4.52387 6.31145C4.76095 5.4398 4.9332 4.8065 5.30013 4.31242C5.66384 3.82266 6.15806 3.44516 6.72624 3.22309C7.20177 3.03724 7.73449 3.00586 8.41799 3.00089Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        d="M8.75 12.75C8.75 12.3358 8.41421 12 8 12C7.58579 12 7.25 12.3358 7.25 12.75V16.75C7.25 17.1642 7.58579 17.5 8 17.5C8.41421 17.5 8.75 17.1642 8.75 16.75V12.75Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        d="M16 12C16.4142 12 16.75 12.3358 16.75 12.75V16.75C16.75 17.1642 16.4142 17.5 16 17.5C15.5858 17.5 15.25 17.1642 15.25 16.75V12.75C15.25 12.3358 15.5858 12 16 12Z"
                        fill="#ffffff"
                      ></path>{" "}
                      <path
                        d="M12.75 12.75C12.75 12.3358 12.4142 12 12 12C11.5858 12 11.25 12.3358 11.25 12.75V16.75C11.25 17.1642 11.5858 17.5 12 17.5C12.4142 17.5 12.75 17.1642 12.75 16.75V12.75Z"
                        fill="#ffffff"
                      ></path>{" "}
                    </g>
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        )}

      {/* Desktop Floating Buttons */}
      {!isModalOpen && (
        <div className="notranslate fixed bottom-6 right-4 z-50 hidden flex-col items-end gap-2 md:flex">
          {open && router.pathname !== "/Myprofile/become-shopper" && (
            <div className="mb-2 flex flex-col items-end gap-2">
              {/* AI Support - Only show for non-guest users */}
              {session?.user && !isGuest && (
                <DesktopActionButton
                  icon={
                    <svg
                      width="30px"
                      height="30px"
                      viewBox="-0.5 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M6.72266 5.47968C6.81011 4.6032 7.11663 3.7628 7.61402 3.03585C8.11141 2.30889 8.78368 1.71874 9.56895 1.31971C10.3542 0.920684 11.2272 0.725607 12.1077 0.752437C12.9881 0.779267 13.8476 1.02714 14.6071 1.47324C15.3666 1.91935 16.0017 2.54934 16.4539 3.30524C16.9061 4.06113 17.1609 4.91863 17.1948 5.79881C17.2287 6.67899 17.0407 7.55355 16.648 8.342C16.2627 9.11563 15.6925 9.78195 14.9883 10.2821"
                          stroke="#5b428a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M7.43945 3.35268C8.25207 4.19161 9.22512 4.85854 10.3007 5.31379C11.3763 5.76904 12.5325 6.00332 13.7005 6.00268C14.8492 6.00382 15.9865 5.77762 17.0469 5.33742"
                          stroke="#5b428a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M10.8232 9.75268C10.5266 9.75268 10.2366 9.84065 9.98989 10.0055C9.74321 10.1703 9.55096 10.4046 9.43742 10.6787C9.32389 10.9527 9.29419 11.2543 9.35206 11.5453C9.40994 11.8363 9.5528 12.1036 9.76258 12.3133C9.97236 12.5231 10.2396 12.666 10.5306 12.7239C10.8216 12.7817 11.1232 12.752 11.3973 12.6385C11.6714 12.525 11.9056 12.3327 12.0704 12.086C12.2353 11.8394 12.3232 11.5493 12.3232 11.2527C12.3232 10.8549 12.1652 10.4733 11.8839 10.192C11.6026 9.91071 11.2211 9.75268 10.8232 9.75268Z"
                          stroke="#5b428a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M4.82324 7.17467V8.25268C4.82324 9.04832 5.13931 9.81139 5.70192 10.374C6.26453 10.9366 7.02759 11.2527 7.82324 11.2527H9.24649"
                          stroke="#5b428a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M21.7005 23.2527C21.7006 21.4693 21.211 19.7202 20.2852 18.196C19.3632 16.6779 18.0438 15.4409 16.4697 14.6187"
                          stroke="#5b428a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M2.2002 23.2527C2.2 21.4695 2.68926 19.7206 3.61465 18.1963C4.53542 16.6797 5.85284 15.4435 7.42453 14.621"
                          stroke="#5b428a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  }
                  tooltip="AI Support"
                  onClick={() => {}}
                  bgColor="bg-[#c2a2ff] hover:bg-[#c6aafc]"
                />
              )}
              <DesktopActionButton
                icon={
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        opacity="0.5"
                        d="M19.7165 20.3624C21.143 19.5846 22 18.5873 22 17.5C22 16.3475 21.0372 15.2961 19.4537 14.5C17.6226 13.5794 14.9617 13 12 13C9.03833 13 6.37738 13.5794 4.54631 14.5C2.96285 15.2961 2 16.3475 2 17.5C2 18.6525 2.96285 19.7039 4.54631 20.5C6.37738 21.4206 9.03833 22 12 22C15.1066 22 17.8823 21.3625 19.7165 20.3624Z"
                        fill="#1d4c62"
                      ></path>{" "}
                      <path
                        fillRule="evenodd"
                        clip-rule="evenodd"
                        d="M5 8.51464C5 4.9167 8.13401 2 12 2C15.866 2 19 4.9167 19 8.51464C19 12.0844 16.7658 16.2499 13.2801 17.7396C12.4675 18.0868 11.5325 18.0868 10.7199 17.7396C7.23416 16.2499 5 12.0844 5 8.51464ZM12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
                        fill="#1d4c62"
                      ></path>{" "}
                    </g>
                  </svg>
                }
                tooltip="Map"
                href="/map"
                bgColor="bg-[#E6F7FF]  hover:bg-blue-100"
              />
              {/* Recipes - Only show for non-guest logged-in users */}
              {session?.user && !isGuest && (
                <DesktopActionButton
                  icon={
                    <svg
                      width="30px"
                      height="30px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M4 8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8Z"
                          stroke="#c2ab51"
                          strokeWidth="1.5"
                        ></path>{" "}
                        <path
                          d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
                          stroke="#c2ab51"
                          strokeWidth="1.5"
                        ></path>{" "}
                        <path
                          opacity="0.5"
                          d="M8 7H16"
                          stroke="#c2ab51"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>{" "}
                        <path
                          opacity="0.5"
                          d="M8 10.5H13"
                          stroke="#c2ab51"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>{" "}
                        <path
                          opacity="0.5"
                          d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45"
                          stroke="#c2ab51"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  }
                  tooltip="Recipes"
                  href="/Recipes"
                  bgColor="bg-[#FFFAE6]  hover:bg-yellow-100"
                />
              )}
            </div>
          )}
          {/* Main Floating Button (desktop) */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#115e59] text-white shadow-lg transition hover:bg-[#197a74]"
          >
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                ></circle>{" "}
                <path
                  opacity="0.5"
                  d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                ></path>{" "}
              </g>
            </svg>
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {router.pathname !== "/Reels" && !router.pathname.startsWith("/Cars/become-partner") && (
        <nav className="notranslate fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-gray-200 bg-white py-4 shadow-lg transition-colors duration-200 dark:border-gray-700 dark:bg-[var(--bg-primary)] md:hidden">
          {/* Reels - First icon */}
          <NavItem
            href="/Reels"
            icon={
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M19.5617 7C19.7904 5.69523 18.7863 4.5 17.4617 4.5H6.53788C5.21323 4.5 4.20922 5.69523 4.43784 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    d="M17.4999 4.5C17.5283 4.24092 17.5425 4.11135 17.5427 4.00435C17.545 2.98072 16.7739 2.12064 15.7561 2.01142C15.6497 2 15.5194 2 15.2588 2H8.74099C8.48035 2 8.35002 2 8.24362 2.01142C7.22584 2.12064 6.45481 2.98072 6.45704 4.00434C6.45727 4.11135 6.47146 4.2409 6.49983 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    d="M21.1935 16.793C20.8437 19.2739 20.6689 20.5143 19.7717 21.2572C18.8745 22 17.5512 22 14.9046 22H9.09536C6.44881 22 5.12553 22 4.22834 21.2572C3.33115 20.5143 3.15626 19.2739 2.80648 16.793L2.38351 13.793C1.93748 10.6294 1.71447 9.04765 2.66232 8.02383C3.61017 7 5.29758 7 8.67239 7H15.3276C18.7024 7 20.3898 7 21.3377 8.02383C22.0865 8.83268 22.1045 9.98979 21.8592 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M14.5812 13.6159C15.1396 13.9621 15.1396 14.8582 14.5812 15.2044L11.2096 17.2945C10.6669 17.6309 10 17.1931 10 16.5003L10 12.32C10 11.6273 10.6669 11.1894 11.2096 11.5258L14.5812 13.6159Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  ></path>
                </g>
              </svg>
            }
            label="Reels"
          />

          {/* Recipes - Only show for logged-out users or guest users - Second icon */}
          {(!session?.user || isGuest) && (
            <NavItem
              href="/Recipes"
              icon={
                <svg
                  fill="currentColor"
                  height="30px"
                  width="30px"
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 511.999 511.999"
                  xmlSpace="preserve"
                  className="text-gray-600 transition-colors duration-200 dark:text-white"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <g>
                      <g>
                        <path d="M324.799,68.799c-103.222,0-187.2,83.978-187.2,187.2s83.978,187.2,187.2,187.2s187.2-83.978,187.2-187.2 S428.022,68.799,324.799,68.799z M324.799,407.169c-83.354,0-151.168-67.814-151.168-151.168s67.814-151.17,151.168-151.17 s151.168,67.814,151.168,151.168S408.154,407.169,324.799,407.169z"></path>
                      </g>
                    </g>
                    <g>
                      <g>
                        <path d="M324.799,148.019c-59.541,0-107.981,48.44-107.981,107.981s48.44,107.981,107.981,107.981S432.78,315.54,432.78,255.999 S384.34,148.019,324.799,148.019z M324.799,327.95c-39.673,0-71.949-32.276-71.949-71.949s32.276-71.949,71.949-71.949 c39.673,0,71.949,32.276,71.949,71.949S364.472,327.95,324.799,327.95z"></path>
                      </g>
                    </g>
                    <g>
                      <g>
                        <path d="M110.491,68.799c-9.95,0-18.016,8.066-18.016,18.016v96.161H81.959V86.815c0-9.95-8.066-18.016-18.016-18.016 c-9.95,0-18.016,8.066-18.016,18.016v96.161h-9.896V86.815c0-9.95-8.066-18.016-18.016-18.016S0,76.866,0,86.815v99.764 c0,17.881,14.547,32.428,32.428,32.428h12.298v206.175c0,9.95,8.066,18.016,18.016,18.016s18.016-8.066,18.016-18.016V219.009 h15.321c17.881,0,32.428-14.547,32.428-32.428V86.815C128.507,76.866,120.441,68.799,110.491,68.799z"></path>
                      </g>
                    </g>
                  </g>
                </svg>
              }
              label="Recipes"
            />
          )}

          {/* Cars - Second icon */}
          <NavItem
            href="/Cars"
            icon={
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 dark:text-white">
                <path d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Cars"
          />

          {/* Central Home Button - Third (middle) */}
          <div className="z-50 -mt-12">
            <div
              className="flex h-16 w-16 cursor-pointer select-none flex-col items-center justify-center rounded-full border-2 border-green-500 bg-white text-2xl text-green-500 shadow-lg transition-transform active:scale-95 dark:bg-[var(--bg-primary)]"
              onTouchStart={handleHomeTouchStart}
              onTouchEnd={handleHomeTouchEnd}
              onMouseDown={handleHomeTouchStart}
              onMouseUp={handleHomeTouchEnd}
              onMouseLeave={handleHomeTouchEnd}
              onClick={handleHomeClick}
            >
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-green-500 dark:text-green-400"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M15 18H9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                </g>
              </svg>
            </div>
          </div>

          {/* Orders - Fourth icon - Show for all signed in users including guests */}
          <NavItem
            href="/CurrentPendingOrders"
            icon={
              <div className="relative inline-block">
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
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
                  </g>
                </svg>
                {pendingOrdersCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white dark:bg-red-600"
                    aria-label={`${pendingOrdersCount} pending orders`}
                  >
                    {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
                  </span>
                )}
              </div>
            }
            label="My Orders"
          />

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex flex-col items-center text-xs text-gray-600 transition-colors duration-200 hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
            >
              <span className="text-lg">
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-600 transition-colors duration-200 dark:text-white"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M12 12H12.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6H12.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 18H12.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </span>
            </button>

            {/* More Dropdown Menu */}
            {moreOpen && (
              <>
                {/* Backdrop Overlay to hide what's behind */}
                <div
                  className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
                  onClick={() => setMoreOpen(false)}
                />
                <div
                  className={`fixed bottom-[5.5rem] left-1/2 z-[10000] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 transform rounded-b-[1.5rem] rounded-t-[2.5rem] border p-3 shadow-2xl backdrop-blur-2xl duration-300 animate-in slide-in-from-bottom ${
                    theme === "dark"
                      ? "border-white/10 bg-[#0A0A0A]/95 text-white shadow-[0_30px_60px_-10px_rgba(0,0,0,1)]"
                      : "border-black/5 bg-white/95 text-gray-900 shadow-black/10"
                  }`}
                  ref={moreRef}
                >
                  {/* Guest Badge - Show for guest users */}
                  {isGuest && (
                    <div className="mx-3 mb-3 mt-2">
                      <button
                        onClick={() => {
                          setMoreOpen(false);
                          setShowUpgradeModal(true);
                        }}
                        className="group w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div
                          className={`flex items-center gap-4 rounded-[1.25rem] border px-5 py-4 shadow-sm transition-colors ${
                            theme === "dark"
                              ? "border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-500/5 group-hover:from-orange-500/20"
                              : "border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 group-hover:to-orange-200"
                          }`}
                        >
                          <svg
                            className="h-6 w-6 flex-shrink-0 text-orange-600 dark:text-orange-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <div className="flex min-w-0 flex-1 flex-col text-left">
                            <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                              Guest User
                            </span>
                            <span className="text-xs text-orange-600/90 dark:text-orange-400/90">
                              Tap to become a Plas member
                            </span>
                          </div>
                          <svg
                            className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Plas Package - Only visible when logged in */}
                  {session?.user && !isGuest && (
                    <MoreMenuItem
                      icon={
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-600 dark:text-gray-300"
                        >
                          <path
                            d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M14 20.889L12.777 21.5684C12.4934 21.726 12.3516 21.8047 12.2015 21.8356C12.0685 21.863 11.9315 21.863 11.7986 21.8356C11.6484 21.8047 11.5066 21.726 11.223 21.5684L3.82297 17.4573C3.52346 17.2909 3.37368 17.2077 3.26463 17.0893C3.16816 16.9847 3.09515 16.8606 3.05048 16.7254C3 16.5726 3 16.4013 3 16.0586V7.94153C3 7.59889 3 7.42757 3.05048 7.27477C3.09515 7.13959 3.16816 7.01551 3.26463 6.91082C3.37368 6.79248 3.52346 6.70928 3.82297 6.54288L11.223 2.43177C11.5066 2.27421 11.6484 2.19543 11.7986 2.16454C11.9315 2.13721 12.0685 2.13721 12.2015 2.16454C12.3516 2.19543 12.4934 2.27421 12.777 2.43177L20.177 6.54288C20.4766 6.70928 20.6263 6.79248 20.7354 6.91082C20.8318 7.01551 20.9049 7.13959 20.9495 7.27477C21 7.42757 21 7.59889 21 7.94153L21 12.5001M7.5 4.50008L16.5 9.50008M19 21.0001V15.0001M16 18.0001H22"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                      label="Plas Package"
                      href="#"
                      onClick={() => {
                        setMoreOpen(false);
                        setShowPackageModal(true);
                      }}
                    />
                  )}

                  {/* Profile - Only show for non-guest users */}
                  {session?.user && !isGuest && (
                    <MoreMenuItem
                      icon={
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-600 dark:text-gray-300"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <circle
                              cx="12"
                              cy="6"
                              r="4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </g>
                        </svg>
                      }
                      label="Profile"
                      href="/Myprofile"
                      onClick={() => setMoreOpen(false)}
                    />
                  )}

                  {/* Marketplace - Moved from bottom bar */}
                  {session?.user && !isGuest && (
                    <MoreMenuItem
                      icon={
                        <div className="relative inline-block">
                          <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 290.625 290.625"
                            width="20px"
                            height="20px"
                          >
                            <g>
                              <polygon
                                style={{ fill: "#2aea63" }}
                                points="39.511,192.188 147.323,192.188 137.948,239.063 53.573,239.063"
                              />
                              <rect
                                x="58.261"
                                y="187.5"
                                style={{ fill: "currentColor" }}
                                width="70.313"
                                height="9.375"
                              />
                              <rect
                                x="62.948"
                                y="210.938"
                                style={{ fill: "currentColor" }}
                                width="60.938"
                                height="9.375"
                              />
                              <path
                                style={{ fill: "currentColor" }}
                                d="M278.573,267.923l-84.722-55.069l-7.252-50.742l14.813-3.173l28.181-32.878l46.514-11.63 l-6.675,20.02l8.892,2.967l10.289-30.872l-20.798-20.798l-6.628,6.628l12.895,12.895l-49.669,12.417l-28.069,32.747l-11.086,2.377 l-5.592-39.155l-48.22-16.073l-47.475,66.478H64.669l29.658-93.211l92.841,13.927l44.072-70.519l5.639,11.273l8.386-4.195 L234.595,0h-26.334v9.375h14.981L182.48,74.597L87.82,60.398L54.834,164.063h-5.948v9.375h97.406l-12.188,60.938H52.645 L33.895,150H2.011v9.375h24.366l16.927,76.167c-4.983,2.17-8.48,7.125-8.48,12.895c0,5.62,3.338,10.444,8.114,12.694 c-2.142,3.052-3.427,6.741-3.427,10.744c0,10.341,8.409,18.75,18.75,18.75s18.75-8.409,18.75-18.75 c0-3.431-0.994-6.605-2.606-9.375h47.405c-1.617,2.77-2.611,5.944-2.611,9.375c0,10.341,8.409,18.75,18.75,18.75 s18.75-8.409,18.75-18.75s-8.409-18.75-18.75-18.75H48.886c-2.583,0-4.688-2.105-4.688-4.688s2.105-4.688,4.688-4.688h92.906 l15.052-75.258l20.569-4.406l7.758,54.309l87.956,57.173l-15.047,6.019l3.483,8.705l26.386-10.556v-31.298h-9.375L278.573,267.923 L278.573,267.923z M67.636,271.875c0,5.17-4.205,9.375-9.375,9.375s-9.375-4.205-9.375-9.375s4.205-9.375,9.375-9.375 S67.636,266.705,67.636,271.875z M147.323,271.875c0,5.17-4.205,9.375-9.375,9.375s-9.375-4.205-9.375-9.375 s4.205-9.375,9.375-9.375S147.323,266.705,147.323,271.875z M132.759,164.063H95.494l39.567-55.397l36.155,12.052l4.866,34.059 L132.759,164.063z"
                              />
                            </g>
                          </svg>
                          {marketplaceNotificationCount > 0 && (
                            <span
                              className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg"
                            >
                              {marketplaceNotificationCount > 9
                                ? "9+"
                                : marketplaceNotificationCount}
                            </span>
                          )}
                        </div>
                      }
                      label={t("nav.marketplace") || "Marketplace"}
                      href="/plasBusiness/portal"
                      onClick={() => setMoreOpen(false)}
                    />
                  )}

                  {/* Recipes - Only show for non-guest logged-in users */}
                  {session?.user && !isGuest && (
                    <MoreMenuItem
                      icon={
                        <svg
                          fill="currentColor"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          viewBox="0 0 511.999 511.999"
                          xmlSpace="preserve"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <g>
                              <g>
                                <path d="M324.799,68.799c-103.222,0-187.2,83.978-187.2,187.2s83.978,187.2,187.2,187.2s187.2-83.978,187.2-187.2 S428.022,68.799,324.799,68.799z M324.799,407.169c-83.354,0-151.168-67.814-151.168-151.168s67.814-151.17,151.168-151.17 s151.168,67.814,151.168,151.168S408.154,407.169,324.799,407.169z"></path>
                              </g>
                            </g>
                            <g>
                              <g>
                                <path d="M324.799,148.019c-59.541,0-107.981,48.44-107.981,107.981s48.44,107.981,107.981,107.981S432.78,315.54,432.78,255.999 S384.34,148.019,324.799,148.019z M324.799,327.95c-39.673,0-71.949-32.276-71.949-71.949s32.276-71.949,71.949-71.949 c39.673,0,71.949,32.276,71.949,71.949S364.472,327.95,324.799,327.95z"></path>
                              </g>
                            </g>
                            <g>
                              <g>
                                <path d="M110.491,68.799c-9.95,0-18.016,8.066-18.016,18.016v96.161H81.959V86.815c0-9.95-8.066-18.016-18.016-18.016 c-9.95,0-18.016,8.066-18.016,18.016v96.161h-9.896V86.815c0-9.95-8.066-18.016-18.016-18.016S0,76.866,0,86.815v99.764 c0,17.881,14.547,32.428,32.428,32.428h12.298v206.175c0,9.95,8.066,18.016,18.016,18.016s18.016-8.066,18.016-18.016V219.009 h15.321c17.881,0,32.428-14.547,32.428-32.428V86.815C128.507,76.866,120.441,68.799,110.491,68.799z"></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      }
                      label="Recipes"
                      href="/Recipes"
                      onClick={() => setMoreOpen(false)}
                    />
                  )}

                  {/* Messages - Only show for non-guest users */}
                  {session?.user && !isGuest && (
                    <MoreMenuItem
                      icon={
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-600 dark:text-gray-300"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
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
                          </g>
                        </svg>
                      }
                      label="Messages"
                      href="/Messages"
                      onClick={() => setMoreOpen(false)}
                      badgeCount={messageUnreadCount}
                    />
                  )}

                  <div
                    className={`mx-3 my-2 border-t ${
                      theme === "dark" ? "border-white/10" : "border-black/5"
                    }`}
                  ></div>

                  {!session?.user && (
                    <MoreMenuItem
                      icon={
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-600"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <path
                              d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 17L15 12L10 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 12H3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </svg>
                      }
                      label="Login"
                      href="/Auth/Login"
                      onClick={() => setMoreOpen(false)}
                    />
                  )}

                  <button
                    onClick={() => {
                      handleThemeToggle();
                      setMoreOpen(false);
                    }}
                    className="mx-2 flex w-auto items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-lg">
                      {theme === "dark" ? (
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-yellow-500"
                        >
                          <path
                            d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 2V4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 20V22"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.93 4.93L6.34 6.34"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17.66 17.66L19.07 19.07"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 12H4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 12H22"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.34 17.66L4.93 19.07"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19.07 4.93L17.66 6.34"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-600 dark:text-gray-300"
                        >
                          <path
                            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1">
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      )}

      {/* Guest Upgrade Modal */}
      <GuestUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      {/* Package Delivery Modal */}
      <PackageDeliveryModal
        open={showPackageModal}
        onClose={() => setShowPackageModal(false)}
      />

      {/* Home Actions Modal */}
      <HomeActionsModal
        open={showHomeActions}
        onClose={() => setShowHomeActions(false)}
      />
    </>
  );
}
