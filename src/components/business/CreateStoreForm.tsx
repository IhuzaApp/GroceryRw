"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Store,
  Send,
  Image as ImageIcon,
  Link,
  Upload,
  Navigation,
  MapPinned,
  PenLine,
  Clock,
  Tag,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { RichTextEditor } from "../ui/RichTextEditor";
import { useGoogleMap } from "../../context/GoogleMapProvider";

interface CreateStoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storeData: any) => void;
  /** When provided, form works in edit mode for this store */
  editingStore?: {
    id: string;
    name?: string;
    description?: string;
    address?: string;
    category_id?: string;
    image?: string;
    is_active?: boolean;
    latitude?: string;
    longitude?: string;
    operating_hours?: Record<string, string>;
  } | null;
}

type ImageSource = "upload" | "url";
type LocationSource = "current" | "address" | "manual";

const STORE_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DEFAULT_OPERATING_HOURS: OperatingHoursByDay = Object.fromEntries(
  STORE_DAYS.map((d) => [d, "9am - 5pm"])
) as OperatingHoursByDay;

// Time options for operating hours (format: "9am - 5pm")
const TIME_OPTIONS = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];

// operating_hours format: { monday: "9am - 5pm", tuesday: "Closed", ... }
type OperatingHoursByDay = Record<string, string>;

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

interface StoreFormData {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  image: File | null;
  imageUrl?: string;
  imageSource?: ImageSource;
  locationSource?: LocationSource;
  addressSearch?: string;
  category_id: string;
  operating_hours: OperatingHoursByDay;
  is_active: boolean;
}

