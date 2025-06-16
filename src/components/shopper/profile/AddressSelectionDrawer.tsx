import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";

interface AddressSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  currentAddress?: string;
  loading?: boolean;
}

export default function AddressSelectionPopup({
  isOpen,
  onClose,
  onSave,
  currentAddress = "",
  loading = false,
}: AddressSelectionPopupProps) {
  const { isLoaded } = useGoogleMap();
  const { theme } = useTheme();
  const [address, setAddress] = useState<string>(currentAddress);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      try {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Error initializing Google Maps AutocompleteService", errorMessage);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    setAddress(currentAddress);
  }, [currentAddress]);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val && autocompleteServiceRef.current) {
      setIsLoading(true);
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          { input: val, componentRestrictions: { country: ["rw"] } },
          (preds, status) => {
            setIsLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
              const addressMap = new Map<string, number>();
              const uniquePreds = preds.map(pred => {
                const description = pred.description;
                if (addressMap.has(description)) {
                  const count = addressMap.get(description)! + 1;
                  addressMap.set(description, count);
                  return `${description} (${count})`;
                }
                addressMap.set(description, 1);
                return description;
              });
              setSuggestions(uniquePreds);
            } else {
              setSuggestions([]);
            }
          }
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Error getting place predictions", errorMessage);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (value: string) => {
    const cleanValue = value.replace(/\s\(\d+\)$/, '');
    setAddress(cleanValue);
    setSuggestions([]);
  };

  const handleSave = () => {
    if (!address.trim()) {
      return;
    }
    onSave(address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className={`relative w-full max-w-md transform overflow-hidden rounded-lg shadow-xl transition-all ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}>
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}>
            <h3 className={`text-base sm:text-lg font-medium ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Update Service Area
            </h3>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Address
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Enter your service area address"
                    className={`w-full rounded-md border px-3 py-2 text-sm sm:text-base ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    } focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
                    </div>
                  )}
                </div>
                {suggestions.length > 0 && (
                  <div className={`mt-1 max-h-32 sm:max-h-48 overflow-y-auto rounded-md border ${
                    theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"
                  }`}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelect(suggestion)}
                        className={`cursor-pointer px-3 py-2 text-sm ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}>
            <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
              <button
                onClick={onClose}
                className={`w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 