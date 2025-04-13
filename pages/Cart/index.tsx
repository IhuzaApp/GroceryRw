import RootLayout from "@components/ui/layout";
import React from "react";
import Image from "next/image";
import { Button, Checkbox } from "rsuite";

import Link from "next/link";
import ItemCartTable from "@components/UserCarts/cartsTable";
import CheckoutItems from "@components/UserCarts/checkout/checkoutCard";

export default function CartMainPage() {
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {" "}
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          {/* Cart Header */}
          <div className="mb-6 flex items-center">
            <Link href="/" className="flex items-center text-gray-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2 h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <span className="ml-2 text-gray-500">5 items</span>
          </div>

          <ItemCartTable />
        </div>
      </div>
    </RootLayout>
  );
}

interface CartItemProps {
  checked: boolean;
  image: string;
  name: string;
  size: string;
  price: string;
  quantity: number;
  subtotal: string;
}

function CartItem({
  checked,
  image,
  name,
  size,
  price,
  quantity,
  subtotal,
}: CartItemProps) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 border-b pb-6">
      <div className="col-span-1">
        <Checkbox checked={checked} />
      </div>
      <div className="col-span-2 md:col-span-1">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={80}
          height={80}
          className="rounded-md"
        />
      </div>
      <div className="col-span-9 md:col-span-4">
        <h3 className="mb-1 font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{size}</p>
      </div>
      <div className="col-span-4 text-center md:col-span-2">
        <p className="font-bold">{price}</p>
      </div>
      <div className="col-span-8 flex justify-center md:col-span-2">
        <div className="flex items-center">
          <Button
            appearance="subtle"
            className="flex h-8 w-8 items-center justify-center p-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
          <span className="mx-4 w-4 text-center font-medium">{quantity}</span>
          <Button
            appearance="subtle"
            className="flex h-8 w-8 items-center justify-center p-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
      <div className="col-span-12 text-right md:col-span-2">
        <p className="font-bold">{subtotal}</p>
      </div>
    </div>
  );
}
