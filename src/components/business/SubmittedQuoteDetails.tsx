"use client";

import { X, FileText, Download, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface SubmittedQuoteDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  quote: {
    id: string;
    qouteAmount: string;
    currency: string;
    delivery_time: string;
    quote_validity: string;
    message: string;
    PaymentTerms: string;
    DeliveryTerms: string;
    warrantly: string;
    cancellatioinTerms: string;
    attachement: string;
    attachment_1: string;
    attachment_2: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  rfqTitle: string;
}

export function SubmittedQuoteDetails({
  isOpen,
  onClose,
  quote,
  rfqTitle,
}: SubmittedQuoteDetailsProps) {
  if (!isOpen) return null;

  const attachments = [
    quote.attachement,
    quote.attachment_1,
    quote.attachment_2,
  ].filter((att) => att && att.trim() !== "");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadAttachment = (base64String: string, index: number) => {
    try {
      const [mimeType, base64Data] = base64String.split(",");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType.split(":")[1].split(";")[0] });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quote-attachment-${index + 1}.${blob.type.includes("pdf") ? "pdf" : "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Submitted Quote Details
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                RFQ: {rfqTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                quote.status === "accepted"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : quote.status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Status: {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
          </div>

          <div className="space-y-6">
            {/* Quote Amount */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                Quote Amount
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: quote.currency || "RWF",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(parseFloat(quote.qouteAmount))}
              </p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Delivery Time
                </div>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {quote.delivery_time || "Not specified"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Quote Validity
                </div>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {quote.quote_validity || "Not specified"}
                </p>
              </div>
            </div>

            {/* Message */}
            {quote.message && quote.message.trim() !== "" && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {quote.message}
                </p>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Terms & Conditions
              </h4>

              {quote.PaymentTerms && quote.PaymentTerms.trim() !== "" && (
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Terms
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {quote.PaymentTerms}
                  </p>
                </div>
              )}

              {quote.DeliveryTerms && quote.DeliveryTerms.trim() !== "" && (
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Delivery Terms
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {quote.DeliveryTerms}
                  </p>
                </div>
              )}

              {quote.warrantly && quote.warrantly.trim() !== "" && (
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Warranty
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {quote.warrantly}
                  </p>
                </div>
              )}

              {quote.cancellatioinTerms && quote.cancellatioinTerms.trim() !== "" && (
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cancellation Terms
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {quote.cancellatioinTerms}
                  </p>
                </div>
              )}
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5" />
                  Attachments ({attachments.length})
                </h4>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <button
                      key={index}
                      onClick={() => downloadAttachment(attachment, index)}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Attachment {index + 1}
                        </span>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Submitted: {formatDate(quote.created_at)}</p>
                {quote.updated_at !== quote.created_at && (
                  <p className="mt-1">Last updated: {formatDate(quote.updated_at)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

