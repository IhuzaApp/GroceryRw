"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  InputNumber,
  Radio,
  toaster,
  Notification,
} from "rsuite";
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
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Theme-aware styling
  const isDark = theme === "dark";
  const themeStyles = {
    container: isDark
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50"
      : "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/50",
    header: isDark
      ? "bg-gradient-to-r from-emerald-600 to-teal-600"
      : "bg-gradient-to-r from-emerald-500 to-teal-500",
    section: isDark
      ? "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30"
      : "bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-gray-200/50",
    sectionDark: isDark
      ? "bg-slate-800/50 border-slate-600/30"
      : "bg-gray-100/80 border-gray-200/50",
    textPrimary: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-slate-300" : "text-gray-600",
    textMuted: isDark ? "text-slate-400" : "text-gray-500",
    input: isDark
      ? { backgroundColor: "#1e293b", borderColor: "#475569", color: "white" }
      : {
          backgroundColor: "#ffffff",
          borderColor: "#d1d5db",
          color: "#111827",
        },
    button: isDark
      ? "bg-slate-700 hover:bg-slate-600"
      : "bg-gray-200 hover:bg-gray-300",
    footer: isDark
      ? "bg-slate-800/50 border-slate-700/50"
      : "bg-gray-50/80 border-gray-200/50",
    orderSummary: isDark
      ? "bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500/30"
      : "bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200/50",
    skeleton: isDark ? "bg-slate-700" : "bg-gray-300",
  };

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
          setSelectedPaymentMethod({
            type:
              defaultMethod.method.toLowerCase() === "mtn momo"
                ? "momo"
                : "card",
            id: defaultMethod.id,
            number: defaultMethod.number,
          });
        }
      } catch (error) {
        console.error("Error fetching default payment method:", error);
      } finally {
        setLoadingPayment(false);
      }
    };

    if (open) {
      fetchDefaultPaymentMethod();
    }
  }, [open]);

  // Calculate fees and totals
  const basePrice = post?.restaurant?.price || post?.product?.price || 0;
  const subtotal = basePrice * quantity;

  // Service and Delivery Fee calculations
  const serviceFee = systemConfig ? parseInt(systemConfig.serviceFee) : 0;
  const baseDeliveryFee = systemConfig
    ? parseInt(systemConfig.baseDeliveryFee)
    : 0;

  // Surcharge based on units beyond extraUnits threshold
  const extraUnitsThreshold = systemConfig
    ? parseInt(systemConfig.extraUnits)
    : 0;
  const extraUnits = Math.max(0, quantity - extraUnitsThreshold);
  const unitsSurcharge =
    extraUnits * (systemConfig ? parseInt(systemConfig.unitsSurcharge) : 0);

  // Surcharge based on distance beyond 3km
  let distanceKm = 0;
  let userAlt = 0;
  const cookie = Cookies.get("delivery_address");
  if (cookie) {
    try {
      const userAddr = JSON.parse(cookie);
      const userLat = parseFloat(userAddr.latitude);
      const userLng = parseFloat(userAddr.longitude);
      userAlt = parseFloat(userAddr.altitude || "0");
      distanceKm = getDistanceFromLatLonInKm(
        userLat,
        userLng,
        shopLat,
        shopLng
      );
    } catch (err) {
      console.error("Error parsing delivery_address cookie:", err);
    }
  }

  const extraDistance = Math.max(0, distanceKm - 3);
  const distanceSurcharge =
    Math.ceil(extraDistance) *
    (systemConfig ? parseInt(systemConfig.distanceSurcharge) : 0);

  // Cap the distance-based delivery fee
  const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
  const cappedDistanceFee = systemConfig
    ? parseInt(systemConfig.cappedDistanceFee)
    : 0;
  const finalDistanceFee =
    rawDistanceFee > cappedDistanceFee ? cappedDistanceFee : rawDistanceFee;

  // Final delivery fee includes unit surcharge
  const deliveryFee = finalDistanceFee + unitsSurcharge;
  const finalTotal = subtotal - discount + serviceFee + deliveryFee;

  // Handle promo code application
  const handleApplyPromo = () => {
    const discountsEnabled = systemConfig ? systemConfig.discounts : false;

    if (!discountsEnabled) {
      toaster.push(
        <Notification type="warning" header="Discounts Disabled">
          Discounts are currently disabled in the system.
        </Notification>,
        { placement: "topEnd" }
      );
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
      toaster.push(
        <Notification type="success" header="Promo Applied">
          Promo code applied successfully!
        </Notification>,
        { placement: "topEnd" }
      );
    } else {
      setDiscount(0);
      setAppliedPromo(null);
      toaster.push(
        <Notification type="error" header="Invalid Promo Code">
          Invalid promo code.
        </Notification>,
        { placement: "topEnd" }
      );
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    // Validate delivery address
    const cookieValue = Cookies.get("delivery_address");
    if (!cookieValue) {
      toaster.push(
        <Notification type="error" header="Address Required">
          Please select a delivery address.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    let addressObj;
    try {
      addressObj = JSON.parse(cookieValue);
    } catch (err) {
      toaster.push(
        <Notification type="error" header="Invalid Address">
          Invalid delivery address. Please select again.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    const deliveryAddressId = addressObj.id;
    if (!deliveryAddressId) {
      toaster.push(
        <Notification type="error" header="Invalid Address">
          Please select a valid delivery address.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    setIsOrderLoading(true);
    try {
      // Calculate delivery time
      const shoppingTime = systemConfig
        ? parseInt(systemConfig.shoppingTime)
        : 0;
      const altKm = (shopAlt - userAlt) / 1000;
      const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
      const travelTime = Math.ceil(distance3D);
      const totalTimeMinutes = travelTime + shoppingTime;
      const deliveryDate = new Date(Date.now() + totalTimeMinutes * 60000);
      const deliveryTimestamp = deliveryDate.toISOString();

      // Prepare reel order payload
      const payload = {
        reel_id: post.id,
        quantity: quantity,
        total: finalTotal.toString(),
        service_fee: serviceFee.toString(),
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

      toaster.push(
        <Notification type="success" header="Order Confirmed">
          Your order has been placed successfully!
        </Notification>,
        { placement: "topEnd" }
      );

      // Close modal only
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Order placement error:", err);
      toaster.push(
        <Notification type="error" header="Order Failed">
          {err.message}
        </Notification>,
        { placement: "topEnd" }
      );
    } finally {
      setIsOrderLoading(false);
    }
  };

  // Render payment method display
  const renderPaymentMethod = () => {
    if (loadingPayment) {
      return (
        <div className="flex items-center">
          <div
            className={`mr-3 h-8 w-12 animate-pulse rounded-lg ${themeStyles.skeleton}`}
          ></div>
          <div
            className={`h-4 w-32 animate-pulse rounded ${themeStyles.skeleton}`}
          ></div>
        </div>
      );
    }

    if (!selectedPaymentMethod) {
      return (
        <div className={`text-sm ${themeStyles.textMuted} flex items-center`}>
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
          <span className={`${themeStyles.textPrimary} font-medium`}>
            {selectedPaymentMethod.type === "refund"
              ? "Using Refund Balance"
              : selectedPaymentMethod.type === "momo"
              ? `MTN MoMo •••• ${selectedPaymentMethod.number?.slice(-3)}`
              : `Card •••• ${selectedPaymentMethod.number?.slice(-4)}`}
          </span>
          <p className={`text-xs ${themeStyles.textMuted} mt-1`}>
            {selectedPaymentMethod.type === "refund"
              ? "Available balance will be used"
              : selectedPaymentMethod.type === "momo"
              ? "Mobile money payment"
              : "Credit/Debit card payment"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      style={{
        backgroundColor: "transparent",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className={`${themeStyles.container} overflow-hidden rounded-2xl border shadow-2xl`}
      >
        {/* Header */}
        <div className={`${themeStyles.header} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Place Your Order</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              <svg
                className="h-5 w-5 text-white"
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
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {configLoading ? (
            <div className="space-y-6">
              {/* Loading Skeletons */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`${themeStyles.section} rounded-xl border p-6 backdrop-blur-sm`}
                >
                  <div
                    className={`mb-4 h-5 w-32 animate-pulse rounded ${themeStyles.skeleton}`}
                  ></div>
                  <div className="space-y-3">
                    <div
                      className={`h-4 w-full animate-pulse rounded ${themeStyles.skeleton}`}
                    ></div>
                    <div
                      className={`h-4 w-3/4 animate-pulse rounded ${themeStyles.skeleton}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Item Details */}
              <div
                className={`${themeStyles.section} rounded-xl border p-6 backdrop-blur-sm`}
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${themeStyles.textPrimary}`}
                  >
                    Item Details
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`font-medium ${themeStyles.textPrimary} text-lg`}
                    >
                      {post.content?.title || "Item from reel"}
                    </p>
                    <p className={`text-sm ${themeStyles.textSecondary} mt-1`}>
                      {post.content?.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(basePrice)}
                    </p>
                    <p className={`text-xs ${themeStyles.textMuted}`}>
                      per item
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Selection */}
              <div
                className={`${themeStyles.section} rounded-xl border p-6 backdrop-blur-sm`}
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${themeStyles.textPrimary}`}
                  >
                    Quantity
                  </h3>
                </div>
                <div className="flex items-center space-x-4">
                  <label
                    className={`text-sm font-medium ${themeStyles.textSecondary}`}
                  >
                    Quantity:
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`h-8 w-8 ${themeStyles.button} flex items-center justify-center rounded-lg ${themeStyles.textPrimary} transition-colors`}
                    >
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
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <InputNumber
                      value={quantity}
                      onChange={(value) => {
                        if (value === null || value === "") {
                          setQuantity(1);
                        } else {
                          const numValue =
                            typeof value === "number"
                              ? value
                              : parseInt(value as string) || 1;
                          setQuantity(Math.max(1, Math.min(50, numValue)));
                        }
                      }}
                      min={1}
                      max={50}
                      size="sm"
                      style={{
                        ...themeStyles.input,
                        width: "80px",
                      }}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(50, quantity + 1))}
                      className={`h-8 w-8 ${themeStyles.button} flex items-center justify-center rounded-lg ${themeStyles.textPrimary} transition-colors`}
                    >
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div
                className={`${themeStyles.section} rounded-xl border p-6 backdrop-blur-sm`}
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${themeStyles.textPrimary}`}
                  >
                    Special Instructions
                  </h3>
                </div>
                <Input
                  as="textarea"
                  rows={3}
                  placeholder="Add any special instructions or comments..."
                  value={comments}
                  onChange={setComments}
                  style={{
                    ...themeStyles.input,
                    resize: "none",
                  }}
                />
              </div>

              {/* Promo Code */}
              <div
                className={`${themeStyles.section} rounded-xl border p-6 backdrop-blur-sm`}
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${themeStyles.textPrimary}`}
                  >
                    Promo Code
                  </h3>
                </div>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={setPromoCode}
                    size="sm"
                    style={{
                      ...themeStyles.input,
                      flex: 1,
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyPromo}
                    style={{
                      backgroundColor: "#f59e0b",
                      borderColor: "#f59e0b",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="mt-3 rounded-lg border border-green-500/30 bg-green-900/30 p-3">
                    <p className="flex items-center text-sm text-green-400">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Promo code &quot;{appliedPromo}&quot; applied!
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div
                className={`${themeStyles.section} rounded-xl border p-6 backdrop-blur-sm`}
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500">
                    <svg
                      className="h-4 w-4 text-white"
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
                  </div>
                  <h3
                    className={`text-lg font-semibold ${themeStyles.textPrimary}`}
                  >
                    Payment Method
                  </h3>
                </div>
                <div
                  className={`${themeStyles.sectionDark} rounded-lg border p-4`}
                >
                  {renderPaymentMethod()}
                </div>
              </div>

              {/* Order Summary */}
              <div
                className={`${themeStyles.orderSummary} rounded-xl border p-6 backdrop-blur-sm`}
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${themeStyles.textPrimary}`}
                  >
                    Order Summary
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2">
                    <span className={themeStyles.textSecondary}>
                      Subtotal ({quantity} items)
                    </span>
                    <span className={`${themeStyles.textPrimary} font-medium`}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-green-400">Discount</span>
                      <span className="font-medium text-green-400">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className={themeStyles.textSecondary}>
                      Service Fee
                    </span>
                    <span className={`${themeStyles.textPrimary} font-medium`}>
                      {formatCurrency(serviceFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className={themeStyles.textSecondary}>
                      Delivery Fee
                    </span>
                    <span className={`${themeStyles.textPrimary} font-medium`}>
                      {formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div
                    className={`border-t ${
                      isDark ? "border-slate-600/50" : "border-gray-300/50"
                    } pt-3`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-lg font-bold ${themeStyles.textPrimary}`}
                      >
                        Total
                      </span>
                      <span className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${themeStyles.footer} border-t px-6 py-4`}>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 ${themeStyles.button} ${themeStyles.textPrimary} rounded-xl font-medium transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isOrderLoading || configLoading}
              className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
            >
              {isOrderLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Place Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
