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
    profile_picture: string;
  };
  shop?: {
    id: string;
    name: string;
    address: string;
    image: string;
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
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Function to generate directions URL
  const getDirectionsUrl = (destinationAddress: string) => {
    if (currentLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${
        currentLocation.lat
      },${currentLocation.lng}&destination=${encodeURIComponent(
        destinationAddress
      )}`;
    }
    // Fallback to just the destination if no current location
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destinationAddress
    )}`;
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
    setSelectedProductName(item.product.name);
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

  // Calculate the true total (subtotal + fees)
  const calculateTrueTotal = () => {
    const subtotal = calculateOriginalSubtotal();
    const serviceFee = parseFloat(order?.serviceFee || "0");
    const deliveryFee = parseFloat(order?.deliveryFee || "0");

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
            block
            onClick={() => handleUpdateStatus("shopping")}
            loading={loading}
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
              block
              onClick={() => handleUpdateStatus("on_the_way")}
              loading={loading}
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
            block
            onClick={() => handleUpdateStatus("on_the_way")}
            loading={loading}
            disabled={!hasFoundItems}
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
            block
            onClick={() => handleUpdateStatus("delivered")}
            loading={loading}
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
      <main className="max-w-9xl mx-auto p-3 sm:p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:border-gray-700 overflow-hidden">
          {/* Header with gradient background */}
          <div className={`text-gray-900 dark:text-gray-100 p-4 sm:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  appearance="link"
                  onClick={() => router.back()}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-0 text-sm sm:text-base"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                <div className="h-4 sm:h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {order.orderType === "reel" ? "Reel Batch" : "Regular Batch"} #{order.OrderID || order.id.slice(0, 8)}
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {getStatusTag(order.status)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Shop/Reel Info */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className={`inline-block rounded-full p-1.5 sm:p-2 ${order.orderType === "reel" ? "bg-indigo-100" : "bg-emerald-100"}`}>
                    {order.orderType === "reel" ? (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 016 17.618V19a2 2 0 002 2h8a2 2 0 002-2v-1.382a2 2 0 00-.447-1.342L15 14z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                      </svg>
                    )}
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {order.orderType === "reel" ? "Reel Details" : "Shop Details"}
                  </h2>
                </div>
                
                {order.orderType === "reel" ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 mx-auto sm:mx-0">
                        {order.reel?.video_url ? (
                          <video src={order.reel.video_url} className="h-full w-full object-cover" muted preload="metadata" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-300">
                            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M14.828 14.828a4 4 0 01-5.656 0" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-base sm:text-lg">{order.reel?.title}</h3>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">{order.reel?.description}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-sm sm:text-base">
                          <span className="text-slate-500">Type: {order.reel?.type}</span>
                          <span className="text-slate-500">Qty: {order.quantity}</span>
                          <span className="font-semibold text-indigo-600">{formatCurrency(parseFloat(order.reel?.Price || "0"))}</span>
                        </div>
                      </div>
                    </div>
                    {order.reel?.Restaurant && (
                      <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                        <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">{order.reel.Restaurant.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.reel.Restaurant.location}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 mx-auto sm:mx-0">
                      {order.shop?.image ? (
                        <Image src={order.shop.image} alt={order.shop.name} width={64} height={64} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M16 8h.01M8 16h.01M16 16h.01" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-base sm:text-lg">{order.shop?.name}</h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{order.shop?.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="inline-block rounded-full p-1.5 sm:p-2 bg-sky-100">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Customer</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3 sm:mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-slate-200">
                    {order.user.profile_picture ? (
                      <Image src={order.user.profile_picture} alt={order.user.name} width={48} height={48} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-base sm:text-lg">{order.user.name}</h4>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">{order.user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Delivery Address</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {order.address.street}, {order.address.city}{order.address.postal_code ? `, ${order.address.postal_code}` : ""}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <Link href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(order.shop?.address || order.address.street)}&destination=${encodeURIComponent(`${order.address.street}, ${order.address.city}${order.address.postal_code ? `, ${order.address.postal_code}` : ""}`)}`} target="_blank">
                      <Button appearance="ghost" size="sm" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sm sm:text-base">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5 mr-1">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Directions
                      </Button>
                    </Link>
                    
                    {order.status !== "delivered" ? (
                      <Button appearance="ghost" size="sm" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sm sm:text-base" onClick={handleChatClick}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5 mr-1">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Message
                      </Button>
                    ) : (
                      <Button appearance="ghost" size="sm" className="text-slate-400 cursor-not-allowed text-sm sm:text-base" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5 mr-1">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Chat Closed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {shouldShowOrderDetails() && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className={`inline-block rounded-full p-1.5 sm:p-2 ${order.orderType === "reel" ? "bg-indigo-100" : "bg-emerald-100"}`}>
                    <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${order.orderType === "reel" ? "text-indigo-600" : "text-emerald-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    </svg>
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">{order.orderType === "reel" ? "Reel Details" : "Order Items"}</h2>
                </div>
                
                {order.orderType === "reel" ? (
                  <div className="bg-white dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-600">
                    <div className="text-base sm:text-lg text-slate-700 dark:text-slate-200 mb-2">{order.reel?.Product}</div>
                    <div className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Quantity: {order.quantity}</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {order.Order_Items?.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-700 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center border border-slate-200 dark:border-slate-600 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-slate-200" onClick={() => showProductImage(item)}>
                            {item.product.image ? (
                              <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-400">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
                                  <path d="M9 17h6M9 12h6M9 7h6" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-slate-100 text-base sm:text-lg">{item.product.name}</p>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">{formatCurrency(item.price)} × {item.quantity}</p>
                            {item.found && item.foundQuantity && item.foundQuantity < item.quantity && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">Found: {item.foundQuantity} of {item.quantity}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between sm:flex-col sm:items-end sm:text-right">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">{formatCurrency(item.price * item.quantity)}</div>
                          {order.status === "shopping" && (
                            <Checkbox checked={item.found || false} onChange={(_, checked) => toggleItemFound(item, checked)}>
                              <span className="text-sm sm:text-base">Found</span>
                            </Checkbox>
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
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="inline-block rounded-full p-1.5 sm:p-2 bg-slate-100">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    </svg>
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Order Summary</h2>
                </div>
                
                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-600">
                  <div className="space-y-2 text-base sm:text-lg">
                    {order.orderType === "reel" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Base Price</span>
                          <span>{formatCurrency(parseFloat(order.reel?.Price || "0"))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity</span>
                          <span>{order.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(parseFloat(order.reel?.Price || "0") * (order.quantity || 1))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Fee</span>
                          <span>{formatCurrency(parseFloat(order.serviceFee || "0"))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span>{formatCurrency(parseFloat(order.deliveryFee || "0"))}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <Divider />
                        <div className="flex justify-between text-lg sm:text-xl font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>
                            {order.status === "shopping"
                              ? formatCurrency(calculateFoundTotal())
                              : formatCurrency(calculateOriginalSubtotal())}
                          </span>
                        </div>

                        {order.status === "shopping" ? (
                          <>
                            <div className="flex justify-between">
                              <span>Items Found</span>
                              <span>
                                {order.Order_Items?.filter((item) => item.found).length || 0} of {order.Order_Items?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Units Found</span>
                              <span>
                                {order.Order_Items?.reduce((total, item) => {
                                  if (item.found) {
                                    return total + (item.foundQuantity || item.quantity);
                                  }
                                  return total;
                                }, 0) || 0} of {order.Order_Items?.reduce((total, item) => total + item.quantity, 0) || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Items Not Found</span>
                              <span>{order.Order_Items?.filter((item) => !item.found).length || 0}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>{formatCurrency(parseFloat(order.deliveryFee || "0"))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Service Fee</span>
                              <span>{formatCurrency(parseFloat(order.serviceFee || "0"))}</span>
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
                        <div className="flex justify-between text-lg sm:text-xl font-bold">
                          <span>Total</span>
                          <span>
                            {order.status === "shopping"
                              ? formatCurrency(calculateFoundItemsTotal())
                              : formatCurrency(calculateOriginalSubtotal())}
                          </span>
                        </div>

                        {order.status === "shopping" && (
                          <div className="mt-3 sm:mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sm sm:text-base text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            <p>
                              <strong>Note:</strong> The total reflects only the value of found items. Service fee ({formatCurrency(parseFloat(order.serviceFee || "0"))}) and delivery fee ({formatCurrency(parseFloat(order.deliveryFee || "0"))}) were already added to your wallet as earnings when you started shopping.
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
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="inline-block rounded-full p-1.5 sm:p-2 bg-amber-100">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                    </svg>
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Delivery Notes</h2>
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">{order.deliveryNotes || order.deliveryNote}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-3 sm:pt-4">
              <Button 
                appearance="primary" 
                className={`w-full py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold ${order.orderType === "reel" ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"} text-white shadow-lg transition-all duration-200`}
              >
                {getActionButton()}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
