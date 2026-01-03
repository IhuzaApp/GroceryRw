"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  DollarSign,
  FileText,
  Download,
  MessageSquare,
  Truck,
  Calendar,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import { formatCurrencySync } from "../../src/utils/formatCurrency";

const formatDate = (dateString: string) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface QuoteDetailsModalProps {
  quote: any;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (quoteId: string) => void;
  onReject: (quoteId: string) => void;
  onMessage: (supplierId: string) => void;
}

export default function QuoteDetailsModal({
  quote,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onMessage,
}: QuoteDetailsModalProps) {
  if (!isOpen || !quote) return null;

  const [activeTab, setActiveTab] = useState("overview");

  const handleMessage = () => {
    if (quote.rfqRequester?.email || quote.rfqEmail) {
      onMessage(quote.rfqRequester?.email || quote.rfqEmail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:bg-black/60 sm:p-4">
      <div className="flex h-full max-h-screen w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-gray-900 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-6xl sm:rounded-3xl sm:border sm:border-gray-200 dark:sm:border-gray-700">
        {/* Header - Enhanced design */}
        <div className="relative flex-shrink-0 border-b border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6 md:p-8">
          <div className="relative z-10">
            {/* Top row with title and close button */}
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-0">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-2 sm:mb-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md sm:h-12 sm:w-12 sm:rounded-2xl">
                    <FileText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-bold leading-tight text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
                      {quote.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                  <Building className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                    {quote.rfqRequester?.name || "Unknown Business"}
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
            {/* Message button */}
            <button
              onClick={handleMessage}
              className="mt-4 w-full rounded-xl border-2 border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg active:scale-95 dark:border-gray-700 sm:mt-0 sm:w-auto"
              style={{ color: "#ffffff" }}
            >
              <MessageSquare
                className="mr-2 inline h-4 w-4 !text-white"
                style={{ color: "#ffffff" }}
              />
              <span className="!text-white" style={{ color: "#ffffff" }}>
                Message Supplier
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 sm:bg-white dark:sm:bg-gray-900">
          <div className="space-y-4 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8">
            {/* Tabs - Enhanced design */}
            <div className="sticky top-0 z-10 -mx-0 bg-white px-4 pb-3 pt-0 shadow-sm dark:bg-gray-900 sm:static sm:mx-0 sm:rounded-2xl sm:border sm:border-gray-200 sm:bg-white sm:p-3 sm:shadow-md dark:sm:border-gray-700 dark:sm:bg-gray-800">
              <div className="scrollbar-hide flex space-x-2 overflow-x-auto pb-2 sm:space-x-2.5">
                {[
                  {
                    id: "overview",
                    label: "Overview",
                    icon: FileText,
                    shortLabel: "Overview",
                  },
                  {
                    id: "rfq",
                    label: "RFQ Details",
                    icon: FileText,
                    shortLabel: "RFQ",
                  },
                  {
                    id: "requester",
                    label: "RFQ Requester",
                    icon: Building,
                    shortLabel: "Requester",
                  },
                  {
                    id: "quote",
                    label: "My Quote",
                    icon: DollarSign,
                    shortLabel: "Quote",
                  },
                  {
                    id: "terms",
                    label: "Terms & Conditions",
                    icon: FileText,
                    shortLabel: "Terms",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                    style={
                      activeTab === tab.id ? { color: "#ffffff" } : undefined
                    }
                  >
                    <tab.icon
                      className={`h-4 w-4 transition-transform duration-200 sm:h-4 sm:w-4 ${
                        activeTab === tab.id
                          ? "scale-110"
                          : "group-hover:scale-110"
                      }`}
                      style={
                        activeTab === tab.id ? { color: "#ffffff" } : undefined
                      }
                    />
                    <span
                      className="hidden whitespace-nowrap sm:inline"
                      style={
                        activeTab === tab.id ? { color: "#ffffff" } : undefined
                      }
                    >
                      {tab.label}
                    </span>
                    <span
                      className="whitespace-nowrap sm:hidden"
                      style={
                        activeTab === tab.id ? { color: "#ffffff" } : undefined
                      }
                    >
                      {tab.shortLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  {/* Quote Summary - Enhanced mobile design */}
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 dark:from-green-900/20 dark:to-emerald-900/20 sm:px-6 sm:py-5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Quote Summary
                      </h3>
                    </div>
                    <div className="space-y-4 p-5 sm:space-y-4 sm:p-6">
                      <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Total Price
                          </span>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {quote.totalPrice}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <span className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <Truck className="h-4 w-4 text-green-600" />
                            Delivery Time
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {quote.deliveryTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <span className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            Valid Until
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {quote.validUntil}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Currency
                          </span>
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                            {quote.currency || "RWF"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Status
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              quote.status === "accepted"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : quote.status === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {quote.status?.charAt(0).toUpperCase() +
                              quote.status?.slice(1) || "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Submitted
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {quote.submittedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RFQ Requester Quick Info - Enhanced mobile design */}
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4 dark:from-blue-900/20 dark:to-cyan-900/20 sm:px-6 sm:py-5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                        <Building className="h-5 w-5 text-blue-600" />
                        RFQ Requester
                      </h3>
                    </div>
                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                          <Building className="h-7 w-7 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-bold text-gray-900 dark:text-white">
                            {quote.rfqRequester?.name || "Unknown Business"}
                          </h4>
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {quote.rfqRequester?.location || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                            {quote.rfqRequester?.email || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                            {quote.rfqRequester?.phone || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Message - Enhanced mobile design */}
                {quote.quoteMessage && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 dark:from-purple-900/20 dark:to-pink-900/20 sm:px-6 sm:py-5">
                      <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        Quote Message
                      </h3>
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {quote.quoteMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Attachments - Enhanced mobile design */}
                {quote.attachments && quote.attachments.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 dark:from-amber-900/20 dark:to-orange-900/20 sm:px-6 sm:py-5">
                      <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                        <FileText className="h-5 w-5 text-amber-600" />
                        Attachments ({quote.attachments.length})
                      </h3>
                    </div>
                    <div className="space-y-2.5 p-5 sm:p-6">
                      {quote.attachments.map(
                        (attachment: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => {
                              try {
                                const [mimeType, base64Data] =
                                  attachment.split(",");
                                const byteCharacters = atob(base64Data);
                                const byteNumbers = new Array(
                                  byteCharacters.length
                                );
                                for (
                                  let i = 0;
                                  i < byteCharacters.length;
                                  i++
                                ) {
                                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], {
                                  type: mimeType.split(":")[1].split(";")[0],
                                });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `quote-attachment-${
                                  index + 1
                                }.${blob.type.includes("pdf") ? "pdf" : "jpg"}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error(
                                  "Error downloading attachment:",
                                  error
                                );
                              }
                            }}
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
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "rfq" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
                  <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-xl">
                    RFQ Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Title:
                          </span>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {quote.title}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Description:
                          </span>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                            {quote.description || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Category:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.category || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Location:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.location || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Budget Range:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.minBudget && quote.maxBudget
                              ? `${formatCurrencySync(
                                  parseFloat(quote.minBudget)
                                )} - ${formatCurrencySync(
                                  parseFloat(quote.maxBudget)
                                )}`
                              : quote.minBudget
                              ? `Min: ${formatCurrencySync(
                                  parseFloat(quote.minBudget)
                                )}`
                              : quote.maxBudget
                              ? `Max: ${formatCurrencySync(
                                  parseFloat(quote.maxBudget)
                                )}`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Response Deadline:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.responseDate
                              ? formatDate(quote.responseDate)
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Expected Delivery:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.expectedDeliveryDate
                              ? formatDate(quote.expectedDeliveryDate)
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Urgency Level:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.urgencyLevel || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Estimated Quantity:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.estimatedQuantity || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {quote.notes && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Additional Notes:
                        </span>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                          {quote.notes}
                        </p>
                      </div>
                    )}
                    {quote.requirements && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Requirements:
                        </span>
                        <div className="mt-2 text-sm text-gray-900 dark:text-white">
                          {typeof quote.requirements === "string" ? (
                            <p className="whitespace-pre-wrap">
                              {quote.requirements}
                            </p>
                          ) : Array.isArray(quote.requirements) ? (
                            <ul className="list-inside list-disc space-y-1">
                              {quote.requirements.map(
                                (req: any, idx: number) => (
                                  <li key={idx}>
                                    {typeof req === "string"
                                      ? req
                                      : JSON.stringify(req)}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p>{JSON.stringify(quote.requirements)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requester" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
                  <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-xl">
                    RFQ Requester Company Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Company Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Business Name:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.name || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Account Type:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.accountType ||
                                "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Status:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.status || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Email:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.email ||
                                quote.rfqEmail ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Phone:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.phone ||
                                quote.rfqPhone ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Location:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.location ||
                                quote.location ||
                                "Not provided"}
                            </p>
                          </div>
                          {quote.rfqContactName && (
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Contact Person:
                              </span>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                {quote.rfqContactName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quote" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
                  <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-xl">
                    My Quote Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Quote Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Quote Amount:
                            </span>
                            <p className="mt-1 text-lg font-bold text-green-600">
                              {quote.totalPrice}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Currency:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.currency || "RWF"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Delivery Time:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.deliveryTime || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Quote Validity:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.validUntil || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Status & Dates
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Status:
                            </span>
                            <p
                              className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                quote.status === "accepted"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : quote.status === "rejected"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              }`}
                            >
                              {quote.status?.charAt(0).toUpperCase() +
                                quote.status?.slice(1) || "Pending"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Submitted Date:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.submittedDate || "Not available"}
                            </p>
                          </div>
                          {quote.updatedDate &&
                            quote.updatedDate !== quote.submittedDate && (
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Last Updated:
                                </span>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                  {quote.updatedDate}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    {quote.quoteMessage && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Quote Message:
                        </span>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                          {quote.quoteMessage}
                        </p>
                      </div>
                    )}
                    {quote.attachments && quote.attachments.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Attachments ({quote.attachments.length}):
                        </span>
                        <div className="mt-3 space-y-2">
                          {quote.attachments.map(
                            (attachment: string, index: number) => (
                              <button
                                key={index}
                                onClick={() => {
                                  try {
                                    const [mimeType, base64Data] =
                                      attachment.split(",");
                                    const byteCharacters = atob(base64Data);
                                    const byteNumbers = new Array(
                                      byteCharacters.length
                                    );
                                    for (
                                      let i = 0;
                                      i < byteCharacters.length;
                                      i++
                                    ) {
                                      byteNumbers[i] =
                                        byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(
                                      byteNumbers
                                    );
                                    const blob = new Blob([byteArray], {
                                      type: mimeType
                                        .split(":")[1]
                                        .split(";")[0],
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `quote-attachment-${
                                      index + 1
                                    }.${
                                      blob.type.includes("pdf") ? "pdf" : "jpg"
                                    }`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error(
                                      "Error downloading attachment:",
                                      error
                                    );
                                  }
                                }}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Attachment {index + 1}
                                  </span>
                                </div>
                                <Download className="h-4 w-4 text-gray-400" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
                  <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-xl">
                    Terms & Conditions
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Payment Terms:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.terms?.paymentTerms || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Delivery Terms:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.terms?.deliveryTerms || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Warranty:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.terms?.warranty || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Cancellation Terms:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.terms?.cancellationTerms || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Enhanced mobile design */}
        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:p-8">
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                Submitted on{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {quote.submittedDate}
                </span>
              </span>
            </div>
            <div className="hidden h-6 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" />
              <span>
                Quote ID:{" "}
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {quote.id}
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
