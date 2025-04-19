import React, { useState } from "react";
import Image from "next/image";
import { Panel, Tag, Button, Nav, Input, Dropdown } from "rsuite";
import UserRecentOrders from "./userRecentOrders";
import UserAddress from "./userAddress";
import UserAccount from "./UseerAccount";
import UserPayment from "./userPayment";
import UserPreference from "./userPreference";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("account");
  return (
    <div className="grid  grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column - User Info */}
      <div className="w-full md:col-span-3">
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
        <div className="w-full md:col-span-9">
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
