import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";
import Image from "next/image";
import CameraCapture from "../ui/CameraCapture";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone?: string;
  shop: string;
  shopAddress: string;
  deliveryAddress?: string;
  deliveryStreet?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  deliveryPlaceDetails?: any;
  dateCreated: string;
  dateCompleted: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  isReelOrder?: boolean;
  isRestaurantOrder?: boolean;
}

interface DeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
  orderType?: "regular" | "reel" | "restaurant";
}

const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  open,
  onClose,
  invoiceData,
  loading,
  orderType = "regular",
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Verification state
  const [currentVerificationStep, setCurrentVerificationStep] = useState<"pin" | "photo">("pin");
  const [pinInput, setPinInput] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);
  
  // Photo state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  
  // Delivery state
  const [forceOpen, setForceOpen] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [proofType, setProofType] = useState<"pin" | "photo" | null>(null);
  
  // Mounting state
  const [isMounted, setIsMounted] = useState(false);
  const [dataLoadTimeout, setDataLoadTimeout] = useState(false);

  // Check if component is mounted (for SSR compatibility)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set a timeout for data loading
  useEffect(() => {
    if (open && !invoiceData && !loading) {
      const timeout = setTimeout(() => {
        setDataLoadTimeout(true);
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      setDataLoadTimeout(false);
    }
  }, [open, invoiceData, loading]);

  // Reset modal state when it opens
  useEffect(() => {
    if (open && invoiceData?.orderId) {
      console.log("🔍 [Delivery Modal] Invoice data received:", {
        deliveryPlaceDetails: invoiceData.deliveryPlaceDetails,
        deliveryStreet: invoiceData.deliveryStreet,
        deliveryCity: invoiceData.deliveryCity,
        customer: invoiceData.customer,
        orderNumber: invoiceData.orderNumber,
      });
      
      localStorage.removeItem(`delivery_upload_${invoiceData.orderId}`);
      setCurrentVerificationStep("pin");
      setPinInput("");
      setPinAttempts(0);
      setPinError(null);
      setVerifyingPin(false);
      setPhotoUploading(false);
      setPhotoUploaded(false);
      setUploadError(null);
      setCapturedImage(null);
      setShowCameraCapture(false);
      setForceOpen(false);
      setConfirmingDelivery(false);
      setDeliveryConfirmed(false);
      setProofType(null);
    }
  }, [open, invoiceData?.orderId]);

  // Handle PIN verification
  const handleVerifyPin = async () => {
    if (!pinInput.trim()) {
      setPinError("Please enter the PIN");
      return;
    }

    if (!invoiceData?.orderId) {
      setPinError("Order ID is missing");
      return;
    }

    try {
      setVerifyingPin(true);
      setPinError(null);

      const response = await fetch(`/api/shopper/verifyOrderPin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          pin: pinInput,
          orderType: orderType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        // PIN is correct
        setProofType("pin");
        setPhotoUploaded(true);
        setPinError(null);
      } else {
        // PIN is incorrect
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);
        
        if (newAttempts >= 2) {
          setPinError("PIN verification failed twice. Please take a photo for proof of delivery.");
          setTimeout(() => {
            setCurrentVerificationStep("photo");
            setPinError(null);
          }, 2000);
        } else {
          setPinError(`Incorrect PIN. ${2 - newAttempts} attempt(s) remaining.`);
          setPinInput("");
        }
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      setPinError("Failed to verify PIN. Please try again.");
    } finally {
      setVerifyingPin(false);
    }
  };

  // Handle photo capture from CameraCapture component
  const handlePhotoCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setShowCameraCapture(false);
    setProofType("photo");
    await handleUpdateDatabase(imageDataUrl);
  };

  // Upload photo to database
  const handleUpdateDatabase = async (imageData: string) => {
    if (!invoiceData?.orderId) return;

    try {
      setPhotoUploading(true);
      setForceOpen(true);

      const response = await fetch("/api/shopper/uploadDeliveryPhoto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          file: imageData,
          updatedAt: new Date().toISOString(),
          orderType: orderType,
          proofType: "photo",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload delivery photo");
      }

      setPhotoUploaded(true);
      setUploadError(null);
      setForceOpen(false);
    } catch (error) {
      console.error("Error uploading delivery photo:", error);
      setUploadError("Failed to upload photo. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  };

  // Handle delivery confirmation
  const handleConfirmDelivery = async () => {
    if (!invoiceData?.orderId) {
      setUploadError("Order ID is missing");
      return;
    }

    try {
      setConfirmingDelivery(true);
      setForceOpen(true);

      // Process wallet operations
      const walletResponse = await fetch("/api/shopper/walletOperations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          operation: "delivered",
          isReelOrder: invoiceData.isReelOrder || false,
          isRestaurantOrder: invoiceData.isRestaurantOrder || false,
        }),
      });

      if (!walletResponse.ok) {
        const walletErrorData = await walletResponse.json();
        throw new Error(walletErrorData.error || "Failed to process wallet operations");
      }

      // Update order status to delivered
      const response = await fetch("/api/shopper/updateOrderStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          status: "delivered",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm delivery");
      }

      setDeliveryConfirmed(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/Plasa/active-batches");
      }, 1500);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      setUploadError("Failed to confirm delivery. Please try again.");
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const handleClose = () => {
    if (photoUploading || forceOpen || confirmingDelivery || showCameraCapture) {
      return;
    }
    onClose();
  };

  // Determine if modal should be open
  const isModalOpen = open || forceOpen;

  // Don't render if not mounted or not open
  if (!isMounted || !isModalOpen) return null;

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className={`rounded-t-2xl px-6 py-4 border-b ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gradient-to-r from-green-50 to-blue-50 border-gray-200"}`}>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                Delivery Confirmation
              </h3>
            </div>
            <div className={`px-6 py-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p className={`mt-4 text-lg font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                  Processing...
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Waiting/Timeout state
    if (!invoiceData && !loading) {
      if (dataLoadTimeout) {
        return (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <div className={`rounded-t-2xl px-6 py-4 border-b ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gradient-to-r from-red-50 to-pink-50 border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${theme === "dark" ? "bg-red-600" : "bg-red-100"}`}>
                    <svg className={`h-6 w-6 ${theme === "dark" ? "text-white" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                    Loading Timeout
                  </h3>
                </div>
              </div>
              <div className={`px-6 py-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                <div className={`py-4 text-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                  Could not load delivery confirmation data. Please try refreshing the page or contact support if the issue persists.
                </div>
              </div>
              <div className={`rounded-b-2xl px-6 py-4 border-t ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <button onClick={onClose} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Waiting state
      return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className={`rounded-t-2xl px-6 py-4 border-b ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gradient-to-r from-green-50 to-blue-50 border-gray-200"}`}>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                Preparing Delivery Confirmation
              </h3>
            </div>
            <div className={`px-6 py-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p className={`mt-4 text-lg font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                  Please wait...
                </p>
                <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Preparing your delivery confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Main modal content
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-0 backdrop-blur-md md:px-4">
        <div className={`flex h-full w-full flex-col overflow-hidden shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} md:border`}>
          {/* Header */}
          <div className={`flex flex-shrink-0 items-center justify-between border-b px-4 py-4 md:px-6 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gradient-to-r from-green-50 to-blue-50"}`}>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${theme === "dark" ? "bg-green-600" : "bg-green-100"}`}>
                <svg className={`h-6 w-6 ${theme === "dark" ? "text-white" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold md:text-xl ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                  {photoUploading ? "Uploading Delivery Photo..." : confirmingDelivery ? "Confirming Delivery..." : deliveryConfirmed ? "Delivery Confirmed!" : "Delivery Confirmation"}
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Order #{invoiceData.orderNumber}
                </p>
              </div>
            </div>
            {!photoUploading && !confirmingDelivery && (
              <button onClick={handleClose} className={`rounded-xl p-2 transition-colors ${theme === "dark" ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Body */}
          <div className={`flex-1 overflow-y-auto px-4 py-4 md:px-6 ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white"}`}>
            <div className="space-y-4">
              {/* Delivery Address Section */}
              <div className={`rounded-xl border p-4 ${theme === "dark" ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
                <div className="mb-3 flex items-start gap-3">
                  <div className={`rounded-full p-2 ${theme === "dark" ? "bg-blue-600" : "bg-blue-100"}`}>
                    <svg className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                      Delivery Address
                    </h3>
                    <div className={`mt-2 space-y-1 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      <p className="font-medium">{invoiceData.customer}</p>
                      {invoiceData.customerPhone && (
                        <p className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {invoiceData.customerPhone}
                        </p>
                      )}
                      {invoiceData.deliveryPlaceDetails && (
                        <div className={`mt-2 rounded-lg border-l-4 p-3 ${theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-400 bg-blue-50"}`}>
                          <div className="flex items-start gap-2">
                            <svg className={`h-4 w-4 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                                Additional Location Details
                              </p>
                              <div className={`text-sm space-y-1 ${theme === "dark" ? "text-blue-200" : "text-blue-900"}`}>
                                {typeof invoiceData.deliveryPlaceDetails === 'string' ? (
                                  <p>{invoiceData.deliveryPlaceDetails}</p>
                                ) : (
                                  <>
                                    {invoiceData.deliveryPlaceDetails.gateNumber && (
                                      <p>
                                        <span className="font-semibold">Gate:</span> {invoiceData.deliveryPlaceDetails.gateNumber}
                                        {invoiceData.deliveryPlaceDetails.gateColor && (
                                          <span className="ml-2">
                                            ({invoiceData.deliveryPlaceDetails.gateColor} gate)
                                          </span>
                                        )}
                                      </p>
                                    )}
                                    {invoiceData.deliveryPlaceDetails.floor && (
                                      <p>
                                        <span className="font-semibold">Floor:</span> {invoiceData.deliveryPlaceDetails.floor}
                                      </p>
                                    )}
                                    {invoiceData.deliveryPlaceDetails.doorNumber && (
                                      <p>
                                        <span className="font-semibold">Door:</span> {invoiceData.deliveryPlaceDetails.doorNumber}
                                      </p>
                                    )}
                                    {invoiceData.deliveryPlaceDetails.buildingName && (
                                      <p>
                                        <span className="font-semibold">Building:</span> {invoiceData.deliveryPlaceDetails.buildingName}
                                      </p>
                                    )}
                                    {invoiceData.deliveryPlaceDetails.apartmentNumber && (
                                      <p>
                                        <span className="font-semibold">Apartment:</span> {invoiceData.deliveryPlaceDetails.apartmentNumber}
                                      </p>
                                    )}
                                    {invoiceData.deliveryPlaceDetails.landmark && (
                                      <p>
                                        <span className="font-semibold">Landmark:</span> {invoiceData.deliveryPlaceDetails.landmark}
                                      </p>
                                    )}
                                    {invoiceData.deliveryPlaceDetails.instructions && (
                                      <p>
                                        <span className="font-semibold">Instructions:</span> {invoiceData.deliveryPlaceDetails.instructions}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="mt-2">
                        {invoiceData.deliveryStreet || invoiceData.deliveryAddress || "Address not available"}
                        {invoiceData.deliveryCity && `, ${invoiceData.deliveryCity}`}
                        {invoiceData.deliveryPostalCode && `, ${invoiceData.deliveryPostalCode}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PIN Verification Section */}
              {currentVerificationStep === "pin" && !photoUploaded && (
                <div className={`rounded-xl border-2 p-4 ${theme === "dark" ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`rounded-full p-2 ${theme === "dark" ? "bg-green-600" : "bg-green-100"}`}>
                      <svg className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Verify Delivery PIN</h3>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Ask customer for their order PIN
                      </p>
                    </div>
                  </div>
                  <p className={`mb-3 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Please ask the customer for their 2-digit order PIN to confirm delivery.
                  </p>

                  {/* PIN Input Form */}
                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={pinInput}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                          setPinInput(value);
                          setPinError(null);
                        }}
                        placeholder="Enter 2-digit PIN"
                        maxLength={2}
                        disabled={verifyingPin}
                        className={`w-full rounded-xl border-2 px-4 py-4 text-center text-2xl font-bold tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === "dark" ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"} ${pinError ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                    </div>

                    {pinError && (
                      <div className={`rounded-lg border-l-4 p-3 text-sm ${theme === "dark" ? "border-red-500 bg-red-900/20 text-red-300" : "border-red-500 bg-red-50 text-red-600"}`}>
                        {pinError}
                      </div>
                    )}

                    {pinAttempts > 0 && pinAttempts < 2 && (
                      <div className={`rounded-lg border-l-4 p-3 text-sm ${theme === "dark" ? "border-yellow-500 bg-yellow-900/20 text-yellow-300" : "border-yellow-500 bg-yellow-50 text-yellow-700"}`}>
                        Attempt {pinAttempts} of 2. {2 - pinAttempts} attempt(s) remaining.
                      </div>
                    )}

                    <button
                      onClick={handleVerifyPin}
                      disabled={verifyingPin || pinInput.length !== 2}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {verifyingPin ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Verifying PIN...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Confirm Pin For Delviery
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Proof Section */}
              {currentVerificationStep === "photo" && !photoUploaded && (
                <div className={`rounded-xl border-2 p-4 ${theme === "dark" ? "border-blue-600 bg-blue-900/20" : "border-blue-200 bg-blue-50"}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`rounded-full p-2 ${theme === "dark" ? "bg-blue-600" : "bg-blue-100"}`}>
                      <svg className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Delivery Photo Required</h3>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        PIN verification failed - photo proof needed
                      </p>
                    </div>
                  </div>

                  <p className={`mb-3 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {photoUploading ? "Please wait while we upload your photo..." : "Please take a photo of the delivered package with the customer as proof of delivery."}
                  </p>

                  {photoUploading && (
                    <div className="mb-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative h-12 w-12">
                          <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                        </div>
                        <p className={`mt-3 text-base font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                          Uploading photo...
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Please don't close this window until the upload is complete
                      </p>
                    </div>
                  )}

                  {!photoUploading && !capturedImage && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowCameraCapture(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Photo
                      </button>
                    </div>
                  )}

                  {capturedImage && !photoUploading && (
                    <div className="mt-4 text-center">
                      <div className={`rounded-lg border p-4 ${theme === "dark" ? "border-gray-700 bg-gray-700" : "bg-gray-50"}`}>
                        <p className="mb-2 flex items-center justify-center gap-2 font-medium text-green-600 dark:text-green-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Photo captured successfully!
                        </p>
                        <div className="relative mx-auto mt-2 h-32 w-48 overflow-hidden rounded-lg sm:h-48 sm:w-64">
                          <Image src={capturedImage} alt="Delivery proof" fill className="object-cover" />
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className={`mt-2 text-center text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                      {uploadError}
                    </p>
                  )}
                </div>
              )}

              {/* Success state for PIN verification */}
              {proofType === "pin" && photoUploaded && (
                <div className={`rounded-xl border-2 p-4 ${theme === "dark" ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${theme === "dark" ? "bg-green-600" : "bg-green-100"}`}>
                      <svg className={`h-6 w-6 ${theme === "dark" ? "text-white" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-green-600 dark:text-green-400">
                        PIN Verified Successfully!
                      </h3>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Customer confirmed delivery with PIN
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Delivery Button */}
              {photoUploaded && !deliveryConfirmed && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={confirmingDelivery}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmingDelivery ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Confirming Delivery...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirm Delivery
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    This will mark the order as delivered and update your earnings
                  </p>
                </div>
              )}

              {/* Delivery Confirmation Loading */}
              {confirmingDelivery && (
                <div className="mt-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative h-12 w-12">
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                    </div>
                    <p className={`mt-3 text-base font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                      Updating order status...
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Please wait while we confirm your delivery...
                  </p>
                </div>
              )}

              {/* Delivery Confirmed Success */}
              {deliveryConfirmed && (
                <div className="mt-4 text-center">
                  <div className={`rounded-lg border p-4 ${theme === "dark" ? "border-green-700 bg-green-900/20" : "border-green-200 bg-green-50"}`}>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      Delivery confirmed successfully!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Redirecting to active batches...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {createPortal(renderContent(), document.body)}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => setShowCameraCapture(false)}
        onCapture={handlePhotoCapture}
        cameraType="environment"
        title="Delivery Proof Photo"
      />
    </>
  );
};

export default DeliveryConfirmationModal;
