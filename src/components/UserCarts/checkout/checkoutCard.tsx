import React, { useState } from "react";
import { Input, Button } from "rsuite";
import ConfirmPayment from "./confirmPayment";

interface CheckoutItemsProps {
  Total: number | any; // raw total before promo
}

export default function CheckoutItems({ Total }: CheckoutItemsProps) {
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const handleApplyPromo = () => {
    // Example promo codes
    const PROMO_CODES: { [code: string]: number } = {
      SAVE10: 0.1, // 10% discount
      SAVE20: 0.2, // 20% discount
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

  const finalTotal = (Total - discount).toFixed(2);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-2xl border bg-white p-6 shadow-2xl">
      {/* Promo Code */}
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

      {/* Order Summary */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-8">
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
            <p className="text-2xl font-bold text-green-500">${finalTotal}</p>
            <p className="text-gray-500">Total</p>
          </div>
        </div>
        <ConfirmPayment />
      </div>
    </div>
  );
}
