import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut, update } from "next-auth/react";
import { useRouter } from "next/router";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";
import Image from "next/image";
import {
  Drawer,
  Form,
  Button,
  Input,
  SelectPicker,
  Message,
  useToaster,
  Modal,
  Panel,
  Schema,
  AutoComplete,
} from "rsuite";

interface ShopperProfile {
  id: string;
  full_name: string;
  address: string;
  phone_number: string;
  national_id: string;
  driving_license?: string;
  transport_mode: string;
  profile_photo?: string;
  status: string;
  active: boolean;
  background_check_completed: boolean;
  onboarding_step: string;
  created_at: string;
  updated_at: string;
}

interface FormValue {
  id?: string;
  full_name: string;
  phone_number: string;
  national_id: string;
  driving_license: string;
  transport_mode: string;
  profile_photo: string;
  address: string;
}

interface UpdateShopperDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    id: string;
    full_name: string;
    phone_number: string;
    national_id: string;
    driving_license: string;
    transport_mode: string;
    profile_photo?: string;
    address?: string;
  };
  onUpdate: (data: any) => Promise<{ success: boolean; message: string }>;
}

// Form validation schema
const validationModel = Schema.Model({
  full_name: Schema.Types.StringType().isRequired("Full name is required"),
  phone_number: Schema.Types.StringType().isRequired(
    "Phone number is required"
  ),
  address: Schema.Types.StringType().isRequired("Address is required"),
  transport_mode: Schema.Types.StringType().isRequired(
    "Transport mode is required"
  ),
  profile_photo: Schema.Types.StringType(),
});

