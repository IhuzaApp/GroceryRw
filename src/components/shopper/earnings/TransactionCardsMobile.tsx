import React, { useState } from "react";
import { Loader } from "rsuite";
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
  const isDark = theme === "dark";
  const [activeFilter, setActiveFilter] = useState("all");

  const getTransactionCategory = (type: string) => {
    const typeLC = type.toLowerCase();
    const earningTypes = [
      "earning",
      "credit",
      "payment",
      "income",
      "bonus",
      "tip",
    ];
    const payoutTypes = [
      "payout",
      "debit",
      "expense",
      "reserve",
      "withdrawal",
      "fee",
      "refund",
    ];

    if (earningTypes.some((t) => typeLC.includes(t))) return "income";
    if (payoutTypes.some((t) => typeLC.includes(t))) return "sent";
    return "other";
  };

  const getInitials = (name: string) => {
    const safe = (name || "").trim();
    if (!safe) return "TR";
    const words = safe.split(" ").filter(Boolean);
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredTransactions = transactions
    .filter(
      (t) =>
        activeFilter === "all" ||
        getTransactionCategory(t.type) === activeFilter
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
          Syncing Wallet...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      <div className="scrollbar-hide -mx-1 flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "income", "sent", "other"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeFilter === f
                ? "bg-emerald-500 text-white shadow-lg"
                : isDark
                ? "bg-white/5 text-white/40"
                : "bg-black/5 text-black/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!filteredTransactions.length ? (
        <div
          className={`rounded-[2.5rem] border-2 border-dashed p-12 text-center ${
            isDark ? "border-white/5" : "border-black/5"
          }`}
        >
          <p className="text-sm font-bold uppercase tracking-widest opacity-30">
            No matching logs
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((t) => {
            const category = getTransactionCategory(t.type);
            const isIncome = category === "income";
            const accentColor = isIncome
              ? "emerald"
              : category === "sent"
              ? "rose"
              : "indigo";

            return (
              <div
                key={t.id}
                className={`relative overflow-hidden rounded-[2rem] p-5 transition-all duration-300 ${
                  isDark
                    ? "border border-white/10 bg-white/5"
                    : "border border-black/5 bg-white shadow-sm"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-black ${
                        isDark
                          ? `bg-${accentColor}-500/10 text-${accentColor}-400`
                          : `bg-${accentColor}-50 text-${accentColor}-600`
                      }`}
                    >
                      {getInitials(t.description)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight">
                        {t.description}
                      </h4>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-base font-black ${
                        isIncome ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrencySync(t.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                  <span
                    className={`inline-flex rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                      isDark
                        ? "bg-white/5 text-white/40"
                        : "bg-black/5 text-black/40"
                    }`}
                  >
                    {t.type}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                      t.status.toLowerCase() === "completed"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* Glow bar */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    isIncome ? "bg-emerald-500" : "bg-rose-500"
                  } opacity-40`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionCardsMobile;
