"use client";

import {
  X,
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
} from "lucide-react";
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
      const blob = new Blob([byteArray], {
        type: mimeType.split(":")[1].split(";")[0],
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quote-attachment-${index + 1}.${
        blob.type.includes("pdf") ? "pdf" : "jpg"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:bg-black/60 sm:p-4">
      <div className="flex h-full max-h-screen w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-gray-900 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:rounded-3xl sm:border sm:border-gray-200 dark:sm:border-gray-700">
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6 md:p-8">
          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-0">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-2 sm:mb-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md sm:h-12 sm:w-12 sm:rounded-2xl">
                    <FileText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-bold leading-tight text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
                      Submitted Quote Details
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                  <FileText className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                    RFQ: {rfqTitle}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-xl bg-gray-100 p-2.5 text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 sm:bg-white dark:sm:bg-gray-900">
          <div className="space-y-4 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8">
            {/* Status Badge */}
            <div className="mb-4 sm:mb-6">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold sm:px-4 sm:py-2 ${
                  quote.status === "accepted"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : quote.status === "rejected"
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Status:{" "}
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Quote Amount */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 dark:from-green-900/20 dark:to-emerald-900/20 sm:px-6 sm:py-5">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Quote Amount
                  </h3>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 sm:text-3xl">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: quote.currency || "RWF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(parseFloat(quote.qouteAmount))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-xl">
                  <div className="p-4 sm:p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Delivery Time
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                      {quote.delivery_time || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-xl">
                  <div className="p-4 sm:p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Quote Validity
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                      {quote.quote_validity || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {quote.message && quote.message.trim() !== "" && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 dark:from-purple-900/20 dark:to-pink-900/20 sm:px-6 sm:py-5">
                    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Message
                    </h3>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {quote.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4 dark:from-blue-900/20 dark:to-cyan-900/20 sm:px-6 sm:py-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Terms & Conditions
                  </h3>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    {quote.PaymentTerms && quote.PaymentTerms.trim() !== "" && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Payment Terms
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quote.PaymentTerms}
                        </p>
                      </div>
                    )}

                    {quote.DeliveryTerms && quote.DeliveryTerms.trim() !== "" && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Delivery Terms
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quote.DeliveryTerms}
                        </p>
                      </div>
                    )}

                    {quote.warrantly && quote.warrantly.trim() !== "" && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Warranty
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quote.warrantly}
                        </p>
                      </div>
                    )}

                    {quote.cancellatioinTerms &&
                      quote.cancellatioinTerms.trim() !== "" && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                          <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Cancellation Terms
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {quote.cancellatioinTerms}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 dark:from-amber-900/20 dark:to-orange-900/20 sm:px-6 sm:py-5">
                    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                      <FileText className="h-5 w-5 text-amber-600" />
                      Attachments ({attachments.length})
                    </h3>
                  </div>
                  <div className="space-y-2.5 p-5 sm:p-6">
                    {attachments.map((attachment, index) => (
                      <button
                        key={index}
                        onClick={() => downloadAttachment(attachment, index)}
                        className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-green-300 hover:bg-green-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-700 dark:hover:bg-green-900/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Attachment {index + 1}
                          </span>
                        </div>
                        <Download className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-5">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">
                    Submitted: {formatDate(quote.created_at)}
                  </p>
                  {quote.updated_at !== quote.created_at && (
                    <p className="mt-2">
                      Last updated: {formatDate(quote.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:p-8">
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                Submitted on{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(quote.created_at)}
                </span>
              </span>
            </div>
            <div className="hidden h-6 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" />
              <span>
                Quote ID:{" "}
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {quote.id?.slice(0, 8) || "N/A"}
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:from-gray-300 hover:to-gray-400 active:scale-95 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 sm:w-auto sm:px-6 sm:py-3"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
