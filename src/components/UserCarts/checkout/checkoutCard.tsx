import React, { useState, useEffect } from "react";
import { Input, Button, Panel, Modal, toaster, Notification } from "rsuite";
import Link from "next/link"; // Make sure you import Link if you use it
import { formatCurrency } from "../../../lib/formatCurrency";
import Cookies from "js-cookie";

interface CheckoutItemsProps {
  Total: number;
  totalUnits: number;
  shopLat: number;
  shopLng: number;
  shopAlt: number;
  shopId: string;
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
  // Order confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  // Re-render when the address cookie changes
  const [, setTick] = useState(0);
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

  // Service and Delivery Fee calculations
  const serviceFee = 2000; // flat service fee in RWF
  const baseDeliveryFee = 1000; // base delivery fee in RWF
  // Surcharge based on units beyond 10 items
  const extraUnits = Math.max(0, totalUnits - 10);
  const unitsSurcharge = extraUnits * 50;
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
  const distanceSurcharge = Math.ceil(extraDistance) * 300;
  // Cap the distance-based delivery fee (before units) at 2500 RWF
  const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
  const cappedDistanceFee = rawDistanceFee > 2500 ? 2500 : rawDistanceFee;
  // Final delivery fee includes unit surcharge
  const deliveryFee = cappedDistanceFee + unitsSurcharge;

  // Compute total delivery time: travel time in 3D plus shopping time
  const shoppingTime = 40; // minutes spent shopping at the store
  const altKm = (shopAlt - userAlt) / 1000;
  const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
  const travelTime = Math.ceil(distance3D); // assume 1 km ≈ 1 minute travel
  const totalTimeMinutes = travelTime + shoppingTime;
  let deliveryTime: string;
  if (totalTimeMinutes >= 60) {
    const hours = Math.floor(totalTimeMinutes / 60);
    const minutes = totalTimeMinutes % 60;
    deliveryTime = `${hours}h ${minutes}m`;
  } else {
    deliveryTime = `${totalTimeMinutes} mins`;
  }
  // Compute actual delivery timestamp for DB (current time + totalTimeMinutes)
  const deliveryTimestamp = new Date(
    Date.now() + totalTimeMinutes * 60000
  ).toISOString();

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
      // Show confirmation modal with new order ID
      setNewOrderId(data.order_id);
      setShowConfirmation(true);
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

  return (
    <>
      {/* Confirmation Modal */}
      <Modal open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <Modal.Header>
          <Modal.Title>Order Confirmed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {newOrderId
            ? `Your order (${newOrderId}) has been placed successfully!`
            : "Your order has been placed successfully!"}
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            onClick={() => setShowConfirmation(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Mobile View - Only visible on small devices */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-2xl border bg-white p-6 shadow-2xl md:hidden">
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
            <span className="text-sm">{deliveryTime}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold text-green-500">
              {formatCurrency(finalTotal)}
            </span>
          </div>
          {/* Delivery Notes Input */}
          <div className="mt-2">
            <h3 className="mb-1 font-medium">Add a Note</h3>
            <Input
              as="textarea"
              rows={2}
              value={deliveryNotes}
              onChange={setDeliveryNotes}
              placeholder="Enter any delivery instructions or notes"
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
              <h3 className="mb-2 font-medium">Delivery Time</h3>
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
                <span>{deliveryTime}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-medium">Payment Method</h3>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div className="flex items-center">
                  <div className="mr-2 flex h-6 w-10 items-center justify-center rounded bg-blue-600 text-xs text-white">
                    VISA
                  </div>
                  <span>•••• 4242</span>
                </div>
                <Button color="green" appearance="link" size="sm">
                  Change
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-2 font-medium">Add a Note</h3>
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
