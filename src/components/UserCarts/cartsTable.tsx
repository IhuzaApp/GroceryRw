'use client';

import React, { useState } from "react";
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
      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={checked} onChange={onToggle} />
          <Image src={image} alt={name} width={80} height={80} className="rounded-md" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{size}</p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Price</span>
          <span className="font-bold">${price.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500">Quantity</span>
          <div className="flex items-center">
            <Button appearance="subtle" className="h-8 w-8 p-0" onClick={onDecrease}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
            <span className="mx-4 w-4 text-center font-medium">{quantity}</span>
            <Button appearance="subtle" className="h-8 w-8 p-0" onClick={onIncrease}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold">${subtotal}</span>
        </div>
        <Button color="red" appearance="subtle" onClick={onRemove}>
          Remove
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block md:col-span-1">
        <Checkbox checked={checked} onChange={onToggle} />
      </div>
      <div className="hidden md:block md:col-span-1">
        <Image src={image} alt={name} width={80} height={80} className="rounded-md" />
      </div>
      <div className="hidden md:block md:col-span-4">
        <h3 className="mb-1 font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{size}</p>
      </div>
      <div className="hidden md:block text-center md:col-span-2 font-bold">
        ${price.toFixed(2)}
      </div>
      <div className="hidden md:flex justify-center md:col-span-2 items-center">
        <Button appearance="subtle" className="h-8 w-8 p-0" onClick={onDecrease}>
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
        <span className="mx-4 w-4 text-center font-medium">{quantity}</span>
        <Button appearance="subtle" className="h-8 w-8 p-0" onClick={onIncrease}>
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
      </div>
      <div className="hidden md:block text-right md:col-span-2 font-bold">
        ${subtotal}
      </div>
      <div className="hidden md:block text-right md:col-span-1">
        <Button color="red" appearance="subtle" onClick={onRemove}>
          ✕
        </Button>
      </div>
    </div>
  );
}

export default function ItemCartTable() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([
    {
      id: "1",
      checked: false,
      image: "https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png",
      name: "Avocado Evokaado",
      size: "14oz",
      price: 12.86,
      quantity: 4,
    },
    {
      id: "2",
      checked: false,
      image: "https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png",
      name: "Fruit And Nut Muesli",
      size: "500g",
      price: 20.53,
      quantity: 2,
    },
    {
      id: "3",
      checked: false,
      image: "https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png",
      name: "Mixed Nuts",
      size: "24 Oz",
      price: 33.45,
      quantity: 1,
    },
  ]);

  const toggleCheck = (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const increaseQuantity = (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const total = cartItems
  .reduce(
    (sum, item) => sum + item?.price * item.quantity,
    0
  )
  .toFixed(2);

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
        {cartItems.map(item => (
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
      <CheckoutItems Total={total} />
    </>
  );
}
