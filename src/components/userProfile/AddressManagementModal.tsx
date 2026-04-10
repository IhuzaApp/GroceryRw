import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import { useTheme } from "../../context/ThemeContext";
import Cookies from "js-cookie";
import { useAuth } from "../../hooks/useAuth";

// Skeleton loader for address cards
function AddressSkeleton() {
  return (
    <div className="animate-pulse rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mb-6 flex h-10 w-10 rounded-2xl bg-gray-200 dark:bg-white/5" />
      <div className="mb-3 h-6 w-3/4 rounded-xl bg-gray-200 dark:bg-white/5" />
      <div className="mb-6 h-4 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.03]" />
      <div className="flex gap-3">
        <div className="h-12 flex-1 rounded-2xl bg-gray-200 dark:bg-white/5" />
        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/[0.03]" />
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

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
      {/* Main Delivery Address Modal */}
      {open && !showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md px-4" onClick={onClose} />
          
          <div
            className={`relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[3rem] border shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in zoom-in-95 ${
              theme === "dark"
                ? "border-white/10 bg-[#0A0A0A]"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-20 flex items-center justify-between border-b px-8 py-6 backdrop-blur-xl ${
                theme === "dark"
                  ? "border-white/5 bg-[#0A0A0A]/80"
                  : "border-gray-100 bg-white/80"
              }`}
            >
              <div>
                <h2
                  className={`text-2xl font-black tracking-tighter sm:text-3xl ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Delivery Addresses
                </h2>
                <p
                  className={`mt-1 text-xs font-semibold uppercase tracking-widest opacity-40 ${
                    theme === "dark" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Manage your delivery locations
                </p>
              </div>
              <button
                onClick={onClose}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all active:scale-90 ${
                  theme === "dark"
                    ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 border border-black/5"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${
                        theme === "dark" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-500 text-white"
                      }`}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black tracking-tight ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Saved Locations
                      </h3>
                      <p
                        className={`text-xs font-bold uppercase tracking-widest opacity-40 ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {addresses.length} address
                        {addresses.length !== 1 ? "es" : ""} found
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] hover:shadow-emerald-500/40 active:scale-95"
                  >
                    <svg className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New
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
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`group relative overflow-hidden rounded-[2.5rem] border-2 p-6 transition-all duration-500 ${
                          addr.is_default
                            ? theme === "dark"
                              ? "border-emerald-500/40 bg-emerald-500/[0.03] shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]"
                              : "border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-500/10"
                            : theme === "dark"
                            ? "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                            : "border-gray-100 bg-gray-50/50 hover:border-emerald-200 hover:bg-white hover:shadow-lg"
                        }`}
                      >
                        {/* Category Badge & Status */}
                        <div className="flex items-center justify-between mb-6">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            theme === "dark" ? "bg-white/5 text-gray-400" : "bg-white text-gray-500 shadow-sm"
                          }`}>
                            {addr.type === "home" ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            ) : addr.type === "office" ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </div>
                          {addr.is_default && (
                            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-6">
                          <h4 className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {addr.street}
                          </h4>
                          <div className="flex items-center gap-2">
                             <span className={`text-xs font-bold ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                              {addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}
                            </span>
                          </div>
                          
                          {addr.placeDetails && Object.keys(addr.placeDetails).length > 0 && (
                            <div className={`flex flex-wrap gap-2 pt-2`}>
                              {addr.placeDetails.gateNumber && (
                                <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${theme === "dark" ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                  Gate: {addr.placeDetails.gateNumber}
                                </span>
                              )}
                              {addr.placeDetails.floor && (
                                <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${theme === "dark" ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                  Floor {addr.placeDetails.floor}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAddressSelect(addr)}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:translate-y-[-1px] active:scale-95"
                          >
                            Select
                          </button>
                          {!addr.is_default && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:bg-white/5 active:scale-90 ${
                                theme === "dark" ? "border-white/10 text-gray-400" : "border-gray-200 text-gray-500"
                              }`}
                              title="Set as Default"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add New Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-md px-4" onClick={() => setShowAddModal(false)} />
          
          <div
            className={`relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-[3rem] border shadow-[0_32px_120px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 animate-in slide-in-from-bottom-12 ${
              theme === "dark"
                ? "border-white/10 bg-[#0A0A0A]"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-20 flex items-center justify-between border-b px-8 py-6 backdrop-blur-xl ${
                theme === "dark"
                  ? "border-white/5 bg-[#0A0A0A]/80"
                  : "border-gray-100 bg-white/80"
              }`}
            >
              <div>
                <h3
                  className={`text-2xl font-black tracking-tighter ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add Location
                </h3>
                <p
                  className={`mt-1 text-[10px] font-black uppercase tracking-widest opacity-40 ${
                    theme === "dark" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Enter your delivery details
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
                  setAddressType("home");
                  setPlaceDetails({});
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all active:scale-90 ${
                  theme === "dark"
                    ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 border border-black/5"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

                {/* Search / Street */}
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Search Address
                  </label>
                  <div className="relative group">
                    <div className={`flex items-center gap-3 rounded-2xl border transition-all duration-300 p-4 ${
                      theme === "dark" 
                        ? "border-white/10 bg-white/[0.03] focus-within:border-emerald-500/50 focus-within:bg-white/[0.05]" 
                        : "border-gray-200 bg-gray-50 focus-within:border-emerald-500 focus-within:bg-white"
                    }`}>
                      <svg className={`h-5 w-5 ${theme === "dark" ? "text-white/20" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
                      </svg>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => handleStreetChange(e.target.value)}
                        placeholder="Start typing your street address..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:font-normal"
                      />
                    </div>
                    {/* Autocomplete Suggestions */}
                    {activeInput && suggestions.length > 0 && (
                      <div className={`absolute z-[120] mt-3 w-full overflow-hidden rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 ${
                        theme === "dark" ? "border-white/10 bg-zinc-950" : "border-gray-200 bg-white"
                      }`}>
                        {suggestions.map((sug) => (
                          <div
                            key={sug.place_id}
                            onClick={() => handleSelect(sug)}
                            className={`cursor-pointer px-5 py-3 transition-colors ${
                              theme === "dark" ? "hover:bg-white/5 border-b border-white/5" : "hover:bg-gray-50 border-b border-gray-100"
                            }`}
                          >
                            <p className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{sug.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">City</label>
                     <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                        theme === "dark" ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50" : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Code</label>
                     <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                        theme === "dark" ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50" : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Type Selection */}
                <div className="space-y-4">
                   <div className="flex border-b border-white/5 pb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Location Type</label>
                   </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["home", "office", "apartment"].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setAddressType(t);
                          setPlaceDetails({});
                        }}
                        className={`rounded-2xl border-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                          addressType === t
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : theme === "dark" ? "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5" : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Details */}
                {addressType === "home" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Gate No</label>
                      <input
                        type="text"
                        value={placeDetails.gateNumber || ""}
                        onChange={(e) => setPlaceDetails({...placeDetails, gateNumber: e.target.value})}
                        className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                          theme === "dark" ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50" : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Gate Color</label>
                      <input
                        type="text"
                        value={placeDetails.gateColor || ""}
                        onChange={(e) => setPlaceDetails({...placeDetails, gateColor: e.target.value})}
                        className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                          theme === "dark" ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50" : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                )}

                 {(addressType === "office" || addressType === "apartment") && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Floor</label>
                      <input
                        type="text"
                        value={placeDetails.floor || ""}
                        onChange={(e) => setPlaceDetails({...placeDetails, floor: e.target.value})}
                        className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                          theme === "dark" ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50" : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{addressType === "office" ? "Office No" : "Apt No"}</label>
                      <input
                        type="text"
                        value={placeDetails.doorNumber || ""}
                        onChange={(e) => setPlaceDetails({...placeDetails, doorNumber: e.target.value})}
                        className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                          theme === "dark" ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50" : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Default Toggle */}
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] p-4 group transition-colors hover:bg-white/[0.03]">
                  <span className="text-xs font-bold opacity-60">Set as default delivery spot</span>
                  <div
                    onClick={() => setIsDefault(!isDefault)}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                      isDefault ? "bg-emerald-500" : theme === "dark" ? "bg-white/10" : "bg-gray-200"
                    }`}
                  >
                    <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDefault ? "translate-x-5" : ""}`} />
                  </div>
                </label>
            </div>

            {/* Actions */}
            <div className={`border-t p-8 flex gap-4 ${theme === "dark" ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-gray-50/50"}`}>
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
                className={`flex-1 rounded-2xl py-5 text-xs font-black uppercase tracking-widest transition-all ${
                  theme === "dark" ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-white text-gray-500 hover:bg-gray-100 border border-black/5"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !street}
                className="flex-[2] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-5 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-emerald-500/30 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-30"
              >
                {saving ? "Saving..." : "Save Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
