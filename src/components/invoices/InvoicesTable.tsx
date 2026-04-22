import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";
import { Invoice } from "./types";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewDetails: (invoiceId: string, orderType: string) => void;
  loading?: boolean;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  onViewDetails,
  loading = false,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);

  // Toggle individual invoice selection
  const toggleInvoiceSelection = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
    setSelectAll(newSelected.size === invoices.length);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(invoices.map((inv) => inv.id)));
    }
    setSelectAll(!selectAll);
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar color gradient based on name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-fuchsia-600",
      "from-emerald-500 to-teal-600",
      "from-amber-400 to-orange-500",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-cyan-500 to-blue-500",
      "from-teal-400 to-emerald-500",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Get category/account color
  const getCategoryColor = (orderType: string, shopName?: string) => {
    const categories: Record<string, string> = {
      Marketing:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "IT Services":
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      "Sales Bonus":
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Operations:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      "HR / Payroll":
        "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
      Consulting:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    };

    if (orderType === "reel") {
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    } else if (orderType === "restaurant") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }

    // Try to match shop name to category
    const matchedCategory = Object.keys(categories).find((cat) =>
      shopName?.toLowerCase().includes(cat.toLowerCase())
    );

    return matchedCategory
      ? categories[matchedCategory]
      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  const getStatusBadge = (status: string) => {
    // Normalize status: map "completed" to "paid" since completed orders should show as paid
    const normalizedStatus = status === "completed" ? "paid" : status;

    const statusConfig = {
      paid: {
        color:
          theme === "dark"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            : "bg-emerald-50 text-emerald-700 border-emerald-200",
        glow: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
        text: "Paid",
      },
      pending: {
        color:
          theme === "dark"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            : "bg-amber-50 text-amber-700 border-amber-200",
        glow: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
        text: "Pending",
      },
      overdue: {
        color:
          theme === "dark"
            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            : "bg-rose-50 text-rose-700 border-rose-200",
        glow: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
        text: "Overdue",
      },
    };

    const config =
      statusConfig[normalizedStatus as keyof typeof statusConfig] ||
      statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md transition-all ${config.color}`}
      >
        <div className={`mr-2 h-1.5 w-1.5 rounded-full ${config.glow}`} />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Trigger PDF download
    const pdfUrl = `/api/invoices/${invoice.id}?pdf=true`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `invoice-${invoice.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Desktop Skeleton */}
        <div className="hidden lg:block">
          <div className="mb-4 flex items-center px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <div className="w-12"></div>
            <div className="w-24">ID</div>
            <div className="flex-1">To/From</div>
            <div className="w-32">Amount</div>
            <div className="w-24">Date</div>
            <div className="w-24 text-right">Actions</div>
          </div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center rounded-2xl border px-6 py-4 backdrop-blur-md transition-all duration-300 ${
                  theme === "dark"
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-gray-200/50 bg-gray-50/50"
                } animate-pulse`}
              >
                <div className="w-12">
                  <div className="h-4 w-4 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
                <div className="w-24">
                  <div className="h-4 w-16 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-300/50 dark:bg-gray-700/50"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-32 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                    <div className="h-2 w-24 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                  </div>
                </div>
                <div className="w-32">
                  <div className="h-4 w-20 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
                <div className="w-24">
                  <div className="h-4 w-16 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
                <div className="flex w-24 justify-end">
                  <div className="h-8 w-8 rounded-lg bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`rounded-3xl border p-6 backdrop-blur-md transition-all duration-300 ${
                theme === "dark"
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-gray-200/50 bg-gray-50/50"
              } animate-pulse`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                <div className="h-6 w-16 rounded-full bg-gray-300/50 dark:bg-gray-700/50"></div>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gray-300/50 dark:bg-gray-700/50"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                  <div className="h-3 w-24 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="h-4 w-20 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                <div className="h-10 w-24 rounded-xl bg-gray-300/50 dark:bg-gray-700/50"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div
        className={`rounded-2xl border ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800/50"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            No invoices found
          </h3>
          <p
            className={`mt-2 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            You haven't completed any orders yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        theme === "dark"
          ? "border-gray-700/50 bg-gray-900/40 shadow-2xl shadow-black/20"
          : "border-white/40 bg-white/60 shadow-xl shadow-gray-200/50"
      }`}
    >
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead
            className={`border-b ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/30"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "border-gray-600 bg-gray-700" : ""
                  }`}
                />
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ID
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                To/From
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Amount
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Tax Fees
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Earnings
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Date
              </th>
              <th
                className={`px-4 py-4 text-right text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              theme === "dark" ? "divide-gray-700/50" : "divide-gray-100"
            }`}
          >
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={`group cursor-pointer transition-all duration-300 ${
                  theme === "dark"
                    ? "border-b border-gray-700/30 last:border-0 hover:bg-white/[0.03]"
                    : "border-b border-gray-100 last:border-0 hover:bg-gray-50/80"
                }`}
                onClick={() => onViewDetails(invoice.id, invoice.order_type)}
              >
                {/* Checkbox */}
                <td className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.has(invoice.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleInvoiceSelection(invoice.id);
                    }}
                    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${
                      theme === "dark" ? "border-gray-600 bg-gray-700" : ""
                    }`}
                  />
                </td>

                {/* ID */}
                <td className="px-4 py-4">
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {invoice.invoice_number}
                  </span>
                </td>

                {/* To/From with Avatar */}
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-110 ${getAvatarGradient(
                        invoice.customer_name
                      )}`}
                    >
                      {getInitials(invoice.customer_name)}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          theme === "dark" ? "text-gray-100 group-hover:text-emerald-400" : "text-gray-900 group-hover:text-emerald-600"
                        }`}
                      >
                        {invoice.customer_name}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {invoice.customer_email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-4 py-4">
                  <span
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {formatCurrencySync(invoice.total_amount)}
                  </span>
                </td>

                {/* Tax Fees */}
                <td className="px-4 py-4">
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {formatCurrencySync(invoice.tax || 0)}
                  </span>
                </td>

                {/* Earnings */}
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-black tracking-tight ${
                        theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      {formatCurrencySync(
                        (invoice.service_fee || 0) + (invoice.delivery_fee || 0)
                      )}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/50 dark:text-emerald-400/30">
                      Revenue
                    </span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-4">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {formatDate(invoice.created_at)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(invoice.id, invoice.order_type);
                      }}
                      className={`rounded-xl p-2.5 transition-all duration-300 hover:scale-110 active:scale-95 ${
                        theme === "dark"
                          ? "text-gray-400 bg-white/5 hover:bg-white/10 hover:text-emerald-400"
                          : "text-gray-500 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      title="View invoice"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(invoice);
                      }}
                      className={`rounded-xl p-2.5 transition-all duration-300 hover:scale-110 active:scale-95 ${
                        theme === "dark"
                          ? "text-gray-400 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300"
                          : "text-gray-500 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                      title="Download invoice"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Premium Redesign */}
      <div className="grid grid-cols-1 gap-5 px-1 py-4 sm:grid-cols-2 lg:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`group relative overflow-hidden rounded-[2.5rem] border backdrop-blur-xl transition-all duration-300 active:scale-[0.98] ${
              theme === "dark"
                ? "border-white/5 bg-white/[0.03] shadow-2xl shadow-black/40"
                : "border-gray-200/50 bg-white/70 shadow-xl shadow-gray-200/40"
            }`}
            onClick={() => onViewDetails(invoice.id, invoice.order_type)}
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${getAvatarGradient(invoice.customer_name)} opacity-50`} />
            
            <div className="p-6">
              {/* Header: ID and Status */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                    Invoice ID
                  </span>
                  <h3 className={`text-base font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    #{invoice.invoice_number}
                  </h3>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              {/* Customer Info */}
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br text-base font-black text-white shadow-lg ${getAvatarGradient(
                    invoice.customer_name
                  )}`}
                >
                  {getInitials(invoice.customer_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-base font-black tracking-tight ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    {invoice.customer_name}
                  </p>
                  <p className="truncate text-xs font-medium text-gray-500">
                    {invoice.customer_email}
                  </p>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-3xl bg-black/[0.03] p-4 dark:bg-white/[0.03]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Order Origin</p>
                  <p className={`mt-1 truncate text-sm font-bold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    {invoice.order_type === "regular"
                      ? invoice.shop_name || "Official Shop"
                      : invoice.reel_title || "Reel Order"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Creation Date</p>
                  <p className={`mt-1 text-sm font-bold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
              </div>

              {/* Total and CTA */}
              <div className="flex items-center justify-between border-t border-gray-200/30 pt-6 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Total Due</p>
                  <p className={`text-xl font-black tracking-tighter ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {formatCurrencySync(invoice.total_amount)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadInvoice(invoice);
                  }}
                  className={`group/btn relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl transition-all active:scale-90 ${
                    theme === "dark"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                  <svg
                    className="relative h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesTable;
