import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Form, Checkbox, Loader } from "rsuite";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import { useTheme } from "../../context/ThemeContext";
import Cookies from "js-cookie";

// Skeleton loader for address cards
function AddressSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700 sm:h-4 sm:w-3/4" />
        <div className="h-5 w-12 rounded bg-green-200 dark:bg-green-800 sm:h-6 sm:w-16" />
      </div>
      <div className="mb-2 h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-700 sm:h-3" />
      <div className="mb-3 h-2 w-1/3 rounded bg-gray-200 dark:bg-gray-700 sm:mb-4 sm:h-3" />
      <div className="flex flex-wrap gap-2">
        <div className="h-7 w-20 rounded bg-gray-200 dark:bg-gray-700 sm:h-8" />
        <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700 sm:h-8" />
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

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

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
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await res.json();
      fetchAddresses();
      setShowAddModal(false);
      // reset form
      setStreet("");
      setCity("");
      setPostalCode("");
      setIsDefault(false);
      setLat(null);
      setLng(null);
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
    if (onSelect) {
      onSelect(address);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      className={`${
        theme === "dark" ? "bg-gray-900 text-gray-100" : ""
      } mx-auto w-full max-w-4xl`}
      backdrop="static"
    >
      <Modal.Header
        className={`${
          theme === "dark" ? "bg-gray-800 text-gray-100" : ""
        } px-4 py-3 sm:px-6 sm:py-4`}
      >
        <Modal.Title className="text-lg font-semibold sm:text-xl">
          Manage Delivery Addresses
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`${
          theme === "dark" ? "bg-gray-900 text-gray-100" : ""
        } p-4 sm:p-6`}
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div
            className={`rounded-lg border p-3 sm:p-4 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                    theme === "dark" ? "bg-green-600" : "bg-green-500"
                  }`}
                >
                  <svg
                    className="h-4 w-4 text-white sm:h-5 sm:w-5"
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
                  <h3 className="text-base font-semibold sm:text-lg">
                    Your Addresses
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Manage your delivery addresses and set your default location
                  </p>
                </div>
              </div>
              <Button
                appearance="primary"
                color="green"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600 sm:text-sm"
                onClick={() => setShowAddModal(true)}
              >
                <svg
                  className="mr-1 h-3 w-3 sm:h-4 sm:w-4"
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
                <span className="hidden sm:inline">Add New Address</span>
                <span className="sm:hidden">Add Address</span>
              </Button>
            </div>
          </div>

          {/* Addresses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {Array(4)
                .fill(0)
                .map((_, idx) => (
                  <AddressSkeleton key={idx} />
                ))}
            </div>
          ) : error ? (
            <div
              className={`rounded-lg border p-4 text-center sm:p-6 ${
                theme === "dark"
                  ? "border-red-700 bg-red-900/20 text-red-400"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <svg
                className="mx-auto mb-2 h-6 w-6 sm:mb-3 sm:h-8 sm:w-8"
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
              <p className="text-sm font-medium sm:text-base">{error}</p>
              <Button
                appearance="primary"
                size="sm"
                className="mt-2 sm:mt-3"
                onClick={fetchAddresses}
              >
                Try Again
              </Button>
            </div>
          ) : addresses.length === 0 ? (
            <div
              className={`rounded-lg border p-6 text-center sm:p-8 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <svg
                className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:mb-4 sm:h-12 sm:w-12"
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
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                No addresses yet
              </h3>
              <p
                className={`mb-3 text-xs sm:mb-4 sm:text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Add your first delivery address to get started
              </p>
              <Button
                appearance="primary"
                color="green"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600 sm:text-sm"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`group relative rounded-lg border p-3 transition-all duration-200 hover:shadow-lg sm:p-4 ${
                    addr.is_default
                      ? theme === "dark"
                        ? "border-green-600 bg-green-900/10"
                        : "border-green-500 bg-green-50"
                      : theme === "dark"
                      ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {/* Default Badge */}
                  {addr.is_default && (
                    <div
                      className={`absolute -top-1 right-2 rounded-full px-2 py-0.5 text-xs font-semibold sm:-top-2 sm:right-4 sm:px-3 sm:py-1 ${
                        theme === "dark"
                          ? "bg-green-600 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      Default
                    </div>
                  )}

                  {/* Address Icon */}
                  <div className="mb-2 sm:mb-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                        addr.is_default
                          ? theme === "dark"
                            ? "bg-green-600"
                            : "bg-green-500"
                          : theme === "dark"
                          ? "bg-gray-600"
                          : "bg-gray-500"
                      }`}
                    >
                      <svg
                        className="h-4 w-4 text-white sm:h-5 sm:w-5"
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
                  </div>

                  {/* Address Details */}
                  <div className="mb-3 sm:mb-4">
                    <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white sm:mb-2 sm:text-base">
                      {addr.street}
                    </h4>
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {addr.city}, {addr.postal_code}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {!addr.is_default && (
                      <Button
                        size="xs"
                        appearance="ghost"
                        className={`border text-xs sm:text-sm ${
                          theme === "dark"
                            ? "border-green-600 text-green-400 hover:bg-green-600/20"
                            : "border-green-500 text-green-600 hover:bg-green-50"
                        }`}
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader size="xs" content="Setting..." />
                        ) : (
                          <>
                            <svg
                              className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="hidden sm:inline">
                              Set Default
                            </span>
                            <span className="sm:hidden">Default</span>
                          </>
                        )}
                      </Button>
                    )}
                    {onSelect && (
                      <Button
                        size="xs"
                        appearance="primary"
                        className="bg-blue-500 text-xs text-white hover:bg-blue-600 sm:text-sm"
                        onClick={() => handleAddressSelect(addr)}
                      >
                        <svg
                          className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3"
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
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer
        className={`${
          theme === "dark" ? "bg-gray-800" : ""
        } px-4 py-3 sm:px-6 sm:py-4`}
      >
        <div className="flex justify-end space-x-2 sm:space-x-3">
          <Button appearance="subtle" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Footer>

      {/* Add New Address Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
        className={`${
          theme === "dark" ? "bg-gray-900 text-gray-100" : ""
        } mx-auto w-full max-w-2xl`}
      >
        <Modal.Header
          className={`${
            theme === "dark" ? "bg-gray-800 text-gray-100" : ""
          } px-4 py-3 sm:px-6 sm:py-4`}
        >
          <Modal.Title className="text-base font-semibold sm:text-lg">
            Add New Address
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className={`${
            theme === "dark" ? "bg-gray-900 text-gray-100" : ""
          } p-4 sm:p-6`}
        >
          <Form fluid>
            <Form.Group className="relative mb-3 sm:mb-4">
              <Form.ControlLabel className="text-sm sm:text-base">
                Street Address
              </Form.ControlLabel>
              <Form.Control
                disabled={!isLoaded}
                name="street"
                placeholder="Enter street address"
                value={street}
                onChange={handleStreetChange}
                className="w-full text-sm sm:text-base"
              />
              {activeInput && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-32 w-full overflow-auto rounded-md border bg-white text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800 sm:max-h-40">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 sm:p-3"
                      onClick={() => handleSelect(s)}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <Form.Group>
                <Form.ControlLabel className="text-sm sm:text-base">
                  City
                </Form.ControlLabel>
                <Form.Control
                  name="city"
                  placeholder="Enter city"
                  value={city}
                  onChange={setCity}
                  className="text-sm sm:text-base"
                />
              </Form.Group>

              <Form.Group>
                <Form.ControlLabel className="text-sm sm:text-base">
                  Postal Code
                </Form.ControlLabel>
                <Form.Control
                  name="postal_code"
                  placeholder="Enter postal code"
                  value={postalCode}
                  onChange={setPostalCode}
                  className="text-sm sm:text-base"
                />
              </Form.Group>
            </div>

            <Form.Group className="mt-3 sm:mt-4">
              <Checkbox
                checked={isDefault}
                onChange={(value, checked) => setIsDefault(checked)}
                className="text-xs sm:text-sm"
              >
                Set as default address
              </Checkbox>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer
          className={`${
            theme === "dark" ? "bg-gray-800" : ""
          } px-4 py-3 sm:px-6 sm:py-4`}
        >
          <div className="flex justify-end space-x-2 sm:space-x-3">
            <Button
              appearance="subtle"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              color="green"
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleSave}
              loading={saving}
              disabled={!street || lat === null || lng === null}
            >
              Save Address
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
}
