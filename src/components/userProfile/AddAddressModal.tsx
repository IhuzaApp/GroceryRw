import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import { useTheme } from "../../context/ThemeContext";
import Cookies from "js-cookie";
import { useAuth } from "../../hooks/useAuth";

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAddressModal({
  open,
  onClose,
  onSuccess,
}: AddAddressModalProps) {
  const { isLoaded } = useGoogleMap();
  const { theme } = useTheme();
  const { isGuest } = useAuth();

  // Autocomplete service and geocoder refs
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [saving, setSaving] = useState<boolean>(false);

  // Form and autocomplete state
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

  // Pre-fill address from cookies for guest users when opening modal
  useEffect(() => {
    if (open && isGuest) {
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
  }, [open, isGuest]);

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

      onSuccess();
      handleClose();
    } catch (err: any) {
      alert(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
    // reset form
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
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
      <div
        className="absolute inset-0 bg-black/40 px-4 backdrop-blur-md"
        onClick={handleClose}
      />

      <div
        className={`relative max-h-[92vh] w-full max-w-xl overflow-hidden rounded-[2rem] border shadow-[0_32px_120px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 animate-in slide-in-from-bottom-12 sm:max-h-[90vh] sm:rounded-[3rem] ${
          theme === "dark"
            ? "border-white/10 bg-[#0A0A0A]"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl sm:px-8 sm:py-6 ${
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
            onClick={handleClose}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all active:scale-90 ${
              theme === "dark"
                ? "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                : "border border-black/5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="custom-scrollbar max-h-[calc(92vh-180px)] space-y-5 overflow-y-auto p-5 sm:p-6">
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
            <label
              className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Search Address
            </label>
            <div className="group relative">
              <div
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                  theme === "dark"
                    ? "border-white/10 bg-white/[0.03] focus-within:border-emerald-500/50 focus-within:bg-white/[0.05]"
                    : "border-gray-200 bg-gray-50 focus-within:border-emerald-500 focus-within:bg-white"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-white/20" : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
                  />
                </svg>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => handleStreetChange(e.target.value)}
                  placeholder="Start typing your street address..."
                  className="flex-1 border-none bg-transparent text-sm font-bold outline-none placeholder:font-normal"
                />
              </div>
              {/* Autocomplete Suggestions */}
              {activeInput && suggestions.length > 0 && (
                <div
                  className={`absolute z-[120] mt-3 w-full overflow-hidden rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 ${
                    theme === "dark"
                      ? "border-white/10 bg-zinc-950"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {suggestions.map((sug) => (
                    <div
                      key={sug.place_id}
                      onClick={() => handleSelect(sug)}
                      className={`cursor-pointer px-5 py-3 transition-colors ${
                        theme === "dark"
                          ? "border-b border-white/5 hover:bg-white/5"
                          : "border-b border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {sug.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                  theme === "dark"
                    ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50"
                    : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                  theme === "dark"
                    ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50"
                    : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                }`}
              />
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-4">
            <div className="flex border-b border-white/5 pb-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Location Type
              </label>
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
                      : theme === "dark"
                      ? "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-white"
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
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Gate No
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
                  className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                    theme === "dark"
                      ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50"
                      : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
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
                  className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                    theme === "dark"
                      ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50"
                      : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                  }`}
                />
              </div>
            </div>
          )}

          {(addressType === "office" || addressType === "apartment") && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Floor
                </label>
                <input
                  type="text"
                  value={placeDetails.floor || ""}
                  onChange={(e) =>
                    setPlaceDetails({ ...placeDetails, floor: e.target.value })
                  }
                  className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                    theme === "dark"
                      ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50"
                      : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  {addressType === "office" ? "Office No" : "Apt No"}
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
                  className={`w-full rounded-2xl border p-4 text-sm font-bold transition-all ${
                    theme === "dark"
                      ? "border-white/10 bg-white/[0.03] outline-none focus:border-emerald-500/50"
                      : "border-gray-200 bg-gray-50 outline-none focus:border-emerald-500"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Default Toggle */}
          <label className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition-colors hover:bg-white/[0.03]">
            <span className="text-xs font-bold opacity-60">
              Set as default delivery spot
            </span>
            <div
              onClick={() => setIsDefault(!isDefault)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                isDefault
                  ? "bg-emerald-500"
                  : theme === "dark"
                  ? "bg-white/10"
                  : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isDefault ? "translate-x-5" : ""
                }`}
              />
            </div>
          </label>
        </div>

        <div
          className={`flex flex-col gap-4 border-t p-5 sm:flex-row sm:p-8 ${
            theme === "dark"
              ? "border-white/5 bg-white/[0.01]"
              : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <button
            onClick={handleClose}
            className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all sm:flex-1 sm:py-5 ${
              theme === "dark"
                ? "bg-white/5 text-gray-400 hover:bg-white/10"
                : "border border-black/5 bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !street}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-emerald-500/30 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-30 sm:flex-[2] sm:py-5"
          >
            {saving ? "Saving..." : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
}
