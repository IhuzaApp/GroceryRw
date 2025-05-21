import React, { useState, useEffect } from "react";
import { Input, Button, Panel, Modal, toaster, Notification } from "rsuite";
import Link from "next/link"; // Make sure you import Link if you use it
import { formatCurrency } from "../../../lib/formatCurrency";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import PaymentMethodSelector from "./PaymentMethodSelector";

interface PaymentMethod {
  type: "refund" | "card" | "momo";
  id?: string;
  number?: string;
}

interface CheckoutItemsProps {
  Total: number;
  totalUnits: number;
  shopLat: number;
  shopLng: number;
  shopAlt: number;
  shopId: string;
}

// System configuration interface
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
}

// Add helper to compute distance between two coordinates
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

export default function CheckoutItems({
  Total,
  totalUnits,
  shopLat,
  shopLng,
  shopAlt,
  shopId,
}: CheckoutItemsProps) {
  const router = useRouter();
  // Re-render when the address cookie changes
  const [, setTick] = useState(0);
  // Mobile checkout card expand/collapse state
  const [isExpanded, setIsExpanded] = useState(false);
  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch system configuration
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        setConfigLoading(true);
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();
        
        if (data.success && data.config) {
          console.log("Fetched system configuration:", data.config);
          setSystemConfig(data.config);
        } else {
          console.error("Failed to fetch system configuration:", data);
        }
      } catch (error) {
        console.error("Error fetching system configuration:", error);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchSystemConfig();
  }, []);

  useEffect(() => {
    const handleAddressChange = () => setTick((t) => t + 1);
    window.addEventListener("addressChanged", handleAddressChange);
    return () =>
      window.removeEventListener("addressChanged", handleAddressChange);
  }, []);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  // Fetch default payment method on component mount
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

    fetchDefaultPaymentMethod();
  }, []);

  // Service and Delivery Fee calculations
  const serviceFee = systemConfig ? parseInt(systemConfig.serviceFee) : 2000; // Use config value or fallback to 2000 RWF
  const baseDeliveryFee = systemConfig ? parseInt(systemConfig.baseDeliveryFee) : 1000; // Use config value or fallback to 1000 RWF
  // Surcharge based on units beyond extraUnits threshold
  const extraUnitsThreshold = systemConfig ? parseInt(systemConfig.extraUnits) : 10;
  const extraUnits = Math.max(0, totalUnits - extraUnitsThreshold);
  const unitsSurcharge = extraUnits * (systemConfig ? parseInt(systemConfig.unitsSurcharge) : 50);
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
  const distanceSurcharge = Math.ceil(extraDistance) * (systemConfig ? parseInt(systemConfig.distanceSurcharge) : 300);
  // Cap the distance-based delivery fee (before units) at cappedDistanceFee
  const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
  const cappedDistanceFee = systemConfig ? parseInt(systemConfig.cappedDistanceFee) : 2500;
  const finalDistanceFee = rawDistanceFee > cappedDistanceFee ? cappedDistanceFee : rawDistanceFee;
  // Final delivery fee includes unit surcharge
  const deliveryFee = finalDistanceFee + unitsSurcharge;

  // Compute total delivery time: travel time in 3D plus shopping time
  const shoppingTime = systemConfig ? parseInt(systemConfig.shoppingTime) : 40; // Use config value or fallback to 40 minutes
  const altKm = (shopAlt - userAlt) / 1000;
  const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
  const travelTime = Math.ceil(distance3D); // assume 1 km ≈ 1 minute travel
  const totalTimeMinutes = travelTime + shoppingTime;

  // Calculate the delivery timestamp (current time + totalTimeMinutes)
  const deliveryDate = new Date(Date.now() + totalTimeMinutes * 60000);
  const deliveryTimestamp = deliveryDate.toISOString();

  // Format the delivery time for display
  let deliveryTime: string;
  const diffMs = deliveryDate.getTime() - Date.now();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    deliveryTime = `Will be delivered in ${days} day${days > 1 ? "s" : ""}${
      hours > 0 ? ` ${hours}h` : ""
    }`;
  } else if (hours > 0) {
    deliveryTime = `Will be delivered in ${hours}h${
      mins > 0 ? ` ${mins}m` : ""
    }`;
  } else {
    deliveryTime = `Will be delivered in ${mins} minutes`;
  }

  const handleApplyPromo = () => {
    const PROMO_CODES: { [code: string]: number } = {
      SAVE10: 0.1,
      SAVE20: 0.2,
    };

    const code = promoCode.trim().toUpperCase();

    if (PROMO_CODES[code]) {
      setDiscount(Total * PROMO_CODES[code]);
      setAppliedPromo(code);
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

  // Compute numeric final total including service fee
  const finalTotal = Total - discount + serviceFee + deliveryFee;

  const handleProceedToCheckout = async () => {
    // Validate cart has items
    if (totalUnits <= 0) {
      toaster.push(
        <Notification type="warning" header="Empty Cart">
          Your cart is empty.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }
    // Get selected delivery address from cookie
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
      console.error("Error parsing delivery_address cookie:", err);
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
    setIsCheckoutLoading(true);
    try {
      // Prepare checkout payload
      const payload = {
        shop_id: shopId,
        delivery_address_id: deliveryAddressId,
        service_fee: serviceFee.toString(),
        delivery_fee: deliveryFee.toString(),
        discount: discount > 0 ? discount.toString() : null,
        voucher_code: appliedPromo,
        delivery_time: deliveryTimestamp,
        delivery_notes: deliveryNotes || null,
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Show success toast instead of modal
      toaster.push(
        <Notification type="success" header="Order Confirmed">
          Your order has been placed successfully!
        </Notification>,
        { placement: "topEnd" }
      );

      // Short delay before redirecting to give the user time to see the toast
      setTimeout(() => {
        router.push("/CurrentPendingOrders");
      }, 1500);
    } catch (err: any) {
      console.error("Checkout error:", err);
      toaster.push(
        <Notification type="error" header="Checkout Failed">
          {err.message}
        </Notification>,
        { placement: "topEnd" }
      );
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Toggle mobile checkout card expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Update the payment method display section
  const renderPaymentMethod = () => {
    if (loadingPayment) {
      return (
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center rounded bg-gray-400 p-2 text-xs text-white">
            LOADING
          </div>
          <span>Loading payment method...</span>
        </div>
      );
    }

    if (!selectedPaymentMethod) {
      return (
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center rounded bg-gray-400 p-2 text-xs text-white">
            NONE
          </div>
          <span>No payment method selected</span>
        </div>
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
        <span>
          {selectedPaymentMethod.type === "refund"
            ? "Using Refund Balance"
            : selectedPaymentMethod.type === "momo"
            ? `•••• ${selectedPaymentMethod.number?.slice(-3)}`
            : `•••• ${selectedPaymentMethod.number?.slice(-4)}`}
        </span>
      </div>
    );
  };

  // Show loading state while fetching configuration
  if (configLoading) {
    return (
      <div className="w-full md:block lg:w-1/3">
        <div className="sticky top-20">
          <Panel
            shaded
            bordered
            className="overflow-hidden rounded-xl border-0 bg-white shadow-lg"
          >
            <div className="flex h-48 flex-col items-center justify-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-purple-800"></div>
              <p className="text-lg font-medium">Loading checkout information...</p>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Only visible on small devices */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white shadow-2xl transition-all duration-300 md:hidden"
        style={{
          maxHeight: isExpanded ? "90vh" : "160px",
          overflow: "hidden",
        }}
      >
        {/* Header with toggle button */}
        <div
          className="flex items-center justify-between border-b p-4"
          onClick={toggleExpand} // Make the entire header clickable to toggle
        >
          <div className="flex items-center">
            <span className="text-lg font-bold">Order Summary</span>
            <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              {totalUnits} items
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 font-bold text-green-600">
              {formatCurrency(finalTotal)}
            </span>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              {isExpanded ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Checkout button when collapsed */}
        {!isExpanded && (
          <div className="p-4">
            <Button
              appearance="primary"
              color="green"
              block
              size="lg"
              loading={isCheckoutLoading}
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}

        {/* Expanded content */}
        <div
          className={`p-4 ${isExpanded ? "block" : "hidden"} overflow-y-auto`}
          style={{ maxHeight: "calc(90vh - 60px)" }}
        >
          <div>
            <p className="mb-2 text-gray-600">Do you have any promo code?</p>
            <div className="flex flex-wrap gap-2">
              <Input
                value={promoCode}
                onChange={setPromoCode}
                placeholder="Enter promo code"
                className="max-w-md"
              />
              <Button
                appearance="primary"
                color="green"
                className="bg-green-100 font-medium text-green-600"
                onClick={handleApplyPromo}
              >
                Apply
              </Button>
            </div>
          </div>

          <hr className="mt-4" />

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm">{formatCurrency(Total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Discount ({appliedPromo})</span>
                <span className="text-sm">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Units</span>
              <span className="text-sm">{totalUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Service Fee</span>
              <span className="text-sm">{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivery Fee</span>
              <span className="text-sm">{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivery Time</span>
              <span className="text-sm font-medium text-green-600">
                {deliveryTime}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold text-green-500">
                {formatCurrency(finalTotal)}
              </span>
            </div>
            {/* Delivery Notes Input */}
            <div className="mt-2">
              <h4 className="mb-1 font-medium">Add a Note</h4>
              <Input
                as="textarea"
                rows={2}
                value={deliveryNotes}
                onChange={setDeliveryNotes}
                placeholder="Enter any delivery instructions or notes"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on input
              />
            </div>
            {/* Proceed to Checkout Button */}
            <div className="mt-2">
              <Button
                appearance="primary"
                color="green"
                block
                size="lg"
                loading={isCheckoutLoading}
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Only visible on medium and larger devices */}
      <div className="hidden w-full md:block lg:w-1/3">
        <div className="sticky top-20">
          <Panel
            shaded
            bordered
            className="overflow-hidden rounded-xl border-0 bg-white shadow-lg"
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="-mx-4 -mt-4 mb-6 bg-purple-800 p-4 text-white">
              <h2 className="text-xl font-bold">Order Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(Total)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedPromo})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Units</span>
                <span className="font-medium">{totalUnits}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-medium">
                  {formatCurrency(serviceFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="mt-3 border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 font-medium">Delivery Time</h4>
              <div className="flex items-center rounded-lg bg-gray-50 p-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-5 w-5 text-green-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-medium text-green-600">
                  {deliveryTime}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 font-medium">Payment Method</h4>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                {renderPaymentMethod()}
                <PaymentMethodSelector
                  totalAmount={finalTotal}
                  onSelect={(method) => {
                    setSelectedPaymentMethod(method);
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="mb-2 font-medium">Promo Code</h4>
              <div className="flex gap-2">
                <Input
                  value={promoCode}
                  onChange={setPromoCode}
                  placeholder="Enter promo code"
                />
                <Button
                  appearance="primary"
                  color="green"
                  className="bg-green-100 font-medium text-green-600"
                  onClick={handleApplyPromo}
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="mb-2 font-medium">Add a Note</h4>
              <Input
                as="textarea"
                rows={3}
                value={deliveryNotes}
                onChange={setDeliveryNotes}
                placeholder="Enter any delivery instructions or notes"
              />
            </div>

            <Button
              color="green"
              appearance="primary"
              block
              size="lg"
              className="mt-6 bg-green-500 font-medium text-white hover:bg-green-600"
              onClick={handleProceedToCheckout}
              loading={isCheckoutLoading}
            >
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-center text-sm text-gray-500">
              By placing your order, you agree to our{" "}
              <Link href="/terms" className="text-green-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600">
                Privacy Policy
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
