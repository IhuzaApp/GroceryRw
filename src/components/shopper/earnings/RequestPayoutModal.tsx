"use client";

import { useState } from "react";
import {
  X,
  DollarSign,
  Wallet,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { useTheme } from "../../../context/ThemeContext";
import toast from "react-hot-toast";

interface Wallet {
  id: string;
  availableBalance: number;
  reservedBalance: number;
}

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onSubmit: (amount: number) => Promise<void>;
}

export function RequestPayoutModal({
  isOpen,
  onClose,
  wallet,
  onSubmit,
}: RequestPayoutModalProps) {
  const { theme } = useTheme();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Enter Amount, 2: Review

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      setWithdrawAmount(value);
    }
  };

  const setPercentage = (percentage: number) => {
    if (wallet) {
      const amount = (wallet.availableBalance * percentage).toFixed(2);
      setWithdrawAmount(amount);
    }
  };

  const handleNext = () => {
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (wallet && amount > wallet.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    const amount = parseFloat(withdrawAmount);

    try {
      setIsProcessing(true);
      await onSubmit(amount);
      toast.success("Payout request submitted successfully!");

      // Reset and close
      setTimeout(() => {
        setWithdrawAmount("");
        setCurrentStep(1);
        onClose();
      }, 500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to process payout request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const amount = parseFloat(withdrawAmount) || 0;
  const remainingBalance = wallet ? wallet.availableBalance - amount : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Payout
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Withdraw funds from your available balance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 px-6 py-4 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                }`}
              >
                1
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= 1
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Enter Amount
                </p>
              </div>
            </div>
            <div
              className={`mx-4 h-0.5 flex-1 ${
                currentStep > 1
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-600"
              }`}
            />
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 2
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                }`}
              >
                2
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= 2
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Review & Confirm
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Step 1: Enter Amount */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Available Balance Display */}
              <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mb-2 flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-medium text-green-900 dark:text-green-200">
                    Available Balance
                  </h3>
                </div>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrencySync(wallet?.availableBalance || 0)}
                </p>
                {wallet && wallet.reservedBalance > 0 && (
                  <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                    Reserved: {formatCurrencySync(wallet.reservedBalance)}
                  </p>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-20 text-2xl font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    disabled={isProcessing}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    RWF
                  </span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick Select
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPercentage(0.25)}
                    disabled={isProcessing || !wallet}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPercentage(0.5)}
                    disabled={isProcessing || !wallet}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPercentage(0.75)}
                    disabled={isProcessing || !wallet}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPercentage(1)}
                    disabled={isProcessing || !wallet}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Amount Preview */}
              {amount > 0 && wallet && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Withdrawal Amount:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrencySync(amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Processing Fee:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrencySync(0)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Remaining Balance:
                        </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrencySync(remainingBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review & Confirm */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Payout Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">
                      Withdrawal Amount
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrencySync(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">
                      Processing Fee
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencySync(0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">
                      Current Balance
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencySync(wallet?.availableBalance || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      New Balance
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrencySync(remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200">
                      Important Information
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      <li>
                        • Payout requests are processed within 1-3 business days
                      </li>
                      <li>
                        • Funds will be transferred to your registered account
                      </li>
                      <li>
                        • You'll receive a confirmation email once processed
                      </li>
                      <li>• Make sure your account details are up to date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700/50">
          <div>
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isProcessing}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
            >
              Cancel
            </button>

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) <= 0 ||
                  isProcessing
                }
                className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm Payout
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
