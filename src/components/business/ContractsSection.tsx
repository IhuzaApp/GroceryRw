"use client";

import { FileText } from "lucide-react";

interface ContractsSectionProps {
  className?: string;
}

export function ContractsSection({ className = "" }: ContractsSectionProps) {
  const handleViewAcceptedQuotes = () => {
    console.log("Viewing accepted quotes");
    // Handle view accepted quotes logic
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Active Contracts
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your supplier contracts
          </p>
        </div>
        <div className="p-8">
          <div className="py-16 text-center">
            <div className="relative">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                <span className="text-xs font-bold text-white">0</span>
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              No active contracts yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Contracts will appear here once quotes are accepted
            </p>
            <button
              onClick={handleViewAcceptedQuotes}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
              style={{ color: "#ffffff" }}
            >
              <span style={{ color: "#ffffff" }}>View Accepted Quotes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
