import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "../../../lib/authenticatedFetch";
import { logger } from "../../../utils/logger";
import { useToaster, Message, Modal, Button, Toggle, DatePicker, SelectPicker } from "rsuite";
import UpdateShopperDrawer from "./UpdateShopperDrawer";

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
  const toaster = useToaster();
  
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
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNationalIdUnderProfile, setShowNationalIdUnderProfile] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("");
  const [role] = useState("Shopper");
  const [onboardingDate, setOnboardingDate] = useState<Date | null>(null);
  const [onboardingProgress] = useState(35);

  // Format date as DD.MM.YYYY
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Split full name into first and last name
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    const lastName = parts.slice(-1)[0];
    const firstName = parts.slice(0, -1).join(" ");
    return { firstName, lastName };
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toaster.push(
        <Message type="success" closable>
          {label} copied to clipboard
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
    }).catch(() => {
      toaster.push(
        <Message type="error" closable>
          Failed to copy {label}
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
    });
  };

  // Load data
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userRes = await authenticatedFetch("/api/user", {
          signal: controller.signal,
        });
        const userData = await userRes.json();
        if (isMounted && userData.user) {
          setUser(userData.user);
          setEmail(userData.user.email);
          
          // Split name
          const nameParts = splitName(userData.user.name);
          setFirstName(nameParts.firstName);
          setLastName(nameParts.lastName);
        }

        // Fetch shopper profile
        const profileRes = await authenticatedFetch(
          "/api/queries/shopper-profile",
          {
            signal: controller.signal,
          }
        );
        const profileData = await profileRes.json();
        if (isMounted && profileData.shopper) {
          setShopperData(profileData.shopper);
          
          // Update form fields
          const nameParts = splitName(profileData.shopper.full_name);
          setFirstName(nameParts.firstName);
          setLastName(nameParts.lastName);
          setPhoneNumber(profileData.shopper.phone_number || "");
          setPosition(profileData.shopper.transport_mode || "");
          
          // Set email from User relation if available
          if (profileData.shopper.User?.email) {
            setEmail(profileData.shopper.User.email);
          }
          
          // Set onboarding date if available
          if (profileData.shopper.created_at) {
            setOnboardingDate(new Date(profileData.shopper.created_at));
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        logger.error(
          "Error loading shopper data:",
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

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

  // Get profile image - prioritize shopper profile_photo
  const profileImage = shopperData?.profile_photo || user?.profile_picture || "/assets/images/profile.jpg";
  
  // Get added date
  const addedDate = shopperData?.created_at || user?.created_at || "";
  const formattedAddedDate = formatDate(addedDate);

  // Get full name for display
  const displayName = shopperData?.full_name || user?.name || "";

  // Check if national_id is a base64 image
  const isNationalIdImage = (value: string | undefined | null): boolean => {
    if (!value) return false;
    return value.startsWith("data:image") || value.startsWith("http://") || value.startsWith("https://");
  };

  // Get national ID image source (could be from national_id field or separate photo fields)
  const getNationalIdImage = () => {
    if (shopperData?.national_id && isNationalIdImage(shopperData.national_id)) {
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
      const paddedId = isNaN(idNumber) ? employeeId.toString().padStart(2, '0') : idNumber.toString().padStart(2, '0');
      return `${yearLastTwo}${paddedId}`;
    }
    
    // If no Employment_id, just show last 2 digits of year
    return `${yearLastTwo}`;
  };

  const formattedEmployeeId = getFormattedEmployeeId();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600 mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">
                {displayName}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {formattedAddedDate && (
              <span className="text-xs text-gray-500 sm:text-sm">
                Joined on {formattedAddedDate}
              </span>
            )}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* PROFILE IMAGE Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                PROFILE IMAGE
              </h2>
              <div className="mb-4">
                <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-gray-100 shadow-md">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {showNationalIdUnderProfile && (nationalIdImage || shopperData?.national_id_photo_back) && (
                <div className="mb-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    National ID
                  </label>
                  <div className={`grid gap-3 ${nationalIdImage && shopperData?.national_id_photo_back ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {nationalIdImage && (
                      <div className="relative aspect-[16/10] min-h-[120px] overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 shadow-md">
                        <img
                          src={nationalIdImage}
                          alt="National ID"
                          className="h-full w-full object-contain p-1"
                        />
                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                          {shopperData?.national_id_photo_back ? "Front" : "ID"}
                        </div>
                      </div>
                    )}
                    {shopperData?.national_id_photo_back && (
                      <div className="relative aspect-[16/10] min-h-[120px] overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 shadow-md">
                        <img
                          src={shopperData.national_id_photo_back}
                          alt="National ID Back"
                          className="h-full w-full object-contain p-1"
                        />
                        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                          Back
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowUpdateDrawer(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25"
              >
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Change Profile Image
              </button>
            </div>

            {/* EMPLOYEE DETAILS Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                EMPLOYEE DETAILS
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formattedEmployeeId}
                    readOnly
                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => copyToClipboard(email, "Email")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 transition-colors hover:text-gray-600"
                    >
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => copyToClipboard(phoneNumber, "Phone number")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 transition-colors hover:text-gray-600"
                    >
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g., Delivery Driver"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400"
                  />
                </div>
                {(nationalIdImage || shopperData?.national_id_photo_back || (shopperData?.national_id && !isNationalIdImage(shopperData.national_id))) && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      National ID
                    </label>
                    {(nationalIdImage || shopperData?.national_id_photo_back) ? (
                      <div className="flex gap-2">
                        {nationalIdImage && (
                          <button
                            onClick={() => setShowNationalIdUnderProfile(!showNationalIdUnderProfile)}
                            className={`relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:shadow-md ${
                              showNationalIdUnderProfile 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 bg-gray-100 hover:border-blue-400'
                            }`}
                            title={showNationalIdUnderProfile ? "Click to hide" : "Click to view under profile"}
                          >
                            <img
                              src={nationalIdImage}
                              alt="National ID"
                              className="h-full w-full object-cover"
                            />
                            <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                              showNationalIdUnderProfile 
                                ? 'bg-green-500/20' 
                                : 'bg-black/0 hover:bg-black/10'
                            }`}>
                              <span className={`text-xs font-semibold transition-opacity ${
                                showNationalIdUnderProfile 
                                  ? 'text-green-700 opacity-100' 
                                  : 'text-white opacity-0 hover:opacity-100'
                              }`}>
                                {showNationalIdUnderProfile ? "✓ Showing" : "View"}
                              </span>
                            </div>
                            <div className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              {shopperData?.national_id_photo_back ? "Front" : "ID"}
                            </div>
                          </button>
                        )}
                        {shopperData?.national_id_photo_back && (
                          <button
                            onClick={() => setShowNationalIdUnderProfile(!showNationalIdUnderProfile)}
                            className={`relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:shadow-md ${
                              showNationalIdUnderProfile 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 bg-gray-100 hover:border-blue-400'
                            }`}
                            title={showNationalIdUnderProfile ? "Click to hide" : "Click to view under profile"}
                          >
                            <img
                              src={shopperData.national_id_photo_back}
                              alt="National ID Back"
                              className="h-full w-full object-cover"
                            />
                            <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                              showNationalIdUnderProfile 
                                ? 'bg-green-500/20' 
                                : 'bg-black/0 hover:bg-black/10'
                            }`}>
                              <span className={`text-xs font-semibold transition-opacity ${
                                showNationalIdUnderProfile 
                                  ? 'text-green-700 opacity-100' 
                                  : 'text-white opacity-0 hover:opacity-100'
                              }`}>
                                {showNationalIdUnderProfile ? "✓ Showing" : "View"}
                              </span>
                            </div>
                            <div className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Back
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={shopperData?.national_id || "N/A"}
                        readOnly
                        className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                      />
                    )}
                    {shopperData?.national_id && !isNationalIdImage(shopperData.national_id) && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        ID Number: {shopperData.national_id}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Transport Mode
                  </label>
                  <input
                    type="text"
                    value={shopperData?.transport_mode ? shopperData.transport_mode.charAt(0).toUpperCase() + shopperData.transport_mode.slice(1).replace("_", " ") : "N/A"}
                    readOnly
                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <input
                    type="text"
                    value={shopperData?.status ? shopperData.status.charAt(0).toUpperCase() + shopperData.status.slice(1) : "N/A"}
                    readOnly
                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  />
                </div>
                {shopperData?.telegram_id && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Telegram ID
                    </label>
                    <input
                      type="text"
                      value={shopperData.telegram_id}
                      readOnly
                      className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                    />
                  </div>
                )}
                {shopperData?.guarantor && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Guarantor
                    </label>
                    <input
                      type="text"
                      value={`${shopperData.guarantor}${shopperData.guarantorRelationship ? ` (${shopperData.guarantorRelationship})` : ""}`}
                      readOnly
                      className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* ROLE Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                ROLE
              </h2>
              <div className="rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {role}
              </div>
            </div>

            {/* TEAM Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                TEAM
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Account Manager
                  </label>
                  <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                      <span className="text-sm font-medium text-gray-700">SupportRwanda</span>
                    </div>
                    <div className="ml-8 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Email:</span>
                        <span className="text-xs text-gray-700">rwandaSupport@plas.rw</span>
                        <button
                          onClick={() => copyToClipboard("rwandaSupport@plas.rw", "Email")}
                          className="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Phone:</span>
                        <span className="text-xs text-gray-700">+250 788 123 456</span>
                        <button
                          onClick={() => copyToClipboard("+250 788 123 456", "Phone number")}
                          className="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ONBOARDING Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                ONBOARDING
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Starts on
                  </label>
                  <DatePicker
                    value={onboardingDate}
                    onChange={(date) => setOnboardingDate(date)}
                    format="dd.MM.yyyy"
                    style={{ width: "100%" }}
                    placeholder="Select date"
                    oneTap
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Current Status
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 shadow-sm">
                      Onboarding
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-green-600 transition-all shadow-sm"
                        style={{ width: `${onboardingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-green-600 transition-colors hover:text-green-700 hover:underline">
                    View Answers
                  </button>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Onboarding Scripts
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Shopper Scheduler
                          </span>
                          <span className="text-xs text-gray-500">
                            {onboardingProgress}%
                          </span>
                        </div>
                      </div>
                      <Toggle
                        checked={onboardingProgress > 0}
                        onChange={() => {}}
                        className="ml-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
          <button
            onClick={() => router.back()}
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25 sm:w-auto"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Update Shopper Drawer */}
      {showUpdateDrawer && (
        <UpdateShopperDrawer
          isOpen={showUpdateDrawer}
          onClose={() => setShowUpdateDrawer(false)}
          currentData={{
            id: shopperData?.id || "",
            full_name: shopperData?.full_name || "",
            phone_number: shopperData?.phone_number || "",
            national_id: shopperData?.national_id || "",
            driving_license: shopperData?.driving_license || "",
            transport_mode: shopperData?.transport_mode || "",
            profile_photo: shopperData?.profile_photo || "",
          }}
          onUpdate={async (data: any) => {
            // Reload data after update
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
      >
        <Modal.Header>
          <Modal.Title>Delete Shopper</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-600">
            Are you sure you want to delete this shopper? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowDeleteModal(false)} appearance="subtle">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="red" appearance="primary">
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
