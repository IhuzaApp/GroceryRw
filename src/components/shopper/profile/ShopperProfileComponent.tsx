import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTheme } from "../../../context/ThemeContext";
import { authenticatedFetch } from "../../../lib/authenticatedFetch";
import { logger } from "../../../utils/logger";
import {
  useToaster,
  Message,
  Modal,
  Button,
  Toggle,
  DatePicker,
  SelectPicker,
} from "rsuite";
import UpdateShopperDrawer from "./UpdateShopperDrawer";
import CameraCapture from "../../ui/CameraCapture";
import { useShopperProfile } from "../../../hooks/useShopperProfile";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const splitName = (fullName: string) => {
  const parts = fullName ? fullName.split(" ") : [""];
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

interface ShopperData {
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
  Employment_id?: string;
  national_id_photo_front?: string;
  national_id_photo_back?: string;
  drivingLicense_Image?: string;
  telegram_id?: string;
  guarantor?: string;
  guarantorPhone?: string;
  guarantorRelationship?: string;
  mutual_status?: string;
  Police_Clearance_Cert?: string;
  proofOfResidency?: string;
  User?: {
    email: string;
    phone?: string;
  };
}

export default function ShopperProfileComponent() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const toaster = useToaster();

  const {
    shopper: databaseShopper,
    profileImage,
    displayName,
    isLoading: isProfileLoading,
    mutate,
  } = useShopperProfile();

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    created_at: string;
  } | null>(null);

  const [shopperData, setShopperData] = useState<ShopperData | null>(null);

  // Sync database data to local state
  useEffect(() => {
    if (databaseShopper) {
      setShopperData(databaseShopper as any);

      // Update form fields
      const nameParts = splitName(databaseShopper.full_name);
      setFirstName(nameParts.firstName);
      setLastName(nameParts.lastName);
      setPhoneNumber(databaseShopper.phone_number || "");
      setPosition(databaseShopper.transport_mode || "");

      if (databaseShopper.User?.email) {
        setEmail(databaseShopper.User.email);
      }

      if (databaseShopper.created_at) {
        setOnboardingDate(new Date(databaseShopper.created_at));
      }
    }
  }, [databaseShopper]);

  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNationalIdUnderProfile, setShowNationalIdUnderProfile] =
    useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  // Check if component is mounted (for SSR compatibility)
  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("");
  const [onboardingDate, setOnboardingDate] = useState<Date | null>(null);
  const [role] = useState("Shopper");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toaster.push(
      <Message type="info" closable>
        {label} copied to clipboard
      </Message>,
      { placement: "topEnd", duration: 2000 }
    );
  };

  // Load user data only (shopper logic moved to hook)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadUserData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userRes = await authenticatedFetch("/api/user", {
          signal: controller.signal,
        });
        const userData = await userRes.json();
        if (isMounted && userData.user) {
          setUser(userData.user);
          // If no shopper name yet, use user name
          if (!firstName) {
            const nameParts = splitName(userData.user.name);
            setFirstName(nameParts.firstName);
            setLastName(nameParts.lastName);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        logger.error("Error loading user data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!shopperData?.id) return;

    try {
      const fullName = `${firstName} ${lastName}`.trim();

      const response = await fetch("/api/queries/update-shopper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopper_id: shopperData.id,
          full_name: fullName,
          phone_number: phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shopper information");
      }

      toaster.push(
        <Message type="success" closable>
          Changes saved successfully
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );

      // Reload data
      window.location.reload();
    } catch (error) {
      logger.error(
        "Error saving changes:",
        error instanceof Error ? error.message : String(error)
      );
      toaster.push(
        <Message type="error" closable>
          Failed to save changes
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    // Implement delete functionality if needed
    toaster.push(
      <Message type="info" closable>
        Delete functionality not implemented
      </Message>,
      { placement: "topEnd", duration: 5000 }
    );
    setShowDeleteModal(false);
  };

  // Handle photo capture from CameraCapture component
  const handlePhotoCapture = async (imageDataUrl: string) => {
    if (!session?.user?.id) {
      toaster.push(
        <Message type="error" closable>
          User session not found
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
      return;
    }

    setUploadingPhoto(true);
    setShowCameraCapture(false);

    try {
      const response = await fetch("/api/shopper/uploadShopperPhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoType: "profile_photo",
          photoData: imageDataUrl,
          user_id: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload profile photo");
      }

      // Update local state with new photo
      setShopperData((prev) =>
        prev
          ? {
              ...prev,
              profile_photo: imageDataUrl,
            }
          : null
      );

      toaster.push(
        <Message type="success" closable>
          Profile photo updated successfully
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
    } catch (error) {
      logger.error(
        "Error uploading profile photo:",
        error instanceof Error ? error.message : String(error)
      );
      toaster.push(
        <Message type="error" closable>
          Failed to upload profile photo. Please try again.
        </Message>,
        { placement: "topEnd", duration: 5000 }
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get added date
  const addedDate = shopperData?.created_at || user?.created_at || "";
  const formattedAddedDate = formatDate(addedDate);

  // Check if national_id is a base64 image

  // Check if national_id is a base64 image
  const isNationalIdImage = (value: string | undefined | null): boolean => {
    if (!value) return false;
    return (
      value.startsWith("data:image") ||
      value.startsWith("http://") ||
      value.startsWith("https://")
    );
  };

  // Get national ID image source (could be from national_id field or separate photo fields)
  const getNationalIdImage = () => {
    if (
      shopperData?.national_id &&
      isNationalIdImage(shopperData.national_id)
    ) {
      return shopperData.national_id;
    }
    if (shopperData?.national_id_photo_front) {
      return shopperData.national_id_photo_front;
    }
    return null;
  };

  const nationalIdImage = getNationalIdImage();

  // Format Employee ID: Last 2 digits of year + ID (padded to 2 digits)
  // Example: 2020 + 4 = 2004, 2025 + 4 = 2504
  const getFormattedEmployeeId = (): string => {
    if (!shopperData?.created_at) {
      return shopperData?.Employment_id || "N/A";
    }

    // Extract year from created_at and get last 2 digits
    const joinYear = new Date(shopperData.created_at).getFullYear();
    const yearLastTwo = joinYear % 100; // Get last 2 digits (e.g., 2020 -> 20, 2025 -> 25)

    // Get the Employment_id (could be just a number or already formatted)
    const employeeId = shopperData.Employment_id || "";

    // If Employment_id exists, combine year (last 2 digits) + id (padded to 2 digits)
    if (employeeId) {
      // Convert employeeId to number and pad to 2 digits
      const idNumber = parseInt(employeeId.toString(), 10);
      const paddedId = isNaN(idNumber)
        ? employeeId.toString().padStart(2, "0")
        : idNumber.toString().padStart(2, "0");
      return `${yearLastTwo}${paddedId}`;
    }

    // If no Employment_id, just show last 2 digits of year
    return `${yearLastTwo}`;
  };

  const formattedEmployeeId = getFormattedEmployeeId();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600 dark:border-gray-600 dark:border-t-green-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen transition-colors duration-300 overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-pulse ${
            theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-500/5"
          }`}
        ></div>
        <div
          className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-pulse delay-700 ${
            theme === "dark" ? "bg-blue-500/10" : "bg-blue-500/5"
          }`}
        ></div>
      </div>

      <div className="relative z-10 w-full px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
              Member Dashboard
            </p>
            <h1 className={`text-4xl sm:text-5xl font-black tracking-tighter ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Account Profile
            </h1>
            <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          </div>
          
          <div className="flex items-center gap-3">
            {formattedAddedDate && (
              <div className={`rounded-2xl border px-4 py-2 backdrop-blur-md ${theme === "dark" ? "border-white/5 bg-white/5 text-gray-400" : "border-gray-200 bg-white/50 text-gray-500"}`}>
                <span className="text-xs font-bold uppercase tracking-wider">Joined {formattedAddedDate}</span>
              </div>
            )}
            <button
              onClick={handleSaveChanges}
              className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-3 text-sm font-black tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative uppercase">Save Changes</span>
            </button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-5">
            {/* PROFILE IMAGE Section */}
            <div className={`relative overflow-hidden rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-300 ${
              theme === "dark"
                ? "border-white/5 bg-gray-900/40 shadow-2xl shadow-black/40"
                : "border-gray-200/50 bg-white/70 shadow-2xl shadow-gray-200/30"
            }`}>
              <div className="p-8">
                <div className="mb-6 flex justify-center">
                  <div className="relative aspect-square w-full max-w-[280px] group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border-4 border-white/50 dark:border-white/10 shadow-2xl">
                      <Image
                        src={profileImage}
                        alt="Profile"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>

                {showNationalIdUnderProfile &&
                  (nationalIdImage || shopperData?.national_id_photo_back) && (
                    <div className="mb-6 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Verified Credentials</p>
                      <div
                        className={`grid gap-4 ${
                          nationalIdImage && shopperData?.national_id_photo_back
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        {nationalIdImage && (
                          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/20 bg-gray-100/10 shadow-inner dark:bg-black/20">
                            <img
                              src={nationalIdImage}
                              alt="National ID"
                              className="h-full w-full object-contain p-2"
                            />
                            <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                              {shopperData?.national_id_photo_back ? "Front" : "ID"}
                            </div>
                          </div>
                        )}
                        {shopperData?.national_id_photo_back && (
                          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/20 bg-gray-100/10 shadow-inner dark:bg-black/20">
                            <img
                              src={shopperData.national_id_photo_back}
                              alt="National ID Back"
                              className="h-full w-full object-contain p-2"
                            />
                            <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                              Back
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                <button
                  onClick={() => setShowCameraCapture(true)}
                  disabled={uploadingPhoto}
                  className={`mx-auto flex w-full max-w-[280px] items-center justify-center gap-3 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 disabled:opacity-50 ${
                    theme === "dark"
                      ? "bg-white/10 text-white hover:bg-white/15"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {uploadingPhoto ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Update Photo
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* EMPLOYEE DETAILS Section */}
            <div className={`rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-300 ${
              theme === "dark"
                ? "border-white/5 bg-gray-900/40 shadow-2xl shadow-black/40"
                : "border-gray-200/50 bg-white/70 shadow-2xl shadow-gray-200/30"
            }`}>
              <div className="p-8">
                <div className="mb-8">
                  <h2 className={`text-xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Personal Information
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">Manage your professional identity</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all outline-none ${
                          theme === "dark"
                            ? "border-white/5 bg-white/5 text-white focus:border-emerald-500/50"
                            : "border-gray-100 bg-gray-50 text-gray-900 focus:border-emerald-500/50"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all outline-none ${
                          theme === "dark"
                            ? "border-white/5 bg-white/5 text-white focus:border-emerald-500/50"
                            : "border-gray-100 bg-gray-50 text-gray-900 focus:border-emerald-500/50"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Professional Email</label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold opacity-70 cursor-not-allowed ${
                          theme === "dark" ? "border-white/5 bg-white/5 text-white" : "border-gray-100 bg-gray-50 text-gray-900"
                        }`}
                      />
                      <button
                        onClick={() => copyToClipboard(email, "Email")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-emerald-500 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all outline-none ${
                          theme === "dark"
                            ? "border-white/5 bg-white/5 text-white focus:border-emerald-500/50"
                            : "border-gray-100 bg-gray-50 text-gray-900 focus:border-emerald-500/50"
                        }`}
                      />
                      <button
                        onClick={() => copyToClipboard(phoneNumber, "Phone number")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-emerald-500 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Position</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g., Delivery Specialist"
                      className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all outline-none ${
                        theme === "dark"
                          ? "border-white/5 bg-white/5 text-white focus:border-emerald-500/50"
                          : "border-gray-100 bg-gray-50 text-gray-900 focus:border-emerald-500/50"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8 lg:col-span-7">
            {/* EMPLOYMENT METRICS Section */}
            <div className={`relative overflow-hidden rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-300 ${
              theme === "dark"
                ? "border-white/5 bg-gray-900/40 shadow-2xl shadow-black/40"
                : "border-gray-200/50 bg-white/70 shadow-2xl shadow-gray-200/30"
            }`}>
              <div className="p-8">
                <div className="mb-8">
                  <h2 className={`text-xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Employment Credentials
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">Official platform identification</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Shopper ID</label>
                    <div className={`rounded-2xl border-2 px-5 py-4 text-sm font-black tracking-widest ${
                      theme === "dark" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-emerald-100 bg-emerald-50 text-emerald-700"
                    }`}>
                      #{formattedEmployeeId}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Platform Status</label>
                    <div className={`rounded-2xl border-2 px-5 py-4 text-sm font-black uppercase tracking-widest flex items-center gap-3 ${
                      shopperData?.active 
                        ? (theme === "dark" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-emerald-100 bg-emerald-50 text-emerald-700")
                        : (theme === "dark" ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-red-100 bg-red-50 text-red-700")
                    }`}>
                      <div className={`h-2 w-2 rounded-full animate-pulse ${shopperData?.active ? "bg-emerald-500" : "bg-red-500"}`}></div>
                      {shopperData?.active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IDENTITY Section */}
            <div className={`rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-300 ${
              theme === "dark"
                ? "border-white/5 bg-gray-900/40 shadow-2xl shadow-black/40"
                : "border-gray-200/50 bg-white/70 shadow-2xl shadow-gray-200/30"
            }`}>
              <div className="p-8">
                <div className="mb-8">
                  <h2 className={`text-xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Identity Verification
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">Official government documentation</p>
                </div>

                <div className="space-y-6">
                  {nationalIdImage || shopperData?.national_id_photo_back ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {nationalIdImage && (
                        <div className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] border-2 border-white/10 shadow-2xl">
                          <img src={nationalIdImage} alt="ID Front" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setShowNationalIdUnderProfile(!showNationalIdUnderProfile)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                              {showNationalIdUnderProfile ? "Hide" : "Expand"}
                            </button>
                          </div>
                          <div className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                            Front View
                          </div>
                        </div>
                      )}
                      {shopperData?.national_id_photo_back && (
                        <div className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] border-2 border-white/10 shadow-2xl">
                          <img src={shopperData.national_id_photo_back} alt="ID Back" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setShowNationalIdUnderProfile(!showNationalIdUnderProfile)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                              {showNationalIdUnderProfile ? "Hide" : "Expand"}
                            </button>
                          </div>
                          <div className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                            Back View
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`rounded-2xl border-2 px-5 py-4 text-sm font-bold ${
                      theme === "dark" ? "border-white/5 bg-white/5 text-gray-400" : "border-gray-100 bg-gray-50 text-gray-600"
                    }`}>
                      ID Number: {shopperData?.national_id || "Not Provided"}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Transport</label>
                      <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${theme === "dark" ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}>
                        {shopperData?.transport_mode?.replace("_", " ").toUpperCase() || "N/A"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Verification Status</label>
                      <div className={`rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-2 ${
                        shopperData?.status === "verified" ? "text-emerald-500" : "text-amber-500"
                      }`}>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {shopperData?.status?.toUpperCase() || "PENDING"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFO Section */}
            {(shopperData?.guarantor || shopperData?.telegram_id) && (
              <div className={`rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-300 ${
                theme === "dark"
                  ? "border-white/5 bg-gray-900/40 shadow-2xl shadow-black/40"
                  : "border-gray-200/50 bg-white/70 shadow-2xl shadow-gray-200/30"
              }`}>
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className={`text-xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Emergency & Social
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Supplementary contact information</p>
                  </div>

                  <div className="space-y-6">
                    {shopperData?.guarantor && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Primary Guarantor</label>
                        <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${theme === "dark" ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}>
                          {shopperData.guarantor} {shopperData.guarantorRelationship ? `(${shopperData.guarantorRelationship})` : ""}
                        </div>
                      </div>
                    )}
                    {shopperData?.telegram_id && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Telegram Handle</label>
                        <div className={`rounded-2xl px-5 py-4 text-sm font-bold text-blue-500 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                          @{shopperData.telegram_id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Shopper Drawer */}
      {showUpdateDrawer && shopperData && (
        <UpdateShopperDrawer
          open={showUpdateDrawer}
          onClose={() => setShowUpdateDrawer(false)}
          shopper={{
            id: shopperData.id,
            full_name: shopperData.full_name,
            phone_number: shopperData.phone_number || "",
            national_id: shopperData.national_id || "",
            driving_license: shopperData.driving_license || "",
            transport_mode: shopperData.transport_mode || "",
            profile_photo: shopperData.profile_photo || "",
          }}
          onUpdate={async (data: any) => {
            window.location.reload();
            return { success: true, message: "Shopper updated successfully" };
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
        className={theme === "dark" ? "dark-modal" : ""}
      >
        <Modal.Header>
          <Modal.Title className="text-xl font-black tracking-tight">Security Protocol: Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4 py-2">
            <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"}`}>
              <p className="text-sm font-bold leading-relaxed">
                Warning: This action is irreversible. Deleting this account will permanently remove all associated shopper data from the platform.
              </p>
            </div>
            <p className={`text-xs font-medium px-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Are you absolutely certain you wish to proceed with the termination of this shopper profile?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="pb-6">
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                theme === "dark" ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95"
            >
              Confirm Deletion
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Camera Capture for Profile Photo - Rendered via Portal */}
      {isComponentMounted &&
        createPortal(
          showCameraCapture && (
            <CameraCapture
              isOpen={showCameraCapture}
              onClose={() => setShowCameraCapture(false)}
              onCapture={handlePhotoCapture}
              cameraType="user"
              title="Capture Profile Photo"
              mirrorVideo={true}
            />
          ),
          document.body
        )}
    </div>
  );
}
