import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Modal } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";
import UserReferral from "./UserReferral";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { useAuth as useAuthHook } from "../../hooks/useAuth";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useLanguage } from "../../context/LanguageContext";

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
}: DesktopProfileProps) {
  const router = useRouter();
  const { role, toggleRole, logout } = useAuth();
  const { isGuest } = useAuthHook();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("account");

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
          <div className="lg:col-span-4">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
              <div className="mb-4 sm:mb-0 sm:mr-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-green-100 bg-white shadow-lg dark:border-green-900/30">
                  <Image
                    src={
                      user?.profile_picture ||
                      (role === "shopper"
                        ? "/images/userProfile.png"
                        : "/images/userProfile.png")
                    }
                    alt="Profile"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Member since{" "}
                  {user
                    ? new Date(user.created_at).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {isGuest ? (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      Guest User
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Premium Member
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    {orderCount} Orders
                  </span>
                  {loadingShopper ? (
                    <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                  ) : shopperStatus?.active ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Active Plasa
                    </span>
                  ) : shopperStatus ? (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {shopperStatus.status === "pending"
                        ? "Pending Plasa"
                        : shopperStatus.status}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Account Summary Section */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50/50 p-2 dark:from-green-900/20 dark:to-emerald-900/10">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Total Orders
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {orderCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50/50 p-2 dark:from-blue-900/20 dark:to-indigo-900/10">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Earnings
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(walletBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="lg:col-span-4">
            <div className="space-y-3">
              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2">
                {/* Switch to Shopper / Become Shopper Button */}
                {loadingShopper ? (
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                ) : shopperStatus?.active ? (
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={async () => {
                      const nextRole = role === "user" ? "shopper" : "user";
                      setIsSwitchingRole(true);
                      try {
                        await initiateRoleSwitch(
                          nextRole as "user" | "shopper"
                        );
                        toggleRole();
                        toast.success(
                          `Switched to ${
                            nextRole === "user" ? "User" : "Shopper"
                          }`
                        );
                      } catch (error) {
                        console.error("Error updating role:", error);
                        toast.error("Failed to switch account");
                      } finally {
                        setIsSwitchingRole(false);
                      }
                    }}
                    disabled={isSwitchingRole}
                  >
                    <svg
                      className="h-3.5 w-3.5 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    <span className="text-xs !text-white">
                      {isSwitchingRole
                        ? t("common.loading")
                        : role === "user"
                        ? t("nav.switchToShopper")
                        : t("nav.switchToUser")}
                    </span>
                  </button>
                ) : (
                  <button
                    className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold !text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isGuest
                        ? "bg-gradient-to-r from-gray-400 to-gray-500"
                        : shopperStatus?.needCollection
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : shopperStatus?.status === "pending" ||
                          shopperStatus?.status === "under_review"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : "bg-gradient-to-r from-green-500 to-emerald-600"
                    }`}
                    onClick={() => {
                      if (isGuest) {
                        toast.error(
                          "Please create a full account to become a shopper"
                        );
                        return;
                      }
                      handleBecomePlasa({
                        preventDefault: () => {},
                      } as React.MouseEvent);
                    }}
                    disabled={
                      isGuest ||
                      shopperStatus?.status === "pending" ||
                      shopperStatus?.status === "under_review"
                    }
                  >
                    <svg
                      className="h-3.5 w-3.5 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {shopperStatus?.needCollection ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      ) : shopperStatus?.status === "pending" ||
                        shopperStatus?.status === "under_review" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      )}
                    </svg>
                    <span className="text-xs !text-white">
                      {isGuest
                        ? "Not Available"
                        : shopperStatus?.needCollection
                        ? "Update"
                        : shopperStatus?.status === "pending" ||
                          shopperStatus?.status === "under_review"
                        ? "Pending"
                        : "Become Shopper"}
                    </span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-2.5 text-xs font-semibold !text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  onClick={async () => {
                    try {
                      toast.success("Logging out...");
                      await logout();
                    } catch (error) {
                      console.error("Logout error:", error);
                      toast.error("Failed to logout");
                    }
                  }}
                >
                  <svg
                    className="h-3.5 w-3.5 !text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="text-xs !text-white">{t("nav.logout")}</span>
                </button>
              </div>

              {/* Default Address Section */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-2.5 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex items-start gap-2.5">
                  <svg
                    className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Default Address
                      </h3>
                    </div>
                    {loadingAddr ? (
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                    ) : selectedAddr || defaultAddr ? (
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        {(selectedAddr || defaultAddr).street},{" "}
                        {(selectedAddr || defaultAddr).city}{" "}
                        {(selectedAddr || defaultAddr).postal_code}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No address selected
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddrModal(true)}
                    className="ml-1.5 shrink-0 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-medium !text-white shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:from-green-600 dark:to-emerald-700"
                  >
                    {selectedAddr || defaultAddr ? "Change" : "Select"}
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
            onSelect={setActiveTab}
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
                key: "orders",
                label: "Orders",
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
          {activeTab === "account" && (
            <div className="p-6">
              <UserAccount />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="p-6">
              <UserRecentOrders
                filter="all"
                orders={userOrders}
                loading={ordersLoading}
                onRefresh={refreshOrders}
              />
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="p-6">
              <UserAddress />
            </div>
          )}

          {activeTab === "payment" && (
            <div className="p-6">
              <UserPayment />
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="p-6">
              <UserPreference />
            </div>
          )}

          {activeTab === "referrals" &&
            (referralStatus?.approved || !referralStatus?.registered) && (
              <div className="p-6">
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
    </div>
  );
}
