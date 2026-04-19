"use client";

import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../../lib/formatCurrency";
import { OrderItem } from "../../types";
import { useTheme } from "../../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const imgSrc =
    item.product.ProductName?.image ||
    item.product.image ||
    "/images/groceryPlaceholder.png";
  const productName = item.product.ProductName?.name || "Unknown Product";

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 sm:gap-4 sm:p-4 ${
        isDark
          ? "border-white/5 bg-white/5 hover:border-white/10"
          : "border-black/5 bg-black/5 hover:border-black/10"
      }`}
    >
      {/* Product Image - small, clickable to expand */}
      <button
        type="button"
        className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-300 group-hover:scale-105 ${
          isDark
            ? "border-white/10 bg-white/5 shadow-inner"
            : "border-black/5 bg-black/5"
        }`}
        onClick={() => onShowProductImage(item)}
        aria-label={`View larger image of ${productName}`}
      >
        <Image
          src={imgSrc}
          alt={productName}
          width={64}
          height={64}
          className="h-full w-full object-cover"
          unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("data:")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/groceryPlaceholder.png";
          }}
        />
        {item.found && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[1px]">
            <svg
              className="h-6 w-6 text-white drop-shadow-md"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </button>

      {/* Product Details */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-black uppercase leading-tight tracking-tight text-gray-900 dark:text-white ${
            isBusinessOrder ? "text-sm sm:text-base" : "text-xs sm:text-sm"
          }`}
        >
          {productName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-tight ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            QTY:{" "}
            <span className={isDark ? "text-gray-200" : "text-gray-900"}>
              {item.quantity} {(item.product as any).measurement_unit || "pcs"}
            </span>
          </span>
          <span
            className={`text-[10px] font-black uppercase tracking-tight ${
              isDark ? "text-emerald-400" : "text-emerald-600"
            }`}
          >
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>

        {item.found &&
          item.foundQuantity &&
          item.foundQuantity < item.quantity && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-1 w-1 animate-pulse rounded-full bg-amber-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                Partial: {item.foundQuantity} of {item.quantity}
              </p>
            </div>
          )}
      </div>

      {/* Action Button */}
      {isBatchShopping && (
        <div className="flex-shrink-0">
          <button
            onClick={() => onToggleFound(item, !item.found)}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 sm:text-[11px] ${
              item.found
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                : isDark
                ? "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                : "border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            {item.found ? (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="hidden sm:inline">Found</span>
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Find</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
