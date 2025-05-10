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

export default function UserProfile() {
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
      .then((data: { user: any; orderCount: number }) => {
        setUser(data.user);
        setOrderCount(data.orderCount);
      })
      .catch((err) => console.error("Failed to load user profile:", err))
      .finally(() => setLoading(false));
  }, []);

  // Load user orders
  useEffect(() => {
    setOrdersLoading(true);
    fetch("/api/queries/orders")
      .then((res) => res.json())
      .then((data) => {
        setUserOrders(data.orders || []);
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setOrdersLoading(false));
  }, []);

  // Load default address
  useEffect(() => {
    setLoadingAddr(true);
    fetch("/api/queries/addresses")
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
    setOrdersLoading(true);
    fetch("/api/queries/orders")
      .then((res) => res.json())
      .then((data) => {
        setUserOrders(data.orders || []);
      })
      .catch((err) => console.error("Error refreshing orders:", err))
      .finally(() => setOrdersLoading(false));
  };

  return (
    <div className="grid  grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left Column - User Info */}
      <div className="w-full md:col-span-3">
        <Panel
          shaded
          bordered
          bodyFill
          className="mx-auto max-w-md overflow-hidden sm:max-w-full"
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
                    src={user?.profile_picture || "/assets/images/profile.jpg"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h2 className="mt-3 text-center text-lg font-bold sm:text-xl">
                  {user?.name}
                </h2>
                <p className="text-center text-sm text-gray-500">
                  Member since{" "}
                  {user
                    ? new Date(user.created_at).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Tag className="border-green-200 bg-green-100 text-green-600">
                    Premium Member
                  </Tag>
                  <Tag className="border-orange-200 bg-orange-100 text-orange-600">
                    {orderCount} Orders
                  </Tag>
                </div>

                <Button
                  appearance="primary"
                  color="green"
                  className="mt-5 w-full bg-green-500 text-white sm:w-auto"
                >
                  Edit Profile
                </Button>
                {/* Default address under profile */}
                <div className="mt-4 w-full text-center">
                  <h3 className="font-medium">Default Address</h3>
                  {loadingAddr ? (
                    <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200" />
                  ) : selectedAddr || defaultAddr ? (
                    <div>
                      <p className="text-sm text-gray-600">
                        {(selectedAddr || defaultAddr).street},{" "}
                        {(selectedAddr || defaultAddr).city}{" "}
                        {(selectedAddr || defaultAddr).postal_code}
                      </p>
                      <Button
                        size="sm"
                        appearance="link"
                        onClick={() => setShowAddrModal(true)}
                      >
                        Change Address
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">
                        No address selected
                      </p>
                      <Button
                        size="sm"
                        appearance="link"
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

        <Panel header="Account Summary" shaded bordered className="mt-4">
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
                <span className="text-gray-600">Total Orders</span>
                <span className="font-bold">{orderCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Saved Items</span>
                <span className="font-bold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reward Points</span>
                <span className="font-bold text-green-600">2,450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Wallet Balance</span>
                <span className="font-bold">{formatCurrency(45)}</span>
              </div>
            </div>
          )}
        </Panel>
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
                    ? "font-semibold !text-green-600"
                    : "!text-black hover:!text-green-600"
                }`}
              >
                {tab.label}
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {activeTab === "account" && (
          <Panel shaded bordered>
            <UserAccount />
          </Panel>
        )}

        {activeTab === "orders" && (
          <Panel shaded bordered>
            <UserRecentOrders
              filter="all"
              orders={userOrders}
              loading={ordersLoading}
              onRefresh={refreshOrders}
            />
          </Panel>
        )}

        {activeTab === "addresses" && (
          <Panel shaded bordered>
            <UserAddress />
          </Panel>
        )}

        {activeTab === "payment" && (
          <Panel shaded bordered>
            <UserPayment />
          </Panel>
        )}

        {activeTab === "preferences" && (
          <Panel shaded bordered>
            <UserPreference />
          </Panel>
        )}
        {/* Address selection modal */}
        <Modal
          open={showAddrModal}
          onClose={() => setShowAddrModal(false)}
          size="lg"
        >
          <Modal.Header>
            <Modal.Title>Select an Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {addresses.length ? (
              addresses.map((addr) => (
                <Panel key={addr.id} bordered className="mb-2">
                  <h4 className="font-bold">{addr.street}</h4>
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.postal_code}
                  </p>
                  <Button
                    size="sm"
                    appearance="primary"
                    className="mt-2"
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
              <p>No addresses saved.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowAddrModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
