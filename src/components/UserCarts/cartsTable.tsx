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
  loading,
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
          <div className="text-right font-bold">{formatCurrency(price)}</div>
          <div className="text-gray-500">Quantity</div>
          <div className="flex items-center justify-end gap-2">
            <button
              className={`h-6 w-6 p-0 flex items-center justify-center hover:bg-gray-100 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onDecrease}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              className={`h-6 w-6 p-0 flex items-center justify-center hover:bg-gray-100 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onIncrease}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="text-gray-500">Subtotal</div>
          <div className="text-right font-bold">{formatCurrency(parseFloat(subtotal))}</div>
        </div>

        <div className="flex justify-end mt-2">
          <Button color="red" appearance="subtle" onClick={onRemove} loading={loading}>
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
        {formatCurrency(price)}
      </div>
      <div className="hidden md:flex md:col-span-2 md:items-center md:justify-center">
        <button
          className={`h-6 w-6 p-0 flex items-center justify-center hover:bg-gray-100 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={onDecrease}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="mx-2 w-6 text-center">{quantity}</span>
        <button
          className={`h-6 w-6 p-0 flex items-center justify-center hover:bg-gray-100 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={onIncrease}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div className="hidden md:flex md:justify-end md:col-span-2 font-bold">
        {formatCurrency(parseFloat(subtotal))}
      </div>
      <div className="hidden md:flex md:justify-end md:col-span-1">
        <Button appearance="subtle" onClick={onRemove} loading={loading}>
        <svg width="20px" height="20px" viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M960 160h-291.2a160 160 0 0 0-313.6 0H64a32 32 0 0 0 0 64h896a32 32 0 0 0 0-64zM512 96a96 96 0 0 1 90.24 64h-180.48A96 96 0 0 1 512 96zM844.16 290.56a32 32 0 0 0-34.88 6.72A32 32 0 0 0 800 320a32 32 0 1 0 64 0 33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72zM832 416a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32zM832 640a32 32 0 0 0-32 32v224a32 32 0 0 1-32 32H256a32 32 0 0 1-32-32V320a32 32 0 0 0-64 0v576a96 96 0 0 0 96 96h512a96 96 0 0 0 96-96v-224a32 32 0 0 0-32-32z" fill="#f03400"></path><path d="M384 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM544 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM704 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0z" fill="#f03400"></path></g></svg>
        </Button>
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
      .then(res => res.json())
      .then((data: { items?: ApiCartItem[] }) => {
        const fetchedItems = data.items ?? [];
        setCartItems(
          fetchedItems.map((item: ApiCartItem) => ({ ...item, checked: true }))
        );
      })
      .catch(err => {
        console.error('Failed to fetch cart items:', err);
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
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + 1;
    // start loading
    setLoadingIds(prev => new Set(prev).add(id));
    try {
      await fetch('/api/cart-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: id, quantity: newQty }),
      });
      // update local state
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    } catch (err) {
      console.error('Failed to increase quantity:', err);
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const decreaseQuantity = async (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (!item || item.quantity <= 1) return;
    const newQty = item.quantity - 1;
    setLoadingIds(prev => new Set(prev).add(id));
    try {
      await fetch('/api/cart-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: id, quantity: newQty }),
      });
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    } catch (err) {
      console.error('Failed to decrease quantity:', err);
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const removeItem = async (id: string) => {
    // add to loading set
    setLoadingIds(prev => new Set(prev).add(id));
    try {
      await fetch('/api/cart-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: id }),
      });
      // remove locally
      setCartItems(prev => prev.filter(item => item.id !== id));
      // Notify cart count update
      window.dispatchEvent(new Event('cartChanged'));
    } catch (err) {
      console.error('Failed to delete cart item:', err);
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const total = cartItems
    .reduce((sum, item) => sum + item?.price * item.quantity, 0)
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
              <div key={idx} className="border-b pb-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
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
