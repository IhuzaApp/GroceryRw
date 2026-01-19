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

  // Debug logging for combined orders
  useEffect(() => {
    if (order) {
      // Order loaded successfully
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
  const [uploadedProofs, setUploadedProofs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"items" | "details">("items");
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [paymentTargetOrderId, setPaymentTargetOrderId] = useState<string | null>(null);

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
  const getActiveShopItems = useMemo(() => {
    if (!order?.Order_Items) return [];

    if (!isMultiShop || !activeShopId) {
      // Single shop or no active shop selected - return all items
      return order.Order_Items;
    }

    // Multi-shop: filter items by active shop
    const filteredItems = order.Order_Items.filter((item: any) => {
      const itemShopId = item.shopId;
      return itemShopId === activeShopId;
    });

    // Filtered items calculated successfully

    return filteredItems;
  }, [order?.Order_Items, isMultiShop, activeShopId]);

  const currentStep = useMemo(() => {
    if (!order) return 0;
    const allOrders = [order, ...(order.combinedOrders || [])];

    // Check if everything is delivered
    if (allOrders.every(o => o.status === "delivered")) return 3;

    // Check if everything is at least on_the_way (Transition to Delivery Phase)
    if (allOrders.every(o =>
      o.status === "on_the_way" ||
      o.status === "at_customer" ||
      o.status === "delivered"
    )) {
      return 2;
    }

    // Check if any is shopping or paid
    if (allOrders.some(o => o.status === "shopping" || o.status === "paid")) return 1;

    // Default based on type if still at start
    const isRestaurantOrder = allOrders.some(o => o.orderType === "restaurant");
    const isRestaurantUserReel = allOrders.some(o => o.reel?.restaurant_id || o.reel?.user_id);
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

  // Fetch combined order details using the queries API
  useEffect(() => {
    const fetchCombinedDetails = async () => {
      // Check for combinedOrderId in various potential locations
      const combinedId =
        (order as any)?.combinedOrderId ||
        (order as any)?.combined_order_id;

      // Skip if no combined ID or if we already have detailed combined orders
      if (!combinedId) return;

      const hasDetailedCombined = order?.combinedOrders &&
        order.combinedOrders.length > 0 &&
        order.combinedOrders[0].shop &&
        order.combinedOrders[0].items;

      if (hasDetailedCombined) return;

      try {
        const response = await fetch(`/api/queries/combined-orders?combined_order_id=${combinedId}`);
        if (response.ok) {
          const data = await response.json();

          // Console log the combined-orders API response
          console.log("🔍 [BatchDetails] Combined-orders API response:", {
            combinedOrderId: combinedId,
            ordersFromCombinedAPI: data.orders,
            ordersCount: data.orders?.length || 0,
            ordersDetails: data.orders?.map((o: any) => ({
              id: o.id,
              OrderID: o.OrderID,
              status: o.status,
              shop: o.shop,
              itemsCount: o.Order_Items?.length || 0,
              total: o.total
            })) || []
          });

          // Update order state with combined details if needed
          if (data.orders && data.orders.length > 0) {
            setOrder(prev => {
              if (!prev) return prev;

              // double check inside to be safe
              const currentCombined = prev.combinedOrders || [];
              const alreadyDetailed = currentCombined.length > 0 && currentCombined[0].shop && currentCombined[0].items;

              if (alreadyDetailed && currentCombined.length === data.orders.length) {
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
                    const barcode = item.product?.ProductName?.barcode || item.product?.barcode || item.ProductName?.barcode || "";
                    const sku = item.product?.ProductName?.sku || item.product?.sku || item.ProductName?.sku || "";

                    return {
                      id: item.id,
                      name: item.product?.ProductName?.name || item.ProductName?.name || "Unknown Product",
                      quantity: item.quantity,
                      price: parseFloat(item.price) || 0,
                      productImage: item.product?.ProductName?.image || item.product?.image || item.ProductName?.image || null,
                      barcode: barcode,
                      sku: sku,
                      measurement_unit: item.product?.measurement_unit || "",
                      // Preserve original IDs from API
                      productId: item.product?.id,
                      productNameId: item.product?.ProductName?.id,
                    };
                  })
                }));

              // Console log the transformed combined orders
              console.log("🔍 [BatchDetails] Transformed combined orders:", {
                transformedCombinedCount: transformedCombined.length,
                transformedCombinedDetails: transformedCombined.map((o: any) => ({
                  id: o.id,
                  OrderID: o.OrderID,
                  status: o.status,
                  shopName: o.shopName,
                  shop: o.shop,
                  itemsCount: o.items?.length || 0,
                  items: o.items?.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    barcode: item.barcode,
                    sku: item.sku
                  })) || []
                }))
              });

              // Also update Order_Items if they are missing their shopId
              let updatedOrderItems = [...(prev.Order_Items || [])];
              transformedCombined.forEach((sub: any) => {
                sub.items?.forEach((si: any) => {
                  if (!updatedOrderItems.some(ui => ui.id === si.id)) {
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
                        }
                      }
                    });
                  }
                });
              });

              const finalOrder = {
                ...prev,
                combinedOrders: transformedCombined,
                Order_Items: updatedOrderItems
              };

              // Console log the final order with all combined order data
              console.log("🔍 [BatchDetails] Final order with combined orders:", {
                orderId: finalOrder.id,
                OrderID: finalOrder.OrderID,
                combinedOrdersCount: finalOrder.combinedOrders?.length || 0,
                totalOrderItems: finalOrder.Order_Items?.length || 0,
                combinedOrderDetails: finalOrder.combinedOrders?.map((co: any) => ({
                  id: co.id,
                  OrderID: co.OrderID,
                  status: co.status,
                  shopName: co.shopName,
                  shop: {
                    id: co.shop?.id,
                    name: co.shop?.name,
                    address: co.shop?.address
                  },
                  itemsCount: co.items?.length || 0,
                  total: co.total
                })) || [],
                combinedOrderIds: finalOrder.orderIds || [],
                combinedOrderIDs: finalOrder.orderIDs || [],
                shopNames: finalOrder.shopNames || []
              });

              return finalOrder;
            });
          }
        }
      } catch (error) {
        console.error("❌ [BatchDetails] Error fetching combined details:", error);
      }
    };

    if (order?.id) {
      fetchCombinedDetails();
    }
  }, [order?.id, (order as any)?.combinedOrderId, (order as any)?.combined_order_id]);



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
        return `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat
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
    const paymentAmount = calculateFoundItemsTotal();
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
      const originalOrderTotal = calculateOriginalSubtotal(paymentTargetOrderId || undefined);

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

        // Update order status to on_the_way for only the specific order being paid for
        const targetId = paymentTargetOrderId || order.id;
        const ordersToUpdate = [targetId];

        console.log("🔍 [Payment Debug] Updating Status:", {
          paymentTargetOrderId,
          targetId,
          ordersToUpdate
        });

        console.log("🔍 [BatchDetails Component] Payment completed - updating orders to 'on_the_way':", {
          ordersToUpdate,
          paymentTargetOrderId,
          orderId: order?.id,
          combinedOrdersCount: order?.combinedOrders?.length || 0
        });

        await Promise.all(ordersToUpdate.map(id => onUpdateStatus(id, "on_the_way")));

        // Update local state
        if (order) {
          const updatedMain = ordersToUpdate.includes(order.id)
            ? { ...order, status: "on_the_way" as string }
            : order;
          const updatedCombined = (order.combinedOrders || []).map(o =>
            ordersToUpdate.includes(o.id) ? { ...o, status: "on_the_way" as string } : o
          );

          setOrder({
            ...updatedMain,
            combinedOrders: updatedCombined
          });
        }

        // Clear payment target since payment is complete
        setPaymentTargetOrderId(null);

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
      deliveryAddress: order.address
        ? `${order.address.street || ""}, ${order.address.city || ""}${order.address.postal_code ? `, ${order.address.postal_code}` : ""
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
      deliveryAddress: order.address
        ? `${order.address.street || ""}, ${order.address.city || ""}${order.address.postal_code ? `, ${order.address.postal_code}` : ""
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
        ? `${order.address.street || ""}, ${order.address.city || ""}${order.address.postal_code ? `, ${order.address.postal_code}` : ""
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
    // Determine the specific order we are processing
    const allInBatch = [order, ...(order.combinedOrders || [])];
    const matchingOrder = allInBatch.find(o => o && (o.shop?.id || o.shop_id) === activeShopId) || order;
    const targetId = (paymentTargetOrderId || matchingOrder.id) as string;
    const targetOrder = allInBatch.find(o => o?.id === targetId) || order;

    try {
      setLoading(true);

      // Generate invoice with proof photo
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
      setUploadedProofs(prev => ({ ...prev, [targetId as string]: true }));

      // Close invoice proof modal
      setShowInvoiceProofModal(false);

      // Auto-switch to next shop if in multi-shop mode
      const currentOrder = order as OrderDetailsType;
      if (isMultiShop && currentOrder.combinedOrders) {
        const nextTarget = currentOrder.combinedOrders.find(o =>
          o?.status === "accepted" || o?.status === "shopping"
        );

        if (nextTarget?.shop?.id) {
          setActiveShopId(nextTarget.shop.id);
        } else if (currentOrder.status === "accepted" || currentOrder.status === "shopping") {
          setActiveShopId(currentOrder.shop?.id || "");
        }
      }

      // Show success notification
      toaster.push(
        <Notification type="success" header="Invoice Proof Uploaded" closable>
          ✅ Invoice proof uploaded successfully
          <br />✅ {isMultiShop ? "Please check next shop or proceed" : "You can now confirm delivery"}
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

  const handleUpdateStatus = async (newStatus: string, targetOrderId?: string) => {
    const idToUpdate = targetOrderId || order?.id;
    if (!idToUpdate || loading) return;

    // For the "on_the_way" status, we'll show the payment modal instead of immediately updating
    // BUT skip payment modal for restaurant orders and restaurant/user reels
    const targetOrder = targetOrderId && order?.combinedOrders
      ? order.combinedOrders.find(o => o.id === targetOrderId) || order
      : order;

    const isRestaurantUserReel = targetOrder?.reel?.restaurant_id || targetOrder?.reel?.user_id;
    const isRestaurantOrder = targetOrder?.orderType === "restaurant";

    if (
      newStatus === "on_the_way" &&
      !showPaymentModal &&
      !isRestaurantOrder &&
      !isRestaurantUserReel
    ) {
      console.log("🔍 [BatchDetails Component] Setting payment target for combined order:", {
        targetOrderId: idToUpdate,
        newStatus,
        isCombinedOrder: !!order?.combinedOrders?.length,
        orderId: order?.id,
        combinedOrdersCount: order?.combinedOrders?.length || 0
      });

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
      await Promise.all(ordersToUpdate.map(id => onUpdateStatus(id, newStatus)));

      // Update local state
      if (order) {
        const updatedMain = ordersToUpdate.includes(order.id)
          ? { ...order, status: newStatus }
          : order;
        const updatedCombined = (order.combinedOrders || []).map(o =>
          ordersToUpdate.includes(o.id) ? { ...o, status: newStatus } : o
        );

        setOrder({
          ...updatedMain,
          combinedOrders: updatedCombined
        });

        // Close chat drawer if open when main order is delivered
        if (isDrawerOpen && currentChatId === order.id && newStatus === "delivered") {
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
      console.log("🔍 [BatchDetails] Opening quantity modal for item:", item);
      console.log("🔍 [BatchDetails] Item product:", item.product);
      console.log("🔍 [BatchDetails] Item ProductName:", item.product?.ProductName);
      console.log("🔍 [BatchDetails] Barcode/SKU:", {
        barcode: item.product?.ProductName?.barcode || item.product?.barcode,
        sku: item.product?.ProductName?.sku || item.product?.sku
      });

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
    if (!order.Order_Items) return 0;

    // Filter items by targetOrderId if provided and we are in multi-shop mode
    let itemsToSum = order.Order_Items;
    if (!useAll && targetOrderId) {
      if (targetOrderId === order.id) {
        itemsToSum = order.Order_Items.filter(item => !(item as any).shopId || (item as any).shopId === order.shop?.id);
      } else {
        const targetSub = order.combinedOrders?.find(o => o.id === targetOrderId);
        const targetShopId = targetSub?.shop?.id;
        if (targetShopId) {
          itemsToSum = order.Order_Items.filter(item => (item as any).shopId === targetShopId);
        }
      }
    }

    const total = itemsToSum.filter((item) => item.found).reduce(
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
  const calculateOriginalSubtotal = (targetOrderId?: string) => {
    if (!order) return 0;

    // If no targetOrderId provided but we have an activeShopId in multi-shop mode, use active shop
    const effectiveTargetId = targetOrderId || (isMultiShop && activeShopId ?
      (activeShopId === order?.shop?.id ? order?.id : order?.combinedOrders?.find(o => o.shop?.id === activeShopId)?.id) :
      undefined);

    const useAll = !isMultiShop || !effectiveTargetId;

    // Sum for reels
    let reelSubtotal = 0;
    if (order.orderType === "reel" && (useAll || effectiveTargetId === order.id)) {
      reelSubtotal += parseFloat(order.reel?.Price || "0") * (order.quantity || 1);
    }
    order.combinedOrders?.forEach((sub: any) => {
      if (sub.orderType === "reel" && (useAll || effectiveTargetId === sub.id)) {
        reelSubtotal += parseFloat(sub.reel?.Price || "0") * (sub.quantity || 1);
      }
    });

    if (reelSubtotal > 0) return reelSubtotal;

    // For regular orders, calculate based on order items
    if (!order.Order_Items) return 0;

    let itemsToSum = order.Order_Items;
    if (!useAll && targetOrderId) {
      if (targetOrderId === order.id) {
        itemsToSum = order.Order_Items.filter(item => !(item as any).shopId || (item as any).shopId === order.shop?.id);
      } else {
        const targetSub = order.combinedOrders?.find(o => o.id === targetOrderId);
        const targetShopId = targetSub?.shop?.id;
        if (targetShopId) {
          itemsToSum = order.Order_Items.filter(item => (item as any).shopId === targetShopId);
        }
      }
    } else if (!useAll) {
      // If we ever need targeted subtotal in multi-shop summary, we'd filter here.
      // But summary usually shows active shop total.
      itemsToSum = order.Order_Items.filter((item: any) =>
        (item as any).shopId === (activeShopId || order.shop?.id)
      );
    }

    return itemsToSum.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Helper to get fees (summed for single shop, targeted for multi-shop)
  const getBatchFee = (type: 'serviceFee' | 'deliveryFee'): number => {
    if (!order) return 0;
    const targetId = paymentTargetOrderId || order.id;

    if (isMultiShop && paymentTargetOrderId) {
      if (targetId === order.id) return parseFloat(order[type]?.toString() || "0");
      const sub = order.combinedOrders?.find(o => o.id === targetId);
      return parseFloat(sub?.[type]?.toString() || "0");
    }

    // Sum for single shop or global
    let total = parseFloat(order[type]?.toString() || "0");
    order.combinedOrders?.forEach(sub => {
      total += parseFloat(sub[type]?.toString() || "0");
    });
    return total;
  };

  // Calculate tax amount (tax is included in the total, not added on top)
  const calculateTax = (totalAmount: number) => {
    if (!systemConfig?.tax) return 0;
    const taxRate = parseFloat(systemConfig.tax) / 100; // Convert percentage to decimal
    // If tax is included, we calculate: totalAmount * (taxRate / (1 + taxRate))
    return totalAmount * (taxRate / (1 + taxRate));
  };

  // Calculate the true total (subtotal - discount)
  const calculateTrueTotal = () => {
    const itemsSum = calculateOriginalSubtotal();
    const discount = order?.discount || 0;
    return itemsSum - discount;
  };

  // Calculate the true total based on found items (for shopping mode)
  const calculateFoundItemsTotal = () => {
    // Priority: 1. Payment target, 2. Active shop tab, 3. Main order
    const targetId = paymentTargetOrderId ||
      (activeShopId === order?.shop?.id ? order?.id : order?.combinedOrders?.find(o => o.shop?.id === activeShopId)?.id) ||
      order?.id;

    // For reel orders
    const targetOrder = targetId === order?.id ? order : order?.combinedOrders?.find(o => o.id === targetId);
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

    return allOrders.some(o => showStatuses.includes(o.status));
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
        const relevantItems = activeOrder.Order_Items || (order?.Order_Items?.filter(item =>
          !(item as any).shopId || (item as any).shopId === activeOrder.shop?.id
        ) || []);

        const hasFoundItems = relevantItems?.some((item: any) => item.found) || false;

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
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center ${theme === "dark"
                ? "border-yellow-600 bg-yellow-900/20"
                : "border-yellow-400 bg-yellow-50"
                }`}
            >
              <svg
                className={`mx-auto mb-3 h-12 w-12 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"
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
                className={`mb-4 font-semibold ${theme === "dark" ? "text-yellow-300" : "text-yellow-800"
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

    // Group sub-orders by customer
    const ordersByCustomer = new Map<string, any[]>();
    allOrders.forEach(o => {
      const customerId = (o as any).orderedBy?.id || o.customerId || 'unknown';
      if (!ordersByCustomer.has(customerId)) ordersByCustomer.set(customerId, []);
      ordersByCustomer.get(customerId)?.push(o);
    });

    return (
      <div className="space-y-6 px-3 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Route</h2>
        </div>

        <div className="space-y-4">
          {Array.from(ordersByCustomer.entries()).map(([customerId, orders], index) => {
            const firstOrder = orders[0];
            const customer = (firstOrder as any).orderedBy || (firstOrder as any).user ||
              { name: firstOrder.customerName || 'Customer' };
            const address = firstOrder.address;
            const isDelivered = orders.every(o => o.status === 'delivered');

            return (
              <div key={customerId} className={`relative rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800 ${isDelivered ? 'opacity-60 grayscale' : 'border-blue-200 shadow-md dark:border-blue-900'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {customer.name}
                        {customer.phone && <span className="ml-2 text-xs font-normal text-slate-500">• {customer.phone}</span>}
                      </h3>
                      <p className="text-xs text-gray-500">{orders.length} Order{orders.length > 1 ? 's' : ''} to deliver</p>
                    </div>
                  </div>
                  {isDelivered && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Completed
                    </span>
                  )}
                </div>

                <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                  <div className="flex items-start gap-2">
                    <svg className="mt-1 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {address?.street || firstOrder.customerAddress || 'No Address'}, {address?.city || ''}
                    </p>
                  </div>
                </div>

                {!isDelivered && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button appearance="primary" color="blue" block onClick={() => handleDirectionsClick(`${address?.street || firstOrder.customerAddress}, ${address?.city || ''}`)}>
                        Directions
                      </Button>
                      <Button appearance="ghost" color="violet" block onClick={() => handleChatClick(customerId, customer.name)}>
                        Chat
                      </Button>
                    </div>

                    <div className="space-y-3 pt-2">
                      {orders.map(o => (
                        <div key={o.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">#{o.OrderID || o.id.slice(-8)}</span>
                            <span className="text-[10px] font-bold text-slate-500">{(o as any).shop?.name || o.shopName}</span>
                          </div>
                          {getActionButton(o)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
              console.error(`❌ [Invoice Proof Check] Error for ${o.id}:`, error);
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

      // Fetching order details for ID

      fetch(`/api/shopper/orderDetails?id=${order.id}`)
        .then((res) => {
          // API response status
          return res.json();
        })
        .then((data) => {
          // API response data

          // Console log the initial orderDetails API response
          console.log("🔍 [BatchDetails] Initial orderDetails API response:", {
            order: data.order,
            combinedOrders: data.order?.combinedOrders,
            combinedOrdersCount: data.order?.combinedOrders?.length || 0,
            combinedOrderIds: data.order?.combinedOrders?.map((co: any) => ({ id: co.id, OrderID: co.OrderID })) || []
          });

          if (data.order) {
            // Transform the API response to match BatchDetails expected structure
            const transformOrderItems = (items: any[], shopId?: string, orderId?: string) => {
              return items?.map((item: any) => {

                // Handle both data formats: flattened (from orderDetails API) and nested (from combined orders API)
                const isNestedFormat = item.product && item.product.ProductName;

                let productId, productName, productImage, finalPrice, measurementUnit, productNameData;

                if (isNestedFormat) {
                  // Nested format from combined orders API
                  productId = item.product?.id || item.id;
                  productName = item.product?.ProductName?.name || "Unknown Product";
                  productImage = item.product?.ProductName?.image || item.product?.image || "/images/groceryPlaceholder.png";
                  finalPrice = item.product?.final_price || item.price?.toString() || "0";
                  measurementUnit = item.product?.measurement_unit || "item";
                  productNameData = {
                    id: item.product?.ProductName?.id || item.id,
                    name: item.product?.ProductName?.name || "Unknown Product",
                    description: item.product?.ProductName?.description || "",
                    barcode: item.product?.ProductName?.barcode || "",
                    sku: item.product?.ProductName?.sku || "",
                    image: item.product?.ProductName?.image || item.product?.image || "/images/groceryPlaceholder.png",
                    create_at: item.product?.ProductName?.create_at || new Date().toISOString(),
                  };
                } else {
                  // Flattened format from orderDetails API - use existing product data
                  productId = item.product?.id || item.id;
                  productName = item.product?.name || item.name;
                  productImage = item.product?.image || item.productImage || "/images/groceryPlaceholder.png";
                  finalPrice = item.product?.final_price || item.price?.toString() || "0";
                  measurementUnit = item.product?.measurement_unit || item.measurement_unit || "item";

                  // Use existing ProductName data from the flattened format
                  productNameData = item.product?.ProductName ? {
                    id: item.product.ProductName.id,
                    name: item.product.ProductName.name,
                    description: item.product.ProductName.description || "",
                    barcode: item.product.ProductName.barcode || "",
                    sku: item.product.ProductName.sku || "",
                    image: item.product.ProductName.image || item.productImage || "/images/groceryPlaceholder.png",
                    create_at: item.product.ProductName.create_at || new Date().toISOString(),
                  } : {
                    id: item.id, // Fallback to item.id if no ProductName data
                    name: item.name,
                    description: "",
                    barcode: item.barcode || "",
                    sku: item.sku || "",
                    image: item.productImage || "/images/groceryPlaceholder.png",
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
              }) || [];
            };

            let allItems = transformOrderItems(data.order.items || [], data.order.shop?.id, data.order.id);

            // If combined orders exist, aggregate their items too
            if (data.order.combinedOrders && data.order.combinedOrders.length > 0) {
              data.order.combinedOrders.forEach((subOrder: any) => {
                if (subOrder.items && subOrder.id !== data.order.id) {
                  const subItems = transformOrderItems(subOrder.items, subOrder.shop?.id, subOrder.id);
                  subOrder.Order_Items = subItems; // Attach for split view
                  allItems = [...allItems, ...subItems];
                }
              });
            }

            const transformedOrder = {
              ...data.order,
              Order_Items: allItems,
              combinedOrders: data.order.combinedOrders // Ensure this is passed through
            };

            // Console log the final transformed order with all combined data
            console.log("🔍 [BatchDetails] Final transformed order from orderDetails API:", {
              orderId: transformedOrder.id,
              OrderID: transformedOrder.OrderID,
              status: transformedOrder.status,
              combinedOrderId: transformedOrder.combinedOrderId,
              combinedOrdersCount: transformedOrder.combinedOrders?.length || 0,
              shopName: transformedOrder.shopName,
              shopNames: transformedOrder.shopNames,
              orderIds: transformedOrder.orderIds,
              orderIDs: transformedOrder.orderIDs,
              combinedOrdersDetails: transformedOrder.combinedOrders?.map((co: any) => ({
                id: co.id,
                OrderID: co.OrderID,
                status: co.status,
                shopName: co.shopName,
                itemsCount: co.items?.length || 0,
                total: co.total,
                ProductName: co.product?.ProductName
              })) || [],
              totalOrderItems: allItems.length
            });

            setOrder(transformedOrder);
            if (!activeShopId && data.order.shop?.id) {
              setActiveShopId(data.order.shop.id);
            }
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

  // Render item card helper
  const renderItemCard = (item: any) => (
    <div
      key={item.id}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 sm:gap-4 sm:p-4"
    >
      <div
        className="h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg sm:h-14 sm:w-14"
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
          width={56}
          height={56}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/groceryPlaceholder.png";
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
          {item.product.ProductName?.name ||
            "Unknown Product"}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Quantity: {item.quantity}{" "}
          {(item.product as any).measurement_unit || "pcs"}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(item.price * item.quantity)}
        </p>
        {item.found &&
          item.foundQuantity &&
          item.foundQuantity < item.quantity && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Found: {item.foundQuantity} of {item.quantity}
            </p>
          )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {(() => {
          // In combined orders, show Mark Found button if ANY order in the batch is shopping
          const allOrders = [order, ...(order.combinedOrders || [])];
          const isBatchShopping = allOrders.some(o => o.status === "shopping");
          return isBatchShopping;
        })() && (
          <button
            onClick={() =>
              toggleItemFound(item, !item.found)
            }
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-md transition-all duration-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${item.found
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg dark:from-green-600 dark:to-emerald-600 dark:shadow-green-900/50"
              : "border border-gray-300 bg-white text-gray-700 shadow-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:shadow-gray-900/50 dark:hover:border-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
              }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 sm:h-4 sm:w-4"
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
            <span>
              {item.found ? "Found" : "Mark Found"}
            </span>
          </button>
        )}
      </div>
    </div>
  );

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
        className={`min-h-screen ${theme === "dark"
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
          serviceFee={getBatchFee('serviceFee')}
          deliveryFee={getBatchFee('deliveryFee')}
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
          orderId={paymentTargetOrderId || (order && [order, ...(order.combinedOrders || [])].find(o => (o.shop?.id || o.shop_id) === activeShopId)?.id) || order?.id || ""}
          orderNumber={(order && [order, ...(order.combinedOrders || [])].find(o => o.id === (paymentTargetOrderId || (order && [order, ...(order.combinedOrders || [])].find(o => (o.shop?.id || o.shop_id) === activeShopId)?.id) || order?.id))?.OrderID) || order?.OrderID || order?.id.slice(-8) || ""}
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
        <main className="mx-auto w-full px-0 py-2 pb-20 sm:p-6 sm:pb-6">
          <div className="overflow-hidden rounded-none">
            {/* Header with gradient background */}
            <div
              className={`px-0 py-2 text-gray-900 dark:text-gray-100 sm:p-6`}
            >
              <div className="flex flex-row items-center justify-between gap-2 px-3 sm:gap-4 sm:px-0">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                  <Button
                    appearance="link"
                    onClick={() => router.back()}
                    className="flex flex-shrink-0 items-center px-0 text-base text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 sm:text-base"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-1 h-5 w-5 sm:mr-2 sm:h-5 sm:w-5"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                  <div className="h-5 w-px flex-shrink-0 bg-gray-300 dark:bg-gray-600 sm:h-6"></div>
                  <h1 className="min-w-0 truncate text-base font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                    <span className="hidden sm:inline">
                      {order.orderType === "reel"
                        ? "Reel Batch"
                        : "Regular Batch"}{" "}
                    </span>
                    {order.orderType === "reel"
                      ? "Reel Batch"
                      : "Regular Batch"}{" "}
                    #{((order as any).orderIDs && (order as any).orderIDs.length > 1)
                      ? (order as any).orderIDs.join(" & ")
                      : (order.OrderID || order.id.slice(0, 8))}
                  </h1>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                  {getStatusTag(order.status)}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 px-0 pb-3 pt-1 sm:space-y-8 sm:p-8">
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

              {/* Mobile Tabs - Only visible on mobile */}
              {shouldShowOrderDetails() && (
                <div className="border-b border-slate-200 dark:border-slate-700 sm:hidden">
                  <div className="flex">
                    <button
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "items"
                        ? "border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500"
                        : "text-slate-500 dark:text-slate-400"
                        }`}
                      onClick={() => setActiveTab("items")}
                    >
                      Items
                    </button>
                    <button
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "details"
                        ? "border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500"
                        : "text-slate-500 dark:text-slate-400"
                        }`}
                      onClick={() => setActiveTab("details")}
                    >
                      Other Details
                    </button>
                  </div>
                </div>
              )}

              {/* Main Info Grid - Hidden during shopping status on desktop, always visible in "Other Details" tab on mobile */}
              {shouldShowOrderDetails() && (order.status !== "shopping" || activeTab === "details") && (
                <div
                  className={`grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-2 ${activeTab === "details" ? "block" : "hidden sm:grid"
                    }`}
                >
                  {/* Shop/Reel Info */}
                  <div className="rounded-none border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                      <span
                        className={`inline-block rounded-full p-1.5 sm:p-2 ${order.orderType === "reel"
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
                        {/* Shop Image, Name, Address, and Contact Information */}
                        {(() => {
                          const uniqueShops = [];
                          const seenIds = new Set();

                          // Helper to add shop if unique
                          const addShop = (shop: any) => {
                            if (shop && shop.id && !seenIds.has(shop.id)) {
                              uniqueShops.push(shop);
                              seenIds.add(shop.id);
                            }
                          };

                          addShop(order.shop);
                          order.combinedOrders?.forEach(o => addShop(o.shop));

                          // Fallback if no shops found (shouldn't happen for valid orders)
                          if (uniqueShops.length === 0 && order.shop) uniqueShops.push(order.shop);

                          return uniqueShops.map((shop, index) => (
                            <div key={shop.id || index} className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600 sm:p-4">
                              <div className="flex gap-3 sm:gap-4">
                                {/* Shop Image */}
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-20 sm:w-20">
                                  {shop.image ? (
                                    <Image
                                      src={shop.image}
                                      alt={shop.name}
                                      width={80}
                                      height={80}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-400">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-6 w-6 sm:h-8 sm:w-8"
                                      >
                                        <rect
                                          x="3"
                                          y="3"
                                          width="18"
                                          height="18"
                                          rx="2"
                                        />
                                        <path d="M16 8h.01M8 16h.01M16 16h.01" />
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                {/* Shop Name and Address */}
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                                    {shop.name}
                                    {uniqueShops.length > 1 && <span className="ml-2 text-xs font-normal text-slate-500">(Store {index + 1})</span>}
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                                    {shop.address}
                                  </p>
                                </div>
                              </div>

                              {/* Contact Information */}
                              <div className="space-y-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-600 sm:text-base">
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
                                  {shop.phone ? (
                                    <a
                                      href={`tel:${shop.phone}`}
                                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                    >
                                      {shop.phone}
                                    </a>
                                  ) : (
                                    <span className="font-medium text-slate-500 dark:text-slate-400">
                                      N/A
                                    </span>
                                  )}
                                </div>

                                {/* Operating Hours */}
                                {shop.operating_hours && (
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
                                        const hoursObj = shop.operating_hours;
                                        if (
                                          hoursObj &&
                                          typeof hoursObj === "object"
                                        ) {
                                          const now = new Date();
                                          const dayKey = now
                                            .toLocaleDateString("en-US", {
                                              weekday: "long",
                                            })
                                            .toLowerCase();
                                          const todaysHours = (hoursObj as any)[
                                            dayKey
                                          ];
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

                              {/* Shop Directions Button */}
                              {shop.address && (
                                <div className="border-t border-slate-200 pt-3 dark:border-slate-600">
                                  <button
                                    onClick={() =>
                                      handleDirectionsClick(
                                        shop.address || ""
                                      )
                                    }
                                    className={`flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${theme === "dark"
                                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                      }`}
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="mr-2 h-4 w-4"
                                    >
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Directions to Shop
                                  </button>
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="rounded-none border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
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

                    {(() => {
                      const uniqueCustomers = [];
                      const seenCustomerIds = new Set();

                      const getCustomer = (o: any) => {
                        // Logic to extract customer object
                        if (o.orderedBy) return { ...o.orderedBy, address: o.address };
                        if (o.user) return { ...o.user, address: o.address };
                        return null;
                      };

                      const addCustomer = (o: any) => {
                        const c = getCustomer(o);
                        if (c && c.id && !seenCustomerIds.has(c.id)) {
                          uniqueCustomers.push(c);
                          seenCustomerIds.add(c.id);
                        }
                      };

                      addCustomer(order);
                      order.combinedOrders?.forEach(o => addCustomer(o));

                      // Fallback
                      if (uniqueCustomers.length === 0) {
                        const c = getCustomer(order);
                        if (c) uniqueCustomers.push(c);
                      }

                      return uniqueCustomers.map((customer, index) => (
                        <div key={customer.id || index} className="mb-4 space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600 sm:p-4 last:mb-0">
                          <div className="flex gap-3 sm:gap-4">
                            {/* Customer Avatar */}
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 sm:h-20 sm:w-20">
                              <Image
                                src={customer.profile_picture || "/images/userProfile.png"}
                                alt={customer.name || "Customer"}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Customer Name and Contact */}
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                                {customer.name || "Unknown Customer"}
                                {uniqueCustomers.length > 1 && <span className="ml-2 text-xs font-normal text-slate-500">(Customer {index + 1})</span>}
                              </h3>
                              {customer.phone && (
                                <p className="mt-1 flex items-center text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="mr-1.5 h-3.5 w-3.5"
                                  >
                                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {customer.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="space-y-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-600 sm:text-base">
                            <div className="flex items-start gap-2">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600 dark:text-slate-400"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  Delivery Address
                                </p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                  {customer.address?.street || "No street"},{" "}
                                  {customer.address?.city || "No city"}
                                  {customer.address?.postal_code
                                    ? `, ${customer.address.postal_code}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-center gap-3 border-t border-slate-200 pt-3 dark:border-slate-600 sm:justify-start">
                            {/* Directions Button */}
                            <button
                              onClick={() =>
                                handleDirectionsClick(
                                  `${customer.address?.street || "No street"}, ${customer.address?.city || "No city"}${customer.address?.postal_code ? `, ${customer.address.postal_code}` : ""
                                  }`
                                )
                              }
                              title="Directions to Customer"
                              className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${theme === "dark"
                                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                }`}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                            </button>

                            {/* Call Button */}
                            {customer.phone && (
                              <button
                                onClick={() => (window.location.href = `tel:${customer.phone}`)}
                                title="Call Customer"
                                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === "dark"
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                  }`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-5 w-5"
                                >
                                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </button>
                            )}

                            {/* Message Button - Only specific logic for main order, but we can enable for all if we have ID */}
                            {order.status !== "delivered" && (
                              <button
                                onClick={() => {
                                  // Only works for main order for now or needs update to handleChatClick to accept ID
                                  // If customer.id matches order.customerId, use existing handler
                                  // For now, simplify to just current handler if it's the main customer, or alert
                                  if (customer.id === ((order as any).orderedBy?.id || order.customerId)) {
                                    handleChatClick();
                                  } else {
                                    // TODO: Update handleChatClick to support passed ID
                                    handleChatClick();
                                  }
                                }}
                                title="Message Customer"
                                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${theme === "dark"
                                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                                  : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                                  }`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-5 w-5"
                                >
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Delivery Phase View */}
              {!shouldShowOrderDetails() && renderDeliveryPhase()}

              {/* Order Items */}
              {shouldShowOrderDetails() && (
                <div
                  className={`${activeTab === "items" ? "block" : "hidden sm:block"
                    }`}
                >
                  <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                      {order.orderType === "reel"
                        ? "Reel Details"
                        : "Order Items"}
                    </h2>
                  </div>

                  {order.orderType === "reel" ? (
                    <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 sm:p-4">
                      <div className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                        {order.reel?.Product}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Quantity: {order.quantity} pcs
                      </div>
                    </div>
                  ) : (
                    (() => {
                      // Group items by shopId
                      const itemsByShop = new Map<string, any[]>();

                      order.Order_Items?.forEach((item) => {
                        const shopId = (item as any).shopId || order.shop?.id || 'unknown';
                        if (!itemsByShop.has(shopId)) {
                          itemsByShop.set(shopId, []);
                        }
                        itemsByShop.get(shopId)?.push(item);
                      });

                      const allGroups = Array.from(itemsByShop.entries());
                      const groups = allGroups.filter(([shopId]) => {
                        const shopOrders = [order, ...(order.combinedOrders || [])]
                          .filter(o => (o.shop?.id || o.shop_id) === shopId);
                        // Hide shop tab if all its orders are on_the_way or finished
                        return shopOrders.some(o => o.status === "accepted" || o.status === "shopping");
                      });

                      // Auto-set activeShopId to the only visible shop if there's only one
                      if (groups.length === 1 && activeShopId !== groups[0][0]) {
                        console.log("🔍 [BatchDetails UI] Auto-setting activeShopId to only visible shop:", groups[0][0]);
                        setActiveShopId(groups[0][0]);
                      }

                      // Combined order shops rendering logic

                      const isSplit = groups.length > 1;


                      // Use current activeShopId if it's still in the visible groups, otherwise default to first available
                      const isCurrentlyActiveVisible = groups.some(([sid]) => sid === activeShopId);
                      const effectiveActiveShopId = isCurrentlyActiveVisible ? activeShopId : (groups.length > 0 ? groups[0][0] : null);

                      // Helper to get shop name
                      const getShopName = (sid: string) => {
                        if (sid === order.shop?.id) return order.shop?.name;
                        const sub = order.combinedOrders?.find((o: any) => o.shop?.id === sid);
                        if (sub) return sub.shop?.name;
                        return "Unknown Shop";
                      };

                      if (isSplit) {
                        return (
                          <div className="space-y-4">
                            {/* Shop Tabs Navigation */}
                            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {groups.map(([shopId], idx) => (
                                <button
                                  key={shopId}
                                  onClick={() => setActiveShopId(shopId)}
                                  className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 border-2 ${effectiveActiveShopId === shopId
                                    ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                    }`}
                                >
                                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${effectiveActiveShopId === shopId ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"
                                    }`}>
                                    {idx + 1}
                                  </span>
                                  {getShopName(shopId)}
                                </button>
                              ))}
                            </div>

                            {/* Active Shop Items */}
                            <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30 sm:p-6">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {getShopName(effectiveActiveShopId || "")} • {itemsByShop.get(effectiveActiveShopId || "")?.length || 0} Items
                              </h3>
                              <div className="space-y-2 sm:space-y-3">
                                {itemsByShop.get(effectiveActiveShopId || "")?.map(renderItemCard)}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Even in non-split mode, show only the active shop's items
                        const activeShopItems = itemsByShop.get(effectiveActiveShopId || "") || [];
                        return (
                          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30 sm:p-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {getShopName(effectiveActiveShopId || "")} • {activeShopItems.length} Items
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              {activeShopItems.map(renderItemCard)}
                            </div>
                          </div>
                        );
                      }
                    })()
                  )}
                </div>
              )}

              {/* Order Summary */}
              {shouldShowOrderDetails() && (
                <div
                  className={`overflow-hidden border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl ${order.status === "shopping"
                    ? "fixed bottom-[4.5rem] left-0 right-0 z-[9998] rounded-t-3xl border-x-0 border-b-0 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] sm:relative sm:bottom-auto sm:z-auto sm:rounded-2xl sm:border sm:shadow-lg"
                    : "rounded-t-2xl border-x-0 border-t-0 shadow-lg sm:rounded-2xl sm:border"
                    }`}
                >
                  {/* Header with Gradient */}
                  <div
                    className={`bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4 dark:from-green-900/20 dark:to-emerald-900/20 ${order.status === "shopping"
                      ? "cursor-pointer sm:cursor-default"
                      : ""
                      }`}
                    onClick={() => {
                      if (
                        order.status === "shopping" &&
                        window.innerWidth < 640
                      ) {
                        setIsSummaryExpanded(!isSummaryExpanded);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                          <svg
                            className="h-5 w-5 text-green-600 dark:text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Order Summary
                          </h2>
                          {order.status === "shopping" &&
                            !isSummaryExpanded && (
                              <span className="text-sm font-semibold text-green-600 dark:text-green-400 sm:hidden">
                                {formatCurrency(calculateFoundItemsTotal())}
                              </span>
                            )}
                        </div>
                      </div>
                      {order.status === "shopping" && (
                        <button
                          className="sm:hidden"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSummaryExpanded(!isSummaryExpanded);
                          }}
                        >
                          <svg
                            className={`h-6 w-6 text-gray-600 transition-transform dark:text-gray-400 ${isSummaryExpanded ? "rotate-180" : ""
                              }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`overflow-y-auto px-4 py-4 transition-all duration-300 ${order.status === "shopping" && !isSummaryExpanded
                      ? "hidden sm:block"
                      : ""
                      }`}
                    style={{
                      maxHeight:
                        order.status === "shopping" && isSummaryExpanded
                          ? "50vh"
                          : "auto",
                    }}
                  >
                    {order.orderType === "reel" ? (
                      (() => {
                        const itemsTotal = parseFloat(order.reel?.Price || "0") * (order.quantity || 1);
                        const discount = order.discount || 0;
                        const finalTotal = itemsTotal - discount;
                        const vat = finalTotal * (18 / 118);
                        const subtotal = finalTotal - vat;

                        return (
                          <>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                              <span>Subtotal</span>
                              <span className="font-medium">
                                {formatCurrency(subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                              <span>VAT (18%)</span>
                              <span className="font-medium">
                                {formatCurrency(vat)}
                              </span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                <span>Discount</span>
                                <span className="font-medium">
                                  -{formatCurrency(discount)}
                                </span>
                              </div>
                            )}
                            <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
                            <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                              <span className="font-bold text-gray-900 dark:text-white">
                                Order Total
                              </span>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(finalTotal)}
                              </span>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <>
                        {order.status === "shopping" && (
                          <>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                              <span>Items Found</span>
                              <span className="font-medium">
                                {getActiveShopItems.filter(
                                  (item) => item.found
                                ).length || 0}{" "}
                                / {getActiveShopItems.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                              <span>Units Found</span>
                              <span className="font-medium">
                                {getActiveShopItems.reduce((total, item) => {
                                  if (item.found) {
                                    return (
                                      total +
                                      (item.foundQuantity || item.quantity)
                                    );
                                  }
                                  return total;
                                }, 0) || 0}{" "}
                                /{" "}
                                {getActiveShopItems.reduce(
                                  (total, item) => total + item.quantity,
                                  0
                                ) || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                              <span>Units Not Found</span>
                              <span className="font-medium">
                                {getActiveShopItems.reduce((total, item) => {
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
                            <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                              <span>Refund Amount</span>
                              <span className="font-medium">
                                -
                                {formatCurrency(
                                  calculateOriginalSubtotal() -
                                  calculateFoundItemsTotal()
                                )}
                              </span>
                            </div>
                          </>
                        )}
                        {(() => {
                          const itemsTotal = order.status === "shopping"
                            ? calculateFoundItemsTotal()
                            : calculateOriginalSubtotal();
                          const discount = order.discount || 0;
                          const finalTotal = itemsTotal - discount;
                          const vat = finalTotal * (18 / 118);
                          const subtotal = finalTotal - vat;

                          // Order summary calculations completed

                          return (
                            <>
                              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>Subtotal</span>
                                <span className="font-medium">
                                  {formatCurrency(subtotal)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>VAT (18%)</span>
                                <span className="font-medium">
                                  {formatCurrency(vat)}
                                </span>
                              </div>
                              {discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                  <span>Discount</span>
                                  <span className="font-medium">
                                    -{formatCurrency(discount)}
                                  </span>
                                </div>
                              )}
                              <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
                              <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  Total
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(finalTotal)}
                                </span>
                              </div>
                            </>
                          );
                        })()}

                        {order.status === "shopping" && (
                          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                            <div className="flex gap-2">
                              <svg
                                className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>Note:</strong> The total reflects only
                                the value of found items. Service fee (
                                {formatCurrency(
                                  parseFloat(order.serviceFee || "0")
                                )}
                                ) and delivery fee (
                                {formatCurrency(
                                  parseFloat(order.deliveryFee || "0")
                                )}
                                ) were already added to your wallet as
                                earnings when you started shopping.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Notes */}
              {(order.deliveryNotes || order.deliveryNote) && (
                <div
                  className={`${activeTab === "details" ? "block" : "hidden sm:block"
                    } mt-3`}
                >
                  <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                      Delivery Notes
                    </h2>
                  </div>
                  <div className="mx-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20 sm:mx-0 sm:p-4">
                    <div className="flex gap-2">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-amber-900 dark:text-amber-100 sm:text-base">
                        {order.deliveryNotes || order.deliveryNote}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="hidden pt-2 sm:block sm:pt-4">
                {(() => {
                  const actionOrder = activeShopId === order?.shop?.id
                    ? order
                    : order?.combinedOrders?.find(o => o.shop?.id === activeShopId);

                  // Action button info calculated

                  return getActionButton(actionOrder);
                })()}
              </div>
            </div>
          </div>
        </main >

        {/* Fixed Bottom Action Button - Mobile Only */}
        < div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:hidden" >
          {(() => {
            const actionOrder = activeShopId === order?.shop?.id
              ? order
              : order?.combinedOrders?.find(o => o.shop?.id === activeShopId);

            return getActionButton(actionOrder);
          })()}
        </div >
      </div >
    </>
  );
}
