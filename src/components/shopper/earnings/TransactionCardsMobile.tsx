import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  date: string;
  time?: string;
  orderId?: string | null;
  orderNumber?: number | null;
}

interface TransactionCardsMobileProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionCardsMobile: React.FC<TransactionCardsMobileProps> = ({
  transactions,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");

  // Categorize transaction types
  const getTransactionCategory = (type: string) => {
    const typeLC = type.toLowerCase();
    const earningTypes = [
      "earning",
      "credit",
      "payment",
      "payments",
      "income",
      "bonus",
      "tip",
      "tips",
    ];
    const payoutTypes = [
      "payout",
      "payouts",
      "debit",
      "expense",
      "expenses",
      "reserve",
      "withdrawal",
      "fee",
      "refund",
    ];

    if (earningTypes.some((t) => typeLC.includes(t))) return "income";
    if (payoutTypes.some((t) => typeLC.includes(t))) return "sent";
    return "other";
  };

  // Get initials from description
  const getInitials = (name: string) => {
    const safe = (name || "").trim();
    if (!safe) return "TR";
    const words = safe.split(" ").filter(Boolean);
    return words
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar/icon color and background
  const getAvatarStyle = (type: string) => {
    const category = getTransactionCategory(type);
    if (category === "income") {
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
      };
    }
    if (category === "sent") {
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
      };
    }
    return {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-600",
    };
  };

  const getTypeBadgeStyle = (type: string) => {
    const category = getTransactionCategory(type);
    if (category === "income") {
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
    }
    if (category === "sent") {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
    }
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  };

  const getStatusPillStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success" || s === "successful") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    }
    if (s === "pending" || s === "processing") {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
    if (s === "failed" || s === "error" || s === "cancelled" || s === "canceled") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  // Format time
  const formatTime = (dateString: string, timeString?: string) => {
    if (timeString) return timeString;
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      if (activeFilter === "all") return true;
      const category = getTransactionCategory(transaction.type);
      return category === activeFilter;
    })
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter tabs
  const filters = [
    { id: "all", label: "All" },
    { id: "income", label: "Income" },
    { id: "sent", label: "Sent" },
    { id: "other", label: "Other" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!filteredTransactions.length) {
    return (
      <div className="w-full space-y-3 pb-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeFilter === filter.id
                  ? theme === "dark"
                    ? "bg-white text-gray-900"
                    : "bg-gray-900 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-400 active:bg-gray-700"
                  : "bg-white text-gray-600 active:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div
          className={`rounded-xl border p-5 text-center ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800 text-gray-200"
              : "border-gray-200 bg-white text-gray-700"
          }`}
        >
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <div className="text-sm font-semibold">No transactions found</div>
          <div className="mt-1 text-xs opacity-70">
            Try switching filters or check back later.
          </div>
        </div>
      </div>
    );
  }

  // Group transactions by date label, while keeping a real sortable key
  const grouped = filteredTransactions.reduce((acc, t) => {
    const label = formatDate(t.date);
    const ts = new Date(t.date).getTime();
    if (!acc[label]) acc[label] = { sortKey: ts, items: [] as Transaction[] };
    acc[label].sortKey = Math.max(acc[label].sortKey, ts);
    acc[label].items.push(t);
    return acc;
  }, {} as Record<string, { sortKey: number; items: Transaction[] }>);

  const dateGroups = Object.entries(grouped).sort((a, b) => b[1].sortKey - a[1].sortKey);

  return (
    <div className="w-full space-y-3 pb-4">
      {/* Filter Tabs - Clean horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              activeFilter === filter.id
                ? theme === "dark"
                  ? "bg-white text-gray-900"
                  : "bg-gray-900 text-white"
                : theme === "dark"
                ? "bg-gray-800 text-gray-400 active:bg-gray-700"
                : "bg-white text-gray-600 active:bg-gray-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Date grouped cards */}
      <div className="space-y-4">
        {dateGroups.map(([label, group]) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div
                className={`text-xs font-bold uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {label}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {group.items.length}{" "}
                {group.items.length === 1 ? "transaction" : "transactions"}
              </div>
            </div>

            <div className="space-y-2">
              {group.items.map((transaction) => {
                const avatar = getAvatarStyle(transaction.type);
                const category = getTransactionCategory(transaction.type);
                const isSent = category === "sent";
                const sign = isSent ? "-" : "+";

                return (
                  <div
                    key={transaction.id}
                    className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${avatar.bg} ${avatar.text} ${avatar.border} font-bold`}
                        >
                          {getInitials(transaction.description)}
                        </div>

                        <div className="min-w-0">
                          <div
                            className={`text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-100"
                                : "text-gray-900"
                            }`}
                          >
                            {transaction.description || "Transaction"}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getTypeBadgeStyle(
                                transaction.type
                              )}`}
                            >
                              {transaction.type}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusPillStyle(
                                transaction.status
                              )}`}
                            >
                              {transaction.status}
                            </span>
                          </div>

                          <div
                            className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatTime(transaction.date, transaction.time)}
                            </span>

                            {transaction.orderId && (
                              <span className="inline-flex items-center gap-1">
                                <svg
                                  className="h-3.5 w-3.5"
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
                                Order{" "}
                                {transaction.orderNumber
                                  ? `#${transaction.orderNumber}`
                                  : `#${transaction.orderId.slice(-6)}`}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              ID #{transaction.id.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div
                          className={`text-sm font-bold ${
                            category === "income"
                              ? "text-green-600 dark:text-green-400"
                              : category === "sent"
                              ? "text-red-600 dark:text-red-400"
                              : theme === "dark"
                              ? "text-gray-200"
                              : "text-gray-900"
                          }`}
                        >
                          {sign}
                          {formatCurrencySync(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionCardsMobile;
