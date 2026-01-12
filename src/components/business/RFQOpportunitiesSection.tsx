"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  User,
  FileText,
  X,
  Building,
  Package,
} from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";
import { QuoteSubmissionForm } from "./QuoteSubmissionForm";
import { SubmittedQuoteDetails } from "./SubmittedQuoteDetails";

interface RFQOpportunitiesSectionProps {
  onMessageCustomer?: (customerId: string) => void;
}

export function RFQOpportunitiesSection({
  onMessageCustomer,
}: RFQOpportunitiesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<any>(null);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, any>>(
    {}
  );
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    fetchRFQOpportunities();
  }, []);

  // Check for existing quotes when RFQs are loaded
  useEffect(() => {
    if (rfqs.length > 0) {
      checkExistingQuotes();
      fetchResponseCounts();
    }
  }, [rfqs]);

  const checkExistingQuotes = async () => {
    const quotePromises = rfqs.map(async (rfq) => {
      try {
        const response = await fetch(
          `/api/queries/user-rfq-quote?rfqId=${rfq.id}`
        );
        if (response.ok) {
          const data = await response.json();
          return { rfqId: rfq.id, quote: data.quote };
        }
      } catch (error) {
        console.error(`Error checking quote for RFQ ${rfq.id}:`, error);
      }
      return { rfqId: rfq.id, quote: null };
    });

    const results = await Promise.all(quotePromises);
    const quotesMap: Record<string, any> = {};
    results.forEach(({ rfqId, quote }) => {
      if (quote) {
        quotesMap[rfqId] = quote;
      }
    });
    setSubmittedQuotes(quotesMap);
  };

  const fetchResponseCounts = async () => {
    const countPromises = rfqs.map(async (rfq) => {
      try {
        const response = await fetch(
          `/api/queries/rfq-details-and-responses?rfq_id=${rfq.id}`
        );
        if (response.ok) {
          const data = await response.json();
          const responses = data.responses || [];
          return { rfqId: rfq.id, count: responses.length };
        }
      } catch (error) {
        console.error(
          `Error fetching response count for RFQ ${rfq.id}:`,
          error
        );
      }
      return { rfqId: rfq.id, count: 0 };
    });

    const results = await Promise.all(countPromises);
    const countsMap: Record<string, number> = {};
    results.forEach(({ rfqId, count }) => {
      countsMap[rfqId] = count;
    });
    setResponseCounts(countsMap);
  };

  const fetchRFQOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/rfq-opportunities");
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      } else {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        toast.error("Failed to load RFQ opportunities");
      }
    } catch (error) {
      console.error("Error fetching RFQ opportunities:", error);
      toast.error("Failed to load RFQ opportunities");
    } finally {
      setLoading(false);
    }
  };

  // Format RFQ data for display
  const formatRFQForDisplay = (rfq: any) => {
    const minBudget = rfq.min_budget ? parseFloat(rfq.min_budget) : 0;
    const maxBudget = rfq.max_budget ? parseFloat(rfq.max_budget) : 0;
    const budgetDisplay =
      minBudget > 0 && maxBudget > 0
        ? `${formatCurrencySync(minBudget)} - ${formatCurrencySync(maxBudget)}`
        : minBudget > 0
        ? `${formatCurrencySync(minBudget)}+`
        : maxBudget > 0
        ? `Up to ${formatCurrencySync(maxBudget)}`
        : "Not specified";

    // Calculate time ago from created_at
    const getTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    // Format deadline
    const formatDeadline = (dateString: string) => {
      if (!dateString) return "Not specified";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // Determine status based on response_date
    const today = new Date();
    const deadline = rfq.response_date ? new Date(rfq.response_date) : null;
    const isUrgent =
      deadline &&
      deadline.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000; // Less than 3 days
    const isClosed = deadline && deadline < today;
    const status = isClosed ? "Closed" : isUrgent ? "Urgent" : "Open";

    return {
      id: rfq.id,
      title: rfq.title || "Untitled RFQ",
      description: rfq.description || "No description provided",
      budget: budgetDisplay,
      category: rfq.category || "Uncategorized",
      location: rfq.location || "Not specified",
      postedBy:
        rfq.business_account?.business_name ||
        rfq.contact_name ||
        "Unknown Business",
      postedAt: getTimeAgo(rfq.created_at),
      deadline: formatDeadline(rfq.response_date),
      status: status,
      responses: responseCounts[rfq.id] || 0,
      isInterested: false,
      ...rfq, // Include all original fields
    };
  };

  const displayRFQs = rfqs.map(formatRFQForDisplay);

  // Get unique categories from RFQs
  const categories = [
    "all",
    ...Array.from(
      new Set(displayRFQs.map((rfq) => rfq.category).filter(Boolean))
    ),
  ];

  const filteredRFQs = displayRFQs.filter((rfq) => {
    const matchesSearch =
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || rfq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewRFQ = (rfq: any) => {
    setSelectedRFQ(rfq);
    setIsQuoteModalOpen(true);
  };

  const handleShareQuote = async (rfq: any) => {
    // Check if quote already exists
    const existingQuote = submittedQuotes[rfq.id];

    if (existingQuote) {
      // Show quote details instead of form
      setSelectedRFQForQuote(rfq); // Set RFQ for title
      setSelectedQuote(existingQuote);
      setIsQuoteDetailsOpen(true);
    } else {
      // Show submission form
      setSelectedRFQForQuote(rfq);
      setIsQuoteFormOpen(true);
    }
  };

  const handleQuoteSubmitted = () => {
    toast.success("Quote submitted successfully!");
    setIsQuoteFormOpen(false);
    setSelectedRFQForQuote(null);
    // Refresh the quotes map
    checkExistingQuotes();
    // Optionally refresh the RFQs list
    fetchRFQOpportunities();
  };

  const handleMessageCustomer = (customerId: string) => {
    if (onMessageCustomer) {
      onMessageCustomer(customerId);
    } else {
      console.log("Messaging customer:", customerId);
    }
  };

  const handleToggleInterest = (rfqId: string) => {
    console.log("Toggling interest for RFQ:", rfqId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-6 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          RFQ Opportunities
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          {filteredRFQs.length}{" "}
          {filteredRFQs.length === 1 ? "opportunity" : "opportunities"} found
        </div>
      </div>

      {/* Search and Filter */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search RFQ opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RFQ Opportunities List */}
      <div className="space-y-4">
        {filteredRFQs.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg text-gray-500 dark:text-gray-400">
              No RFQ opportunities found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Check back later for new opportunities"}
            </p>
          </div>
        ) : (
          filteredRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-6"
            >
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                      {rfq.title}
                    </h4>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-medium sm:text-xs ${
                        rfq.status === "Urgent"
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {rfq.status}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400 sm:line-clamp-none">
                    {rfq.description}
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm lg:grid-cols-4">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate font-medium">{rfq.budget}</span>
                    </div>
                    {rfq.estimated_quantity && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Package className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="truncate font-medium">
                          Qty: {rfq.estimated_quantity}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">{rfq.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <User className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">{rfq.postedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50 sm:flex-col sm:items-end sm:justify-start sm:bg-transparent sm:p-0 dark:sm:bg-transparent">
                  <div className="text-left sm:text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white sm:mb-1 sm:text-2xl">
                      {rfq.budget}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 sm:mb-2 sm:text-sm">
                      {rfq.responses} responses
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      Posted {rfq.postedAt}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:gap-4 sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">
                      Deadline: {rfq.deadline}
                    </span>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] dark:bg-gray-700 sm:text-xs">
                    {rfq.category}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleInterest(rfq.id)}
                  className={`w-full rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 sm:w-auto sm:px-4 sm:py-2 sm:text-sm ${
                    rfq.isInterested
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/40"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm hover:from-green-50 hover:to-emerald-50 hover:text-green-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 dark:hover:text-green-300"
                  }`}
                  style={rfq.isInterested ? { color: "#ffffff" } : undefined}
                >
                  {rfq.isInterested ? "✓ Interested" : "Mark Interest"}
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                <button
                  onClick={() => handleViewRFQ(rfq)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-800 to-green-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-green-900/40 transition-all duration-200 hover:from-green-900 hover:to-green-950 hover:shadow-lg hover:shadow-green-900/50 active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm"
                  style={{ color: "#ffffff" }}
                >
                  <Eye
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    style={{ color: "#ffffff" }}
                  />
                  <span
                    className="hidden sm:inline"
                    style={{ color: "#ffffff" }}
                  >
                    View Details
                  </span>
                  <span className="sm:hidden" style={{ color: "#ffffff" }}>
                    View
                  </span>
                </button>
                <button
                  onClick={() => handleShareQuote(rfq)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm ${
                    submittedQuotes[rfq.id]
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/40"
                  }`}
                  style={{ color: "#ffffff" }}
                >
                  <CheckCircle
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    style={{ color: "#ffffff" }}
                  />
                  <span style={{ color: "#ffffff" }}>
                    {submittedQuotes[rfq.id] ? (
                      <>
                        <span className="hidden sm:inline">View Quote</span>
                        <span className="sm:hidden">View Quote</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Submit Quote</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => handleMessageCustomer(rfq.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/30 transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm"
                  style={{ color: "#ffffff" }}
                >
                  <MessageSquare
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    style={{ color: "#ffffff" }}
                  />
                  <span style={{ color: "#ffffff" }}>Message</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RFQ Details Modal */}
      {isQuoteModalOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:bg-black/60 sm:p-4">
          <div className="flex h-full max-h-screen w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-gray-900 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:rounded-3xl sm:border sm:border-gray-200 dark:sm:border-gray-700">
            {/* Header */}
            <div className="flex-shrink-0 bg-white p-6 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Request for Quotation
                </h2>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
              <div className="p-6 md:p-8">
                {/* To: Supplier Section */}
                <div className="mb-8">
                  <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    To:
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    [Supplier's Company Name]
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    [Supplier's Address]
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    [City, Country]
                  </div>
                </div>

                {/* Date, RFQ Reference, Response Deadline */}
                <div className="mb-8 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Date:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(
                        selectedRFQ.created_at || Date.now()
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      RFQ Reference Number:{" "}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {selectedRFQ.id?.slice(0, 8).toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Response Deadline:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRFQ.deadline ||
                        selectedRFQ.response_date ||
                        "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-8">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Subject: Request for Quotation for{" "}
                    {selectedRFQ.title ||
                      "[Insert Description of Goods/Services]"}
                  </div>
                </div>

                {/* Greeting */}
                <div className="mb-8 text-sm text-gray-700 dark:text-gray-300">
                  <p>Dear [Supplier's Contact Name],</p>
                  <p className="mt-2">
                    We hope this message finds you well. We are reaching out to
                    request a formal quotation for the following products and/or
                    services that we need for an upcoming project. Below, you
                    will find the specific requirements for this request.
                  </p>
                </div>

                {/* 1. RFQ Summary */}
                <div className="mb-8">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    1. RFQ Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        RFQ Title:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.title || "[Insert Title Here]"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Business ID:{" "}
                      </span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {selectedRFQ.business_id?.slice(0, 8).toUpperCase() ||
                          selectedRFQ.id?.slice(0, 8).toUpperCase() ||
                          "[Insert Business ID Here]"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Category:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.category || "[Insert Category Here]"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Location:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.location || "[Insert Location Here]"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Urgency Level:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.urgency_level ||
                          selectedRFQ.status ||
                          "[Insert Urgency Level Here]"}
                        {selectedRFQ.urgency_level &&
                          " (For example: High, Medium, Low)"}
                      </span>
                    </div>
                    {selectedRFQ.estimated_quantity && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Estimated Quantity Needed:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedRFQ.estimated_quantity}
                        </span>
                      </div>
                    )}
                    {selectedRFQ.expected_delivery_date && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Expected Delivery Date:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(
                            selectedRFQ.expected_delivery_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Budget Range:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        We expect the total cost to be between RWF{" "}
                        {selectedRFQ.min_budget
                          ? formatCurrencySync(
                              parseFloat(selectedRFQ.min_budget)
                            ).replace(/[^\d,]/g, "")
                          : "[Insert Min Budget Here]"}{" "}
                        and RWF{" "}
                        {selectedRFQ.max_budget
                          ? formatCurrencySync(
                              parseFloat(selectedRFQ.max_budget)
                            ).replace(/[^\d,]/g, "")
                          : "[Insert Max Budget Here]"}
                        .
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Description of Goods/Services */}
                <div className="mb-8">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    2. Description of Goods/Services
                  </h3>
                  <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                    We are requesting quotations for the following:
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Goods/Services Description:
                      </div>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRFQ.description ||
                          "[Insert Detailed Description of the Products/Services Here]"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        (Example: Office furniture, computers, or equipment,
                        etc.)
                      </p>
                    </div>
                    {selectedRFQ.requirements &&
                      (() => {
                        let requirementsList: string[] = [];
                        try {
                          if (typeof selectedRFQ.requirements === "string") {
                            if (selectedRFQ.requirements.startsWith("[")) {
                              requirementsList = JSON.parse(
                                selectedRFQ.requirements
                              );
                            } else {
                              // If it's a plain string, split by common delimiters
                              requirementsList = selectedRFQ.requirements
                                .split(/[,;]\s*/)
                                .filter((req) => req.trim().length > 0);
                            }
                          } else if (Array.isArray(selectedRFQ.requirements)) {
                            requirementsList = selectedRFQ.requirements;
                          } else {
                            requirementsList = [
                              String(selectedRFQ.requirements),
                            ];
                          }
                        } catch (error) {
                          // If parsing fails, treat as single string
                          requirementsList = [String(selectedRFQ.requirements)];
                        }

                        return (
                          <div>
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              Specific Requirements:
                            </div>
                            <ul className="ml-6 mt-1 list-disc space-y-1 text-gray-900 dark:text-white">
                              {requirementsList.map((req, index) => (
                                <li key={index}>{req.trim()}</li>
                              ))}
                            </ul>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              (Example: Must meet international quality
                              standards, must be energy-efficient, etc.)
                            </p>
                          </div>
                        );
                      })()}
                    {selectedRFQ.estimated_quantity && (
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          Quantity Required:
                        </div>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRFQ.estimated_quantity}
                        </p>
                      </div>
                    )}
                    {selectedRFQ.notes && (
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          Packaging/Delivery Requirements:
                        </div>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {selectedRFQ.notes}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          (Example: Items must be delivered fully assembled and
                          packaged to prevent damage during transport.)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Terms and Conditions */}
                <div className="mb-8">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    3. Terms and Conditions
                  </h3>
                  <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                    We kindly request that the following conditions are
                    considered when submitting your quotation:
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Payment Terms:
                      </div>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRFQ.payment_terms ||
                          "[Insert Payment Terms Here]"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        (For example: 50% advance, 50% upon delivery, 100%
                        upfront, etc.)
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Delivery Terms:
                      </div>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRFQ.delivery_terms ||
                          "[Insert Delivery Terms Here]"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        (For example: EXW, DDP, etc.)
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Warranty Information:
                      </div>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRFQ.warranty_information ||
                          "[Insert Warranty Terms Here]"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        (For example: 1-year warranty on all items, etc.)
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        Cancellation Terms:
                      </div>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedRFQ.cancellation_terms ||
                          "[Insert Cancellation Terms Here]"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        (For example: 7 days notice required for cancellation.)
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Submission Instructions */}
                <div className="mb-8">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    4. Submission Instructions
                  </h3>
                  <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                    Please ensure your quotation includes the following:
                  </p>
                  <ul className="ml-6 list-disc space-y-2 text-sm text-gray-900 dark:text-white">
                    <li>
                      A detailed breakdown of costs, including the unit price,
                      total price, delivery costs, taxes, and any applicable
                      fees.
                    </li>
                    <li>
                      Lead time for delivery and any available options for
                      expedited shipping, if applicable.
                    </li>
                    <li>
                      Product specifications, including make, model, and
                      relevant certifications.
                    </li>
                    <li>
                      Validity period for the quote (minimum 30 days is
                      preferred).
                    </li>
                    <li>Payment terms as agreed upon.</li>
                  </ul>
                </div>

                {/* 5. Attachments */}
                {selectedRFQ.attachment && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                      5. Attachments
                    </h3>
                    <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                      If applicable, please include any relevant documentation:
                    </p>
                    <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                      <div>Attachment 1: [Download/View Attachment]</div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      (Feel free to attach your product catalog, pricing list,
                      or any other relevant documents.)
                    </p>
                  </div>
                )}

                {/* 6. Response Deadline */}
                <div className="mb-8">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    6. Response Deadline
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-white">
                    We kindly ask that you submit your quotation by{" "}
                    <span className="font-medium">
                      {selectedRFQ.deadline ||
                        selectedRFQ.response_date ||
                        "[Insert Response Date Here]"}
                    </span>
                    . Late submissions may not be considered.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                  <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                    For any inquiries or clarifications regarding this request,
                    please contact:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Name:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.contact_name ||
                          selectedRFQ.business_account?.business_name ||
                          "[Insert Your Contact Name Here]"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Phone:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.phone ||
                          selectedRFQ.business_account?.business_phone ||
                          "[Insert Your Phone Number Here]"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Email:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRFQ.email ||
                          selectedRFQ.business_account?.business_email ||
                          "[Insert Your Email Address Here]"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Closing */}
                <div className="mb-8 text-sm text-gray-700 dark:text-gray-300">
                  <p className="mb-2">
                    We look forward to receiving your quotation and thank you
                    for your time and attention to this request. Should you have
                    any questions or need further information, do not hesitate
                    to contact us.
                  </p>
                  <div className="mt-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Kind regards,
                    </div>
                    <div className="mt-1">
                      {selectedRFQ.contact_name ||
                        selectedRFQ.business_account?.business_name ||
                        "[Your Name]"}
                    </div>
                    <div className="mt-1">
                      {selectedRFQ.business_account?.business_name ||
                        "[Your Company Name]"}
                    </div>
                    <div className="mt-1">
                      {selectedRFQ.email ||
                        selectedRFQ.business_account?.business_email ||
                        "[Your Contact Information]"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="flex-shrink-0 bg-white p-4 dark:bg-gray-900 sm:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  onClick={() => {
                    setIsQuoteModalOpen(false);
                    handleShareQuote(selectedRFQ);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${
                    submittedQuotes[selectedRFQ.id]
                      ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {submittedQuotes[selectedRFQ.id]
                      ? "View My Quote"
                      : "Submit Quote"}
                  </span>
                </button>
                <button
                  onClick={() => handleMessageCustomer(selectedRFQ.id)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Message Customer</span>
                </button>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Submission Form */}
      {isQuoteFormOpen && selectedRFQForQuote && (
        <QuoteSubmissionForm
          isOpen={isQuoteFormOpen}
          onClose={() => {
            setIsQuoteFormOpen(false);
            setSelectedRFQForQuote(null);
          }}
          rfqId={selectedRFQForQuote.id}
          rfqTitle={selectedRFQForQuote.title}
          onSuccess={handleQuoteSubmitted}
        />
      )}

      {/* Submitted Quote Details */}
      {isQuoteDetailsOpen && selectedQuote && selectedRFQForQuote && (
        <SubmittedQuoteDetails
          isOpen={isQuoteDetailsOpen}
          onClose={() => {
            setIsQuoteDetailsOpen(false);
            setSelectedQuote(null);
            setSelectedRFQForQuote(null);
          }}
          quote={selectedQuote}
          rfqTitle={selectedRFQForQuote.title || "RFQ"}
          rfqId={selectedRFQForQuote.id}
        />
      )}
    </div>
  );
}