// Add image compression helper function
const compressImage = (base64: string, maxSizeKB = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDimension = 800;

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.7;
      let compressedBase64 = canvas.toDataURL("image/jpeg", quality);

      const maxSize = maxSizeKB * 1024;
      while (compressedBase64.length > maxSize && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

// Add default image URLs
const DEFAULT_PROFILE_IMAGE = "/images/default-profile.png";
const DEFAULT_LICENSE_IMAGE = "/images/default-license.png";

export default function UpdateShopperDrawer({
  isOpen,
  onClose,
  currentData,
  onUpdate,
}: UpdateShopperDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLoaded } = useGoogleMap();
  const { theme } = useTheme();
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [formValue, setFormValue] = useState<FormValue>({
    id: currentData.id,
    full_name: currentData.full_name,
    phone_number: currentData.phone_number,
    national_id: currentData.national_id,
    driving_license: currentData.driving_license,
    transport_mode: currentData.transport_mode,
    profile_photo: currentData.profile_photo || "",
    address: currentData.address || "",
  });
  const [formErrors, setFormErrors] = useState<Partial<FormValue>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>(
    currentData.profile_photo || ""
  );
  const [capturedNationalId, setCapturedNationalId] = useState<string>(
    currentData.national_id || ""
  );
  const [captureMode, setCaptureMode] = useState<"profile" | "national_id">(
    "profile"
  );
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const toaster = useToaster();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch shopper profile when drawer opens
  useEffect(() => {
    const fetchShopperProfile = async () => {
      if (!isOpen || !session?.user?.id) return;

      setFetchingProfile(true);
      try {
        const response = await fetch("/api/queries/shopper-profile");
        if (!response.ok) {
          throw new Error("Failed to fetch shopper profile");
        }

        const data = await response.json();
        const shopperProfile: ShopperProfile = data.shopper;

        if (shopperProfile) {
          // Update form with fetched data
          setFormValue({
            id: shopperProfile.id,
            full_name: shopperProfile.full_name,
            phone_number: shopperProfile.phone_number,
            national_id: shopperProfile.national_id || "",
            driving_license: shopperProfile.driving_license || "",
            transport_mode: shopperProfile.transport_mode,
            profile_photo: shopperProfile.profile_photo || "",
            address: shopperProfile.address || "",
          });

          // Update photos if they exist
          if (shopperProfile.profile_photo) {
            setCapturedPhoto(shopperProfile.profile_photo);
          }
          if (shopperProfile.national_id) {
            setCapturedNationalId(shopperProfile.national_id);
          }
        }
      } catch (error: unknown) {
        logger.error(
          "Error fetching shopper profile:",
          error instanceof Error ? error.message : String(error)
        );
        toaster.push(
          <Message type="error" closable>
            Failed to load your profile information. Please try again.
          </Message>
        );
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchShopperProfile();
  }, [isOpen, session?.user?.id]);

  const transportOptions = [
    { label: "Car", value: "car" },
    { label: "Motorcycle", value: "motorcycle" },
    { label: "Bicycle", value: "bicycle" },
    { label: "On Foot", value: "on_foot" },
  ];

  const handleSubmit = async () => {
    // Validate form
    const validationResult = validationModel.check(formValue);
    if (!validationResult) {
      toaster.push(
        <Message type="error" closable>
          Please fill in all required fields correctly
        </Message>
      );
      return;
    }

    // Validate photos
    if (!capturedPhoto) {
      toaster.push(
        <Message type="error" closable>
          Profile photo is required
        </Message>
      );
      return;
    }

    if (!capturedNationalId) {
      toaster.push(
        <Message type="error" closable>
          National ID photo is required
        </Message>
      );
      return;
    }

    setLoading(true);
    try {
      // Prepare the data for submission
      const updateData = {
        user_id: session?.user?.id,
        active: true,
        address: formValue.address || "",
        full_name: formValue.full_name,
        national_id: capturedNationalId,
        onboarding_step: "profile_updated",
        phone_number: formValue.phone_number,
        status: "pending",
        transport_mode: formValue.transport_mode,
        updated_at: new Date().toISOString(),
        profile_photo: capturedPhoto,
      };

      console.log("Submitting shopper update with user ID:", session?.user?.id);
      console.log(
        "Profile photo changed:",
        capturedPhoto !== currentData.profile_photo
      );
      console.log(
        "National ID photo changed:",
        capturedNationalId !== currentData.national_id
      );

      const response = await onUpdate(updateData);

      if (response.success) {
        toaster.push(
          <Message type="success" closable>
            {response.message}
          </Message>
        );

        // Update the session with the new role
        await update({
          ...session,
          user: {
            ...session?.user,
            role: "user",
          },
        });

        // Close the drawer
        onClose();

        // Redirect to home page
        router.push("/");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: unknown) {
      logger.error(
        "Error updating shopper information:",
        error instanceof Error ? error.message : String(error)
      );
      toaster.push(
        <Message type="error" closable>
          Failed to update information. Please try again.
        </Message>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (newValue: any) => {
    setFormValue(newValue);
    // Clear errors when user makes changes
    setFormErrors({});
  };

  const startCamera = async (mode: "profile" | "national_id") => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode === "national_id" ? "environment" : "user" },
        audio: false,
      });

      setStream(newStream);
      setShowCamera(true);
      setCaptureMode(mode);
      setShowPreview(false); // Reset preview state when starting camera

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      }, 100);
    } catch (error: unknown) {
      logger.error(
        "Error accessing camera:",
        error instanceof Error ? error.message : String(error)
      );
      toaster.push(
        <Message type="error" closable>
          Could not access camera. Please check permissions.
        </Message>
      );
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");

        compressImage(imageData, 50)
          .then((compressedImage) => {
            if (captureMode === "profile") {
              setCapturedPhoto(compressedImage);
            } else {
              setCapturedNationalId(compressedImage);
            }
            setShowPreview(true);
          })
          .catch((error) => {
            logger.error("Error compressing image:", error);
            toaster.push(
              <Message type="error" closable>
                Failed to process image
              </Message>
            );
          });
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setShowPreview(false); // Reset preview state when stopping camera
  };

  const retakePhoto = () => {
    if (captureMode === "profile") {
      setCapturedPhoto("");
    } else {
      setCapturedNationalId("");
    }
    setShowPreview(false);
    // Restart camera after retaking
    startCamera(captureMode);
  };

  const showDrivingLicense = formValue.transport_mode !== "on_foot";

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setFormValue((prev) => ({
          ...prev,
          address: place.formatted_address || "",
        }));
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setFormValue((prev) => ({
      ...prev,
      address: value,
    }));

    if (value.length > 2) {
      setIsLoading(true);
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      const request = {
        query: value,
        location: new google.maps.LatLng(-1.9403, 29.8739), // Kigali coordinates
        radius: 50000, // 50km radius
        type: "address" as const,
      };

      service.textSearch(request, (results, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Create unique suggestions by adding index to duplicates
          const addressMap = new Map<string, number>();
          const newSuggestions = results
            .map((result) => result.formatted_address || "")
            .filter(Boolean)
            .map((address) => {
              if (addressMap.has(address)) {
                const count = addressMap.get(address)! + 1;
                addressMap.set(address, count);
                return `${address} (${count})`;
              }
              addressMap.set(address, 1);
              return address;
            });
          setSuggestions(newSuggestions);
        } else {
          setSuggestions([]);
        }
      });
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (isLoaded && addressInputRef.current && !autocomplete) {
      const autocompleteInstance = new google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: "rw" },
          fields: ["formatted_address", "geometry", "name"],
          types: ["address"],
        }
      );
      setAutocomplete(autocompleteInstance);
    }
  }, [isLoaded, autocomplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div
          className={`relative w-full max-w-2xl transform overflow-hidden rounded-lg shadow-xl transition-all ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          <div
            className={`border-b px-4 py-3 sm:px-6 sm:py-4 ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <h3
              className={`text-base font-medium sm:text-lg ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Update Plasa Information
            </h3>
          </div>

          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div
              className={`mb-4 sm:mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <h2 className="text-lg font-semibold sm:text-xl">
                Update Your Information
              </h2>
              <p className="text-sm sm:text-base">
                Please update your information below. Your changes will be
                reviewed by our team.
              </p>
            </div>

            {fetchingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formValue.full_name}
                      onChange={(e) =>
                        handleFormChange({
                          ...formValue,
                          full_name: e.target.value,
                        })
                      }
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm sm:text-base ${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      } focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
                    />
                    {formErrors.full_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formValue.phone_number}
                      onChange={(e) =>
                        handleFormChange({
                          ...formValue,
                          phone_number: e.target.value,
                        })
                      }
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm sm:text-base ${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      } focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
                    />
                    {formErrors.phone_number && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.phone_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Address
                    </label>
                    <div className="relative mt-1">
                      <input
                        ref={addressInputRef}
                        type="text"
                        value={formValue.address}
                        onChange={(e) =>
                          handleFormChange({
                            ...formValue,
                            address: e.target.value,
                          })
                        }
                        className={`block w-full rounded-md border px-3 py-2 text-sm sm:text-base ${
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
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Transport Mode
                    </label>
                    <select
                      value={formValue.transport_mode}
                      onChange={(e) =>
                        handleFormChange({
                          ...formValue,
                          transport_mode: e.target.value,
                        })
                      }
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm sm:text-base ${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      } focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
                    >
                      {transportOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.transport_mode && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.transport_mode}
                      </p>
                    )}
                  </div>

                  {showDrivingLicense && (
                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Driving License Number
                      </label>
                      <input
                        type="text"
                        value={formValue.driving_license}
                        onChange={(e) =>
                          handleFormChange({
                            ...formValue,
                            driving_license: e.target.value,
                          })
                        }
                        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm sm:text-base ${
                          theme === "dark"
                            ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        } focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`}
                      />
                      {formErrors.driving_license && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.driving_license}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Profile Photo <span className="text-red-500">*</span>
                    </label>
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Take a clear photo of yourself with your camera
                    </p>

                    <div className="mt-2">
                      <div
                        className={`relative mx-auto h-48 w-48 overflow-hidden rounded-lg border sm:h-64 sm:w-64 ${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-300"
                        }`}
                      >
                        {capturedPhoto ? (
                          <img
                            src={capturedPhoto}
                            alt="Profile photo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full items-center justify-center ${
                              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                            }`}
                          >
                            <span
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              No profile photo
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => startCamera("profile")}
                          className="rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-base"
                        >
                          {capturedPhoto ? "Update Photo" : "Take Photo"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      National ID Photo <span className="text-red-500">*</span>
                    </label>
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Take a photo of your national ID
                    </p>

                    <div className="mt-2">
                      <div
                        className={`relative mx-auto h-36 w-48 overflow-hidden rounded-lg border sm:h-48 sm:w-64 ${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-300"
                        }`}
                      >
                        {capturedNationalId ? (
                          <img
                            src={capturedNationalId}
                            alt="National ID"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full items-center justify-center ${
                              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                            }`}
                          >
                            <span
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              No national ID photo
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => startCamera("national_id")}
                          className="rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-base"
                        >
                          {capturedNationalId ? "Update Photo" : "Take Photo"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:text-base"
                  >
                    {loading ? "Updating..." : "Update Information"}
                  </button>
                </div>
              </form>
            )}

            <div
              className={`mt-4 border-t pt-4 sm:mt-6 ${
                theme === "dark" ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-base font-semibold sm:text-lg ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                What Happens Next?
              </h3>
              <ol
                className={`ml-5 mt-2 list-decimal space-y-1 text-sm sm:space-y-2 sm:text-base ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <li>Our team will review your updated information</li>
                <li>You will be logged out to apply the changes</li>
                <li>Once approved, you can log back in</li>
                <li>Your updated information will be active</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
              onClick={stopCamera}
            />

            <div
              className={`relative w-full max-w-md transform overflow-hidden rounded-lg shadow-xl transition-all ${
                theme === "dark" ? "bg-gray-900" : "bg-white"
              }`}
            >
              <div
                className={`border-b px-4 py-3 sm:px-6 sm:py-4 ${
                  theme === "dark" ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <h3
                  className={`text-base font-medium sm:text-lg ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {captureMode === "profile"
                    ? "Take Profile Photo"
                    : "Take National ID Photo"}
                </h3>
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-col items-center">
                  {!showPreview ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-auto w-full rounded-lg"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <button
                        onClick={capturePhoto}
                        className="mt-4 rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-base"
                      >
                        Capture Photo
                      </button>
                      {captureMode === "national_id" && (
                        <p
                          className={`mt-2 text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Make sure all details on the ID are clearly visible
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="relative h-48 w-48 overflow-hidden rounded-lg sm:h-64 sm:w-64">
                        <img
                          src={
                            captureMode === "profile"
                              ? capturedPhoto
                              : capturedNationalId
                          }
                          alt={
                            captureMode === "profile"
                              ? "Captured profile"
                              : "Captured national ID"
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <button
                          onClick={retakePhoto}
                          className={`rounded-md px-4 py-2 text-sm sm:text-base ${
                            theme === "dark"
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                        >
                          Retake
                        </button>
                        <button
                          onClick={stopCamera}
                          className="rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-base"
                        >
                          Use This Photo
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div
                className={`border-t px-4 py-3 sm:px-6 sm:py-4 ${
                  theme === "dark" ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <div className="flex justify-end">
                  <button
                    onClick={stopCamera}
                    className={`rounded-md px-4 py-2 text-sm sm:text-base ${
                      theme === "dark"
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
