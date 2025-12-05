"use client";

import { useState } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Package,
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Truck,
  Calendar,
  User,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="relative flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">{quote.title}</h2>
              <p className="text-lg text-green-100">
                RFQ from: {quote.rfqRequester?.name || "Unknown Business"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMessage}
                className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Message Supplier
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/30 bg-white/20 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/5"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-white/5"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex space-x-2">
                {[
                  { id: "overview", label: "Overview", icon: FileText },
                  { id: "rfq", label: "RFQ Details", icon: FileText },
                  { id: "requester", label: "RFQ Requester", icon: Building },
                  { id: "quote", label: "My Quote", icon: DollarSign },
                  { id: "terms", label: "Terms & Conditions", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "scale-105 transform bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Quote Summary */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                      Quote Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Price
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {quote.totalPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Delivery Time
                        </span>
                        <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                          <Truck className="h-4 w-4" />
                          {quote.deliveryTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Valid Until
                        </span>
                        <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4" />
                          {quote.validUntil}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Currency
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {quote.currency || "RWF"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          quote.status === "accepted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : quote.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                          {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Submitted
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {quote.submittedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RFQ Requester Quick Info */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                      RFQ Requester
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {quote.rfqRequester?.name || "Unknown Business"}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {quote.rfqRequester?.location || "Not specified"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {quote.rfqRequester?.email || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {quote.rfqRequester?.phone || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Message */}
                {quote.quoteMessage && (
                  <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Quote Message
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {quote.quoteMessage}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {quote.attachments && quote.attachments.length > 0 && (
                  <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Attachments ({quote.attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {quote.attachments.map(
                        (attachment: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => {
                              try {
                                const [mimeType, base64Data] = attachment.split(",");
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
            )}

            {activeTab === "rfq" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
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
                          <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
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
                              ? `${formatCurrencySync(parseFloat(quote.minBudget))} - ${formatCurrencySync(parseFloat(quote.maxBudget))}`
                              : quote.minBudget
                              ? `Min: ${formatCurrencySync(parseFloat(quote.minBudget))}`
                              : quote.maxBudget
                              ? `Max: ${formatCurrencySync(parseFloat(quote.maxBudget))}`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Response Deadline:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.responseDate ? formatDate(quote.responseDate) : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Expected Delivery:
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {quote.expectedDeliveryDate ? formatDate(quote.expectedDeliveryDate) : "Not specified"}
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
                        <p className="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
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
                          {typeof quote.requirements === 'string' 
                            ? <p className="whitespace-pre-wrap">{quote.requirements}</p>
                            : Array.isArray(quote.requirements)
                            ? <ul className="list-disc list-inside space-y-1">
                                {quote.requirements.map((req: any, idx: number) => (
                                  <li key={idx}>{typeof req === 'string' ? req : JSON.stringify(req)}</li>
                                ))}
                              </ul>
                            : <p>{JSON.stringify(quote.requirements)}</p>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requester" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
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
                              {quote.rfqRequester?.accountType || "Not specified"}
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
                              {quote.rfqRequester?.email || quote.rfqEmail || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Phone:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.phone || quote.rfqPhone || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Location:
                            </span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {quote.rfqRequester?.location || quote.location || "Not provided"}
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
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
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
                            <p className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              quote.status === "accepted"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : quote.status === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}>
                              {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || "Pending"}
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
                          {quote.updatedDate && quote.updatedDate !== quote.submittedDate && (
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
                        <p className="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
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
                          {quote.attachments.map((attachment: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => {
                                try {
                                  const [mimeType, base64Data] = attachment.split(",");
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
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

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Submitted on{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {quote.submittedDate}
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Quote ID:{" "}
              <span className="font-mono text-gray-900 dark:text-white">
                {quote.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
