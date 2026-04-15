import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Input, Dropdown, Modal } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";
import MobileProfile from "./MobileProfile";
import DesktopProfile from "./DesktopProfile";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { LogOut, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function UserProfile() {
  const router = useRouter();
  const { role, toggleRole, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const isMobile = useMediaQuery("(max-width: 768px)");
  // User data state
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    created_at: string;
  } | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  // Wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(0);
  // User orders state
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  // Default address state
  const [defaultAddr, setDefaultAddr] = useState<any | null>(null);
  const [loadingAddr, setLoadingAddr] = useState<boolean>(true);
  // State for temporary selected address (not persisted as default)
  const [selectedAddr, setSelectedAddr] = useState<any | null>(null);
  // Address selection modal state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddrModal, setShowAddrModal] = useState<boolean>(false);
  // Shopper status
  const [shopperStatus, setShopperStatus] = useState<{
    active: boolean;
    status: string;
    collection_comment?: string;
    needCollection?: boolean;
  } | null>(null);
  const [loadingShopper, setLoadingShopper] = useState<boolean>(true);
  // Role switching state
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);
  // Referral program status
  const [referralStatus, setReferralStatus] = useState<{
    registered: boolean;
    approved: boolean;
    status?: string;
  } | null>(null);
  const [loadingReferral, setLoadingReferral] = useState<boolean>(true);
  // AI Subscription status
  const [isAISubscribed, setIsAISubscribed] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // On mount, load any previously selected delivery address from cookie
  useEffect(() => {
    const saved = Cookies.get("delivery_address");
    if (saved) {
      try {
        setSelectedAddr(JSON.parse(saved));
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  // Load current user data
  useEffect(() => {
    setLoading(true);
    fetch("/api/user")
      .then((res) => res.json())
      .then(
        (data: { user: any; orderCount: number; walletBalance?: number }) => {
          setUser(data.user);
          setOrderCount(data.orderCount);
          // Set wallet balance if available, otherwise default to 0
          setWalletBalance(data.walletBalance || 0);
        }
      )
      .catch((err) => console.error("Failed to load user profile:", err))
      .finally(() => setLoading(false));
  }, []);

  // Check referral program status
  useEffect(() => {
    if (!user?.id) return;

    setLoadingReferral(true);
    fetch("/api/referrals/check-status")
      .then((res) => res.json())
      .then((data) => {
        setReferralStatus({
          registered: data.registered || false,
          approved: data.approved || false,
          status: data.status,
        });
      })
      .catch((err) => {
        console.error("Failed to check referral status:", err);
        setReferralStatus({
          registered: false,
          approved: false,
        });
      })
      .finally(() => setLoadingReferral(false));
  }, [user?.id]);

  // Check if user is a shopper and get status
  useEffect(() => {
    if (!user?.id) return;

    setLoadingShopper(true);
    fetch("/api/queries/check-shopper-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: user.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.shopper) {
          setShopperStatus({
            active: data.shopper.active,
            status: data.shopper.status,
            collection_comment: data.shopper.collection_comment,
            needCollection: data.shopper.needCollection,
          });
        } else {
          setShopperStatus(null);
        }
      })
      .catch((err) => {
        console.error("Failed to check shopper status:", err);
        setShopperStatus(null);
      })
      .finally(() => setLoadingShopper(false));
  }, [user?.id]);

  // Check AI Subscription status
  useEffect(() => {
    if (!user?.id) return;

    fetch("/api/ai/usage-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p256dh: "" }), // Passing empty as we just need subscription status
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAISubscribed(data.isSubscribed || false);
      })
      .catch((err) => {
        console.error("Failed to check AI status:", err);
        setIsAISubscribed(false);
      });
  }, [user?.id]);

  // Handle click on "Become a Plasa" button
  const handleBecomePlasa = (e: React.MouseEvent) => {
    // If button is disabled (under review), don't do anything
    if (
      shopperStatus?.status === "pending" ||
      shopperStatus?.status === "under_review"
    ) {
      e.preventDefault();
      return;
    }

    if (shopperStatus) {
      // If needCollection is true, allow editing the application
      if (shopperStatus.needCollection) {
        router.push("/Myprofile/become-shopper");
        return;
      }

      e.preventDefault();

      // Show toast with current status
      if (shopperStatus.active) {
        toast.success("You are already an active Plasa!");
      } else {
        toast(`Your application is ${shopperStatus.status}`, {
          icon: "⏳",
          duration: 5000,
        });

        toast(
          "Your application is still under review. Please check back later.",
          {
            duration: 5000,
          }
        );
      }
    } else {
      // If not a shopper, proceed to the application page
      router.push("/Myprofile/become-shopper");
    }
  };

  // Load user orders
  useEffect(() => {
    if (!user?.id) return; // Only load orders if we have a user ID

    setOrdersLoading(true);
    authenticatedFetch("/api/queries/orders")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Verify orders belong to the current user
        const filteredOrders = (data.orders || []).filter(
          (order: any) => order.user_id === user.id
        );
        setUserOrders(filteredOrders);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        // Set empty array on error to prevent undefined errors
        setUserOrders([]);
      })
      .finally(() => setOrdersLoading(false));
  }, [user?.id]); // Re-fetch when user ID changes

  // Load default address
  useEffect(() => {
    setLoadingAddr(true);
    authenticatedFetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`Failed to load addresses (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const def = (data.addresses || []).find((a: any) => a.is_default);
        setDefaultAddr(def || null);
        setAddresses(data.addresses || []);
      })
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setDefaultAddr(null);
      })
      .finally(() => setLoadingAddr(false));
  }, []);

  // Function to refresh orders
  const refreshOrders = () => {
    if (!user?.id) return; // Only refresh if we have a user ID

    setOrdersLoading(true);
    authenticatedFetch("/api/queries/orders")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Verify orders belong to the current user
        const filteredOrders = (data.orders || []).filter(
          (order: any) => order.user_id === user.id
        );
        setUserOrders(filteredOrders);
      })
      .catch((err) => {
        console.error("Error refreshing orders:", err);
        // Set empty array on error to prevent undefined errors
        setUserOrders([]);
      })
      .finally(() => setOrdersLoading(false));
  };

  // Handle avatar change from avatar picker modal
  const handleAvatarChange = (newAvatarUrl: string) => {
    setUser((prev) =>
      prev ? { ...prev, profile_picture: newAvatarUrl } : prev
    );
  };

  // Handle premium logout with takeover
  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.success("Logging out...");
    // Give time for the "See you soon" takeover to show and progress to start
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      toast.error("Logout failed. Please try again.");
    }
  };

  const [logoutProgress, setLogoutProgress] = useState(0);

  useEffect(() => {
    if (isLoggingOut) {
      const interval = setInterval(() => {
        setLogoutProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    } else {
      setLogoutProgress(0);
    }
  }, [isLoggingOut]);

  // If logging out, show the takeover IMMEDIATELY and stop rendering other content
  if (isLoggingOut) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-center duration-500 animate-in fade-in"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo / Branding */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-md duration-700 animate-in zoom-in">
              <LogOut className="h-16 w-16 text-red-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              See you soon,{" "}
              <span className="text-red-500">{user?.name || "there"}</span>!
            </h1>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              We're securely closing your session.
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="relative mx-auto mt-12 h-2 w-full max-w-sm overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-800">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300 ease-out"
              style={{ width: `${logoutProgress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {logoutProgress}% Securely Logged Out
            </span>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center pt-12 opacity-30">
            <div className="flex gap-4">
              <div className="h-1 w-8 rounded-full bg-red-400" />
              <div className="h-1 w-12 rounded-full bg-red-500" />
              <div className="h-1 w-8 rounded-full bg-red-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while determining screen size
  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col md:bg-transparent"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {/* Mobile Header Background Space */}
        <div className="h-32 w-full animate-pulse rounded-b-3xl bg-gray-300/30 dark:bg-white/5 md:hidden" />

        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:mt-8">
          {/* Profile Details Skeleton */}
          <div
            className="-mt-16 mb-6 rounded-2xl border p-6 shadow-sm transition-colors duration-300 md:mt-0"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: theme === "dark" ? "#262626" : "#e5e7eb",
            }}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div
                className="h-20 w-20 shrink-0 animate-pulse rounded-full border-4 bg-gray-300/50 shadow-md dark:bg-white/10 md:h-24 md:w-24"
                style={{ borderColor: "var(--bg-secondary)" }}
              />
              <div className="w-full space-y-2 text-center sm:text-left">
                <div className="mx-auto mt-2 h-6 w-48 animate-pulse rounded-lg bg-gray-300/40 dark:bg-white/10 sm:mx-0 sm:mt-0" />
                <div className="mx-auto h-4 w-32 animate-pulse rounded-md bg-gray-300/20 dark:bg-white/5 sm:mx-0" />
                <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300/40 dark:bg-white/10" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-300/40 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Menus / Tabs Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-colors duration-300"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: theme === "dark" ? "#262626" : "#e5e7eb",
                }}
              >
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-gray-300/50 dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded-md bg-gray-300/40 dark:bg-white/10" />
                  <div className="h-3 w-48 animate-pulse rounded-md bg-gray-300/20 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render mobile or desktop based on screen size
  if (isMobile) {
    return (
      <MobileProfile
        user={user}
        orderCount={orderCount}
        walletBalance={walletBalance}
        userOrders={userOrders}
        ordersLoading={ordersLoading}
        defaultAddr={defaultAddr}
        loadingAddr={loadingAddr}
        selectedAddr={selectedAddr}
        setSelectedAddr={setSelectedAddr}
        addresses={addresses}
        showAddrModal={showAddrModal}
        setShowAddrModal={setShowAddrModal}
        shopperStatus={shopperStatus}
        loadingShopper={loadingShopper}
        isSwitchingRole={isSwitchingRole}
        setIsSwitchingRole={setIsSwitchingRole}
        refreshOrders={refreshOrders}
        referralStatus={referralStatus}
        loadingReferral={loadingReferral}
        isAISubscribed={isAISubscribed}
        onAvatarChange={handleAvatarChange}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <DesktopProfile
      user={user}
      orderCount={orderCount}
      walletBalance={walletBalance}
      userOrders={userOrders}
      ordersLoading={ordersLoading}
      defaultAddr={defaultAddr}
      loadingAddr={loadingAddr}
      selectedAddr={selectedAddr}
      setSelectedAddr={setSelectedAddr}
      addresses={addresses}
      showAddrModal={showAddrModal}
      setShowAddrModal={setShowAddrModal}
      shopperStatus={shopperStatus}
      loadingShopper={loadingShopper}
      isSwitchingRole={isSwitchingRole}
      setIsSwitchingRole={setIsSwitchingRole}
      refreshOrders={refreshOrders}
      referralStatus={referralStatus}
      loadingReferral={loadingReferral}
      isAISubscribed={isAISubscribed}
      onAvatarChange={handleAvatarChange}
      isLoggingOut={isLoggingOut}
      onLogout={handleLogout}
    />
  );
}
