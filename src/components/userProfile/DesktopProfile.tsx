import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Modal } from "rsuite";
import UserAISubscriptions from "./UserAISubscriptions";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";
import UserReferral from "./UserReferral";
import AvatarPickerModal from "./AvatarPickerModal";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { useAuth as useAuthHook } from "../../hooks/useAuth";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useLanguage } from "../../context/LanguageContext";
import {
  User,
  MapPin,
  ShoppingBag,
  Wallet,
  LogOut,
  Camera,
  Calendar,
  ShieldCheck,
  Zap,
  Plus,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";

interface DesktopProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    created_at: string;
  } | null;
  orderCount: number;
  walletBalance: number;
  userOrders: any[];
  ordersLoading: boolean;
  defaultAddr: any | null;
  loadingAddr: boolean;
  selectedAddr: any | null;
  setSelectedAddr: (addr: any) => void;
  addresses: any[];
  showAddrModal: boolean;
  setShowAddrModal: (show: boolean) => void;
  shopperStatus: {
    active: boolean;
    status: string;
    collection_comment?: string;
    needCollection?: boolean;
  } | null;
  loadingShopper: boolean;
  isSwitchingRole: boolean;
  setIsSwitchingRole: (switching: boolean) => void;
  refreshOrders: () => void;
  referralStatus: {
    registered: boolean;
    approved: boolean;
    status?: string;
  } | null;
  loadingReferral: boolean;
  onAvatarChange: (newUrl: string) => void;
  isAISubscribed: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

