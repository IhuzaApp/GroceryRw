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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div
          className={`relative max-h-[90vh] w-full max-w-4xl transform overflow-hidden rounded-3xl shadow-2xl transition-all ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`${
              theme === "dark"
                ? "border-b border-gray-700 bg-gray-800"
                : "border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50"
            } rounded-t-3xl px-6 py-6`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-3 ${
                  theme === "dark" ? "bg-blue-600" : "bg-blue-100"
                }`}
              >
                <svg
                  className={`h-8 w-8 ${
                    theme === "dark" ? "text-white" : "text-blue-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  Update Profile
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Update your shopper profile details
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[calc(90vh-200px)] overflow-y-auto px-6 py-6">
            {/* Info Banner */}
            <div
              className={`mb-6 rounded-2xl border-l-4 p-4 ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-900/20 text-blue-300"
                  : "border-blue-500 bg-blue-50 text-blue-800"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-full p-2 ${
                    theme === "dark" ? "bg-blue-600" : "bg-blue-100"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      theme === "dark" ? "text-white" : "text-blue-600"
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
                </div>
                <div>
                  <p className="mb-2 font-semibold">Profile Update Required</p>
                  <p className="text-sm opacity-90">
                    Please update your information below. Your changes will be
                    reviewed by our team before activation. All fields are
                    required for verification.
                  </p>
                </div>
              </div>
            </div>

            {fetchingProfile ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Loading profile data...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-blue-700/50 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-500 p-2 text-white">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={formValue.full_name}
                          onChange={(e) =>
                            handleFormChange({
                              ...formValue,
                              full_name: e.target.value,
                            })
                          }
                          className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                          } ${formErrors.full_name ? "border-red-500" : ""}`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {formErrors.full_name && (
                        <p className="flex items-center gap-1 text-sm text-red-500">
                          <svg
                            className="h-4 w-4"
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
                          {formErrors.full_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          value={formValue.phone_number}
                          onChange={(e) =>
                            handleFormChange({
                              ...formValue,
                              phone_number: e.target.value,
                            })
                          }
                          className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                          } ${formErrors.phone_number ? "border-red-500" : ""}`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {formErrors.phone_number && (
                        <p className="flex items-center gap-1 text-sm text-red-500">
                          <svg
                            className="h-4 w-4"
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
                          {formErrors.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-green-700/50 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-green-500 p-2 text-white">
                      <svg
                        className="h-5 w-5"
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
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Service Address
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-green-700 dark:text-green-300">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                        className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                        } ${formErrors.address ? "border-red-500" : ""}`}
                        placeholder="Enter your delivery address"
                      />
                      {isLoading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {formErrors.address && (
                      <p className="flex items-center gap-1 text-sm text-red-500">
                        <svg
                          className="h-4 w-4"
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
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Transport & Documentation Section */}
                <div className="rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:border-purple-700/50 dark:from-purple-900/30 dark:to-purple-800/30">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-purple-500 p-2 text-white">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Transport & Documentation
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300">
                        Transport Mode
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </div>
                        <select
                          value={formValue.transport_mode}
                          onChange={(e) =>
                            handleFormChange({
                              ...formValue,
                              transport_mode: e.target.value,
                            })
                          }
                          className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-gray-100 focus:border-purple-500"
                              : "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
                          } ${
                            formErrors.transport_mode ? "border-red-500" : ""
                          }`}
                        >
                          {transportOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.transport_mode && (
                        <p className="flex items-center gap-1 text-sm text-red-500">
                          <svg
                            className="h-4 w-4"
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
                          {formErrors.transport_mode}
                        </p>
                      )}
                    </div>

                    {showDrivingLicense && (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Driving License Number
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 12a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M15 11h3m-3 4h3"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={formValue.driving_license}
                            onChange={(e) =>
                              handleFormChange({
                                ...formValue,
                                driving_license: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              theme === "dark"
                                ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-purple-500"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-500"
                            }`}
                            placeholder="Enter license number"
                          />
                        </div>
                        {formErrors.driving_license && (
                          <p className="flex items-center gap-1 text-sm text-red-500">
                            <svg
                              className="h-4 w-4"
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
                            {formErrors.driving_license}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Photo Section */}
                <div className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:border-orange-700/50 dark:from-orange-900/30 dark:to-orange-800/30">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-orange-500 p-2 text-white">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        Profile Photo
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Take a clear photo of yourself
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-6">
                    <div
                      className={`relative h-48 w-48 overflow-hidden rounded-2xl border-4 shadow-lg ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-800"
                          : "border-gray-200 bg-white"
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
                            theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                          }`}
                        >
                          <div className="text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">
                              No photo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => startCamera("profile")}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {capturedPhoto ? "Update Photo" : "Take Profile Photo"}
                    </button>
                  </div>
                </div>

                {/* National ID Section */}
                <div className="rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-4 dark:border-red-700/50 dark:from-red-900/30 dark:to-red-800/30">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-red-500 p-2 text-white">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 12a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M15 11h3m-3 4h3"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        National ID Verification
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Take a clear photo of your national ID
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-6">
                    <div
                      className={`relative h-36 w-48 overflow-hidden rounded-2xl border-4 shadow-lg sm:h-48 sm:w-64 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-800"
                          : "border-gray-200 bg-white"
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
                            theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                          }`}
                        >
                          <div className="text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 12a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M15 11h3m-3 4h3"
                              />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">
                              No ID photo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => startCamera("national_id")}
                      className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {capturedNationalId ? "Update ID Photo" : "Take ID Photo"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-lg font-bold text-white transition-all duration-200 ${
                      loading
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-green-800 shadow-lg hover:bg-green-900 hover:shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* What Happens Next Section */}
            <div className="mt-6 rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-600/50 dark:from-gray-800/50 dark:to-gray-700/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gray-500 p-2 text-white">
                  <svg
                    className="h-5 w-5"
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
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  What Happens Next?
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    1
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Our team will review your updated information
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    2
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You will be logged out to apply the changes
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    3
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Once approved, you can log back in
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    4
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your updated information will be active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`${
              theme === "dark"
                ? "border-t border-gray-700 bg-gray-800"
                : "border-t border-gray-200 bg-gray-50"
            } rounded-b-3xl px-6 py-4`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>All fields are required for verification</p>
              </div>
              <button
                onClick={onClose}
                className={`rounded-xl px-6 py-2 font-semibold transition-all duration-200 ${
                  theme === "dark"
                    ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Close
              </button>
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
