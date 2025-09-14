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
import { authenticatedFetch } from "../../../lib/authenticatedFetch";

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
  const [addressFormValue, setAddressFormValue] = useState<{ address: string }>(
    {
      address: "",
    }
  );
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
        const userRes = await authenticatedFetch("/api/user", {
          signal: controller.signal,
        });
        const userData = await userRes.json();
        if (isMounted) setUser(userData.user);

        // Fetch shopper stats
        const statsRes = await authenticatedFetch("/api/shopper/stats", {
          signal: controller.signal,
        });
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
        const profileRes = await authenticatedFetch(
          "/api/queries/shopper-profile",
          {
            signal: controller.signal,
          }
        );
        const profileData = await profileRes.json();
        if (isMounted && profileData.shopper) {
          setShopperData(profileData.shopper);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        logger.error(
          "Error loading shopper data:",
          error instanceof Error ? error.message : String(error)
        );
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
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
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
        data.shopper_availability.forEach((slot: any) => {
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
      if (error instanceof Error && error.name === "AbortError") return;
      logger.error(
        "Error loading schedule:",
        error instanceof Error ? error.message : String(error)
      );
      if (isMounted) {
        setHasSchedule(false);
        const defaultSchedule: TimeSlot[] = days.map((day) => ({
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
      logger.error("No session available. Please log in.", "ShopperProfileComponent");
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
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Add state for address selection
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [activeInput, setActiveInput] = useState(false);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      try {
        // Keep using AutocompleteService for now as AutocompleteSuggestion is not fully ready
        autocompleteServiceRef.current =
          new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
      } catch (error) {
        logger.error("Error initializing Google Maps services:", error instanceof Error ? error.message : String(error));
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
        logger.error("Error getting place predictions:", error instanceof Error ? error.message : String(error));
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
        setShopperData((prev) =>
          prev
            ? {
                ...prev,
                address: data.shopper.address,
              }
            : null
        );
        setShowAddressPopup(false);
        toaster.push(
          <Message type="success" closable>
            Service area updated successfully
          </Message>
        );
      }
    } catch (error: unknown) {
      logger.error(
        "Error updating address:",
        error instanceof Error ? error.message : String(error)
      );
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
        throw new Error(
          errorData.error || "Failed to update shopper information"
        );
      }

      const result = await response.json();

      // Sign out without redirect
      await signOut({
        redirect: false,
      });

      // Manually redirect to login page
      router.push("/Auth/Login");
    } catch (error: unknown) {
      logger.error(
        "Error updating shopper information:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  };

  // Add a function to check if vehicle tab should be shown
  const shouldShowVehicleTab = () => {
    return (
      shopperData?.transport_mode &&
      shopperData.transport_mode.toLowerCase() !== "foot" &&
      shopperData.transport_mode.toLowerCase() !== "on foot"
    );
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
      const response = await fetch(
        `/api/queries/get-shopper-vehicles?user_id=${session.user.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to load vehicles");
      }
      const data = await response.json();

      // Update vehicles state with the data from the response
      setVehicles(data.data?.vehicles || []);

      // Hide form if vehicles exist
      if (data.data?.vehicles && data.data.vehicles.length > 0) {
        setShowVehicleForm(false);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      logger.error("Error loading vehicles:", error instanceof Error ? error.message : String(error));
      toaster.push(
        <Message type="error" closable>
          Failed to load vehicles
        </Message>,
        { placement: "topEnd", duration: 5000 }
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
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col items-center">
            {loading ? (
              <>
                  <div className="h-24 w-24 animate-pulse rounded-full bg-white/20" />
                  <div className="mt-4 h-6 w-32 animate-pulse rounded bg-white/20" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/20" />
              </>
            ) : (
              <>
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-2xl ring-4 ring-white/20">
                  <Image
                    src={user?.profile_picture || "/assets/images/profile.jpg"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                  <h2 className="mt-4 text-center text-xl font-bold">
                  {user?.name}
                </h2>
                  <p className="text-center text-sm opacity-90">
                  Shopper since{" "}
                  {user
                    ? new Date(user.created_at).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                      Shopper
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                      {stats.averageRating.toFixed(1)} ★
                    </span>
                  </div>
                </>
              )}
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10"></div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column - User Info & Stats */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-green-600 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex flex-col items-center">
                {loading ? (
                  <>
                    <div className="h-28 w-28 animate-pulse rounded-full bg-white/20" />
                    <div className="mt-6 h-6 w-40 animate-pulse rounded bg-white/20" />
                    <div className="mt-3 h-4 w-32 animate-pulse rounded bg-white/20" />
                  </>
                ) : (
                  <>
                    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-2xl ring-4 ring-white/20">
                      <Image
                        src={user?.profile_picture || "/assets/images/profile.jpg"}
                        alt="Profile"
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-bold">
                      {user?.name}
                    </h2>
                    <p className="text-center text-sm opacity-90">
                      Shopper since{" "}
                      {user
                        ? new Date(user.created_at).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                    Shopper
                      </span>
                      <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                    {stats.averageRating.toFixed(1)} ★
                      </span>
                    </div>
                  </>
                )}
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10"></div>
                </div>

            {/* Stats Card */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Performance Stats
              </h3>
                  {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array(4)
                    .fill(0)
                    .map((_, idx) => (
                      <div
                        key={idx}
                        className="h-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700"
                      />
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalDeliveries}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Deliveries
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.completionRate}%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Completion
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/50">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.averageRating.toFixed(1)} ★
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      Rating
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(stats.totalEarnings)}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                      Earnings
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Area Card */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Service Area
              </h3>
              {loading ? (
                <div className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
                  ) : (
                    <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {shopperData?.address || "No service area selected"}
                      </p>
                      <Button
                        size="sm"
                    appearance="primary"
                    color="blue"
                        onClick={() => setShowAddressPopup(true)}
                    className="w-full"
                      >
                    <span className="mr-2">✏️</span>
                        Change Service Area
                      </Button>
                    </div>
                  )}
                </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50">
                <nav className="flex space-x-2">
                  {[
                    { key: "account", label: "Account", icon: "👤" },
                    ...(shouldShowVehicleTab()
                      ? [{ key: "vehicles", label: "Vehicles", icon: "🚗" }]
                      : []),
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`${
                        activeTab === tab.key
                          ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      } flex-1 whitespace-nowrap py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {activeTab === "account" && (
              <div className="rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 px-6 py-4 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Account Information
                  </h3>
                </div>
                <div className="p-8">
                  {loading ? (
                    <div className="space-y-6">
                      {Array(3)
                        .fill(0)
                        .map((_, idx) => (
                          <div
                            key={`skeleton-${idx}`}
                            className={`h-20 animate-pulse rounded-lg ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg">
                            <span className="text-xl">👤</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Personal Information
                          </h4>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50">
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              Full Name
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {shopperData?.full_name || user?.name}
                            </p>
                          </div>
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50">
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              Email
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user?.email}
                            </p>
                          </div>
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50 sm:col-span-2">
                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              Phone Number
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {shopperData?.phone_number ||
                                user?.phone ||
                                "Not provided"}
                            </p>
                          </div>
                  </div>
                </div>

                      {/* Delivery Information */}
                      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 border border-green-200/50 dark:border-green-700/50 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-green-500 text-white shadow-lg">
                            <span className="text-xl">🚚</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Delivery Information
                          </h4>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50">
                            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                              Transport Mode
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {shopperData?.transport_mode
                                ? shopperData.transport_mode.charAt(0).toUpperCase() +
                                  shopperData.transport_mode
                                    .slice(1)
                                    .replace("_", " ")
                                : "Not set"}
                            </p>
                          </div>
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50">
                            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                              Address
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {shopperData?.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Status */}
                      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-purple-500 text-white shadow-lg">
                            <span className="text-xl">📊</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Account Status
                          </h4>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50">
                            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">
                              Status
                            </label>
                            <span
                              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                                shopperData?.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                  : shopperData?.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                              }`}
                            >
                              {shopperData?.status
                                ? shopperData.status.charAt(0).toUpperCase() +
                                  shopperData.status.slice(1)
                                : "Not registered"}
                            </span>
                          </div>
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/50 dark:border-gray-700/50">
                            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">
                              Background Check
                            </label>
                            <span
                              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                                shopperData?.background_check_completed
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                              }`}
                            >
                              {shopperData?.background_check_completed
                                ? "Completed"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center pt-8">
                        <Button
                          appearance="primary"
                          color="green"
                          size="lg"
                          onClick={() => setShowUpdateDrawer(true)}
                          className="px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <span className="mr-2">✏️</span>
                          Update Information
                        </Button>
                      </div>
                      </div>
            )}
          </div>
                </div>
              )}

              {activeTab === "vehicles" && shouldShowVehicleTab() && (
                <div className="space-y-6">
                  {vehicles.length > 0 ? (
                    <Panel
                      shaded
                      bordered
                      className={`${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-lg font-semibold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Your Vehicles
                          </h3>
                          <Button
                            appearance="primary"
                            color="blue"
                            onClick={() => {
                              toaster.push(
                                <Message type="info" closable>
                                  Please contact support to make changes to your vehicle
                                  information
                                </Message>,
                                { placement: "topEnd", duration: 5000 }
                              );
                            }}
                          >
                            <i className="fas fa-ticket-alt mr-2" />
                            Raise Ticket
                          </Button>
                        </div>
                      </div>

                      {loadingVehicles ? (
                        <div className="flex justify-center p-8">
                          <Loader size="md" />
                        </div>
                      ) : (
                        <div className="p-6">
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
                                    <h4
                                      className={`font-semibold ${
                                        theme === "dark"
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {vehicle.type.charAt(0).toUpperCase() +
                                        vehicle.type.slice(1)}
                                    </h4>
                                    <p
                                      className={`${
                                        theme === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Model: {vehicle.model}
                                    </p>
                                    <p
                                      className={`${
                                        theme === "dark"
                                          ? "text-gray-300"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Plate: {vehicle.plate_number}
                                    </p>
                                  </div>
                                </div>
                              </List.Item>
                            ))}
                          </List>
                        </div>
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
                          { placement: "topEnd", duration: 5000 }
                        );
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Stats */}
          <div className="mb-8">
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Performance Stats
              </h3>
          {loading ? (
                <div className="grid grid-cols-2 gap-4">
              {Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                        className="h-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700"
                  />
                ))}
            </div>
          ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalDeliveries}
              </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Deliveries
              </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-2xl border border-green-200/50 dark:border-green-700/50 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.completionRate}%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Completion
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/50 text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.averageRating.toFixed(1)} ★
              </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      Rating
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(stats.totalEarnings)}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                      Earnings
                    </div>
              </div>
            </div>
          )}
            </div>
      </div>

          {/* Mobile Service Area */}
          <div className="mb-8">
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Service Area
              </h3>
              {loading ? (
                <div className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {shopperData?.address || "No service area selected"}
                  </p>
                  <Button
                    size="sm"
                    appearance="primary"
                    color="blue"
                    onClick={() => setShowAddressPopup(true)}
                    className="w-full"
                  >
                    <span className="mr-2">✏️</span>
                    Change Service Area
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50">
              <nav className="flex space-x-2">
                {[
                  { key: "account", label: "Account", icon: "👤" },
              ...(shouldShowVehicleTab()
                    ? [{ key: "vehicles", label: "Vehicles", icon: "🚗" }]
                : []),
            ].map((tab) => (
                  <button
                key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`${
                  activeTab === tab.key
                        ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    } flex-1 whitespace-nowrap py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                {tab.label}
                  </button>
            ))}
              </nav>
            </div>
        </div>

          {/* Mobile Content */}
        {activeTab === "account" && (
          <Panel
            shaded
            bordered
            className={`${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
              <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3
                  className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Account Information
            </h3>
              </div>
              <div className="p-4">
            {loading ? (
              <div className="space-y-4">
                    {Array(3)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                          className={`h-16 animate-pulse rounded-lg ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    />
                  ))}
              </div>
            ) : (
                  <div className="space-y-4">
                {/* Personal Information */}
                <div
                  className={`rounded-lg border p-4 ${
                        theme === "dark" 
                          ? "border-gray-700 bg-gray-800/50" 
                          : "border-gray-200 bg-gray-50"
                  }`}
                >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">👤</span>
                  <h4
                          className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Personal Information
                  </h4>
                      </div>
                      <div className="space-y-3">
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Full Name
                      </label>
                      <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {shopperData?.full_name || user?.name}
                      </p>
                    </div>
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email
                      </label>
                      <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number
                      </label>
                      <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {shopperData?.phone_number ||
                          user?.phone ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div
                  className={`rounded-lg border p-4 ${
                        theme === "dark" 
                          ? "border-gray-700 bg-gray-800/50" 
                          : "border-gray-200 bg-gray-50"
                  }`}
                >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🚚</span>
                  <h4
                          className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Delivery Information
                  </h4>
                      </div>
                      <div className="space-y-3">
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Transport Mode
                      </label>
                      <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {shopperData?.transport_mode
                          ? shopperData.transport_mode.charAt(0).toUpperCase() +
                            shopperData.transport_mode
                              .slice(1)
                              .replace("_", " ")
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Address
                      </label>
                      <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {shopperData?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div
                  className={`rounded-lg border p-4 ${
                        theme === "dark" 
                          ? "border-gray-700 bg-gray-800/50" 
                          : "border-gray-200 bg-gray-50"
                  }`}
                >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📊</span>
                  <h4
                          className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Account Status
                  </h4>
                      </div>
                      <div className="space-y-3">
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Status
                      </label>
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            shopperData?.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                              : shopperData?.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                          }`}
                        >
                          {shopperData?.status
                            ? shopperData.status.charAt(0).toUpperCase() +
                              shopperData.status.slice(1)
                            : "Not registered"}
                        </span>
                    </div>
                    <div>
                      <label
                            className={`block text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Background Check
                      </label>
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            shopperData?.background_check_completed
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                          }`}
                        >
                          {shopperData?.background_check_completed
                            ? "Completed"
                            : "Pending"}
                        </span>
                    </div>
                  </div>
                </div>

                    <div className="flex justify-center pt-4">
                  <Button
                    appearance="primary"
                    color="green"
                        size="lg"
                    onClick={() => setShowUpdateDrawer(true)}
                        className="w-full"
                  >
                    Update Information
                  </Button>
                </div>
              </div>
            )}
              </div>
          </Panel>
        )}

        {activeTab === "vehicles" && shouldShowVehicleTab() && (
          <div className="space-y-6">
            {vehicles.length > 0 ? (
              <Panel
                shaded
                bordered
                className={`${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                  <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Your Vehicles
                  </h3>
                </div>

                {loadingVehicles ? (
                    <div className="flex justify-center p-8">
                    <Loader size="md" />
                  </div>
                ) : (
                    <div className="p-4">
                  <List>
                    {vehicles.map((vehicle) => (
                      <List.Item key={vehicle.id}>
                            <div className="flex items-center space-x-4 p-3">
                              <div className="h-16 w-16 overflow-hidden rounded-lg">
                            <img
                              src={vehicle.photo}
                              alt={`${vehicle.type} photo`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4
                                  className={`font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {vehicle.type.charAt(0).toUpperCase() +
                                vehicle.type.slice(1)}
                            </h4>
                            <p
                                  className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              }`}
                            >
                                  {vehicle.model} • {vehicle.plate_number}
                            </p>
                          </div>
                        </div>
                      </List.Item>
                    ))}
                  </List>
                    </div>
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
                    { placement: "topEnd", duration: 5000 }
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
          }}
          onUpdate={async (data: any) => {
            await handleUpdateShopper(data);
            return { success: true, message: "Shopper updated successfully" };
          }}
        />
      )}
    </div>
  );
}
