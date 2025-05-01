import React, { useState, useEffect } from "react";
import { Input, Button, Panel } from "rsuite";
import ConfirmPayment from "./confirmPayment";
import Link from "next/link"; // Make sure you import Link if you use it
import { formatCurrency } from "../../../lib/formatCurrency";
import Cookies from 'js-cookie';

interface CheckoutItemsProps {
  Total: number;
  totalUnits: number;
  shopLat: number;
  shopLng: number;
  shopAlt: number;
}

// Add helper to compute distance between two coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CheckoutItems({ Total, totalUnits, shopLat, shopLng, shopAlt }: CheckoutItemsProps) {
  // Re-render when the address cookie changes
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleAddressChange = () => setTick(t => t + 1);
    window.addEventListener('addressChanged', handleAddressChange);
    return () => window.removeEventListener('addressChanged', handleAddressChange);
  }, []);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Service and Delivery Fee calculations
  const serviceFee = 2000; // flat service fee in RWF
  const baseDeliveryFee = 1000; // base delivery fee in RWF
  // Surcharge based on units beyond 10 items
  const extraUnits = Math.max(0, totalUnits - 10);
  const unitsSurcharge = extraUnits * 50;
  // Surcharge based on distance beyond 3km
  let distanceKm = 0;
  let userAlt = 0;
  const cookie = Cookies.get('delivery_address');
  if (cookie) {
    try {
      const userAddr = JSON.parse(cookie);
      const userLat = parseFloat(userAddr.latitude);
      const userLng = parseFloat(userAddr.longitude);
      userAlt = parseFloat(userAddr.altitude || '0');
      distanceKm = getDistanceFromLatLonInKm(userLat, userLng, shopLat, shopLng);
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
      alert("Invalid promo code.");
    }
  };

  // Compute numeric final total including service fee
  const finalTotal = Total - discount + serviceFee + deliveryFee;

  return (
    <>
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
          <div className="flex justify-between mt-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold text-green-500">{formatCurrency(finalTotal)}</span>
          </div>
          <ConfirmPayment />
        </div>
      </div>

      {/* Desktop View - Only visible on medium and larger devices */}
      <div className="hidden md:block w-full lg:w-1/3">
        <div className="sticky top-20">
          <Panel
            shaded
            bordered
            className="bg-white rounded-xl shadow-lg overflow-hidden border-0"
            style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="bg-purple-800 text-white p-4 -mx-4 -mt-4 mb-6">
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
                <span className="font-medium">{formatCurrency(serviceFee)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(deliveryFee)}</span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Delivery Time</h3>
              <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 text-green-500 mr-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{deliveryTime}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-6 bg-blue-600 rounded mr-2 flex items-center justify-center text-white text-xs">
                    VISA
                  </div>
                  <span>•••• 4242</span>
                </div>
                <Button color="green" appearance="link" size="sm">
                  Change
                </Button>
              </div>
            </div>

            <Button
              color="green"
              appearance="primary"
              block
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white font-medium mt-6"
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
