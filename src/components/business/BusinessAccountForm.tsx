"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, X, Check, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import CameraCapture from "../ui/CameraCapture";

interface BusinessAccountFormProps {
  onBack: () => void;
  onSuccess: () => void;
  onSubmitRef?: (submitFn: () => void) => void;
}

export default function BusinessAccountForm({
  onBack,
  onSuccess,
  onSubmitRef,
}: BusinessAccountFormProps) {
  const { data: session } = useSession();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [rdbCertificate, setRdbCertificate] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<"face" | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user);
        // Pre-fill email and phone from user details
        if (data.user.email) {
          setBusinessEmail(data.user.email);
        }
        if (data.user.phone) {
          setBusinessPhone(data.user.phone);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    if (showCamera === "face") {
      setFaceImage(imageDataUrl);
    }
    setShowCamera(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP) or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setRdbCertificate(result);
        toast.success("File uploaded successfully!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (!businessEmail.trim()) {
      toast.error("Business email is required");
      return;
    }
    if (!businessPhone.trim()) {
      toast.error("Business phone is required");
      return;
    }
    if (!businessLocation.trim()) {
      toast.error("Business location is required");
      return;
    }
    if (!rdbCertificate) {
      toast.error("RDB certificate is required");
      return;
    }
    if (!faceImage) {
      toast.error("Face photo is required");
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
          account_type: "business",
          business_name: businessName.trim(),
          business_email: businessEmail.trim(),
          business_phone: businessPhone.trim(),
          business_location: businessLocation.trim(),
          rdb_certificate: rdbCertificate,
          face_image: faceImage,
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
  }, [businessName, businessEmail, businessPhone, businessLocation, rdbCertificate, faceImage, onSuccess]);

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
          Business Account Registration
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

      {/* Business Information */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
          Business Information
        </h4>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Business Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Business Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="Enter business email"
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Business Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="Enter business phone"
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Business Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={businessLocation}
              onChange={(e) => setBusinessLocation(e.target.value)}
              placeholder="Enter business location/address"
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
              required
            />
          </div>
        </div>
      </div>

      {/* RDB Certificate Upload */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          RDB Certificate <span className="text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Upload a clear photo or PDF of your RDB (Rwanda Development Board)
          certificate (Max 5MB)
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {rdbCertificate ? (
            <div className="relative">
              {rdbCertificate.startsWith("data:image") ? (
                <img
                  src={rdbCertificate}
                  alt="RDB Certificate"
                  className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
                />
              ) : (
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 sm:h-32 sm:w-32">
                  <Upload className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                  <span className="mt-1 text-xs text-gray-500">PDF</span>
                </div>
              )}
              <button
                onClick={() => {
                  setRdbCertificate(null);
                }}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 sm:-right-2 sm:-top-2"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500 sm:h-32 sm:w-32">
              <Upload className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
              <span className="mt-1 text-xs text-gray-500 sm:mt-2">Upload</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Face Image Capture */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Face Photo <span className="text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Take a clear face photo for verification
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

      {/* Camera Capture Component */}
      <CameraCapture
        isOpen={showCamera === "face"}
        onClose={() => setShowCamera(null)}
        onCapture={handleCameraCapture}
        cameraType="user"
        title="Capture Face Photo"
        mirrorVideo={true}
      />

    </div>
  );
}
