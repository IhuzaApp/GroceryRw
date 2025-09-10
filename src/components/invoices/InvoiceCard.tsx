import React from "react";
import { Panel, Button } from "rsuite";
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
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", text: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      overdue: { color: "bg-red-100 text-red-800", text: "Overdue" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
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

  return (
    <Panel
      className={`mb-4 ${
        theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white"
      }`}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Invoice #{invoice.invoice_number}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(invoice.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(invoice.status)}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {invoice.order_type === "reel" ? "Reel Order" : "Regular Order"}
            </span>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div>
            <span
              className={`font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Customer:
            </span>
            <p className="text-sm">{invoice.customer_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {invoice.customer_email}
            </p>
          </div>
          {invoice.shop_name && (
            <div>
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Shop:
              </span>
              <p className="text-sm">{invoice.shop_name}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <span
              className={`font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Items:
            </span>
            <p className="text-sm">{invoice.items_count} items</p>
          </div>
          <div>
            <span
              className={`font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Total Amount:
            </span>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrencySync(invoice.total_amount)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {invoice.Proof ? (
            <div className="col-span-2">
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Proof Status:
              </span>
              <span className="ml-2 font-medium text-green-600">
                ✓ Proof Uploaded
              </span>
            </div>
          ) : (
            <div className="col-span-2">
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Proof Status:
              </span>
              <span className="ml-2 font-medium text-red-600">
                ✗ Proof Required
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Button
          size="sm"
          appearance="primary"
          onClick={() => onUploadProof(invoice)}
          disabled={!!invoice.Proof}
        >
          {invoice.Proof ? "Proof Uploaded" : "Upload Proof"}
        </Button>
        <Button
          size="sm"
          appearance="ghost"
          onClick={() => onViewDetails(invoice.id)}
        >
          View Details
        </Button>
      </div>
    </Panel>
  );
};

export default InvoiceCard;
