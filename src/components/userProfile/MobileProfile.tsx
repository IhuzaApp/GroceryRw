import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Modal } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";
import UserPaymentCards from "./UserPaymentCards";
import UserReferral from "./UserReferral";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useLanguage } from "../../context/LanguageContext";

interface MobileProfileProps {
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

export default function MobileProfile({
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
}: MobileProfileProps) {
  const router = useRouter();
  const { role, toggleRole } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("");

  // Reset tab if user tries to access referrals but is registered and pending
  useEffect(() => {
    if (
      activeTab === "referrals" &&
      !loadingReferral &&
      referralStatus?.registered &&
      !referralStatus?.approved
    ) {
      setActiveTab("");
    }
  }, [activeTab, referralStatus, loadingReferral]);

  // Handle navigation to different sections
  const handleNavigation = (section: string) => {
    setActiveTab(section);
  };

  // Handle back navigation
  const handleBack = () => {
    setActiveTab("");
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

  // If a section is selected, show the full-page component
  if (activeTab) {
    return (
      <div className="min-h-screen">
        {/* Header with Background Image */}
        <div
          className="relative mb-6 h-32 overflow-hidden rounded-b-3xl"
          style={{
            marginTop: "-44px",
            marginLeft: "-16px",
            marginRight: "-16px",
          }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/assets/images/mobileheaderbg.jpg)",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Header Content - Back button and section title */}
          <div className="relative z-10 flex h-full items-center px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center !text-white transition-colors duration-200 hover:!text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <svg
                    className="h-5 w-5 !text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
              </button>
              <div>
                <h1 className="text-xl font-bold capitalize !text-white drop-shadow-sm">
                  {activeTab}
                </h1>
                <p className="text-sm !text-white">
                  Manage your {activeTab} settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-page content */}
        <div className="relative z-10 -mt-4">
          <div className="py-4">
            {activeTab === "account" && <UserAccount />}
            {activeTab === "orders" && (
              <UserRecentOrders
                filter="all"
                orders={userOrders}
                loading={ordersLoading}
                onRefresh={refreshOrders}
              />
            )}
            {activeTab === "addresses" && <UserAddress />}
            {activeTab === "payment" && <UserPayment />}
            {activeTab === "preferences" && <UserPreference />}
            {activeTab === "referrals" &&
              (referralStatus?.approved || !referralStatus?.registered) && (
                <UserReferral />
              )}
            {activeTab === "wallet" && <UserPaymentCards />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Section - User Profile & Account Manager */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* User Profile Section */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-green-100 bg-white shadow-md dark:border-green-900/30">
              <Image
                src={
                  user?.profile_picture ||
                  (role === "shopper"
                    ? "/images/userProfile.png"
                    : "/images/userProfile.png")
                }
                alt="Profile"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {user?.name || "Loading..."}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email || "Loading..."}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Premium
              </span>
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                {orderCount} Orders
              </span>
              {loadingShopper ? (
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
              ) : shopperStatus?.active ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Active Plasa
                </span>
              ) : shopperStatus ? (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {shopperStatus.status === "pending"
                    ? "Pending Plasa"
                    : shopperStatus.status}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Default Address Section */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-2.5 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
          <div className="flex items-start gap-2">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400"
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
            <div className="flex-1 min-w-0">
              <div className="mb-0.5 flex items-center gap-1.5">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Default Address
                </h3>
              </div>
              {loadingAddr ? (
                <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
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
              className="ml-1 shrink-0 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-2 py-1 text-xs font-medium !text-white shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:from-green-600 dark:to-emerald-700"
            >
              {selectedAddr || defaultAddr ? "Change" : "Select"}
            </button>
          </div>
        </div>
      </div>

      {/* Collection Notification Banner */}
      {shopperStatus?.needCollection && (
        <div className="mx-4 mt-4">
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
                    Your shopper application requires some changes. Please
                    review the feedback below and update your application.
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
        </div>
      )}

      {/* Navigation List */}
      <div className="space-y-0">
        {/* Orders */}
        <button
          onClick={() => handleNavigation("orders")}
          className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <svg
                  className="h-6 w-6 !text-white"
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
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("nav.orders")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View your order history
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {orderCount}
              </span>
              <svg
                className="h-5 w-5 !text-gray-400"
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
            </div>
          </div>
        </button>

        {/* Addresses */}
        <button
          onClick={() => handleNavigation("addresses")}
          className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <svg
                  className="h-6 w-6 !text-white"
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
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Addresses
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedAddr || defaultAddr
                    ? "Manage your addresses"
                    : "Add your address"}
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
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
          </div>
        </button>

        {/* Account Settings */}
        <button
          onClick={() => handleNavigation("account")}
          className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <svg
                  className="h-6 w-6 !text-white"
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
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("nav.account")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your account settings
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
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
          </div>
        </button>

        {/* Payment */}
        <button
          onClick={() => handleNavigation("payment")}
          className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                <svg
                  className="h-6 w-6 !text-white"
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
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage payment methods
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
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
          </div>
        </button>

        {/* Preferences */}
        <button
          onClick={() => handleNavigation("preferences")}
          className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <svg
                  className="h-6 w-6 !text-white"
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
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("nav.preferences")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize your experience
                </p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
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
          </div>
        </button>

        {/* Referrals - Show if approved OR not registered (so they can register) */}
        {!loadingReferral &&
          (referralStatus?.approved || !referralStatus?.registered) && (
            <button
              onClick={() => handleNavigation("referrals")}
              className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <svg
                      className="h-6 w-6 !text-white"
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
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Referrals
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Invite friends & earn rewards
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
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
              </div>
            </button>
          )}

        {/* Wallet */}
        <button
          onClick={() => handleNavigation("wallet")}
          className="w-full rounded-none border border-gray-100 bg-white p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <svg
                  className="h-6 w-6 !text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Wallet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your wallet balance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                {formatCurrency(walletBalance)}
              </span>
              <svg
                className="h-5 w-5 !text-gray-400"
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
            </div>
          </div>
        </button>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mb-6 mt-4 space-y-4">
        {/* Switch Account Button */}
        {loadingShopper ? (
          <div className="h-12 w-full animate-pulse rounded-none bg-gray-200 dark:bg-gray-700" />
        ) : shopperStatus?.active ? (
          <button
            className="flex w-full items-center justify-center rounded-none bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            onClick={async () => {
              const nextRole = role === "user" ? "shopper" : "user";
              setIsSwitchingRole(true);
              try {
                await initiateRoleSwitch(nextRole as "user" | "shopper");
                toggleRole();
                toast.success(
                  `Switched to ${nextRole === "user" ? "User" : "Shopper"}`
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
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg
                  className="h-5 w-5 !text-white"
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
              </div>
              <span className="!text-white">
                {isSwitchingRole
                  ? "Switching..."
                  : `Switch to ${role === "user" ? "Shopper" : "User"}`}
              </span>
            </div>
          </button>
        ) : (
          <button
            className={`flex w-full items-center justify-center rounded-none px-4 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${
              shopperStatus?.needCollection
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : shopperStatus?.status === "pending" ||
                  shopperStatus?.status === "under_review"
                ? "cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 opacity-75"
                : "bg-gradient-to-r from-green-500 to-green-600"
            }`}
            onClick={handleBecomePlasa}
            disabled={
              shopperStatus?.status === "pending" ||
              shopperStatus?.status === "under_review"
            }
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg
                  className="h-5 w-5 !text-white"
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
              </div>
              <span className="!text-white">
                {shopperStatus?.needCollection
                  ? "Update Application"
                  : shopperStatus?.status === "pending" ||
                    shopperStatus?.status === "under_review"
                  ? `Application ${
                      shopperStatus.status === "pending"
                        ? "Pending"
                        : "Under Review"
                    }`
                  : "Become a Shopper"}
              </span>
            </div>
          </button>
          )}

        {/* Logout Button */}
        <button
          className="flex w-full items-center justify-center rounded-none bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          onClick={async () => {
            try {
              // Call our custom logout API
              const response = await authenticatedFetch("/api/logout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                // Clear local storage
                localStorage.clear();
                sessionStorage.clear();

                toast.success("Logged out successfully");

                // Redirect to login page
                router.push("/");
              } else {
                throw new Error("Logout failed");
              }
            } catch (error) {
              console.error("Logout error:", error);
              toast.error("Failed to logout");
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-5 w-5 !text-white"
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
            </div>
            <span className="!text-white">{t("nav.logout")}</span>
          </div>
        </button>
      </div>

      {/* Address selection modal */}
      <Modal
        open={showAddrModal}
        onClose={() => setShowAddrModal(false)}
        size="lg"
        className="[&_.rs-modal-content]:dark:bg-gray-800"
      >
        <Modal.Header>
          <Modal.Title className="text-inherit">Select an Address</Modal.Title>
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
  );
}
