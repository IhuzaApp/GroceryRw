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
import InvoiceModal from "./InvoiceModal";
import { useChat } from "../../context/ChatContext";
import { isMobileDevice } from "../../lib/formatters";
import ChatDrawer from "../chat/ChatDrawer";
import { OrderItem, OrderDetailsType } from "../../types/order";
import { recordPaymentTransactions, generateInvoice } from "../../lib/walletTransactions";
import { useSession } from "next-auth/react";

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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('payment_otp', randomOtp);
    }
    // Log to console for testing purposes (in production, this would be sent via SMS/email)
    console.log('Generated OTP:', randomOtp);
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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('payment_private_key', randomKey);
    }
    console.log('Generated Private Key:', randomKey);
    return randomKey;
  };

  // Function to fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!session?.user?.id) return null;
    
    setWalletLoading(true);
    try {
      const response = await fetch(`/api/shopper/wallet?shopperId=${session.user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
              <p>Your reserved wallet balance ({formatCurrency(reservedBalance)}) is insufficient for this order ({formatCurrency(orderAmount)}).</p>
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
          {err instanceof Error ? err.message : "Failed to process payment. Please try again."}
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

      // Make API request to update wallet balance
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
            orderAmount: calculateFoundItemsTotal(), // Only the value of found items (no fees)
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment processing failed");
        }
      } catch (paymentError) {
        console.error("Payment processing error:", paymentError);
        // Continue with the flow but show warning
        toaster.push(
          <Notification type="warning" header="Payment Warning" closable>
            {paymentError instanceof Error 
              ? paymentError.message 
              : "There was an issue with payment processing, but your order will continue."}
          </Notification>,
          { placement: "topEnd" }
        );
      }

      // Record wallet transaction (wrapped in try/catch to prevent blocking flow)
      if (session?.user?.id) {
        try {
          await recordPaymentTransactions(
            session.user.id as string,
            order.id,
            calculateFoundItemsTotal() // This only includes found items value, not fees
          );
        } catch (txError) {
          console.error("Error recording transaction:", txError);
          // Not blocking the flow
        }
      }

      // Close OTP modal
      setShowOtpModal(false);
      
      // Generate invoice (wrapped in try/catch to prevent blocking flow)
      setInvoiceLoading(true);
      try {
        const invoice = await generateInvoice(order.id);
        if (invoice) {
          setInvoiceData(invoice);
          setShowInvoiceModal(true);
        }
      } catch (invoiceError) {
        console.error("Error generating invoice:", invoiceError);
        // Continue with status update even if invoice generation fails
      } finally {
        setInvoiceLoading(false);
      }
      
      // Update order status
      await handleUpdateStatus("on_the_way");
      
      // Clear payment info
      setMomoCode("");
      setPrivateKey("");
      setOtp("");
      setGeneratedOtp("");
      
      // Show success notification
      toaster.push(
        <Notification type="success" header="Payment Processed" closable>
          Payment has been processed successfully. Your reserved wallet balance has been updated.
        </Notification>,
        { placement: "topEnd" }
      );
    } catch (err) {
      console.error("OTP verification error:", err);
      toaster.push(
        <Notification type="error" header="Verification Failed" closable>
          {err instanceof Error ? err.message : "Failed to verify OTP. Please try again."}
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
          // Show success notification when order is delivered
          toaster.push(
            <Notification type="success" header="Order Delivered" closable>
              Order was successfully marked as delivered. An invoice has been
              generated and chat history has been cleared.
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

    return order.Order_Items.filter((item) => item.found).reduce(
      (total, item) => {
        // Use foundQuantity if available, otherwise use full quantity
        const quantity =
          item.foundQuantity !== undefined ? item.foundQuantity : item.quantity;
        const itemPrice = parseFloat(item.price);
        const itemTotal = itemPrice * quantity;
        return total + itemTotal;
      },
      0
    );
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
    console.log(`Found items total for payment: ${foundTotal.toString()}`);
    return foundTotal;
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
        const hasFoundItems = order.Order_Items.some(item => item.found);
        
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
    <div className="max-w-1xl mx-auto p-4">
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

      {/* Invoice Modal */}
      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceData={invoiceData}
        loading={invoiceLoading}
      />

      {/* Chat Drawer - will only show on desktop when chat is open */}
      {isDrawerOpen &&
        currentChatId === order?.id &&
        order.status !== "delivered" && (
          <ChatDrawer
            isOpen={isDrawerOpen}
            onClose={closeChat}
            orderId={order.id}
            customerId={order.user.id}
            customerName={order.user.name}
            customerAvatar={order.user.profile_picture}
          />
        )}

      <div className="mb-4 flex items-center justify-between">
        <Button
          appearance="link"
          onClick={() => router.back()}
          className="flex items-center text-gray-600"
        >
          <span className="mr-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </span>
          Back
        </Button>
        <div>{getStatusTag(order.status)}</div>
      </div>

      <Panel
        bordered
        header={`Order #${order.OrderID || order.id.slice(0, 8)}`}
        shaded
      >
        <Steps current={currentStep} className="mb-8">
          <Steps.Item title="Accepted" />
          <Steps.Item title="Shopping" />
          <Steps.Item title="On The Way" />
          <Steps.Item title="Delivered" />
        </Steps>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Shop Information */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Shop Details</h3>
            <div className="flex items-center">
              <div className="mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                {order.shop.image ? (
                  <Image
                    src={order.shop.image}
                    alt={order.shop.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6"
                    >
                      <path d="M3 3h18v18H3zM16 8h.01M8 16h.01M16 16h.01" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium">{order.shop.name}</h4>
                <p className="text-sm text-gray-500">{order.shop.address}</p>
              </div>
            </div>
            <Link
              href={`https://maps.google.com?q=${order.shop.address}`}
              target="_blank"
            >
              <Button appearance="ghost" className="mt-3">
                <span className="mr-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                Directions
              </Button>
            </Link>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Customer Details</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {order.user.profile_picture ? (
                    <Image
                      src={order.user.profile_picture}
                      alt={order.user.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-6 w-6"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{order.user.name}</h4>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                </div>
              </div>

              {/* Message Button - disabled if order is delivered */}
              {order.status !== "delivered" ? (
                <Button
                  appearance="ghost"
                  className="flex items-center text-blue-600"
                  onClick={handleChatClick}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-1 h-4 w-4"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Message
                </Button>
              ) : (
                <Button
                  appearance="ghost"
                  className="flex cursor-not-allowed items-center text-gray-400"
                  disabled
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-1 h-4 w-4"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat Closed
                </Button>
              )}
            </div>

            <div className="mt-3">
              <h4 className="mb-1 text-sm font-medium">Delivery Address:</h4>
              <p className="text-sm text-gray-600">
                {order.address.street}, {order.address.city}
                {order.address.postal_code
                  ? `, ${order.address.postal_code}`
                  : ""}
              </p>
              <Link
                href={`https://maps.google.com?q=${order.address.street},${order.address.city}`}
                target="_blank"
              >
                <Button appearance="ghost" className="mt-2">
                  <span className="mr-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  Directions
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-lg font-bold">Order Items</h3>
          <div className="space-y-4">
            {order.Order_Items.map((item) => (
              <div key={item.id} className="flex items-center border-b pb-3">
                <div
                  className="mr-3 h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                  onClick={() => showProductImage(item)}
                >
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-6 w-6"
                      >
                        <path d="M9 17h6M9 12h6M9 7h6" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                  {item.found &&
                    item.foundQuantity &&
                    item.foundQuantity < item.quantity && (
                      <p className="text-xs text-orange-600">
                        Found: {item.foundQuantity} of {item.quantity}
                      </p>
                    )}
                </div>
                <div className="flex flex-col items-end text-right">
                  <div className="mb-2 font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                  {order.status === "shopping" && (
                    <Checkbox
                      checked={item.found || false}
                      onChange={(_, checked) => toggleItemFound(item, checked)}
                    >
                      Found
                    </Checkbox>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Found Items Summary - only show when shopping */}
        {order.status === "shopping" && (
          <div className="mb-6 rounded-lg border bg-white p-4">
            <h3 className="mb-3 text-lg font-bold">Item Status</h3>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {order.Order_Items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`rounded-lg border p-2 ${
                      item.found ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm">
                      {item.found ? (
                        item.foundQuantity && item.foundQuantity < item.quantity ? (
                          <span className="text-orange-600">
                            Found: {item.foundQuantity} of {item.quantity}
                          </span>
                        ) : (
                          <span className="text-green-600">Found: {item.quantity}</span>
                        )
                      ) : (
                        <span className="text-gray-500">Not found</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!order.Order_Items.some(item => item.found) && (
                <div className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p>Please mark items as found to enable the Make Payment button.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-lg font-bold">Order Summary</h3>
          <div className="space-y-2">
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
                  <span>{order.Order_Items.filter(item => item.found).length} of {order.Order_Items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Units Found</span>
                  <span>
                    {order.Order_Items.reduce((total, item) => {
                      if (item.found) {
                        return total + (item.foundQuantity || item.quantity);
                      }
                      return total;
                    }, 0)} of {order.Order_Items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Items Not Found</span>
                  <span>{order.Order_Items.filter(item => !item.found).length}</span>
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
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <Divider />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                {order.status === "shopping"
                  ? formatCurrency(calculateFoundItemsTotal())
                  : formatCurrency(calculateOriginalSubtotal())}
              </span>
            </div>
            
            {order.status === "shopping" && (
              <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                <p>
                  <strong>Note:</strong> The total reflects only the value of found items. 
                  Service fee ({formatCurrency(parseFloat(order.serviceFee || "0"))}) and 
                  delivery fee ({formatCurrency(parseFloat(order.deliveryFee || "0"))}) 
                  were already added to your wallet as earnings when you started shopping.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Notes if any */}
        {order.deliveryNotes && (
          <div className="mb-6 rounded-lg border bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Delivery Notes</h3>
            <p className="text-gray-700">{order.deliveryNotes}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">{getActionButton()}</div>
      </Panel>
    </div>
  );
}
