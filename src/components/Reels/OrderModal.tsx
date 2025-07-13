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
          <div className="mr-2 h-6 w-8 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      );
    }

    if (!selectedPaymentMethod) {
      return (
        <div className="text-sm text-gray-500">No payment method selected</div>
      );
    }

    return (
      <div className="flex items-center">
        <div className="mr-2 flex items-center justify-center rounded bg-blue-600 p-2 text-xs text-white">
          {selectedPaymentMethod.type === "refund"
            ? "REFUND"
            : selectedPaymentMethod.type === "momo"
            ? "MOMO"
            : "VISA"}
        </div>
        <span className="text-sm">
          {selectedPaymentMethod.type === "refund"
            ? "Using Refund Balance"
            : selectedPaymentMethod.type === "momo"
            ? `•••• ${selectedPaymentMethod.number?.slice(-3)}`
            : `•••• ${selectedPaymentMethod.number?.slice(-4)}`}
        </span>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>Place Order</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {configLoading ? (
          <div className="space-y-6">
            {/* Item Details Placeholder */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-48 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Quantity Selection Placeholder */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 h-5 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="flex items-center space-x-4">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Comments Placeholder */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-20 w-full animate-pulse rounded bg-gray-200"></div>
            </div>

            {/* Promo Code Placeholder */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="flex space-x-2">
                <div className="h-8 flex-1 animate-pulse rounded bg-gray-200"></div>
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Payment Method Placeholder */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 h-5 w-28 animate-pulse rounded bg-gray-200"></div>
              <div className="flex items-center">
                <div className="mr-2 h-6 w-8 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Order Summary Placeholder */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Item Details */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Item Details</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {post.content?.title || "Item from reel"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {post.content?.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(basePrice)}</p>
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Quantity</h3>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Quantity:</label>
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
                />
              </div>
            </div>

            {/* Comments */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Special Instructions</h3>
              <Input
                as="textarea"
                rows={3}
                placeholder="Add any special instructions or comments..."
                value={comments}
                onChange={setComments}
              />
            </div>

            {/* Promo Code */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Promo Code</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={setPromoCode}
                  size="sm"
                />
                <Button size="sm" onClick={handleApplyPromo}>
                  Apply
                </Button>
              </div>
              {appliedPromo && (
                <p className="mt-2 text-sm text-green-600">
                  Promo code "{appliedPromo}" applied!
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Payment Method</h3>
              {renderPaymentMethod()}
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({quantity} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="subtle">
          Cancel
        </Button>
        <Button
          onClick={handlePlaceOrder}
          appearance="primary"
          disabled={isOrderLoading || configLoading}
        >
          {isOrderLoading ? "Placing Order..." : "Place Order"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
