"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
} from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

interface QuotesSectionProps {
  className?: string;
  onViewQuoteDetails?: (quote: any) => void;
}

export function QuotesSection({
  className = "",
  onViewQuoteDetails,
}: QuotesSectionProps) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedQuotes();
  }, []);

  const fetchSubmittedQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/business-submitted-quotes");
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      } else {
        const errorData = await response.json();
        toast.error("Failed to load submitted quotes");
      }
    } catch (error) {
      console.error("Error fetching submitted quotes:", error);
      toast.error("Failed to load submitted quotes");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "accepted":
        return {
          icon: CheckCircle,
          className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          text: "Accepted",
        };
      case "rejected":
        return {
          icon: XCircle,
          className:
            "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          text: "Rejected",
        };
      default:
        return {
          icon: ClockIcon,
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
          text: "Pending",
        };
    }
  };

  const transformQuoteForModal = (quote: any) => {
    // Transform database quote structure to modal's expected structure
    const attachments = [
      quote.attachement,
      quote.attachment_1,
      quote.attachment_2,
    ].filter((att) => att && att.trim() !== "");

    // RFQ Requester (the company that posted the RFQ)
    const rfqRequester = quote.bussines_RFQ?.business_account;

    // My Business (the company that submitted the quote)
    const myBusiness = quote.business_account;

    // Get RFQ data - handle both possible field names
    const rfq = quote.bussines_RFQ || quote.businessRfq;

    if (!rfq) {
      console.error("RFQ data is missing!", quote);
      return null; // Return null if RFQ data is missing
    }

    // Helper to handle null/undefined/empty strings - return the value if it exists, otherwise return empty string
    const getValue = (value: any, defaultValue: string = "") => {
      if (value === null || value === undefined || value === "") {
        return defaultValue;
      }
      return String(value); // Ensure it's a string
    };

    const transformed = {
      id: quote.id,
      title: getValue(rfq.title, "RFQ Quote"),
      description: getValue(rfq.description),
      category: getValue(rfq.category),
      location: getValue(rfq.location),
      minBudget: getValue(rfq.min_budget),
      maxBudget: getValue(rfq.max_budget),
      responseDate: getValue(rfq.response_date),
      urgencyLevel: getValue(rfq.urgency_level),
      estimatedQuantity: getValue(rfq.estimated_quantity),
      expectedDeliveryDate: getValue(rfq.expected_delivery_date),
      requirements: rfq.requirements || null,
      notes: getValue(rfq.notes),
      rfqContactName: getValue(rfq.contact_name),
      rfqEmail: getValue(rfq.email),
      rfqPhone: getValue(rfq.phone),
      rfqCreatedAt: getValue(rfq.created_at),
      // Quote details
      totalPrice: formatCurrency(quote.qouteAmount, quote.currency),
      currency: quote.currency || "RWF",
      deliveryTime: quote.delivery_time || "Not specified",
      validUntil: quote.quote_validity || "Not specified",
      status: quote.status || "pending",
      submittedDate: formatDate(quote.created_at),
      updatedDate: formatDate(quote.updated_at),
      quoteMessage: quote.message || "",
      attachments: attachments,
      // RFQ Requester Company (the buyer)
      rfqRequester: {
        name: getValue(
          rfqRequester?.business_name || rfq.contact_name,
          "Unknown Business"
        ),
        email: getValue(rfqRequester?.business_email || rfq.email),
        phone: getValue(rfqRequester?.business_phone || rfq.phone),
        location: getValue(rfqRequester?.business_location || rfq.location),
        accountType: getValue(rfqRequester?.account_type),
        status: getValue(rfqRequester?.status),
        id: getValue(rfqRequester?.id),
      },
      // My Business (the supplier who submitted the quote)
      myBusiness: {
        name: myBusiness?.business_name || "Unknown Business",
        email: myBusiness?.business_email || "",
        phone: myBusiness?.business_phone || "",
        location: myBusiness?.business_location || "",
        accountType: myBusiness?.account_type || "",
        status: myBusiness?.status || "",
        id: myBusiness?.id || "",
      },
      // Terms
      terms: {
        paymentTerms: getValue(quote.PaymentTerms, "Not specified"),
        deliveryTerms: getValue(quote.DeliveryTerms, "Not specified"),
        warranty: getValue(quote.warrantly, "Not specified"),
        cancellationTerms: getValue(quote.cancellatioinTerms, "Not specified"),
      },
    };

    return transformed;
  };

  const handleViewDetails = (quote: any) => {
    if (onViewQuoteDetails) {
      const transformedQuote = transformQuoteForModal(quote);
      if (!transformedQuote) {
        toast.error("Unable to load quote details. RFQ data is missing.");
        return;
      }
      onViewQuoteDetails(transformedQuote);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading submitted quotes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 sm:p-6 md:p-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Submitted Quotes
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              Quotes you've submitted as a supplier
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-6 md:p-8">
          {quotes.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-12">
              <Truck className="mx-auto mb-4 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
              <p className="mb-2 text-base text-gray-500 dark:text-gray-400 sm:text-lg">
                No submitted quotes found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 sm:text-sm">
                Submit quotes to RFQ opportunities to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {quotes.map((quote) => {
                const statusBadge = getStatusBadge(quote.status);
                const StatusIcon = statusBadge.icon;
                const attachments = [
                  quote.attachement,
                  quote.attachment_1,
                  quote.attachment_2,
                ].filter((att) => att && att.trim() !== "");

                return (
                  <div
                    key={quote.id}
                    className="group rounded-xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-4 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800 sm:rounded-2xl sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-3 sm:space-y-4">
                        {/* Title and Badges - Stack on mobile */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white sm:text-lg">
                            {quote.bussines_RFQ?.title || "RFQ Quote"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium sm:px-3 sm:text-xs ${statusBadge.className}`}
                            >
                              <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {statusBadge.text}
                            </span>
                            {attachments.length > 0 && (
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-2.5 py-1 text-[10px] font-bold text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200 sm:px-3 sm:text-xs">
                                {attachments.length} attachment
                                {attachments.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* RFQ Info - Show on mobile but simplified */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                          <span className="hidden sm:inline">RFQ from: </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {quote.bussines_RFQ?.business_account
                              ?.business_name || "Unknown Business"}
                          </span>
                        </p>
                        
                        {/* Category - Hidden on mobile */}
                        {quote.bussines_RFQ?.category && (
                          <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block sm:text-sm">
                            Category: {quote.bussines_RFQ.category}
                          </p>
                        )}
                        
                        {/* Details - Hidden on mobile, shown on desktop */}
                        <div className="hidden flex-col gap-2 text-xs sm:flex sm:flex-row sm:items-center sm:gap-4 sm:gap-6 sm:text-sm">
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Truck className="h-3.5 w-3.5 flex-shrink-0 text-green-500 sm:h-4 sm:w-4" />
                            <span className="font-semibold">
                              {quote.delivery_time || "Not specified"}
                            </span>
                          </span>
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-orange-500 sm:h-4 sm:w-4" />
                            <span className="font-semibold">
                              Valid until:{" "}
                              {quote.quote_validity || "Not specified"}
                            </span>
                          </span>
                          {quote.bussines_RFQ?.location && (
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <span>📍</span>
                              <span className="truncate">{quote.bussines_RFQ.location}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Submitted Date - Hidden on mobile */}
                        <div className="hidden text-[10px] text-gray-500 dark:text-gray-400 sm:block sm:text-xs">
                          Submitted: {formatDate(quote.created_at)}
                        </div>
                      </div>
                      
                      {/* Price and Button - Stack on mobile */}
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700 sm:ml-6 sm:flex-col sm:items-end sm:justify-start sm:space-y-4 sm:border-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            {formatCurrency(quote.qouteAmount, quote.currency)}
                          </p>
                          {/* Quote Amount label - Hidden on mobile */}
                          <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block sm:text-sm">
                            Quote Amount
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDetails(quote)}
                          className="flex items-center gap-2 rounded-lg border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:rounded-xl sm:px-4 sm:text-sm"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
