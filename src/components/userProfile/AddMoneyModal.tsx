import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { authenticatedFetch } from "../../lib/authenticatedFetch";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance?: number;
  walletId?: string;
  initialPhoneNumber?: string;
}

type TransactionStatus =
  | "idle"
  | "initiating"
  | "pending"
  | "success"
  | "failed";

export default function AddMoneyModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0,
  walletId,
  initialPhoneNumber = "",
}: AddMoneyModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhoneNumber);
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [loading, setLoading] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Predefined amount options
  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const checkStatus = async (refId: string) => {
    try {
      const response = await fetch(
        `/api/momo/request-to-pay-status?referenceId=${refId}`
      );
      const data = await response.json();

      if (data.status === "SUCCESSFUL") {
        setStatus("success");
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        toast.success("Money added successfully!");
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else if (data.status === "FAILED" || data.status === "REJECTED") {
        setStatus("failed");
        setStatusMessage(data.reason || "Transaction failed or was rejected");
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const startPolling = (refId: string) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    pollingInterval.current = setInterval(() => checkStatus(refId), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountNum < 100) {
      toast.error("Minimum amount is 100 RWF");
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const payerMessage = `Wallet Top-up: ${amountNum} RWF`;

    setLoading(true);
    setStatus("initiating");

    try {
      const response = await authenticatedFetch("/api/momo/request-to-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountNum,
          payerNumber: phoneNumber,
          payerMessage,
          walletId,
          externalId: `WALLET-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      setReferenceId(data.referenceId);
      setStatus("pending");
      setStatusMessage(
        data.message || "Please approve the payment on your phone"
      );
      startPolling(data.referenceId);
    } catch (error: any) {
      console.error("Error adding money:", error);
      setStatus("failed");
      setStatusMessage(error.message || "Failed to initiate MoMo payment");
      toast.error(error.message || "Failed to add money to wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleClose = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    setAmount("");
    setPhoneNumber("");
    setStatus("idle");
    setReferenceId(null);
    setStatusMessage("");
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10050] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal: bottom sheet on mobile, centered on desktop */}
      <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-gray-200 bg-white p-6 pb-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add Money to Wallet
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Current balance: {currentBalance.toLocaleString()} RWF
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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

        {status === "idle" || status === "initiating" ? (
          /* Form Section */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount (RWF)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  step="100"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-12 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Select
              </label>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleQuickAmount(quickAmount)}
                    disabled={loading}
                    className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${
                      amount === quickAmount.toString()
                        ? "border-green-500 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/30 dark:text-green-400"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-green-900/20"
                    }`}
                  >
                    {quickAmount >= 1000
                      ? `${quickAmount / 1000}k`
                      : quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                MTN Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="078... or 079..."
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-12 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the number you want to pay with
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !phoneNumber}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold !text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin !text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Initiating...
                  </span>
                ) : (
                  "Pay with MoMo"
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Status Section */
          <div className="py-8 text-center">
            {status === "pending" && (
              <div className="space-y-4">
                <div className="relative mx-auto h-20 w-20">
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-20"></div>
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <svg
                      className="h-10 w-10 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Waiting for Approval
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {statusMessage}
                </p>
                <div className="pt-4">
                  <div className="mx-auto h-1 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="animate-progress h-full bg-green-500"></div>
                  </div>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Success!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your wallet has been topped up successfully.
                </p>
              </div>
            )}

            {status === "failed" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <svg
                    className="h-12 w-12"
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
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Payment Failed
                </h3>
                <p className="text-sm text-gray-700 dark:text-red-400">
                  {statusMessage}
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 rounded-xl bg-gray-100 px-6 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span className="text-xs text-gray-400">
            Secure payment powered by MoMo
          </span>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 30s linear infinite;
        }
      `}</style>
    </div>
  );

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
