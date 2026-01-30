"use client";

import { useMemo } from "react";
import {
  FileText,
  Building,
  DollarSign,
  Truck,
  Calendar,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Download,
} from "lucide-react";
import { formatCurrencySync } from "../../../../utils/formatCurrency";

interface QuoteDetailContentProps {
  selectedItem: any;
  quoteActiveTab: string;
  setQuoteActiveTab: (tab: string) => void;
}

function transformQuote(quote: any) {
  const attachments = [
    quote.attachement,
    quote.attachment_1,
    quote.attachment_2,
  ].filter((att) => att && att.trim() !== "");

  const rfqRequester = quote.bussines_RFQ?.business_account;
  const myBusiness = quote.business_account;
  const rfq = quote.bussines_RFQ || quote.businessRfq || quote.rfq;

  const getValue = (value: any, defaultValue: string = "") => {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    }
    return String(value);
  };

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

  const formatCurrency = (amount: string, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "RWF",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(parseFloat(amount));
    } catch {
      return `${amount} ${currency || "RWF"}`;
    }
  };

  return {
    id: quote.id,
    title: getValue(rfq?.title, "RFQ Quote"),
    description: getValue(rfq?.description),
    category: getValue(rfq?.category),
    location: getValue(rfq?.location),
    minBudget: getValue(rfq?.min_budget),
    maxBudget: getValue(rfq?.max_budget),
    responseDate: getValue(rfq?.response_date),
    urgencyLevel: getValue(rfq?.urgency_level),
    estimatedQuantity: getValue(rfq?.estimated_quantity),
    expectedDeliveryDate: getValue(rfq?.expected_delivery_date),
    requirements: rfq?.requirements || null,
    notes: getValue(rfq?.notes),
    rfqContactName: getValue(rfq?.contact_name),
    rfqEmail: getValue(rfq?.email),
    rfqPhone: getValue(rfq?.phone),
    rfqCreatedAt: getValue(rfq?.created_at),
    totalPrice: quote.qouteAmount
      ? formatCurrency(quote.qouteAmount, quote.currency)
      : "N/A",
    currency: quote.currency || "RWF",
    deliveryTime: quote.delivery_time || "Not specified",
    validUntil: quote.quote_validity || "Not specified",
    status: quote.status || "pending",
    submittedDate: formatDate(quote.created_at),
    updatedDate: formatDate(quote.updated_at),
    quoteMessage: quote.message || "",
    attachments: attachments,
    rfqRequester: {
      name: getValue(
        rfqRequester?.business_name || rfq?.contact_name,
        "Unknown Business"
      ),
      email: getValue(rfqRequester?.business_email || rfq?.email),
      phone: getValue(rfqRequester?.business_phone || rfq?.phone),
      location: getValue(rfqRequester?.business_location || rfq?.location),
      accountType: getValue(rfqRequester?.account_type),
      status: getValue(rfqRequester?.status),
      id: getValue(rfqRequester?.id),
    },
    myBusiness: {
      name: myBusiness?.business_name || "Unknown Business",
      email: myBusiness?.business_email || "",
      phone: myBusiness?.business_phone || "",
      location: myBusiness?.business_location || "",
      accountType: myBusiness?.account_type || "",
      status: myBusiness?.status || "",
      id: myBusiness?.id || "",
    },
    terms: {
      paymentTerms: getValue(quote.PaymentTerms, "Not specified"),
      deliveryTerms: getValue(quote.DeliveryTerms, "Not specified"),
      warranty: getValue(quote.warrantly, "Not specified"),
      cancellationTerms: getValue(quote.cancellatioinTerms, "Not specified"),
    },
  };
}

function downloadAttachment(base64String: string, index: number) {
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
}

