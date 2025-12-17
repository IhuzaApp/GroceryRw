"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
} from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface Contract {
  id: string;
  contractId: string;
  title: string;
  supplierName: string;
  supplierCompany: string;
  contractType: string;
  status:
    | "draft"
    | "pending"
    | "active"
    | "completed"
    | "terminated"
    | "expired";
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  paymentSchedule: string;
  progress: number;
}

interface ContractsSectionProps {
  className?: string;
  onViewContract?: (contract: Contract) => void;
  onMessageSupplier?: (supplierId: string) => void;
}

export function ContractsSection({
  className = "",
  onViewContract,
  onMessageSupplier,
}: ContractsSectionProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch("/api/queries/business-contracts");
      // const data = await response.json();
      // setContracts(data.contracts || []);
      setContracts([]);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAcceptedQuotes = () => {
    console.log("Viewing accepted quotes");
    // Handle view accepted quotes logic
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "active":
        return {
          icon: CheckCircle,
          className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          text: "Active",
        };
      case "completed":
        return {
          icon: CheckCircle,
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
          text: "Completed",
        };
      case "terminated":
        return {
          icon: XCircle,
          className:
            "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          text: "Terminated",
        };
      case "expired":
        return {
          icon: AlertCircle,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
          text: "Expired",
        };
      default:
        return {
          icon: Clock,
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
          text: "Pending",
        };
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

  if (loading) {
    return (
      <div className={`space-y-4 sm:space-y-8 ${className}`}>
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading contracts...
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
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 sm:p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Active Contracts
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Manage your supplier contracts
          </p>
        </div>
        <div className="p-4 sm:p-6 md:p-8">
          {contracts.length === 0 ? (
            <div className="py-8 text-center sm:py-12 md:py-16">
              <div className="relative inline-block">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 sm:mb-6 sm:h-20 sm:w-20 sm:rounded-2xl md:h-24 md:w-24">
                  <FileText className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </div>
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 sm:-right-2 sm:-top-2 sm:h-6 sm:w-6">
                  <span className="text-[10px] font-bold text-white sm:text-xs">
                    0
                  </span>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                No active contracts yet
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 sm:mb-6 sm:text-base">
                Contracts will appear here once quotes are accepted
              </p>
              <button
                onClick={handleViewAcceptedQuotes}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl active:scale-95 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                style={{ color: "#ffffff" }}
              >
                <span style={{ color: "#ffffff" }}>View Accepted Quotes</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {contracts.map((contract) => {
                const statusBadge = getStatusBadge(contract.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={contract.id}
                    className="group overflow-hidden rounded-xl border-2 border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-800 sm:rounded-2xl"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header Section */}
                      <div className="mb-4 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                              {contract.title}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${statusBadge.className}`}
                            >
                              <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {statusBadge.text}
                            </span>
                          </div>
                          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            {contract.contractType} • {contract.supplierCompany}
                          </p>
                          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                              <span className="truncate">
                                {formatDate(contract.startDate)} -{" "}
                                {formatDate(contract.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <DollarSign className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                              <span>
                                {formatCurrencySync(contract.totalValue)}{" "}
                                {contract.currency}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <Clock className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                              <span>{contract.paymentSchedule}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {contract.progress !== undefined && (
                        <div className="mb-4 sm:mb-4">
                          <div className="mb-1.5 flex items-center justify-between text-xs sm:mb-2 sm:text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {contract.progress}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:h-2.5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                              style={{ width: `${contract.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:border-0 sm:pt-0">
                        <button
                          onClick={() => onViewContract?.(contract)}
                          className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-green-500 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-700 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                        <button
                          onClick={() =>
                            onMessageSupplier?.(contract.supplierName)
                          }
                          className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-green-500 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-700 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Message</span>
                          <span className="sm:hidden">Msg</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:border-green-500 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-700 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm">
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Download</span>
                          <span className="sm:hidden">Download</span>
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
