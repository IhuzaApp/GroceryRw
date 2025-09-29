import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Input, Dropdown, Modal } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { initiateRoleSwitch } from "../../lib/sessionRefresh";
import { authenticatedFetch } from "@lib/authenticatedFetch";

export default function UserProfile() {
  const router = useRouter();
  const { role, toggleRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Collection Notification Banner */}
      {shopperStatus?.needCollection && (
        <div className="md:col-span-12">
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
      {/* Left Column - User Info */}
      <div className="w-full md:col-span-3">
        <Panel
          shaded
          bordered
          bodyFill
          className="mx-auto max-w-md overflow-hidden bg-white transition-colors duration-200 dark:bg-gray-800 sm:max-w-full"
        >
          <div className="flex flex-col items-center px-4 py-6 sm:py-8">
            {loading ? (
              <>
                <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
                <div className="mt-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mt-6 h-8 w-full animate-pulse rounded bg-gray-200" />
              </>
            ) : (
              <>
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                  <Image
                    src={
                      user?.profile_picture ||
                      (role === "shopper"
                        ? "/images/userProfile.png"
                        : "/images/userProfile.png")
                    }
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h2 className="mt-3 text-center text-lg font-bold text-inherit sm:text-xl">
                  {user?.name}
                </h2>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Member since{" "}
                  {user
                    ? new Date(user.created_at).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Tag className="border-green-200 bg-green-100 text-green-600 dark:border-green-800 dark:bg-green-900 dark:text-green-300">
                    Premium Member
                  </Tag>
                  <Tag className="border-orange-200 bg-orange-100 text-orange-600 dark:border-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    {orderCount} Orders
                  </Tag>

                  {/* Shopper status badge */}
                  {loadingShopper ? (
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                  ) : shopperStatus?.active ? (
                    <Tag className="border-green-200 bg-green-100 text-green-600 dark:border-green-800 dark:bg-green-900 dark:text-green-300">
                      Active Plasa
                    </Tag>
                  ) : shopperStatus ? (
                    <Tag className="border-yellow-200 bg-yellow-100 text-yellow-600 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      {shopperStatus.status === "pending"
                        ? "Pending Plasa"
                        : shopperStatus.status}
                    </Tag>
                  ) : null}
                </div>

                {/* Default address under profile */}
                <div className="mt-4 w-full text-center">
                  <h3 className="font-medium text-inherit">Default Address</h3>
                  {loadingAddr ? (
                    <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200" />
                  ) : selectedAddr || defaultAddr ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(selectedAddr || defaultAddr).street},{" "}
                        {(selectedAddr || defaultAddr).city}{" "}
                        {(selectedAddr || defaultAddr).postal_code}
                      </p>
                      <Button
                        size="sm"
                        appearance="link"
                        className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
                        onClick={() => setShowAddrModal(true)}
                      >
                        Change Address
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No address selected
                      </p>
                      <Button
                        size="sm"
                        appearance="link"
                        className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
                        onClick={() => setShowAddrModal(true)}
                      >
                        Select Address
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel
          header="Account Summary"
          shaded
          bordered
          className="mt-4 bg-white transition-colors duration-200 dark:bg-gray-800"
        >
          {loading ? (
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="h-4 animate-pulse rounded bg-gray-200"
                  />
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Orders
                </span>
                <span className="font-bold text-inherit">{orderCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Wallet Balance
                </span>
                <span className="font-bold text-inherit">
                  {formatCurrency(walletBalance)}
                </span>
              </div>
            </div>
          )}
        </Panel>

        {/* Shopper Button and Logout Button Panel */}
        <div className="space-y-3 p-4">
          {/* Show either Become a Shopper button or Switch Profile button based on shopperStatus */}
          {loadingShopper ? (
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          ) : shopperStatus?.active ? (
            <button
              className="flex w-full items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              {isSwitchingRole
                ? "Switching..."
                : `Switch to ${role === "user" ? "Shopper" : "User"}`}
            </button>
          ) : (
            <button
              className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-sm text-white transition-colors duration-200 ${
                shopperStatus?.needCollection
                  ? "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                  : shopperStatus?.status === "pending" ||
                    shopperStatus?.status === "under_review"
                  ? "cursor-not-allowed bg-blue-500 opacity-75 dark:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              }`}
              onClick={handleBecomePlasa}
              disabled={
                shopperStatus?.status === "pending" ||
                shopperStatus?.status === "under_review"
              }
            >
              <svg
                className="mr-2 h-4 w-4"
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
            </button>
          )}

          {/* Logout Button */}
          <button
            className="flex w-full items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
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
            <svg
              className="mr-1 h-3 w-3"
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
            Logout
          </button>
        </div>
      </div>

      {/* Right Column - Tabs */}
      <div className="w-full md:col-span-9">
        <div className="scrollbar-hide mb-4 overflow-x-auto whitespace-nowrap">
          <Nav
            appearance="default"
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="flex min-w-max gap-2"
          >
            {[
              { key: "account", label: "Account" },
              { key: "orders", label: "Orders" },
              { key: "addresses", label: "Addresses" },
              { key: "payment", label: "Payment Methods" },
              { key: "preferences", label: "Preferences" },
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
                {tab.label}
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {activeTab === "account" && (
          <Panel
            shaded
            bordered
            className="bg-white transition-colors duration-200 dark:bg-gray-800"
          >
            <UserAccount />
          </Panel>
        )}

        {activeTab === "orders" && (
          <Panel
            shaded
            bordered
            className="bg-white transition-colors duration-200 dark:bg-gray-800"
          >
            <UserRecentOrders
              filter="all"
              orders={userOrders}
              loading={ordersLoading}
              onRefresh={refreshOrders}
            />
          </Panel>
        )}

        {activeTab === "addresses" && (
          <Panel
            shaded
            bordered
            className="bg-white transition-colors duration-200 dark:bg-gray-800"
          >
            <UserAddress />
          </Panel>
        )}

        {activeTab === "payment" && (
          <Panel
            shaded
            bordered
            className="bg-white transition-colors duration-200 dark:bg-gray-800"
          >
            <UserPayment />
          </Panel>
        )}

        {activeTab === "preferences" && (
          <Panel
            shaded
            bordered
            className="bg-white transition-colors duration-200 dark:bg-gray-800"
          >
            <UserPreference />
          </Panel>
        )}

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
