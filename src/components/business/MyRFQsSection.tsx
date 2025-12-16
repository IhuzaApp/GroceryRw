"use client";

import { useState, useEffect } from "react";
import { Plus, DollarSign, FileText, Clock } from "lucide-react";
import { RFQResponsesView } from "./RFQResponsesView";
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

interface MyRFQsSectionProps {
  className?: string;
  onCreateRFQ?: () => void;
  onAssignContract?: (contractData: any) => void;
  onMessageSupplier?: (supplierId: string) => void;
  onRFQCreated?: boolean;
}

export function MyRFQsSection({
  className = "",
  onCreateRFQ,
  onAssignContract,
  onMessageSupplier,
  onRFQCreated,
}: MyRFQsSectionProps) {
  const [viewingResponses, setViewingResponses] = useState<string | null>(null);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQs();
  }, []);

  // Refresh RFQs when a new one is created
  useEffect(() => {
    if (onRFQCreated !== undefined) {
      fetchRFQs();
    }
  }, [onRFQCreated]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/business-rfqs");
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      } else {
        toast.error("Failed to load RFQs");
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      toast.error("Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = () => {
    if (onCreateRFQ) {
      onCreateRFQ();
    } else {
      console.log("Creating new RFQ");
    }
  };

  const handleViewResponses = (rfqId: string) => {
    setViewingResponses(rfqId);
  };

  const handleEditRFQ = (rfqId: string) => {
    console.log("Editing RFQ:", rfqId);
    // Handle edit RFQ logic
  };

  const handleAcceptResponse = (responseId: string) => {
    console.log("Accepting response:", responseId);
    // Handle accept response logic
  };

  const handleRejectResponse = (responseId: string) => {
    console.log("Rejecting response:", responseId);
    // Handle reject response logic
  };

  const handleMessageSupplier = (supplierId: string) => {
    if (onMessageSupplier) {
      onMessageSupplier(supplierId);
    } else {
      console.log("Messaging supplier:", supplierId);
    }
  };

  const handleAssignContract = (contractData: any) => {
    if (onAssignContract) {
      onAssignContract(contractData);
    }
    console.log("Contract assigned:", contractData);
  };

  if (viewingResponses) {
    return (
      <RFQResponsesView
        rfqId={viewingResponses}
        onBack={() => setViewingResponses(null)}
        onAcceptResponse={handleAcceptResponse}
        onRejectResponse={handleRejectResponse}
        onMessageSupplier={handleMessageSupplier}
        onAssignContract={handleAssignContract}
      />
    );
  }

  // Format RFQ data for display
  const formatRFQForDisplay = (rfq: any) => {
    const minBudget = rfq.min_budget ? parseFloat(rfq.min_budget) : 0;
    const maxBudget = rfq.max_budget ? parseFloat(rfq.max_budget) : 0;
    const budgetDisplay =
      minBudget > 0 && maxBudget > 0
        ? `${formatCurrencySync(minBudget)}-${formatCurrencySync(maxBudget)}`
        : minBudget > 0
        ? `${formatCurrencySync(minBudget)}+`
        : maxBudget > 0
        ? `Up to ${formatCurrencySync(maxBudget)}`
        : "Not specified";

    // Determine status based on response_date
    const today = new Date();
    const deadline = new Date(rfq.response_date);
    const status = deadline < today ? "Closed" : "Open";

    return {
      id: rfq.id,
      title: rfq.title,
      category: rfq.category || "Uncategorized",
      budget: budgetDisplay,
      responses: 0, // TODO: Get actual response count
      deadline: rfq.response_date,
      status: status,
      description: rfq.description || "",
      urgency: rfq.urgency_level || "Medium",
      location: rfq.location || "",
      estimatedQuantity: rfq.estimated_quantity || "",
      expectedDeliveryDate: rfq.expected_delivery_date || "",
    };
  };

  const displayRFQs = rfqs.map(formatRFQForDisplay);

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:p-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
              My RFQs
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Manage your request for quotes
            </p>
          </div>
          <button
            onClick={handleCreateRFQ}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl active:scale-95 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3"
            style={{ color: "#ffffff" }}
          >
            <Plus
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"
              style={{ color: "#ffffff" }}
            />
            <span style={{ color: "#ffffff" }}>
              <span className="hidden sm:inline">Create New RFQ</span>
              <span className="sm:hidden">Create RFQ</span>
            </span>
          </button>
        </div>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-6">
            {displayRFQs.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-lg text-gray-500 dark:text-gray-400">
                  No RFQs yet
                </p>
                <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">
                  Create your first RFQ to get started
                </p>
                {onCreateRFQ && (
                  <button
                    onClick={handleCreateRFQ}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    style={{ color: "#ffffff" }}
                  >
                    <Plus className="h-5 w-5" style={{ color: "#ffffff" }} />
                    <span style={{ color: "#ffffff" }}>Create RFQ</span>
                  </button>
                )}
              </div>
            ) : (
              displayRFQs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="group rounded-xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-4 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800 sm:rounded-2xl sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white sm:text-lg">
                          {rfq.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${
                            rfq.status === "Open"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200"
                              : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                          }`}
                        >
                          {rfq.status}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400 sm:line-clamp-none">
                        {rfq.description}
                      </p>
                      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-6 sm:text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-green-500 sm:h-4 sm:w-4" />
                          <span className="font-semibold">{rfq.budget}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 sm:h-4 sm:w-4" />
                          <span className="font-semibold">
                            {rfq.responses} responses
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0 text-orange-500 sm:h-4 sm:w-4" />
                          <span className="font-semibold">
                            Due: {rfq.deadline}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:ml-6 sm:flex-row sm:border-0 sm:pt-0">
                      <button
                        onClick={() => handleViewResponses(rfq.id)}
                        className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
                      >
                        <span className="hidden sm:inline">View Responses</span>
                        <span className="sm:hidden">View Responses</span>
                      </button>
                      <button
                        onClick={() => handleEditRFQ(rfq.id)}
                        className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
