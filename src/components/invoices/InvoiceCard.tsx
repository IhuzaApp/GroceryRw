import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { Invoice } from "./types";

interface InvoiceCardProps {
  invoice: Invoice;
  onUploadProof: (invoice: Invoice) => void;
  onViewDetails: (invoiceId: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onUploadProof,
  onViewDetails,
}) => {
  const { theme } = useTheme();

  const getStatusBadge = (status: string) => {
    // Normalize status: map "completed" to "paid" since completed orders should show as paid
    const normalizedStatus = status === "completed" ? "paid" : status;

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
      statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}
      >
        <div
          className={`mr-2 h-2 w-2 rounded-full ${
            normalizedStatus === "paid"
              ? "bg-green-500"
              : normalizedStatus === "pending"
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

  const hasProof = (invoice: Invoice): boolean => {
    if (invoice.order_type === "reel") {
      const proof = invoice.delivery_photo_url;
      return proof !== null && proof !== undefined && proof.trim() !== "";
    } else {
      const proof = invoice.Proof;
      return proof !== null && proof !== undefined && proof.trim() !== "";
    }
  };

  return (
    <div
      className={`mb-6 rounded-2xl border ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800/50"
          : "border-gray-200 bg-white shadow-sm"
      } transition-all duration-200 hover:shadow-md`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Invoice #{invoice.invoice_number}
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {formatDate(invoice.created_at)} •{" "}
              {invoice.order_type === "reel" ? "Reel Order" : "Regular Order"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(invoice.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Customer & Order Info */}
          <div className="space-y-4">
            <div>
              <h4
                className={`text-sm font-semibold uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Customer
              </h4>
              <div className="mt-2">
                <p
                  className={`text-sm font-medium ${
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
            </div>

            {invoice.shop_name && (
              <div>
                <h4
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Shop
                </h4>
                <p
                  className={`mt-2 text-sm ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {invoice.shop_name}
                </p>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div>
              <h4
                className={`text-sm font-semibold uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Order Details
              </h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Items:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {invoice.items_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Order Type:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {invoice.order_type === "reel" ? "Reel" : "Regular"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4
                className={`text-sm font-semibold uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Total Amount
              </h4>
              <p
                className={`mt-2 text-2xl font-bold ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              >
                {formatCurrencySync(invoice.total_amount)}
              </p>
            </div>
          </div>

          {/* Proof Status */}
          <div className="space-y-4">
            <div>
              <h4
                className={`text-sm font-semibold uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Proof Status
              </h4>
              <div className="mt-3">
                {hasProof(invoice) ? (
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        Proof Uploaded
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Delivery confirmed
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <svg
                        className="h-4 w-4 text-red-600 dark:text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Proof Required
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Upload delivery photo
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <button
            onClick={() => onViewDetails(invoice.id)}
            className={`inline-flex flex-1 items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Details
          </button>
          <button
            onClick={() => onUploadProof(invoice)}
            disabled={hasProof(invoice)}
            className={`inline-flex flex-1 items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              hasProof(invoice)
                ? "cursor-not-allowed bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : theme === "dark"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {hasProof(invoice) ? (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Proof Uploaded
              </>
            ) : (
              <>
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Upload Proof
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
