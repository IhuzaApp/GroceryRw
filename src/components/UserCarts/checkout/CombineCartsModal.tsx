import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrency } from "../../../lib/formatCurrency";

interface Cart {
  id: string;
  name: string;
}

interface CartDetails {
  total: number;
  units: number;
  deliveryFee: number;
  serviceFee: number;
}

interface CombineCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCarts: Cart[];
  cartDetails: { [key: string]: CartDetails };
  selectedCartIds: Set<string>;
  toggleCartSelection: (cartId: string) => void;
  loadingCarts: boolean;
  onContinue: () => void;
}

export default function CombineCartsModal({
  isOpen,
  onClose,
  availableCarts,
  cartDetails,
  selectedCartIds,
  toggleCartSelection,
  loadingCarts,
  onContinue,
}: CombineCartsModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10010] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
        <div
          className={`relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b px-6 py-4 ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h3
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🛒 Combine with Other Carts
            </h3>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
            <div
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              <p
                className={`mb-4 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Select additional carts to checkout together.{" "}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Delivery fee is 30% off
                </span>{" "}
                for each additional cart!
              </p>

              {loadingCarts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500"></div>
                </div>
              ) : availableCarts.length === 0 ? (
                <div
                  className={`py-8 text-center ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No other carts available to combine
                </div>
              ) : (
                <div className="space-y-3">
                  {availableCarts.map((cart) => {
                    const details = cartDetails[cart.id];
                    const isSelected = selectedCartIds.has(cart.id);

                    return (
                      <div
                        key={cart.id}
                        onClick={() => toggleCartSelection(cart.id)}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                            : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleCartSelection(cart.id);
                            }}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="mb-2 flex items-center justify-between">
                              <h4
                                className={`text-base font-bold ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {cart.name}
                              </h4>
                              {isSelected && (
                                <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                                  SELECTED
                                </span>
                              )}
                            </div>

                            {details ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div
                                    className={`flex items-center gap-1 ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                      />
                                    </svg>
                                    <span>{details.units} items</span>
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>{formatCurrency(details.total)}</span>
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                      />
                                    </svg>
                                    <span>
                                      Service:{" "}
                                      {formatCurrency(details.serviceFee)}
                                    </span>
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                                      />
                                    </svg>
                                    <span>
                                      Delivery:{" "}
                                      {formatCurrency(details.deliveryFee)}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`flex items-center justify-between border-t pt-2 ${
                                    theme === "dark"
                                      ? "border-gray-700"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`text-sm font-semibold ${
                                      theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Cart Total:
                                  </span>
                                  <span className="text-base font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(details.total)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`flex items-center gap-2 text-sm ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
                                <span>Loading cart details...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-end gap-3 border-t px-6 py-4 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <button
              onClick={onClose}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onContinue}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-2.5 text-sm font-semibold shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{ color: "#ffffff" }}
            >
              {selectedCartIds.size > 0
                ? `Continue with ${selectedCartIds.size + 1} Cart${
                    selectedCartIds.size > 0 ? "s" : ""
                  }`
                : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
