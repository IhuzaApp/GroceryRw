import React, { useState } from "react";
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
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get initials from description/name
  const getInitials = (name: string) => {
    const words = name.split(" ");
    return words
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color based on type
  // Categorize transaction types
  const getTransactionCategory = (type: string) => {
    const typeLC = type.toLowerCase();
    
    // Earnings/Income types
    const earningTypes = ['earning', 'credit', 'payment', 'payments', 'income', 'bonus', 'tip', 'tips'];
    
    // Payout/Expense types  
    const payoutTypes = ['payout', 'payouts', 'debit', 'expense', 'expenses', 'reserve', 'withdrawal', 'fee', 'refund'];
    
    if (earningTypes.some(t => typeLC.includes(t))) return 'earning';
    if (payoutTypes.some(t => typeLC.includes(t))) return 'payout';
    
    return 'other';
  };

  const getAvatarColor = (type: string) => {
    const category = getTransactionCategory(type);
    const colors = {
      earning: "bg-green-100 text-green-600",
      payout: "bg-red-100 text-red-600",
      other: "bg-gray-100 text-gray-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  // Get account badge color
  const getAccountBadgeColor = (type: string) => {
    const category = getTransactionCategory(type);
    const colors = {
      earning: "bg-green-50 text-green-700 border-green-200",
      payout: "bg-red-50 text-red-700 border-red-200",
      other: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const category = getTransactionCategory(transaction.type);
    
    let matchesFilter = false;
    if (filter === "all") {
      matchesFilter = true;
    } else if (filter === "earning") {
      matchesFilter = category === "earning";
    } else if (filter === "payout") {
      matchesFilter = category === "payout";
    }
    
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Export to Excel function
  const handleExportToExcel = () => {
    try {
      toast.loading("Preparing Excel file...");

      // Calculate summary statistics
      const totalEarnings = filteredTransactions
        .filter(t => getTransactionCategory(t.type) === 'earning')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalPayouts = filteredTransactions
        .filter(t => getTransactionCategory(t.type) === 'payout')
        .reduce((sum, t) => sum + t.amount, 0);

      const netAmount = totalEarnings - totalPayouts;

      // Prepare transaction data for export
      const exportData = filteredTransactions.map((transaction, index) => {
        const category = getTransactionCategory(transaction.type);
        return {
          "#": index + 1,
          "Transaction ID": transaction.id,
          "Date": formatDate(transaction.date),
          "Time": transaction.time || "N/A",
          "Description": transaction.description,
          "Type": transaction.type,
          "Category": category.charAt(0).toUpperCase() + category.slice(1),
          "Amount": transaction.amount,
          "Amount (Formatted)": formatCurrencySync(transaction.amount),
          "Status": transaction.status,
          "Order ID": transaction.orderId || "N/A",
          "Order Number": transaction.orderNumber || "N/A",
        };
      });

      // Create worksheet for transactions
      const transactionsWorksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for transactions
      const transactionColumnWidths = [
        { wch: 5 },   // #
        { wch: 40 },  // Transaction ID
        { wch: 15 },  // Date
        { wch: 12 },  // Time
        { wch: 35 },  // Description
        { wch: 15 },  // Type
        { wch: 12 },  // Category
        { wch: 12 },  // Amount
        { wch: 18 },  // Amount (Formatted)
        { wch: 12 },  // Status
        { wch: 40 },  // Order ID
        { wch: 15 },  // Order Number
      ];
      transactionsWorksheet['!cols'] = transactionColumnWidths;

      // Create summary data
      const summaryData = [
        { "Summary": "Report Type", "Value": filter === "all" ? "All Transactions" : filter.charAt(0).toUpperCase() + filter.slice(1) },
        { "Summary": "Total Transactions", "Value": filteredTransactions.length },
        { "Summary": "Total Earnings", "Value": formatCurrencySync(totalEarnings) },
        { "Summary": "Total Payouts", "Value": formatCurrencySync(totalPayouts) },
        { "Summary": "Net Amount", "Value": formatCurrencySync(netAmount) },
        { "Summary": "", "Value": "" },
        { "Summary": "Earnings Count", "Value": filteredTransactions.filter(t => getTransactionCategory(t.type) === 'earning').length },
        { "Summary": "Payouts Count", "Value": filteredTransactions.filter(t => getTransactionCategory(t.type) === 'payout').length },
        { "Summary": "", "Value": "" },
        { "Summary": "Generated On", "Value": new Date().toLocaleString() },
        { "Summary": "Generated By", "Value": "Plasa Earnings System" },
      ];

      // Create summary worksheet
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 30 }];

      // Create workbook and add sheets
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
      XLSX.utils.book_append_sheet(workbook, transactionsWorksheet, "Transactions");

      // Generate filename with current date
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
      const filename = `Payment_History_${filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}_${dateStr}_${timeStr}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      toast.dismiss();
      toast.success(`Exported ${filteredTransactions.length} transactions to Excel!`, {
        duration: 3000,
        icon: "📊",
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export to Excel. Please try again.");
      console.error("Export error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {(() => {
            const earningsCount = transactions.filter(t => getTransactionCategory(t.type) === 'earning').length;
            const payoutsCount = transactions.filter(t => getTransactionCategory(t.type) === 'payout').length;
            
            return [
              { 
                id: "all", 
                label: "All Transactions",
                count: transactions.length,
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )
              },
              { 
                id: "earning", 
                label: "Earnings",
                count: earningsCount,
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                id: "payout", 
                label: "Payouts",
                count: payoutsCount,
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )
              },
            ];
          })().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`group relative flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                filter === tab.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-green-300"
              }`}
            >
              <span className={`transition-transform ${filter === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                <span className={`flex h-5 sm:h-6 min-w-[20px] sm:min-w-[24px] items-center justify-center rounded-full px-1.5 sm:px-2 text-[10px] sm:text-xs font-bold ${
                  filter === tab.id
                    ? "bg-white/20 text-white"
                    : theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </div>
              {filter === tab.id && (
                <div className="hidden sm:block absolute -bottom-1 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white"></div>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            className={`hidden md:flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            className={`hidden md:flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="hidden sm:inline">Sort</span>
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={filteredTransactions.length === 0}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
              filteredTransactions.length === 0
                ? "cursor-not-allowed opacity-50"
                : theme === "dark"
                ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/30"
                : "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30"
            }`}
            title={filteredTransactions.length === 0 ? "No transactions to export" : "Export to Excel"}
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                <th className="w-20 px-4 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      ID
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={`transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-700/50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          #{transaction.id.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(transaction.type)}`}>
                          {getInitials(transaction.description)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {transaction.description}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {transaction.orderId && (
                              <span className="inline-flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Order #{transaction.orderNumber}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {transaction.type} Fee
                            </span>
                            {transaction.time && (
                              <span className="inline-flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {transaction.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${
                        getTransactionCategory(transaction.type) === 'earning'
                          ? "text-green-600"
                          : getTransactionCategory(transaction.type) === 'payout'
                          ? "text-red-600"
                          : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {getTransactionCategory(transaction.type) === 'payout' ? '-' : '+'}{formatCurrencySync(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getAccountBadgeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        transaction.status.toLowerCase() === 'completed'
                          ? "bg-green-100 text-green-700"
                          : transaction.status.toLowerCase() === 'pending'
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 mt-2 border-t ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left order-2 sm:order-1">
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredTransactions.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{transactions.length}</span> transactions
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            <div className="flex items-center gap-1.5">
              <button
                className="flex items-center justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-600 active:scale-95"
              >
                1
              </button>
              <button
                className={`hidden sm:flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                2
              </button>
              <button
                className={`hidden sm:flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                3
              </button>
            </div>

            <button
              className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
