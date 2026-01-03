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

  useEffect(() => {
    fetchRFQOpportunities();
  }, []);

  // Check for existing quotes when RFQs are loaded
  useEffect(() => {
    if (rfqs.length > 0) {
      checkExistingQuotes();
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
      responses: 0, // TODO: Get actual response count
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
                  className={`w-full rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 sm:w-auto sm:py-1 ${
                    rfq.isInterested
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {rfq.isInterested ? "Interested" : "Mark Interest"}
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                <button
                  onClick={() => handleViewRFQ(rfq)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">View</span>
                </button>
                <button
                  onClick={() => handleShareQuote(rfq)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-white transition-colors active:scale-95 sm:px-4 sm:py-2 sm:text-sm ${
                    submittedQuotes[rfq.id]
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
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
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-purple-600 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Message
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quote Modal */}
      {isQuoteModalOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  RFQ Details
                </h3>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    {selectedRFQ.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedRFQ.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Budget:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedRFQ.budget}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Location:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedRFQ.location}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Posted By:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedRFQ.postedBy}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Deadline:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedRFQ.deadline}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setIsQuoteModalOpen(false);
                      handleShareQuote(selectedRFQ);
                    }}
                    className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
                      submittedQuotes[selectedRFQ.id]
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {submittedQuotes[selectedRFQ.id]
                      ? "View Quote"
                      : "Submit Quote"}
                  </button>
                  <button
                    onClick={() => handleMessageCustomer(selectedRFQ.id)}
                    className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    Message Customer
                  </button>
                </div>
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
        />
      )}
    </div>
  );
}
