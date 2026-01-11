"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Steps,
  Panel,
  Modal,
  Uploader,
  Loader,
  Tag,
  Divider,
  Checkbox,
  toaster,
  Notification,
  Input,
  Form,
  Message,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import ProductImageModal from "./ProductImageModal";
import QuantityConfirmationModal from "./QuantityConfirmationModal";
import PaymentModal from "./PaymentModal";
import DeliveryConfirmationModal from "./DeliveryConfirmationModal";
import InvoiceProofModal from "./InvoiceProofModal";
import { useChat } from "../../context/ChatContext";
import { isMobileDevice } from "../../lib/formatters";
import ShopperChatDrawer from "../chat/ShopperChatDrawer";
import {
  recordPaymentTransactions,
  generateInvoice,
} from "../../lib/walletTransactions";
import { useSession } from "next-auth/react";
import { useTheme } from "../../context/ThemeContext";

// Custom CSS for green steps
const greenStepsStyles = `
  .custom-steps-green .rs-steps-item-status-finish .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #10b981 !important;
    color: #10b981 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-finish .rs-steps-item-title {
    color: #10b981 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-process .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #10b981 !important;
    color: #10b981 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-process .rs-steps-item-title {
    color: #10b981 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #d1d5db !important;
    color: #9ca3af !important;
  }
  
  .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-title {
    color: #6b7280 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-finish .rs-steps-item-tail::after {
    background-color: #10b981 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-process .rs-steps-item-tail::after {
    background-color: #10b981 !important;
  }
  
  .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-tail::after {
    background-color: #e5e7eb !important;
  }
  
  /* Dark mode support */
  .dark .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #4b5563 !important;
    color: #6b7280 !important;
  }
  
  .dark .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-title {
    color: #9ca3af !important;
  }
  
  .dark .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-tail::after {
    background-color: #374151 !important;
  }
`;

// Define interfaces for the order data
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    final_price: string;
    measurement_unit?: string;
    ProductName?: {
      id: string;
      name: string;
      description: string;
      barcode: string;
      sku: string;
      image: string;
      create_at: string;
    };
  };
  found?: boolean;
  foundQuantity?: number;
}

interface OrderDetailsType {
  id: string;
  OrderID: string;
  placedAt: string;
  estimatedDelivery: string;
  deliveryNotes: string;
  total: number;
  serviceFee: string;
  deliveryFee: string;
  status: string;
  deliveryPhotoUrl: string;
  discount: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_picture: string;
  };
  orderedBy?: {
    created_at: string;
    email: string;
    gender: string;
    id: string;
    is_active: boolean;
    name: string;
    password_hash: string;
    phone: string;
    profile_picture: string;
    updated_at: string;
    role: string;
  };
  customerId?: string;
  shop?: {
    id: string;
    name: string;
    address: string;
    image: string;
    phone?: string;
    operating_hours?: any;
    latitude?: string;
    longitude?: string;
  };
  Order_Items?: OrderItem[];
  address: {
    id: string;
    street: string;
    city: string;
    postal_code: string;
    latitude: string;
    longitude: string;
    placeDetails?: any;
  };
  assignedTo: {
    id: string;
    name: string;
    profile_picture: string;
    orders: {
      aggregate: {
        count: number;
      };
    };
  };
  // Add order type and reel-specific fields
  orderType?: "regular" | "reel" | "restaurant";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
    restaurant_id?: string | null;
    user_id?: string | null;
    isRestaurantUserReel?: boolean;
    Restaurant?: {
      id: string;
      name: string;
      location: string;
      lat: number;
      long: number;
      phone?: string;
    };
    Shops?: {
      id: string;
      name: string;
      address: string;
      phone?: string;
    };
  };
  quantity?: number;
  deliveryNote?: string;
}

