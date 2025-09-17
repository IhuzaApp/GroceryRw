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
import OtpVerificationModal from "./OtpVerificationModal";
import DeliveryConfirmationModal from "./DeliveryConfirmationModal";
import { useChat } from "../../context/ChatContext";
import { isMobileDevice } from "../../lib/formatters";
import ChatDrawer from "../chat/ChatDrawer";
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
  orderType?: "regular" | "reel";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
    Restaurant?: {
      id: string;
      name: string;
      location: string;
      lat: number;
      long: number;
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
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  const [currentStep, setCurrentStep] = useState(() => {
    if (!orderData) return 0;

    switch (orderData.status) {
      case "accepted":
        return 0;
      case "shopping":
        return 1;
      case "on_the_way":
      case "at_customer":
        return 2;
      case "delivered":
        return 3;
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
        console.error("Error fetching system configuration:", error);
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
      console.error("Error fetching wallet:", error);
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
      console.error("Error generating invoice:", invoiceError);
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

      // Make API request to generate invoice and save to database
      const invoiceResponse = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          orderType: orderData?.orderType || "regular", // Pass order type to API
        }),
      });

      if (!invoiceResponse.ok) {
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
      console.error("Error generating invoice:", invoiceError);
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

      // Close payment modal and show OTP modal
      setShowPaymentModal(false);
      setShowOtpModal(true);
      setPaymentLoading(false);
    } catch (err) {
      console.error("Payment processing error:", err);
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
      try {
        // First, ensure we have a valid token
        const { momoTokenManager } = await import("../../lib/momoTokenManager");
        await momoTokenManager.getValidToken();

        const momoResponse = await fetch('/api/momo/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: orderAmount,
            currency: 'UGX',
            payerNumber: (session?.user as any)?.phone,
            externalId: order.id || `SHOPPER-PAYMENT-${Date.now()}`,
            payerMessage: 'Payment for Shopper Items',
            payeeNote: 'Shopper payment confirmation',
          }),
        });

        const momoData = await momoResponse.json();

        if (momoResponse.ok) {
          // Start polling for MoMo payment status
          const maxAttempts = 30; // Poll for up to 5 minutes (30 * 10 seconds)
          let attempts = 0;
          let paymentCompleted = false;

          const pollPaymentStatus = async () => {
            try {
              await momoTokenManager.getValidToken();
              
              const statusResponse = await fetch(`/api/momo/status?referenceId=${momoData.referenceId}`);
              const statusData = await statusResponse.json();

              if (statusResponse.ok) {
                if (statusData.status === 'SUCCESSFUL') {
                  momoPaymentSuccess = true;
                  paymentCompleted = true;
                  toaster.push(
                    <Notification type="success" header="MoMo Payment Successful" closable>
                      Payment completed successfully via MoMo!
                    </Notification>,
                    { placement: "topEnd" }
                  );
                } else if (statusData.status === 'FAILED') {
                  throw new Error('MoMo payment failed. Please try again.');
                } else if (statusData.status === 'PENDING') {
                  attempts++;
                  if (attempts < maxAttempts) {
                    setTimeout(pollPaymentStatus, 10000); // Poll every 10 seconds
                  } else {
                    throw new Error('MoMo payment timeout. Please check your phone or try again.');
                  }
                }
              } else {
                throw new Error(statusData.error || 'MoMo status check failed');
              }
            } catch (error) {
              console.error('MoMo status polling error:', error);
              attempts++;
              if (attempts < maxAttempts && !paymentCompleted) {
                setTimeout(pollPaymentStatus, 10000);
              } else {
                throw error;
              }
            }
          };

          // Start polling
          await pollPaymentStatus();

          // Wait for payment to complete
          while (!paymentCompleted && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          if (!momoPaymentSuccess) {
            throw new Error('MoMo payment did not complete successfully');
          }
        } else {
          throw new Error(momoData.error || 'MoMo payment initiation failed');
        }
      } catch (momoError) {
        console.error("MoMo payment error:", momoError);
        toaster.push(
          <Notification type="error" header="MoMo Payment Failed" closable>
            {momoError instanceof Error
              ? momoError.message
              : "MoMo payment failed. Please try again."}
          </Notification>,
          { placement: "topEnd", duration: 5000 }
        );
        setOtpVerifyLoading(false);
        setShowOtpModal(false); // Close OTP modal on error
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
        console.error("Payment processing error:", paymentError);
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
        setShowOtpModal(false); // Close OTP modal on error
        return;
      }

      // Close OTP modal
      setShowOtpModal(false);

      // Only proceed with status update if payment was successful
      if (paymentSuccess && walletUpdated) {
        // Update order status directly without showing payment modal again
        try {
          setLoading(true);
          await onUpdateStatus(order.id, "on_the_way");

          // Update local state
          setOrder({
            ...order,
            status: "on_the_way",
          });

          // Update step
          setCurrentStep(2);

          // Clear payment info
          setMomoCode("");
          setPrivateKey("");
          setOtp("");
          setGeneratedOtp("");

          // Show success notification
          toaster.push(
            <Notification type="success" header="Payment Processed" closable>
              Payment has been processed successfully. Your reserved wallet
              balance has been updated.
            </Notification>,
            { placement: "topEnd" }
          );
        } catch (updateError) {
          console.error("Error updating order status:", updateError);
          toaster.push(
            <Notification type="error" header="Status Update Failed" closable>
              {updateError instanceof Error
                ? updateError.message
                : "Failed to update order status. Please try again."}
            </Notification>,
            { placement: "topEnd" }
          );
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
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

  const handleUpdateStatus = async (newStatus: string) => {
    // For the "on_the_way" status, we'll show the payment modal instead of immediately updating
    if (newStatus === "on_the_way" && !showPaymentModal) {
      handleShowPaymentModal();
      return;
    }

    if (!order?.id) return;

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
      switch (newStatus) {
        case "accepted":
          setCurrentStep(0);
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

          // Generate invoice and show the delivery photo modal
          const invoiceGenerated = await generateInvoiceAndRedirect(order.id);

          // Show success notification when order is delivered
          toaster.push(
            <Notification type="success" header="Order Delivered" closable>
              Order was successfully marked as delivered. Please upload a
              delivery confirmation photo.
            </Notification>,
            { placement: "topEnd" }
          );
          break;
      }
    } catch (err) {
      console.error("Error updating order status:", err);
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
    setSelectedImage(item.product.image);
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
    // For regular orders, show only during accepted or shopping status
    return order.status === "accepted" || order.status === "shopping";
  };

  // Function to get the right action button based on current status
  const getActionButton = () => {
    if (!order) return null;

    switch (order.status) {
      case "accepted":
        return (
          <Button
            appearance="primary"
            color="green"
            size="sm"
            block
            onClick={() => handleUpdateStatus("shopping")}
            loading={loading}
            className="rounded-lg py-2 text-lg font-bold sm:rounded-xl sm:py-4 sm:text-2xl sm:text-xl"
          >
            Start Shopping
          </Button>
        );
      case "shopping":
        // For reel orders, no need to check found items since there's only one item
        if (order.orderType === "reel") {
          return (
            <Button
              appearance="primary"
              color="green"
              size="sm"
              block
              onClick={() => handleUpdateStatus("on_the_way")}
              loading={loading}
              className="rounded-lg py-2 text-lg font-bold sm:rounded-xl sm:py-4 sm:text-2xl sm:text-xl"
            >
              Make Payment
            </Button>
          );
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
            className="rounded-lg py-2 text-lg font-bold sm:rounded-xl sm:py-4 sm:text-2xl sm:text-xl"
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
            size="sm"
            block
            onClick={() => handleUpdateStatus("delivered")}
            loading={loading}
            className="rounded-lg py-2 text-lg font-bold sm:rounded-xl sm:py-4 sm:text-2xl sm:text-xl"
          >
            Confirm Delivery & Generate Invoice
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
    if (!order?.user || !order.user.id) {
      if (typeof window !== "undefined") {
        alert("Cannot start chat: Customer ID is missing.");
      }
      return;
    }

    openChat(
      order.id,
      order.user.id,
      order.user.name,
      order.user.profile_picture
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
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
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
      fetch(`/api/queries/orderDetails?id=${order.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order);
          }
        })
        .catch((err) => {
          console.error("Error fetching complete order data:", err);
        });
    }
  }, [order?.id]);

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

      {/* MoMo Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        momoCode={momoCode}
        setMomoCode={setMomoCode}
        privateKey={privateKey}
        orderAmount={calculateFoundItemsTotal()}
        serviceFee={parseFloat(order?.serviceFee || "0")}
        deliveryFee={parseFloat(order?.deliveryFee || "0")}
        paymentLoading={paymentLoading}
        payerNumber={(session?.user as any)?.phone || ""}
        externalId={order?.id}
      />

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOtp}
        otp={otp}
        setOtp={setOtp}
        loading={otpVerifyLoading}
      />

      {/* Delivery Confirmation Modal */}
      <DeliveryConfirmationModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceData={invoiceData}
        loading={invoiceLoading}
        orderType={order?.orderType || "regular"}
      />

      {/* Chat Drawer - will only show on desktop when chat is open */}
      {isDrawerOpen &&
        currentChatId === order?.id &&
        order.status !== "delivered" && (
          <ChatDrawer
            isOpen={isDrawerOpen}
            onClose={closeChat}
            order={order}
            shopper={session?.user}
            messages={getMessages(order.id) as any}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            currentUserId={session?.user?.id || ""}
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
                  <Steps.Item
                    title="Shopping"
                    description="Collecting items from the store"
                    status={currentStep >= 1 ? "finish" : "wait"}
                  />
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
                    {order.reel?.Restaurant && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
                          {order.reel.Restaurant.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {order.reel.Restaurant.location}
                        </p>
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
                          className="flex items-center rounded-full border border-green-400 px-3 py-1 text-sm font-medium text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-base"
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
                    {order.user.profile_picture ? (
                      <Image
                        src={order.user.profile_picture}
                        alt={order.user.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 sm:text-lg">
                      {order.user.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                      {order.user.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                    <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Delivery Address
                    </p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 sm:text-base">
                      {order.address.street}, {order.address.city}
                      {order.address.postal_code
                        ? `, ${order.address.postal_code}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button
                      className="flex items-center rounded-full border border-green-400 px-3 py-1 text-sm text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-base"
                      onClick={() =>
                        handleDirectionsClick(
                          `${order.address.street}, ${order.address.city}${
                            order.address.postal_code
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

                    {order.user.phone && (
                      <button
                        className="flex items-center rounded-full border border-green-400 px-3 py-1 text-sm text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-base"
                        onClick={() =>
                          (window.location.href = `tel:${order.user.phone}`)
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
                        className="flex items-center rounded-full border border-green-400 px-3 py-1 text-sm text-green-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-900/20 sm:text-base"
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
                        className="flex cursor-not-allowed items-center rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-400 dark:border-slate-600 sm:text-base"
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
                          className="h-8 w-8 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-slate-200 sm:h-12 sm:w-12"
                          onClick={() => showProductImage(item)}
                        >
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={
                                item.product.ProductName?.name ||
                                "Unknown Product"
                              }
                              width={48}
                              height={48}
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
                                <path d="M9 17h6M9 12h6M9 7h6" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-base sm:text-sm">
                            {item.product.ProductName?.name ||
                              "Unknown Product"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                            {formatCurrency(item.price)} × {item.quantity}
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
                              className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium transition-all duration-200 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm ${
                                item.found
                                  ? "border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                  : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                              }`}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  item.found
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {item.found ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                )}
                              </svg>
                              {item.found ? "Found" : "Mark Found"}
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
                          <span>Total</span>
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
