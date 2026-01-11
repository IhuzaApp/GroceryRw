"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Input, Button, Checkbox } from "rsuite";
import Image from "next/image";
import CheckoutItems from "./checkout/checkoutCard";
import { formatCurrency } from "../../lib/formatCurrency";
import { logger } from "../../utils/logger";
import { useTheme } from "../../context/ThemeContext";
import { useFoodCart, FoodCartRestaurant } from "../../context/FoodCartContext";

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
  const { theme } = useTheme();
  const { checked, image, name, size, price, quantity } = item;
  const subtotal = (parseFloat(price || "0") * quantity).toFixed(2);

  return (
    <div
      className={`relative mb-3 rounded-xl border p-4 shadow-sm transition-all md:grid md:grid-cols-12 md:items-center md:gap-4 ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800/50 hover:shadow-md"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {/* Delete Button - Top Right (Mobile Only) */}
      <button
        onClick={onRemove}
        disabled={loading}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50 md:hidden ${
          theme === "dark"
            ? "text-gray-500 hover:text-red-400"
            : "text-gray-400 hover:text-red-500"
        }`}
        title="Remove item"
      >
        {loading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>

      {/* Mobile Layout */}
      <div className="flex items-center gap-3 pr-8 md:hidden">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          <Image
            src={image || "/images/groceryPlaceholder.png"}
            alt={name}
            width={60}
            height={60}
            className="rounded-lg object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-semibold leading-tight ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {name}
          </h3>
          <p
            className={`mt-1 text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Color: {size}
          </p>
          <p
            className={`mt-2 text-base font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {formatCurrency(parseFloat(subtotal))}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex items-center gap-0 rounded-lg px-1 py-1 ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
            }`}
          >
            <button
              onClick={onDecrease}
              disabled={quantity <= 1 || loading}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              −
            </button>
            <span
              className={`flex h-7 min-w-[36px] items-center justify-center px-2 text-sm font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {quantity}
            </span>
            <button
              onClick={onIncrease}
              disabled={loading}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:col-span-1 md:block">
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={image || "/images/groceryPlaceholder.png"}
            alt={name}
            width={60}
            height={60}
            className="rounded-lg bg-gray-100 object-cover dark:bg-gray-700"
          />
        </div>
      </div>
      <div className="hidden md:col-span-5 md:block">
        <h3
          className={`text-base font-semibold leading-tight ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {name}
        </h3>
        <p
          className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Color: {size}
        </p>
      </div>
      <div className="hidden md:col-span-3 md:flex md:items-center md:justify-center md:gap-2">
        <div
          className={`flex items-center gap-0 rounded-lg px-1 py-1 ${
            theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
          }`}
        >
          <button
            onClick={onDecrease}
            disabled={quantity <= 1 || loading}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            −
          </button>
          <span
            className={`flex h-8 min-w-[40px] items-center justify-center px-3 text-sm font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {quantity}
          </span>
          <button
            onClick={onIncrease}
            disabled={loading}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            +
          </button>
        </div>
      </div>
      <div className="hidden md:col-span-3 md:flex md:items-center md:justify-end md:gap-4">
        <div
          className={`text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {formatCurrency(parseFloat(subtotal))}
        </div>
        {/* Delete Button - Desktop (inline with price) */}
        <button
          onClick={onRemove}
          disabled={loading}
          className={`flex h-8 w-8 items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            theme === "dark"
              ? "text-gray-500 hover:text-red-400"
              : "text-gray-400 hover:text-red-500"
          }`}
          title="Remove item"
        >
          {loading ? (
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ItemCartTable({
  shopId,
  onTotalChange,
  onUnitsChange,
  onLoadingChange,
  isFoodCart = false,
  restaurant,
}: {
  shopId: string;
  onTotalChange?: (total: number) => void;
  onUnitsChange?: (units: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  isFoodCart?: boolean;
  restaurant?: FoodCartRestaurant;
}) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const { removeItem: removeFoodItem, updateQuantity } = useFoodCart();
  const { theme } = useTheme();

  // Use ref to store the callback to avoid dependency issues
  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;

  useEffect(() => {
    setIsLoadingItems(true);
    onLoadingChangeRef.current?.(true);

    if (isFoodCart && restaurant) {
      // Handle food cart items
      const foodItems = restaurant.items.map((item) => ({
        id: item.id,
        image: item.image || "/images/restaurantDish.png",
        name: item.name,
        size: item.category || "Regular",
        price: item.price,
        quantity: item.quantity,
        checked: true,
      }));
      setCartItems(foodItems);
      setIsLoadingItems(false);
      onLoadingChange?.(false);
    } else {
      // Handle regular shop cart items
      fetch(`/api/cart-items?shop_id=${shopId}`)
        .then((res) => res.json())
        .then((data: { items?: ApiCartItem[] }) => {
          const fetchedItems = data.items ?? [];
          setCartItems(
            fetchedItems.map((item: ApiCartItem) => ({
              ...item,
              checked: true,
            }))
          );
        })
        .catch((err) => {
          logger.error("Failed to fetch cart items", "CartsTable", err);
          setCartItems([]);
        })
        .finally(() => {
          setIsLoadingItems(false);
          onLoadingChangeRef.current?.(false);
        });
    }
  }, [shopId, isFoodCart, restaurant]);

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

    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      if (isFoodCart && restaurant) {
        // Handle food cart quantity update
        updateQuantity(restaurant.id, id, newQty);
        setCartItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      } else {
        // Handle regular shop cart quantity update
        await fetch("/api/cart-items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_item_id: id, quantity: newQty }),
        });
        setCartItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      }
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
      if (isFoodCart && restaurant) {
        // Handle food cart quantity update
        updateQuantity(restaurant.id, id, newQty);
        setCartItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      } else {
        // Handle regular shop cart quantity update
        await fetch("/api/cart-items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_item_id: id, quantity: newQty }),
        });
        setCartItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      }
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
      if (isFoodCart && restaurant) {
        // Handle food cart item removal
        removeFoodItem(restaurant.id, id);
        setCartItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        // Handle regular shop cart item removal
        await fetch("/api/cart-items", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_item_id: id }),
        });
        setCartItems((prev) => prev.filter((i) => i.id !== id));
      }
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

  // Call callbacks directly when values change, but only for shop carts
  // Use useRef to track previous values and avoid unnecessary calls
  const prevTotalRef = useRef(totalNumber);
  const prevUnitsRef = useRef(totalUnits);

  // Only call callbacks for regular shop carts when values actually change
  if (
    !isFoodCart &&
    onTotalChange &&
    typeof onTotalChange === "function" &&
    prevTotalRef.current !== totalNumber
  ) {
    onTotalChange(totalNumber);
    prevTotalRef.current = totalNumber;
  }

  if (
    !isFoodCart &&
    onUnitsChange &&
    typeof onUnitsChange === "function" &&
    prevUnitsRef.current !== totalUnits
  ) {
    onUnitsChange(totalUnits);
    prevUnitsRef.current = totalUnits;
  }

  return (
    <>
      <div
        className={`mb-4 hidden pb-3 font-semibold md:grid md:grid-cols-12 md:gap-4 ${
          theme === "dark" ? "text-gray-300" : "text-gray-900"
        }`}
      >
        <div className="md:col-span-6">Product</div>
        <div className="text-center md:col-span-3">Quantity</div>
        <div className="text-right md:col-span-3">Price</div>
      </div>

      <div className="space-y-2 md:space-y-0">
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
