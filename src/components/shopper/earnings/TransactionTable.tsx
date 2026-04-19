import React, { useState } from "react";
import { Loader } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

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

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

    if (earningTypes.some((t) => typeLC.includes(t))) return "earning";
    if (payoutTypes.some((t) => typeLC.includes(t))) return "payout";
    return "other";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const category = getTransactionCategory(transaction.type);
    let matchesFilter = filter === "all" || filter === category;
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportToExcel = () => {
    try {
      toast.loading("Preparing Premium Report...");
      const totalEarnings = filteredTransactions
        .filter((t) => getTransactionCategory(t.type) === "earning")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalPayouts = filteredTransactions
        .filter((t) => getTransactionCategory(t.type) === "payout")
        .reduce((sum, t) => sum + t.amount, 0);

      const exportData = filteredTransactions.map((t, index) => ({
        "#": index + 1,
        "Transaction ID": t.id,
        Date: formatDate(t.date),
        Description: t.description,
        Type: t.type,
        Amount: formatCurrencySync(t.amount),
        Status: t.status,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `Payment_History_${new Date().getTime()}.xlsx`);
      toast.dismiss();
      toast.success("Report Generated Successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Export Failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" content="Syncing Ledgers..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Header & Filters */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
          {[
            {
              id: "all",
              label: "All Logs",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2",
            },
            {
              id: "earning",
              label: "Income",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1",
            },
            {
              id: "payout",
              label: "Outflow",
              icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                filter === tab.id
                  ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
                  : isDark
                  ? "bg-white/5 text-white/40 hover:bg-white/10"
                  : "bg-black/5 text-black/40 hover:bg-black/10"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d={tab.icon}
                />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportToExcel}
          className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${
            isDark ? "bg-white text-black" : "bg-black text-white shadow-xl"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Statement
        </button>
      </div>

      {/* Floating Glass Strips Container */}
      <div className="space-y-3">
        <div className="hidden grid-cols-6 px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 lg:grid">
          <div className="col-span-2">Transaction Details</div>
          <div>Amount</div>
          <div>Flow Type</div>
          <div>Execution Date</div>
          <div className="text-right">Status</div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div
              className={`rounded-[2.5rem] border-2 border-dashed py-20 text-center ${
                isDark ? "border-white/5" : "border-black/5"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-widest opacity-20">
                No matching records
              </p>
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const category = getTransactionCategory(t.type);
              const isEarning = category === "earning";
              const accentColor = isEarning
                ? "emerald"
                : category === "payout"
                ? "rose"
                : "indigo";

              return (
                <div
                  key={t.id}
                  className={`group relative overflow-hidden rounded-[2rem] p-4 transition-all duration-300 hover:scale-[1.01] lg:px-8 lg:py-5 ${
                    isDark
                      ? "border border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      : "border border-black/5 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:items-center">
                    {/* Details */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${
                          isDark
                            ? `bg-${accentColor}-500/10 text-${accentColor}-400`
                            : `bg-${accentColor}-50 text-${accentColor}-600`
                        }`}
                      >
                        {getInitials(t.description)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-black tracking-tight">
                          {t.description}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          Ref: #{t.id.slice(-6)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col lg:block">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden">
                        Amount
                      </span>
                      <span
                        className={`text-lg font-black ${
                          isEarning ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isEarning ? "+" : "-"}
                        {formatCurrencySync(t.amount)}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="flex flex-col lg:block">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden">
                        Category
                      </span>
                      <span
                        className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tight ${
                          isDark
                            ? "bg-white/5 text-white/60"
                            : "bg-black/5 text-black/60"
                        }`}
                      >
                        {t.type}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col lg:block">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden">
                        Date
                      </span>
                      <span className="text-sm font-bold tabular-nums opacity-60">
                        {formatDate(t.date)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between lg:block lg:text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden">
                        Progress
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
                          t.status.toLowerCase() === "completed"
                            ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Flow Indicator Glow */}
                  <div
                    className={`absolute left-0 top-0 h-full w-1 ${
                      isEarning ? "bg-emerald-500" : "bg-rose-500"
                    } opacity-40 transition-opacity group-hover:opacity-100`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
