import React, { useState } from "react";
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
  const { theme } = useTheme();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
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
      setSelectedInvoices(new Set(invoices.map(inv => inv.id)));
    }
    setSelectAll(!selectAll);
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-purple-500 text-white', 
      'bg-green-500 text-white',
      'bg-yellow-500 text-white',
      'bg-red-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-teal-500 text-white',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get category/account color
  const getCategoryColor = (orderType: string, shopName?: string) => {
    const categories: Record<string, string> = {
      'Marketing': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'IT Services': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Sales Bonus': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Operations': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'HR / Payroll': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'Consulting': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    };

    if (orderType === 'reel') {
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
    } else if (orderType === 'restaurant') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
    
    // Try to match shop name to category
    const matchedCategory = Object.keys(categories).find(cat => 
      shopName?.toLowerCase().includes(cat.toLowerCase())
    );
    
    return matchedCategory ? categories[matchedCategory] : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        color:
          theme === "dark"
            ? "bg-green-900/30 text-green-400 border-green-500/50"
            : "bg-green-50 text-green-700 border-green-200",
        text: "Paid",
      },
      pending: {
        color:
          theme === "dark"
            ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/50"
            : "bg-yellow-50 text-yellow-700 border-yellow-200",
        text: "Pending",
      },
      overdue: {
        color:
          theme === "dark"
            ? "bg-red-900/30 text-red-400 border-red-500/50"
            : "bg-red-50 text-red-700 border-red-200",
        text: "Overdue",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}
      >
        <div
          className={`mr-2 h-2 w-2 rounded-full ${
            status === "paid"
              ? "bg-green-500"
              : status === "pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
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
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL || "https://plas.rw"
        : window.location.origin;

    if (isMobile) {
      const pdfUrl = `${baseUrl}/api/invoices/${invoice.id}?pdf=true`;
      window.open(pdfUrl, "_blank");
    } else {
      const hash = invoice.order_type === "reel" ? "#reel" : "#regularOrder";
      const invoiceUrl = `${baseUrl}/Plasa/invoices/${invoice.id}${hash}`;
      window.open(invoiceUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p
            className={`mt-4 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading invoices...
          </p>
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
      className={`overflow-hidden rounded-xl border ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800/50"
          : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead
            className={`border-b ${
              theme === "dark" ? "border-gray-700 bg-gray-800/30" : "border-gray-100 bg-gray-50"
            }`}
          >
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600" : ""
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
                Account
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Date
              </th>
              <th
                className={`px-4 py-4 text-left text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Method
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
                className={`${
                  theme === "dark"
                    ? "hover:bg-gray-700/30"
                    : "hover:bg-gray-50"
                } transition-colors cursor-pointer`}
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
                      theme === "dark" ? "bg-gray-700 border-gray-600" : ""
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
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(invoice.customer_name)}`}>
                      {getInitials(invoice.customer_name)}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {invoice.customer_name}
                    </span>
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

                {/* Account/Category Tag */}
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryColor(invoice.order_type, invoice.shop_name)}`}>
                    {invoice.order_type === "regular"
                      ? invoice.shop_name || "Shop"
                      : invoice.order_type === "reel"
                      ? "Reel Order"
                      : "Restaurant"}
                  </span>
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

                {/* Method/Status */}
                <td className="px-4 py-4">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {invoice.status === "paid" ? "Invoice Payment" : "Request Payment"}
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
                      className={`rounded-lg p-2 transition-colors ${
                        theme === "dark"
                          ? "hover:bg-gray-600 text-gray-400 hover:text-gray-200"
                          : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }`}
                      title="View invoice"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(invoice);
                      }}
                      className={`rounded-lg p-2 transition-colors ${
                        theme === "dark"
                          ? "hover:bg-gray-600 text-gray-400 hover:text-gray-200"
                          : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }`}
                      title="Download invoice"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete action - can be customized
                      }}
                      className={`rounded-lg p-2 transition-colors ${
                        theme === "dark"
                          ? "hover:bg-red-900/30 text-gray-400 hover:text-red-400"
                          : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                      }`}
                      title="Delete invoice"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 p-4 lg:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`rounded-xl border ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-white shadow-sm"
            } transition-all duration-200 hover:shadow-md`}
            onClick={() => onViewDetails(invoice.id, invoice.order_type)}
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #{invoice.invoice_number}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <h4
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Customer
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {invoice.customer_name}
                </p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {invoice.customer_email}
                </p>
              </div>

              {/* Order Info */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <h4
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {invoice.order_type === "regular" ? "Shop" : "Order"}
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {invoice.order_type === "regular"
                      ? invoice.shop_name || "Shop"
                      : invoice.reel_title || "Reel Order"}
                  </p>
                </div>
                <div>
                  <h4
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Items
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {invoice.items_count} items
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Total Amount
                </span>
                <span
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {formatCurrencySync(invoice.total_amount)}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadInvoice(invoice);
                }}
                className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <svg
                  className="mr-2 h-4 w-4"
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
                View Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesTable;
