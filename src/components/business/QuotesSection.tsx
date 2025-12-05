"use client";

import { useState, useEffect } from "react";
import { Truck, Clock, CheckCircle, XCircle, Clock as ClockIcon, Eye } from "lucide-react";
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
          className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          text: "Accepted",
        };
      case "rejected":
        return {
          icon: XCircle,
          className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          text: "Rejected",
        };
      default:
        return {
          icon: ClockIcon,
          className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
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
        name: getValue(rfqRequester?.business_name || rfq.contact_name, "Unknown Business"),
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading submitted quotes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Submitted Quotes
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Quotes you've submitted as a supplier
            </p>
          </div>
        </div>
        <div className="p-8">
          {quotes.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No submitted quotes found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Submit quotes to RFQ opportunities to see them here
              </p>
            </div>
          ) : (
          <div className="space-y-6">
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
                className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                            {quote.bussines_RFQ?.title || "RFQ Quote"}
                      </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusBadge.text}
                          </span>
                          {attachments.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 text-xs font-bold text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200">
                              {attachments.length} attachment{attachments.length > 1 ? "s" : ""}
                      </span>
                          )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                          RFQ from:{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                            {quote.bussines_RFQ?.business_account?.business_name || "Unknown Business"}
                      </span>
                    </p>
                        {quote.bussines_RFQ?.category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Category: {quote.bussines_RFQ.category}
                          </p>
                        )}
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Truck className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">
                              {quote.delivery_time || "Not specified"}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">
                              Valid until: {quote.quote_validity || "Not specified"}
                        </span>
                      </span>
                          {quote.bussines_RFQ?.location && (
                            <span className="text-gray-600 dark:text-gray-400">
                              📍 {quote.bussines_RFQ.location}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Submitted: {formatDate(quote.created_at)}
                    </div>
                  </div>
                  <div className="ml-6 space-y-4 text-right">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(quote.qouteAmount, quote.currency)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quote Amount
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(quote)}
                            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                            <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
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
