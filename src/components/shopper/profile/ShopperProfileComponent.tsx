import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { formatCurrency } from "../../../lib/formatCurrency";
import {
  Panel,
  Tag,
  Button,
  Nav,
  Toggle,
  DatePicker,
  SelectPicker,
  Loader,
  Message,
  Modal,
  Form,
  Input,
  useToaster,
  List,
} from "rsuite";
import Cookies from "js-cookie";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/router";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import AddressSelectionPopup from "./AddressSelectionDrawer";
import UpdateShopperDrawer from "./UpdateShopperDrawer";
import { logger } from "../../../utils/logger";
import { debounce } from "lodash";
import VehicleManagement from "./VehicleManagement";

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
  const { theme } = useTheme();
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
    totalEarnings: 0,
  });

  // Schedule states
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [hasSchedule, setHasSchedule] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Default address state
  const [defaultAddr, setDefaultAddr] = useState<any | null>(null);
  const [loadingAddr, setLoadingAddr] = useState<boolean>(true);

  // State for temporary selected address (not persisted as default)
  const [selectedAddr, setSelectedAddr] = useState<any | null>(null);

  // Address selection modal state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddrModal, setShowAddrModal] = useState<boolean>(false);

  // Add state for address modal
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [addressFormValue, setAddressFormValue] = useState<{ address: string }>({
    address: "",
  });
  const [updatingAddress, setUpdatingAddress] = useState(false);

  // Days of the week
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
    if (time.split(":").length === 3) return time;

    // If time has only hours and minutes, add seconds
    if (time.split(":").length === 2) return `${time}:00`;

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
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
    setLoading(true);
        
        // Fetch user data
        const userRes = await fetch("/api/user", { signal: controller.signal });
        const userData = await userRes.json();
        if (isMounted) setUser(userData.user);

        // Fetch shopper stats
        const statsRes = await fetch("/api/shopper/stats", { signal: controller.signal });
        const statsData = await statsRes.json();
        if (isMounted) {
        setStats({
            totalDeliveries: statsData.totalDeliveries || 0,
            completionRate: statsData.completionRate || 0,
            averageRating: statsData.averageRating || 0,
            totalEarnings: statsData.totalEarnings || 0,
        });
        }

        // Fetch shopper profile
        const profileRes = await fetch("/api/queries/shopper-profile", { signal: controller.signal });
        const profileData = await profileRes.json();
        if (isMounted && profileData.shopper) {
          setShopperData(profileData.shopper);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        logger.error("Error loading shopper data:", error);
        if (isMounted) {
        setStats({
          totalDeliveries: 0,
          completionRate: 0,
          averageRating: 0,
          totalEarnings: 0,
        });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Add a ref to track if we're already loading
  const isLoadingRef = useRef(false);

  // Load schedule using useCallback to memoize the function
  const loadSchedule = useCallback(async () => {
    // Prevent multiple concurrent loads
    if (scheduleLoading) return;

    const controller = new AbortController();
    let isMounted = true;

    try {
    setScheduleLoading(true);
      const res = await fetch("/api/queries/shopper-availability", { 
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();

      if (!isMounted) return;

        if (data.shopper_availability) {
          setHasSchedule(data.shopper_availability.length > 0);

          // Map the received schedule to ensure all days are represented
          const daysMap = new Map<string, TimeSlot>();

          // First, initialize with default values for all days
          days.forEach((day) => {
            daysMap.set(day, {
              day,
              startTime: "09:00:00+00",
              endTime: "17:00:00+00",
              available: day !== "Sunday",
            });
          });

          // Then, override with actual data from the server
          data.shopper_availability.forEach((slot) => {
            const day = days[slot.day_of_week - 1];
            if (day) {
              daysMap.set(day, {
                day,
                startTime: slot.start_time,
                endTime: slot.end_time,
                available: slot.is_available,
              });
            }
          });

          setSchedule(Array.from(daysMap.values()));
        }
    } catch (error) {
      if (error.name === 'AbortError') return;
      logger.error("Error loading schedule:", error);
      if (isMounted) {
        setHasSchedule(false);
        const defaultSchedule: TimeSlot[] = days.map(day => ({
          day,
          startTime: "09:00:00+00",
          endTime: "17:00:00+00",
          available: day !== "Sunday",
        }));
        setSchedule(defaultSchedule);
      }
    } finally {
      if (isMounted) setScheduleLoading(false);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [scheduleLoading]);

  // Create a debounced version of loadSchedule
  const debouncedLoadSchedule = useCallback(
    debounce(() => {
    loadSchedule();
    }, 1000),
    [loadSchedule]
  );

  // Load schedule on component mount only
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const cleanup = await loadSchedule();
      if (!mounted) cleanup?.();
    };
    load();
    return () => {
      mounted = false;
    };
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
        logger.error("Error fetching addresses:", err);
        setDefaultAddr(null);
      })
      .finally(() => setLoadingAddr(false));
  }, []);

  // Handle availability toggle
  const handleAvailabilityToggle = (day: string, available: boolean) => {
    setSchedule((prev) =>
      prev.map((slot) => (slot.day === day ? { ...slot, available } : slot))
    );
  };

  // Handle time change
  const handleTimeChange = (
    day: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((slot) =>
        slot.day === day ? { ...slot, [field]: value } : slot
      )
    );
  };

  // Configure schedule - add default schedule to database
  const configureSchedule = useCallback(() => {
    if (!session) {
      logger.error("No session available. Please log in.");
      setSaveMessage({
        type: "error",
        text: "Please log in to configure your schedule.",
      });
      return;
    }

    setSaveMessage({ type: "info", text: "Configuring your schedule..." });

    fetch("/api/shopper/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ schedule }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSaveMessage({
          type: "success",
          text: "Schedule configured successfully!",
        });
        setHasSchedule(true);
        // Reload schedule to get the latest data
        loadSchedule();
      })
      .catch((err) => {
        setSaveMessage({
          type: "error",
          text: "Failed to configure schedule. Please try again.",
        });
      });
  }, [session, schedule, loadSchedule, setSaveMessage, setHasSchedule]);

  // Save schedule updates to backend
  const saveScheduleUpdates = useCallback(() => {
    if (!session) {
      setSaveMessage({
        type: "error",
        text: "Please log in to save your schedule.",
      });
      return;
    }

    setSaveMessage({ type: "info", text: "Saving your schedule..." });

    fetch("/api/shopper/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ schedule }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSaveMessage({
          type: "success",
          text: "Schedule updated successfully!",
        });
      })
      .catch((err) => {
        logger.error("Error saving schedule:", err);
        setSaveMessage({
          type: "error",
          text: "Failed to update schedule. Please try again.",
        });
      });
  }, [session, schedule, setSaveMessage]);

  // Clear save message after 5 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // Add shopper data state
  const [shopperData, setShopperData] = useState<{
    id: string;
    full_name: string;
    address: string;
    phone_number: string;
    national_id: string;
    driving_license?: string;
    transport_mode: string;
    profile_photo?: string;
    status: string;
    active: boolean;
    background_check_completed: boolean;
    onboarding_step: string;
    latitude: number | null;
    longitude: number | null;
    national_id_image?: string;
    driving_license_image?: string;
  } | null>(null);

  const router = useRouter();
  const toaster = useToaster();
  const { isLoaded } = useGoogleMap();
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Add state for address selection
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [activeInput, setActiveInput] = useState(false);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      try {
        // Keep using AutocompleteService for now as AutocompleteSuggestion is not fully ready
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
      } catch (error) {
        logger.error("Error initializing Google Maps services:", error);
      }
    }
  }, [isLoaded]);

  // Handle address input change for autocomplete
  const handleAddressChange = (val: string) => {
    setAddressFormValue({ address: val });
    if (val && autocompleteServiceRef.current) {
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          { input: val, componentRestrictions: { country: ["rw"] } },
          (preds, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
              setSuggestions(preds);
              setActiveInput(true);
            } else {
              setSuggestions([]);
            }
          }
        );
      } catch (error) {
        logger.error("Error getting place predictions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setActiveInput(false);
    }
  };

  // On selecting an autocomplete suggestion
  const handleSelect = (sug: google.maps.places.AutocompletePrediction) => {
    setAddressFormValue({ address: sug.description });
    setSuggestions([]);
    setActiveInput(false);
  };

  // Function to handle address update
  const handleAddressUpdate = async (address: string) => {
    if (!shopperData?.id) return;

    setUpdatingAddress(true);
    try {
      const response = await fetch("/api/queries/update-shopper-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopper_id: shopperData.id,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      const data = await response.json();
      if (data.shopper) {
        setShopperData(prev => prev ? {
          ...prev,
          address: data.shopper.address,
        } : null);
        setShowAddressPopup(false);
        toaster.push(
          <Message type="success" closable>
            Service area updated successfully
          </Message>
        );
      }
    } catch (error: unknown) {
      logger.error("Error updating address:", error instanceof Error ? error.message : String(error));
      toaster.push(
        <Message type="error" closable>
          Failed to update service area
        </Message>
      );
    } finally {
      setUpdatingAddress(false);
    }
  };

  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);

  // Update handler
  const handleUpdateShopper = async (data: any) => {
    if (!shopperData?.id) return;

    try {
      const response = await fetch("/api/queries/update-shopper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopper_id: shopperData.id,
          ...data,
          status: "pending", // Set status to pending for review
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update shopper information");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      // Sign out without redirect
      await signOut({ 
        redirect: false
      });
      
      // Manually redirect to login page
      router.push("/Auth/Login");
    } catch (error: unknown) {
      logger.error("Error updating shopper information:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  // Add a function to check if vehicle tab should be shown
  const shouldShowVehicleTab = () => {
    return shopperData?.transport_mode && 
           shopperData.transport_mode.toLowerCase() !== 'foot' && 
           shopperData.transport_mode.toLowerCase() !== 'on foot';
  };

  // Add state for vehicles
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Add state for showing vehicle form
  const [showVehicleForm, setShowVehicleForm] = useState(true);

  // Add function to load vehicles
  const loadVehicles = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoadingVehicles(true);
    try {
      console.log('Loading vehicles for user:', session.user.id);
      const response = await fetch(`/api/queries/get-shopper-vehicles?user_id=${session.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to load vehicles');
      }
      const data = await response.json();
      console.log('Vehicles data:', data);
      
      // Update vehicles state with the data from the response
      setVehicles(data.data?.vehicles || []);
      
      // Hide form if vehicles exist
      if (data.data?.vehicles && data.data.vehicles.length > 0) {
        setShowVehicleForm(false);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      logger.error("Error loading vehicles:", error);
      toaster.push(
        <Message type="error" closable>
          Failed to load vehicles
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );
    } finally {
      setLoadingVehicles(false);
    }
  }, [session?.user?.id, toaster]);

  // Load vehicles when component mounts or session changes
  useEffect(() => {
    if (session?.user?.id) {
      loadVehicles();
    }
  }, [session?.user?.id, loadVehicles]);

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

                {/* Default address under profile */}
                <div className="mt-4 w-full text-center">
                  <h3 className="font-medium">Service Area</h3>
                  {loading ? (
                    <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        {shopperData?.address || "No service area selected"}
                      </p>
                      <Button
                        size="sm"
                        appearance="link"
                        onClick={() => setShowAddressPopup(true)}
                      >
                        Change Service Area
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
                <span className="font-bold text-yellow-500">
                  {stats.averageRating.toFixed(1)} ★
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats.totalEarnings)}
                </span>
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
              ...(shouldShowVehicleTab() ? [{ key: "vehicles", label: "Vehicles" }] : []),
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
          <Panel shaded bordered className={`${
            theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}>
            <h3 className={`mb-4 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>Account Information</h3>
            {loading ? (
              <div className="space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className={`h-4 animate-pulse rounded ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    />
                  ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className={`rounded-lg border p-4 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  <h4 className={`mb-4 font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>Personal Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Full Name</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>{shopperData?.full_name || user?.name}</p>
                </div>
                <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Email</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>{user?.email}</p>
                </div>
                <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Phone Number</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>{shopperData?.phone_number || user?.phone || "Not provided"}</p>
                </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>National ID</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>{shopperData?.national_id || "Not provided"}</p>
              </div>
                  </div>
                      </div>

                {/* Delivery Information */}
                <div className={`rounded-lg border p-4 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  <h4 className={`mb-4 font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>Delivery Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Transport Mode</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>{shopperData?.transport_mode ? shopperData.transport_mode.charAt(0).toUpperCase() + shopperData.transport_mode.slice(1).replace('_', ' ') : "Not set"}</p>
                            </div>
                            <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Address</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>{shopperData?.address || "Not provided"}</p>
                              </div>
                            </div>
                </div>

                {/* Account Status */}
                <div className={`rounded-lg border p-4 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  <h4 className={`mb-4 font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>Account Status</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                            <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Status</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          shopperData?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : shopperData?.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {shopperData?.status ? shopperData.status.charAt(0).toUpperCase() + shopperData.status.slice(1) : "Not registered"}
                        </span>
                      </p>
                              </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>Background Check</label>
                      <p className={`mt-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          shopperData?.background_check_completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shopperData?.background_check_completed ? "Completed" : "Pending"}
                        </span>
                      </p>
                            </div>
                      </div>
                    </div>

                <div className="flex justify-end space-x-4">
                      <Button
                        appearance="primary"
                        color="green"
                    onClick={() => setShowUpdateDrawer(true)}
                      >
                    Update Information
                      </Button>
                    </div>
              </div>
            )}
          </Panel>
        )}

        {activeTab === "vehicles" && shouldShowVehicleTab() && (
          <div className="space-y-6">
            {vehicles.length > 0 ? (
              <Panel shaded bordered className={`${
                theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>Your Vehicles</h3>
                  <Button
                    appearance="primary"
                    color="blue"
                    onClick={() => {
                      toaster.push(
                        <Message type="info" closable>
                          Please contact support to make changes to your vehicle information
                        </Message>,
                        { placement: 'topEnd', duration: 5000 }
                      );
                    }}
                  >
                    <i className="fas fa-ticket-alt mr-2" />
                    Raise Ticket
                  </Button>
                </div>
                
                {loadingVehicles ? (
                  <div className="flex justify-center p-4">
                    <Loader size="md" />
                  </div>
                ) : (
                  <List>
                    {vehicles.map((vehicle) => (
                      <List.Item key={vehicle.id}>
                        <div className="flex items-center space-x-4 p-4">
                          <div className="h-20 w-20 overflow-hidden rounded-lg">
                            <img
                              src={vehicle.photo}
                              alt={`${vehicle.type} photo`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                            </h4>
                            <p className={`${
                              theme === "dark" ? "text-gray-300" : "text-gray-600"
                            }`}>
                              Model: {vehicle.model}
                            </p>
                            <p className={`${
                              theme === "dark" ? "text-gray-300" : "text-gray-600"
                            }`}>
                              Plate: {vehicle.plate_number}
                            </p>
                          </div>
                        </div>
                      </List.Item>
                    ))}
                  </List>
                )}
              </Panel>
            ) : (
              <VehicleManagement
                userId={session?.user?.id || ""}
                onVehicleAdded={() => {
                  loadVehicles();
                  toaster.push(
                    <Message type="success" closable>
                      Vehicle added successfully
                    </Message>,
                    { placement: 'topEnd', duration: 5000 }
                  );
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Address Selection Popup */}
      <AddressSelectionPopup
        isOpen={showAddressPopup}
        onClose={() => setShowAddressPopup(false)}
        onSave={handleAddressUpdate}
        currentAddress={shopperData?.address}
        loading={updatingAddress}
      />

      {/* Add UpdateShopperDrawer */}
      {showUpdateDrawer && (
      <UpdateShopperDrawer
        isOpen={showUpdateDrawer}
        onClose={() => setShowUpdateDrawer(false)}
        currentData={{
            id: shopperData?.id || "",
          full_name: shopperData?.full_name || "",
          phone_number: shopperData?.phone_number || "",
          national_id: shopperData?.national_id || "",
          driving_license: shopperData?.driving_license || "",
          transport_mode: shopperData?.transport_mode || "",
            profile_photo: shopperData?.profile_photo || "",
            national_id_image: shopperData?.national_id_image || "",
            driving_license_image: shopperData?.driving_license_image || "",
        }}
        onUpdate={handleUpdateShopper}
      />
      )}
    </div>
  );
}
