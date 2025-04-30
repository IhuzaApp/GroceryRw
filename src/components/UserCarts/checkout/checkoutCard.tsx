import React, { useState } from "react";
import { Input, Button, Panel } from "rsuite";
import ConfirmPayment from "./confirmPayment";
import Link from "next/link"; // Make sure you import Link if you use it

interface CheckoutItemsProps {
  Total: number;
}

export default function CheckoutItems({ Total }: CheckoutItemsProps) {
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Dummy values to complete your code (you can replace them dynamically)
  const deliveryFee = 5; 
  const selectedCart = { promoCode: promoCode, deliveryTime: "30-45 mins" };
  const totalBeforeDiscount = Total;

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

  const finalTotal = (Total - discount + deliveryFee).toFixed(2);

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

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-bold">${Total}</p>
              <p className="text-gray-500">Cost of items</p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  discount ? "text-red-500" : "text-gray-500"
                }`}
              >
                -${discount.toFixed(2)}
              </p>
              <p className="text-gray-500">
                Promo code {appliedPromo ? `(${appliedPromo})` : "(empty)"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                ${finalTotal}
              </p>
              <p className="text-gray-500">Total</p>
            </div>
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
            <div className="bg-green-500 text-white p-4 -mx-4 -mt-4 mb-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${Total.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({selectedCart.promoCode})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${finalTotal}</span>
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
                <span>{selectedCart.deliveryTime}</span>
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
                <Button appearance="link" size="sm">
                  Change
                </Button>
              </div>
            </div>

            <Button
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
