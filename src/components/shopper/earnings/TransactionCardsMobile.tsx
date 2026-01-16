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

      {/* Transactions List - Card based like Overview */}
      {filteredTransactions.length === 0 ? (
        <div
          className={`rounded-xl p-8 text-center shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div
            className={`inline-flex rounded-full p-4 mb-3 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
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
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {activeFilter !== "all"
              ? "Try a different filter"
              : "Transactions will appear here"}
          </p>
        </div>
      ) : (
        <div>
          {sortedDateGroups.map((dateLabel, groupIndex) => (
          <div key={dateLabel} className={groupIndex > 0 ? "mt-6" : ""}>
            {/* Date Header */}
            <h3
              className={`mb-3 text-xs font-bold uppercase tracking-wider ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {dateLabel}
            </h3>

            {/* Transaction Cards */}
            {groupedTransactions[dateLabel].map((transaction) => {
              const avatarStyle = getAvatarStyle(transaction.type);
              const category = getTransactionCategory(transaction.type);
              const isIncome = category === "income";

              return (
                <div
                  key={transaction.id}
                  className={`mb-3 rounded-2xl p-4 shadow-lg transition-transform active:scale-98 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarStyle.bg} ${avatarStyle.text}`}
                    >
                      {getInitials(transaction.description)}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          theme === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {transaction.description}
                      </h4>
                      <p
                        className={`mt-1 text-xs ${
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

                    {/* Amount & Status */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span
                        className={`text-base font-bold ${
                          isIncome
                            ? "text-green-600 dark:text-green-500"
                            : "text-red-600 dark:text-red-500"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrencySync(transaction.amount)}
                      </span>
                      <span
                        className={`mt-1 text-xs font-medium capitalize ${
                          transaction.status.toLowerCase() === "completed" ||
                          transaction.status.toLowerCase() === "receive"
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
                </div>
              );
            })}
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default TransactionCardsMobile;
