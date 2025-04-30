import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Input, Dropdown } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";

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

  // Load current user data
  useEffect(() => {
    setLoading(true);
    fetch('/api/user')
      .then(res => res.json())
      .then((data: { user: any; orderCount: number }) => {
        setUser(data.user);
        setOrderCount(data.orderCount);
      })
      .catch(err => console.error('Failed to load user profile:', err))
      .finally(() => setLoading(false));
  }, []);

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
                <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded mt-4 animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
                <div className="h-8 w-full bg-gray-200 rounded mt-6 animate-pulse" />
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
                  Member since {user ? new Date(user.created_at).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}
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
              </>
            )}
          </div>
        </Panel>

        <Panel header="Account Summary" shaded bordered className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="h-4 bg-gray-200 rounded animate-pulse" />
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
            <UserRecentOrders />
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
      </div>
    </div>
  );
}
