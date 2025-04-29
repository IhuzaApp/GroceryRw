"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Checkbox } from "rsuite";
import Image from "next/image";
import CheckoutItems from "./checkout/checkoutCard";

interface CartItemProps {
  item: CartItemType;
  onToggle: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

interface CartItemType {
  id: string;
  checked: boolean;
  image: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

// Shape of items returned by the API (does not include 'checked')
interface ApiCartItem {
  id: string;
  image: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

function CartItem({
  item,
  onToggle,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const { checked, image, name, size, price, quantity } = item;
  const subtotal = (price * quantity).toFixed(2);

  return (
    <div className="border-b pb-6 md:grid md:grid-cols-12 md:items-center md:gap-4">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start gap-3">
          <Checkbox checked={checked} onChange={onToggle} />
          <Image
            src={image}
            alt={name}
            width={80}
            height={80}
            className="rounded-md"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{size}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Price</div>
          <div className="text-right font-bold">${price.toFixed(2)}</div>
          <div className="text-gray-500">Quantity</div>
          <div className="flex items-center justify-end gap-2">
            <Button appearance="subtle" className="h-6 w-6 p-0" onClick={onDecrease}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
            <span className="w-6 text-center">{quantity}</span>
            <Button appearance="subtle" className="h-6 w-6 p-0" onClick={onIncrease}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
          </div>
          <div className="text-gray-500">Subtotal</div>
          <div className="text-right font-bold">${subtotal}</div>
        </div>

        <div className="flex justify-end mt-2">
          <Button color="red" appearance="subtle" onClick={onRemove}>
            ✕ Remove
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block md:col-span-1">
        <Checkbox checked={checked} onChange={onToggle} />
      </div>
      <div className="hidden md:block md:col-span-1">
        <Image
          src={image}
          alt={name}
          width={80}
          height={80}
          className="rounded-md"
        />
      </div>
      <div className="hidden md:block md:col-span-4">
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{size}</p>
      </div>
      <div className="hidden md:flex md:col-span-2 md:justify-center font-bold">
        ${price.toFixed(2)}
      </div>
      <div className="hidden md:flex md:col-span-2 md:items-center md:justify-center">
        <Button appearance="subtle" className="h-6 w-6 p-0" onClick={onDecrease}>
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
        <span className="mx-2 w-6 text-center">{quantity}</span>
        <Button appearance="subtle" className="h-6 w-6 p-0" onClick={onIncrease}>
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
      </div>
      <div className="hidden md:flex md:justify-end md:col-span-2 font-bold">
        ${subtotal}
      </div>
      <div className="hidden md:flex md:justify-end md:col-span-1">
        <Button color="red" appearance="subtle" onClick={onRemove}>
          ✕
        </Button>
      </div>
    </div>
  );
}

export default function ItemCartTable({
  shopId,
  onTotalChange,
}: {
  shopId: string;
  onTotalChange?: (total: number) => void;
}) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    // Fetch cart items including product metadata
    fetch(`/api/cart-items?shop_id=${shopId}`)
      .then(res => res.json())
      .then((data: { items?: ApiCartItem[] }) => {
        // Ensure items is an array
        const fetchedItems = data.items ?? [];
        // Mark all fetched items as checked by default
        setCartItems(
          fetchedItems.map((item: ApiCartItem) => ({ ...item, checked: true }))
        );
      })
      .catch(err => {
        console.error('Failed to fetch cart items:', err);
        // Reset to empty on error
        setCartItems([]);
      });
  }, [shopId]);

  const toggleCheck = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const increaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cartItems
    .reduce((sum, item) => sum + item?.price * item.quantity, 0)
    .toFixed(2);

  // Notify parent of updated total
  const totalNumber = parseFloat(total);
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalNumber);
    }
  }, [totalNumber, onTotalChange]);

  console.log(total);

  return (
    <>
      <div className="mb-4 hidden border-b pb-2 font-medium text-gray-500 md:grid md:grid-cols-12">
        <div className="md:col-span-6">Product</div>
        <div className="text-center md:col-span-2">Price</div>
        <div className="text-center md:col-span-2">Quantity</div>
        <div className="text-right md:col-span-2">Subtotal</div>
        <div className="md:col-span-1"></div>
      </div>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onToggle={() => toggleCheck(item.id)}
            onIncrease={() => increaseQuantity(item.id)}
            onDecrease={() => decreaseQuantity(item.id)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>
    </>
  );
}
