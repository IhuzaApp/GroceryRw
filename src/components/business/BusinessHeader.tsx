"use client";

import { Search, Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface BusinessHeaderProps {
  className?: string;
  onCreateRFQ?: () => void;
  onFindSuppliers?: () => void;
  businessName?: string | null;
}

export function BusinessHeader({
  className = "",
  onCreateRFQ,
  onFindSuppliers,
  businessName,
}: BusinessHeaderProps) {
  const { theme } = useTheme();

  const handleCreateRFQ = () => {
    if (onCreateRFQ) {
      onCreateRFQ();
    } else {
      console.log("Creating new RFQ");
      // Default action if no handler provided
    }
  };

  const handleFindSuppliers = () => {
    if (onFindSuppliers) {
      onFindSuppliers();
    } else {
      console.log("Finding suppliers");
      // Default action if no handler provided
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-4 text-white shadow-2xl sm:rounded-2xl sm:p-6 md:p-8 ${className}`}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex-1">
            {businessName ? (
              <>
                <h1 className="mb-1 text-xl font-bold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                  {businessName}
                </h1>
                <p className="mb-2 text-xs font-medium text-green-200 sm:text-sm">
                  Business Marketplace
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-1 text-xl font-bold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                  Business Marketplace
                </h1>
                <p className="mb-2 text-xs font-medium text-green-200 opacity-0 sm:text-sm">
                  {/* Spacer to maintain layout consistency */}
                </p>
              </>
            )}
            <p className="text-xs leading-relaxed text-green-100 sm:text-sm md:text-base lg:text-lg">
              Discover suppliers, manage orders, and streamline procurement
            </p>
          </div>
          <div className="flex w-full flex-row gap-2 sm:w-auto sm:gap-3 md:gap-4">
            <button
              onClick={handleCreateRFQ}
              className="flex flex-1 items-center justify-center rounded-lg border border-white/30 bg-white/20 px-2 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 sm:flex-none sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base"
            >
              <Plus className="mr-1 inline h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4 md:mr-2 md:h-5 md:w-5" />
              <span>Create RFQ</span>
            </button>
            <button
              onClick={handleFindSuppliers}
              className={`flex flex-1 items-center justify-center rounded-lg px-2 py-2 text-xs font-medium shadow-lg transition-all duration-300 sm:flex-none sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                theme === "dark"
                  ? "border border-gray-700 bg-gray-800 text-green-400 hover:bg-gray-700"
                  : "bg-white text-green-600 hover:bg-green-50"
              }`}
            >
              <Search className="mr-1 inline h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4 md:mr-2 md:h-5 md:w-5" />
              <span>Find Suppliers</span>
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/5 sm:h-48 sm:w-48 sm:-translate-y-24 sm:translate-x-24 md:h-64 md:w-64 md:-translate-y-32 md:translate-x-32"></div>
      <div className="sm:-translate-x-18 sm:translate-y-18 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-white/5 sm:h-36 sm:w-36 md:h-48 md:w-48 md:-translate-x-24 md:translate-y-24"></div>
    </div>
  );
}
