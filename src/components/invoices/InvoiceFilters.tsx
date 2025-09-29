import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}) => {
  const { theme } = useTheme();

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  const typeOptions = [
    { label: "All Types", value: "" },
    { label: "Regular Orders", value: "regular" },
    { label: "Reel Orders", value: "reel" },
  ];

  return (
    <div
      className={`rounded-2xl border ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800/50"
          : "border-gray-200 bg-white shadow-sm"
      } mb-6 p-6`}
    >
      {/* Search Filter */}
      <div className="mb-6">
        <label
          className={`mb-3 block text-sm font-semibold ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Search Invoices
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by invoice number, customer, shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full rounded-xl border py-3 pl-10 pr-3 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
      </div>

      {/* Status and Type Filters */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            className={`mb-3 block text-sm font-semibold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`block w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={`mb-3 block text-sm font-semibold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Order Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`block w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter || typeFilter) && (
        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Active filters:
            </span>
            {searchTerm && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  theme === "dark"
                    ? "border border-blue-500/50 bg-blue-900/30 text-blue-400"
                    : "border border-blue-200 bg-blue-100 text-blue-800"
                }`}
              >
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50"
                >
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            )}
            {statusFilter && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  theme === "dark"
                    ? "border border-green-500/50 bg-green-900/30 text-green-400"
                    : "border border-green-200 bg-green-100 text-green-800"
                }`}
              >
                Status:{" "}
                {statusOptions.find((opt) => opt.value === statusFilter)?.label}
                <button
                  onClick={() => setStatusFilter("")}
                  className="ml-2 flex h-4 w-4 items-center justify-center rounded-full hover:bg-green-200 dark:hover:bg-green-800/50"
                >
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            )}
            {typeFilter && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  theme === "dark"
                    ? "border border-purple-500/50 bg-purple-900/30 text-purple-400"
                    : "border border-purple-200 bg-purple-100 text-purple-800"
                }`}
              >
                Type:{" "}
                {typeOptions.find((opt) => opt.value === typeFilter)?.label}
                <button
                  onClick={() => setTypeFilter("")}
                  className="ml-2 flex h-4 w-4 items-center justify-center rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/50"
                >
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setTypeFilter("");
              }}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;
