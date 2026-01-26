import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";

interface BatchFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export interface FilterState {
  orderType?: string;
  status?: string;
  urgency?: string;
  dateRange?: string;
  search?: string;
}

export function BatchFilters({ onFilterChange, onRefresh, isRefreshing = false }: BatchFiltersProps) {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterState>({});
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);

  const orderTypes = [
    { value: "regular", label: "Regular Order" },
    { value: "reel", label: "Reel Order" },
    { value: "restaurant", label: "Restaurant Order" },
    { value: "store", label: "Store Order" },
    { value: "plasone", label: "Plas One Order", disabled: true },
  ];

  const orderStatuses = [
    {
      value: "accepted",
      label: "Accepted",
      description: "Shopper accepted the batch",
    },
    {
      value: "picked",
      label: "Picked Up",
      description: "Items picked from store",
    },
    { value: "shopping", label: "Shopping", description: "Currently shopping" },
    {
      value: "on_the_way",
      label: "On The Way",
      description: "En route to customer",
    },
    {
      value: "at_customer",
      label: "At Customer",
      description: "Arrived at delivery location",
    },
    { value: "delivered", label: "Delivered", description: "Order completed" },
  ];

  const urgencyLevels = [
    { value: "newly_accepted", label: "Newly Accepted" },
    { value: "late", label: "Late (Overdue)" },
    { value: "urgent", label: "Urgent (≤10 min)" },
    { value: "okay", label: "Still Okay" },
  ];

  const getStatusIcon = (value: string) => {
    switch (value) {
      case "accepted":
        return (
          <svg
            className="h-5 w-5 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "picked":
        return (
          <svg
            className="h-5 w-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "shopping":
        return (
          <svg
            className="h-5 w-5 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        );
      case "on_the_way":
        return (
          <svg
            className="h-5 w-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "at_customer":
        return (
          <svg
            className="h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "delivered":
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getUrgencyIcon = (value: string) => {
    switch (value) {
      case "newly_accepted":
        return (
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case "late":
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case "urgent":
        return (
          <svg
            className="h-5 w-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "okay":
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const updateFilter = (key: keyof FilterState, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowOrderTypeDropdown(false);
        setShowStatusDropdown(false);
        setShowUrgencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      {/* Left side - Filter buttons (Hidden on mobile) */}
      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        {/* Order Type Filter */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setShowOrderTypeDropdown(!showOrderTypeDropdown)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            } ${
              filters.orderType
                ? theme === "dark"
                  ? "ring-2 ring-blue-500"
                  : "ring-2 ring-blue-400"
                : ""
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            {filters.orderType
              ? orderTypes.find((t) => t.value === filters.orderType)?.label ||
                "Order Type"
              : "Order Type"}
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showOrderTypeDropdown && (
            <div
              className={`absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border shadow-lg ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="p-2">
                {/* Clear filter option */}
                {filters.orderType && (
                  <button
                    onClick={() => {
                      updateFilter("orderType", undefined);
                      setShowOrderTypeDropdown(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      theme === "dark"
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-gray-100"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Filter
                  </button>
                )}

                {/* Order type options */}
                {orderTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      if (!type.disabled) {
                        updateFilter("orderType", type.value);
                        setShowOrderTypeDropdown(false);
                      }
                    }}
                    disabled={type.disabled}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      filters.orderType === type.value
                        ? theme === "dark"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                        : type.disabled
                        ? theme === "dark"
                          ? "cursor-not-allowed text-gray-500"
                          : "cursor-not-allowed text-gray-400"
                        : theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type.value === "regular" && (
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    )}
                    {type.value === "reel" && (
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
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {type.value === "restaurant" && (
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                        />
                      </svg>
                    )}
                    {type.value === "store" && (
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                    {type.value === "plasone" && (
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    )}
                    <span>{type.label}</span>
                    {type.disabled && (
                      <span className="ml-auto text-xs">(Coming Soon)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            } ${
              filters.status
                ? theme === "dark"
                  ? "ring-2 ring-blue-500"
                  : "ring-2 ring-blue-400"
                : ""
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {filters.status
              ? orderStatuses.find((s) => s.value === filters.status)?.label ||
                "Status"
              : "Status"}
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showStatusDropdown && (
            <div
              className={`absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border shadow-lg ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="p-2">
                {/* Clear filter option */}
                {filters.status && (
                  <button
                    onClick={() => {
                      updateFilter("status", undefined);
                      setShowStatusDropdown(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      theme === "dark"
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-gray-100"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Filter
                  </button>
                )}

                {/* Status options */}
                {orderStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      updateFilter("status", status.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      filters.status === status.value
                        ? theme === "dark"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                        : theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getStatusIcon(status.value)}
                    <div className="flex-1">
                      <div className="font-medium">{status.label}</div>
                      <div
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {status.description}
                      </div>
                    </div>
                    {filters.status === status.value && (
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Urgency Filter */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setShowUrgencyDropdown(!showUrgencyDropdown)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            } ${
              filters.urgency
                ? theme === "dark"
                  ? "ring-2 ring-blue-500"
                  : "ring-2 ring-blue-400"
                : ""
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {filters.urgency
              ? urgencyLevels.find((u) => u.value === filters.urgency)?.label ||
                "Priority"
              : "Priority"}
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUrgencyDropdown && (
            <div
              className={`absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border shadow-lg ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="p-2">
                {/* Clear filter option */}
                {filters.urgency && (
                  <button
                    onClick={() => {
                      updateFilter("urgency", undefined);
                      setShowUrgencyDropdown(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      theme === "dark"
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-gray-100"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Filter
                  </button>
                )}

                {/* Urgency level options */}
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => {
                      updateFilter("urgency", level.value);
                      setShowUrgencyDropdown(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      filters.urgency === level.value
                        ? theme === "dark"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                        : theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getUrgencyIcon(level.value)}
                    <div className="flex-1">
                      <div className="font-medium">{level.label}</div>
                      <div
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {level.value === "newly_accepted" &&
                          "Just accepted batches"}
                        {level.value === "late" && "Past delivery time"}
                        {level.value === "urgent" &&
                          "Less than 10 minutes left"}
                        {level.value === "okay" && "No immediate rush"}
                      </div>
                    </div>
                    {filters.urgency === level.value && (
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Filter Chip */}
        {filters.dateRange && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200"
                : "border-gray-300 bg-gray-50 text-gray-700"
            }`}
          >
            <span className="text-xs">Date added: {filters.dateRange}</span>
            <button
              onClick={() => updateFilter("dateRange", undefined)}
              className="hover:text-red-500"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* General Filters Button */}
        <button
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            theme === "dark"
              ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
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
          Filters
        </button>
      </div>

      {/* Right side - Search and Refresh (Hidden on mobile, shown on desktop) */}
      <div className="hidden w-full flex-1 items-center gap-2 sm:flex sm:min-w-[200px] sm:max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className={`w-full rounded-lg border px-4 py-2 pl-10 text-sm transition-colors ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            }`}
          />
          <svg
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
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
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 active:bg-gray-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            } ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Refresh active batches"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}
