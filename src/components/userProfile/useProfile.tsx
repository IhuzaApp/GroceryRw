import React, { useState } from "react";
import Image from "next/image";
import { Panel, Tag, Button, Nav, Input, Dropdown } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("account");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  return (
    <>
      {" "}
      {/* Left Column - User Info */}
      <div className="w-full md:w-1/3">
        <Panel
          shaded
          bordered
          bodyFill
          className="mx-auto max-w-md overflow-hidden sm:max-w-full"
        >
          <div className="flex flex-col items-center px-4 py-6 sm:py-8">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
              <Image
                src="/assets/images/profile.jpg"
                alt="Profile"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="mt-3 text-center text-lg font-bold sm:text-xl">
              Sarah Johnson
            </h2>
            <p className="text-center text-sm text-gray-500">
              Member since April 2023
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Tag className="border-green-200 bg-green-100 text-green-600">
                Premium Member
              </Tag>
              <Tag className="border-orange-200 bg-orange-100 text-orange-600">
                125 Orders
              </Tag>
            </div>

            <Button
              appearance="primary"
              color="green"
              className="mt-5 w-full bg-green-500 text-white sm:w-auto"
            >
              Edit Profile
            </Button>
          </div>
        </Panel>

        <Panel header="Account Summary" shaded bordered className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-bold">125</span>
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
              <span className="font-bold">$45.00</span>
            </div>
          </div>
        </Panel>
      </div>
      {/* Right Column - Tabs */}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-full">
          <div className="scrollbar-hide mb-4 overflow-x-auto whitespace-nowrap">
            <Nav
              appearance="subtle"
              activeKey={activeTab}
              color="green"
              onSelect={setActiveTab}
              className="flex min-w-max gap-2"
            >
              <Nav.Item eventKey="account" className="shrink-0 px-4">
                Account
              </Nav.Item>
              <Nav.Item eventKey="orders" className="shrink-0 px-4">
                Orders
              </Nav.Item>
              <Nav.Item eventKey="addresses" className="shrink-0 px-4">
                Addresses
              </Nav.Item>
              <Nav.Item eventKey="payment" className="shrink-0 px-4">
                Payment Methods
              </Nav.Item>
              <Nav.Item eventKey="preferences" className="shrink-0 px-4">
                Preferences
              </Nav.Item>
            </Nav>
          </div>

          {activeTab === "account" && (
            <Panel shaded bordered>
              <h3 className="mb-4 mt-3 text-lg font-bold">
                Your Payment Cards
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Purple Withdrawal Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 p-5 text-white shadow-lg">
                  <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
                  <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

                  <div className="mb-8 flex items-start justify-between">
                    <div>
                      <p className="mb-1 text-xs opacity-80">Withdrawal Card</p>
                      <h4 className="font-bold">STOKE WALLET</h4>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-5 w-8 rounded-sm bg-yellow-400"></div>
                      <div className="h-5 w-8 rounded-sm bg-yellow-500 opacity-70"></div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="mb-1 flex items-center">
                      <div className="mr-2 h-6  w-10 rounded-sm bg-opacity-30">
                        <img
                          className="-mt-3 h-12 w-12"
                          src="/assets/images/chip.png"
                          alt=""
                        />
                      </div>
                      <p className="font-mono text-lg tracking-wider">
                        •••• •••• •••• 5678
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-xs opacity-80">Card Holder</p>
                      <p className="font-medium">SARAH JOHNSON</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs opacity-80">Expires</p>
                      <p className="font-medium">09/27</p>
                    </div>
                    <div className="text-right">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-8 w-8 opacity-80"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <p className="text-xs font-bold opacity-70">
                      WITHDRAWAL ONLY
                    </p>
                  </div>
                </div>

                {/* Green Payment Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-700 p-5 text-white shadow-lg">
                  <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
                  <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

                  <div className="mb-8 flex items-start justify-between">
                    <div>
                      <p className="mb-1 text-xs opacity-80">Payment Card</p>
                      <h4 className="font-bold">GROCERY PAY</h4>
                    </div>
                    <div className="flex items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-10 w-10 text-blue-600"
                      >
                        <path d="M10 13.802l-3.38-3.38-1.42 1.42 4.8 4.8 9.19-9.19-1.41-1.41z" />
                        <path d="M19.03 7.39l.97-.97c.29-.29.29-.77 0-1.06l-1.06-1.06c-.29-.29-.77-.29-1.06 0l-.97.97 2.12 2.12z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="mb-1 flex items-center">
                      <div className="mr-2 h-6 w-10 rounded-sm bg-opacity-30">
                        <img
                          className="-mt-3 h-12 w-12"
                          src="/assets/images/chip.png"
                          alt=""
                        />
                      </div>
                      <p className="font-mono text-lg tracking-wider">
                        •••• •••• •••• 1234
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-xs opacity-80">Card Holder</p>
                      <p className="font-medium">SARAH JOHNSON</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs opacity-80">Expires</p>
                      <p className="font-medium">12/26</p>
                    </div>
                    <div className="text-right">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-8 w-8 opacity-80"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <p className="text-xs font-bold opacity-70">
                      AUTHORIZED PAYMENTS
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block">
                <h3 className="mb-4 mt-3 text-lg font-bold">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      First Name
                    </label>
                    <Input value="Sarah" className="w-full" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Last Name
                    </label>
                    <Input value="Johnson" className="w-full" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Email Address
                    </label>
                    <Input
                      value="sarah.johnson@example.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Phone Number
                    </label>
                    <Input value="(555) 123-4567" className="w-full" />
                  </div>
                </div>
              </div>

              <h3 className="mb-4 mt-6 text-lg font-bold">Password</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Current Password
                  </label>
                  <Input type="password" value="********" className="w-full" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    New Password
                  </label>
                  <Input type="password" className="w-full" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                >
                  Save Changes
                </Button>
              </div>
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
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Payment Methods</h3>
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                >
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-4">
                <Panel bordered className="relative">
                  <Tag className="absolute right-2 top-2 border-green-200 bg-green-100 text-green-600">
                    Default
                  </Tag>
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-12 items-center justify-center rounded bg-blue-600 text-white">
                      VISA
                    </div>
                    <div>
                      <h4 className="font-bold">Visa ending in 4242</h4>
                      <p className="text-sm text-gray-600">Expires 05/2026</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button appearance="ghost" size="sm">
                      Edit
                    </Button>
                    <Button appearance="ghost" size="sm">
                      Delete
                    </Button>
                  </div>
                </Panel>

                <Panel bordered>
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-12 items-center justify-center rounded bg-orange-500 text-white">
                      MC
                    </div>
                    <div>
                      <h4 className="font-bold">Mastercard ending in 8888</h4>
                      <p className="text-sm text-gray-600">Expires 11/2025</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button appearance="ghost" size="sm">
                      Edit
                    </Button>
                    <Button appearance="ghost" size="sm">
                      Delete
                    </Button>
                    <Button appearance="ghost" size="sm">
                      Set as Default
                    </Button>
                  </div>
                </Panel>
              </div>
            </Panel>
          )}

          {activeTab === "preferences" && (
            <Panel shaded bordered>
              <h3 className="mb-4 text-lg font-bold">Preferences</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-bold">Notification Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Order updates</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Promotions and deals</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New product arrivals</span>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery reminders</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-bold">Dietary Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Vegetarian
                    </Tag>
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Gluten-Free
                    </Tag>
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Organic
                    </Tag>
                    <Button appearance="ghost" size="sm">
                      + Add More
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-bold">Favorite Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Fresh Produce
                    </Tag>
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Snacks
                    </Tag>
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Dairy
                    </Tag>
                    <Tag className="border-gray-200 bg-gray-100 text-gray-600">
                      Beverages
                    </Tag>
                    <Button appearance="ghost" size="sm">
                      + Add More
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                >
                  Save Preferences
                </Button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
