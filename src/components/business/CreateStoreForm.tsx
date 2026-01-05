"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  FileText,
  Upload,
  Store,
  Send,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { RichTextEditor } from "../ui/RichTextEditor";

interface CreateStoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storeData: any) => void;
}

interface StoreFormData {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  image: File | null;
}

export function CreateStoreForm({
  isOpen,
  onClose,
  onSubmit,
}: CreateStoreFormProps) {
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
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
          handleInputChange("latitude", position.coords.latitude.toString());
          handleInputChange("longitude", position.coords.longitude.toString());
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

      if (!formData.latitude.trim() || !formData.longitude.trim()) {
        toast.error("Store location is required");
        setIsSubmitting(false);
        return;
      }

      // Convert image to base64 if provided
      let imageBase64 = "";
      if (formData.image) {
        try {
          imageBase64 = await convertFileToBase64(formData.image);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          toast.error("Failed to process image");
        }
      }

      // Call the API
      const response = await fetch("/api/mutations/create-business-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || "",
          latitude: formData.latitude.trim(),
          longitude: formData.longitude.trim(),
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create store");
      }

      const data = await response.json();

      // Call the onSubmit callback
      onSubmit(data.store || formData);

      // Show success message
      toast.success("Store created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        latitude: "",
        longitude: "",
        image: null,
      });
      setImagePreview(null);

      onClose();
    } catch (error: any) {
      console.error("Error creating store:", error);
      toast.error(error.message || "Failed to create store. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Store
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Add a new store to your business
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
        <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto p-6">
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

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Store Location <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-300 bg-white px-4 py-2.5 font-medium text-green-600 transition-all duration-200 hover:border-green-500 hover:bg-green-50 dark:border-green-600 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <MapPin className="h-4 w-4" />
                  Use Current Location
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) =>
                        handleInputChange("latitude", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
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
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                      placeholder="Longitude"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Image */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Store Image
              </label>
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all duration-200 hover:border-green-400 hover:bg-green-50/30 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-green-500">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg">
                      <img
                        src={imagePreview}
                        alt="Store preview"
                        className="h-full w-full object-cover"
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
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
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
                Create Store
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

