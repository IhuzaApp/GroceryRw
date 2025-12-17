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
      className={`mb-2 rounded-lg p-3 transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/30 md:grid md:grid-cols-12 md:items-center md:gap-4 md:bg-transparent md:py-3 md:hover:bg-transparent ${
        theme === "dark"
          ? "bg-gray-800/20"
          : "bg-white"
      }`}
    >
      {/* Mobile Layout */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="relative flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={image || "/images/groceryPlaceholder.png"}
            alt={name}
            width={70}
            height={70}
            className="rounded-lg object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-base font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {name}
          </h3>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              theme === "dark"
                ? "bg-green-900/30 text-green-300"
                : "bg-green-100 text-green-700"
            }`}
          >
            {size}
          </span>
          <p
            className={`mt-2 text-sm font-bold ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            }`}
          >
            {formatCurrency(parseFloat(price || "0"))}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-0 rounded-lg bg-gray-100 dark:bg-gray-800/50 p-0.5">
            <button
              onClick={onDecrease}
              disabled={quantity <= 1 || loading}
              className={`flex h-7 w-7 items-center justify-center rounded-l-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <span
              className={`flex h-7 min-w-[32px] items-center justify-center bg-white dark:bg-gray-800 px-2 text-sm font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {quantity}
            </span>
            <button
              onClick={onIncrease}
              disabled={loading}
              className={`flex h-7 w-7 items-center justify-center rounded-r-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="text-right">
            <div
              className={`text-sm font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {formatCurrency(parseFloat(subtotal))}
            </div>
          </div>
          <Button
            color="red"
            appearance="ghost"
            size="sm"
            onClick={onRemove}
            loading={loading}
            className={`px-2 py-1 ${
              theme === "dark"
                ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                : "text-red-600 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:col-span-1 md:block">
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={image || "/images/groceryPlaceholder.png"}
            alt={name}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        </div>
      </div>
      <div className="hidden md:col-span-5 md:block">
        <h3
          className={`font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {name}
        </h3>
        <span
          className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            theme === "dark"
              ? "bg-green-900/30 text-green-300"
              : "bg-green-100 text-green-700"
          }`}
        >
          {size}
        </span>
      </div>
      <div
        className={`hidden font-bold md:col-span-2 md:flex md:justify-center ${
          theme === "dark" ? "text-green-400" : "text-green-600"
        }`}
      >
        {formatCurrency(parseFloat(price || "0"))}
      </div>
      <div className="hidden md:col-span-2 md:flex md:items-center md:justify-center md:gap-2">
        <div className="flex items-center gap-0 rounded-lg bg-gray-100 dark:bg-gray-800/50 p-0.5">
          <button
            onClick={onDecrease}
            disabled={quantity <= 1 || loading}
            className={`flex h-8 w-8 items-center justify-center rounded-l-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <span
            className={`flex h-8 min-w-[36px] items-center justify-center bg-white dark:bg-gray-800 px-3 text-sm font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {quantity}
          </span>
          <button
            onClick={onIncrease}
            disabled={loading}
            className={`flex h-8 w-8 items-center justify-center rounded-r-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="hidden md:col-span-2 md:block md:text-right">
        <div
          className={`font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {formatCurrency(parseFloat(subtotal))}
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
      <div className="mb-4 hidden pb-2 font-medium text-gray-500 md:grid md:grid-cols-11">
        <div className="md:col-span-6">Product</div>
        <div className="text-center md:col-span-2">Price</div>
        <div className="text-center md:col-span-2">Quantity</div>
        <div className="text-right md:col-span-1">Total</div>
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
