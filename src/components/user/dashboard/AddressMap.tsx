import { useEffect, useRef, useState } from "react";

interface AddressMapProps {
  address?: {
    latitude: string;
    longitude: string;
    street: string;
    city: string;
  } | null;
  height?: string;
  className?: string;
  onAddAddress?: (addressData: {
    latitude: string;
    longitude: string;
    street: string;
    city: string;
    postal_code: string;
    is_default: boolean;
    type: string;
    placeDetails: any;
  }) => void; // Updated to include all address fields
}

export default function AddressMap({
  address,
  height = "h-full",
  className = "",
  onAddAddress,
}: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newLocation, setNewLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    postal_code: "",
    is_default: false,
    type: "",
    placeDetails: {},
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const [placeDetailsForm, setPlaceDetailsForm] = useState<{
    gateNumber?: string;
    gateColor?: string;
    floorNumber?: string;
    roomNumber?: string;
    buildingName?: string;
    floor?: string;
    notes?: string;
  }>({});

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default;

        // Import Leaflet CSS only once
        if (
          typeof document !== "undefined" &&
          !document.querySelector('link[href*="leaflet"]')
        ) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "anonymous";
          document.head.appendChild(link);
        }

        // Clean up existing map if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Clear the container
        if (mapRef.current) {
          mapRef.current.innerHTML = "";
        }

        // Create map instance
        const map = L.map(mapRef.current!, {
          center: address
            ? [parseFloat(address.latitude), parseFloat(address.longitude)]
            : [0, 0],
          zoom: address ? 18 : 2,
          zoomControl: true,
          attributionControl: false,
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add click handler to map for adding new addresses
        map.on("click", (e) => {
          if (onAddAddress) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            setNewLocation({ lat, lng });
            setShowAddAddressForm(true);
            reverseGeocode(lat, lng);
          }
        });

        // Add marker if address exists
        if (address) {
          const lat = parseFloat(address.latitude);
          const lng = parseFloat(address.longitude);

          // Create custom marker icon
          const markerIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });

          const marker = L.marker([lat, lng], {
            icon: markerIcon,
            draggable: true,
          }).addTo(map);

          // Add popup with address info
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${address.street}</h3>
              <p class="text-sm text-gray-600">${address.city}</p>
              ${
                onAddAddress
                  ? '<p class="text-xs text-blue-600 mt-1">Drag to move or click map to add new address</p>'
                  : ""
              }
            </div>
          `);

          // Add drag event handlers
          marker.on("dragstart", () => {
            setIsDragging(true);
          });

          marker.on("dragend", (e) => {
            setIsDragging(false);
            if (onAddAddress) {
              const newPos = e.target.getLatLng();
              setNewLocation({ lat: newPos.lat, lng: newPos.lng });
              setShowAddAddressForm(true);
              reverseGeocode(newPos.lat, newPos.lng);
            }
          });

          markerRef.current = marker;

          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Center map after a short delay to ensure everything is initialized
          timeoutRef.current = setTimeout(() => {
            try {
              if (map && mapInstanceRef.current === map) {
                map.setView([lat, lng], 18);
              }
            } catch (error) {
              console.error("Error centering map:", error);
            }
            timeoutRef.current = null;
          }, 300);
        }

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, [address, onAddAddress]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      // Use OpenStreetMap Nominatim (free service)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        const address = data.address || {};

        // Extract address components
        const street =
          [
            address.house_number,
            address.road,
            address.pedestrian,
            address.footway,
          ]
            .filter(Boolean)
            .join(" ") || "Address not found";

        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          "Unknown City";
        const postalCode = address.postcode || "";

        setAddressForm({
          street: street,
          city: city,
          postal_code: postalCode,
          is_default: false,
          type: "",
          placeDetails: {},
        });
        setShowTypeSelection(true);
        setPlaceDetailsForm({});
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      // Set default values if geocoding fails
      setAddressForm({
        street: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: "Unknown City",
        postal_code: "",
        is_default: false,
        type: "",
        placeDetails: {},
      });
      setShowTypeSelection(true);
      setPlaceDetailsForm({});
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation && onAddAddress) {
      onAddAddress({
        latitude: newLocation.lat.toString(),
        longitude: newLocation.lng.toString(),
        street: addressForm.street,
        city: addressForm.city,
        postal_code: addressForm.postal_code,
        is_default: addressForm.is_default,
        type: addressForm.type,
        placeDetails: placeDetailsForm,
      });
      setShowAddAddressForm(false);
      setAddressForm({
        street: "",
        city: "",
        postal_code: "",
        is_default: false,
        type: "",
        placeDetails: {},
      });
      setPlaceDetailsForm({});
      setShowTypeSelection(true);
      setNewLocation(null);
    }
  };

  const handleCancel = () => {
    setShowAddAddressForm(false);
    setAddressForm({
      street: "",
      city: "",
      postal_code: "",
      is_default: false,
      type: "",
      placeDetails: {},
    });
    setPlaceDetailsForm({});
    setShowTypeSelection(true);
    setNewLocation(null);
  };

  if (!address) {
    return (
      <div
        className={`${height} ${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No Address Selected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select an address to see it on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} ${className} relative`}>
      <div ref={mapRef} className="relative z-0 h-full w-full rounded-lg" />

      {/* Add Address Form Modal */}
      {showAddAddressForm && newLocation && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md duration-300 animate-in fade-in"
          onClick={handleCancel}
        >
          <div
            className="relative z-[10000] mx-4 w-full max-w-md scale-100 transform rounded-2xl bg-white shadow-2xl transition-all duration-300 duration-300 animate-in zoom-in-95 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="h-6 w-6 text-green-600 dark:text-green-400"
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Address
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
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

              <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Location: {newLocation.lat.toFixed(6)},{" "}
                  {newLocation.lng.toFixed(6)}
                </p>
                {isGeocoding ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Looking up address details...
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Address details have been filled automatically. You can edit
                    them if needed.
                  </p>
                )}
              </div>

              {showTypeSelection ? (
                // Address Type Selection Cards
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      What type of address is this?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose the type that best describes this location
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        type: "house",
                        label: "House",
                        icon: "🏠",
                        color:
                          "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
                      },
                      {
                        type: "apartment",
                        label: "Apartment",
                        icon: "🏢",
                        color:
                          "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800",
                      },
                      {
                        type: "office",
                        label: "Office",
                        icon: "🏢",
                        color:
                          "bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800",
                      },
                      {
                        type: "other",
                        label: "Other",
                        icon: "📍",
                        color:
                          "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600",
                      },
                    ].map(({ type, label, icon, color }) => (
                      <button
                        key={type}
                        onClick={() => {
                          setAddressForm((prev) => ({ ...prev, type }));
                          setShowTypeSelection(false);
                        }}
                        className={`rounded-xl border-2 p-4 transition-all duration-200 ${color} ${
                          addressForm.type === type
                            ? "ring-2 ring-green-500"
                            : ""
                        }`}
                      >
                        <div className="text-center">
                          <div className="mb-2 text-2xl">{icon}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Address Details Form
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      disabled={isGeocoding}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-800"
                      placeholder={
                        isGeocoding
                          ? "Looking up address..."
                          : "Enter street address"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        disabled={isGeocoding}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-800"
                        placeholder={isGeocoding ? "Looking up..." : "City"}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postal_code}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            postal_code: e.target.value,
                          }))
                        }
                        disabled={isGeocoding}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-800"
                        placeholder={
                          isGeocoding ? "Looking up..." : "Postal Code"
                        }
                      />
                    </div>
                  </div>

                  {/* Place Details based on type */}
                  {addressForm.type && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Additional Details for{" "}
                        {addressForm.type.charAt(0).toUpperCase() +
                          addressForm.type.slice(1)}
                      </h5>

                      {addressForm.type === "house" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Gate Number
                            </label>
                            <input
                              type="text"
                              value={placeDetailsForm.gateNumber || ""}
                              onChange={(e) =>
                                setPlaceDetailsForm((prev) => ({
                                  ...prev,
                                  gateNumber: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                              placeholder="e.g., 123"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Gate Color
                            </label>
                            <input
                              type="text"
                              value={placeDetailsForm.gateColor || ""}
                              onChange={(e) =>
                                setPlaceDetailsForm((prev) => ({
                                  ...prev,
                                  gateColor: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                              placeholder="e.g., Blue"
                            />
                          </div>
                        </div>
                      )}

                      {addressForm.type === "apartment" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Floor Number
                            </label>
                            <input
                              type="text"
                              value={placeDetailsForm.floorNumber || ""}
                              onChange={(e) =>
                                setPlaceDetailsForm((prev) => ({
                                  ...prev,
                                  floorNumber: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                              placeholder="e.g., 5"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Room Number
                            </label>
                            <input
                              type="text"
                              value={placeDetailsForm.roomNumber || ""}
                              onChange={(e) =>
                                setPlaceDetailsForm((prev) => ({
                                  ...prev,
                                  roomNumber: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                              placeholder="e.g., 502"
                            />
                          </div>
                        </div>
                      )}

                      {addressForm.type === "office" && (
                        <div className="space-y-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Building Name
                            </label>
                            <input
                              type="text"
                              value={placeDetailsForm.buildingName || ""}
                              onChange={(e) =>
                                setPlaceDetailsForm((prev) => ({
                                  ...prev,
                                  buildingName: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                              placeholder="e.g., Tech Tower"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Floor
                            </label>
                            <input
                              type="text"
                              value={placeDetailsForm.floor || ""}
                              onChange={(e) =>
                                setPlaceDetailsForm((prev) => ({
                                  ...prev,
                                  floor: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                              placeholder="e.g., 10th Floor"
                            />
                          </div>
                        </div>
                      )}

                      {addressForm.type === "other" && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Additional Notes
                          </label>
                          <textarea
                            value={placeDetailsForm.notes || ""}
                            onChange={(e) =>
                              setPlaceDetailsForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            placeholder="Any additional details about this location..."
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Set as Default Address Checkbox */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={addressForm.is_default}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          is_default: e.target.checked,
                        }))
                      }
                      disabled={isGeocoding}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <label
                      htmlFor="is_default"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Set as default address
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTypeSelection(true)}
                      className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGeocoding}
                      className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {isGeocoding ? "Looking up..." : "Add Address"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for the marker */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .leaflet-popup-tip {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}
