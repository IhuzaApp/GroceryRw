import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import { Button } from "rsuite";
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
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const [address, setAddress] = useState(currentAddress);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [activeInput, setActiveInput] = useState(false);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      try {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      } catch (error) {
        logger.error("Error initializing Google Maps AutocompleteService:", error);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    setAddress(currentAddress);
  }, [currentAddress]);

  const handleAddressChange = (val: string) => {
    setAddress(val);
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

  const handleSelect = (sug: google.maps.places.AutocompletePrediction) => {
    setAddress(sug.description);
    setSuggestions([]);
    setActiveInput(false);
  };

  const handleSave = () => {
    onSave(address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Update Service Area</h2>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 sm:px-6">
            <div className="relative">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter your service area address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                disabled={!isLoaded}
              />
              {activeInput && suggestions.length > 0 && (
                <div 
                  className="fixed z-[99999] mt-1 w-[calc(100%-2rem)] max-w-[calc(28rem-2rem)] rounded-md border border-gray-200 bg-white shadow-xl"
                  style={{
                    top: 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="cursor-pointer border-b border-gray-100 p-2 text-sm hover:bg-gray-50 last:border-b-0"
                      onClick={() => handleSelect(s)}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex justify-end space-x-3">
              <Button
                appearance="subtle"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                color="green"
                onClick={handleSave}
                loading={loading}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 