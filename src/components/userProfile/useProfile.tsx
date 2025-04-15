import React, { useState } from "react";
import Image from "next/image"
import { Panel, Tag, Button, Nav, Input } from "rsuite";



export default function UserProfile(){
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState("account")
    return(
        <>     {/* Left Column - User Info */}
        <div className="w-full md:w-1/3">
          <Panel shaded bordered bodyFill className="overflow-hidden">
            <div className="flex flex-col items-center mt-12 pb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                <Image
                  src="/assets/images/profile.jpg"
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h2 className="text-xl font-bold mt-2">Sarah Johnson</h2>
              <p className="text-gray-500 text-sm">Member since April 2023</p>
              <div className="mt-4 flex gap-2">
                <Tag color="green" className="bg-green-100 text-green-600 border-green-200">
                  Premium Member
                </Tag>
                <Tag color="orange" className="bg-orange-100 text-orange-600 border-orange-200">
                  125 Orders
                </Tag>
              </div>
              <Button appearance="primary" color="green" className="mt-4 bg-green-500 text-white">
                Edit Profile
              </Button>
            </div>
          </Panel>
   
          <Panel header="Account Summary" shaded bordered className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-bold">125</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saved Items</span>
                <span className="font-bold">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reward Points</span>
                <span className="font-bold text-green-600">2,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wallet Balance</span>
                <span className="font-bold">$45.00</span>
              </div>
            </div>
          </Panel>
        </div>
   
        {/* Right Column - Tabs */}
        <div className="w-full md:w-2/3">
          <Nav appearance="subtle" activeKey={activeTab} color="green" onSelect={setActiveTab} className="mb-4">
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
              <h3 className="text-lg font-bold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First Name</label>
                  <Input value="Sarah" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                  <Input value="Johnson" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                  <Input value="sarah.johnson@example.com" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                  <Input value="(555) 123-4567" className="w-full" />
                </div>
              </div>
   
              <h3 className="text-lg font-bold mt-6 mb-4">Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                  <Input type="password" value="********" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">New Password</label>
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
              <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
   
              {[1, 2, 3].map((order) => (
                <div key={order} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-bold">Order #{Math.floor(Math.random() * 10000)}</span>
                      <span className="text-gray-500 ml-4 text-sm">April {10 + order}, 2025</span>
                    </div>
                    <Tag color="green" className="bg-green-100 text-green-600 border-green-200">
                      Delivered
                    </Tag>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Saved Addresses</h3>
                <Button appearance="primary" color="green" className="bg-green-500 text-white">
                  Add New Address
                </Button>
              </div>
   
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel bordered className="relative">
                  <Tag className="absolute top-2 right-2 bg-green-100 text-green-600 border-green-200">Default</Tag>
                  <h4 className="font-bold">Home</h4>
                  <p className="text-gray-600 mt-2">
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
                  <p className="text-gray-600 mt-2">
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Payment Methods</h3>
                <Button appearance="primary" className="bg-green-500 text-white">
                  Add Payment Method
                </Button>
              </div>
   
              <div className="space-y-4">
                <Panel bordered className="relative">
                  <Tag className="absolute top-2 right-2 bg-green-100 text-green-600 border-green-200">Default</Tag>
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center text-white">
                      VISA
                    </div>
                    <div>
                      <h4 className="font-bold">Visa ending in 4242</h4>
                      <p className="text-gray-600 text-sm">Expires 05/2026</p>
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
                    <div className="w-12 h-8 bg-orange-500 rounded mr-3 flex items-center justify-center text-white">
                      MC
                    </div>
                    <div>
                      <h4 className="font-bold">Mastercard ending in 8888</h4>
                      <p className="text-gray-600 text-sm">Expires 11/2025</p>
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
              <h3 className="text-lg font-bold mb-4">Preferences</h3>
   
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-2">Notification Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Order updates</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Promotions and deals</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New product arrivals</span>
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery reminders</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                  </div>
                </div>
   
                <div>
                  <h4 className="font-bold mb-2">Dietary Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Vegetarian</Tag>
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Gluten-Free</Tag>
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Organic</Tag>
                    <Button appearance="ghost" size="sm">
                      + Add More
                    </Button>
                  </div>
                </div>
   
                <div>
                  <h4 className="font-bold mb-2">Favorite Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Fresh Produce</Tag>
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Snacks</Tag>
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Dairy</Tag>
                    <Tag className="bg-gray-100 text-gray-600 border-gray-200">Beverages</Tag>
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
    )
}