"use client";

import React, { useState } from "react";
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
import { OrderItem, OrderDetailsType } from "../../types/order";
import {
  recordPaymentTransactions,
  generateInvoice,
} from "../../lib/walletTransactions";
import { useSession } from "next-auth/react";
import { useTheme } from "../../context/ThemeContext";

// Define interfaces for the order data
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
  const { openChat, isDrawerOpen, closeChat, currentChatId } = useChat();
  const { theme } = useTheme();

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

  // Generate a 5-digit OTP
  const generateOtp = () => {
    const randomOtp = Math.floor(10000 + Math.random() * 90000).toString();
    setGeneratedOtp(randomOtp);
    // Store in session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("payment_otp", randomOtp);
    }
    // Log to console for testing purposes (in production, this would be sent via SMS/email)
    console.log("Generated OTP:", randomOtp);
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
    console.log("Generated Private Key:", randomKey);
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

      console.log("Generated invoice:", invoice);
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
      console.log(
        "Generating invoice after delivery confirmation for order:",
        orderId
      );

      // Make API request to generate invoice and save to database
      const invoiceResponse = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error(
          `Failed to generate invoice: ${invoiceResponse.statusText}`
        );
      }

      const invoiceResult = await invoiceResponse.json();
      console.log("Invoice generation response:", invoiceResult);

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

      console.log("Calculated order amount for payment:", orderAmount);
      console.log("Original order total:", originalOrderTotal);

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
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment processing failed");
        }

        const paymentData = await response.json();
        console.log("Payment process response:", paymentData);

        // Check if a refund was created
        if (paymentData.refund) {
          console.log("Refund created:", paymentData.refund);
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

    const updatedItems = order.Order_Items.map((item) =>
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
    // Return the found items total - this is what's shown as the subtotal in Order Summary
    // and what should be deducted from the reserved wallet balance
    const foundTotal = calculateFoundTotal();
    return foundTotal;
  };

  // Determine if we should show order items and summary
  const shouldShowOrderDetails = () => {
    if (!order) return false;
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
        // Check if any items are marked as found
        const hasFoundItems = order.Order_Items.some((item) => item.found);

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
    if (!order?.user) return;

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

  // Helper function to get status tag with appropriate color
  const getStatusTag = (status: string) => {
    switch (status) {
      case "accepted":
        return <Tag color="blue">Accepted</Tag>;
      case "shopping":
        return <Tag color="orange">Shopping</Tag>;
      case "on_the_way":
      case "at_customer":
        return <Tag color="violet">On The Way</Tag>;
      case "delivered":
        return <Tag color="green">Delivered</Tag>;
      default:
        return <Tag color="cyan">{status}</Tag>;
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
    <div className={`rounded-lg border p-6 shadow-sm transition-colors duration-200 ${
      theme === 'dark' 
        ? 'border-gray-700 bg-gray-800 text-gray-100' 
        : 'border-gray-200 bg-white text-gray-900'
    }`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Batch #{order.id}
        </h2>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Created {order.createdAt}
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
            <div className="flex items-center">
            <div className={`mr-3 rounded-full p-2 ${
              theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <svg
                className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`}
                      fill="none"
                viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
              </div>
              <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Status
              </p>
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {order.status}
              </p>
              </div>
            </div>
          </div>

        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
              <div className="flex items-center">
            <div className={`mr-3 rounded-full p-2 ${
              theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
            }`}>
              <svg
                className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-500'
                }`}
                        fill="none"
                viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                </div>
                <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Earnings
              </p>
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                ${order.earnings}
              </p>
            </div>
                </div>
              </div>

        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-center">
            <div className={`mr-3 rounded-full p-2 ${
              theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'
            }`}>
                  <svg
                className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
            </div>
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Items
              </p>
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {order.items.length} items
              </p>
            </div>
            </div>
          </div>
        </div>

      <div className="mb-8">
        <h3 className={`mb-4 text-lg font-semibold ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Locations
        </h3>
            <div className="space-y-4">
          <div className={`rounded-lg p-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-start">
              <div className={`mr-3 mt-1 rounded-full p-2 ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
                <svg
                  className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                          fill="none"
                  viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Pickup Location
                </p>
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {order.pickup_location}
                        </p>
                  </div>
                    </div>
                  </div>

          <div className={`rounded-lg p-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-start">
              <div className={`mr-3 mt-1 rounded-full p-2 ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
                <svg
                  className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                      >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Delivery Location
                </p>
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {order.delivery_location}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </div>

      <div>
        <h3 className={`mb-4 text-lg font-semibold ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Items
        </h3>
        <div className={`divide-y rounded-lg ${
          theme === 'dark' ? 'divide-gray-700 bg-gray-700' : 'divide-gray-200 bg-gray-50'
        }`}>
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className={`mr-4 h-12 w-12 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {/* Item image placeholder */}
              </div>
                <div>
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {item.name}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {item.quantity} × ${item.price}
                  </p>
                  </div>
                  </div>
              <p className={`font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
          ))}
            </div>
          </div>

        <div className="mt-6">{getActionButton()}</div>
    </div>
  );
}
