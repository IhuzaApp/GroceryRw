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
    const earningTypes = ["earning", "credit", "payment", "income", "bonus", "tip"];
    const payoutTypes = ["payout", "debit", "expense", "reserve", "withdrawal", "fee", "refund"];

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
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportToExcel = () => {
    try {
      toast.loading("Architecting Statement...", { id: "export" });
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
      XLSX.utils.book_append_sheet(wb, ws, "Statement");
      XLSX.writeFile(wb, `Financial_Statement_${new Date().getTime()}.xlsx`);
      toast.success("Statement Generated", { id: "export" });
    } catch (error) {
      toast.error("Export Failed", { id: "export" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-xs font-black uppercase tracking-[0.25em] opacity-40 animate-pulse">Syncing Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Header & Filters */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-hide flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0">
          {[
            { id: "all", label: "Global History", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
            { id: "earning", label: "Income Logs", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" },
            { id: "payout", label: "Payouts", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 active:scale-95 ${
                filter === tab.id
                  ? "bg-emerald-500 text-white shadow-[0_10px_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                  : isDark
                  ? "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                  : "bg-white text-gray-500 border border-gray-100 shadow-sm hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportToExcel}
          className={`flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl ${
            isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800 shadow-black/20"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Financial Statement
        </button>
      </div>

      {/* Main Ledger List */}
      <div className="space-y-4">
        <div className="hidden grid-cols-6 px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 lg:grid">
          <div className="col-span-2">Transaction Details</div>
          <div>Amount</div>
          <div>Category</div>
          <div>Execution Date</div>
          <div className="text-right">Settlement</div>
        </div>

        <div className="space-y-3 pb-12">
          {filteredTransactions.length === 0 ? (
            <div
              className={`rounded-[3rem] border-2 border-dashed py-32 text-center transition-colors ${
                isDark ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] ${isDark ? "bg-white/5" : "bg-white shadow-xl"}`}>
                <svg className="h-10 w-10 text-gray-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] opacity-20">
                No matching financial records found
              </p>
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const category = getTransactionCategory(t.type);
              const isEarning = category === "earning";
              const isPayout = category === "payout";
              
              const accentStyles = isEarning 
                ? { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "ring-emerald-500/20", amount: "text-emerald-500" }
                : isPayout
                ? { bg: "bg-rose-500/10", text: "text-rose-500", border: "ring-rose-500/20", amount: "text-rose-500" }
                : { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "ring-indigo-500/20", amount: "text-indigo-500" };

              return (
                <div
                  key={t.id}
                  className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
                    isDark
                      ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl hover:bg-gray-800/60 shadow-xl"
                      : "border border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:border-emerald-200"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-6 lg:items-center">
                    {/* Details */}
                    <div className="col-span-2 flex items-center gap-6">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black tracking-tighter ring-1 transition-all duration-500 group-hover:rotate-12 ${
                          isDark ? `${accentStyles.bg} ${accentStyles.text} ${accentStyles.border}` : `${accentStyles.bg.replace("10", "100")} ${accentStyles.text} ${accentStyles.border}`
                        }`}
                      >
                        {getInitials(t.description)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className={`truncate text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                          {t.description}
                        </h4>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/20" : "text-gray-400"}`}>
                          ID: {t.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col lg:block">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden mb-1">Quantum</span>
                      <span className={`text-xl font-black tabular-nums tracking-tighter ${accentStyles.amount}`}>
                        {isEarning ? "+" : "-"}{formatCurrencySync(t.amount)}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="flex flex-col lg:block">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden mb-1">Classification</span>
                      <span className={`inline-flex rounded-xl px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                        isDark ? "bg-white/5 text-white/40 ring-1 ring-white/10" : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                      }`}>
                        {t.type}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col lg:block">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden mb-1">Execution</span>
                      <span className={`text-sm font-black tabular-nums tracking-tight ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        {formatDate(t.date)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between lg:block lg:text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 lg:hidden">Settlement</span>
                      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                        t.status.toLowerCase() === "completed"
                          ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${t.status.toLowerCase() === "completed" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {t.status}
                      </div>
                    </div>
                  </div>

                  {/* Flow Indicator Glow */}
                  <div className={`absolute left-0 top-0 h-full w-1.5 transition-all duration-500 group-hover:w-2 ${
                    isEarning ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : isPayout ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" : "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  }`} />
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
