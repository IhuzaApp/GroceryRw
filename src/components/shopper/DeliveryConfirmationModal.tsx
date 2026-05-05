import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";
import Image from "next/image";
import CameraCapture from "../ui/CameraCapture";
import { reportErrorToSlackClient } from "../../lib/reportErrorClient";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  orderType?: string;
  combinedOrderIds?: string[];
  combinedOrderNumbers?: string[];
}

interface DeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
  orderType?:
    | "regular"
    | "reel"
    | "restaurant"
    | "business"
    | "combined"
    | "combined_customer";
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
  const [currentVerificationStep, setCurrentVerificationStep] = useState<
    "pin" | "photo"
  >("pin");
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

      // For combined customer deliveries, verify PIN for ALL orders
      const orderIdsToVerify =
        orderType === "combined_customer" &&
        invoiceData.combinedOrderIds &&
        invoiceData.combinedOrderIds.length > 0
          ? invoiceData.combinedOrderIds
          : [invoiceData.orderId];

      // For combined_customer, use the API endpoint that validates all orders have the same PIN
      if (orderType === "combined_customer" && orderIdsToVerify.length > 1) {
        const response = await fetch(`/api/shopper/verifyOrderPin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: invoiceData.orderId, // Primary order ID
            pin: pinInput,
            orderType: "combined_customer",
            combinedOrderIds: orderIdsToVerify,
          }),
        });

        const data = await response.json();

        if (response.ok && data.verified) {
          // All orders have the same PIN and it matches
          setProofType("pin");
          setPhotoUploaded(true);
          setPinError(null);
        } else {
          // PIN verification failed or orders have different PINs
          const newAttempts = pinAttempts + 1;
          setPinAttempts(newAttempts);

          if (newAttempts >= 2) {
            setPinError(
              data.error ||
                "PIN verification failed twice. Please take a photo for proof of delivery."
            );
            setTimeout(() => {
              setCurrentVerificationStep("photo");
              setPinError(null);
            }, 2000);
          } else {
            setPinError(
              data.error ||
                `Incorrect PIN. ${2 - newAttempts} attempt(s) remaining.`
            );
            setPinInput("");
          }
        }
        return;
      }

      // For single orders or non-combined_customer, verify normally
      let allVerified = true;
      let failedOrderIds: string[] = [];

      // Verify PIN for each order
      for (const orderId of orderIdsToVerify) {
        const response = await fetch(`/api/shopper/verifyOrderPin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            pin: pinInput,
            orderType: orderType,
          }),
        });

        const data = await response.json();

        if (!(response.ok && data.verified)) {
          allVerified = false;
          failedOrderIds.push(orderId);
        }
      }

      if (allVerified) {
        // All PINs are correct
        setProofType("pin");
        setPhotoUploaded(true);
        setPinError(null);
      } else {
        // Some PINs are incorrect
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);

        if (newAttempts >= 2) {
          setPinError(
            "PIN verification failed twice. Please take a photo for proof of delivery."
          );
          setTimeout(() => {
            setCurrentVerificationStep("photo");
            setPinError(null);
          }, 2000);
        } else {
          setPinError(
            `Incorrect PIN. ${2 - newAttempts} attempt(s) remaining.`
          );
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
      reportErrorToSlackClient(
        "DeliveryConfirmationModal (upload delivery photo)",
        error
      );
      setUploadError("Failed to upload photo. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  };

  // Delete all Firebase chat messages and conversations for a delivered order
  const deleteFirebaseChatForOrder = async (orderId: string) => {
    if (!db) return;
    const firestore = db;
    try {
      const conversationsRef = collection(firestore, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));
      const snapshot = await getDocs(q);

      for (const conversationDoc of snapshot.docs) {
        const conversationId = conversationDoc.id;
        const messagesRef = collection(
          firestore,
          "chat_conversations",
          conversationId,
          "messages"
        );
        const messagesSnapshot = await getDocs(messagesRef);
        await Promise.all(
          messagesSnapshot.docs.map((d) =>
            deleteDoc(
              doc(
                firestore,
                "chat_conversations",
                conversationId,
                "messages",
                d.id
              )
            )
          )
        );
        await deleteDoc(doc(firestore, "chat_conversations", conversationId));
      }
    } catch (error) {
      console.error("Error deleting Firebase chat for order:", orderId, error);
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

      // Determine which orders to update based on order type:
      // - combined_customer: All orders go to same customer, update all at once (earnings added for all)
      // - combined: Orders go to different customers/routes, update ONLY current order (ignore combinedOrderIds)
      // - regular/reel/restaurant: Single order, update only current order
      // IMPORTANT: For "combined" (different customers), we must only update the specific order,
      // even if combinedOrderIds is present, because each order goes to a different customer
      let orderIdsToUpdate: string[];

      if (invoiceData.orderType === "combined_customer") {
        // Same customer: update all orders together
        orderIdsToUpdate =
          invoiceData.combinedOrderIds &&
          invoiceData.combinedOrderIds.length > 0
            ? invoiceData.combinedOrderIds
            : [invoiceData.orderId];
      } else {
        // For "combined" (different customers) or any other type, only update the single order
        // This ensures that orders going to different customers are updated independently
        orderIdsToUpdate = [invoiceData.orderId];
      }

      // Process wallet operations for each order sequentially
      // For combined_customer: Processes all orders, adding earnings for each order to wallet
      // For combined (different customers): Processes only the current order, adding earnings for that specific order
      // Business orders: pass isBusinessOrder so backend uses business order fees
      const isBusinessOrder = invoiceData.orderType === "business";
      for (const orderId of orderIdsToUpdate) {
        const walletResponse = await fetch("/api/shopper/walletOperations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            operation: "delivered",
            isReelOrder: invoiceData.isReelOrder || false,
            isRestaurantOrder: invoiceData.isRestaurantOrder || false,
            isBusinessOrder: isBusinessOrder || false,
          }),
        });

        if (!walletResponse.ok) {
          const walletErrorData = await walletResponse.json();
          throw new Error(
            walletErrorData.error || "Failed to process wallet operations"
          );
        }
      }

      // Update order status to delivered for all orders
      // For combined orders going to different customers, we need to update only the specific order
      // even if it has a combined_order_id
      // If orderType is "combined" OR if we're only updating one order (not combined_customer),
      // we should set updateOnlyThisOrder to true to prevent updating all orders in the batch
      const updateOnlyThisOrder =
        invoiceData.orderType === "combined" ||
        (orderIdsToUpdate.length === 1 &&
          invoiceData.orderType !== "combined_customer");
      // For business orders use the business order status API; otherwise use shopper updateOrderStatus
      for (const orderId of orderIdsToUpdate) {
        if (isBusinessOrder) {
          const response = await fetch(
            "/api/mutations/update-business-product-order-status",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, status: "delivered" }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message ||
                errorData.error ||
                "Failed to confirm delivery"
            );
          }
        } else {
          const response = await fetch("/api/shopper/updateOrderStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              status: "delivered",
              updateOnlyThisOrder: updateOnlyThisOrder,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to confirm delivery");
          }
        }
      }

      // Delete all Firebase chat messages and conversations for each delivered order
      // (regular, reel, restaurant, business, combined — same orderIdsToUpdate as above)
      for (const orderId of orderIdsToUpdate) {
        await deleteFirebaseChatForOrder(orderId);
      }

      setDeliveryConfirmed(true);

      // For combined orders going to different customers, check if there are other pending orders
      // Only redirect if all orders in the combined batch are delivered
      let shouldRedirect = true;

      if (
        invoiceData.orderType === "combined" &&
        orderIdsToUpdate.length === 1
      ) {
        try {
          // First, get the order details to find the combined_order_id
          const orderDetailsResponse = await fetch(
            `/api/shopper/orderDetails?orderId=${invoiceData.orderId}`
          );
          if (orderDetailsResponse.ok) {
            const orderDetailsData = await orderDetailsResponse.json();
            const combinedOrderId = orderDetailsData.order?.combined_order_id;

            if (combinedOrderId) {
              // Fetch all orders in the combined batch
              const combinedOrdersResponse = await fetch(
                `/api/queries/combined-orders?combined_order_id=${combinedOrderId}`
              );

              if (combinedOrdersResponse.ok) {
                const combinedOrdersData = await combinedOrdersResponse.json();
                const allOrdersInBatch = combinedOrdersData.orders || [];

                // Check if any orders are still pending (not delivered and not cancelled)
                // Any order that's not delivered and not cancelled is considered pending
                const pendingOrders = allOrdersInBatch.filter(
                  (order: any) =>
                    order.id !== invoiceData.orderId &&
                    order.status !== "delivered" &&
                    order.status !== "cancelled"
                );

                if (pendingOrders.length > 0) {
                  shouldRedirect = false;
                  // Close the modal but don't redirect - stay on the page so user can deliver remaining orders
                  setTimeout(() => {
                    onClose();
                  }, 1500);
                }
              }
            }
          }
        } catch (error) {
          reportErrorToSlackClient(
            "DeliveryConfirmationModal (check pending orders)",
            error
          );
          // If there's an error checking, proceed with redirect anyway
        }
      }

      // Redirect after success (only if all orders are delivered or not a combined order with different customers)
      if (shouldRedirect) {
        setTimeout(() => {
          router.push("/Plasa/active-batches");
        }, 1500);
      }
    } catch (error) {
      reportErrorToSlackClient(
        "DeliveryConfirmationModal (confirm delivery)",
        error
      );
      setUploadError("Failed to confirm delivery. Please try again.");
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const handleClose = () => {
    if (
      photoUploading ||
      forceOpen ||
      confirmingDelivery ||
      showCameraCapture
    ) {
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
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`rounded-t-2xl border-b px-6 py-4 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gradient-to-r from-green-50 to-blue-50"
              }`}
            >
              <h3
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Delivery Confirmation
              </h3>
            </div>
            <div
              className={`px-6 py-8 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p
                  className={`mt-4 text-lg font-medium ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
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
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <div
              className={`w-full max-w-md rounded-2xl shadow-2xl ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div
                className={`rounded-t-2xl border-b px-6 py-4 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-gradient-to-r from-red-50 to-pink-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      theme === "dark" ? "bg-red-600" : "bg-red-100"
                    }`}
                  >
                    <svg
                      className={`h-6 w-6 ${
                        theme === "dark" ? "text-white" : "text-red-600"
                      }`}
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
                  </div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    Loading Timeout
                  </h3>
                </div>
              </div>
              <div
                className={`px-6 py-6 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div
                  className={`py-4 text-center ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  Could not load delivery confirmation data. Please try
                  refreshing the page or contact support if the issue persists.
                </div>
              </div>
              <div
                className={`rounded-b-2xl border-t px-6 py-4 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25"
                >
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
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`rounded-t-2xl border-b px-6 py-4 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gradient-to-r from-green-50 to-blue-50"
              }`}
            >
              <h3
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Preparing Delivery Confirmation
              </h3>
            </div>
            <div
              className={`px-6 py-8 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p
                  className={`mt-4 text-lg font-medium ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Please wait...
                </p>
                <p
                  className={`mt-2 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Preparing your delivery confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!invoiceData) return null;

    // Main modal content
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
        onClick={() => !confirmingDelivery && !photoUploading && handleClose()}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div
          className={`relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[1.5rem] border shadow-2xl transition-all duration-300 sm:max-h-[80vh] sm:rounded-[1.5rem]`}
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

          <div
            className={`flex flex-shrink-0 items-center justify-between px-5 py-4 sm:px-6 ${
              theme === "dark"
                ? "border-b border-white/5"
                : "border-b border-black/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <svg
                  className="h-5 w-5 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className={`text-lg font-black tracking-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {photoUploading
                    ? "Securing Photo..."
                    : confirmingDelivery
                    ? "Finalizing..."
                    : deliveryConfirmed
                    ? "Delivered!"
                    : orderType === "combined_customer"
                    ? "Batch Delivery"
                    : "Confirm Delivery"}
                </h3>
                <p
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {orderType === "combined_customer"
                    ? `${invoiceData.combinedOrderNumbers?.length || 1} Orders • Batch`
                    : `Order ID: ${invoiceData.orderNumber}`}
                </p>
              </div>
            </div>
            {!photoUploading && !confirmingDelivery && (
              <button
                onClick={handleClose}
                className={`group rounded-xl p-2 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    : "bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-900"
                }`}
              >
                <svg
                  className="h-5 w-5 transition-transform group-hover:rotate-90"
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
            )}
          </div>

          <div
            className={`max-h-[75vh] flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 ${
              theme === "dark" ? "bg-[#0B0F1A]" : "bg-white"
            }`}
          >
            <div className="mx-auto max-w-sm space-y-6">
              {/* Animated Progress Dots */}
              {!deliveryConfirmed && (
                <div className="flex justify-center gap-3">
                  <div className={`h-2 w-8 rounded-full transition-all duration-500 ${currentVerificationStep === 'pin' && !photoUploaded ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 w-12' : 'bg-gray-300 dark:bg-gray-700'}`} />
                  <div className={`h-2 w-8 rounded-full transition-all duration-500 ${(currentVerificationStep === 'photo' && !photoUploaded) || (photoUploaded && !deliveryConfirmed) ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 w-12' : 'bg-gray-300 dark:bg-gray-700'}`} />
                </div>
              )}

              {/* Delivery Context */}
              <div
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-500 hover:border-emerald-500/50 ${
                  theme === "dark"
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-black/5 bg-gray-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-500 group-hover:scale-110 ${
                    theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Delivery To</h4>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {invoiceData.customer}
                    </p>
                    <p className={`mt-0.5 text-xs font-medium leading-relaxed opacity-60 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {invoiceData?.deliveryStreet || invoiceData?.deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* PIN Verification Section */}
              {currentVerificationStep === "pin" && !photoUploaded && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="text-center space-y-1">
                    <h3 className={`text-lg font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Security PIN</h3>
                    <p className={`text-[10px] font-medium opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Ask customer for their verification code
                    </p>
                  </div>

                  <div className="mt-6 group relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter Code"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                      className={`h-12 w-full rounded-xl border bg-transparent text-center text-2xl font-black tracking-[0.4em] transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "border-white/10 text-white placeholder-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/10"
                          : "border-black/10 text-gray-900 placeholder-black/5 focus:border-emerald-500/50 focus:ring-emerald-500/10"
                      }`}
                    />
                    <div className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/40">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  {pinError && (
                    <div className="mt-6 animate-in shake duration-500 rounded-2xl bg-red-500/10 p-5 text-center text-sm font-black text-red-500 ring-2 ring-red-500/20">
                      {pinError}
                    </div>
                  )}

                  <button
                    onClick={handleVerifyPin}
                    disabled={verifyingPin || pinInput.length < 2}
                    className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-4 py-3 text-sm font-black text-white shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:grayscale disabled:scale-100`}
                  >
                    {verifyingPin ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>VERIFY PIN</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Photo Proof Section */}
              {currentVerificationStep === "photo" && !photoUploaded && (
                <div className="animate-in fade-in zoom-in-95 duration-700 text-center space-y-4">
                  <div className="space-y-1">
                    <h3 className={`text-lg font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Visual Proof</h3>
                    <p className={`text-[10px] font-medium opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Take a photo of the delivery
                    </p>
                  </div>

                  {!capturedImage ? (
                    <button
                      onClick={() => setShowCameraCapture(true)}
                      className="group relative flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 transition-all duration-500 hover:border-amber-500 hover:bg-amber-500/10"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                      <span className="text-sm font-black text-amber-600">OPEN CAMERA</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative h-48 w-full overflow-hidden rounded-xl border-2 border-white shadow-md dark:border-white/10">
                        <Image
                          src={capturedImage}
                          alt="Proof"
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                      <button
                        onClick={() => setCapturedImage(null)}
                        className={`flex mx-auto items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black transition-all ${
                          theme === 'dark' ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        RETAKE PHOTO
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Success Finalize Section */}
              {photoUploaded && !deliveryConfirmed && (
                <div className="animate-in zoom-in-50 duration-1000 text-center space-y-4">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/50">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Verified!</h3>
                    <p className={`text-[10px] font-medium opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Ready to complete delivery
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmDelivery}
                    disabled={confirmingDelivery}
                    className="group relative w-full overflow-hidden rounded-xl bg-gray-900 px-4 py-3.5 transition-all hover:scale-[1.01] active:scale-[0.99] dark:bg-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative flex items-center justify-center gap-2 text-sm font-black transition-colors duration-500 group-hover:text-white dark:text-gray-900">
                      {confirmingDelivery ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <span>COMPLETE ORDER</span>
                          <svg className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Already Confirmed State */}
              {deliveryConfirmed && (
                <div className="text-center py-4 space-y-4 animate-in fade-in duration-1000">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Done!</h2>
                    <p className={`text-xs font-medium opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Delivery confirmed.
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
      {createPortal(
        <>
          {renderContent()}
          {showCameraCapture && (
            <CameraCapture
              isOpen={showCameraCapture}
              onClose={() => setShowCameraCapture(false)}
              onCapture={handlePhotoCapture}
              cameraType="environment"
              title="Delivery Proof Photo"
            />
          )}
        </>,
        document.body
      )}
    </>
  );
};

export default DeliveryConfirmationModal;
