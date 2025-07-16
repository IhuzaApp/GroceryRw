import React from "react";
import { Button } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { Invoice } from "./types";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewDetails: (invoiceId: string) => void;
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
      paid: { color: "bg-green-100 text-green-800", text: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      overdue: { color: "bg-red-100 text-red-800", text: "Overdue" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
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
      // For reel orders, check delivery_photo_url field
      const proof = invoice.delivery_photo_url;
      return proof !== null && proof !== undefined && proof.trim() !== "";
    } else {
      // For regular orders, check Proof field
      const proof = invoice.Proof;
      return proof !== null && proof !== undefined && proof.trim() !== "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className={`mt-2 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Loading invoices...
          </p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className={`overflow-hidden rounded-lg border ${
        theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <div className="px-6 py-8 text-center">
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              No invoices found
            </h3>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              You haven't completed any orders yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border ${
      theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
    }`}>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className={`${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Invoice #
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Customer
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Shop/Order
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Date
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Total
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Proof
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === "dark" ? "divide-gray-700" : "divide-gray-200"
          }`}>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={`${
                  theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
                } transition-colors cursor-pointer`}
                onClick={() => onViewDetails(invoice.id)}
              >
                <td className="px-6 py-4 text-sm">
                  <span className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    #{invoice.invoice_number}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>
                    <p className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
                      {invoice.customer_name}
                    </p>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {invoice.customer_email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>
                    <p className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
                      {invoice.order_type === "regular" 
                        ? invoice.shop_name || "Shop"
                        : invoice.reel_title || "Reel Order"
                      }
                    </p>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {invoice.items_count} items
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {formatDate(invoice.created_at)}
                </td>
                <td className="px-6 py-4 text-sm">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span className="font-semibold text-green-600">
                    {formatCurrencySync(invoice.total_amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  {hasProof(invoice) ? (
                    <span className="text-green-600 font-medium">✓</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex justify-center space-x-1">
                    <Button
                      size="xs"
                      appearance="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadProof(invoice);
                      }}
                      disabled={hasProof(invoice)}
                    >
                      {hasProof(invoice) ? "✓" : "Upload"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            } last:border-b-0`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => onViewDetails(invoice.id)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    #{invoice.invoice_number}
                  </h3>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-green-600">
                    {formatCurrencySync(invoice.total_amount)}
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <p className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>
                  {invoice.customer_name}
                </p>
                <p className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  {invoice.customer_email}
                </p>
              </div>

              {/* Shop/Order Info */}
              <div className="mb-3">
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>
                  {invoice.order_type === "regular" 
                    ? invoice.shop_name || "Shop"
                    : invoice.reel_title || "Reel Order"
                  }
                </p>
                <p className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  {invoice.items_count} items
                </p>
              </div>

              {/* Proof Status and Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Proof:
                  </span>
                  {hasProof(invoice) ? (
                    <span className="text-green-600 font-medium text-sm">✓ Uploaded</span>
                  ) : (
                    <span className="text-red-600 font-medium text-sm">✗ Pending</span>
                  )}
                </div>
                <Button
                  size="xs"
                  appearance="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadProof(invoice);
                  }}
                  disabled={hasProof(invoice)}
                >
                  {hasProof(invoice) ? "✓" : "Upload"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesTable; 