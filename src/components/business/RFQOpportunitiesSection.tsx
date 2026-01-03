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
        console.error(`Error fetching response count for RFQ ${rfq.id}:`, error);
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

                  <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3 sm:gap-4 sm:text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate font-medium">{rfq.budget}</span>
                    </div>
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
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "#ffffff" }} />
                  <span className="hidden sm:inline" style={{ color: "#ffffff" }}>
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
                          {selectedRFQ.title}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                      <Building className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedRFQ.postedBy}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="flex-shrink-0 rounded-xl bg-gray-100 p-2.5 text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {/* Status and Category Badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedRFQ.status === "Urgent"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : selectedRFQ.status === "Closed"
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {selectedRFQ.status === "Urgent" && (
                      <Clock className="h-3 w-3" />
                    )}
                    {selectedRFQ.status}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {selectedRFQ.category}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {selectedRFQ.responses || 0} responses
                  </span>
                </div>
                {/* Action buttons */}
                <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:gap-3">
                  <button
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      handleShareQuote(selectedRFQ);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 sm:px-4 sm:py-2.5 ${
                      submittedQuotes[selectedRFQ.id]
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/40"
                    }`}
                    style={{ color: "#ffffff" }}
                  >
                    <CheckCircle
                      className="h-4 w-4"
                      style={{ color: "#ffffff" }}
                    />
                    <span style={{ color: "#ffffff" }}>
                      {submittedQuotes[selectedRFQ.id]
                        ? "View My Quote"
                        : "Submit Quote"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleMessageCustomer(selectedRFQ.id)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/30 transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95 dark:border-gray-700 sm:px-4 sm:py-2.5"
                    style={{ color: "#ffffff" }}
                  >
                    <MessageSquare
                      className="h-4 w-4"
                      style={{ color: "#ffffff" }}
                    />
                    <span style={{ color: "#ffffff" }}>Message Customer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 sm:bg-white dark:sm:bg-gray-900">
              <div className="space-y-4 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8">
                {/* Overview Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Budget Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 dark:from-green-900/20 dark:to-emerald-900/20 sm:px-6 sm:py-5">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Budget Range
                        </h3>
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {selectedRFQ.budget}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4 dark:from-blue-900/20 dark:to-cyan-900/20 sm:px-6 sm:py-5">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          Location
                        </h3>
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedRFQ.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-lg">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 dark:from-purple-900/20 dark:to-pink-900/20 sm:px-6 sm:py-5">
                      <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Description
                      </h3>
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {selectedRFQ.description}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Posted By Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <div className="p-4 sm:p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Posted By
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedRFQ.postedBy}
                        </p>
                      </div>
                    </div>

                    {/* Deadline Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <div className="p-4 sm:p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Response Deadline
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedRFQ.deadline}
                        </p>
                      </div>
                    </div>

                    {/* Posted Date Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <div className="p-4 sm:p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Posted
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedRFQ.postedAt}
                        </p>
                      </div>
                    </div>

                    {/* Responses Count Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <div className="p-4 sm:p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Total Responses
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedRFQ.responses || 0}
                        </p>
                      </div>
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
                    Posted on{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedRFQ.postedAt}
                    </span>
                  </span>
                </div>
                <div className="hidden h-6 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FileText className="h-4 w-4" />
                  <span>
                    RFQ ID:{" "}
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {selectedRFQ.id?.slice(0, 8) || "N/A"}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:from-gray-300 hover:to-gray-400 active:scale-95 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 sm:w-auto sm:px-6 sm:py-3"
              >
                Close
              </button>
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
        />
      )}
    </div>
  );
}
