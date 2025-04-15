import React, { useState } from "react";
import Image from "next/image";
import { Panel, Tag, Button, Nav, Input } from "rsuite";

export default function UserProfile() {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState("account");
  return (
    <>
      {" "}
      {/* Left Column - User Info */}
      <div className="w-full md:w-1/3">
        <Panel shaded bordered bodyFill className="overflow-hidden">
          <div className="mt-12 flex flex-col items-center pb-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white">
              <Image
                src="/assets/images/profile.jpg"
                alt="Profile"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <h2 className="mt-2 text-xl font-bold">Sarah Johnson</h2>
            <p className="text-sm text-gray-500">Member since April 2023</p>
            <div className="mt-4 flex gap-2">
              <Tag
                color="green"
                className="border-green-200 bg-green-100 text-green-600"
              >
                Premium Member
              </Tag>
              <Tag
                color="orange"
                className="border-orange-200 bg-orange-100 text-orange-600"
              >
                125 Orders
              </Tag>
            </div>
            <Button
              appearance="primary"
              color="green"
              className="mt-4 bg-green-500 text-white"
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
      <div className="w-full md:w-2/3">
        <Nav
          appearance="subtle"
          activeKey={activeTab}
          color="green"
          onSelect={setActiveTab}
          className="mb-4"
        >
          <Nav.Item eventKey="account" className="px-4">
            Account
          </Nav.Item>
          <Nav.Item eventKey="orders" className="px-4">
            Orders
          </Nav.Item>
          <Nav.Item eventKey="addresses" className="px-4">
            Addresses
          </Nav.Item>
          <Nav.Item eventKey="payment" className="px-4">
            Payment Methods
          </Nav.Item>
          <Nav.Item eventKey="preferences" className="px-4">
            Preferences
          </Nav.Item>
        </Nav>

        {activeTab === "account" && (
          <Panel shaded bordered>
            <h3 className="mb-4 text-lg font-bold">Account Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <Input value="sarah.johnson@example.com" className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Phone Number
                </label>
                <Input value="(555) 123-4567" className="w-full" />
              </div>
            </div>

            <h3 className="mb-4 mt-6 text-lg font-bold">Password</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <Button appearance="primary" className="bg-green-500 text-white">
                Save Changes
              </Button>
            </div>
          </Panel>
        )}

        {activeTab === "orders" && (
          <Panel shaded bordered>
            <h3 className="mb-4 text-lg font-bold">Recent Orders</h3>

            {[1, 2, 3].map((order) => (
              <div key={order} className="mb-4 rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold">
                      Order #{Math.floor(Math.random() * 10000)}
                    </span>
                    <span className="ml-4 text-sm text-gray-500">
                      April {10 + order}, 2025
                    </span>
                  </div>
                  <Tag
                    color="green"
                    className="border-green-200 bg-green-100 text-green-600"
                  >
                    Delivered
                  </Tag>
                </div>
                <div className="mb-3 flex justify-between text-sm text-gray-600">
                  <span>5 items</span>
                  <span className="font-bold">$78.35</span>
                </div>
                <div className="flex gap-2">
                  <Button appearance="ghost" size="sm">
                    View Details
                  </Button>
                  <Button appearance="ghost" size="sm">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 text-center">
              <Button appearance="link">View All Orders</Button>
            </div>
          </Panel>
        )}

        {activeTab === "addresses" && (
          <Panel shaded bordered>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Saved Addresses</h3>
              <Button
                appearance="primary"
                color="green"
                className="bg-green-500 text-white"
              >
                Add New Address
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Panel bordered className="relative">
                <Tag className="absolute right-2 top-2 border-green-200 bg-green-100 text-green-600">
                  Default
                </Tag>
                <h4 className="font-bold">Home</h4>
                <p className="mt-2 text-gray-600">
                  2464 Royal Ln.
                  <br />
                  Mesa, AZ 85201
                  <br />
                  United States
                </p>
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
                <h4 className="font-bold">Work</h4>
                <p className="mt-2 text-gray-600">
                  875 Tech Park Dr.
                  <br />
                  Mesa, AZ 85210
                  <br />
                  United States
                </p>
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

        {activeTab === "payment" && (
          <Panel shaded bordered>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Payment Methods</h3>
              <Button appearance="primary" className="bg-green-500 text-white">
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
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Promotions and deals</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>New product arrivals</span>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery reminders</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
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
              <Button appearance="primary" className="bg-green-500 text-white">
                Save Preferences
              </Button>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
