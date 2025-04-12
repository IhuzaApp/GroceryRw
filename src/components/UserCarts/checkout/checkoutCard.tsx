import React from "react";
import { Input, InputGroup, Button, Checkbox } from "rsuite"


export default function CheckoutItems(){
    return(
     <>
        {/* Promo Code */}
        <div className="mt-8 border-t pt-6">
          <p className="text-gray-600 mb-2">Do you have any promocode</p>
          <div className="flex gap-2">
            <Input value="SAVE25%" className="max-w-xs" />
            <Button appearance="primary" color="green" className="bg-green-100 text-green-600 font-medium">
              Apply
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex gap-8 mb-4 md:mb-0">
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
          <Button appearance="primary" size="lg" className="bg-green-500 text-white font-medium px-12">
            Checkout
          </Button>
        </div>
     </>
    )
}