const TABS = [
  { id: "overview", label: "Overview", icon: FileText, shortLabel: "Overview" },
  { id: "rfq", label: "RFQ Details", icon: FileText, shortLabel: "RFQ" },
  { id: "requester", label: "RFQ Requester", icon: Building, shortLabel: "Requester" },
  { id: "quote", label: "My Quote", icon: DollarSign, shortLabel: "Quote" },
  { id: "terms", label: "Terms & Conditions", icon: FileText, shortLabel: "Terms" },
];

export function QuoteDetailContent({
  selectedItem,
  quoteActiveTab,
  setQuoteActiveTab,
}: QuoteDetailContentProps) {
  const quote = useMemo(
    () => transformQuote(selectedItem),
    [selectedItem]
  );

  return (
    <>
      {/* Header */}
      <div className="-mx-5 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md dark:from-gray-700 dark:to-gray-600">
                <FileText className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-lg font-bold leading-tight text-gray-900 dark:text-white">
                  {quote.title}
                </h2>
              </div>
            </div>
            <div className="ml-14 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/50">
              <Building className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
              <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                {quote.rfqRequester?.name || "Unknown Business"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 -mx-5 border-b border-gray-200 bg-white px-5 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="scrollbar-hide flex space-x-2 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQuoteActiveTab(tab.id)}
              className={`group flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                quoteActiveTab === tab.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
              style={
                quoteActiveTab === tab.id ? { color: "#ffffff" } : undefined
              }
            >
              <tab.icon
                className="h-4 w-4 transition-transform duration-200"
                style={
                  quoteActiveTab === tab.id ? { color: "#ffffff" } : undefined
                }
              />
              <span
                className="whitespace-nowrap"
                style={
                  quoteActiveTab === tab.id ? { color: "#ffffff" } : undefined
                }
              >
                {tab.shortLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 pb-4">
        {quoteActiveTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Quote Summary */}
              <div className="overflow-hidden rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Quote Summary
                  </h3>
                </div>
                <div className="space-y-4 p-5">
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
                        {quote.currency}
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

              {/* RFQ Requester Quick Info */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                    <Building className="h-5 w-5 text-blue-600" />
                    RFQ Requester
                  </h3>
                </div>
                <div className="space-y-4 p-5">
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

            {quote.quoteMessage && (
              <div className="overflow-hidden rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 dark:from-purple-900/20 dark:to-pink-900/20">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Quote Message
                  </h3>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {quote.quoteMessage}
                  </p>
                </div>
              </div>
            )}

            {quote.attachments && quote.attachments.length > 0 && (
              <div className="overflow-hidden rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 dark:from-amber-900/20 dark:to-orange-900/20">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <FileText className="h-5 w-5 text-amber-600" />
                    Attachments ({quote.attachments.length})
                  </h3>
                </div>
                <div className="space-y-2.5 p-5">
                  {quote.attachments.map((attachment: string, index: number) => (
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
          </div>
        )}

        {quoteActiveTab === "rfq" && (
          <div className="space-y-4">
            <div className="rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                RFQ Details
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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
                        {quote.responseDate
                          ? new Date(quote.responseDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Expected Delivery:
                      </span>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {quote.expectedDeliveryDate
                          ? new Date(
                              quote.expectedDeliveryDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
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
                          {quote.requirements.map((req: any, idx: number) => (
                            <li key={idx}>
                              {typeof req === "string"
                                ? req
                                : JSON.stringify(req)}
                            </li>
                          ))}
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

        {quoteActiveTab === "requester" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                RFQ Requester Company Information
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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

        {quoteActiveTab === "quote" && (
          <div className="space-y-4">
            <div className="rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                My Quote Details
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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
                          {quote.currency}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Delivery Time:
                        </span>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {quote.deliveryTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Quote Validity:
                        </span>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {quote.validUntil}
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
                            onClick={() =>
                              downloadAttachment(attachment, index)
                            }
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

        {quoteActiveTab === "terms" && (
          <div className="-mx-5 space-y-4 px-5">
            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Terms & Conditions
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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
    </>
  );
}
