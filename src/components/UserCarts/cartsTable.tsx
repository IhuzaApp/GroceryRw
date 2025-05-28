"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Checkbox } from "rsuite";
import Image from "next/image";
import CheckoutItems from "./checkout/checkoutCard";
import { formatCurrency } from "../../lib/formatCurrency";

interface CartItemProps {
  item: CartItemType;
  onToggle: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  loading?: boolean;
}

interface CartItemType {
  id: string;
  checked: boolean;
  image: string;
  name: string;
  size: string;
  price: string;  // This will store the final_price from the product
  quantity: number;
}

// Shape of items returned by the API (does not include 'checked')
interface ApiCartItem {
  id: string;
  image: string;
  name: string;
  size: string;
  price: string;  // This stores the final_price from the product
  quantity: number;
}

function CartItem({
  item,
  onToggle,
  onIncrease,
  onDecrease,
  onRemove,
  loading,
}: CartItemProps) {
  const { checked, image, name, size, price, quantity } = item;
  const subtotal = (parseFloat(price || "0") * quantity).toFixed(2);

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
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{size}</p>
            <p className="mt-1 font-bold text-gray-900">
              {formatCurrency(parseFloat(price || "0"))}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrease}
              disabled={quantity <= 1 || loading}
              className="rounded-full bg-gray-100 p-1 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 13H5v-2h14v2z"
                />
              </svg>
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              onClick={onIncrease}
              disabled={loading}
              className="rounded-full bg-gray-100 p-1 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </button>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">
              {formatCurrency(parseFloat(subtotal))}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(parseFloat(price || "0"))} each
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button
            color="red"
            appearance="subtle"
            onClick={onRemove}
            loading={loading}
          >
            ✕ Remove
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:col-span-1 md:block">
        <Checkbox checked={checked} onChange={onToggle} />
      </div>
      <div className="hidden md:col-span-1 md:block">
        <Image
          src={image}
          alt={name}
          width={80}
          height={80}
          className="rounded-md"
        />
      </div>
      <div className="hidden md:col-span-4 md:block">
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{size}</p>
      </div>
      <div className="hidden font-bold md:col-span-2 md:flex md:justify-center">
        {formatCurrency(parseFloat(price || "0"))}
      </div>
      <div className="hidden md:col-span-2 md:flex md:items-center md:justify-center md:gap-2">
        <button
          onClick={onDecrease}
          disabled={quantity <= 1 || loading}
          className="rounded-full bg-gray-100 p-1 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 13H5v-2h14v2z"
            />
          </svg>
        </button>
        <span className="w-8 text-center">{quantity}</span>
        <button
          onClick={onIncrease}
          disabled={loading}
          className="rounded-full bg-gray-100 p-1 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
            />
          </svg>
        </button>
      </div>
      <div className="hidden md:col-span-2 md:block md:text-right">
        <div className="font-bold text-gray-900">
          {formatCurrency(parseFloat(subtotal))}
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(parseFloat(price || "0"))} each
        </div>
      </div>
    </div>
  );
}

export default function ItemCartTable({
  shopId,
  onTotalChange,
  onUnitsChange,
  onLoadingChange,
}: {
  shopId: string;
  onTotalChange?: (total: number) => void;
  onUnitsChange?: (units: number) => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);

  useEffect(() => {
    setIsLoadingItems(true);
    // Notify parent loading state for summary
    onLoadingChange?.(true);
    // Fetch cart items including product metadata
    fetch(`/api/cart-items?shop_id=${shopId}`)
      .then((res) => res.json())
      .then((data: { items?: ApiCartItem[] }) => {
        const fetchedItems = data.items ?? [];
        setCartItems(
          fetchedItems.map((item: ApiCartItem) => ({ ...item, checked: true }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch cart items:", err);
        setCartItems([]);
      })
      .finally(() => {
        setIsLoadingItems(false);
        onLoadingChange?.(false);
      });
  }, [shopId, onLoadingChange]);

  const toggleCheck = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const increaseQuantity = async (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + 1;
    // start loading
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await fetch("/api/cart-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: id, quantity: newQty }),
      });
      // update local state
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      );
    } catch (err) {
      console.error("Failed to increase quantity:", err);
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const decreaseQuantity = async (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item || item.quantity <= 1) return;
    const newQty = item.quantity - 1;
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await fetch("/api/cart-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: id, quantity: newQty }),
      });
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      );
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const removeItem = async (id: string) => {
    // add to loading set
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await fetch("/api/cart-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: id }),
      });
      // remove locally
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      // Notify cart count update
      window.dispatchEvent(new Event("cartChanged"));
    } catch (err) {
      console.error("Failed to delete cart item:", err);
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const total = cartItems
    .reduce(
      (sum, item) => 
        sum + parseFloat(item?.price || "0") * item.quantity,
      0
    )
    .toFixed(2);

  // Calculate numeric total and notify parent
  const totalNumber = parseFloat(total);
  // Calculate total units and notify parent
  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalNumber);
    }
  }, [totalNumber, onTotalChange]);

  useEffect(() => {
    if (onUnitsChange) {
      onUnitsChange(totalUnits);
    }
  }, [totalUnits, onUnitsChange]);

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
        {isLoadingItems ? (
          // Show loading skeleton rows
          Array(4)
            .fill(0)
            .map((_, idx) => (
              <div key={idx} className="animate-pulse border-b pb-6">
                <div className="mb-2 h-4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            ))
        ) : cartItems.length > 0 ? (
          // Render actual cart items
          cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onToggle={() => toggleCheck(item.id)}
              onIncrease={() => increaseQuantity(item.id)}
              onDecrease={() => decreaseQuantity(item.id)}
              onRemove={() => removeItem(item.id)}
              loading={loadingIds.has(item.id)}
            />
          ))
        ) : (
          // Empty state when no items in cart
          <div className="p-4 text-gray-500">No items in this cart.</div>
        )}
      </div>
    </>
  );
}
