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
  const isDark = theme === "dark";
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
    const names = (name || "").split(" ").filter(Boolean);
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return (name || "IN").substring(0, 2).toUpperCase();
  };

  // Get avatar color gradient based on name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-indigo-600 shadow-blue-500/20",
      "from-purple-500 to-fuchsia-600 shadow-purple-500/20",
      "from-emerald-500 to-teal-600 shadow-emerald-500/20",
      "from-amber-400 to-orange-500 shadow-amber-500/20",
      "from-pink-500 to-rose-600 shadow-rose-500/20",
      "from-indigo-500 to-blue-600 shadow-indigo-500/20",
      "from-cyan-500 to-blue-500 shadow-cyan-500/20",
      "from-teal-400 to-emerald-500 shadow-emerald-500/20",
    ];
    const index = (name || "").charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status === "completed" ? "paid" : status;

    const statusConfig = {
      paid: {
        color: isDark
          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200",
        glow: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
        text: "Paid",
      },
      pending: {
        color: isDark
          ? "bg-amber-500/10 text-amber-400 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          : "bg-amber-50 text-amber-700 ring-amber-200",
        glow: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
        text: "Pending",
      },
      overdue: {
        color: isDark
          ? "bg-rose-500/10 text-rose-400 ring-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
          : "bg-rose-50 text-rose-700 ring-rose-200",
        glow: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
        text: "Overdue",
      },
    };

    const config =
      statusConfig[normalizedStatus as keyof typeof statusConfig] ||
      statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 backdrop-blur-md transition-all ${config.color}`}
      >
        <div
          className={`mr-2 h-1.5 w-1.5 animate-pulse rounded-full ${config.glow}`}
        />
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
      <div className="space-y-6">
        {/* Premium Desktop Skeleton */}
        <div className="hidden duration-1000 animate-in fade-in lg:block">
          <div className="mb-4 flex items-center px-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
            <div className="w-12"></div>
            <div className="w-28">ID</div>
            <div className="flex-1">Recipient</div>
            <div className="w-32">Total</div>
            <div className="w-32">Earnings</div>
            <div className="w-32 text-right">Actions</div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center rounded-[2.5rem] border px-10 py-6 backdrop-blur-2xl transition-all duration-300 ${
                  isDark
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-gray-100 bg-white"
                } animate-pulse shadow-xl shadow-black/5`}
              >
                <div className="w-12">
                  <div className="h-5 w-5 rounded-lg bg-gray-500/10"></div>
                </div>
                <div className="w-28">
                  <div className="h-4 w-20 rounded bg-gray-500/10"></div>
                </div>
                <div className="flex flex-1 items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gray-500/10"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-gray-500/10"></div>
                    <div className="h-3 w-32 rounded bg-gray-500/10"></div>
                  </div>
                </div>
                <div className="w-32">
                  <div className="h-6 w-24 rounded bg-gray-500/10"></div>
                </div>
                <div className="w-32">
                  <div className="h-6 w-24 rounded bg-gray-500/10"></div>
                </div>
                <div className="flex w-32 justify-end">
                  <div className="h-12 w-12 rounded-2xl bg-gray-500/10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Mobile Skeleton */}
        <div className="grid grid-cols-1 gap-6 duration-1000 animate-in fade-in lg:hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`rounded-[3rem] border p-8 backdrop-blur-2xl transition-all duration-300 ${
                isDark
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-gray-100 bg-white shadow-xl shadow-gray-200/50"
              } animate-pulse`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-gray-500/10"></div>
                  <div className="h-5 w-24 rounded bg-gray-500/10"></div>
                </div>
                <div className="h-7 w-20 rounded-full bg-gray-500/10"></div>
              </div>
              <div className="mb-8 flex items-center gap-4">
                <div className="h-16 w-16 rounded-[1.5rem] bg-gray-500/10"></div>
                <div className="space-y-2">
                  <div className="h-5 w-40 rounded bg-gray-500/10"></div>
                  <div className="h-4 w-32 rounded bg-gray-500/10"></div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-500/10 pt-6">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-gray-500/10"></div>
                  <div className="h-6 w-28 rounded bg-gray-500/10"></div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gray-500/10"></div>
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
        className={`rounded-[3rem] border-2 border-dashed py-32 text-center transition-colors duration-1000 animate-in fade-in ${
          isDark
            ? "border-white/5 bg-white/[0.01]"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        <div
          className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] ${
            isDark ? "bg-white/5" : "bg-white shadow-xl"
          }`}
        >
          <svg
            className="h-12 w-12 text-gray-400 opacity-20"
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
          className={`text-xl font-black uppercase tracking-[0.2em] opacity-20 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Zero Invoices Tracked
        </h3>
        <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-10">
          You haven't completed any orders yet
        </p>
      </div>
    );
  }

  return (
    <div className="duration-1000 animate-in fade-in">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="mb-4 flex items-center px-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
          <div className="w-12">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className={`h-5 w-5 rounded-lg border-2 ring-emerald-500/20 transition-all focus:ring-4 ${
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-white"
              }`}
            />
          </div>
          <div className="w-28">ID</div>
          <div className="flex-1">Recipient</div>
          <div className="w-32">Total</div>
          <div className="w-32">Earnings</div>
          <div className="w-32 text-right">Actions</div>
        </div>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => onViewDetails(invoice.id, invoice.order_type)}
              className={`group relative flex cursor-pointer items-center rounded-[2.5rem] border px-10 py-6 backdrop-blur-2xl transition-all duration-500 hover:shadow-2xl ${
                isDark
                  ? "border-white/5 bg-gray-900/40 shadow-xl shadow-black/20 hover:bg-gray-800/60"
                  : "border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:border-emerald-200"
              }`}
            >
              <div className="w-12">
                <input
                  type="checkbox"
                  checked={selectedInvoices.has(invoice.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleInvoiceSelection(invoice.id);
                  }}
                  className={`h-5 w-5 rounded-lg border-2 ring-emerald-500/20 transition-all focus:ring-4 ${
                    isDark
                      ? "border-white/10 bg-white/5"
                      : "border-gray-200 bg-white"
                  }`}
                />
              </div>

              <div className="w-28">
                <span
                  className={`text-sm font-black tracking-tighter ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  #{invoice.invoice_number}
                </span>
              </div>

              <div className="flex flex-1 items-center gap-6">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-black text-white shadow-lg transition-transform group-hover:rotate-6 ${getAvatarGradient(
                    invoice.customer_name
                  )}`}
                >
                  {getInitials(invoice.customer_name)}
                </div>
                <div className="min-w-0">
                  <h4
                    className={`truncate text-lg font-black tracking-tight ${
                      isDark
                        ? "text-white group-hover:text-emerald-400"
                        : "text-gray-900 group-hover:text-emerald-600"
                    } transition-colors`}
                  >
                    {invoice.customer_name}
                  </h4>
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${
                      isDark ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {invoice.customer_email}
                  </p>
                </div>
              </div>

              <div className="w-32">
                <span
                  className={`text-xl font-black tabular-nums tracking-tighter ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatCurrencySync(invoice.total_amount)}
                </span>
              </div>

              <div className="w-32">
                <div className="flex flex-col">
                  <span className="text-xl font-black tabular-nums tracking-tighter text-emerald-500">
                    {formatCurrencySync(
                      (invoice.service_fee || 0) + (invoice.delivery_fee || 0)
                    )}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/40">
                    Revenue
                  </span>
                </div>
              </div>

              <div className="flex w-32 items-center justify-end gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadInvoice(invoice);
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isDark
                      ? "bg-white/5 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400"
                      : "bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </div>

              {/* Status Indicator Glow */}
              <div
                className={`absolute left-0 top-0 h-full w-1.5 transition-all duration-500 group-hover:w-2 ${
                  invoice.status === "completed" || invoice.status === "paid"
                    ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    : "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View - Premium Card Overhaul */}
      <div className="grid grid-cols-1 gap-6 px-1 lg:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => onViewDetails(invoice.id, invoice.order_type)}
            className={`group relative overflow-hidden rounded-[3rem] p-8 transition-all duration-500 active:scale-[0.98] ${
              isDark
                ? "border border-white/5 bg-gray-900/40 shadow-2xl shadow-black/40"
                : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
            }`}
          >
            {/* Background Decorative Flow */}
            <div
              className={`absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10 blur-[80px] transition-all duration-700 group-hover:scale-110 ${
                isDark ? "bg-emerald-500/20" : "bg-emerald-500/10"
              }`}
            />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                      isDark ? "text-white/30" : "text-gray-400"
                    }`}
                  >
                    Invoice ID
                  </p>
                  <h3
                    className={`text-xl font-black tracking-tighter ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #{invoice.invoice_number}
                  </h3>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="mb-10 flex items-center gap-5">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-xl font-black text-white shadow-2xl ${getAvatarGradient(
                    invoice.customer_name
                  )}`}
                >
                  {getInitials(invoice.customer_name)}
                </div>
                <div className="min-w-0">
                  <h4
                    className={`truncate text-2xl font-black tracking-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {invoice.customer_name}
                  </h4>
                  <p
                    className={`truncate text-xs font-bold opacity-40 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {invoice.customer_email}
                  </p>
                </div>
              </div>

              <div
                className={`mb-10 grid grid-cols-2 gap-6 rounded-[2rem] p-6 ${
                  isDark ? "bg-white/[0.03]" : "bg-gray-50"
                } ring-1 ring-white/5`}
              >
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                    Channel
                  </p>
                  <p
                    className={`mt-1 truncate text-xs font-black ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {invoice.order_type === "regular"
                      ? invoice.shop_name || "Official Hub"
                      : "Reel Protocol"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                    Timeline
                  </p>
                  <p
                    className={`mt-1 text-xs font-black tabular-nums ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-8 dark:border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                    Quantum Value
                  </p>
                  <p
                    className={`text-3xl font-black tracking-tighter ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatCurrencySync(invoice.total_amount)}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadInvoice(invoice);
                  }}
                  className={`group/btn relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] shadow-2xl transition-all active:scale-90 ${
                    isDark
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-emerald-600 text-white shadow-emerald-600/20"
                  }`}
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />
                  <svg
                    className="relative h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
