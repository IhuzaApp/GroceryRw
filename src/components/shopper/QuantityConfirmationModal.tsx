import React from "react";
import { Modal, Button, InputNumber, Form } from "rsuite";
import { OrderItem } from "../../types/order";
import { useTheme } from "../../context/ThemeContext";
import Image from "next/image";

interface QuantityConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  currentItem: OrderItem | null;
  foundQuantity: number;
  setFoundQuantity: (quantity: number) => void;
  onConfirm: () => void;
}

export default function QuantityConfirmationModal({
  open,
  onClose,
  currentItem,
  foundQuantity,
  setFoundQuantity,
  onConfirm,
}: QuantityConfirmationModalProps) {
  const { theme } = useTheme();

  if (!currentItem) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      className={`${theme === "dark" ? "bg-gray-900" : "bg-white"} rounded-xl`}
    >
      <Modal.Header
        className={`${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } border-b border-slate-200 dark:border-slate-700`}
      >
        <Modal.Title
          className={`text-lg font-semibold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Confirm Found Quantity
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        } p-6`}
      >
        {/* Product Info Card */}
        <div
          className={`mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800`}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
              {currentItem.product.image ? (
                <Image
                  src={currentItem.product.image}
                  alt={currentItem.product.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-300">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 17h6M9 12h6M9 7h6" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {currentItem.product.name}
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Requested: {currentItem.quantity} units
              </p>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Price: ${currentItem.price} each
              </p>
            </div>
          </div>
        </div>

        {/* Quantity Input Section */}
        <div className="space-y-4">
          <div
            className={`rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700`}
          >
            <div className="mb-3">
              <label
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                How many units did you find?
              </label>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } mt-1`}
              >
                Enter the quantity you found (0 to {currentItem.quantity})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <InputNumber
                  value={foundQuantity}
                  onChange={(value) => setFoundQuantity(value || 0)}
                  min={0}
                  max={currentItem.quantity}
                  className={`w-full ${
                    theme === "dark"
                      ? "border-slate-500 bg-slate-600 text-gray-100"
                      : "border-slate-300 bg-white text-gray-900"
                  } rounded-lg border px-3 py-2 text-center text-lg font-semibold`}
                  size="lg"
                />
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                of {currentItem.quantity}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div
            className={`rounded-lg p-3 ${
              foundQuantity === 0
                ? "border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                : foundQuantity === currentItem.quantity
                ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                : "border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`rounded-full p-1 ${
                  foundQuantity === 0
                    ? "bg-red-100 dark:bg-red-800"
                    : foundQuantity === currentItem.quantity
                    ? "bg-emerald-100 dark:bg-emerald-800"
                    : "bg-amber-100 dark:bg-amber-800"
                }`}
              >
                <svg
                  className={`h-4 w-4 ${
                    foundQuantity === 0
                      ? "text-red-600 dark:text-red-400"
                      : foundQuantity === currentItem.quantity
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {foundQuantity === 0 ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : foundQuantity === currentItem.quantity ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  )}
                </svg>
              </div>
              <span
                className={`text-sm font-medium ${
                  foundQuantity === 0
                    ? "text-red-800 dark:text-red-300"
                    : foundQuantity === currentItem.quantity
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-amber-800 dark:text-amber-300"
                }`}
              >
                {foundQuantity === 0
                  ? "No units found"
                  : foundQuantity === currentItem.quantity
                  ? "All units found"
                  : "Partial quantity found"}
              </span>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer
        className={`${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } border-t border-slate-200 p-4 dark:border-slate-700`}
      >
        <div className="flex w-full gap-3">
          <Button
            appearance="subtle"
            onClick={onClose}
            className={`flex-1 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={onConfirm}
            disabled={foundQuantity === 0}
            className={`flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500`}
          >
            Confirm Found
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
