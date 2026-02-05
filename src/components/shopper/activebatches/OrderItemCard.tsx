"use client";

import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../../lib/formatCurrency";
import { OrderItem } from "../../types/order";

/**
 * OrderItemCard Component
 *
 * Displays an individual order item with product image, details, quantity, price,
 * and a "Mark Found" button for shopping status. Used in batch details page.
 */

interface OrderItemCardProps {
  item: OrderItem;
  isBatchShopping: boolean;
  onToggleFound: (item: OrderItem, found: boolean) => void;
  onShowProductImage: (item: OrderItem) => void;
  /** When true, use larger text on desktop (e.g. for business orders) */
  isBusinessOrder?: boolean;
}

export default function OrderItemCard({
  item,
  isBatchShopping,
  onToggleFound,
  onShowProductImage,
  isBusinessOrder = false,
}: OrderItemCardProps) {
  const imgSrc =
    item.product.ProductName?.image ||
    item.product.image ||
    "/images/groceryPlaceholder.png";
  const productName = item.product.ProductName?.name || "Unknown Product";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 sm:gap-4 sm:p-4">
      {/* Product Image - small, clickable to expand */}
      <button
        type="button"
        className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-all hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:border-slate-600 sm:h-12 sm:w-12"
        onClick={() => onShowProductImage(item)}
        aria-label={`View larger image of ${productName}`}
      >
        <Image
          src={imgSrc}
          alt={productName}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("data:")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/groceryPlaceholder.png";
          }}
        />
      </button>

      {/* Product Details */}
      <div className="min-w-0 flex-1">
        <p
          className={`mb-1 font-semibold text-slate-900 dark:text-slate-100 ${
            isBusinessOrder ? "text-sm sm:text-lg" : "sm:text-base"
          }`}
        >
          {productName}
        </p>
        <p
          className={`text-slate-500 dark:text-slate-400 ${
            isBusinessOrder ? "text-xs sm:text-base" : "text-sm"
          }`}
        >
          Quantity: {item.quantity}{" "}
          {(item.product as any).measurement_unit || "pcs"}
        </p>
        <p
          className={`mt-1 font-semibold text-slate-900 dark:text-slate-100 ${
            isBusinessOrder ? "text-sm sm:text-base" : "text-sm"
          }`}
        >
          {formatCurrency(item.price * item.quantity)}
        </p>
        {item.found &&
          item.foundQuantity &&
          item.foundQuantity < item.quantity && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Found: {item.foundQuantity} of {item.quantity}
            </p>
          )}
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isBatchShopping && (
          <button
            onClick={() => onToggleFound(item, !item.found)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-md transition-all duration-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
              item.found
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg dark:from-green-600 dark:to-emerald-600 dark:shadow-green-900/50"
                : "border border-gray-300 bg-white text-gray-700 shadow-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:shadow-gray-900/50 dark:hover:border-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 sm:h-4 sm:w-4"
            >
              {item.found ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              )}
            </svg>
            <span>{item.found ? "Found" : "Mark Found"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
