"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, X, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import CameraCapture from "../ui/CameraCapture";

interface PersonalBusinessFormProps {
  onBack: () => void;
  onSuccess: () => void;
  onSubmitRef?: (submitFn: () => void) => void;
}

export default function PersonalBusinessForm({
  onBack,
  onSuccess,
  onSubmitRef,
}: PersonalBusinessFormProps) {
  const { data: session } = useSession();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<"face" | "id" | null>(null);

  useEffect(() => {
    fetchUserDetails();
    fetchDefaultAddress();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch("/api/queries/addresses");
      if (response.ok) {
        const data = await response.json();
        const defaultAddr = (data.addresses || []).find(
          (addr: any) => addr.is_default
        );
        if (defaultAddr) {
          setDefaultAddress(defaultAddr);
          // Pre-fill with default address if available
          const addressString = `${defaultAddr.street || ""}, ${
            defaultAddr.city || ""
          }${defaultAddr.postal_code ? `, ${defaultAddr.postal_code}` : ""}`
            .trim()
            .replace(/^,\s*|,\s*$/g, "");
          setBusinessLocation(addressString);
        }
      }
    } catch (error) {
      console.error("Error fetching default address:", error);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    if (showCamera === "face") {
      setFaceImage(imageDataUrl);
    } else if (showCamera === "id") {
      setIdImage(imageDataUrl);
    }
    setShowCamera(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (!faceImage || !idImage) {
      toast.error("Please capture both face and ID images");
      return;
    }
    if (!businessLocation.trim()) {
      toast.error("Operating address is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mutations/create-business-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_type: "personal",
          business_name: businessName.trim(),
          face_image: faceImage,
          id_image: idImage,
          business_location: businessLocation.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account created successfully! Waiting for review.");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [businessName, faceImage, idImage, businessLocation, businessDescription, defaultAddress, userDetails, session, user, onSuccess]);

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef(handleSubmit);
    }
  }, [onSubmitRef, handleSubmit]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700 sm:pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          Personal Account Registration
        </h3>
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 sm:space-x-2 sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* User Details Display */}
      {userDetails && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 sm:p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white sm:mb-3 sm:text-base">
            Your Details
          </h4>
          <div className="grid gap-1.5 text-xs text-gray-700 dark:text-gray-300 sm:gap-2 sm:text-sm">
            <div>
              <span className="font-medium">Name:</span> {userDetails.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {userDetails.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {userDetails.phone}
            </div>
          </div>
        </div>
      )}

      {/* Business Name */}
      <div>
        <label
          htmlFor="businessName"
          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Business Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., John's Grocery Store"
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
            required
          />
        </div>
      </div>

      {/* Operating Address */}
      <div>
        <label
          htmlFor="businessLocation"
          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Operating Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="businessLocation"
          value={businessLocation}
          onChange={(e) => setBusinessLocation(e.target.value)}
          placeholder={
            defaultAddress
              ? `${defaultAddress.street || ""}, ${defaultAddress.city || ""}${
                  defaultAddress.postal_code
                    ? `, ${defaultAddress.postal_code}`
                    : ""
                }`
                  .trim()
                  .replace(/^,\s*|,\s*$/g, "")
              : "Enter your operating address (e.g., Street, City, Postal Code)"
          }
          rows={4}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
          required
        />
        {defaultAddress && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Default address:</span>{" "}
            {defaultAddress.street}, {defaultAddress.city}
            {defaultAddress.postal_code && `, ${defaultAddress.postal_code}`}
          </p>
        )}
      </div>

      {/* Face Image Capture */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Face Photo <span className="text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Take a clear photo of your face for verification
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {faceImage ? (
            <div className="relative">
              <img
                src={faceImage}
                alt="Face"
                className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
              />
              <button
                onClick={() => {
                  setFaceImage(null);
                }}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 sm:-right-2 sm:-top-2"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCamera("face")}
              className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500 sm:h-32 sm:w-32"
            >
              <Camera className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
              <span className="mt-1 text-xs text-gray-500 sm:mt-2">
                Capture
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ID Image Capture */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          ID Photo <span className="text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Take a clear photo of your ID card (front side)
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {idImage ? (
            <div className="relative">
              <img
                src={idImage}
                alt="ID"
                className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
              />
              <button
                onClick={() => {
                  setIdImage(null);
                }}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 sm:-right-2 sm:-top-2"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCamera("id")}
              className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500 sm:h-32 sm:w-32"
            >
              <Camera className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
              <span className="mt-1 text-xs text-gray-500 sm:mt-2">
                Capture
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Capture Component */}
      <CameraCapture
        isOpen={showCamera === "face"}
        onClose={() => setShowCamera(null)}
        onCapture={handleCameraCapture}
        cameraType="user"
        title="Capture Face Photo"
        mirrorVideo={true}
      />
      <CameraCapture
        isOpen={showCamera === "id"}
        onClose={() => setShowCamera(null)}
        onCapture={handleCameraCapture}
        cameraType="environment"
        title="Capture ID Photo"
        mirrorVideo={false}
      />

    </div>
  );
}
