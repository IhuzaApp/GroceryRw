import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { OrderItem } from "../../types/order";

interface ProductImageModalProps {
  open: boolean;
  onClose: () => void;
  selectedImage: string | null;
  selectedProductName: string | null;
  currentOrderItem: OrderItem | null;
}

function safePrice(item: OrderItem | null): number {
  if (!item) return 0;
  const fromFinal = Number((item.product as any)?.final_price);
  const fromItem = Number(item.price);
  const value = Number.isFinite(fromFinal) ? fromFinal : Number.isFinite(fromItem) ? fromItem : 0;
  return Number.isFinite(value) ? value : 0;
}

export default function ProductImageModal({
  open,
  onClose,
  selectedImage,
  selectedProductName,
  currentOrderItem,
}: ProductImageModalProps) {
  if (!open) return null;

  const product = currentOrderItem?.product as any;
  const selectedDetails = product?.selectedDetails;
  const isBusinessOrder =
    selectedDetails &&
    typeof selectedDetails === "object" &&
    Object.keys(selectedDetails).length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {selectedProductName}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {selectedImage && currentOrderItem && (
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              {/* Left: Product Image */}
              <div className="flex justify-center">
                <Image
                  src={selectedImage}
                  alt={selectedProductName || "Product"}
                  width={320}
                  height={320}
                  className="max-h-[320px] rounded-xl border border-slate-200 object-contain shadow-md dark:border-slate-700"
                />
              </div>

              {/* Right: Product Details */}
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Product
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
                    {currentOrderItem.product.ProductName?.name ||
                      product?.name ||
                      "Unknown Product"}
                  </h3>
                </div>

                {isBusinessOrder ? (
                  /* Business order: selected details (size, color, etc.), unit, quantity, price */
                  <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="space-y-2">
                      {Object.entries(selectedDetails).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-4">
                          <span className="font-medium capitalize text-slate-600 dark:text-slate-300">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-slate-900 dark:text-slate-50">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Unit:
                        </span>
                        <span className="text-slate-900 dark:text-slate-50">
                          {product?.measurement_type ||
                            product?.measurement_unit ||
                            "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Quantity:
                        </span>
                        <span className="text-slate-900 dark:text-slate-50">
                          {currentOrderItem.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Price:
                        </span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(safePrice(currentOrderItem))}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Regular order: description, category, unit, price */
                  <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Description
                      </h4>
                      <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                        {currentOrderItem.product.description || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Category
                        </h4>
                        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                          {currentOrderItem.product.category || "—"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Unit
                        </h4>
                        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                          {currentOrderItem.product.measurement_unit || "—"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Price
                        </h4>
                        <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(safePrice(currentOrderItem))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:ring-offset-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
