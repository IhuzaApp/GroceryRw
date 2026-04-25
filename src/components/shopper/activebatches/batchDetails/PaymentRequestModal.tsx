import React from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../../../context/ThemeContext";

interface PaymentRequestModalProps {
  open: boolean;
  onClose: () => void;
  status: string;
  amount: number;
  orderId: string;
}

const PaymentRequestModal: React.FC<PaymentRequestModalProps> = ({
  open,
  onClose,
  status,
  amount,
  orderId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!open) return null;

  const getStatusDisplay = () => {
    switch (status) {
      case "APPROVED":
        return {
          title: "Payment Approved",
          icon: (
            <svg
              className="h-12 w-12 text-emerald-500"
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
          ),
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "FAILED":
      case "REJECTED":
        return {
          title: "Payment Rejected",
          icon: (
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          color: "text-red-500",
          bg: "bg-red-500/10",
        };
      default:
        return {
          title: "Waiting for Payment",
          icon: (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          ),
          color: "text-emerald-500",
          bg: "bg-emerald-500/5",
        };
    }
  };

  const statusInfo = getStatusDisplay();

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-[450px] overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${
          isDark ? "border-white/10 bg-[#0A0A0A]" : "border-black/5 bg-white"
        }`}
      >
        <div className="relative p-10 text-center">
          {/* Header Animation/Icon */}
          <div className="mb-8 flex justify-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full ${statusInfo.bg}`}
            >
              {statusInfo.icon}
            </div>
          </div>

          <h2
            className={`mb-2 text-2xl font-black tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {statusInfo.title}
          </h2>
          <p className="mb-8 text-sm font-bold text-gray-500">
            Order #{orderId.slice(0, 8)} • {amount.toLocaleString()} RWF
          </p>

          <div
            className={`rounded-2xl border p-6 ${
              isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-gray-50"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {status === "PENDING_PAYMENT"
                ? "An agent is currently processing your payment request. Please stay on this screen for real-time confirmation."
                : status === "APPROVED"
                ? "Your payment has been successfully processed. You can now proceed to the next step."
                : "Your payment request was not approved. Please contact support or try again."}
            </p>
          </div>

          {(status === "APPROVED" ||
            status === "REJECTED" ||
            status === "FAILED") && (
            <button
              onClick={onClose}
              className="mt-10 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 py-4 font-black tracking-tight text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              {status === "APPROVED" ? "PROCEED" : "CLOSE"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentRequestModal;
