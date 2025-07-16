import React from "react";
import { Input, InputGroup, SelectPicker } from "rsuite";
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
    <div className="mb-6 space-y-4">
      {/* Search Filter - Always visible */}
      <div>
        <label
          className={`mb-2 block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Search Invoices
        </label>
        <InputGroup>
          <Input
            placeholder="Search by invoice number, customer, shop..."
            value={searchTerm}
            onChange={setSearchTerm}
            className={theme === "dark" ? "bg-gray-700 text-gray-100" : ""}
          />
        </InputGroup>
      </div>

      {/* Status and Type Filters - Hidden on mobile */}
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        <div>
          <label
            className={`mb-2 block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Status Filter
          </label>
          <SelectPicker
            data={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "")}
            placeholder="Filter by status"
            className={theme === "dark" ? "bg-gray-700 text-gray-100" : ""}
            cleanable={false}
          />
        </div>

        <div>
          <label
            className={`mb-2 block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Order Type
          </label>
          <SelectPicker
            data={typeOptions}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "")}
            placeholder="Filter by type"
            className={theme === "dark" ? "bg-gray-700 text-gray-100" : ""}
            cleanable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;
