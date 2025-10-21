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
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function UserProfile() {
  const router = useRouter();
  const { role, toggleRole, logout } = useAuth();
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

  // Show loading state while determining screen size
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-24 w-24 animate-pulse rounded-full bg-gray-200" />
          <div className="mx-auto mb-2 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto h-4 w-24 animate-pulse rounded bg-gray-200" />
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
    />
  );
}
