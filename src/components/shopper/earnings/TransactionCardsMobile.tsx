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
    const earningTypes = ["earning", "credit", "payment", "payments", "income", "bonus", "tip", "tips"];
    const payoutTypes = ["payout", "payouts", "debit", "expense", "expenses", "reserve", "withdrawal", "fee", "refund"];

    if (earningTypes.some((t) => typeLC.includes(t))) return "income";
    if (payoutTypes.some((t) => typeLC.includes(t))) return "sent";
    return "other";
  };

  // Get initials from description
  const getInitials = (name: string) => {
    const words = name.split(" ");
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
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeFilter === "all") return true;
    const category = getTransactionCategory(transaction.type);
    return category === activeFilter;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const dateLabel = formatDate(transaction.date);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort date groups
  const sortedDateGroups = Object.keys(groupedTransactions).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Filter tabs
  const filters = [
    { id: "all", label: "All" },
    { id: "income", label: "Income" },
    { id: "sent", label: "Sent" },
    { id: "request", label: "Request" },
    { id: "transfer", label: "Transfer" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full -mt-2">
      {/* Filter Tabs - Edge to edge scrollable */}
      <div className="mb-3 -mx-3 px-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeFilter === filter.id
                  ? theme === "dark"
                    ? "bg-white text-gray-900"
                    : "bg-gray-900 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-400 active:bg-gray-700"
                  : "bg-white text-gray-600 active:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="w-full">
        {filteredTransactions.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 px-4 ${
            theme === "dark" ? "bg-gray-800/50" : "bg-gray-50/50"
          } rounded-2xl`}>
            <div
              className={`rounded-full p-4 mb-3 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <svg
                className="h-8 w-8 text-gray-400"
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
            <h3
              className={`text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              No transactions found
            </h3>
            <p
              className={`text-xs text-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {activeFilter !== "all"
                ? "Try a different filter"
                : "Transactions will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {sortedDateGroups.map((dateLabel) => (
              <div key={dateLabel}>
                {/* Date Header */}
                <div className="mb-2">
                  <h3
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {dateLabel}
                  </h3>
                </div>

                {/* Transaction Cards */}
                <div className="space-y-1.5">
                  {groupedTransactions[dateLabel].map((transaction) => {
                    const avatarStyle = getAvatarStyle(transaction.type);
                    const category = getTransactionCategory(transaction.type);
                    const isIncome = category === "income";

                    return (
                      <div
                        key={transaction.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${
                          theme === "dark"
                            ? "bg-gray-800"
                            : "bg-white border border-gray-100"
                        }`}
                      >
                        {/* Avatar/Icon */}
                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarStyle.bg} ${avatarStyle.text}`}
                        >
                          {getInitials(transaction.description)}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              theme === "dark" ? "text-gray-100" : "text-gray-900"
                            }`}
                          >
                            {transaction.description}
                          </h4>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {new Date(transaction.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {" • "}
                            {formatTime(transaction.date, transaction.time)}
                          </p>
                        </div>

                        {/* Amount and Status */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span
                            className={`text-sm font-bold ${
                              isIncome
                                ? "text-green-600 dark:text-green-500"
                                : "text-red-600 dark:text-red-500"
                            }`}
                          >
                            {isIncome ? "+" : "-"}{formatCurrencySync(transaction.amount)}
                          </span>
                          <span
                            className={`text-[10px] font-medium mt-0.5 capitalize ${
                              transaction.status.toLowerCase() === "completed" || transaction.status.toLowerCase() === "receive"
                                ? "text-green-600 dark:text-green-500"
                                : transaction.status.toLowerCase() === "pending"
                                ? "text-yellow-600 dark:text-yellow-500"
                                : transaction.status.toLowerCase() === "paid"
                                ? "text-red-600 dark:text-red-500"
                                : theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCardsMobile;
