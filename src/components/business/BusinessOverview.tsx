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
  const [newStoreData, setNewStoreData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
  });

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

  const handleCreateStore = () => {
    setShowCreateStoreModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateStoreModal(false);
    setNewStoreData({
      name: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setSuggestions([]);
    setShowSuggestions(false);
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

    await createBusinessStore({
      name: newStoreData.name.trim(),
      description: newStoreData.description.trim() || undefined,
      latitude: newStoreData.latitude.trim(),
      longitude: newStoreData.longitude.trim(),
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
        // Refresh stores list
        fetchUserStores();
      } else {
        toast.error(data.error || "Failed to create store");
      }
    } catch (error: any) {
      console.error("Error creating store:", error);
      toast.error("Failed to create store. Please try again.");
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
      value: "$45,230",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "from-green-100 to-green-200",
      detailed: [
        { label: "This Month", value: "$12,450" },
        { label: "Last Month", value: "$10,850" },
        { label: "This Year", value: "$45,230" },
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create New Store</h3>
                <button
                  onClick={handleCloseCreateModal}
                  className="rounded-full p-1 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                  placeholder="Enter store name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
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
                    disabled={!isGoogleMapsLoaded}
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCreateStore}
                  disabled={!newStoreData.name.trim() || !newStoreData.address.trim() || !isGoogleMapsLoaded}
                  className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

