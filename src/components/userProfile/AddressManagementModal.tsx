import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import { useTheme } from "../../context/ThemeContext";
import Cookies from "js-cookie";
import { useAuth } from "../../hooks/useAuth";

// Skeleton loader for address cards
function AddressSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-3 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

interface AddressManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (address: any) => void;
}

export default function AddressManagementModal({
  open,
  onClose,
  onSelect,
}: AddressManagementModalProps) {
  const { isLoaded } = useGoogleMap();
  const { theme } = useTheme();
  const { isGuest } = useAuth();

  // Autocomplete service and geocoder refs
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form and autocomplete state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [street, setStreet] = useState<string>("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  // Address type and place details
  const [addressType, setAddressType] = useState<string>("home");
  const [placeDetails, setPlaceDetails] = useState<{
    gateNumber?: string;
    gateColor?: string;
    floor?: string;
    doorNumber?: string;
  }>({});

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Pre-fill address from cookies for guest users when opening add modal
  useEffect(() => {
    if (showAddModal && isGuest) {
      const savedAddress = Cookies.get("delivery_address");
      if (savedAddress) {
        try {
          const addressData = JSON.parse(savedAddress);
          if (addressData.street) {
            setStreet(addressData.street);
            setCity(addressData.city || "");
            setPostalCode(addressData.postal_code || "");
            setLat(
              addressData.latitude ? parseFloat(addressData.latitude) : null
            );
            setLng(
              addressData.longitude ? parseFloat(addressData.longitude) : null
            );
          }
        } catch (err) {
          console.error("Error parsing delivery address cookie:", err);
        }
      }
    }
  }, [showAddModal, isGuest]);

  // Handle street input change for autocomplete
  const handleStreetChange = (val: string) => {
    setStreet(val);
    if (val && autocompleteServiceRef.current) {
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
    } else {
      setSuggestions([]);
      setActiveInput(false);
    }
  };

  // On selecting an autocomplete suggestion
  const handleSelect = (sug: google.maps.places.AutocompletePrediction) => {
    setStreet(sug.description);
    setSuggestions([]);
    setActiveInput(false);
    // Geocode to get lat/lng
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { address: sug.description },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            setLat(results[0].geometry.location.lat());
            setLng(results[0].geometry.location.lng());
          }
        }
      );
    }
  };

  const fetchAddresses = () => {
    setLoading(true);
    fetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load addresses (${res.status})`);
        }
        const data = await res.json();
        setAddresses(data.addresses || []);
      })
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setError("Failed to load addresses");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [open]);

  // Save new address
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/queries/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street,
          city,
          postal_code: postalCode,
          is_default: isDefault,
          latitude: lat,
          longitude: lng,
          type: addressType,
          placeDetails: placeDetails,
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const savedAddress = await res.json();

      // Update cookie with the new address (especially important for guest users)
      if (isGuest || isDefault) {
        const locationData = {
          latitude: lat?.toString() || "0",
          longitude: lng?.toString() || "0",
          altitude: "0",
          street: street,
          city: city,
          postal_code: postalCode,
        };
        Cookies.set("delivery_address", JSON.stringify(locationData));
        window.dispatchEvent(new Event("addressChanged"));
      }

      fetchAddresses();
      setShowAddModal(false);
      // reset form
      setStreet("");
      setCity("");
      setPostalCode("");
      setIsDefault(false);
      setLat(null);
      setLng(null);
      setAddressType("home");
      setPlaceDetails({});
    } catch (err: any) {
      alert(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  // Set address as default
  const handleSetDefault = async (addressId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/queries/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addressId,
          is_default: true,
        }),
      });
      if (!res.ok) throw new Error(`Failed to set default (${res.status})`);
      await res.json();
      fetchAddresses();

      // Update the delivery address cookie with the new default address
      const updatedAddresses = await fetch("/api/queries/addresses").then(
        (res) => res.json()
      );
      const newDefaultAddress = (updatedAddresses.addresses || []).find(
        (a: any) => a.is_default
      );
      if (newDefaultAddress) {
        const locationData = {
          latitude: newDefaultAddress.latitude || "0",
          longitude: newDefaultAddress.longitude || "0",
          altitude: "0",
          street: newDefaultAddress.street,
          city: newDefaultAddress.city,
          postal_code: newDefaultAddress.postal_code,
        };
        Cookies.set("delivery_address", JSON.stringify(locationData));
        window.dispatchEvent(new Event("addressChanged"));
      }
    } catch (err: any) {
      alert(err.message || "Failed to set address as default");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSelect = (address: any) => {
    // Update cookie when selecting an address (important for guest users)
    const locationData = {
      latitude: address.latitude || "0",
      longitude: address.longitude || "0",
      altitude: "0",
      street: address.street,
      city: address.city,
      postal_code: address.postal_code,
    };
    Cookies.set("delivery_address", JSON.stringify(locationData));
    window.dispatchEvent(new Event("addressChanged"));

    if (onSelect) {
      onSelect(address);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
        <div
          className={`max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 flex items-center justify-between border-b p-5 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div>
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Manage Delivery Addresses
              </h2>
              <p
                className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage your delivery addresses and set your default location
              </p>
            </div>
            <button
              onClick={onClose}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      theme === "dark" ? "bg-green-600" : "bg-green-500"
                    }`}
                  >
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className={`text-base font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Your Addresses
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {addresses.length} saved address
                      {addresses.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <svg
                    className="mr-2 h-5 w-5 !text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="!text-white">Add New Address</span>
                </button>
              </div>

              {/* Addresses Grid */}
              {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array(4)
                    .fill(0)
                    .map((_, idx) => (
                      <AddressSkeleton key={idx} />
                    ))}
                </div>
              ) : error ? (
                <div
                  className={`rounded-xl border p-6 text-center ${
                    theme === "dark"
                      ? "border-red-700 bg-red-900/20 text-red-400"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  <svg
                    className="mx-auto mb-3 h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mb-3 font-medium">{error}</p>
                  <button
                    onClick={fetchAddresses}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      theme === "dark"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    Try Again
                  </button>
                </div>
              ) : addresses.length === 0 ? (
                <div
                  className={`rounded-xl border-2 border-dashed p-12 text-center ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800/50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <svg
                    className={`mx-auto mb-4 h-16 w-16 ${
                      theme === "dark" ? "text-gray-600" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <h3
                    className={`mb-2 text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No addresses yet
                  </h3>
                  <p
                    className={`mb-6 text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Add your first delivery address to get started
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <svg
                      className="mr-2 h-5 w-5 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="!text-white">Add Your First Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`group relative overflow-hidden rounded-xl border-2 p-5 shadow-md transition-all duration-300 hover:shadow-xl ${
                        addr.is_default
                          ? theme === "dark"
                            ? "border-green-600 bg-green-900/20"
                            : "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                          : theme === "dark"
                          ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                          : "border-gray-200 bg-white hover:border-green-300"
                      }`}
                    >
                      {/* Default Badge */}
                      {addr.is_default && (
                        <div className="absolute right-3 top-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg ${
                              theme === "dark" ? "bg-green-600" : "bg-green-500"
                            }`}
                          >
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Default
                          </span>
                        </div>
                      )}

                      {/* Location Icon */}
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                          addr.is_default
                            ? theme === "dark"
                              ? "bg-green-600"
                              : "bg-gradient-to-br from-green-500 to-emerald-600"
                            : theme === "dark"
                            ? "bg-gray-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>

                      {/* Address Details */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                          <h4
                            className={`text-lg font-bold ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {addr.street}
                          </h4>
                          {addr.type && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                theme === "dark"
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {addr.type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            {addr.city}, {addr.postal_code}
                          </p>
                        </div>
                        {addr.placeDetails &&
                          Object.keys(addr.placeDetails).length > 0 && (
                            <div
                              className={`mt-2 space-y-1 text-xs ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {addr.placeDetails.gateNumber && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Gate:</span>
                                  <span>
                                    {addr.placeDetails.gateNumber}
                                    {addr.placeDetails.gateColor &&
                                      ` (${addr.placeDetails.gateColor})`}
                                  </span>
                                </div>
                              )}
                              {addr.placeDetails.floor && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Floor:</span>
                                  <span>{addr.placeDetails.floor}</span>
                                </div>
                              )}
                              {addr.placeDetails.doorNumber && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">
                                    {addr.type === "office" ? "Office" : "Apt"}:
                                  </span>
                                  <span>{addr.placeDetails.doorNumber}</span>
                                </div>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            disabled={saving}
                            className={`group flex flex-1 items-center justify-center rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                              theme === "dark"
                                ? "border-green-400 bg-gray-800 text-green-400 hover:bg-green-600 hover:text-white"
                                : "border-green-500 bg-white text-green-600 hover:bg-green-500 hover:text-white"
                            }`}
                          >
                            {saving ? (
                              <>
                                <svg
                                  className="mr-2 h-4 w-4 animate-spin text-current group-hover:text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span className="text-current group-hover:text-white">
                                  Setting...
                                </span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="mr-2 h-4 w-4 text-current group-hover:text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-current group-hover:text-white">
                                  Set as Default
                                </span>
                              </>
                            )}
                          </button>
                        )}
                        {onSelect && (
                          <button
                            onClick={() => handleAddressSelect(addr)}
                            className="flex flex-1 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            <svg
                              className="mr-2 h-4 w-4 !text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="!text-white">Select</span>
                          </button>
                        )}
                      </div>

                      {/* Decorative Elements */}
                      <div
                        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-xl ${
                          theme === "dark"
                            ? "bg-green-800/20"
                            : "bg-gradient-to-br from-green-200/30 to-emerald-200/30"
                        }`}
                      />
                      <div
                        className={`absolute -bottom-6 -left-6 h-20 w-20 rounded-full blur-xl ${
                          theme === "dark"
                            ? "bg-blue-800/20"
                            : "bg-gradient-to-br from-blue-200/30 to-cyan-200/30"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`sticky bottom-0 flex items-center justify-end border-t p-5 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <button
              onClick={onClose}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between border-b p-5 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div>
                <h3
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add New Address
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Enter your delivery address details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setStreet("");
                  setCity("");
                  setPostalCode("");
                  setIsDefault(false);
                  setLat(null);
                  setLng(null);
                  setSuggestions([]);
                  setActiveInput(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              {/* Guest User Info Banner */}
              {isGuest && (
                <div
                  className={`rounded-xl border-2 p-4 ${
                    theme === "dark"
                      ? "border-blue-800 bg-blue-900/20"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4
                        className={`mb-1 text-sm font-semibold ${
                          theme === "dark" ? "text-blue-300" : "text-blue-900"
                        }`}
                      >
                        Guest Address
                      </h4>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-blue-400" : "text-blue-700"
                        }`}
                      >
                        We've pre-filled your current delivery address. You can
                        update it here and it will be used for your order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Street Address */}
              <div className="relative">
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!isLoaded}
                  value={street}
                  onChange={(e) => handleStreetChange(e.target.value)}
                  placeholder="Start typing your street address..."
                  className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                />
                {activeInput && suggestions.length > 0 && (
                  <div
                    className={`absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border shadow-lg ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        onClick={() => handleSelect(s)}
                        className={`cursor-pointer border-b px-4 py-3 text-sm transition-colors ${
                          theme === "dark"
                            ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                            : "border-gray-100 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {s.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                        : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter postal code"
                    className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                        : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    }`}
                  />
                </div>
              </div>

              {/* Address Type Selection */}
              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Address Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["home", "office", "apartment"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setAddressType(type);
                        setPlaceDetails({});
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        addressType === type
                          ? theme === "dark"
                            ? "border-green-400 bg-green-900/30 text-green-400"
                            : "border-green-500 bg-green-50 text-green-700"
                          : theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {type === "home" && (
                        <svg
                          className="mb-1 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      )}
                      {type === "office" && (
                        <svg
                          className="mb-1 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      )}
                      {type === "apartment" && (
                        <svg
                          className="mb-1 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                          />
                        </svg>
                      )}
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Place Details */}
              {addressType === "home" && (
                <div
                  className={`grid grid-cols-1 gap-4 rounded-xl border-2 border-dashed p-4 sm:grid-cols-2 ${
                    theme === "dark"
                      ? "border-green-800 bg-green-900/10"
                      : "border-green-200 bg-green-50/50"
                  }`}
                >
                  <div>
                    <label
                      className={`mb-2 block text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Gate Number
                    </label>
                    <input
                      type="text"
                      value={placeDetails.gateNumber || ""}
                      onChange={(e) =>
                        setPlaceDetails({
                          ...placeDetails,
                          gateNumber: e.target.value,
                        })
                      }
                      placeholder="e.g., G-123"
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`mb-2 block text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Gate Color
                    </label>
                    <input
                      type="text"
                      value={placeDetails.gateColor || ""}
                      onChange={(e) =>
                        setPlaceDetails({
                          ...placeDetails,
                          gateColor: e.target.value,
                        })
                      }
                      placeholder="e.g., Blue, White"
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    />
                  </div>
                </div>
              )}

              {(addressType === "office" || addressType === "apartment") && (
                <div
                  className={`grid grid-cols-1 gap-4 rounded-xl border-2 border-dashed p-4 sm:grid-cols-2 ${
                    theme === "dark"
                      ? "border-blue-800 bg-blue-900/10"
                      : "border-blue-200 bg-blue-50/50"
                  }`}
                >
                  <div>
                    <label
                      className={`mb-2 block text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Floor Number
                    </label>
                    <input
                      type="text"
                      value={placeDetails.floor || ""}
                      onChange={(e) =>
                        setPlaceDetails({
                          ...placeDetails,
                          floor: e.target.value,
                        })
                      }
                      placeholder="e.g., 5th Floor, Ground"
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`mb-2 block text-sm font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {addressType === "office"
                        ? "Office Number"
                        : "Apartment Number"}
                    </label>
                    <input
                      type="text"
                      value={placeDetails.doorNumber || ""}
                      onChange={(e) =>
                        setPlaceDetails({
                          ...placeDetails,
                          doorNumber: e.target.value,
                        })
                      }
                      placeholder={
                        addressType === "office" ? "e.g., 501" : "e.g., Apt 12B"
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Default Address Checkbox */}
              <div
                className={`flex items-center space-x-3 rounded-xl border p-4 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-700/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  id="default-address-modal"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor="default-address-modal"
                  className={`flex-1 text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Set as default address
                </label>
                {isDefault && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      theme === "dark"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Default
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className={`sticky bottom-0 flex items-center justify-end gap-3 border-t p-5 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setStreet("");
                  setCity("");
                  setPostalCode("");
                  setIsDefault(false);
                  setLat(null);
                  setLng(null);
                  setSuggestions([]);
                  setActiveInput(false);
                  setAddressType("home");
                  setPlaceDetails({});
                }}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === "dark"
                    ? "border-2 border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600 focus:ring-gray-500"
                    : "border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!street || lat === null || lng === null || saving}
                className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600 disabled:hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin !text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="!text-white">Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="!text-white">Save Address</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