export function CreateStoreForm({
  isOpen,
  onClose,
  onSubmit,
  editingStore,
}: CreateStoreFormProps) {
  const isEditMode = !!editingStore?.id;
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMap();
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    image: null,
    imageUrl: "",
    imageSource: "upload",
    locationSource: "address",
    addressSearch: "",
    category_id: "",
    operating_hours: { ...DEFAULT_OPERATING_HOURS },
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isRequestingEnable, setIsRequestingEnable] = useState(false);

  useEffect(() => {
    if (isGoogleMapsLoaded && typeof google !== "undefined") {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isGoogleMapsLoaded]);

  // Fetch categories when form opens
  useEffect(() => {
    if (isOpen) {
      setCategoriesLoading(true);
      fetch("/api/queries/categories")
        .then((res) => res.json())
        .then((data) => {
          const cats = data.categories || [];
          setCategories(
            Array.isArray(cats)
              ? cats.filter((c: Category) => c.is_active !== false)
              : []
          );
        })
        .catch(() => setCategories([]))
        .finally(() => setCategoriesLoading(false));
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingStore) {
      const hours = editingStore.operating_hours || {
        ...DEFAULT_OPERATING_HOURS,
      };
      const hasAddress = !!editingStore.address?.trim();
      const hasCoords = !!(editingStore.latitude && editingStore.longitude);
      setFormData({
        name: editingStore.name || "",
        description: editingStore.description || "",
        latitude: editingStore.latitude || "",
        longitude: editingStore.longitude || "",
        image: null,
        imageUrl: editingStore.image?.startsWith("http")
          ? editingStore.image
          : "",
        imageSource: editingStore.image?.startsWith("http") ? "url" : "upload",
        locationSource: hasAddress
          ? "address"
          : hasCoords
          ? "manual"
          : "address",
        addressSearch: editingStore.address || "",
        category_id: editingStore.category_id || "",
        operating_hours: { ...DEFAULT_OPERATING_HOURS, ...hours },
        is_active: editingStore.is_active ?? true,
      });
      setImagePreview(editingStore.image || null);
    } else if (isOpen && !editingStore) {
      setFormData({
        name: "",
        description: "",
        latitude: "",
        longitude: "",
        image: null,
        imageUrl: "",
        imageSource: "upload",
        locationSource: "address",
        addressSearch: "",
        category_id: "",
        operating_hours: { ...DEFAULT_OPERATING_HOURS },
        is_active: true,
      });
      setImagePreview(null);
    }
  }, [isOpen, editingStore]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: "",
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url.trim(),
      image: null,
    }));
    setImagePreview(url.trim() ? url.trim() : null);
  };

  const setImageSource = (source: ImageSource) => {
    setFormData((prev) => ({
      ...prev,
      imageSource: source,
      image: source === "url" ? null : prev.image,
      imageUrl: source === "upload" ? "" : prev.imageUrl,
    }));
    if (source === "url") {
      setImagePreview(formData.imageUrl?.trim() || null);
    } else {
      if (formData.image) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(formData.image);
      } else {
        setImagePreview(null);
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imageUrl: "",
    }));
    setImagePreview(null);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading("Getting your location...", { id: "location" });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            locationSource: "current",
          }));
          toast.success("Location retrieved successfully!", { id: "location" });
        },
        (error) => {
          toast.error("Failed to get location. Please enter manually.", {
            id: "location",
          });
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleAddressInputChange = (value: string) => {
    setFormData((prev) => ({ ...prev, addressSearch: value ?? "" }));
    if (!value.trim()) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    if (autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value },
        (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
            setAddressSuggestions(preds);
            setShowAddressSuggestions(true);
          } else {
            setAddressSuggestions([]);
          }
        }
      );
    }
  };

  const handleAddressSelect = (
    suggestion: google.maps.places.AutocompletePrediction
  ) => {
    setFormData((prev) => ({ ...prev, addressSearch: suggestion.description }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { address: suggestion.description },
        (results, status) => {
          if (status === "OK" && results?.[0]) {
            const loc = results[0].geometry.location;
            setFormData((prev) => ({
              ...prev,
              latitude: loc.lat().toString(),
              longitude: loc.lng().toString(),
              locationSource: "address",
            }));
            toast.success("Address coordinates set.");
          } else {
            toast.error("Could not get coordinates for this address.");
          }
        }
      );
    }
  };

  const setLocationSource = (source: LocationSource) => {
    setFormData((prev) => ({
      ...prev,
      locationSource: source,
      ...(source === "manual" && { addressSearch: "" }),
    }));
    if (source !== "address") setShowAddressSuggestions(false);
  };

  const coordinatesLocked =
    formData.locationSource === "current" ||
    formData.locationSource === "address";

  const setOperatingHoursForDay = (day: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      operating_hours: { ...prev.operating_hours, [day]: value },
    }));
  };

  const applyHoursToAllDays = () => {
    const firstDayHours =
      formData.operating_hours[STORE_DAYS[0]] || "9am - 5pm";
    const next: OperatingHoursByDay = {};
    STORE_DAYS.forEach((d) => {
      next[d] = firstDayHours;
    });
    setFormData((prev) => ({
      ...prev,
      operating_hours: next,
    }));
    toast.success("Hours applied to all days");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Store name is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.category_id.trim()) {
        toast.error("Store category is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.latitude.trim() || !formData.longitude.trim()) {
        toast.error("Store location is required");
        setIsSubmitting(false);
        return;
      }

      // Image: base64 (upload) or URL string
      let imageValue = "";
      if (formData.imageSource === "upload" && formData.image) {
        try {
          imageValue = await convertFileToBase64(formData.image);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          toast.error("Failed to process image");
          setIsSubmitting(false);
          return;
        }
      } else if (formData.imageSource === "url" && formData.imageUrl?.trim()) {
        imageValue = formData.imageUrl.trim();
      } else if (isEditMode && editingStore?.image && !imageValue) {
        imageValue = editingStore.image;
      }

      if (isEditMode && editingStore?.id) {
        // Update store
        const response = await fetch("/api/mutations/update-business-store", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_id: editingStore.id,
            name: formData.name.trim(),
            description: formData.description.trim() || "",
            latitude: formData.latitude.trim(),
            longitude: formData.longitude.trim(),
            image: imageValue,
            category_id: formData.category_id.trim(),
            operating_hours: formData.operating_hours,
            address: (formData.addressSearch ?? "").trim(),
            is_active: formData.is_active,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update store");
        }

        const data = await response.json();
        const updated = data.store || {
          ...editingStore,
          ...formData,
          id: editingStore.id,
        };
        onSubmit(updated);
        toast.success("Store updated successfully!");
        onClose();
      } else {
        // Create store
        const response = await fetch("/api/mutations/create-business-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || "",
            latitude: formData.latitude.trim(),
            longitude: formData.longitude.trim(),
            image: imageValue,
            category_id: formData.category_id.trim(),
            operating_hours: formData.operating_hours,
            address: (formData.addressSearch ?? "").trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create store");
        }

        const data = await response.json();
        onSubmit(data.store || formData);
        toast.success("Store created successfully!");

        setFormData({
          name: "",
          description: "",
          latitude: "",
          longitude: "",
          image: null,
          imageUrl: "",
          imageSource: "upload",
          locationSource: "address",
          addressSearch: "",
          category_id: "",
          operating_hours: { ...DEFAULT_OPERATING_HOURS },
          is_active: true,
        });
        setImagePreview(null);
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
        onClose();
      }
    } catch (error: any) {
      console.error("Error creating store:", error);
      toast.error(error.message || "Failed to create store. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-end justify-center bg-black/50 md:items-center md:bg-black/50 md:p-4">
      <div className="flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-gray-800 md:h-auto md:max-h-[90vh] md:rounded-2xl">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Store" : "Create Store"}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {isEditMode
                  ? "Update your store details"
                  : "Add a new store to your business"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto p-4 md:max-h-[60vh] md:p-6"
        >
          <div className="space-y-6">
            {/* Store Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Store Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                  placeholder="e.g., Downtown Store"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                rows={6}
                placeholder="Provide a detailed description of your store..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Store Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    handleInputChange("category_id", e.target.value)
                  }
                  required
                  className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-10 text-base font-medium text-gray-900 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                >
                  <option value="">Select a category</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ▼
                </span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Store Location <span className="text-red-500">*</span>
              </label>
              {/* How to set location */}
              <div className="mb-3 flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/50 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setLocationSource("current")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    formData.locationSource === "current"
                      ? "bg-white text-green-600 shadow dark:bg-gray-800 dark:text-green-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  Current location
                </button>
                <button
                  type="button"
                  onClick={() => setLocationSource("address")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    formData.locationSource === "address"
                      ? "bg-white text-green-600 shadow dark:bg-gray-800 dark:text-green-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <MapPinned className="h-4 w-4" />
                  Search by address
                </button>
                <button
                  type="button"
                  onClick={() => setLocationSource("manual")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    formData.locationSource === "manual"
                      ? "bg-white text-green-600 shadow dark:bg-gray-800 dark:text-green-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <PenLine className="h-4 w-4" />
                  Enter coordinates
                </button>
              </div>
              {/* Current location: one button */}
              {formData.locationSource === "current" && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-300 bg-white px-4 py-2.5 font-medium text-green-600 transition-all duration-200 hover:border-green-500 hover:bg-green-50 dark:border-green-600 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-green-900/20"
                  >
                    <MapPin className="h-4 w-4" />
                    Use current location
                  </button>
                </div>
              )}
              {/* Address search: input + suggestions (Google Places) */}
              {formData.locationSource === "address" && (
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={formData.addressSearch ?? ""}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    onFocus={() =>
                      addressSuggestions.length > 0 &&
                      setShowAddressSuggestions(true)
                    }
                    placeholder="Type street or address..."
                    className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                  />
                  {!isGoogleMapsLoaded && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Loading maps...
                    </p>
                  )}
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                      {addressSuggestions.map((s) => (
                        <li key={s.place_id}>
                          <button
                            type="button"
                            onClick={() => handleAddressSelect(s)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                          >
                            {s.description}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {/* Latitude / Longitude (read-only when set by current or address) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange("latitude", e.target.value)
                    }
                    readOnly={coordinatesLocked}
                    className={`w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500 ${
                      coordinatesLocked
                        ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                        : ""
                    }`}
                    placeholder="Latitude"
                    required
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange("longitude", e.target.value)
                    }
                    readOnly={coordinatesLocked}
                    className={`w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500 ${
                      coordinatesLocked
                        ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                        : ""
                    }`}
                    placeholder="Longitude"
                    required
                  />
                </div>
              </div>
              {coordinatesLocked && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Coordinates set from{" "}
                  {formData.locationSource === "current"
                    ? "current location"
                    : "address"}
                  . Switch to &quot;Enter coordinates&quot; to edit.
                </p>
              )}
            </div>

            {/* Store Status (Edit mode only) - Owners can disable but not enable; support handles re-enabling */}
            {isEditMode && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Store Status
                </label>
                <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 p-4 dark:border-gray-600 dark:bg-gray-700/30">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.is_active}
                    onClick={() => {
                      if (formData.is_active) {
                        handleInputChange("is_active", false);
                      }
                    }}
                    disabled={!formData.is_active}
                    className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      formData.is_active
                        ? "cursor-pointer bg-green-500"
                        : "cursor-not-allowed bg-gray-300 opacity-60"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.is_active
                        ? "Store is active"
                        : "Store is disabled"}
                    </span>
                    {!formData.is_active && (
                      <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                        Contact support to re-enable your store
                      </p>
                    )}
                  </div>
                </div>
                {!formData.is_active && editingStore?.id && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsRequestingEnable(true);
                      try {
                        const res = await fetch("/api/support-ticket", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            requestType: "enable_store",
                            storeId: editingStore.id,
                            storeName: editingStore.name || "Unnamed store",
                            message: "Request to re-enable this store",
                            businessAccountId: (editingStore as any)
                              .business_id,
                          }),
                        });
                        if (res.ok) {
                          toast.success(
                            "Your request has been sent to support. They will contact you soon."
                          );
                        } else {
                          const data = await res.json().catch(() => ({}));
                          throw new Error(
                            data.error || "Failed to send request"
                          );
                        }
                      } catch (err: any) {
                        toast.error(err.message || "Failed to send request");
                      } finally {
                        setIsRequestingEnable(false);
                      }
                    }}
                    disabled={isRequestingEnable}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-500 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 dark:border-green-600 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  >
                    {isRequestingEnable ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Request to enable store
                      </>
                    )}
                  </button>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.is_active
                    ? "Disabling hides your store from customers. Only support can re-enable it."
                    : "Disabled stores won&apos;t appear to customers"}
                </p>
              </div>
            )}

            {/* Operating Hours */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                Operating Hours
              </label>
              <div className="rounded-xl border-2 border-gray-200 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-700/30">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-600">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Set hours per day (e.g., 9am - 5pm or Closed)
                  </span>
                  <button
                    type="button"
                    onClick={applyHoursToAllDays}
                    className="rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  >
                    Apply to all
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto p-3">
                  {STORE_DAYS.map((day) => (
                    <div
                      key={day}
                      className="mb-2 flex items-center gap-2 last:mb-0"
                    >
                      <span className="w-24 shrink-0 text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {day}
                      </span>
                      <select
                        value={
                          formData.operating_hours[day] === "Closed"
                            ? "closed"
                            : "open"
                        }
                        onChange={(e) => {
                          const isClosed = e.target.value === "closed";
                          setOperatingHoursForDay(
                            day,
                            isClosed ? "Closed" : "9am - 5pm"
                          );
                        }}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                      {formData.operating_hours[day] !== "Closed" && (
                        <>
                          <select
                            value={
                              formData.operating_hours[day]?.split(" - ")[0] ||
                              "9am"
                            }
                            onChange={(e) => {
                              const close =
                                formData.operating_hours[day]?.split(
                                  " - "
                                )[1] || "5pm";
                              setOperatingHoursForDay(
                                day,
                                `${e.target.value} - ${close}`
                              );
                            }}
                            className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-400">-</span>
                          <select
                            value={
                              formData.operating_hours[day]?.split(" - ")[1] ||
                              "5pm"
                            }
                            onChange={(e) => {
                              const open =
                                formData.operating_hours[day]?.split(
                                  " - "
                                )[0] || "9am";
                              setOperatingHoursForDay(
                                day,
                                `${open} - ${e.target.value}`
                              );
                            }}
                            className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Store Image */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Store Image
              </label>
              {/* Upload vs URL toggle */}
              <div className="mb-3 flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/50">
                <button
                  type="button"
                  onClick={() => setImageSource("upload")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    formData.imageSource === "upload"
                      ? "bg-white text-green-600 shadow dark:bg-gray-800 dark:text-green-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload image
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource("url")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    formData.imageSource === "url"
                      ? "bg-white text-green-600 shadow dark:bg-gray-800 dark:text-green-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Link className="h-4 w-4" />
                  Use URL
                </button>
              </div>
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all duration-200 hover:border-green-400 hover:bg-green-50/30 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-green-500">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg">
                      <img
                        src={imagePreview}
                        alt="Store preview"
                        className="h-full w-full object-cover"
                        onError={() => setImagePreview(null)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4" />
                      Remove Image
                    </button>
                  </div>
                ) : formData.imageSource === "url" ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/store-image.jpg"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enter a direct link to an image (JPG, PNG, WEBP, etc.)
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="store-image-upload"
                    />
                    <label
                      htmlFor="store-image-upload"
                      className="flex cursor-pointer flex-col items-center justify-center"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                        <ImageIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to upload image or drag and drop
                      </span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, WEBP (max 5MB)
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700 md:p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-gray-300 bg-white px-6 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isEditMode ? "Save Changes" : "Create Store"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
