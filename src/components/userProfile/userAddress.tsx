import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import Cookies from "js-cookie";
import { authenticatedFetch } from "../../lib/authenticatedFetch";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../hooks/useAuth";

// Skeleton loader for address cards
function AddressSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

// Add prop interface after imports
interface UserAddressProps {
  onSelect?: (address: any) => void;
}

// Update component signature to accept props
export default function UserAddress({ onSelect }: UserAddressProps) {
  const { isLoaded } = useGoogleMap();
  const { t } = useLanguage();
  const { isGuest } = useAuth();
  // Autocomplete service and geocoder refs
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Form and autocomplete state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [street, setStreet] = useState<string>("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  // Coordinates
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

  // Pre-fill address from cookies for guest users when opening modal
  useEffect(() => {
    if (showModal && isGuest) {
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
  }, [showModal, isGuest]);

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

  useEffect(() => {
    setLoading(true);
    fetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load addresses (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setAddresses(data.addresses || []);
      })
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper to reload addresses
  const fetchAddresses = () => {
    setLoading(true);
    setError(null);
    authenticatedFetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`Failed to load addresses (${res.status})`);
        return res.json();
      })
      .then((data) => setAddresses(data.addresses || []))
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  // Save new address
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authenticatedFetch("/api/queries/addresses", {
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
      setShowModal(false);
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

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Saved Addresses
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your delivery addresses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98]"
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
          <span className="!text-white">{t("nav.addNewAddress")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, idx) => <AddressSkeleton key={idx} />)
        ) : error ? (
          <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20">
            {error}
          </div>
        ) : addresses.length ? (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`group relative overflow-hidden rounded-xl border-2 p-5 shadow-md transition-all duration-300 hover:shadow-xl ${
                addr.is_default
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-600 dark:from-green-900/20 dark:to-emerald-900/20"
                  : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
              }`}
            >
              {/* Default Badge */}
              {addr.is_default && (
                <div className="absolute right-3 top-3">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-semibold !text-white shadow-lg">
                    <svg
                      className="mr-1 h-3 w-3 !text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="!text-white">{t("address.default")}</span>
                  </span>
                </div>
              )}

              {/* Location Icon */}
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  addr.is_default
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                } shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <svg
                  className="h-6 w-6 !text-white"
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
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {addr.street}
                  </h4>
                  {addr.type && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {addr.type}
                    </span>
                  )}
                </div>
                <div className="flex items-start space-x-2 text-gray-600 dark:text-gray-300">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
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
                  <p className="text-sm">
                    {addr.city}, {addr.postal_code}
                  </p>
                </div>
                {addr.placeDetails && Object.keys(addr.placeDetails).length > 0 && (
                  <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {addr.placeDetails.gateNumber && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Gate:</span>
                        <span>
                          {addr.placeDetails.gateNumber}
                          {addr.placeDetails.gateColor && ` (${addr.placeDetails.gateColor})`}
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
                    className="group flex flex-1 items-center justify-center rounded-lg border-2 border-green-500 bg-white px-4 py-2 text-sm font-semibold text-green-600 transition-all duration-200 hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-400 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-white"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={saving}
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
                    className="flex flex-1 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={() => onSelect(addr)}
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
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-200/30 to-emerald-200/30 blur-xl dark:from-green-800/20 dark:to-emerald-800/20" />
              <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-xl dark:from-blue-800/20 dark:to-cyan-800/20" />
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
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
            <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              {t("address.noAddresses")}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              {t("address.addFirstAddress")}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
        )}
      </div>

      {/* Add New Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800 sm:px-6 sm:py-5 md:px-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
                  {t("nav.addNewAddress")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("address.enterDetails")}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
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
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="h-6 w-6"
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
            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6 md:space-y-6 md:p-8">
              {/* Guest User Info Banner */}
              {isGuest && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
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
                      <h4 className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
                        Guest Address
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        We've pre-filled your current delivery address. You can update it here and it will be used for your order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Street Address */}
              <div className="relative">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Street Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!isLoaded}
                    value={street}
                    onChange={(e) => handleStreetChange(e.target.value)}
                    placeholder="Start typing your street address..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20 sm:text-base"
                  />
                  {!isLoaded && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-xs text-gray-400">Loading...</span>
                    </div>
                  )}
                </div>
                {activeInput && suggestions.length > 0 && (
                  <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        className="cursor-pointer border-b border-gray-100 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => handleSelect(s)}
                      >
                        {s.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("address.city")} *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("address.enterCity")}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("address.postalCode")} *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={t("address.enterPostalCode")}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20 sm:text-base"
                  />
                </div>
              </div>

              {/* Address Type Selection */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address Type *
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
                          ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/30 dark:text-green-400"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
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
                <div className="grid grid-cols-1 gap-4 rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-900/10 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                    />
                  </div>
                </div>
              )}

              {(addressType === "office" || addressType === "apartment") && (
                <div className="grid grid-cols-1 gap-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/10 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                    />
                  </div>
                </div>
              )}

              {/* Default Address Checkbox */}
              <div className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                <input
                  type="checkbox"
                  id="default-address"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor="default-address"
                  className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("address.setAsDefault")}
                </label>
                {isDefault && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {t("address.default")}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:py-5 md:px-8">
              <button
                onClick={() => {
                  setShowModal(false);
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
                className="rounded-xl border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:border-gray-500"
              >
                {t("common.cancel")}
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
                    <span className="!text-white">{t("address.saving")}</span>
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
                    <span className="!text-white">
                      {t("address.saveAddress")}
                    </span>
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
