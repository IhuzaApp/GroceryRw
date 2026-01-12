import React, { useState } from "react";
import { Button } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";

export default function ConfirmPayment() {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!open) return (
    <Button
      appearance="primary"
      onClick={handleOpen}
      size="lg"
      color="green"
      className="bg-green-500 px-12 font-medium text-white"
    >
      Checkout
    </Button>
  );

  return (
    <>
      <Button
        appearance="primary"
        onClick={handleOpen}
        size="lg"
        color="green"
        className="bg-green-500 px-12 font-medium text-white"
      >
        Checkout
      </Button>

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={`relative z-10 w-full max-w-[550px] rounded-t-2xl border-0 shadow-2xl sm:rounded-2xl sm:border ${
            theme === "dark"
              ? "bg-gray-800 sm:border-gray-700"
              : "bg-white sm:border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-6 sm:px-8 ${
              theme === "dark"
                ? "border-b border-gray-700"
                : "border-b border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Confirm Payment
            </h2>
            <button
              onClick={handleClose}
              className={`rounded-lg p-2 transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
            >
              <svg
                className="h-5 w-5"
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
          <div
            className={`max-h-[70vh] overflow-y-auto px-6 py-8 sm:px-8 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              Payment confirmation content goes here...
            </p>
          </div>

          {/* Footer */}
          <div
            className={`flex w-full flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 ${
              theme === "dark"
                ? "border-t border-gray-700"
                : "border-t border-gray-200"
            }`}
          >
            <button
              onClick={handleClose}
              className={`rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              className={`rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
