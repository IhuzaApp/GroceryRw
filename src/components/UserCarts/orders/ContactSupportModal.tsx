import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";

function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

export interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
  /** Current order (regular, reel, or restaurant) */
  order: any;
  /** Order type for this order */
  orderType: "regular" | "reel" | "restaurant";
  onSuccess?: () => void;
}

export default function ContactSupportModal({
  open,
  onClose,
  order,
  orderType,
  onSuccess,
}: ContactSupportModalProps) {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeName =
    order?.shop?.name ??
    order?.reel?.title ??
    order?.Restaurant?.name ??
    order?.restaurant?.name ??
    "—";
  const orderDisplayId =
    order?.OrderID != null ? formatOrderID(order.OrderID) : order?.id ?? "—";
  const status = order?.status ?? "—";

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter your message.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.id,
          orderDisplayId: order?.OrderID ?? order?.id,
          orderType,
          storeName,
          status,
          message: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to submit. Please try again.");
        return;
      }
      setMessage("");
      onSuccess?.();
      onClose();
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage("");
      setError(null);
      onClose();
    }
  };

  if (!open) return null;

  const colors = {
    focus: "focus:ring-green-500",
    border: "focus:border-green-500",
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-[550px] rounded-t-2xl border-0 shadow-2xl sm:rounded-2xl sm:border ${
          theme === "dark"
            ? "bg-gray-800 sm:border-gray-700"
            : "bg-white sm:border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-6 sm:px-8 ${
            theme === "dark"
              ? "border-b border-gray-700"
              : "border-b border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Contact Support
            </h2>
            <p
              className={`mt-1.5 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Describe your issue and we’ll create a ticket for this order
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
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
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <svg
                className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                  theme === "dark" ? "text-red-400" : "text-red-500"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-red-400" : "text-red-700"
                }`}
              >
                {error}
              </p>
            </div>
          )}

          {/* Order details (included in ticket) */}
          <div
            className={`mb-6 rounded-xl border p-4 sm:p-5 ${
              theme === "dark"
                ? "border-gray-700/50 bg-gray-900/40"
                : "border-gray-200 bg-gray-50/80"
            }`}
          >
            <p
              className={`mb-3 text-sm font-semibold ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Order details (included in this ticket)
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Order ID:</span> #{orderDisplayId}
              </p>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Type:</span>{" "}
                {orderType === "reel"
                  ? "Reel"
                  : orderType === "restaurant"
                  ? "Restaurant"
                  : "Regular"}
              </p>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Store / Shop:</span> {storeName}
              </p>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Status:</span> {status}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <label
              className={`block text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              rows={5}
              disabled={submitting}
              className={`w-full resize-none rounded-xl p-4 text-sm leading-relaxed transition-all duration-200 focus:outline-none ${
                theme === "dark"
                  ? "border-2 border-gray-700/50 bg-gray-900/40 text-white placeholder-gray-500/70 focus:border-gray-600 focus:bg-gray-900/60"
                  : "border-2 border-gray-200 bg-gray-50/80 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white"
              } ${colors.border} ${colors.focus} focus:ring-2 focus:ring-offset-0`}
            />
          </div>
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
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold !text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            style={{ color: "white" }}
            type="button"
          >
            <span className="!text-white">Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold !text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            style={{ color: "white" }}
            type="button"
          >
            {submitting ? (
              <span className="flex items-center justify-center !text-white">
                <svg className="mr-2 h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center !text-white">
                <svg
                  className="mr-2 h-4 w-4 shrink-0 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  />
                </svg>
                Submit ticket
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
