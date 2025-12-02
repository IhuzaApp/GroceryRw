"use client";

import { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Store,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface BusinessOverviewProps {
  businessAccount?: any;
}

export function BusinessOverview({ businessAccount }: BusinessOverviewProps) {
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMap();
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [userStores, setUserStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  
  // Google Maps Autocomplete refs
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (businessAccount?.id) {
      fetchUserStores();
    }
  }, [businessAccount]);

  const fetchUserStores = async () => {
    if (!businessAccount?.id) {
      setUserStores([]);
      return;
    }

    setLoadingStores(true);
    try {
      const response = await fetch("/api/queries/business-stores");
      if (response.ok) {
        const data = await response.json();
        setUserStores(data.stores || []);
      } else {
        console.error("Failed to fetch business stores:", response.status);
        setUserStores([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
      setUserStores([]);
    } finally {
      setLoadingStores(false);
    }
  };

  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [storeImage, setStoreImage] = useState<string>("");
  const [newStoreData, setNewStoreData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    operating_hours: "",
    category_id: "",
  });

  // Operating hours state
  const [operatingHours, setOperatingHours] = useState<{
    [key: string]: { open: boolean; from: string; to: string };
  }>({
    monday: { open: true, from: "09:00", to: "17:00" },
    tuesday: { open: true, from: "09:00", to: "17:00" },
    wednesday: { open: true, from: "09:00", to: "17:00" },
    thursday: { open: true, from: "09:00", to: "17:00" },
    friday: { open: true, from: "09:00", to: "17:00" },
    saturday: { open: false, from: "09:00", to: "17:00" },
    sunday: { open: false, from: "09:00", to: "17:00" },
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  // Initialize Google Maps services
  useEffect(() => {
    if (isGoogleMapsLoaded && !autocompleteServiceRef.current) {
      try {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
      } catch (error) {
        console.error("Error initializing Google Maps services:", error);
      }
    }
  }, [isGoogleMapsLoaded]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.suggestions-dropdown')
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Handle address input change for autocomplete
  const handleAddressChange = (value: string) => {
    setNewStoreData({ ...newStoreData, address: value });
    if (value && autocompleteServiceRef.current) {
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          { input: value, componentRestrictions: { country: ["rw"] } },
          (preds, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
              setSuggestions(preds);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      } catch (error) {
        console.error("Error getting place predictions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // On selecting an autocomplete suggestion
  const handleSelectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    setNewStoreData({ ...newStoreData, address: suggestion.description });
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Geocode to get lat/lng
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { address: suggestion.description },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            setNewStoreData(prev => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString(),
            }));
          }
        }
      );
    }
  };

  const handleCreateStore = async () => {
    setShowCreateStoreModal(true);
    // Fetch categories when modal opens
    if (categories.length === 0) {
      setLoadingCategories(true);
      try {
        const response = await fetch("/api/queries/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateStoreModal(false);
    setNewStoreData({
      name: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      operating_hours: "",
      category_id: "",
    });
    setStoreImage("");
    // Reset operating hours to default
    setOperatingHours({
      monday: { open: true, from: "09:00", to: "17:00" },
      tuesday: { open: true, from: "09:00", to: "17:00" },
      wednesday: { open: true, from: "09:00", to: "17:00" },
      thursday: { open: true, from: "09:00", to: "17:00" },
      friday: { open: true, from: "09:00", to: "17:00" },
      saturday: { open: false, from: "09:00", to: "17:00" },
      sunday: { open: false, from: "09:00", to: "17:00" },
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Image compression function
  const compressImage = (base64: string, maxSizeKB = 200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress with quality adjustment
        let quality = 0.9;
        let compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        const maxSize = maxSizeKB * 1024;

        while (compressedBase64.length > maxSize && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = base64;
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB before compression)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        try {
          // Compress the image
          const compressed = await compressImage(result, 200);
          setStoreImage(compressed);
          toast.success("Image uploaded successfully!");
        } catch (error) {
          console.error("Error compressing image:", error);
          setStoreImage(result); // Use original if compression fails
          toast.success("Image uploaded successfully!");
        }
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleOperatingHoursChange = (
    day: string,
    field: "open" | "from" | "to",
    value: boolean | string
  ) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const applyToAllDays = (from: string, to: string) => {
    const updatedHours: typeof operatingHours = {};
    days.forEach((day) => {
      updatedHours[day.key] = {
        open: operatingHours[day.key].open,
        from,
        to,
      };
    });
    setOperatingHours(updatedHours);
  };

  const applyToDayRange = (startDay: string, endDay: string, from: string, to: string) => {
    const startIndex = days.findIndex((d) => d.key === startDay);
    const endIndex = days.findIndex((d) => d.key === endDay);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const updatedHours = { ...operatingHours };
    const range = startIndex <= endIndex 
      ? days.slice(startIndex, endIndex + 1)
      : [...days.slice(startIndex), ...days.slice(0, endIndex + 1)];
    
    range.forEach((day) => {
      updatedHours[day.key] = {
        open: true,
        from,
        to,
      };
    });
    
    setOperatingHours(updatedHours);
  };

  const formatOperatingHoursForAPI = () => {
    const formatted: { [key: string]: string } = {};
    days.forEach((day) => {
      const hours = operatingHours[day.key];
      if (hours.open) {
        // Format time from 24h to 12h format
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        };
        formatted[day.key] = `${formatTime(hours.from)} - ${formatTime(hours.to)}`;
      } else {
        formatted[day.key] = "closed";
      }
    });
    return formatted;
  };

  const handleSubmitCreateStore = async () => {
    if (!newStoreData.name.trim()) {
      toast.error("Store name is required");
      return;
    }

    if (!newStoreData.address.trim()) {
      toast.error("Store location is required");
      return;
    }

    if (!newStoreData.latitude || !newStoreData.longitude) {
      toast.error("Please select a valid address from the suggestions");
      return;
    }

    // Format operating hours from state
    const operatingHoursJson = formatOperatingHoursForAPI();

    await createBusinessStore({
      name: newStoreData.name.trim(),
      description: newStoreData.description.trim() || undefined,
      latitude: newStoreData.latitude.trim(),
      longitude: newStoreData.longitude.trim(),
      operating_hours: operatingHoursJson,
      category_id: newStoreData.category_id || undefined,
      image: storeImage || undefined,
    });

    handleCloseCreateModal();
  };

  const createBusinessStore = async (storeData: {
    name: string;
    description?: string;
    category_id?: string;
    image?: string;
    latitude?: string;
    longitude?: string;
    operating_hours?: any;
  }) => {
    setIsCreatingStore(true);
    try {
      const response = await fetch("/api/mutations/create-business-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Store created successfully!");
        handleCloseCreateModal();
        // Refresh stores list
        fetchUserStores();
      } else {
        toast.error(data.error || data.message || "Failed to create store");
      }
    } catch (error: any) {
      console.error("Error creating store:", error);
      toast.error("Failed to create store. Please try again.");
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleViewStore = (storeId: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `/shops/${storeId}`;
    }
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrencySync(45230),
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "from-green-100 to-green-200",
      detailed: [
        { label: "This Month", value: formatCurrencySync(12450) },
        { label: "Last Month", value: formatCurrencySync(10850) },
        { label: "This Year", value: formatCurrencySync(45230) },
      ],
    },
    {
      title: "Active Orders",
      value: "23",
      change: "+5",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "from-blue-100 to-blue-200",
      detailed: [
        { label: "Pending", value: "8" },
        { label: "In Progress", value: "12" },
        { label: "Completed", value: "3" },
      ],
    },
    {
      title: "RFQ Responses",
      value: "18",
      change: "+8",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "from-purple-100 to-purple-200",
      detailed: [
        { label: "Pending Review", value: "5" },
        { label: "Accepted", value: "10" },
        { label: "Rejected", value: "3" },
      ],
    },
    {
      title: "Average Rating",
      value: "4.8",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "from-yellow-100 to-yellow-200",
      detailed: [
        { label: "5 Stars", value: "85%" },
        { label: "4 Stars", value: "12%" },
        { label: "3 Stars", value: "3%" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Toggle - Hidden on mobile */}
      <div className="hidden md:flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Business Overview
        </h3>
        <button
          onClick={() => setShowDetailedStats(!showDetailedStats)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {showDetailedStats ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Hide Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>View Details</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Cards - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className={`mt-1 text-xs sm:text-sm font-medium ${stat.color}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div
                className={`rounded-xl sm:rounded-2xl bg-gradient-to-br p-3 sm:p-4 ${stat.bgColor} transition-transform duration-300 group-hover:scale-110 dark:from-gray-700 dark:to-gray-600`}
              >
                <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
              </div>
            </div>

            {/* Detailed Stats (Collapsible) */}
            {showDetailedStats && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="space-y-2">
                  {stat.detailed.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {detail.label}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Stores Section */}
      <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Stores
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your stores and view their performance
            </p>
          </div>
          <button
            onClick={handleCreateStore}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Store</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {loadingStores ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
          </div>
        ) : userStores.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userStores.map((store) => (
              <div
                key={store.id}
                className="group cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                onClick={() => handleViewStore(store.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Store className="h-5 w-5 text-green-600" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {store.name}
                      </h5>
                    </div>
                    {store.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {store.description}
                      </p>
                    )}
                    {(store.latitude && store.longitude) && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        📍 Location: {store.latitude}, {store.longitude}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          store.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {store.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No stores yet
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create your first store to start selling
            </p>
            <button
              onClick={handleCreateStore}
              className="mt-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
            >
              Create Your First Store
            </button>
          </div>
        )}
      </div>

      {/* Create Store Modal */}
      {showCreateStoreModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-xl bg-white shadow-2xl dark:bg-gray-800 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-6 py-3 sm:py-4 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white">Create New Store</h3>
                <button
                  onClick={handleCloseCreateModal}
                  className="rounded-full p-1.5 sm:p-1 text-white transition-colors hover:bg-white/20 active:bg-white/30"
                >
                  <X className="h-5 w-5 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                  placeholder="Enter store name"
                  disabled={isCreatingStore}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  value={newStoreData.description}
                  onChange={(e) => setNewStoreData({ ...newStoreData, description: e.target.value })}
                  placeholder="Enter store description (optional)"
                  rows={3}
                  disabled={isCreatingStore}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Category <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <select
                    value={newStoreData.category_id}
                    onChange={(e) => setNewStoreData({ ...newStoreData, category_id: e.target.value })}
                    disabled={isCreatingStore}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Store Image <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                {storeImage ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <img
                        src={storeImage}
                        alt="Store preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setStoreImage("")}
                        disabled={isCreatingStore}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <label className="block">
                      <span className="sr-only">Change image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isCreatingStore}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-gray-700 dark:file:text-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isCreatingStore}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Store Location <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Start typing an address and select from suggestions
                </p>
                <div className="relative">
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={newStoreData.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Enter store address (e.g., Kigali, Rwanda)"
                    disabled={!isGoogleMapsLoaded || isCreatingStore}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {!isGoogleMapsLoaded && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Loading Google Maps...
                    </p>
                  )}
                  
                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400">📍</span>
                            <div>
                              <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.structured_formatting.secondary_text}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {(newStoreData.latitude && newStoreData.longitude) && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Coordinates: {newStoreData.latitude}, {newStoreData.longitude}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Operating Hours <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                
                {/* Quick Actions */}
                <div className="mb-4 flex flex-wrap gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const defaultFrom = "09:00";
                      const defaultTo = "17:00";
                      applyToAllDays(defaultFrom, defaultTo);
                    }}
                    disabled={isCreatingStore}
                    className="flex-1 sm:flex-none rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Apply 9 AM - 5 PM to All</span>
                    <span className="sm:hidden">9 AM - 5 PM All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedHours: typeof operatingHours = {};
                      days.forEach((day) => {
                        updatedHours[day.key] = {
                          ...operatingHours[day.key],
                          open: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.key),
                        };
                      });
                      setOperatingHours(updatedHours);
                    }}
                    disabled={isCreatingStore}
                    className="flex-1 sm:flex-none rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weekdays Only
                  </button>
                </div>

                {/* Days List */}
                <div className="space-y-2.5 sm:space-y-3 max-h-[280px] sm:max-h-64 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {days.map((day) => {
                    const hours = operatingHours[day.key];
                    return (
                      <div
                        key={day.key}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-3.5 transition-all hover:border-green-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                      >
                        {/* Day Label and Toggle */}
                        <div className="flex items-center gap-2.5 sm:min-w-[110px] sm:max-w-[110px]">
                          <input
                            type="checkbox"
                            checked={hours.open}
                            onChange={(e) =>
                              handleOperatingHoursChange(day.key, "open", e.target.checked)
                            }
                            disabled={isCreatingStore}
                            className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <label className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white cursor-pointer flex-1">
                            {day.label}
                          </label>
                        </div>

                        {/* Time Inputs or Closed Status */}
                        {hours.open ? (
                          <div className="flex flex-1 items-center gap-2 sm:gap-3 pl-6 sm:pl-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                              <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                From:
                              </label>
                              <input
                                type="time"
                                value={hours.from}
                                onChange={(e) =>
                                  handleOperatingHoursChange(day.key, "from", e.target.value)
                                }
                                disabled={isCreatingStore}
                                className="flex-1 sm:flex-none w-full sm:w-auto rounded-lg border border-gray-300 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <span className="text-gray-400 font-medium">-</span>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                              <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                To:
                              </label>
                              <input
                                type="time"
                                value={hours.to}
                                onChange={(e) =>
                                  handleOperatingHoursChange(day.key, "to", e.target.value)
                                }
                                disabled={isCreatingStore}
                                className="flex-1 sm:flex-none w-full sm:w-auto rounded-lg border border-gray-300 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="pl-6 sm:pl-0">
                            <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              Closed
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseCreateModal}
                  className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCreateStore}
                  disabled={!newStoreData.name.trim() || !newStoreData.address.trim() || !isGoogleMapsLoaded || isCreatingStore}
                  className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                  {isCreatingStore ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Create Store"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

