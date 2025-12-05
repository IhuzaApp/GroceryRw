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
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, any>>({});
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
        const response = await fetch(`/api/queries/user-rfq-quote?rfqId=${rfq.id}`);
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
        console.log("RFQ Opportunities API Response:", data);
        console.log("Number of RFQs received:", data.rfqs?.length || 0);
        console.log("RFQ IDs:", data.rfqs?.map((rfq: any) => rfq.id));
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
    const isUrgent = deadline && deadline.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000; // Less than 3 days
    const isClosed = deadline && deadline < today;
    const status = isClosed ? "Closed" : isUrgent ? "Urgent" : "Open";

    return {
      id: rfq.id,
      title: rfq.title || "Untitled RFQ",
      description: rfq.description || "No description provided",
      budget: budgetDisplay,
      category: rfq.category || "Uncategorized",
      location: rfq.location || "Not specified",
      postedBy: rfq.business_account?.business_name || rfq.contact_name || "Unknown Business",
      postedAt: getTimeAgo(rfq.created_at),
      deadline: formatDeadline(rfq.response_date),
      status: status,
      responses: 0, // TODO: Get actual response count
      isInterested: false,
      ...rfq, // Include all original fields
    };
  };

  const displayRFQs = rfqs.map(formatRFQForDisplay);
  
  console.log("Total RFQs from API:", rfqs.length);
  console.log("Display RFQs after formatting:", displayRFQs.length);
  console.log("Display RFQ IDs:", displayRFQs.map((rfq) => rfq.id));

  // Get unique categories from RFQs
  const categories = [
    "all",
    ...Array.from(new Set(displayRFQs.map((rfq) => rfq.category).filter(Boolean))),
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
  
  console.log("Filtered RFQs count:", filteredRFQs.length);
  console.log("Filtered RFQ IDs:", filteredRFQs.map((rfq) => rfq.id));

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
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          RFQ Opportunities
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredRFQs.length} {filteredRFQs.length === 1 ? "opportunity" : "opportunities"} found
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
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No RFQ opportunities found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Check back later for new opportunities"}
            </p>
          </div>
        ) : (
          filteredRFQs.map((rfq) => (
          <div
            key={rfq.id}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {rfq.title}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      rfq.status === "Urgent"
                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {rfq.status}
                  </span>
                </div>
                <p className="mb-3 text-gray-600 dark:text-gray-400">
                  {rfq.description}
                </p>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">{rfq.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{rfq.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{rfq.postedBy}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {rfq.budget}
                </div>
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  {rfq.responses} responses
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Posted {rfq.postedAt}
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {rfq.deadline}</span>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">
                  {rfq.category}
                </span>
              </div>

              <button
                onClick={() => handleToggleInterest(rfq.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  rfq.isInterested
                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {rfq.isInterested ? "Interested" : "Mark Interest"}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewRFQ(rfq)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => handleShareQuote(rfq)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
                  submittedQuotes[rfq.id]
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {submittedQuotes[rfq.id] ? "View Quote" : "Submit Quote"}
              </button>
              <button
                onClick={() => handleMessageCustomer(rfq.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-600"
              >
                <MessageSquare className="h-4 w-4" />
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
                    {submittedQuotes[selectedRFQ.id] ? "View Quote" : "Submit Quote"}
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
