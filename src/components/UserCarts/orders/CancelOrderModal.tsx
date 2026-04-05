import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Info } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
  refund: number;
  deduction: number;
  handleCancelOrder: () => void;
  isCancelling: boolean;
}

export default function CancelOrderModal({
  open,
  onClose,
  order,
  refund,
  deduction,
  handleCancelOrder,
  isCancelling,
}: CancelOrderModalProps) {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!open || !isMounted) return null;

  const isDark = theme === "dark";

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div
        className={`w-full max-w-[450px] rounded-t-3xl border-0 shadow-2xl sm:rounded-3xl ${
          isDark
            ? "bg-gray-900 sm:border-gray-800"
            : "bg-white sm:border-gray-200"
        } sm:border transform transition-all translate-y-0 opacity-100`}
      >
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className={`rounded-full p-2 transition-colors ${
              isDark
                ? "text-gray-400 hover:bg-gray-800"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center px-8 pb-10 pt-2">
          {/* Icon with pulse effect */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 animate-ping rounded-full opacity-20 ${isDark ? "bg-red-500" : "bg-red-400"}`}></div>
            <div className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-inner ${isDark ? "bg-red-900/30 text-red-500" : "bg-red-50 text-red-500"}`}>
              <AlertCircle className="h-10 w-10" />
            </div>
          </div>

          <h3 className={`mb-2 text-center text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Cancel Order?
          </h3>
          <p className={`mb-6 text-center text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>

          <div className={`mb-8 flex w-full flex-col gap-3 rounded-2xl border p-5 ${isDark ? "border-gray-800 bg-gray-800/30" : "border-gray-100 bg-gray-50"}`}>
            <div className={`flex justify-between text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              <span>Refund to Wallet</span>
              <span className={`font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
                +{refund.toLocaleString()} RWF
              </span>
            </div>
            {deduction > 0 && (
              <div className={`flex justify-between text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <span>Cancellation Fee (30%)</span>
                <span className="font-bold text-red-500">
                  -{deduction.toLocaleString()} RWF
                </span>
              </div>
            )}
          </div>

          {order?.status?.toUpperCase() === "ACCEPTED" && (
            <div className={`mb-8 w-full overflow-hidden rounded-2xl border p-4 backdrop-blur-sm ${isDark ? "border-orange-900/30 bg-orange-900/10" : "border-orange-100 bg-orange-50"}`}>
              <div className="flex gap-3">
                <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
                <div>
                  <p className={`text-sm font-bold ${isDark ? "text-orange-300" : "text-orange-800"}`}>
                    Refund Policy Notice
                  </p>
                  <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-orange-400/80" : "text-orange-700/80"}`}>
                    Since the order has been accepted, 30% of fees will be retained as compensation. The remainder will be refunded instantly to your wallet.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-3">
            <button
              onClick={() => handleCancelOrder()}
              disabled={isCancelling}
              className={`w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl ${
                isDark 
                  ? "bg-red-600 text-white hover:bg-red-500 shadow-red-900/20" 
                  : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
              }`}
            >
              {isCancelling ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Order"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isCancelling}
              className={`w-full rounded-2xl py-4 text-sm font-bold transition-all disabled:opacity-50 ${
                isDark
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              No, Keep Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
