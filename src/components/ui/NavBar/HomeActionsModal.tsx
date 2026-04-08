import React from "react";
import { useRouter } from "next/router";
import { useTheme } from "../../../context/ThemeContext";

interface HomeActionsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HomeActionsModal({
  open,
  onClose,
}: HomeActionsModalProps) {
  const router = useRouter();
  const { theme } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-sm transform overflow-hidden rounded-t-[2.5rem] p-6 shadow-2xl transition-all sm:rounded-[2.5rem] ${
          theme === "dark"
            ? "border border-gray-700 bg-gray-900/95 backdrop-blur-xl"
            : "bg-white/95 backdrop-blur-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3
              className={`text-2xl font-black tracking-tight ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Quick Actions
            </h3>
            <p
              className={`mt-1 text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Choose an action to proceed
            </p>
          </div>
          <button
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
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
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          {/* Self Checkout Action */}
          <button
            onClick={() => {
              onClose();
              router.push("/SelfCheckout");
            }}
            className={`group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl py-4 pl-4 pr-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              theme === "dark"
                ? "bg-gray-800/80 hover:bg-gray-800"
                : "border border-transparent bg-gray-50 hover:border-gray-200/50 hover:bg-white hover:shadow-lg"
            }`}
          >
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span
                className={`text-lg font-bold tracking-tight ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Self Checkout
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                Scan QR to shop in store
              </span>
            </div>
          </button>

          {/* Connect Shop Action */}
          <button
            onClick={() => {
              onClose();
              router.push("/MobilePOS/Connect");
            }}
            className={`group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl py-4 pl-4 pr-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              theme === "dark"
                ? "bg-gray-800/80 hover:bg-gray-800"
                : "border border-transparent bg-gray-50 hover:border-gray-200/50 hover:bg-white hover:shadow-lg"
            }`}
          >
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span
                className={`text-lg font-bold tracking-tight ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Connect Shop
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Log into Mobile POS
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
