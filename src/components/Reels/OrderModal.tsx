"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingCart,
  Package,
  MessageSquare,
  Tag,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "../../lib/formatCurrency";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";

interface PaymentMethod {
  type: "refund" | "card" | "momo";
  id?: string;
  number?: string;
}

interface SystemConfiguration {
  baseDeliveryFee: string;
  serviceFee: string;
  shoppingTime: string;
  unitsSurcharge: string;
  extraUnits: string;
  cappedDistanceFee: string;
  distanceSurcharge: string;
  currency: string;
  discounts: boolean;
  id: string;
  deliveryCommissionPercentage: string;
  productCommissionPercentage: string;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  post: any; // The reel post data
  shopLat: number;
  shopLng: number;
  shopAlt: number;
  shopId: string;
}

// Helper function to compute distance between two coordinates
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function OrderModal({
  open,
  onClose,
  post,
  shopLat,
  shopLng,
  shopAlt,
  shopId,
}: OrderModalProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState("");
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(
    null
  );
  const [configLoading, setConfigLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [defaultPaymentMethod, setDefaultPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [useDefaultPayment, setUseDefaultPayment] = useState(true);
  const [manualPhoneNumber, setManualPhoneNumber] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch system configuration
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        setConfigLoading(true);
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();

        if (data.success && data.config) {
          setSystemConfig(data.config);
        }
      } catch (error) {
        console.error("Error fetching system configuration:", error);
      } finally {
        setConfigLoading(false);
      }
    };

    if (open) {
      fetchSystemConfig();
    }
  }, [open]);

  // Fetch addresses on modal open
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const response = await fetch("/api/queries/addresses");
        const data = await response.json();

        if (data.addresses) {
          setSavedAddresses(data.addresses);

          // Set default address if available
          const defaultAddr = data.addresses.find((a: any) => a.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            Cookies.set("delivery_address", JSON.stringify(defaultAddr));
          } else if (data.addresses.length > 0) {
            // Use first address if no default
            setSelectedAddressId(data.addresses[0].id);
            Cookies.set("delivery_address", JSON.stringify(data.addresses[0]));
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    if (open) {
      fetchAddresses();
    }
  }, [open]);

  // Fetch default payment method
  useEffect(() => {
    const fetchDefaultPaymentMethod = async () => {
      try {
        const response = await fetch("/api/queries/payment-methods");
        const data = await response.json();
        const defaultMethod = data.paymentMethods?.find(
          (m: any) => m.is_default
        );

        if (defaultMethod) {
          const defaultPayment: PaymentMethod = {
            type:
              defaultMethod.method.toLowerCase() === "mtn momo"
                ? "momo"
                : "card",
            id: defaultMethod.id,
            number: defaultMethod.number,
          };
          setDefaultPaymentMethod(defaultPayment);
          setSelectedPaymentMethod(defaultPayment);
        }
      } catch (error) {
        console.error("Error fetching default payment method:", error);
      } finally {
        setLoadingPayment(false);
      }
    };

    if (open) {
      fetchDefaultPaymentMethod();
      setUseDefaultPayment(true);
      setManualPhoneNumber("");
    }
  }, [open]);

  // Update selected payment method when switching between default and manual
  useEffect(() => {
    if (useDefaultPayment && defaultPaymentMethod) {
      setSelectedPaymentMethod(defaultPaymentMethod);
    } else if (!useDefaultPayment && manualPhoneNumber.trim()) {
      setSelectedPaymentMethod({
        type: defaultPaymentMethod?.type || "momo",
        number: manualPhoneNumber.trim(),
      });
    } else if (!useDefaultPayment) {
      setSelectedPaymentMethod(null);
    }
  }, [useDefaultPayment, defaultPaymentMethod, manualPhoneNumber]);

  // Get selected address
  const selectedAddress = selectedAddressId
    ? savedAddresses.find((a: any) => a.id === selectedAddressId)
    : null;

  // Handle address selection change
  const handleAddressChange = (addressId: string | null) => {
    setSelectedAddressId(addressId);
    if (addressId) {
      const address = savedAddresses.find((a: any) => a.id === addressId);
      if (address) {
        Cookies.set("delivery_address", JSON.stringify(address));
      }
    }
  };

  // Calculate fees and totals
  const basePrice = post?.restaurant?.price || post?.product?.price || 0;
  const subtotal = basePrice * quantity;

  // Service fee is always 0 for reel orders
  const serviceFee = 0;

  // Delivery Fee calculations for reel orders
  // Note: Reel orders don't have units surcharge
  const baseDeliveryFee = systemConfig
    ? parseInt(systemConfig.baseDeliveryFee)
    : 0;

  // Surcharge based on distance beyond 3km
  // Use selected address first, then fallback to cookie
  let distanceKm = 0;
  let userAlt = 0;

  if (
    selectedAddress &&
    selectedAddress.latitude &&
    selectedAddress.longitude
  ) {
    const userLat = parseFloat(selectedAddress.latitude.toString());
    const userLng = parseFloat(selectedAddress.longitude.toString());
    userAlt = parseFloat((selectedAddress.altitude || "0").toString());
    distanceKm = getDistanceFromLatLonInKm(userLat, userLng, shopLat, shopLng);
  } else {
    // Fallback to cookie
    const cookie = Cookies.get("delivery_address");
    if (cookie) {
      try {
        const userAddr = JSON.parse(cookie);
        if (userAddr.latitude && userAddr.longitude) {
          const userLat = parseFloat(userAddr.latitude.toString());
          const userLng = parseFloat(userAddr.longitude.toString());
          userAlt = parseFloat((userAddr.altitude || "0").toString());
          distanceKm = getDistanceFromLatLonInKm(
            userLat,
            userLng,
            shopLat,
            shopLng
          );
        }
      } catch (err) {
        console.error("Error parsing delivery_address cookie:", err);
      }
    }
  }

  const extraDistance = Math.max(0, distanceKm - 3);
  const distanceSurcharge =
    Math.ceil(extraDistance) *
    (systemConfig ? parseInt(systemConfig.distanceSurcharge) : 0);

  // Cap the distance-based delivery fee (before units) at cappedDistanceFee
  const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
  const cappedDistanceFee = systemConfig
    ? parseInt(systemConfig.cappedDistanceFee)
    : 0;
  const finalDistanceFee =
    rawDistanceFee > cappedDistanceFee ? cappedDistanceFee : rawDistanceFee;

  // Apply 50% discount on delivery fee if subtotal > 30,000
  // Note: Reel orders don't have units surcharge, only distance-based fee
  let deliveryFee = finalDistanceFee;
  let deliveryFeeDiscount = 0;
  const originalDeliveryFee = finalDistanceFee;

  if (subtotal > 30000) {
    deliveryFeeDiscount = finalDistanceFee * 0.5; // 50% discount
    deliveryFee = finalDistanceFee * 0.5; // Final delivery fee after discount
  }

  const finalTotal = subtotal - discount + serviceFee + deliveryFee;

  // Handle promo code application
  const handleApplyPromo = () => {
    const discountsEnabled = systemConfig ? systemConfig.discounts : false;

    if (!discountsEnabled) {
      toast.error("Discounts are currently disabled in the system.");
      return;
    }

    const PROMO_CODES: { [code: string]: number } = {
      SAVE10: 0.1,
      SAVE20: 0.2,
    };

    const code = promoCode.trim().toUpperCase();

    if (PROMO_CODES[code]) {
      setDiscount(subtotal * PROMO_CODES[code]);
      setAppliedPromo(code);
      toast.success("Promo code applied successfully!");
    } else {
      setDiscount(0);
      setAppliedPromo(null);
      toast.error("Invalid promo code.");
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    // Validate delivery address
    if (!selectedAddressId || !selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    const deliveryAddressId = selectedAddress.id;
    if (!deliveryAddressId) {
      toast.error("Please select a valid delivery address.");
      return;
    }

    setIsOrderLoading(true);
    try {
      // Calculate delivery time
      const shoppingTime = systemConfig
        ? parseInt(systemConfig.shoppingTime)
        : 0;

      // Get user altitude from selected address
      const userAltFromAddress = selectedAddress?.altitude
        ? parseFloat(selectedAddress.altitude.toString())
        : 0;
      const altKm = (shopAlt - userAltFromAddress) / 1000;
      const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
      const travelTime = Math.ceil(distance3D);
      const totalTimeMinutes = travelTime + shoppingTime;
      const deliveryDate = new Date(Date.now() + totalTimeMinutes * 60000);
      const deliveryTimestamp = deliveryDate.toISOString();

      // Prepare reel order payload
      // Service fee is always 0 for reel orders
      const payload = {
        reel_id: post.id,
        quantity: quantity,
        total: finalTotal.toString(),
        service_fee: "0", // Always 0 for reel orders
        delivery_fee: deliveryFee.toString(),
        discount: discount > 0 ? discount.toString() : null,
        voucher_code: appliedPromo || null,
        delivery_time: deliveryTimestamp,
        delivery_note: comments || "",
        delivery_address_id: deliveryAddressId,
      };

      const res = await fetch("/api/reel-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      toast.success("Your order has been placed successfully!");

      // Close modal only
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Order placement error:", err);
      toast.error(err.message || "Order placement failed");
    } finally {
      setIsOrderLoading(false);
    }
  };

  // Render payment method display
  const renderPaymentMethod = () => {
    if (loadingPayment) {
      return (
        <div className="flex items-center">
          <div className="mr-3 h-8 w-12 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
        </div>
      );
    }

    if (!selectedPaymentMethod) {
      return (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg
            className="mr-2 h-4 w-4"
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
          No payment method selected
        </div>
      );
    }

    const getPaymentIcon = () => {
      switch (selectedPaymentMethod.type) {
        case "refund":
          return (
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          );
        case "momo":
          return (
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          );
        default:
          return (
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          );
      }
    };

    const getPaymentColor = () => {
      switch (selectedPaymentMethod.type) {
        case "refund":
          return "bg-green-600";
        case "momo":
          return "bg-pink-600";
        default:
          return "bg-blue-600";
      }
    };

    return (
      <div className="flex items-center">
        <div
          className={`mr-3 flex items-center justify-center rounded-lg ${getPaymentColor()} p-2 text-xs text-white`}
        >
          {getPaymentIcon()}
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedPaymentMethod.type === "refund"
              ? "Using Refund Balance"
              : selectedPaymentMethod.type === "momo"
              ? `MTN MoMo ${
                  selectedPaymentMethod.number
                    ? `•••• ${selectedPaymentMethod.number.slice(-3)}`
                    : ""
                }`
              : `Card ${
                  selectedPaymentMethod.number
                    ? `•••• ${selectedPaymentMethod.number.slice(-4)}`
                    : ""
                }`}
          </span>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {selectedPaymentMethod.type === "refund"
              ? "Available balance will be used"
              : selectedPaymentMethod.type === "momo"
              ? useDefaultPayment && defaultPaymentMethod
                ? "Using default payment method"
                : !useDefaultPayment && manualPhoneNumber
                ? "Using manually entered phone number"
                : "Mobile money payment"
              : "Credit/Debit card payment"}
          </p>
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        className="flex w-full max-w-[550px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-gray-800 sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: isMobile ? "calc(100vh - 5vh)" : "auto",
          maxHeight: isMobile ? "calc(100vh - 5vh)" : "90vh",
          marginBottom: 0,
        }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
              <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Place Your Order
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Review and confirm your order details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          <div className="mx-auto max-w-2xl space-y-4">
            {configLoading ? (
              <div className="space-y-4">
                {/* Loading Skeletons */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border-2 p-6 ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div
                      className={`mb-4 h-5 w-32 animate-pulse rounded ${
                        theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="space-y-3">
                      <div
                        className={`h-4 w-full animate-pulse rounded ${
                          theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`h-4 w-3/4 animate-pulse rounded ${
                          theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Item Details */}
                <div
                  className={`rounded-2xl border-2 p-6 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        theme === "dark" ? "bg-green-600" : "bg-green-100"
                      }`}
                    >
                      <Package
                        className={`h-5 w-5 ${
                          theme === "dark" ? "text-white" : "text-green-600"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      Item Details
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p
                        className={`text-lg font-medium ${
                          theme === "dark" ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {post.content?.title || "Item from reel"}
                      </p>
                      <p
                        className={`mt-1 text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {post.content?.description}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(basePrice)}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        per item
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Quantity *
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all hover:bg-gray-50 active:scale-95 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const numValue = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(50, numValue)));
                      }}
                      min={1}
                      max={50}
                      className={`w-24 rounded-xl border-2 py-3 text-center text-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                      }`}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(50, quantity + 1))}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all hover:bg-gray-50 active:scale-95 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Delivery Address Selection */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Delivery Address *
                  </label>
                  {loadingAddresses ? (
                    <div
                      className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                      <span
                        className={`ml-2 text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Loading addresses...
                      </span>
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div
                      className={`rounded-xl border-2 p-4 text-center ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-300"
                          : "border-gray-300 bg-white text-gray-600"
                      }`}
                    >
                      <p className="text-sm">
                        No saved addresses. Please add an address first.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedAddressId || ""}
                      onChange={(e) =>
                        handleAddressChange(e.target.value || null)
                      }
                      className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-100 focus:border-green-500"
                          : "border-gray-300 bg-white text-gray-900 focus:border-green-500"
                      }`}
                    >
                      {savedAddresses.map((address: any) => (
                        <option key={address.id} value={address.id}>
                          {address.street}, {address.city}
                          {address.is_default ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  {selectedAddress && (
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {selectedAddress.street}, {selectedAddress.city}
                      {selectedAddress.postal_code &&
                        `, ${selectedAddress.postal_code}`}
                    </p>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Special Instructions
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                    }`}
                    placeholder="Add any special instructions or comments..."
                  />
                </div>

                {/* Promo Code - Hidden for now */}
                {/* <div className="space-y-2">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Promo Code
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div
                        className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
                      >
                        <Tag
                          className={`h-5 w-5 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      className={`rounded-xl border-2 px-6 py-3 font-semibold transition-all duration-200 active:scale-95 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div
                      className={`mt-3 rounded-xl border-l-4 p-3 ${
                        theme === "dark"
                          ? "border-green-500 bg-green-900/20 text-green-300"
                          : "border-green-500 bg-green-50 text-green-800"
                      }`}
                    >
                      <p className="flex items-center text-sm font-semibold">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Promo code &quot;{appliedPromo}&quot; applied!
                      </p>
                    </div>
                  )}
                </div> */}

                {/* Payment Method */}
                <div className="space-y-3">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Payment Method
                  </label>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    {/* Use Default Option */}
                    <div
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        useDefaultPayment
                          ? theme === "dark"
                            ? "border-green-500 bg-green-900/20"
                            : "border-green-500 bg-green-50"
                          : theme === "dark"
                          ? "border-gray-600 bg-gray-800 hover:border-gray-500"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      onClick={() => setUseDefaultPayment(true)}
                    >
                      <input
                        type="radio"
                        checked={useDefaultPayment}
                        onChange={() => setUseDefaultPayment(true)}
                        className="h-4 w-4 cursor-pointer text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              theme === "dark"
                                ? "text-gray-100"
                                : "text-gray-800"
                            }`}
                          >
                            Use Default Payment Method
                          </span>
                        </div>
                        {defaultPaymentMethod && (
                          <p
                            className={`mt-1 text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {defaultPaymentMethod.type === "momo"
                              ? `MTN MoMo •••• ${defaultPaymentMethod.number?.slice(
                                  -3
                                )}`
                              : `Card •••• ${defaultPaymentMethod.number?.slice(
                                  -4
                                )}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Manual Entry Option */}
                    <div
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                        !useDefaultPayment
                          ? theme === "dark"
                            ? "border-green-500 bg-green-900/20"
                            : "border-green-500 bg-green-50"
                          : theme === "dark"
                          ? "border-gray-600 bg-gray-800 hover:border-gray-500"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      onClick={() => setUseDefaultPayment(false)}
                    >
                      <input
                        type="radio"
                        checked={!useDefaultPayment}
                        onChange={() => setUseDefaultPayment(false)}
                        className="mt-1 h-4 w-4 cursor-pointer text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              theme === "dark"
                                ? "text-gray-100"
                                : "text-gray-800"
                            }`}
                          >
                            Enter Phone Number Manually
                          </span>
                        </div>
                        {!useDefaultPayment && (
                          <div className="mt-3">
                            <div className="relative">
                              <div
                                className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
                              >
                                <svg
                                  className={`h-5 w-5 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                              </div>
                              <input
                                type="tel"
                                value={manualPhoneNumber}
                                onChange={(e) =>
                                  setManualPhoneNumber(e.target.value)
                                }
                                placeholder="Enter phone number"
                                className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                  theme === "dark"
                                    ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500"
                                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current Selection Display */}
                  {selectedPaymentMethod && (
                    <div
                      className={`mt-3 rounded-xl border-2 p-4 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-800"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {renderPaymentMethod()}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div
                  className={`rounded-2xl border-2 p-6 ${
                    theme === "dark"
                      ? "border-green-600 bg-green-900/20"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        theme === "dark" ? "bg-green-600" : "bg-green-100"
                      }`}
                    >
                      <CheckCircle
                        className={`h-5 w-5 ${
                          theme === "dark" ? "text-white" : "text-green-600"
                        }`}
                      />
                    </div>
                    <h4
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      Order Summary
                    </h4>
                  </div>

                  <div
                    className={`mb-4 flex items-center justify-between rounded-xl p-4 ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Total Amount to be Paid
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Including all fees
                      </p>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(finalTotal)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2">
                      <span
                        className={`${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Subtotal ({quantity} items)
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between py-2">
                        <span
                          className={
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }
                        >
                          Discount
                        </span>
                        <span
                          className={`font-medium ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}
                    {subtotal > 30000 && deliveryFeeDiscount > 0 && (
                      <>
                        <div className="flex items-center justify-between py-2">
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            Delivery Fee (Original)
                          </span>
                          <span
                            className={`font-medium line-through ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(originalDeliveryFee)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-green-600 dark:text-green-400">
                            Delivery Fee Discount (50% off)
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            -{formatCurrency(deliveryFeeDiscount)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span
                        className={`${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Delivery Fee
                        {subtotal > 30000 && (
                          <span
                            className={`ml-2 text-xs ${
                              theme === "dark"
                                ? "text-green-400"
                                : "text-green-600"
                            }`}
                          >
                            (50% off)
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {formatCurrency(deliveryFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex flex-shrink-0 items-center justify-end gap-3 border-t p-4 sm:p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={isOrderLoading || configLoading}
              className={`rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                isOrderLoading || configLoading
                  ? "cursor-not-allowed border border-gray-400 text-gray-400"
                  : theme === "dark"
                  ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isOrderLoading || configLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                isOrderLoading || configLoading
                  ? "cursor-not-allowed bg-gray-400"
                  : theme === "dark"
                  ? "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                  : "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
              }`}
            >
              {isOrderLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
