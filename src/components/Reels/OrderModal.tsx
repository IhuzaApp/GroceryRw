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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [priceBounce, setPriceBounce] = useState(false);

  // Trigger price bounce on quantity change
  useEffect(() => {
    setPriceBounce(true);
    const timer = setTimeout(() => setPriceBounce(false), 400);
    return () => clearTimeout(timer);
  }, [quantity]);
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
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 p-0 backdrop-blur-md transition-all duration-300 sm:items-center sm:p-4"
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
        className="flex w-full max-w-[550px] flex-col overflow-hidden rounded-t-[2rem] bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl dark:bg-gray-900/90 sm:max-h-[85vh] sm:rounded-[1.5rem]"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: isMobile ? "calc(100vh - 8vh)" : "auto",
          maxHeight: isMobile ? "calc(100vh - 8vh)" : "85vh",
          marginBottom: 0,
          border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-transparent px-6 py-5 dark:border-white/5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Place Your Order
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ready in 30-45 mins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:scale-90 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-white" />
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
                  className={`relative overflow-hidden rounded-3xl p-6 transition-all border ${
                    theme === "dark"
                      ? "border-white/5 bg-white/5"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:bg-green-500/20 dark:text-green-400">
                        Featured Item
                      </div>
                      <h3
                        className={`text-xl font-bold leading-tight ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {post.content?.title || "Item from reel"}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {post.content?.description}
                      </p>
                    </div>
                    <div className={`ml-4 flex flex-col items-end transition-transform duration-300 ${priceBounce ? "scale-110" : "scale-100"}`}>
                      <p
                        className={`text-2xl font-black ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(basePrice)}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Unit Price
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="flex items-center justify-between rounded-3xl bg-gray-100/50 p-4 dark:bg-white/5">
                  <div className="space-y-0.5">
                    <label className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Select Quantity
                    </label>
                    <p className="text-xs text-gray-500">Max. 50 items per order</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all hover:bg-gray-50 active:scale-90 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(50, quantity + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-90"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Delivery Address Selection */}
                <div className={`rounded-3xl p-6 border transition-all ${theme === "dark" ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Delivery Address
                  </label>
                  {loadingAddresses ? (
                    <div className="flex items-center gap-3 py-2">
                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                       <span className="text-sm font-medium text-gray-500">Loading your addresses...</span>
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <p className="text-sm font-medium text-red-400">No saved addresses found. Please add one in your profile.</p>
                  ) : (
                    <div className="relative group">
                      <select
                        value={selectedAddressId || ""}
                        onChange={(e) => handleAddressChange(e.target.value || null)}
                        className={`w-full appearance-none rounded-2xl border-2 px-5 py-4 text-base font-bold transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${
                          theme === "dark"
                            ? "border-white/5 bg-gray-800 text-white focus:border-green-500/50"
                            : "border-gray-100 bg-white text-gray-900 focus:border-green-500/50"
                        }`}
                      >
                        {savedAddresses.map((address: any) => (
                          <option key={address.id} value={address.id}>
                            {address.street}, {address.city} {address.is_default ? "★" : ""}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div className={`rounded-3xl p-6 border transition-all ${theme === "dark" ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Special Instructions
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${
                      theme === "dark"
                        ? "border-white/5 bg-gray-800 text-white placeholder-gray-600 focus:border-green-500/50"
                        : "border-gray-100 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500/50"
                    }`}
                    placeholder="E.g. Ring the bell, extra spicy, etc."
                  />
                </div>

                {/* Payment Method */}
                <div className={`rounded-3xl p-6 border transition-all ${theme === "dark" ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Payment Method
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Default Option */}
                    <button
                      onClick={() => setUseDefaultPayment(true)}
                      className={`relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                        useDefaultPayment
                          ? "border-green-500 bg-green-500/5 ring-4 ring-green-500/10"
                          : "border-transparent bg-white shadow-sm hover:border-gray-200 dark:bg-gray-800 dark:hover:border-white/10"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${useDefaultPayment ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-white/5"}`}>
                         <CreditCard className="h-4 w-4" />
                      </div>
                      <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Default</span>
                      {defaultPaymentMethod && (
                        <span className="text-[10px] font-medium text-gray-500 break-all">
                          {defaultPaymentMethod.type === "momo" ? "MTN MoMo" : "Credit Card"}
                        </span>
                      )}
                      {useDefaultPayment && (
                        <div className="absolute right-3 top-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                             <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>

                    {/* Manual Entry */}
                    <button
                      onClick={() => setUseDefaultPayment(false)}
                      className={`relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                        !useDefaultPayment
                          ? "border-green-500 bg-green-500/5 ring-4 ring-green-500/10"
                          : "border-transparent bg-white shadow-sm hover:border-gray-200 dark:bg-gray-800 dark:hover:border-white/10"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${!useDefaultPayment ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-white/5"}`}>
                         <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Manual</span>
                      <span className="text-[10px] font-medium text-gray-500">New Phone Number</span>
                      {!useDefaultPayment && (
                        <div className="absolute right-3 top-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                             <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  {!useDefaultPayment && (
                    <div className="mt-4 animate-content">
                      <input
                        type="tel"
                        value={manualPhoneNumber}
                        onChange={(e) => setManualPhoneNumber(e.target.value)}
                        placeholder="e.g. 078XXXXXXX"
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${
                          theme === "dark"
                            ? "border-white/5 bg-gray-800 text-white placeholder-gray-600 focus:border-green-500/50"
                            : "border-gray-100 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500/50"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className={`rounded-3xl p-6 border transition-all ${theme === "dark" ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                  <div className="mb-6 flex items-center justify-between">
                    <h4 className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Detailed Summary
                    </h4>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      <Tag className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Subtotal ({quantity} items)</span>
                      <span className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatCurrency(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-green-500">Discount Applied</span>
                        <span className="font-bold text-green-500">-{formatCurrency(discount)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Delivery Fee</span>
                        {subtotal > 30000 && <span className="text-[10px] font-black uppercase text-green-500">50% Loyalty Discount</span>}
                      </div>
                      <span className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatCurrency(deliveryFee)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`relative border-t p-6 pb-8 backdrop-blur-xl transition-all duration-300 sm:p-8 ${
            theme === "dark" ? "border-white/5 bg-gray-900/60" : "border-gray-100 bg-white/80"
          }`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Price</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black tracking-tight transition-transform duration-300 ${priceBounce ? "scale-105 text-green-500" : (theme === "dark" ? "text-white" : "text-gray-900")}`}>
                    {formatCurrency(finalTotal)}
                  </span>
                  <span className="text-sm font-bold text-gray-400">RWF</span>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => {/* Show Breakdown */}}
                  className="text-xs font-bold text-green-500 hover:text-green-600"
                >
                  View Tax Details
                </button>
              </div>
            </div>

            <div className="flex w-full gap-4">
              <button
                onClick={handlePlaceOrder}
                disabled={isOrderLoading || configLoading}
                className={`flex flex-1 items-center justify-center gap-3 rounded-[1.25rem] py-4 text-base font-black text-white transition-all duration-300 active:scale-[0.98] ${
                  isOrderLoading || configLoading
                    ? "cursor-not-allowed bg-gray-700/50 text-gray-500"
                    : "bg-green-600 shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:bg-green-500 hover:shadow-[0_15px_40px_rgba(34,197,94,0.4)]"
                }`}
              >
                {isOrderLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Complete Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes headerIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes contentIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-header { animation: headerIn 0.4s ease-out forwards; }
        .animate-content { animation: contentIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
