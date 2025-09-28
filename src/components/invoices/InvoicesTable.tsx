import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Invoice } from "./types";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewDetails: (invoiceId: string, orderType: string) => void;
  onUploadProof: (invoice: Invoice) => void;
  loading?: boolean;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  onViewDetails,
  onUploadProof,
  loading = false,
}) => {
  const { theme } = useTheme();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { 
        color: theme === "dark" ? "bg-green-900/30 text-green-400 border-green-500/50" : "bg-green-50 text-green-700 border-green-200",
        text: "Paid" 
      },
      pending: { 
        color: theme === "dark" ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/50" : "bg-yellow-50 text-yellow-700 border-yellow-200",
        text: "Pending" 
      },
      overdue: { 
        color: theme === "dark" ? "bg-red-900/30 text-red-400 border-red-500/50" : "bg-red-50 text-red-700 border-red-200",
        text: "Overdue" 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${config.color}`}
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${
          status === 'paid' ? 'bg-green-500' : 
          status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
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

  const hasProof = (invoice: Invoice): boolean => {
    if (invoice.order_type === "reel") {
      const proof = invoice.delivery_photo_url;
      return proof !== null && proof !== undefined && proof.trim() !== "";
    } else {
      const proof = invoice.Proof;
      return proof !== null && proof !== undefined && proof.trim() !== "";
    }
  };

  const downloadInvoice = (invoice: Invoice) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = process.env.NODE_ENV === "production" 
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
          <p className={`mt-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Loading invoices...
          </p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className={`rounded-2xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white shadow-sm"}`}>
        <div className="px-8 py-16 text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            No invoices found
          </h3>
          <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            You haven't completed any orders yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white shadow-sm"}`}>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead className={`${theme === "dark" ? "bg-gray-700/50" : "bg-gray-50/80"}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Invoice #
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Customer
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Shop/Order
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Date
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Status
              </th>
              <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Total
              </th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Proof
              </th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700/50" : "divide-gray-200"}`}>
            {invoices.map((invoice, index) => (
              <tr
                key={invoice.id}
                className={`${
                  theme === "dark"
                    ? "bg-gray-800/30 hover:bg-gray-700/50"
                    : "bg-white hover:bg-gray-50/80"
                } transition-all duration-200 hover:shadow-sm`}
                onClick={() => onViewDetails(invoice.id, invoice.order_type)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      #{invoice.invoice_number}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                      {invoice.customer_name}
                    </p>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {invoice.customer_email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                      {invoice.order_type === "regular" ? invoice.shop_name || "Shop" : invoice.reel_title || "Reel Order"}
                    </p>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {invoice.items_count} items
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {formatDate(invoice.created_at)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                    {formatCurrencySync(invoice.total_amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {hasProof(invoice) ? (
                    <div className="flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(invoice);
                      }}
                      className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadProof(invoice);
                      }}
                      disabled={hasProof(invoice)}
                      className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        hasProof(invoice)
                          ? "cursor-not-allowed bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : theme === "dark"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {hasProof(invoice) ? (
                        <>
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Done
                        </>
                      ) : (
                        <>
                          <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`rounded-xl border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white shadow-sm"} transition-all duration-200 hover:shadow-md`}
            onClick={() => onViewDetails(invoice.id, invoice.order_type)}
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    #{invoice.invoice_number}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <h4 className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Customer
                </h4>
                <p className={`text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  {invoice.customer_name}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {invoice.customer_email}
                </p>
              </div>

              {/* Order Info */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {invoice.order_type === "regular" ? "Shop" : "Order"}
                  </h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    {invoice.order_type === "regular" ? invoice.shop_name || "Shop" : invoice.reel_title || "Reel Order"}
                  </p>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Items
                  </h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    {invoice.items_count} items
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Total Amount
                </span>
                <span className={`text-lg font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                  {formatCurrencySync(invoice.total_amount)}
                </span>
              </div>

              {/* Proof Status */}
              <div className="mb-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Proof Status
                </span>
                {hasProof(invoice) ? (
                  <div className="flex items-center">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mr-2">
                      <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mr-2">
                      <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Pending
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadInvoice(invoice);
                  }}
                  className={`flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Invoice
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadProof(invoice);
                  }}
                  disabled={hasProof(invoice)}
                  className={`flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    hasProof(invoice)
                      ? "cursor-not-allowed bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : theme === "dark"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {hasProof(invoice) ? (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Done
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Upload Proof
                    </>
                  )}
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