export default function DesktopProfile({
  user,
  orderCount,
  walletBalance,
  userOrders,
  ordersLoading,
  defaultAddr,
  loadingAddr,
  selectedAddr,
  setSelectedAddr,
  addresses,
  showAddrModal,
  setShowAddrModal,
  shopperStatus,
  loadingShopper,
  isSwitchingRole,
  setIsSwitchingRole,
  refreshOrders,
  referralStatus,
  loadingReferral,
  onAvatarChange,
  isAISubscribed,
  isLoggingOut,
  onLogout,
}: DesktopProfileProps) {
  const router = useRouter();
  const { role, toggleRole, logout } = useAuth();
  const { isGuest } = useAuthHook();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("account");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  // OTP verification state for role switch
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [pendingRole, setPendingRole] = useState<"user" | "shopper" | null>(
    null
  );
  // Keep visited tab content mounted to avoid refetching when switching tabs
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["account"])
  );

  // When selecting a tab, add to visited so we keep content mounted (cached, no refetch on switch)
  const handleTabSelect = (key: string | null) => {
    if (key) {
      setVisitedTabs((prev) => new Set(Array.from(prev).concat(key)));
      setActiveTab(key);
    }
  };

  // Reset tab if user tries to access referrals but is registered and pending
  useEffect(() => {
    if (
      activeTab === "referrals" &&
      !loadingReferral &&
      referralStatus?.registered &&
      !referralStatus?.approved
    ) {
      setActiveTab("account");
    }
  }, [activeTab, referralStatus, loadingReferral]);

  // Handle switch with OTP verification
  const handleSwitchWithOTP = async () => {
    const nextRole = role === "user" ? "shopper" : "user";
    setPendingRole(nextRole);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(otp);
    setOtpInput("");
    setOtpError("");
    setIsSendingOTP(true);
    try {
      await fetch("/api/shopper/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, email: user?.email, phone: user?.phone }),
      });
      setShowOTPModal(true);
    } catch {
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpInput.trim() !== generatedOTP) {
      setOtpError("Invalid code. Please try again.");
      return;
    }
    setShowOTPModal(false);
    setIsSwitchingRole(true);
    try {
      await initiateRoleSwitch(pendingRole!);
      toggleRole();
      toast.success(
        `Switched to ${pendingRole === "user" ? "User" : "Shopper"}`
      );
    } catch {
      toast.error("Failed to switch account");
    } finally {
      setIsSwitchingRole(false);
      setPendingRole(null);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Collection Notification Banner */}
      {shopperStatus?.needCollection && (
        <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4 dark:bg-orange-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Application Update Required
              </h3>
              <div className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                <p>
                  Your shopper application requires some changes. Please review
                  the feedback below and update your application.
                </p>
                {shopperStatus.collection_comment && (
                  <div className="mt-2 rounded-md bg-orange-100 p-3 dark:bg-orange-800/30">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Plas Agent Feedback:
                    </p>
                    <p className="mt-1 text-orange-700 dark:text-orange-300">
                      {shopperStatus.collection_comment}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    className="rounded-md bg-orange-50 px-2 py-1.5 text-sm font-medium text-orange-800 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-orange-50 dark:bg-orange-800/30 dark:text-orange-200 dark:hover:bg-orange-800/50"
                    onClick={() => router.push("/Myprofile/become-shopper")}
                  >
                    Update Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Section - User Profile & Account Manager */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* User Profile Section */}
          <div className="lg:col-span-5">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:text-left">
              <div className="relative">
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl ring-4 ring-green-500/10 transition-all hover:ring-green-500/30 dark:border-gray-800 dark:ring-green-500/5 sm:h-28 sm:w-28"
                  aria-label="Change avatar"
                >
                  <Image
                    src={user?.profile_picture || "/images/userProfile.png"}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                </button>
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 dark:border-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                    {user?.name}
                  </h2>
                  {isGuest ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
                      <User className="h-3 w-3" /> Guest
                    </span>
                  ) : isAISubscribed && shopperStatus?.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700 dark:bg-green-950/30 dark:text-green-400">
                      <ShieldCheck className="h-3 w-3" /> Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                      <ShieldCheck className="h-3 w-3" /> Regular
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 opacity-50" />
                    <span>
                      Member since{" "}
                      {user
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {loadingShopper ? (
                    <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
                  ) : shopperStatus?.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      <Zap className="h-3 w-3" /> Active Plasa
                    </span>
                  ) : shopperStatus ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <RefreshCw className="h-3 w-3" />{" "}
                      {shopperStatus.status === "pending"
                        ? "Application Pending"
                        : shopperStatus.status}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Account Summary Section */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-5 shadow-xl shadow-green-500/20 transition-all hover:-translate-y-1">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest !text-white/70">
                      Total Orders
                    </p>
                    <h3 className="text-3xl font-black !text-white">
                      {orderCount}
                    </h3>
                  </div>
                  <div className="rounded-xl bg-white/20 p-3 backdrop-blur-md">
                    <ShoppingBag className="h-6 w-6 !text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-150" />
              </div>

              {shopperStatus?.active && (
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest !text-white/70">
                        Wallet Balance
                      </p>
                      <h3 className="text-3xl font-black !text-white">
                        {formatCurrency(walletBalance)}
                      </h3>
                    </div>
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-md">
                      <Wallet className="h-6 w-6 !text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-150" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & Address Section */}
          <div className="lg:col-span-3">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="space-y-3">
                {/* Become a Plasa / Switch Service Button */}
                {!loadingShopper && (
                  <button
                    onClick={(e) => {
                      if (shopperStatus?.active) {
                        if (isGuest) {
                          toast.error(
                            "Please create a full account to switch service"
                          );
                          return;
                        }
                        handleSwitchWithOTP();
                      } else {
                        if (isGuest) {
                          toast.error(
                            "Please create a full account to become a plasa"
                          );
                          return;
                        }
                        handleBecomePlasa(e);
                      }
                    }}
                    disabled={
                      isSwitchingRole ||
                      isSendingOTP ||
                      (!shopperStatus?.active &&
                        (shopperStatus?.status === "pending" ||
                          shopperStatus?.status === "under_review"))
                    }
                    className={`relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest !text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                      shopperStatus?.active
                        ? "bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/20 hover:from-green-600 hover:to-emerald-700"
                    }`}
                  >
                    {isSwitchingRole || isSendingOTP ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : shopperStatus?.active ? (
                      <ArrowRightLeft className="h-4 w-4" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    <span>
                      {isSendingOTP
                        ? "Sending Code..."
                        : isSwitchingRole
                        ? "Switching..."
                        : shopperStatus?.active
                        ? "Switch Service"
                        : "Become a Plasa"}
                    </span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white active:scale-95 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                >
                  {isLoggingOut ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>{isLoggingOut ? "Exiting..." : t("nav.logout")}</span>
                </button>
              </div>

              {/* Default Address Section */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-green-500/30 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Default Location
                    </p>
                    <div className="mt-1">
                      {loadingAddr ? (
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                      ) : selectedAddr || defaultAddr ? (
                        <p className="truncate text-xs font-bold text-gray-700 dark:text-gray-200">
                          {(selectedAddr || defaultAddr).street},{" "}
                          {(selectedAddr || defaultAddr).city}
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-gray-400">
                          No address set
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddrModal(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:scale-110 active:scale-95 dark:bg-gray-800"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-gray-400 hover:text-green-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full">
        <div className="scrollbar-hide mb-6 overflow-x-auto whitespace-nowrap rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Nav
            appearance="default"
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="flex min-w-max gap-2"
          >
            {[
              {
                key: "account",
                label: t("nav.account"),
                icon: (
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
              },
              {
                key: "ai-subscriptions",
                label: "AI Subscriptions",
                icon: (
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                ),
              },
              {
                key: "addresses",
                label: t("nav.addresses"),
                icon: (
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
              },
              // Hide payment tab for guests
              ...(!isGuest
                ? [
                    {
                      key: "payment",
                      label: t("nav.payment"),
                      icon: (
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      ),
                    },
                  ]
                : []),
              {
                key: "preferences",
                label: "Preferences",
                icon: (
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                ),
              },
              // Show referrals tab if user is approved OR not registered (so they can register)
              // Hide if registered but pending approval OR if user is a guest
              ...(!loadingReferral &&
              !isGuest &&
              (referralStatus?.approved || !referralStatus?.registered)
                ? [
                    {
                      key: "referrals",
                      label: "Referrals",
                      icon: (
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      ),
                    },
                  ]
                : []),
            ].map((tab) => (
              <Nav.Item
                key={tab.key}
                eventKey={tab.key}
                className={`!bg-transparent !px-4 !py-2 !text-sm hover:!bg-transparent ${
                  activeTab === tab.key
                    ? "font-semibold !text-green-500 dark:!text-green-400"
                    : "!text-inherit hover:!text-green-500 dark:hover:!text-green-400"
                }`}
              >
                <div className="flex items-center">
                  {tab.icon}
                  {tab.label}
                </div>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {visitedTabs.has("account") && (
            <div
              className={`p-6 ${activeTab !== "account" ? "hidden" : ""}`}
              aria-hidden={activeTab !== "account"}
            >
              <UserAccount />
            </div>
          )}

          {visitedTabs.has("ai-subscriptions") && (
            <div
              className={`p-6 ${
                activeTab !== "ai-subscriptions" ? "hidden" : ""
              }`}
              aria-hidden={activeTab !== "ai-subscriptions"}
            >
              <UserAISubscriptions />
            </div>
          )}

          {visitedTabs.has("addresses") && (
            <div
              className={`p-6 ${activeTab !== "addresses" ? "hidden" : ""}`}
              aria-hidden={activeTab !== "addresses"}
            >
              <UserAddress />
            </div>
          )}

          {visitedTabs.has("payment") && (
            <div
              className={`p-6 ${activeTab !== "payment" ? "hidden" : ""}`}
              aria-hidden={activeTab !== "payment"}
            >
              <UserPayment />
            </div>
          )}

          {visitedTabs.has("preferences") && (
            <div
              className={`p-6 ${activeTab !== "preferences" ? "hidden" : ""}`}
              aria-hidden={activeTab !== "preferences"}
            >
              <UserPreference />
            </div>
          )}

          {visitedTabs.has("referrals") &&
            (referralStatus?.approved || !referralStatus?.registered) && (
              <div
                className={`p-6 ${activeTab !== "referrals" ? "hidden" : ""}`}
                aria-hidden={activeTab !== "referrals"}
              >
                <UserReferral />
              </div>
            )}
        </div>

        {/* Address selection modal */}
        <Modal
          open={showAddrModal}
          onClose={() => setShowAddrModal(false)}
          size="lg"
          className="[&_.rs-modal-content]:dark:bg-gray-800"
        >
          <Modal.Header>
            <Modal.Title className="text-inherit">
              Select an Address
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {addresses.length ? (
              addresses.map((addr) => (
                <Panel
                  key={addr.id}
                  bordered
                  className="mb-2 bg-white transition-colors duration-200 dark:bg-gray-700"
                >
                  <h4 className="font-bold text-inherit">{addr.street}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {addr.city}, {addr.postal_code}
                  </p>
                  <Button
                    size="sm"
                    appearance="primary"
                    className="mt-2 !bg-green-500 text-white hover:!bg-green-600"
                    onClick={() => {
                      setSelectedAddr(addr);
                      Cookies.set("delivery_address", JSON.stringify(addr));
                      setShowAddrModal(false);
                    }}
                  >
                    Select
                  </Button>
                </Panel>
              ))
            ) : (
              <p className="text-inherit">No addresses saved.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => setShowAddrModal(false)}
              className="text-inherit hover:text-green-500 dark:hover:text-green-400"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={user?.profile_picture}
        onAvatarSaved={onAvatarChange}
      />

      {/* OTP Verification Modal for Role Switch */}
      {showOTPModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowOTPModal(false)}
          />
          {/* Modal Card */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

            <div className="p-8">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mb-1 text-center text-2xl font-black text-gray-900 dark:text-white">
                Verify It&apos;s You
              </h2>
              <p className="mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
                We sent a 4-digit code to your phone/email. Enter it below to
                confirm the profile switch.
              </p>

              {/* OTP Input */}
              <div className="mt-6">
                <input
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ""));
                    setOtpError("");
                  }}
                  placeholder="· · · ·"
                  className={`w-full rounded-2xl border-2 bg-gray-50 px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-gray-900 outline-none transition-all dark:bg-gray-800 dark:text-white ${
                    otpError
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-emerald-500 dark:border-gray-700"
                  }`}
                  autoFocus
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    otpInput.length === 4 &&
                    handleVerifyOTP()
                  }
                />
                {otpError && (
                  <p className="mt-2 text-center text-sm font-semibold text-red-500">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOTP}
                  disabled={otpInput.length !== 4}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-emerald-700 active:scale-95 disabled:opacity-40"
                >
                  Confirm
                </button>
              </div>

              {/* Resend */}
              <p className="mt-4 text-center text-xs text-gray-400">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={handleSwitchWithOTP}
                  className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
