import React, { useState, useEffect, useRef } from "react";
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
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTypeFilterMenu, setShowTypeFilterMenu] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: "All", value: "" },
    { label: "Regular Orders", value: "regular" },
    { label: "Reel Orders", value: "reel" },
    { label: "Restaurant Orders", value: "restaurant" },
  ];

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  const getTypeFilterLabel = () => {
    const selectedTab = tabs.find((tab) => tab.value === typeFilter);
    return selectedTab ? selectedTab.label : "All Orders";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeFilterRef.current &&
        !typeFilterRef.current.contains(event.target as Node)
      ) {
        setShowTypeFilterMenu(false);
      }
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`relative z-10 rounded-2xl border shadow-lg backdrop-blur-xl transition-colors duration-300 ${
        theme === "dark"
          ? "border-gray-700/50 bg-gray-900/40 shadow-gray-900/50"
          : "border-white/40 bg-white/60 shadow-gray-200/50"
      } mb-8 overflow-hidden`}
    >
      {/* Mobile: Order Type Dropdown and Search */}
      <div className="flex flex-col gap-4 p-5 md:hidden">
        {/* Order Type Dropdown */}
        <div className="relative" ref={typeFilterRef}>
          <button
            onClick={() => setShowTypeFilterMenu(!showTypeFilterMenu)}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{getTypeFilterLabel()}</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                showTypeFilterMenu ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showTypeFilterMenu && (
            <div
              className={`absolute left-0 right-0 z-10 mt-2 rounded-lg border shadow-lg ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setTypeFilter(tab.value);
                      setShowTypeFilterMenu(false);
                    }}
                    className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                      typeFilter === tab.value
                        ? theme === "dark"
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700"
                        : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
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
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:bg-gray-800"
                : "border-gray-200 bg-white/50 text-gray-900 placeholder-gray-400 focus:bg-white"
            }`}
          />
        </div>
      </div>

      {/* Desktop: Tabs and Actions */}
      <div className="hidden flex-col gap-4 border-b border-gray-200/50 p-5 dark:border-gray-700/50 md:flex md:flex-row md:items-center md:justify-between">
        {/* Tabs - Desktop Segmented Control */}
        <div
          className={`flex items-center space-x-1 rounded-xl p-1 ${
            theme === "dark" ? "bg-gray-800/60" : "bg-gray-100/80"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`relative rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                typeFilter === tab.value
                  ? theme === "dark"
                    ? "bg-gray-700 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Filter Dropdown */}
          <div className="relative" ref={statusFilterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center space-x-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/80 text-gray-200 hover:bg-gray-700 hover:shadow-lg"
                  : "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filter</span>
            </button>
            {showFilterMenu && (
              <div
                className={`absolute right-0 z-10 mt-2 w-48 rounded-lg border shadow-lg ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                        statusFilter === option.value
                          ? theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-700"
                          : theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`inline-flex items-center space-x-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/80 text-gray-200 hover:bg-gray-700 hover:shadow-lg"
                : "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            <span>Sort</span>
          </button>

          {/* Export Button */}
          <button
            className={`inline-flex items-center space-x-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${
              theme === "dark"
                ? "border-emerald-500/30 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-800/60 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100 hover:shadow-md"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Desktop: Search Bar */}
      <div className="hidden px-5 pb-5 md:block">
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className={`h-5 w-5 transition-colors duration-300 ${
                theme === "dark"
                  ? "text-gray-500 group-focus-within:text-emerald-400"
                  : "text-gray-400 group-focus-within:text-emerald-600"
              }`}
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
            className={`block w-full rounded-xl border py-3 pl-11 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
              theme === "dark"
                ? "border-gray-700/50 bg-gray-800/40 text-gray-100 placeholder-gray-500 focus:border-emerald-500/50 focus:bg-gray-800/80"
                : "border-gray-200 bg-white/60 text-gray-900 placeholder-gray-400 focus:border-emerald-500/30 focus:bg-white"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;
