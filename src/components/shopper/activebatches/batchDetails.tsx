"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { formatCurrency } from "../../../lib/formatCurrency";
import ProductImageModal from "../ProductImageModal";
import QuantityConfirmationModal from "../QuantityConfirmationModal";
import PaymentModal from "../PaymentModal";
import DeliveryConfirmationModal from "../DeliveryConfirmationModal";
import InvoiceProofModal from "../InvoiceProofModal";
import { useChat } from "../../../context/ChatContext";
import { isMobileDevice } from "../../../lib/formatters";
import ShopperChatDrawer from "../../chat/ShopperChatDrawer";
import {
  recordPaymentTransactions,
  generateInvoice,
} from "../../../lib/walletTransactions";
import { useSession } from "next-auth/react";
import { useTheme } from "../../../context/ThemeContext";
import { OrderItem, OrderDetailsType, BatchDetailsProps } from "./types";
import {
  BatchDetailsSkeleton,
  OrderDetailsLoadingSkeleton,
  ProgressStepsSkeleton,
  ShopInfoCardSkeleton,
  CustomerInfoCardSkeleton,
  OrderItemsSkeleton,
  OrderSummarySkeleton,
  HeaderSkeleton,
  MobileTabsSkeleton,
  DeliveryNotesSkeleton,
} from "./SkeletonLoaders";
import {
  HeaderSection,
  ProgressStepsSection,
  MobileTabsSection,
  ShopInfoCard,
  CustomerInfoCard,
  OrderItemsSection,
  OrderSummarySection,
  DeliveryNotesSection,
  BottomActionButton,
  DeliveryRouteSection,
} from "./batchDetails/";

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

