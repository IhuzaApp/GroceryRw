import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "../../../lib/formatCurrency";
import { Panel, Tag, Button, Nav, Toggle, DatePicker, SelectPicker, Loader, Message } from "rsuite";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";

// Type definitions for schedules
interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface ShopperStats {
  totalDeliveries: number;
  completionRate: number;
  averageRating: number;
  totalEarnings: number;
}

export default function ShopperProfileComponent() {
  const { data: session } = useSession();
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
  const [loading, setLoading] = useState<boolean>(true);
  
  // Shopper-specific states
  const [stats, setStats] = useState<ShopperStats>({
    totalDeliveries: 0,
    completionRate: 0,
    averageRating: 0,
    totalEarnings: 0
  });
  
  // Schedule states
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [hasSchedule, setHasSchedule] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  // Default address state
  const [defaultAddr, setDefaultAddr] = useState<any | null>(null);
  const [loadingAddr, setLoadingAddr] = useState<boolean>(true);
  
  // State for temporary selected address (not persisted as default)
  const [selectedAddr, setSelectedAddr] = useState<any | null>(null);
  
  // Address selection modal state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddrModal, setShowAddrModal] = useState<boolean>(false);

  // Days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      slots.push({ label: `${hour}:00`, value: `${hour}:00:00` });
      slots.push({ label: `${hour}:30`, value: `${hour}:30:00` });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Function to format time for display
  const formatTimeForDisplay = (time: string | undefined): string => {
    if (!time) return "09:00:00";
    
    // If time already has seconds, return as is
    if (time.split(':').length === 3) return time;
    
    // If time has only hours and minutes, add seconds
    if (time.split(':').length === 2) return `${time}:00`;
    
    // Default fallback
    return "09:00:00";
  };

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

  // Load current user data and shopper stats
  useEffect(() => {
    setLoading(true);
    fetch("/api/user")
      .then((res) => res.json())
      .then((data: { user: any; orderCount: number }) => {
        setUser(data.user);
        
        // Now fetch shopper stats
        return fetch("/api/shopper/stats");
      })
      .then((res) => res.json())
      .then((data) => {
        console.log("Received shopper stats:", data);
        setStats({
          totalDeliveries: data.totalDeliveries || 0,
          completionRate: data.completionRate || 0,
          averageRating: data.averageRating || 0,
          totalEarnings: data.totalEarnings || 0
        });
      })
      .catch((err) => console.error("Failed to load shopper profile:", err))
      .finally(() => setLoading(false));
  }, []);

  // Load schedule
  const loadSchedule = () => {
    setScheduleLoading(true);
    fetch("/api/shopper/schedule")
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded schedule data:", data);
        
        // Use the hasSchedule flag from the API response if available
        if (data.hasSchedule !== undefined) {
          setHasSchedule(data.hasSchedule);
        } else {
          setHasSchedule(data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0);
        }
        
        if (data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
          // Map the received schedule to ensure all days are represented
          const daysMap = new Map();
          
          // First, initialize with default values for all days
          days.forEach(day => {
            daysMap.set(day, {
              day,
              startTime: "09:00",
              endTime: "17:00",
              available: day !== "Sunday"
            });
          });
          
          // Then, override with actual data from the server
          data.schedule.forEach((slot: { day: string, startTime?: string, endTime?: string, available?: boolean }) => {
            console.log(`Slot for ${slot.day}:`, slot);
            daysMap.set(slot.day, {
              day: slot.day,
              startTime: formatTimeForDisplay(slot.startTime),
              endTime: formatTimeForDisplay(slot.endTime),
              available: typeof slot.available === 'boolean' ? slot.available : true
            });
          });
          
          // Convert map back to array
          const fullSchedule = Array.from(daysMap.values());
          console.log("Processed schedule:", fullSchedule);
          
          setSchedule(fullSchedule);
        } else {
          // Initialize default schedule if none exists
          const defaultSchedule = days.map(day => ({
            day,
            startTime: "09:00",
            endTime: "17:00",
            available: day !== "Sunday"
          }));
          setSchedule(defaultSchedule);
        }
      })
      .catch((err) => {
        console.error("Error fetching schedule:", err);
        // Initialize default schedule on error
        const defaultSchedule = days.map(day => ({
          day,
          startTime: "09:00",
          endTime: "17:00",
          available: day !== "Sunday"
        }));
        setSchedule(defaultSchedule);
        setHasSchedule(false);
      })
      .finally(() => setScheduleLoading(false));
  };

  // Load schedule on component mount
  useEffect(() => {
    loadSchedule();
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

  // Handle availability toggle
  const handleAvailabilityToggle = (day: string, available: boolean) => {
    setSchedule(prev => 
      prev.map(slot => 
        slot.day === day ? { ...slot, available } : slot
      )
    );
  };

  // Handle time change
  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => 
      prev.map(slot => 
        slot.day === day ? { ...slot, [field]: value } : slot
      )
    );
  };

  // Configure schedule - add default schedule to database
  const configureSchedule = () => {
    if (!session) {
      console.error("No session available. Please log in.");
      setSaveMessage({ type: 'error', text: 'Please log in to configure your schedule.' });
      return;
    }

    setSaveMessage({ type: 'info', text: 'Configuring your schedule...' });
    
    fetch("/api/shopper/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify({ schedule })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {

        setSaveMessage({ type: 'success', text: 'Schedule configured successfully!' });
        setHasSchedule(true);
        // Reload schedule to get the latest data
        loadSchedule();
      })
      .catch(err => {
   
        setSaveMessage({ type: 'error', text: 'Failed to configure schedule. Please try again.' });
      });
  };

  // Save schedule updates to backend
  const saveScheduleUpdates = () => {
    if (!session) {
 
      setSaveMessage({ type: 'error', text: 'Please log in to save your schedule.' });
      return;
    }

    setSaveMessage({ type: 'info', text: 'Saving your schedule...' });
    
    fetch("/api/shopper/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify({ schedule })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Schedule saved:", data);
        setSaveMessage({ type: 'success', text: 'Schedule updated successfully!' });
      })
      .catch(err => {
        console.error("Error saving schedule:", err);
        setSaveMessage({ type: 'error', text: 'Failed to update schedule. Please try again.' });
      });
  };

  // Clear save message after 5 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
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
                  Shopper since{" "}
                  {user
                    ? new Date(user.created_at).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Tag className="border-blue-200 bg-blue-100 text-blue-600">
                    Shopper
                  </Tag>
                  <Tag className="border-green-200 bg-green-100 text-green-600">
                    {stats.averageRating.toFixed(1)} ★
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
                  <h3 className="font-medium">Service Area</h3>
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
                        Change Service Area
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">
                        No service area selected
                      </p>
                      <Button
                        size="sm"
                        appearance="link"
                        onClick={() => setShowAddrModal(true)}
                      >
                        Select Service Area
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel header="Shopper Stats" shaded bordered className="mt-4">
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
                <span className="text-gray-600">Total Deliveries</span>
                <span className="font-bold">{stats.totalDeliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-bold">{stats.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-bold text-yellow-500">{stats.averageRating.toFixed(1)} ★</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</span>
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
              { key: "schedule", label: "Work Schedule" },
              { key: "vehicles", label: "Vehicles" },
              { key: "payment", label: "Payment Info" },
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
            <h3 className="mb-4 text-lg font-semibold">Account Information</h3>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1">{user?.phone || "Not provided"}</p>
                </div>
                <Button appearance="primary" color="green">Update Information</Button>
              </div>
            )}
          </Panel>
        )}

        {activeTab === "schedule" && (
          <Panel shaded bordered>
            <h3 className="mb-4 text-lg font-semibold">Work Schedule</h3>
            {scheduleLoading ? (
              <Loader content="Loading schedule..." />
            ) : (
              <>
                <p className="mb-4 text-gray-600">
                  Set your availability for each day of the week. Orders will only be assigned to you during your available hours.
                </p>
                
                {saveMessage && (
                  <Message 
                    type={saveMessage.type} 
                    className="mb-4"
                    closable
                    onClose={() => setSaveMessage(null)}
                  >
                    {saveMessage.text}
                  </Message>
                )}
                
                {!hasSchedule ? (
                  <div className="mb-4">
                    <p className="mb-2 text-gray-700">You haven't configured your work schedule yet.</p>
                    <Button 
                      appearance="primary" 
                      color="green" 
                      onClick={configureSchedule}
                    >
                      Configure Schedule
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Weekly Schedule UI */}
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 md:grid-cols-7">
                        <div className="font-medium">Day</div>
                        <div className="font-medium">Available</div>
                        <div className="font-medium">Start Time</div>
                        <div className="font-medium">End Time</div>
                      </div>
                      
                      <div className="divide-y">
                        {schedule.map((slot) => (
                          <div key={slot.day} className="grid grid-cols-4 gap-4 p-4 md:grid-cols-7">
                            <div className="flex items-center">{slot.day}</div>
                            <div className="flex items-center">
                              <Toggle 
                                checked={slot.available} 
                                onChange={(checked) => handleAvailabilityToggle(slot.day, checked)}
                                checkedChildren="Yes"
                                unCheckedChildren="No"
                              />
                            </div>
                            <div>
                              <SelectPicker 
                                value={slot.startTime}
                                disabled={!slot.available}
                                data={timeSlots}
                                cleanable={false}
                                block
                                onChange={(value) => handleTimeChange(slot.day, 'startTime', value as string)}
                                renderValue={(value) => {
                                  // console.log(`Rendering startTime for ${slot.day}:`, value);
                                  return value ? value.split(':').slice(0, 2).join(':') : '';
                                }}
                              />
                              <div className="mt-1 text-xs text-gray-500">Current: {slot.startTime ? slot.startTime.split(':').slice(0, 2).join(':') : ''}</div>
                            </div>
                            <div>
                              <SelectPicker
                                value={slot.endTime}
                                disabled={!slot.available}
                                data={timeSlots}
                                cleanable={false}
                                block
                                onChange={(value) => handleTimeChange(slot.day, 'endTime', value as string)}
                                renderValue={(value) => {
                              
                                  return value ? value.split(':').slice(0, 2).join(':') : '';
                                }}
                              />
                              <div className="mt-1 text-xs text-gray-500">Current: {slot.endTime ? slot.endTime.split(':').slice(0, 2).join(':') : ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button appearance="primary" color="green" onClick={saveScheduleUpdates}>
                        Save Updates
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Panel>
        )}

        {activeTab === "vehicles" && (
          <Panel shaded bordered>
            <h3 className="mb-4 text-lg font-semibold">Vehicle Information</h3>
            <p className="mb-4 text-gray-600">
              Add details about the vehicle(s) you use for deliveries.
            </p>
            
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Primary Vehicle</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <SelectPicker
                    data={[
                      { label: 'Car', value: 'car' },
                      { label: 'Motorcycle', value: 'motorcycle' },
                      { label: 'Bicycle', value: 'bicycle' },
                      { label: 'Scooter', value: 'scooter' },
                      { label: 'On foot', value: 'foot' },
                    ]}
                    block
                    placeholder="Select vehicle type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model (Optional)</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. Toyota Corolla"
                  />
                </div>
              </div>
              
              <Button appearance="primary" color="blue" className="mt-4">
                Save Vehicle Info
              </Button>
            </div>
          </Panel>
        )}

        {activeTab === "payment" && (
          <Panel shaded bordered>
            <h3 className="mb-4 text-lg font-semibold">Payment Information</h3>
            <p className="mb-4 text-gray-600">
              Manage your payment methods for receiving earnings.
            </p>
            
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Bank Account</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Name</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <Button appearance="primary" color="blue" className="mt-4">
                Save Payment Info
              </Button>
            </div>
          </Panel>
        )}

        {activeTab === "preferences" && (
          <Panel shaded bordered>
            <h3 className="mb-4 text-lg font-semibold">Shopper Preferences</h3>
            <p className="mb-4 text-gray-600">
              Customize your delivery preferences and notification settings.
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 font-medium">Order Preferences</h4>
                <div className="flex items-center justify-between border-b pb-2">
                  <span>Maximum order distance</span>
                  <SelectPicker
                    data={[
                      { label: '5 km', value: 5 },
                      { label: '10 km', value: 10 },
                      { label: '15 km', value: 15 },
                      { label: '20 km', value: 20 },
                      { label: 'No limit', value: 0 },
                    ]}
                    defaultValue={10}
                    cleanable={false}
                  />
                </div>
                <div className="flex items-center justify-between border-b py-2">
                  <span>Maximum order size</span>
                  <SelectPicker
                    data={[
                      { label: 'Small (1-10 items)', value: 'small' },
                      { label: 'Medium (11-30 items)', value: 'medium' },
                      { label: 'Large (31+ items)', value: 'large' },
                      { label: 'No limit', value: 'no_limit' },
                    ]}
                    defaultValue={'no_limit'}
                    cleanable={false}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span>Preferred shop types</span>
                  <SelectPicker
                    data={[
                      { label: 'Grocery', value: 'grocery' },
                      { label: 'Pharmacy', value: 'pharmacy' },
                      { label: 'Convenience store', value: 'convenience' },
                      { label: 'All types', value: 'all' },
                    ]}
                    defaultValue={'all'}
                    cleanable={false}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 font-medium">Notification Preferences</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Email notifications</span>
                    <Toggle defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS notifications</span>
                    <Toggle defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push notifications</span>
                    <Toggle defaultChecked />
                  </div>
                </div>
              </div>
              
              <Button appearance="primary" color="green">
                Save Preferences
              </Button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
} 