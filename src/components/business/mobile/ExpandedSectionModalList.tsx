"use client";

import { Search, Filter, X, Plus } from "lucide-react";
import {
  RFQCard,
  QuoteCard,
  OrderCard,
  ServiceCard,
  StoreCard,
  ContractCard,
  RFQOpportunityCard,
} from "./ExpandedSectionModalCards";

interface FilterOption {
  value: string;
  label: string;
}

interface ExpandedSectionModalListProps {
  sectionId: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  filteredItems: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedFilter: string;
  onFilterSelect: (value: string) => void;
  filterOptions: FilterOption[];
  onItemClick: (item: any) => void;
  submittedQuotes?: Record<string, any>;
  onViewContract?: (contractId: string) => void;
  onCreateStore?: () => void;
  onClose: () => void;
}

export function ExpandedSectionModalList({
  sectionId,
  title,
  Icon,
  filteredItems,
  loading,
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  selectedFilter,
  onFilterSelect,
  filterOptions,
  onItemClick,
  submittedQuotes = {},
  onViewContract,
  onCreateStore,
  onClose,
}: ExpandedSectionModalListProps) {
  const emptyMessage =
    searchTerm || selectedFilter !== "all"
      ? "Try adjusting your search or filters"
      : sectionId === "rfqs"
      ? "Create your first RFQ to get started"
      : sectionId === "quotes"
      ? "No quotes submitted yet"
      : sectionId === "orders"
      ? "No orders found"
      : sectionId === "services"
      ? "No services available"
      : sectionId === "stores"
      ? "No stores created yet"
      : sectionId === "rfq-opportunities"
      ? "No RFQ opportunities available"
      : "No contracts found";

  return (
    <div
      className="mt-[5vh] flex h-[92vh] flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {filteredItems.length} items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sectionId === "stores" && onCreateStore && (
            <button
              onClick={onCreateStore}
              className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 active:scale-95 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Create store
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/50">
        <div className="mb-2 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-offset-gray-800"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={onToggleFilters}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              showFilters || selectedFilter !== "all"
                ? "bg-green-500 text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <Filter className="mr-1 inline h-4 w-4" />
            Filter
          </button>
        </div>
        {showFilters && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterSelect(option.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedFilter === option.value
                    ? "bg-green-500 text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="animate-pulse space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="h-6 w-16 rounded-md bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-3 flex gap-4">
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Icon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="mb-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
              No {title.toLowerCase()} found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {sectionId === "rfqs" &&
              filteredItems.map((rfq: any) => (
                <RFQCard key={rfq.id} rfq={rfq} onView={onItemClick} />
              ))}
            {sectionId === "rfq-opportunities" &&
              filteredItems.map((rfq: any) => (
                <RFQOpportunityCard
                  key={rfq.id}
                  rfq={rfq}
                  onView={onItemClick}
                  submittedQuotes={submittedQuotes}
                />
              ))}
            {sectionId === "quotes" &&
              filteredItems.map((quote: any) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onView={onItemClick}
                />
              ))}
            {sectionId === "orders" &&
              filteredItems.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onView={onItemClick}
                />
              ))}
            {sectionId === "services" &&
              filteredItems.map((service: any) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onView={onItemClick}
                />
              ))}
            {sectionId === "stores" &&
              filteredItems.map((store: any) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onView={onItemClick}
                />
              ))}
            {sectionId === "contracts" &&
              filteredItems.map((contract: any) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onView={
                    onViewContract
                      ? () => onViewContract(contract.id)
                      : onItemClick
                  }
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
