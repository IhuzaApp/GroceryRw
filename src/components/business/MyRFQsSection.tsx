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
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My RFQs
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your request for quotes
            </p>
          </div>
          <button
            onClick={handleCreateRFQ}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Create New RFQ
          </button>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {displayRFQs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  No RFQs yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                  Create your first RFQ to get started
                </p>
                {onCreateRFQ && (
                  <button
                    onClick={handleCreateRFQ}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Create RFQ
                  </button>
                )}
              </div>
            ) : (
              displayRFQs.map((rfq) => (
              <div
                key={rfq.id}
                className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                        {rfq.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          rfq.status === "Open"
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200"
                            : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {rfq.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{rfq.budget}</span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">
                          {rfq.responses} responses
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">
                          Due: {rfq.deadline}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 flex gap-3">
                    <button
                      onClick={() => handleViewResponses(rfq.id)}
                      className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      View Responses
                    </button>
                    <button
                      onClick={() => handleEditRFQ(rfq.id)}
                      className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
