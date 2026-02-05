"use client";

import { QuoteSubmissionForm } from "../QuoteSubmissionForm";
import { SubmittedQuoteDetails } from "../SubmittedQuoteDetails";
import { ExpandedSectionModalList } from "./ExpandedSectionModalList";

interface FilterOption {
  value: string;
  label: string;
}

interface ExpandedSectionModalListWithOverlaysProps {
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
  isQuoteFormOpen: boolean;
  selectedRFQForQuote: any;
  onCloseQuoteForm: () => void;
  onQuoteSuccess: () => void;
  isQuoteDetailsOpen: boolean;
  selectedQuote: any;
  onCloseQuoteDetails: () => void;
}

export function ExpandedSectionModalListWithOverlays({
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
  isQuoteFormOpen,
  selectedRFQForQuote,
  onCloseQuoteForm,
  onQuoteSuccess,
  isQuoteDetailsOpen,
  selectedQuote,
  onCloseQuoteDetails,
}: ExpandedSectionModalListWithOverlaysProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <ExpandedSectionModalList
        sectionId={sectionId}
        title={title}
        Icon={Icon}
        filteredItems={filteredItems}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        selectedFilter={selectedFilter}
        onFilterSelect={onFilterSelect}
        filterOptions={filterOptions}
        onItemClick={onItemClick}
        submittedQuotes={submittedQuotes}
        onViewContract={onViewContract}
        onCreateStore={onCreateStore}
        onClose={onClose}
      />

      {isQuoteFormOpen && selectedRFQForQuote && (
        <div className="fixed inset-0 z-[10001]">
          <QuoteSubmissionForm
            isOpen={isQuoteFormOpen}
            onClose={onCloseQuoteForm}
            rfqId={selectedRFQForQuote.id}
            rfqTitle={selectedRFQForQuote.title}
            onSuccess={onQuoteSuccess}
          />
        </div>
      )}

      {isQuoteDetailsOpen && selectedQuote && selectedRFQForQuote && (
        <div className="fixed inset-0 z-[10001]">
          <SubmittedQuoteDetails
            isOpen={isQuoteDetailsOpen}
            onClose={onCloseQuoteDetails}
            quote={selectedQuote}
            rfqTitle={selectedRFQForQuote.title || "RFQ"}
          />
        </div>
      )}
    </div>
  );
}
