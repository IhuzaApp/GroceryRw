"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Checkbox } from "rsuite";
import Image from "next/image";
import CheckoutItems from "./checkout/checkoutCard";
import { formatCurrency } from "../../lib/formatCurrency";
import { logger } from "../../utils/logger";

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
  price: string; // This will store the final_price from the product
  quantity: number;
}

// Shape of items returned by the API (does not include 'checked')
interface ApiCartItem {
  id: string;
  image: string;
  name: string;
  size: string;
  price: string; // This stores the final_price from the product
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
      <div className="flex items-center gap-3 md:hidden">
        <Image
          src={image || "/images/groceryPlaceholder.png"}
          alt={name}
          width={60}
          height={60}
          className="rounded-md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate">{name}</h3>
          <p className="text-xs text-gray-500">{size}</p>
          <p className="mt-1 font-bold text-gray-900 text-sm">
            {formatCurrency(parseFloat(price || "0"))}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrease}
              disabled={quantity <= 1 || loading}
              className="rounded-full bg-gray-100 p-1 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 13H5v-2h14v2z" />
              </svg>
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
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
            <div className="font-bold text-gray-900 text-sm">
              {formatCurrency(parseFloat(subtotal))}
            </div>
          </div>
          <Button
            color="red"
            appearance="ghost"
            size="sm"
            onClick={onRemove}
            loading={loading}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:col-span-1 md:block">
        <Checkbox checked={checked} onChange={onToggle} />
      </div>
      <div className="hidden md:col-span-1 md:block">
        <Image
          src={image || "/images/groceryPlaceholder.png"}
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
            <path fill="currentColor" d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
        <span className="w-8 text-center">{quantity}</span>
        <button
          onClick={onIncrease}
          disabled={loading}
          className="rounded-full bg-gray-100 p-1 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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
        logger.error("Failed to fetch cart items", "CartsTable", err);
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
      logger.error("Failed to increase quantity", "CartsTable", err);
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
      logger.error("Failed to decrease quantity", "CartsTable", err);
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const removeItem = async (id: string) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await fetch("/api/cart-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: id }),
      });
      // update local state
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      logger.error("Failed to delete cart item", "CartsTable", err);
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  // Calculate total for checked items
  const total = cartItems
    .filter((item) => item.checked)
    .reduce(
      (sum, item) => sum + parseFloat(item.price || "0") * item.quantity,
      0
    );

  logger.info("Cart total updated", "CartsTable", { total });

  // Calculate numeric total and notify parent
  const totalNumber = parseFloat(total.toFixed(2));
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
