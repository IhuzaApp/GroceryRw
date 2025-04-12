import React from "react";
import { Input, Button } from "rsuite";

export default function CheckoutItems() {
  return (
    <div className="fixed bottom-4 left-1/2 w-[95%] max-w-4xl -translate-x-1/2 rounded-2xl bg-white shadow-2xl z-50 p-6 border">
      {/* Promo Code */}
      <div>
        <p className="mb-2 text-gray-600">Do you have any promocode?</p>
        <div className="flex flex-wrap gap-2">
          <Input value="%" className="max-w-md" />
          <Button
            appearance="primary"
            color="green"
            className="bg-green-100 font-medium text-green-600"
          >
            Apply
          </Button>
        </div>
      </div>
<hr className="mt-4" />
      {/* Order Summary */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-8">
          <div>
            <p className="text-2xl font-bold">$165.16</p>
            <p className="text-gray-500">Cost of items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-500">-$0</p>
            <p className="text-gray-500">Promo code (empty)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">$165.87</p>
            <p className="text-gray-500">Total</p>
          </div>
        </div>
        <Button
          appearance="primary"
          size="lg"
          color="green"
          className="bg-green-500 px-12 font-medium text-white"
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
