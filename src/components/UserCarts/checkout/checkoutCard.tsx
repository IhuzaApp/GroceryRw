import React from "react";
import { Input, InputGroup, Button, Checkbox } from "rsuite";

export default function CheckoutItems() {
  return (
    <>
      {/* Promo Code */}
      <div className="mt-8 border  pt-6">
        <p className="mb-2 text-gray-600">Do you have any promocode</p>
        <div className="flex gap-2">
          <Input value="SAVE25%" className="max-w-xs" />
          <Button
            appearance="primary"
            color="green"
            className="bg-green-100 font-medium text-green-600"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 flex gap-8 md:mb-0">
          <div>
            <p className="text-2xl font-bold">$165.16</p>
            <p className="text-gray-500">Cost of items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-500">-$25</p>
            <p className="text-gray-500">Promo code (SALE25)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">$123.87</p>
            <p className="text-gray-500">Total</p>
          </div>
        </div>
        <Button
          appearance="primary"
          size="lg"
          className="bg-green-500 px-12 font-medium text-white"
        >
          Checkout
        </Button>
      </div>
    </>
  );
}
