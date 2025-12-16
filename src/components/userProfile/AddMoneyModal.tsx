import React, { useState, useEffect } from "react";
import { authenticatedFetch } from "../../lib/authenticatedFetch";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";
import CryptoJS from "crypto-js";

// Encryption key - should match the one in UserPaymentCards
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";

interface PaymentCardType {
  id: string;
  number: string;
  name: string;
  expiry_date: string;
  image: string | null;
  created_at: string;
}

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance?: number;
}

// Helper function to decrypt card number
const decryptData = (encryptedText: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "****";
  }
};

// Format card number to show only last 4 digits
const formatCardNumber = (encryptedNumber: string) => {
  try {
    const decrypted = decryptData(encryptedNumber);
    const lastFour = decrypted.slice(-4);
    return `**** **** **** ${lastFour}`;
  } catch (error) {
    return "**** **** **** ****";
  }
};

export default function AddMoneyModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0,
}: AddMoneyModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [paymentCards, setPaymentCards] = useState<PaymentCardType[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Predefined amount options
  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  // Fetch payment cards when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingCards(true);
      authenticatedFetch("/api/queries/payment-cards", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const cards = data.paymentCards || [];
          setPaymentCards(cards);
          if (cards.length > 0 && !selectedCardId) {
            setSelectedCardId(cards[0].id);
          }
        })
        .catch((err) => {
          console.error("Error fetching payment cards:", err);
          toast.error("Failed to load payment cards");
        })
        .finally(() => setLoadingCards(false));
    }
  }, [isOpen]);

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

    if (!selectedCardId) {
      toast.error("Please select a payment card");
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedFetch("/api/user/add-money-to-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountNum,
          description: description || undefined,
          payment_card_id: selectedCardId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add money");
      }

      toast.success(data.message || "Money added successfully!");
      setAmount("");
      setDescription("");
      setSelectedCardId("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding money:", error);
      toast.error(error.message || "Failed to add money to wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
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
            onClick={onClose}
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

        {/* Form */}
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimum: 100 RWF
            </p>
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

          {/* Payment Card Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Card <span className="text-red-500">*</span>
            </label>
            {loadingCards ? (
              <div className="flex items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
                <svg
                  className="h-5 w-5 animate-spin text-gray-400"
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
                <span className="ml-2 text-sm text-gray-500">Loading cards...</span>
              </div>
            ) : paymentCards.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center dark:border-gray-600 dark:bg-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No payment cards found. Please add a payment card first.
                </p>
              </div>
            ) : (
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
              >
                {paymentCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {formatCardNumber(card.number)} - {card.name} (Expires: {card.expiry_date})
                  </option>
                ))}
              </select>
            )}
            {paymentCards.length > 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select the card to charge for adding money
              </p>
            )}
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note for this transaction..."
              rows={2}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || !selectedCardId || paymentCards.length === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold !text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Adding...
                </span>
              ) : (
                "Add Money"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