export default function BatchDetails({
  orderData,
  error,
  onUpdateStatus,
}: BatchDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { openChat, isDrawerOpen, closeChat, currentChatId } = useChat();
  const { theme } = useTheme();
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!orderData);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetailsType | null>(orderData);
  const [errorState, setErrorState] = useState<string | null>(error);

  // Set initial loading state based on whether orderData is provided
  useEffect(() => {
    if (!orderData) {
      setInitialLoading(true);
    }
  }, [orderData]);

  // Debug logging for combined orders
  useEffect(() => {
    if (order) {
      setInitialLoading(false);
      setOrderDetailsLoading(false);
      setItemsLoading(false);
    }
  }, [order]);

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
  const [uploadedProofs, setUploadedProofs] = useState<Record<string, boolean>>(
    {}
  );
  const [activeTab, setActiveTab] = useState<"items" | "details">("items");
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [paymentTargetOrderId, setPaymentTargetOrderId] = useState<
    string | null
  >(null);

  const isMultiShop = useMemo(() => {
    const shops = new Set();
    const mainShopId = order?.shop?.id || order?.shop_id;
    if (mainShopId) shops.add(mainShopId);
    order?.combinedOrders?.forEach((o: any) => {
      const sId = o.shop?.id || o.shop_id;
      if (sId) shops.add(sId);
    });
    return shops.size > 1;
  }, [order?.shop?.id, order?.shop_id, order?.combinedOrders]);

  // Get items for the currently active shop tab

  // Get items for the currently active order (main or combined)
  const getActiveOrderItems = useMemo(() => {
    if (!isMultiShop || !activeShopId) {
      // Single shop or main order - return main order items
      return order?.Order_Items || [];
    }

    // Find the active combined order
    const activeCombinedOrder = order?.combinedOrders?.find(
      (co) => co.shop?.id === activeShopId
    );
    if (activeCombinedOrder) {
      return activeCombinedOrder.Order_Items || [];
    }

    // Fallback to main order items filtered by shop
    return (
      order?.Order_Items?.filter((item: any) => item.shopId === activeShopId) ||
      []
    );
  }, [order?.Order_Items, order?.combinedOrders, isMultiShop, activeShopId]);

  // Get the currently active order object (main or combined)
  const getActiveOrder = useMemo(() => {
    if (!isMultiShop || !activeShopId) {
      return order;
    }

    const activeCombinedOrder = order?.combinedOrders?.find(
      (co) => co.shop?.id === activeShopId
    );
    return activeCombinedOrder || order;
  }, [order, order?.combinedOrders, isMultiShop, activeShopId]);

  const currentStep = useMemo(() => {
    if (!order) return 0;
    const allOrders = [order, ...(order.combinedOrders || [])];

    // Check if everything is delivered
    if (allOrders.every((o) => o.status === "delivered")) return 3;

    // Check if everything is at least on_the_way (Transition to Delivery Phase)
    if (
      allOrders.every(
        (o) =>
          o.status === "on_the_way" ||
          o.status === "at_customer" ||
          o.status === "delivered"
      )
    ) {
      return 2;
    }

    // Check if any is shopping or paid
    if (allOrders.some((o) => o.status === "shopping" || o.status === "paid"))
      return 1;

    // Default based on type if still at start
    const isRestaurantOrder = allOrders.some(
      (o) => o.orderType === "restaurant"
    );
    const isRestaurantUserReel = allOrders.some(
      (o) => o.reel?.restaurant_id || o.reel?.user_id
    );
    if (isRestaurantOrder || isRestaurantUserReel) return 1;

    return 0;
  }, [order]);

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
        () => {
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

  // Fetch combined order details using the queries API
  useEffect(() => {
    const fetchCombinedDetails = async () => {
      // Check for combinedOrderId in various potential locations
      const combinedId =
        (order as any)?.combinedOrderId || (order as any)?.combined_order_id;

      // Skip if no combined ID or if we already have detailed combined orders
      if (!combinedId) return;

      const hasDetailedCombined =
        order?.combinedOrders &&
        order.combinedOrders.length > 0 &&
        order.combinedOrders[0].shop &&
        order.combinedOrders[0].items;

      if (hasDetailedCombined) return;

      try {
        const response = await fetch(
          `/api/queries/combined-orders?combined_order_id=${combinedId}`
        );
        if (response.ok) {
          const data = await response.json();

          // Console log the combined-orders API response

          // Update order state with combined details if needed
          if (data.orders && data.orders.length > 0) {
            setOrder((prev) => {
              if (!prev) return prev;

              // double check inside to be safe
              const currentCombined = prev.combinedOrders || [];
              const alreadyDetailed =
                currentCombined.length > 0 &&
                currentCombined[0].shop &&
                currentCombined[0].items;

              if (
                alreadyDetailed &&
                currentCombined.length === data.orders.length
              ) {
                return prev;
              }

              // Transform and merge
              const transformedCombined = data.orders
                .filter((o: any) => o.id !== prev.id)
                .map((o: any) => ({
                  ...o,
                  shopName: o.shop?.name || "Unknown Shop",
                  shopAddress: o.shop?.address,
                  items: o.Order_Items?.map((item: any) => {
                    const barcode =
                      item.product?.ProductName?.barcode ||
                      item.product?.barcode ||
                      item.ProductName?.barcode ||
                      "";
                    const sku =
                      item.product?.ProductName?.sku ||
                      item.product?.sku ||
                      item.ProductName?.sku ||
                      "";

                    return {
                      id: item.id,
                      name:
                        item.product?.ProductName?.name ||
                        item.ProductName?.name ||
                        "Unknown Product",
                      quantity: item.quantity,
                      price: parseFloat(item.price) || 0,
                      productImage:
                        item.product?.ProductName?.image ||
                        item.product?.image ||
                        item.ProductName?.image ||
                        null,
                      barcode: barcode,
                      sku: sku,
                      measurement_unit: item.product?.measurement_unit || "",
                      // Preserve original IDs from API
                      productId: item.product?.id,
                      productNameId: item.product?.ProductName?.id,
                    };
                  }),
                }));

              // Console log the transformed combined orders

              // Also update Order_Items if they are missing their shopId
              let updatedOrderItems = [...(prev.Order_Items || [])];
              transformedCombined.forEach((sub: any) => {
                sub.items?.forEach((si: any) => {
                  if (!updatedOrderItems.some((ui) => ui.id === si.id)) {
                    // Add missing item from combined order
                    updatedOrderItems.push({
                      ...si,
                      shopId: sub.shop?.id,
                      orderId: sub.id, // Maintain order context for combined orders
                      product: {
                        id: si.productId || si.id, // Use preserved Product.id or fallback to item.id
                        name: si.name,
                        image: si.productImage,
                        final_price: si.price?.toString() || "0",
                        measurement_unit: si.measurement_unit || "item",
                        barcode: si.barcode,
                        sku: si.sku,
                        ProductName: {
                          id: si.productNameId || si.id, // Use preserved ProductName.id or fallback to item.id
                          name: si.name,
                          description: "",
                          barcode: si.barcode,
                          sku: si.sku,
                          image: si.productImage,
                          create_at: new Date().toISOString(),
                        },
                      },
                    });
                  }
                });
              });

              const finalOrder = {
                ...prev,
                combinedOrders: transformedCombined,
                Order_Items: updatedOrderItems,
              };

              // Console log the final order with all combined order data

              return finalOrder;
            });
          }
        }
      } catch (error) {
        console.error(
          "❌ [BatchDetails] Error fetching combined details:",
          error
        );
      }
    };

    if (order?.id) {
      fetchCombinedDetails();
    }
  }, [
    order?.id,
    (order as any)?.combinedOrderId,
    (order as any)?.combined_order_id,
  ]);

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

  // Function to get shop distance

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

  // Function to generate invoice and save to database

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!order?.id) return;

    setPaymentLoading(true);
    // Payment debug info calculated
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
    // Payment modal info calculated

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
      const originalOrderTotal = calculateOriginalSubtotal(
        paymentTargetOrderId || undefined
      );

      // Initiate MoMo payment after OTP verification
      let momoPaymentSuccess = false;
      let momoReferenceId = "";
      try {
        // First, ensure we have a valid token
        const { momoTokenManager } = await import(
          "../../../lib/momoTokenManager"
        );
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

        // Update order status to on_the_way for only the specific order being paid for
        const targetId = paymentTargetOrderId || order.id;
        const ordersToUpdate = [targetId];

        await Promise.all(
          ordersToUpdate.map((id) => onUpdateStatus(id, "on_the_way"))
        );

        // Update local state
        if (order) {
          const updatedMain = ordersToUpdate.includes(order.id)
            ? { ...order, status: "on_the_way" as string }
            : order;
          const updatedCombined = (order.combinedOrders || []).map((o) =>
            ordersToUpdate.includes(o.id)
              ? { ...o, status: "on_the_way" as string }
              : o
          );

          setOrder({
            ...updatedMain,
            combinedOrders: updatedCombined,
          });
        }

        // Show invoice proof modal for proof upload
        setShowInvoiceProofModal(true);

        // Show success notification
        toaster.push(
          <Notification type="success" header="Payment Complete" closable>
            ✅ MoMo payment successful
            <br />
            ✅ Wallet balance updated
            <br />
            ✅ Status updated to On The Way
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
      deliveryAddress: order.address
        ? `${order.address.street || ""}, ${order.address.city || ""}${
            order.address.postal_code ? `, ${order.address.postal_code}` : ""
          }`
        : "",
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
      deliveryAddress: order.address
        ? `${order.address.street || ""}, ${order.address.city || ""}${
            order.address.postal_code ? `, ${order.address.postal_code}` : ""
          }`
        : "",
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
    const isCombinedOrder = order?.combinedOrders && order.combinedOrders.length > 0;

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

    // For combined orders, show delivery confirmation modal with PIN verification
    if (isCombinedOrder) {
      const combinedInvoiceData = {
        id: `combined_${order.id}_${Date.now()}`,
        invoiceNumber: order.OrderID || order.id.slice(-8),
        orderId: order.id,
        orderNumber: order.OrderID || order.id.slice(-8),
        customer: order.orderedBy?.name || order.user?.name || "Customer",
        customerEmail: order.orderedBy?.email || order.user?.email || "",
        customerPhone: order.orderedBy?.phone || order.user?.phone || "",
        shop: order.shop?.name || "Combined Order",
        shopAddress: order.shop?.address || "",
        deliveryStreet: order.address?.street || "",
        deliveryCity: order.address?.city || "",
        deliveryPostalCode: order.address?.postal_code || "",
        deliveryPlaceDetails: order.address?.placeDetails || null,
        deliveryAddress: order.address
          ? `${order.address.street || ""}, ${order.address.city || ""}${
              order.address.postal_code ? `, ${order.address.postal_code}` : ""
            }`
          : "",
        dateCreated: new Date().toLocaleString(),
        dateCompleted: new Date().toLocaleString(),
        status: "delivered",
        items: [],
        subtotal: 0,
        serviceFee: 0,
        deliveryFee: 0,
        total: 0,
        orderType: "combined",
        isReelOrder: false,
        isRestaurantOrder: false,
        combinedOrderIds: order.combinedOrders?.map((o: any) => o.id) || [],
        combinedOrderNumbers: order.combinedOrders?.map((o: any) => o.OrderID || o.id.slice(-8)) || [],
      };

      setInvoiceData(combinedInvoiceData);
      setShowInvoiceModal(true);
      return;
    }

    // For regular orders, invoice has already been generated during payment
    // Create invoice data for the modal display

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
        ? `${order.address.street || ""}, ${order.address.city || ""}${
            order.address.postal_code ? `, ${order.address.postal_code}` : ""
          }`
        : "",
      dateCreated: new Date().toLocaleString(),
      dateCompleted: new Date().toLocaleString(),
      status: "delivered",
      items:
        order.Order_Items?.map((item: any) => ({
          id: item.id,
          name: item.product?.ProductName?.name || item.product?.name || "Item",
          quantity: item.foundQuantity || item.quantity || 0,
          unitPrice: parseFloat(item.product?.price || item.price || "0"),
          total:
            (item.foundQuantity || item.quantity || 0) *
            parseFloat(item.product?.price || item.price || "0"),
          unit: item.product?.measurement_unit || "unit",
        })) || [],
      subtotal:
        parseFloat(order.total?.toString() || "0") -
        parseFloat(order.serviceFee || "0") -
        parseFloat(order.deliveryFee || "0"),
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
    if (!order) return;

    try {
      setLoading(true);

      // Generate invoice with proof for the specific order being processed
      const allInBatch = [order, ...(order.combinedOrders || [])];
      const matchingOrder =
        allInBatch.find(
          (o) => o && (o.shop?.id || o.shop_id) === activeShopId
        ) || order;
      const targetId = (paymentTargetOrderId || matchingOrder.id) as string;
      const targetOrder = allInBatch.find((o) => o?.id === targetId) || order;

      // Generate invoice with proof photo for the specific order
      const invoiceResponse = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: targetId,
          orderType: targetOrder?.orderType || "regular",
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

      // Mark invoice proof as uploaded for this specific order
      setUploadedProofs((prev) => ({ ...prev, [targetId as string]: true }));

      // Clear payment target now that invoice is generated
      setPaymentTargetOrderId(null);

      // Close invoice proof modal
      setShowInvoiceProofModal(false);

      // Auto-switch to next shop if in multi-shop mode
      const currentOrder = order as OrderDetailsType;
      if (isMultiShop && currentOrder.combinedOrders) {
        const nextTarget = currentOrder.combinedOrders.find(
          (o) => o?.status === "accepted" || o?.status === "shopping"
        );

        if (nextTarget?.shop?.id) {
          setActiveShopId(nextTarget.shop.id);
        } else if (
          currentOrder.status === "accepted" ||
          currentOrder.status === "shopping"
        ) {
          setActiveShopId(currentOrder.shop?.id || "");
        }
      }

      // Show success notification
      toaster.push(
        <Notification type="success" header="Invoice Proof Uploaded" closable>
          ✅ Invoice proof uploaded successfully
          <br />✅{" "}
          {isMultiShop
            ? "Please check next shop or proceed"
            : "You can now confirm delivery"}
        </Notification>,
        { placement: "topEnd", duration: 5000 }
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

  const handleUpdateStatus = async (
    newStatus: string,
    targetOrderId?: string
  ) => {
    const idToUpdate = targetOrderId || order?.id;
    if (!idToUpdate || loading) return;

    // For the "on_the_way" status, we'll show the payment modal instead of immediately updating
    // BUT skip payment modal for restaurant orders and restaurant/user reels
    const targetOrder =
      targetOrderId && order?.combinedOrders
        ? order.combinedOrders.find((o) => o.id === targetOrderId) || order
        : order;

    const isRestaurantUserReel =
      targetOrder?.reel?.restaurant_id || targetOrder?.reel?.user_id;
    const isRestaurantOrder = targetOrder?.orderType === "restaurant";

    if (
      newStatus === "on_the_way" &&
      !showPaymentModal &&
      !isRestaurantOrder &&
      !isRestaurantUserReel
    ) {
      setPaymentTargetOrderId(idToUpdate);
      handleShowPaymentModal();
      return;
    }

    try {
      setLoading(true);
      if (!order) return;

      // Determine which orders to update - only the specific target order
      const ordersToUpdate = [idToUpdate];

      // Execute status updates
      await Promise.all(
        ordersToUpdate.map((id) => onUpdateStatus(id, newStatus))
      );

      // Update local state
      if (order) {
        const updatedMain = ordersToUpdate.includes(order.id)
          ? { ...order, status: newStatus }
          : order;
        const updatedCombined = (order.combinedOrders || []).map((o) =>
          ordersToUpdate.includes(o.id) ? { ...o, status: newStatus } : o
        );

        setOrder({
          ...updatedMain,
          combinedOrders: updatedCombined,
        });

        // Close chat drawer if open when main order is delivered
        if (
          isDrawerOpen &&
          currentChatId === order.id &&
          newStatus === "delivered"
        ) {
          closeChat();
        }
      }
      toaster.push(
        <Notification type="success" header="Status Updated" closable>
          Order status updated to {newStatus}
        </Notification>,
        { placement: "topEnd" }
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      toaster.push(
        <Notification type="error" header="Update Failed" closable>
          {err instanceof Error
            ? `Failed to update status: ${err.message}`
            : "Failed to update order status. Please try again."}
        </Notification>,
        { placement: "topEnd" }
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

    // Update items in main order
    const updatedItems = order.Order_Items?.map((item) =>
      item.id === itemId
        ? {
            ...item,
            found,
            foundQuantity: found ? foundQty : 0,
          }
        : item
    );

    // Update items in combined orders
    const updatedCombinedOrders = order.combinedOrders?.map(
      (combinedOrder: any) => ({
        ...combinedOrder,
        Order_Items: combinedOrder.Order_Items?.map((item: any) =>
          item.id === itemId
            ? {
                ...item,
                found,
                foundQuantity: found ? foundQty : 0,
              }
            : item
        ),
      })
    );

    setOrder({
      ...order,
      Order_Items: updatedItems,
      combinedOrders: updatedCombinedOrders,
    });
  };

  // Function to confirm found quantity
  const confirmFoundQuantity = () => {
    if (!currentItem) return;

    // Ensure found quantity never exceeds ordered quantity
    const validQuantity = Math.min(foundQuantity, currentItem.quantity);

    updateItemFoundStatus(currentItem.id, true, validQuantity);

    // Close modal and reset state after a brief delay to ensure state updates propagate
    setTimeout(() => {
      setShowQuantityModal(false);
      setCurrentItem(null);
      setFoundQuantity(0);
    }, 100);
  };

  // Calculate found items total
  const calculateFoundTotal = (targetOrderId?: string) => {
    if (!order) return 0;

    const useAll = !isMultiShop || !targetOrderId;

    // Sum for reels
    let reelTotal = 0;
    if (order.orderType === "reel" && (useAll || targetOrderId === order.id)) {
      reelTotal += parseFloat(order.total?.toString() || "0");
    }
    order.combinedOrders?.forEach((sub: any) => {
      if (sub.orderType === "reel" && (useAll || targetOrderId === sub.id)) {
        reelTotal += parseFloat(sub.total?.toString() || "0");
      }
    });

    if (reelTotal > 0) return reelTotal;

    // For regular orders, calculate based on found items
    let itemsToSum: any[] = [];

    if (!useAll && targetOrderId) {
      // If targeting a specific order, get items only from that order
      if (targetOrderId === order.id) {
        itemsToSum = order.Order_Items || [];
      } else {
        const targetSub = order.combinedOrders?.find(
          (o) => o.id === targetOrderId
        );
        itemsToSum = targetSub?.Order_Items || [];
      }
    } else {
      // If no specific target or useAll is true, get all items from main order and combined orders
      if (order.Order_Items) {
        itemsToSum = [...order.Order_Items];
      }
      order.combinedOrders?.forEach((combinedOrder: any) => {
        if (combinedOrder.Order_Items) {
          itemsToSum = [...itemsToSum, ...combinedOrder.Order_Items];
        }
      });
    }

    if (itemsToSum.length === 0) return 0;

    const total = itemsToSum
      .filter((item) => item.found)
      .reduce((total, item) => {
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
      }, 0);

    // Round to 2 decimal places to avoid floating point issues
    return parseFloat(total.toFixed(2));
  };

  // Calculate original subtotal (items only, no fees)
  const calculateOriginalSubtotal = (targetOrderId?: string) => {
    if (!order) return 0;

    // If no targetOrderId provided but we have an activeShopId in multi-shop mode, use active shop
    const effectiveTargetId =
      targetOrderId ||
      (isMultiShop && activeShopId
        ? activeShopId === order?.shop?.id
          ? order?.id
          : order?.combinedOrders?.find((o) => o.shop?.id === activeShopId)?.id
        : undefined);

    const useAll = !isMultiShop || !effectiveTargetId;

    // Sum for reels
    let reelSubtotal = 0;
    if (
      order.orderType === "reel" &&
      (useAll || effectiveTargetId === order.id)
    ) {
      reelSubtotal +=
        parseFloat(order.reel?.Price || "0") * (order.quantity || 1);
    }
    order.combinedOrders?.forEach((sub: any) => {
      if (
        sub.orderType === "reel" &&
        (useAll || effectiveTargetId === sub.id)
      ) {
        reelSubtotal +=
          parseFloat(sub.reel?.Price || "0") * (sub.quantity || 1);
      }
    });

    if (reelSubtotal > 0) return reelSubtotal;

    // For regular orders, calculate based on order items
    if (!order.Order_Items) return 0;

    let itemsToSum = order.Order_Items;
    if (!useAll && targetOrderId) {
      if (targetOrderId === order.id) {
        itemsToSum = order.Order_Items.filter(
          (item) =>
            !(item as any).shopId || (item as any).shopId === order.shop?.id
        );
      } else {
        const targetSub = order.combinedOrders?.find(
          (o) => o.id === targetOrderId
        );
        const targetShopId = targetSub?.shop?.id;
        if (targetShopId) {
          itemsToSum = order.Order_Items.filter(
            (item) => (item as any).shopId === targetShopId
          );
        }
      }
    } else if (!useAll) {
      // If we ever need targeted subtotal in multi-shop summary, we'd filter here.
      // But summary usually shows active shop total.
      itemsToSum = order.Order_Items.filter(
        (item: any) => (item as any).shopId === (activeShopId || order.shop?.id)
      );
    }

    return itemsToSum.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Helper to get fees (summed for single shop, targeted for multi-shop)
  const getBatchFee = (type: "serviceFee" | "deliveryFee"): number => {
    if (!order) return 0;
    const targetId = paymentTargetOrderId || order.id;

    if (isMultiShop && paymentTargetOrderId) {
      if (targetId === order.id)
        return parseFloat(order[type]?.toString() || "0");
      const sub = order.combinedOrders?.find((o) => o.id === targetId);
      return parseFloat(sub?.[type]?.toString() || "0");
    }

    // Sum for single shop or global
    let total = parseFloat(order[type]?.toString() || "0");
    order.combinedOrders?.forEach((sub) => {
      total += parseFloat(sub[type]?.toString() || "0");
    });
    return total;
  };

  // Calculate tax amount (tax is included in the total, not added on top)

  // Calculate the true total (subtotal - discount)

  // Calculate the true total based on found items (for shopping mode)
  const calculateFoundItemsTotal = () => {
    // Priority: 1. Payment target, 2. Active shop tab, 3. Main order
    const targetId =
      paymentTargetOrderId ||
      (activeShopId === order?.shop?.id
        ? order?.id
        : order?.combinedOrders?.find((o) => o.shop?.id === activeShopId)
            ?.id) ||
      order?.id;

    // For reel orders
    const targetOrder =
      targetId === order?.id
        ? order
        : order?.combinedOrders?.find((o) => o.id === targetId);
    if (targetOrder?.orderType === "reel") {
      return targetOrder.total;
    }

    // For regular orders, return the found items total for the target order
    const foundTotal = calculateFoundTotal(targetId || undefined);
    return foundTotal;
  };

  // Determine if we should show order items and summary
  const shouldShowOrderDetails = () => {
    if (!order) return false;

    // In a combined batch, we should show details if ANY order is still being shopped or accepted
    const allOrders = [order, ...(order.combinedOrders || [])];
    const showStatuses = ["accepted", "shopping", "paid"];

    return allOrders.some((o) => showStatuses.includes(o.status));
  };

  // Function to get the right action button based on current status
  const getActionButton = (targetOrderOverride?: any) => {
    const activeOrder = targetOrderOverride || order;
    if (!activeOrder) return null;

    const isRestaurantOrder = activeOrder.orderType === "restaurant";
    // Skip shopping if EITHER restaurant_id OR user_id is not null
    const isRestaurantUserReel =
      activeOrder.reel?.restaurant_id || activeOrder.reel?.user_id;

    switch (activeOrder.status) {
      case "accepted":
        return (
          <Button
            appearance="primary"
            color="green"
            size="lg"
            block
            onClick={() => {
              if (activeOrder.orderType === "reel" && isRestaurantUserReel) {
                // Skip shopping and go straight to delivery for restaurant/user reels
                handleUpdateStatus("on_the_way", activeOrder.id);
              } else {
                handleUpdateStatus(
                  isRestaurantOrder ? "on_the_way" : "shopping",
                  activeOrder.id
                );
              }
            }}
            loading={loading}
            className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
          >
            {activeOrder.orderType === "reel" && isRestaurantUserReel
              ? "Start Delivery"
              : isRestaurantOrder
              ? "Start Delivery"
              : "Start Shopping"}
          </Button>
        );
      case "shopping":
        // For restaurant/user reel orders, they shouldn't be in shopping status
        // For regular reel orders, no need to check found items since there's only one item
        if (activeOrder.orderType === "reel") {
          if (isRestaurantUserReel) {
            // This shouldn't happen, but handle gracefully
            return (
              <Button
                appearance="primary"
                color="green"
                size="lg"
                block
                onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
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
                onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
                loading={loading}
                className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
              >
                Make Payment
              </Button>
            );
          }
        }

        // For regular orders, check if any items are marked as found
        // If items are in the root Order_Items list, filter them by shopId if it's a sub-order
        const relevantItems =
          activeOrder.Order_Items ||
          order?.Order_Items?.filter(
            (item) =>
              !(item as any).shopId ||
              (item as any).shopId === activeOrder.shop?.id
          ) ||
          [];

        // For combined orders, also check items in combined orders
        const combinedOrderItems =
          order?.combinedOrders?.flatMap(
            (combinedOrder: any) =>
              combinedOrder.Order_Items?.filter(
                (item: any) =>
                  !(item as any).shopId ||
                  (item as any).shopId === activeOrder.shop?.id
              ) || []
          ) || [];

        const allRelevantItems = [...relevantItems, ...combinedOrderItems];
        const hasFoundItems =
          allRelevantItems?.some((item: any) => item.found) || false;

        // Shopping status calculated

        return (
          <Button
            appearance="primary"
            color="green"
            size="lg"
            block
            onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
            loading={loading}
            disabled={!hasFoundItems}
            className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
          >
            {hasFoundItems ? "Make Payment" : "Mark Items as Found to Continue"}
          </Button>
        );
      case "on_the_way":
      case "at_customer":
        // Only show Confirm Delivery button if invoice proof has been uploaded for this specific order
        if (!uploadedProofs[activeOrder.id]) {
          return (
            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center ${
                theme === "dark"
                  ? "border-yellow-600 bg-yellow-900/20"
                  : "border-yellow-400 bg-yellow-50"
              }`}
            >
              <svg
                className={`mx-auto mb-3 h-12 w-12 ${
                  theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                }`}
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
              <p
                className={`mb-4 font-semibold ${
                  theme === "dark" ? "text-yellow-300" : "text-yellow-800"
                }`}
              >
                Invoice proof required before delivery
              </p>
              <Button
                appearance="primary"
                color="yellow"
                onClick={() => setShowInvoiceProofModal(true)}
                className="rounded-lg px-6 py-2 font-bold shadow-md hover:scale-105"
              >
                Upload Invoice Photo
              </Button>
            </div>
          );
        }
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

  const renderDeliveryPhase = () => {
    if (!order) return null;
    const allOrders = [order, ...(order.combinedOrders || [])];

    // Group orders by customer (use customer phone/ID as the key since combined orders going to same customer should be grouped)
    const ordersByCustomer = new Map<string, any[]>();
    allOrders.forEach((o) => {
      // Use customer phone as the primary grouping key
      const customerPhone =
        (o as any).orderedBy?.phone || o.customerPhone || "unknown";
      const customerId = (o as any).orderedBy?.id || o.customerId || "unknown";
      const customerKey = `${customerId}_${customerPhone}`;

      if (!ordersByCustomer.has(customerKey))
        ordersByCustomer.set(customerKey, []);
      ordersByCustomer.get(customerKey)?.push(o);
    });

    return (
      <DeliveryRouteSection
        ordersByCustomer={ordersByCustomer}
        uploadedProofs={uploadedProofs}
        handleDirectionsClick={handleDirectionsClick}
        handleChatClick={handleChatClick}
        getActionButton={getActionButton}
      />
    );
  };

  // Function to handle chat button click
  const handleChatClick = (
    targetCustomerId?: string,
    targetCustomerName?: string,
    targetCustomerProfilePic?: string
  ) => {
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
      targetCustomerId ||
      orderWithNewFields.customerId ||
      orderWithNewFields.orderedBy?.id;

    if (!customerId) {
      // Cannot start chat - missing customer data
      if (typeof window !== "undefined") {
        alert(
          "Cannot start chat: Customer information is missing. Please refresh the page and try again."
        );
      }
      return;
    }

    const customerName =
      targetCustomerName ||
      orderWithNewFields.orderedBy?.name ||
      order.user?.name ||
      "Customer";

    const customerPic =
      targetCustomerProfilePic ||
      orderWithNewFields.orderedBy?.profile_picture ||
      order.user?.profile_picture;

    // Opening chat

    openChat(
      order.id,
      customerId, // We already validated this exists above
      customerName,
      customerPic
    );

    // If on mobile, navigate to chat page
    if (isMobileDevice()) {
      router.push(`/Plasa/chat/${order.id}`);
    }
  };

  // Function to handle sending a message

  // Function to handle shopper arrived notification

  // Helper function to get status tag with appropriate color
  const getStatusTag = (status: string) => {
    const isReelOrder = order?.orderType === "reel";

    switch (status) {
      case "accepted":
        return (
          <Tag color={isReelOrder ? "violet" : "blue"} size="lg">
            Accepted
          </Tag>
        );
      case "shopping":
        return (
          <Tag color={isReelOrder ? "violet" : "orange"} size="lg">
            Shopping
          </Tag>
        );
      case "on_the_way":
      case "at_customer":
        return (
          <Tag color={isReelOrder ? "violet" : "violet"} size="lg">
            On The Way
          </Tag>
        );
      case "delivered":
        return (
          <Tag color={isReelOrder ? "violet" : "green"} size="lg">
            Delivered
          </Tag>
        );
      default:
        return (
          <Tag color={isReelOrder ? "violet" : "cyan"} size="lg">
            {status}
          </Tag>
        );
    }
  };

  // Check if invoice proof exists when order loads or status changes
  useEffect(() => {
    const checkInvoiceProof = async () => {
      if (!order?.id) return;

      const ordersToCheck = [order, ...(order.combinedOrders || [])];
      const proofResults: Record<string, boolean> = { ...uploadedProofs };

      await Promise.all(
        ordersToCheck.map(async (o: any) => {
          if (o.status === "on_the_way" || o.status === "at_customer") {
            try {
              const response = await fetch(
                `/api/invoices/check-proof?orderId=${o.id}`
              );
              if (response.ok) {
                const data = await response.json();
                proofResults[o.id] = data.hasProof || false;
              }
            } catch (error) {
              console.error(
                `❌ [Invoice Proof Check] Error for ${o.id}:`,
                error
              );
            }
          } else if (o.status === "delivered") {
            proofResults[o.id] = true;
          } else if (o.status === "paid") {
            proofResults[o.id] = false;
          }
        })
      );

      setUploadedProofs(proofResults);
    };

    checkInvoiceProof();
  }, [order?.id, order?.status, order?.combinedOrders?.length]);

  // Fetch complete order data when component mounts
  useEffect(() => {
    if (order?.id) {
      // Initial order data from SSR
      setOrderDetailsLoading(true);

      // Fetching order details for ID

      fetch(`/api/shopper/orderDetails?id=${order.id}`)
        .then((res) => {
          // API response status
          return res.json();
        })
        .then((data) => {
          // API response data

          // Console log the initial orderDetails API response

          if (data.order) {
            // Transform the API response to match BatchDetails expected structure
            const transformOrderItems = (
              items: any[],
              shopId?: string,
              orderId?: string
            ) => {
              return (
                items?.map((item: any) => {
                  // Handle both data formats: flattened (from orderDetails API) and nested (from combined orders API)
                  const isNestedFormat =
                    item.product && item.product.ProductName;

                  let productId,
                    productName,
                    productImage,
                    finalPrice,
                    measurementUnit,
                    productNameData;

                  if (isNestedFormat) {
                    // Nested format from combined orders API
                    productId = item.product?.id || item.id;
                    productName =
                      item.product?.ProductName?.name || "Unknown Product";
                    productImage =
                      item.product?.ProductName?.image ||
                      item.product?.image ||
                      "/images/groceryPlaceholder.png";
                    finalPrice =
                      item.product?.final_price ||
                      item.price?.toString() ||
                      "0";
                    measurementUnit = item.product?.measurement_unit || "item";
                    productNameData = {
                      id: item.product?.ProductName?.id || item.id,
                      name:
                        item.product?.ProductName?.name || "Unknown Product",
                      description: item.product?.ProductName?.description || "",
                      barcode: item.product?.ProductName?.barcode || "",
                      sku: item.product?.ProductName?.sku || "",
                      image:
                        item.product?.ProductName?.image ||
                        item.product?.image ||
                        "/images/groceryPlaceholder.png",
                      create_at:
                        item.product?.ProductName?.create_at ||
                        new Date().toISOString(),
                    };
                  } else {
                    // Flattened format from orderDetails API - use existing product data
                    productId = item.product?.id || item.id;
                    productName = item.product?.name || item.name;
                    productImage =
                      item.product?.image ||
                      item.productImage ||
                      "/images/groceryPlaceholder.png";
                    finalPrice =
                      item.product?.final_price ||
                      item.price?.toString() ||
                      "0";
                    measurementUnit =
                      item.product?.measurement_unit ||
                      item.measurement_unit ||
                      "item";

                    // Use existing ProductName data from the flattened format
                    productNameData = item.product?.ProductName
                      ? {
                          id: item.product.ProductName.id,
                          name: item.product.ProductName.name,
                          description:
                            item.product.ProductName.description || "",
                          barcode: item.product.ProductName.barcode || "",
                          sku: item.product.ProductName.sku || "",
                          image:
                            item.product.ProductName.image ||
                            item.productImage ||
                            "/images/groceryPlaceholder.png",
                          create_at:
                            item.product.ProductName.create_at ||
                            new Date().toISOString(),
                        }
                      : {
                          id: item.id, // Fallback to item.id if no ProductName data
                          name: item.name,
                          description: "",
                          barcode: item.barcode || "",
                          sku: item.sku || "",
                          image:
                            item.productImage ||
                            "/images/groceryPlaceholder.png",
                          create_at: new Date().toISOString(),
                        };
                  }

                  const transformedItem = {
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    shopId: shopId, // Attach shopId for split view grouping
                    orderId: orderId, // Attach orderId to maintain correct order context
                    product: {
                      id: productId,
                      name: productName,
                      image: productImage,
                      final_price: finalPrice,
                      measurement_unit: measurementUnit,
                      barcode: productNameData.barcode,
                      sku: productNameData.sku,
                      ProductName: productNameData,
                    },
                  };

                  return transformedItem;
                }) || []
              );
            };

            let allItems = transformOrderItems(
              data.order.items || [],
              data.order.shop?.id,
              data.order.id
            );

            // If combined orders exist, aggregate their items too
            if (
              data.order.combinedOrders &&
              data.order.combinedOrders.length > 0
            ) {
              data.order.combinedOrders.forEach((subOrder: any) => {
                if (subOrder.items && subOrder.id !== data.order.id) {
                  const subItems = transformOrderItems(
                    subOrder.items,
                    subOrder.shop?.id,
                    subOrder.id
                  );
                  subOrder.Order_Items = subItems; // Attach for split view
                  allItems = [...allItems, ...subItems];
                }
              });
            }

            const transformedOrder = {
              ...data.order,
              Order_Items: allItems,
              combinedOrders: data.order.combinedOrders, // Ensure this is passed through
            };

            // Console log the final transformed order with all combined data

            setOrder(transformedOrder);
            if (!activeShopId && data.order.shop?.id) {
              setActiveShopId(data.order.shop.id);
            }
          } else {
            // No order data in response
          }
          setOrderDetailsLoading(false);
          setItemsLoading(false);
        })
        .catch(() => {
          // Error fetching order details
          setOrderDetailsLoading(false);
          setItemsLoading(false);
        });
    }
  }, [order?.id, session?.user?.id]);

  if (initialLoading || (loading && !order) || orderDetailsLoading) {
    return <BatchDetailsSkeleton />;
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
    <>
      {/* Hide mobile bottom navbar on this page */}
      <style jsx global>{`
        @media (max-width: 767px) {
          nav[class*="bottom-"],
          div[class*="mobile-nav"],
          div[class*="bottom-nav"],
          .mobile-bottom-navigation,
          [class*="ShopperSidebar"] {
            display: none !important;
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
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
          serviceFee={getBatchFee("serviceFee")}
          deliveryFee={getBatchFee("deliveryFee")}
          paymentLoading={paymentLoading}
          externalId={paymentTargetOrderId || order?.id}
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
          orderId={
            paymentTargetOrderId ||
            (order &&
              [order, ...(order.combinedOrders || [])].find(
                (o) => (o.shop?.id || o.shop_id) === activeShopId
              )?.id) ||
            order?.id ||
            ""
          }
          orderNumber={
            (order &&
              [order, ...(order.combinedOrders || [])].find(
                (o) =>
                  o.id ===
                  (paymentTargetOrderId ||
                    (order &&
                      [order, ...(order.combinedOrders || [])].find(
                        (o) => (o.shop?.id || o.shop_id) === activeShopId
                      )?.id) ||
                    order?.id)
              )?.OrderID) ||
            order?.OrderID ||
            order?.id.slice(-8) ||
            ""
          }
          combinedOrderIds={[]}
          combinedOrderNumbers={[]}
        />

        {/* Delivery Confirmation Modal */}
        <DeliveryConfirmationModal
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoiceData={invoiceData}
          loading={invoiceLoading}
          orderType={(order?.combinedOrders && order.combinedOrders.length > 0) ? "combined" : (order?.orderType || "regular")}
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
        <main className="mx-auto w-full px-0 py-2 pb-20 sm:p-6 sm:pb-6">
          <div className="overflow-hidden rounded-none">
            {/* Header Section */}
            <HeaderSection
              order={order}
              getStatusTag={getStatusTag}
              onBack={() => router.back()}
            />

            {/* Content */}
            <div className="space-y-3 px-0 pb-3 pt-1 sm:space-y-8 sm:p-8">
              {/* Order Progress Steps - Hidden on Mobile */}
              <ProgressStepsSection order={order} currentStep={currentStep} />

              {/* Mobile Tabs - Only visible on mobile */}
              {shouldShowOrderDetails() && (
                <MobileTabsSection
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              )}

              {/* Main Info Grid - Hidden during shopping status on desktop, always visible in "Other Details" tab on mobile */}
              {(() => {
                // For combined orders, hide the section if we have combined orders and any are still being processed
                const hasCombinedOrders = !!(order?.combinedOrders && order.combinedOrders.length > 0);
                const hasUnprocessedCombinedOrders =
                  hasCombinedOrders &&
                  order?.combinedOrders?.some(
                    (co) =>
                      co.status === "shopping" ||
                      co.status === "accepted" ||
                      co.status === "paid"
                  );

                const shouldShow =
                  shouldShowOrderDetails() &&
                  (order.status !== "shopping" || activeTab === "details") &&
                  !showPaymentModal &&
                  !paymentTargetOrderId &&
                  !hasUnprocessedCombinedOrders;

                return shouldShow;
              })() && (
                <div
                  className={`grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-2 ${
                    activeTab === "details" ? "block" : "hidden sm:grid"
                  }`}
                >
                  {/* Shop/Reel Info */}
                  <ShopInfoCard
                    order={order}
                    uniqueShops={uniqueShops}
                    onDirectionsClick={handleDirectionsClick}
                  />

                  {/* Customer Info */}
                  <CustomerInfoCard
                    order={order}
                    uniqueCustomers={uniqueCustomers}
                    onDirectionsClick={handleDirectionsClick}
                    onChatClick={handleChatClick}
                    theme={theme}
                  />
                </div>
              )}

              {/* Delivery Phase View */}
              {!shouldShowOrderDetails() && renderDeliveryPhase()}

              {/* Order Items */}
              {shouldShowOrderDetails() && (
                <OrderItemsSection
                  order={order}
                  activeTab={activeTab}
                  activeShopId={activeShopId}
                  onSetActiveShopId={setActiveShopId}
                  onToggleItemFound={toggleItemFound}
                  onShowProductImage={showProductImage}
                  itemsLoading={itemsLoading}
                />
              )}

              {/* Order Summary */}
              {shouldShowOrderDetails() && (
                <OrderSummarySection
                  order={order}
                  isSummaryExpanded={isSummaryExpanded}
                  onToggleSummary={setIsSummaryExpanded}
                  getActiveOrder={getActiveOrder}
                  getActiveOrderItems={getActiveOrderItems}
                  calculateFoundItemsTotal={calculateFoundItemsTotal}
                  calculateOriginalSubtotal={calculateOriginalSubtotal}
                />
              )}

              {/* Delivery Notes */}
              <DeliveryNotesSection order={order} activeTab={activeTab} />

              <div className="hidden pt-2 sm:block sm:pt-4">
                {(() => {
                  const actionOrder =
                    activeShopId === order?.shop?.id
                      ? order
                      : order?.combinedOrders?.find(
                          (o) => o.shop?.id === activeShopId
                        );

                  // Action button info calculated

                  return getActionButton(actionOrder);
                })()}
              </div>
            </div>
          </div>
        </main>

        {/* Fixed Bottom Action Button - Mobile Only */}
        <BottomActionButton
          order={order}
          activeShopId={activeShopId}
          uploadedProofs={uploadedProofs}
          getActionButton={getActionButton}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </>
  );
}