interface BatchDetailsProps {
  orderData: OrderDetailsType | null;
  error: string | null;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export default function BatchDetails({
  orderData,
  error,
  onUpdateStatus,
}: BatchDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    openChat,
    isDrawerOpen,
    closeChat,
    currentChatId,
    getMessages,
    sendMessage,
  } = useChat();
  const { theme } = useTheme();
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetailsType | null>(orderData);
  const [errorState, setErrorState] = useState<string | null>(error);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(
    null
  );
  const [currentOrderItem, setCurrentOrderItem] = useState<OrderItem | null>(
    null
  );
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null);
  const [foundQuantity, setFoundQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [momoCode, setMomoCode] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoiceProofModal, setShowInvoiceProofModal] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  const [currentStep, setCurrentStep] = useState(() => {
    if (!orderData) return 0;

    // For restaurant orders, skip the shopping step
    const isRestaurantOrder = orderData.orderType === "restaurant";
    // Skip shopping if EITHER restaurant_id OR user_id is not null
    const isRestaurantUserReel =
      orderData.reel?.restaurant_id || orderData.reel?.user_id;

    switch (orderData.status) {
      case "accepted":
        if (isRestaurantUserReel) {
          return 1; // Restaurant/user reels skip shopping and start at delivery step
        }
        return isRestaurantOrder ? 1 : 0; // Restaurant orders start at step 1 (delivery)
      case "shopping":
        return 1;
      case "on_the_way":
      case "at_customer":
        return isRestaurantOrder || isRestaurantUserReel ? 2 : 2; // Both types go to step 2
      case "delivered":
        return isRestaurantOrder || isRestaurantUserReel ? 3 : 3; // Both types end at step 3
      default:
        return 0;
    }
  });

  // Add useEffect to get current location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Fallback: Use a default location (Kigali, Rwanda)
          setCurrentLocation({
            lat: -1.9441,
            lng: 30.0619,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setCurrentLocation({
        lat: -1.9441,
        lng: 30.0619,
      });
    }
  }, []);

  // Inject custom styles for green steps
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = greenStepsStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch system configuration
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        if (response.ok) {
          const data = await response.json();
          setSystemConfig(data.config);
        }
      } catch (error) {
        // Error fetching system configuration
      }
    };

    fetchSystemConfig();
  }, []);

  // Function to generate directions URL with mobile app support
  const getDirectionsUrl = (
    destinationAddress: string,
    isMobile: boolean = false
  ) => {
    if (currentLocation) {
      if (isMobile) {
        // For mobile, try to open native map apps
        const encodedDestination = encodeURIComponent(destinationAddress);
        const origin = `${currentLocation.lat},${currentLocation.lng}`;

        // Try Apple Maps first (iOS), then Google Maps, then fallback to web
        if (
          navigator.userAgent.includes("iPhone") ||
          navigator.userAgent.includes("iPad")
        ) {
          return `http://maps.apple.com/?saddr=${origin}&daddr=${encodedDestination}`;
        } else {
          // For Android and other mobile devices, try Google Maps app
          return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}`;
        }
      } else {
        // For desktop, use web version
        return `https://www.google.com/maps/dir/?api=1&origin=${
          currentLocation.lat
        },${currentLocation.lng}&destination=${encodeURIComponent(
          destinationAddress
        )}`;
      }
    }
    // Fallback to just the destination if no current location
    if (isMobile) {
      const encodedDestination = encodeURIComponent(destinationAddress);
      if (
        navigator.userAgent.includes("iPhone") ||
        navigator.userAgent.includes("iPad")
      ) {
        return `http://maps.apple.com/?q=${encodedDestination}`;
      } else {
        return `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
      }
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destinationAddress
    )}`;
  };

  // Function to handle direction button click with mobile detection
  const handleDirectionsClick = (address: string) => {
    const isMobile = isMobileDevice();
    const directionsUrl = getDirectionsUrl(address, isMobile);

    if (isMobile) {
      // For mobile, try to open in app, fallback to web
      window.location.href = directionsUrl;
    } else {
      // For desktop, open in new tab
      window.open(directionsUrl, "_blank");
    }
  };

  // Function to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Function to get shop distance
  const getShopDistance = (): string | null => {
    if (!currentLocation || !order?.shop?.latitude || !order?.shop?.longitude) {
      return null;
    }

    const shopLat = parseFloat(order.shop.latitude);
    const shopLng = parseFloat(order.shop.longitude);

    if (isNaN(shopLat) || isNaN(shopLng)) {
      return null;
    }

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      shopLat,
      shopLng
    );

    return `${distance} km`;
  };

  // Generate a 5-digit OTP
  const generateOtp = () => {
    const randomOtp = Math.floor(10000 + Math.random() * 90000).toString();
    setGeneratedOtp(randomOtp);
    // Store in session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("payment_otp", randomOtp);
    }

    // Show as alert for demo purposes
    setTimeout(() => {
      alert(`For testing purposes, your OTP is: ${randomOtp}`);
    }, 500);
    return randomOtp;
  };

  // Function to generate a random private key
  const generatePrivateKey = () => {
    const randomKey = Math.random().toString(36).substring(2, 10);
    setPrivateKey(randomKey);
    // Store in session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("payment_private_key", randomKey);
    }

    return randomKey;
  };

  // Function to fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!session?.user?.id) return null;

    setWalletLoading(true);
    try {
      const response = await fetch(
        `/api/shopper/wallet?shopperId=${session.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const data = await response.json();
      setWalletData(data.wallet);
      return data.wallet;
    } catch (error) {
      // Error fetching wallet
      return null;
    } finally {
      setWalletLoading(false);
    }
  };

  // Function to generate and display invoice
  const generateAndShowInvoice = async (orderId: string): Promise<boolean> => {
    if (!orderId) return false;

    try {
      setInvoiceLoading(true);
      const invoice = await generateInvoice(orderId);

      if (!invoice) {
        throw new Error("No invoice data returned");
      }

      setInvoiceData(invoice);
      setShowInvoiceModal(true);
      return true;
    } catch (invoiceError) {
      // Error generating invoice
      toaster.push(
        <Notification type="warning" header="Invoice Warning" closable>
          {invoiceError instanceof Error
            ? invoiceError.message
            : "There was an issue generating the invoice."}
        </Notification>,
        { placement: "topEnd" }
      );
      return false;
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Function to generate invoice and save to database
  const generateInvoiceAndRedirect = async (orderId: string) => {
    try {
      setInvoiceLoading(true);

      const requestData = {
        orderId,
        orderType: orderData?.orderType || "regular", // Pass order type to API
      };

      // Generating invoice with data

      // Make API request to generate invoice and save to database
      const invoiceResponse = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Invoice response status

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        // Invoice generation failed
        throw new Error(
          `Failed to generate invoice: ${invoiceResponse.statusText}`
        );
      }

      const invoiceResult = await invoiceResponse.json();

      if (invoiceResult.success && invoiceResult.invoice) {
        setInvoiceData(invoiceResult.invoice);

        // Show the invoice modal
        setShowInvoiceModal(true);

        // User will navigate to the invoice page by clicking the "Check Invoice Details" button in the modal

        return true;
      } else {
        throw new Error("Invalid invoice data returned from API");
      }
    } catch (invoiceError) {
      // Error generating invoice
      toaster.push(
        <Notification type="warning" header="Invoice Warning" closable>
          {invoiceError instanceof Error
            ? invoiceError.message
            : "There was an issue generating the invoice."}
        </Notification>,
        { placement: "topEnd" }
      );
      return false;
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!order?.id) return;

    setPaymentLoading(true);
    try {
      // First check if there's enough balance in the wallet
      const wallet = await fetchWalletBalance();

      if (wallet) {
        const orderAmount = calculateFoundItemsTotal();
        const reservedBalance = parseFloat(wallet.reserved_balance);

        if (reservedBalance < orderAmount) {
          // Not enough balance, show error toast
          toaster.push(
            <Notification type="error" header="Insufficient Balance" closable>
              <p>
                Your reserved wallet balance ({formatCurrency(reservedBalance)})
                is insufficient for this order ({formatCurrency(orderAmount)}).
              </p>
              <p>Please raise a ticket to request a top-up on your wallet.</p>
            </Notification>,
            { placement: "topEnd", duration: 5000 }
          );
          setPaymentLoading(false);
          setShowPaymentModal(false);
          return;
        }
      }

      // If we have enough balance or couldn't check, proceed with OTP
      generateOtp();

      // Keep payment modal open - it will handle OTP step internally
      setPaymentLoading(false);
    } catch (err) {
      // Payment processing error
      toaster.push(
        <Notification type="error" header="Payment Failed" closable>
          {err instanceof Error
            ? err.message
            : "Failed to process payment. Please try again."}
        </Notification>,
        { placement: "topEnd" }
      );
      setPaymentLoading(false);
    }
  };

  // Function to show payment modal
  const handleShowPaymentModal = () => {
    // Generate a new private key when opening the modal
    generatePrivateKey();
    setShowPaymentModal(true);
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || !generatedOtp || !order?.id) return;

    setOtpVerifyLoading(true);
    try {
      // Verify OTP
      if (otp !== generatedOtp) {
        throw new Error("Invalid OTP. Please try again.");
      }

      // Get the actual order amount being processed
      const orderAmount = calculateFoundItemsTotal();
      // Get the original order total for refund calculation
      const originalOrderTotal = calculateOriginalSubtotal();

      // Initiate MoMo payment after OTP verification
      let momoPaymentSuccess = false;
      let momoReferenceId = "";
      try {
        // First, ensure we have a valid token
        const { momoTokenManager } = await import("../../lib/momoTokenManager");
        await momoTokenManager.getValidToken();

        const momoResponse = await fetch("/api/momo/transfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: orderAmount,
            currency: systemConfig?.currency || "RWF",
            payerNumber: momoCode,
            externalId: order.id || `SHOPPER-PAYMENT-${Date.now()}`,
            payerMessage: "Payment for Shopper Items",
            payeeNote: "Shopper payment confirmation",
          }),
        });

        const momoData = await momoResponse.json();
        momoReferenceId = momoData.referenceId;

        if (momoResponse.ok) {
          // Start polling for MoMo payment status
          const maxAttempts = 30; // Poll for up to 5 minutes (30 * 10 seconds)
          let attempts = 0;
          let paymentCompleted = false;

          // Poll for MoMo payment status
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
              await momoTokenManager.getValidToken();

              const statusResponse = await fetch(
                `/api/momo/status?referenceId=${momoData.referenceId}`
              );
              const statusData = await statusResponse.json();

              if (statusResponse.ok) {
                if (statusData.status === "SUCCESSFUL") {
                  momoPaymentSuccess = true;
                  toaster.push(
                    <Notification
                      type="success"
                      header="MoMo Payment Successful"
                      closable
                    >
                      Payment completed successfully via MoMo!
                    </Notification>,
                    { placement: "topEnd" }
                  );
                  break; // Exit the polling loop
                } else if (statusData.status === "FAILED") {
                  throw new Error("MoMo payment failed. Please try again.");
                } else if (statusData.status === "PENDING") {
                  // Continue polling
                  if (attempt < maxAttempts - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
                  } else {
                    throw new Error(
                      "MoMo payment timeout. Please check your phone or try again."
                    );
                  }
                }
              } else {
                throw new Error(statusData.error || "MoMo status check failed");
              }
            } catch (error) {
              // MoMo status polling error
              if (attempt === maxAttempts - 1) {
                throw error; // Re-throw on last attempt
              }
              await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait before retry
            }
          }

          if (!momoPaymentSuccess) {
            throw new Error("MoMo payment did not complete successfully");
          }
        } else {
          throw new Error(momoData.error || "MoMo payment initiation failed");
        }
      } catch (momoError) {
        // MoMo payment error
        toaster.push(
          <Notification type="error" header="MoMo Payment Failed" closable>
            {momoError instanceof Error
              ? momoError.message
              : "MoMo payment failed. Please try again."}
          </Notification>,
          { placement: "topEnd", duration: 5000 }
        );
        setOtpVerifyLoading(false);
        setShowPaymentModal(false); // Close payment modal on error
        return;
      }

      // Make API request to update wallet balance and process payment
      let paymentSuccess = false;
      let walletUpdated = false;
      try {
        const response = await fetch("/api/shopper/processPayment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            momoCode,
            privateKey,
            orderAmount: orderAmount, // Only the value of found items (no fees)
            originalOrderTotal: originalOrderTotal, // Original subtotal for refund calculation
            orderType: order.orderType || "regular", // Pass order type to API
            momoReferenceId: momoReferenceId, // Pass MoMo reference ID
            momoSuccess: momoPaymentSuccess, // Pass MoMo success status
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment processing failed");
        }

        const paymentData = await response.json();

        // Check if a refund was created
        if (paymentData.refund) {
          toaster.push(
            <Notification type="info" header="Refund Scheduled" closable>
              A refund of {formatCurrency(paymentData.refundAmount)} has been
              scheduled for items not found.
            </Notification>,
            { placement: "topEnd", duration: 5000 }
          );
        }

        paymentSuccess = true;
        walletUpdated = true;
      } catch (paymentError) {
        // Payment processing error
        // Show error and stop the flow
        toaster.push(
          <Notification type="error" header="Payment Failed" closable>
            {paymentError instanceof Error
              ? paymentError.message
              : "Payment processing failed. Please try again."}
          </Notification>,
          { placement: "topEnd", duration: 5000 }
        );
        setOtpVerifyLoading(false);
        setShowPaymentModal(false); // Close payment modal on error
        return;
      }

      // Close payment modal (which includes OTP step)
      setShowPaymentModal(false);

      // Only proceed with invoice proof if payment was successful
      if (paymentSuccess && walletUpdated) {
        // Clear payment info
        setMomoCode("");
        setPrivateKey("");
        setOtp("");
        setGeneratedOtp("");

        // Show invoice proof modal instead of updating status immediately
        setShowInvoiceProofModal(true);

        // Show success notification
        toaster.push(
          <Notification type="success" header="Payment Complete" closable>
            ✅ MoMo payment successful
            <br />
            ✅ Wallet balance updated
            <br />✅ Next: Add invoice proof
          </Notification>,
          { placement: "topEnd", duration: 5000 }
        );
      }
    } catch (err) {
      // OTP verification error
      toaster.push(
        <Notification type="error" header="Verification Failed" closable>
          {err instanceof Error
            ? err.message
            : "Failed to verify OTP. Please try again."}
        </Notification>,
        { placement: "topEnd" }
      );
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  // Handle restaurant delivery confirmation - show modal without updating status
  const handleRestaurantDeliveryConfirmation = () => {
    if (!order) return;

    console.log("🔍 [Restaurant Delivery] Order address data:", {
      fullAddress: order.address,
      placeDetails: order.address?.placeDetails,
    });

    // For restaurant orders, create minimal invoice data for delivery confirmation modal
    const restaurantOrder = order as any; // Type assertion for restaurant order fields
    const mockInvoiceData = {
      id: `restaurant_${order.id}_${Date.now()}`,
      invoiceNumber: `REST-${order.id.slice(-8)}-${new Date()
        .getTime()
        .toString()
        .slice(-6)}`,
      orderId: order.id,
      orderNumber: order.OrderID || order.id.slice(-8),
      customer: order.orderedBy?.name || "Restaurant Customer",
      customerEmail: order.orderedBy?.email || "",
      customerPhone: order.orderedBy?.phone || "",
      shop: restaurantOrder.Restaurant?.name || "Restaurant",
      shopAddress: restaurantOrder.Restaurant?.location || "",
      deliveryStreet: order.address?.street || "",
      deliveryCity: order.address?.city || "",
      deliveryPostalCode: order.address?.postal_code || "",
      deliveryPlaceDetails: order.address?.placeDetails || null,
      deliveryAddress: order.address ? `${order.address.street || ""}, ${order.address.city || ""}${order.address.postal_code ? `, ${order.address.postal_code}` : ""}` : "",
      dateCreated: new Date().toLocaleString(),
      dateCompleted: new Date().toLocaleString(),
      status: "delivered", // This will be updated after photo upload
      items: [],
      subtotal: 0,
      serviceFee: 0,
      deliveryFee: parseFloat(order.deliveryFee || "0"),
      total: parseFloat(order.deliveryFee || "0"),
      orderType: "restaurant",
      isReelOrder: false,
      isRestaurantOrder: true,
    };
    setInvoiceData(mockInvoiceData);
    setShowInvoiceModal(true);
  };

  // Handle restaurant/user reel delivery confirmation - show modal without generating invoice
  const handleReelDeliveryConfirmation = () => {
    if (!order) return;

    console.log("🔍 [Reel Delivery] Order address data:", {
      fullAddress: order.address,
      placeDetails: order.address?.placeDetails,
    });

    // For restaurant/user reel orders, create minimal invoice data for delivery confirmation modal
    const mockInvoiceData = {
      id: `reel_${order.id}_${Date.now()}`,
      invoiceNumber: `REEL-${order.id.slice(-8)}-${new Date()
        .getTime()
        .toString()
        .slice(-6)}`,
      orderId: order.id,
      orderNumber: order.OrderID || order.id.slice(-8),
      customer: order.orderedBy?.name || order.user?.name || "Reel Customer",
      customerEmail: order.orderedBy?.email || order.user?.email || "",
      customerPhone: order.orderedBy?.phone || order.user?.phone || "",
      shop: order.reel?.Restaurant?.name || "Restaurant/User Reel",
      shopAddress: order.reel?.Restaurant?.location || "From Restaurant/User",
      deliveryStreet: order.address?.street || "",
      deliveryCity: order.address?.city || "",
      deliveryPostalCode: order.address?.postal_code || "",
      deliveryPlaceDetails: order.address?.placeDetails || null,
      deliveryAddress: order.address ? `${order.address.street || ""}, ${order.address.city || ""}${order.address.postal_code ? `, ${order.address.postal_code}` : ""}` : "",
      dateCreated: new Date().toLocaleString(),
      dateCompleted: new Date().toLocaleString(),
      status: "delivered", // This will be updated after photo upload
      items: [],
      subtotal: parseFloat(order.reel?.Price || "0") * (order.quantity || 1),
      serviceFee: parseFloat(order.serviceFee || "0"),
      deliveryFee: parseFloat(order.deliveryFee || "0"),
      total: parseFloat(order.total?.toString() || "0"),
      orderType: "reel",
      isReelOrder: true,
      isRestaurantOrder: false,
    };
    setInvoiceData(mockInvoiceData);
    setShowInvoiceModal(true);
  };

  // NEW: Handle delivery confirmation button click - generates invoice first, then shows modal
  const handleDeliveryConfirmationClick = () => {
    if (!order?.id) return;

    const isRestaurantOrder = order?.orderType === "restaurant";
    const isRestaurantUserReel =
      order?.orderType === "reel" &&
      (order?.reel?.restaurant_id || order?.reel?.user_id);

    // For restaurant orders, show modal directly without generating invoice
    if (isRestaurantOrder) {
      handleRestaurantDeliveryConfirmation();
      return;
    }

    // For restaurant/user reel orders, show modal directly
    if (order?.orderType === "reel" && isRestaurantUserReel) {
      handleReelDeliveryConfirmation();
      return;
    }

    // For regular orders, invoice has already been generated during payment
    // Create invoice data for the modal display
    console.log("🔍 [Delivery Confirmation] Order address data:", {
      fullAddress: order.address,
      placeDetails: order.address?.placeDetails,
      street: order.address?.street,
      city: order.address?.city,
    });
    
    const mockInvoiceData = {
      id: `order_${order.id}_${Date.now()}`,
      invoiceNumber: order.OrderID || order.id.slice(-8),
      orderId: order.id,
      orderNumber: order.OrderID || order.id.slice(-8),
      customer: order.orderedBy?.name || order.user?.name || "Customer",
      customerEmail: order.orderedBy?.email || order.user?.email || "",
      customerPhone: order.orderedBy?.phone || order.user?.phone || "",
      shop: order.shop?.name || "Shop",
      shopAddress: order.shop?.address || "",
      deliveryStreet: order.address?.street || "",
      deliveryCity: order.address?.city || "",
      deliveryPostalCode: order.address?.postal_code || "",
      deliveryPlaceDetails: order.address?.placeDetails || null,
      deliveryAddress: order.address 
        ? `${order.address.street || ""}, ${order.address.city || ""}${order.address.postal_code ? `, ${order.address.postal_code}` : ""}` 
        : "",
      dateCreated: new Date().toLocaleString(),
      dateCompleted: new Date().toLocaleString(),
      status: "delivered",
      items: order.Order_Items?.map((item: any) => ({
        id: item.id,
        name: item.product?.ProductName?.name || item.product?.name || "Item",
        quantity: item.foundQuantity || item.quantity || 0,
        unitPrice: parseFloat(item.product?.price || item.price || "0"),
        total: (item.foundQuantity || item.quantity || 0) * parseFloat(item.product?.price || item.price || "0"),
        unit: item.product?.measurement_unit || "unit",
      })) || [],
      subtotal: parseFloat(order.total?.toString() || "0") - parseFloat(order.serviceFee || "0") - parseFloat(order.deliveryFee || "0"),
      serviceFee: parseFloat(order.serviceFee || "0"),
      deliveryFee: parseFloat(order.deliveryFee || "0"),
      total: parseFloat(order.total?.toString() || "0"),
      orderType: order.orderType || "regular",
      isReelOrder: order.orderType === "reel",
      isRestaurantOrder: false,
    };
    
    setInvoiceData(mockInvoiceData);
    setShowInvoiceModal(true);
  };

  // Handle invoice proof captured - generates invoice and updates status to on_the_way
  const handleInvoiceProofCaptured = async (imageDataUrl: string) => {
    if (!order?.id) return;

    try {
      setLoading(true);

      // Generate invoice with proof photo
      const invoiceResponse = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          orderType: order?.orderType || "regular",
          invoiceProofPhoto: imageDataUrl, // Send the invoice proof photo
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error("Failed to generate invoice with proof");
      }

      const invoiceResult = await invoiceResponse.json();

      if (!invoiceResult.success || !invoiceResult.invoice) {
        throw new Error("Invalid invoice data returned from API");
      }

      // Close invoice proof modal
      setShowInvoiceProofModal(false);

      // Update order status to on_the_way
      await onUpdateStatus(order.id, "on_the_way");

      // Update local state
      setOrder({
        ...order,
        status: "on_the_way",
      });

      // Update step
      setCurrentStep(2);

      // Notify customer that shopper is on the way
      try {
        await fetch("/api/fcm/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: order.orderedBy?.id || order.customerId,
            senderName: session?.user?.name || "Your Shopper",
            message: "Plasa is on the way",
            orderId: order.id,
            conversationId: order.id,
          }),
        });
      } catch (notificationError) {
        // Error sending on-the-way notification
        console.error("Error sending notification:", notificationError);
      }

      // Show success notification
      toaster.push(
        <Notification type="success" header="Success" closable>
          Invoice generated and you're now on the way!
        </Notification>,
        { placement: "topEnd" }
      );
    } catch (error) {
      console.error("Error processing invoice proof:", error);
      toaster.push(
        <Notification type="error" header="Error" closable>
          {error instanceof Error
            ? error.message
            : "Failed to process invoice proof. Please try again."}
        </Notification>,
        { placement: "topEnd" }
      );
      throw error; // Rethrow to let modal handle it
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order?.id || loading) return; // Prevent multiple calls while loading

    // For the "on_the_way" status, we'll show the payment modal instead of immediately updating
    // BUT skip payment modal for restaurant orders and restaurant/user reels since they don't require payment processing
    // Skip shopping if EITHER restaurant_id OR user_id is not null
    const isRestaurantUserReel =
      order?.reel?.restaurant_id || order?.reel?.user_id;
    const isRestaurantOrder = order?.orderType === "restaurant";

    if (
      newStatus === "on_the_way" &&
      !showPaymentModal &&
      !isRestaurantOrder &&
      !isRestaurantUserReel
    ) {
      handleShowPaymentModal();
      return;
    }

    try {
      setLoading(true);
      await onUpdateStatus(order.id, newStatus);

      // Update local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus,
        });
      }

      // Update step
      const isRestaurantOrder = order?.orderType === "restaurant";
      // Skip shopping if EITHER restaurant_id OR user_id is not null
      const isRestaurantUserReel =
        order?.reel?.restaurant_id || order?.reel?.user_id;
      switch (newStatus) {
        case "accepted":
          if (isRestaurantUserReel) {
            setCurrentStep(1); // Restaurant/user reels skip shopping
          } else {
            setCurrentStep(isRestaurantOrder ? 1 : 0);
          }
          break;
        case "shopping":
          setCurrentStep(1);
          break;
        case "on_the_way":
        case "at_customer":
          setCurrentStep(2);
          break;
        case "delivered":
          setCurrentStep(3);
          // Close chat drawer if open when order is delivered
          if (isDrawerOpen && currentChatId === order.id) {
            closeChat();
          }

          // NOTE: Invoice generation and modal display is now handled by handleDeliveryConfirmationClick
          // This case is only reached when the modal confirms delivery (updating the status from the modal)
          // So we don't need to generate invoice or show modal here anymore
          
          // Show success notification when order is delivered
          toaster.push(
            <Notification type="success" header="Order Delivered" closable>
              Order has been successfully marked as delivered!
            </Notification>,
            { placement: "topEnd" }
          );
          break;
      }
    } catch (err) {
      // Error updating order status
      // Display toast notification for error
      toaster.push(
        <Notification type="error" header="Update Failed" closable>
          {err instanceof Error
            ? `Failed to update status: ${err.message}`
            : "Failed to update order status. Please try again."}
        </Notification>,
        { placement: "topEnd" }
      );

      // Also set the error state for display in the UI
      setErrorState(
        err instanceof Error
          ? `Failed to update status: ${err.message}`
          : "Failed to update order status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to show product image in modal
  const showProductImage = (item: OrderItem) => {
    setSelectedImage(
      item.product.ProductName?.image ||
        item.product.image ||
        "/images/groceryPlaceholder.png"
    );
    setSelectedProductName(item.product.ProductName?.name || "Unknown Product");
    setCurrentOrderItem(item);
    setShowImageModal(true);
  };

  // Function to mark an item as found/not found
  const toggleItemFound = (item: OrderItem, found: boolean) => {
    if (!order) return;

    if (found && item.quantity > 1) {
      // Open quantity modal for multi-quantity items
      setCurrentItem(item);
      setFoundQuantity(item.quantity); // Default to the full requested quantity
      setShowQuantityModal(true);
    } else {
      // For single quantity items or unmarking as found, update directly
      updateItemFoundStatus(item.id, found, found ? item.quantity : 0);
    }
  };

  // New function to update found status with a specific quantity
  const updateItemFoundStatus = (
    itemId: string,
    found: boolean,
    foundQty: number = 0
  ) => {
    if (!order) return;

    const updatedItems = order.Order_Items?.map((item) =>
      item.id === itemId
        ? {
            ...item,
            found,
            foundQuantity: found ? foundQty : 0,
          }
        : item
    );

    setOrder({
      ...order,
      Order_Items: updatedItems,
    });
  };

  // Function to confirm found quantity
  const confirmFoundQuantity = () => {
    if (!currentItem) return;

    // Ensure found quantity never exceeds ordered quantity
    const validQuantity = Math.min(foundQuantity, currentItem.quantity);

    updateItemFoundStatus(currentItem.id, true, validQuantity);
    setShowQuantityModal(false);
    setCurrentItem(null);
  };

  // Calculate found items total
  const calculateFoundTotal = () => {
    if (!order) return 0;

    // For reel orders, return the total since there's only one item
    if (order.orderType === "reel") {
      return order.total;
    }

    // For regular orders, calculate based on found items
    if (!order.Order_Items) return 0;

    const total = order.Order_Items.filter((item) => item.found).reduce(
      (total, item) => {
        // Use foundQuantity if available, otherwise use full quantity
        const quantity =
          item.foundQuantity !== undefined ? item.foundQuantity : item.quantity;

        // Convert to number and ensure price is properly parsed
        const itemPrice =
          typeof item.price === "string"
            ? parseFloat(item.price)
            : Number(item.price);

        // Calculate subtotal for this item
        const itemTotal = itemPrice * quantity;

        return total + itemTotal;
      },
      0
    );

    // Round to 2 decimal places to avoid floating point issues
    return parseFloat(total.toFixed(2));
  };

  // Calculate original subtotal (items only, no fees)
  const calculateOriginalSubtotal = () => {
    if (!order) return 0;

    // For reel orders, calculate based on reel price and quantity
    if (order.orderType === "reel") {
      const basePrice = parseFloat(order.reel?.Price || "0");
      const quantity = order.quantity || 1;
      return basePrice * quantity;
    }

    // For regular orders, calculate based on order items
    if (!order.Order_Items) return 0;

    return order.Order_Items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Calculate tax amount (tax is included in the total, not added on top)
  const calculateTax = (totalAmount: number) => {
    if (!systemConfig?.tax) return 0;
    const taxRate = parseFloat(systemConfig.tax) / 100; // Convert percentage to decimal
    // If tax is included, we calculate: totalAmount * (taxRate / (1 + taxRate))
    return totalAmount * (taxRate / (1 + taxRate));
  };

  // Calculate the true total (subtotal + fees + tax)
  const calculateTrueTotal = () => {
    const subtotal = calculateOriginalSubtotal();
    const serviceFee = parseFloat(order?.serviceFee || "0");
    const deliveryFee = parseFloat(order?.deliveryFee || "0");
    // Tax is already included in the order total, so we don't add it again
    return subtotal + serviceFee + deliveryFee;
  };

  // Calculate the true total based on found items (for shopping mode)
  const calculateFoundItemsTotal = () => {
    // For reel orders, return the total since there's only one item
    if (order?.orderType === "reel") {
      return order.total;
    }

    // For regular orders, return the found items total
    const foundTotal = calculateFoundTotal();
    return foundTotal;
  };

  // Determine if we should show order items and summary
  const shouldShowOrderDetails = () => {
    if (!order) return false;
    // For reel orders, always show details
    if (order.orderType === "reel") return true;
    // For regular orders, show details for all statuses except delivered
    return order.status !== "delivered";
  };

  // Function to get the right action button based on current status
  const getActionButton = () => {
    if (!order) return null;

    const isRestaurantOrder = order.orderType === "restaurant";
    // Skip shopping if EITHER restaurant_id OR user_id is not null
    const isRestaurantUserReel =
      order.reel?.restaurant_id || order.reel?.user_id;

    switch (order.status) {
      case "accepted":
        return (
          <Button
            appearance="primary"
            color="green"
            size="lg"
            block
            onClick={() => {
              if (order.orderType === "reel" && isRestaurantUserReel) {
                // Skip shopping and go straight to delivery for restaurant/user reels
                handleUpdateStatus("on_the_way");
              } else {
                handleUpdateStatus(
                  isRestaurantOrder ? "on_the_way" : "shopping"
                );
              }
            }}
            loading={loading}
            className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
          >
            {order.orderType === "reel" && isRestaurantUserReel
              ? "Start Delivery"
              : isRestaurantOrder
              ? "Start Delivery"
              : "Start Shopping"}
          </Button>
        );
      case "shopping":
        // For restaurant/user reel orders, they shouldn't be in shopping status
        // For regular reel orders, no need to check found items since there's only one item
        if (order.orderType === "reel") {
          if (isRestaurantUserReel) {
            // This shouldn't happen, but handle gracefully
            return (
              <Button
                appearance="primary"
                color="green"
                size="lg"
                block
                onClick={() => handleUpdateStatus("on_the_way")}
                loading={loading}
                className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
              >
                Complete Delivery
              </Button>
            );
          } else {
            return (
              <Button
                appearance="primary"
                color="green"
                size="lg"
                block
                onClick={() => handleUpdateStatus("on_the_way")}
                loading={loading}
                className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
              >
                Make Payment
              </Button>
            );
          }
        }

        // For regular orders, check if any items are marked as found
        const hasFoundItems =
          order.Order_Items?.some((item) => item.found) || false;

        return (
          <Button
            appearance="primary"
            color="green"
            size="lg"
            block
            onClick={() => handleUpdateStatus("on_the_way")}
            loading={loading}
            disabled={!hasFoundItems}
            className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
          >
            {hasFoundItems ? "Make Payment" : "Mark Items as Found to Continue"}
          </Button>
        );
      case "on_the_way":
      case "at_customer":
        return (
          <Button
            appearance="primary"
            color="green"
            size="lg"
            block
            onClick={handleDeliveryConfirmationClick}
            className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
          >
            Confirm Delivery
          </Button>
        );
      case "delivered":
        // No button for delivered status
        return null;
      default:
        return null;
    }
  };

  // Function to handle chat button click
  const handleChatClick = () => {
    if (!order) return;

    // Type assertion to access the new fields
    const orderWithNewFields = order as OrderDetailsType & {
      customerId?: string;
      orderedBy?: {
        id: string;
        name: string;
        profile_picture: string;
      };
    };

    const customerId =
      orderWithNewFields.customerId || orderWithNewFields.orderedBy?.id;
    if (!customerId) {
      // Cannot start chat - missing customer data
      if (typeof window !== "undefined") {
        alert(
          "Cannot start chat: Customer information is missing. Please refresh the page and try again."
        );
      }
      return;
    }

    // Opening chat

    openChat(
      order.id,
      customerId, // We already validated this exists above
      orderWithNewFields.orderedBy?.name || order.user?.name || "Customer",
      orderWithNewFields.orderedBy?.profile_picture ||
        order.user?.profile_picture
    );

    // If on mobile, navigate to chat page
    if (isMobileDevice()) {
      router.push(`/Plasa/chat/${order.id}`);
    }
  };

  // Function to handle sending a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !order?.id) return;

    try {
      setIsSending(true);
      await sendMessage(order.id, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      // Error sending message
    } finally {
      setIsSending(false);
    }
  };

  // Function to handle shopper arrived notification
  const handleShopperArrived = async () => {
    if (!order?.id || loading) return;

    try {
      setLoading(true);

      // Send notification to customer
      const response = await fetch("/api/fcm/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: order.orderedBy?.id || order.customerId,
          senderName: session?.user?.name || "Your Shopper",
          message: "Plasa has arrived",
          orderId: order.id,
          conversationId: order.id, // Using order ID as conversation ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      // Show success notification
      toaster.push(
        <Notification type="success" header="Customer Notified" closable>
          Customer has been notified that you have arrived!
        </Notification>,
        { placement: "topEnd" }
      );
    } catch (error) {
      // Error sending shopper arrived notification
      toaster.push(
        <Notification type="error" header="Notification Failed" closable>
          Failed to notify customer. Please try again.
        </Notification>,
        { placement: "topEnd" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status tag with appropriate color
  const getStatusTag = (status: string) => {
    const isReelOrder = order?.orderType === "reel";

    switch (status) {
      case "accepted":
        return <Tag color={isReelOrder ? "violet" : "blue"}>Accepted</Tag>;
      case "shopping":
        return <Tag color={isReelOrder ? "violet" : "orange"}>Shopping</Tag>;
      case "on_the_way":
      case "at_customer":
        return <Tag color={isReelOrder ? "violet" : "violet"}>On The Way</Tag>;
      case "delivered":
        return <Tag color={isReelOrder ? "violet" : "green"}>Delivered</Tag>;
      default:
        return <Tag color={isReelOrder ? "violet" : "cyan"}>{status}</Tag>;
    }
  };

  // Fetch complete order data when component mounts
  useEffect(() => {
    if (order?.id) {
      // Initial order data from SSR

      // Fetching order details for ID

      fetch(`/api/shopper/orderDetails?id=${order.id}`)
        .then((res) => {
          // API response status
          return res.json();
        })
        .then((data) => {
          // API response data

          if (data.order) {
            // Transform the API response to match BatchDetails expected structure
            const transformedOrder = {
              ...data.order,
              // Convert items array to Order_Items structure
              Order_Items:
                data.order.items?.map((item: any) => ({
                  id: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  product: {
                    id: item.id, // Use item id as product id
                    name: item.name,
                    image:
                      item.productImage || "/images/groceryPlaceholder.png",
                    final_price: item.price.toString(),
                    measurement_unit: item.measurement_unit, // Add measurement_unit from API
                    ProductName: {
                      id: item.id,
                      name: item.name,
                      description: "",
                      barcode: item.barcode || "",
                      sku: item.sku || "",
                      image:
                        item.productImage || "/images/groceryPlaceholder.png",
                      create_at: new Date().toISOString(),
                    },
                  },
                })) || [],
            };

            // Transformed order

            setOrder(transformedOrder);
          } else {
            // No order data in response
          }
        })
        .catch((err) => {
          // Error fetching order details
        });
    }
  }, [order?.id, session?.user?.id]);

  if (loading && !order) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader size="lg" content="Processing..." />
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="p-4">
        <Panel bordered header="Error" shaded>
          <p className="text-red-600">{errorState}</p>
          <Button appearance="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </Panel>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <Panel bordered header="Order Not Found" shaded>
          <p>
            The order you&#39;re looking for doesn&#39;t exist or you don&#39;t
            have permission to view it.
          </p>
          <Button appearance="primary" onClick={() => router.push("/Plasa")}>
            Go to Dashboard
          </Button>
        </Panel>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Product Image Modal */}
      <ProductImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        selectedImage={selectedImage}
        selectedProductName={selectedProductName}
        currentOrderItem={currentOrderItem}
      />

      {/* Quantity Confirmation Modal */}
      <QuantityConfirmationModal
        open={showQuantityModal}
        onClose={() => setShowQuantityModal(false)}
        currentItem={currentItem}
        foundQuantity={foundQuantity}
        setFoundQuantity={setFoundQuantity}
        onConfirm={confirmFoundQuantity}
      />

      {/* Integrated Payment & OTP Modal */}
      <PaymentModal
        key={`payment-modal-${order?.id}-${showPaymentModal}`}
        open={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          // Reset payment state when modal is closed
          setMomoCode("");
          setPrivateKey("");
          setOtp("");
          setGeneratedOtp("");
        }}
        onSubmit={handlePaymentSubmit}
        momoCode={momoCode}
        setMomoCode={setMomoCode}
        privateKey={privateKey}
        orderAmount={calculateFoundItemsTotal()}
        serviceFee={parseFloat(order?.serviceFee || "0")}
        deliveryFee={parseFloat(order?.deliveryFee || "0")}
        paymentLoading={paymentLoading}
        externalId={order?.id}
        otp={otp}
        setOtp={setOtp}
        otpLoading={otpVerifyLoading}
        onVerifyOtp={handleVerifyOtp}
        generatedOtp={generatedOtp}
      />

      {/* Invoice Proof Modal */}
      <InvoiceProofModal
        open={showInvoiceProofModal}
        onClose={() => setShowInvoiceProofModal(false)}
        onProofCaptured={handleInvoiceProofCaptured}
        orderId={order?.id || ""}
        orderNumber={order?.OrderID || order?.id.slice(-8) || ""}
      />

      {/* Delivery Confirmation Modal */}
      <DeliveryConfirmationModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceData={invoiceData}
        loading={invoiceLoading}
        orderType={order?.orderType || "regular"}
      />

      {/* Shopper Chat Drawer - will only show on desktop when chat is open */}
      {isDrawerOpen &&
        currentChatId === order?.id &&
        order.status !== "delivered" && (
          <ShopperChatDrawer
            orderId={order.id}
            customer={{
              id: order.orderedBy?.id || order.customerId || "",
              name: order.orderedBy?.name || order.user?.name || "Customer",
              avatar:
                order.orderedBy?.profile_picture ||
                order.user?.profile_picture ||
                "/images/userProfile.png",
              phone: order.orderedBy?.phone || order.user?.phone,
            }}
            isOpen={isDrawerOpen}
            onClose={closeChat}
          />
        )}

      {/* Main Content */}
      <main className="mx-auto w-full p-2 pb-20 sm:p-6 sm:pb-6">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:rounded-2xl sm:shadow-xl">
          {/* Header with gradient background */}
          <div className={`p-4 text-gray-900 dark:text-gray-100 sm:p-6`}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  appearance="link"
                  onClick={() => router.back()}
                  className="flex items-center px-0 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 sm:text-base"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 sm:h-6"></div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                  {order.orderType === "reel" ? "Reel Batch" : "Regular Batch"}{" "}
                  #{order.OrderID || order.id.slice(0, 8)}
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {getStatusTag(order.status)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 p-3 sm:space-y-8 sm:p-8">
            {/* Order Progress Steps - Hidden on Mobile */}
            <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 sm:block sm:p-6">
              <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                <span className="inline-block rounded-full bg-blue-100 p-1.5 sm:p-2">
                  <svg
                    className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                  Order Progress
                </h2>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700 sm:p-6">
                <Steps current={currentStep} className="custom-steps-green">
                  <Steps.Item
                    title="Order Accepted"
                    description="Order has been assigned to you"
                    status={currentStep >= 0 ? "finish" : "wait"}
                  />
                  {!(
                    order?.reel?.restaurant_id ||
                    order?.reel?.user_id ||
                    order?.orderType === "restaurant"
                  ) && (
                    <Steps.Item
                      title="Shopping"
                      description="Collecting items from the store"
                      status={currentStep >= 1 ? "finish" : "wait"}
                    />
                  )}
                  <Steps.Item
                    title="On The Way"
                    description="Delivering to customer"
                    status={currentStep >= 2 ? "finish" : "wait"}
                  />
                  <Steps.Item
                    title="Delivered"
                    description="Order completed successfully"
                    status={currentStep >= 3 ? "finish" : "wait"}
                  />
                </Steps>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-2">
              {/* Shop/Reel Info */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <span
                    className={`inline-block rounded-full p-1.5 sm:p-2 ${
                      order.orderType === "reel"
                        ? "bg-indigo-100"
                        : "bg-emerald-100"
                    }`}
                  >
                    {order.orderType === "reel" ? (
                      <svg
                        className="h-4 w-4 text-indigo-600 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 016 17.618V19a2 2 0 002 2h8a2 2 0 002-2v-1.382a2 2 0 00-.447-1.342L15 14z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                        />
                      </svg>
                    )}
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                    {order.orderType === "reel"
                      ? "Reel Details"
                      : "Shop Details"}
                  </h2>
                </div>

                {order.orderType === "reel" ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                      <div className="relative mx-auto h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:mx-0 sm:h-20 sm:w-20">
                        {order.reel?.video_url ? (
                          <video
                            src={order.reel.video_url}
                            className="h-full w-full object-cover"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-300">
                            <svg
                              className="h-6 w-6 text-slate-400 sm:h-8 sm:w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M14.828 14.828a4 4 0 01-5.656 0" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                          {order.reel?.title}
                        </h3>
                        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                          {order.reel?.description}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-sm sm:justify-start sm:gap-4 sm:text-base">
                          <span className="text-slate-500">
                            Type: {order.reel?.type}
                          </span>
                          <span className="text-slate-500">
                            Qty: {order.quantity}
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {formatCurrency(
                              parseFloat(order.reel?.Price || "0")
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Show Restaurant or Shop information based on what's available */}
                    {(order.reel?.Restaurant || order.reel?.Shops) && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                        {order.reel?.Restaurant ? (
                          <>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
                              {order.reel.Restaurant.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {order.reel.Restaurant.location}
                            </p>
                            {order.reel.Restaurant.phone && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                📞 {order.reel.Restaurant.phone}
                              </p>
                            )}
                          </>
                        ) : order.reel?.Shops ? (
                          <>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
                              {order.reel.Shops.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {order.reel.Shops.address}
                            </p>
                            {order.reel.Shops.phone && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                📞 {order.reel.Shops.phone}
                              </p>
                            )}
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                      <div className="relative mx-auto h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:mx-0 sm:h-16 sm:w-16">
                        {order.shop?.image ? (
                          <Image
                            src={order.shop.image}
                            alt={order.shop.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-400">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-5 w-5 sm:h-6 sm:w-6"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M16 8h.01M8 16h.01M16 16h.01" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                          {order.shop?.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                          {order.shop?.address}
                        </p>
                      </div>
                    </div>

                    {/* Shop Contact Information */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700 sm:p-4">
                      <div className="space-y-2 text-sm sm:text-base">
                        {/* Phone Number */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-slate-600 dark:text-slate-400">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Phone
                          </span>
                          {order.shop?.phone ? (
                            <a
                              href={`tel:${order.shop.phone}`}
                              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            >
                              {order.shop.phone}
                            </a>
                          ) : (
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              N/A
                            </span>
                          )}
                        </div>

                        {/* Operating Hours */}
                        {order.shop?.operating_hours && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-slate-600 dark:text-slate-400">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="mr-2 h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12,6 12,12 16,14" />
                              </svg>
                              Hours
                            </span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {(() => {
                                const hoursObj = order.shop.operating_hours;
                                if (hoursObj && typeof hoursObj === "object") {
                                  const now = new Date();
                                  const dayKey = now
                                    .toLocaleDateString("en-US", {
                                      weekday: "long",
                                    })
                                    .toLowerCase();
                                  const todaysHours = (hoursObj as any)[dayKey];
                                  if (todaysHours) {
                                    return todaysHours;
                                  }
                                }
                                return "Check store for hours";
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shop Directions Button */}
                    {order.shop?.address && (
                      <div className="flex justify-center sm:justify-start">
                        <button
                          className="flex items-center rounded-full border border-green-400 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-sm"
                          onClick={() =>
                            handleDirectionsClick(order.shop?.address || "")
                          }
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mr-1 h-4 w-4 sm:h-5 sm:w-5"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          Directions to Shop
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <span className="inline-block rounded-full bg-sky-100 p-1.5 sm:p-2">
                    <svg
                      className="h-4 w-4 text-sky-600 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                    Customer
                  </h2>
                </div>

                <div className="mb-3 flex flex-col items-center gap-3 sm:mb-4 sm:flex-row sm:items-start">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200 sm:h-12 sm:w-12">
                    <Image
                      src={
                        (order as any).orderedBy?.profile_picture ||
                        order.user?.profile_picture ||
                        "/images/userProfile.png"
                      }
                      alt={
                        (order as any).orderedBy?.name ||
                        order.user?.name ||
                        "Customer"
                      }
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 sm:text-lg">
                      {(order as any).orderedBy?.name ||
                        order.user?.name ||
                        "Unknown Customer"}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                      {(order as any).orderedBy?.phone ||
                        order.user?.phone ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                    <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Delivery Address
                    </p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 sm:text-base">
                      {order.address?.street || "No street"},{" "}
                      {order.address?.city || "No city"}
                      {order.address?.postal_code
                        ? `, ${order.address.postal_code}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button
                      className="flex items-center rounded-full border border-green-400 px-3 py-1.5 text-xs text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-sm"
                      onClick={() =>
                        handleDirectionsClick(
                          `${order.address?.street || "No street"}, ${
                            order.address?.city || "No city"
                          }${
                            order.address?.postal_code
                              ? `, ${order.address.postal_code}`
                              : ""
                          }`
                        )
                      }
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-1 h-4 w-4 sm:h-5 sm:w-5"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Directions to Customer
                    </button>

                    {((order as any).orderedBy?.phone || order.user?.phone) && (
                      <button
                        className="flex items-center rounded-full border border-green-400 px-3 py-1.5 text-xs text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-sm"
                        onClick={() =>
                          (window.location.href = `tel:${
                            (order as any).orderedBy?.phone || order.user?.phone
                          }`)
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-1 h-4 w-4 sm:h-5 sm:w-5"
                        >
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Customer
                      </button>
                    )}

                    {order.status !== "delivered" ? (
                      <button
                        className="flex items-center rounded-full border border-green-400 px-3 py-1.5 text-xs text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-sm"
                        onClick={handleChatClick}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-1 h-4 w-4 sm:h-5 sm:w-5"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Message
                      </button>
                    ) : (
                      <button
                        className="flex cursor-not-allowed items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-400 dark:border-slate-600 sm:text-sm"
                        disabled
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-1 h-4 w-4 sm:h-5 sm:w-5"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Chat Closed
                      </button>
                    )}

                    {/* Shopper Arrived Button - Only show when delivering */}
                    {(order.status === "on_the_way" ||
                      order.status === "at_customer") && (
                      <button
                        className="flex items-center rounded-full border border-blue-400 px-3 py-1.5 text-xs text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-700 dark:text-blue-400 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 sm:text-sm"
                        onClick={handleShopperArrived}
                        disabled={loading}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-1 h-4 w-4 sm:h-5 sm:w-5"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {loading ? "Notifying..." : "Notify the Customer"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {shouldShowOrderDetails() && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <span
                    className={`inline-block rounded-full p-1.5 sm:p-2 ${
                      order.orderType === "reel"
                        ? "bg-indigo-100"
                        : "bg-emerald-100"
                    }`}
                  >
                    <svg
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        order.orderType === "reel"
                          ? "text-indigo-600"
                          : "text-emerald-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                    {order.orderType === "reel"
                      ? "Reel Details"
                      : "Order Items"}
                  </h2>
                </div>

                {order.orderType === "reel" ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700 sm:p-4">
                    <div className="mb-2 text-base text-slate-700 dark:text-slate-200 sm:text-lg">
                      {order.reel?.Product}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                      Quantity: {order.quantity}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {order.Order_Items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-600 dark:bg-slate-700 sm:gap-3 sm:p-4"
                      >
                        <div
                          className="h-8 w-8 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg sm:h-12 sm:w-12"
                          onClick={() => showProductImage(item)}
                        >
                          <Image
                            src={
                              item.product.ProductName?.image ||
                              item.product.image ||
                              "/images/groceryPlaceholder.png"
                            }
                            alt={
                              item.product.ProductName?.name ||
                              "Unknown Product"
                            }
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/groceryPlaceholder.png";
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-base sm:text-sm">
                            {item.product.ProductName?.name ||
                              "Unknown Product"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                            {formatCurrency(item.price)} × {item.quantity}{" "}
                            {(item.product as any).measurement_unit || "each"}
                          </p>
                          {item.found &&
                            item.foundQuantity &&
                            item.foundQuantity < item.quantity && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                Found: {item.foundQuantity} of {item.quantity}
                              </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 sm:text-base sm:text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          {order.status === "shopping" && (
                            <button
                              onClick={() => toggleItemFound(item, !item.found)}
                              className={`group relative flex items-center gap-1 overflow-hidden whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-300 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-xs ${
                                item.found
                                  ? "border-2 border-emerald-300 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 shadow-lg shadow-emerald-200/50 hover:scale-105 hover:shadow-emerald-300/60 dark:border-emerald-600 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-200 dark:shadow-emerald-800/30"
                                  : "border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 shadow-md shadow-slate-200/30 hover:scale-105 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-slate-300/50 dark:border-slate-600 dark:from-slate-700 dark:to-gray-700 dark:text-slate-300 dark:shadow-slate-800/30 dark:hover:border-blue-500 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 dark:hover:text-blue-200"
                              }`}
                            >
                              {/* Ripple effect overlay */}
                              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-150 group-active:opacity-100 dark:bg-white/10"></div>
                              <div
                                className={`relative transition-all duration-300 ${
                                  item.found
                                    ? "scale-110"
                                    : "scale-100 group-hover:scale-110"
                                }`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className={`h-2.5 w-2.5 transition-all duration-300 sm:h-3 sm:w-3 ${
                                    item.found
                                      ? "text-emerald-600 dark:text-emerald-300"
                                      : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
                                  }`}
                                >
                                  {item.found ? (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                      className="animate-pulse"
                                    />
                                  ) : (
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                      className="group-hover:animate-pulse"
                                    />
                                  )}
                                </svg>
                                {item.found && (
                                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200/50 dark:bg-emerald-800/50"></div>
                                )}
                              </div>
                              <span
                                className={`relative z-10 transition-all duration-300 ${
                                  item.found
                                    ? "font-bold"
                                    : "font-semibold group-hover:font-bold"
                                }`}
                              >
                                {item.found ? "✓ Found" : "Mark Found"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            {shouldShowOrderDetails() && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <span className="inline-block rounded-full bg-slate-100 p-1.5 sm:p-2">
                    <svg
                      className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                    Order Summary
                  </h2>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700 sm:p-4">
                  <div className="space-y-2 text-base sm:text-lg">
                    {order.orderType === "reel" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Base Price</span>
                          <span>
                            {formatCurrency(
                              parseFloat(order.reel?.Price || "0")
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity</span>
                          <span>{order.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>
                            {formatCurrency(
                              parseFloat(order.reel?.Price || "0") *
                                (order.quantity || 1)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Fee</span>
                          <span>
                            {formatCurrency(
                              parseFloat(order.serviceFee || "0")
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span>
                            {formatCurrency(
                              parseFloat(order.deliveryFee || "0")
                            )}
                          </span>
                        </div>
                        {systemConfig?.tax && (
                          <div className="flex justify-between">
                            <span>Tax ({systemConfig.tax}%)</span>
                            <span>
                              {formatCurrency(
                                calculateTax(calculateOriginalSubtotal())
                              )}
                            </span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <Divider />
                        <div className="flex justify-between text-lg font-bold sm:text-xl">
                          <span>Order Total (excluding fees)</span>
                          <span>
                            {formatCurrency(
                              parseFloat(order.reel?.Price || "0") *
                                (order.quantity || 1)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                          <span>Total with fees</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>
                            {formatCurrency(calculateOriginalSubtotal())}
                          </span>
                        </div>

                        {order.status === "shopping" ? (
                          <>
                            <div className="flex justify-between">
                              <span>Items Found</span>
                              <span>
                                {order.Order_Items?.filter((item) => item.found)
                                  .length || 0}{" "}
                                of {order.Order_Items?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Units Found</span>
                              <span>
                                {order.Order_Items?.reduce((total, item) => {
                                  if (item.found) {
                                    return (
                                      total +
                                      (item.foundQuantity || item.quantity)
                                    );
                                  }
                                  return total;
                                }, 0) || 0}{" "}
                                of{" "}
                                {order.Order_Items?.reduce(
                                  (total, item) => total + item.quantity,
                                  0
                                ) || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Units Not Found</span>
                              <span>
                                {order.Order_Items?.reduce((total, item) => {
                                  if (!item.found) {
                                    return total + item.quantity;
                                  } else if (
                                    item.found &&
                                    item.foundQuantity &&
                                    item.foundQuantity < item.quantity
                                  ) {
                                    return (
                                      total +
                                      (item.quantity - item.foundQuantity)
                                    );
                                  }
                                  return total;
                                }, 0) || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-red-600 dark:text-red-400">
                              <span>Refund Amount</span>
                              <span>
                                -
                                {formatCurrency(
                                  calculateOriginalSubtotal() -
                                    calculateFoundItemsTotal()
                                )}
                              </span>
                            </div>
                            {systemConfig?.tax && (
                              <div className="flex justify-between">
                                <span>Tax ({systemConfig.tax}%)</span>
                                <span>
                                  {formatCurrency(
                                    calculateTax(calculateFoundItemsTotal())
                                  )}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>
                                {formatCurrency(
                                  parseFloat(order.deliveryFee || "0")
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Service Fee</span>
                              <span>
                                {formatCurrency(
                                  parseFloat(order.serviceFee || "0")
                                )}
                              </span>
                            </div>
                          </>
                        )}

                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <Divider />
                        <div className="flex justify-between text-lg font-bold sm:text-xl">
                          <span>Total</span>
                          <span>
                            {order.status === "shopping"
                              ? formatCurrency(calculateFoundItemsTotal())
                              : formatCurrency(calculateOriginalSubtotal())}
                          </span>
                        </div>

                        {order.status === "shopping" && (
                          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300 sm:mt-4 sm:text-base">
                            <p>
                              <strong>Note:</strong> The total reflects only the
                              value of found items. Service fee (
                              {formatCurrency(
                                parseFloat(order.serviceFee || "0")
                              )}
                              ) and delivery fee (
                              {formatCurrency(
                                parseFloat(order.deliveryFee || "0")
                              )}
                              ) were already added to your wallet as earnings
                              when you started shopping.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Notes */}
            {(order.deliveryNotes || order.deliveryNote) && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <span className="inline-block rounded-full bg-amber-100 p-1.5 sm:p-2">
                    <svg
                      className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                    Delivery Notes
                  </h2>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700 sm:p-4">
                  <p className="text-base text-slate-700 dark:text-slate-300 sm:text-lg">
                    {order.deliveryNotes || order.deliveryNote}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2 sm:pt-4">{getActionButton()}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
