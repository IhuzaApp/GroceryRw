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
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-4 sm:p-6 md:p-8 text-white shadow-2xl ${className}`}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            {businessName ? (
              <>
                <h1 className="mb-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{businessName}</h1>
                <p className="mb-2 text-xs sm:text-sm font-medium text-green-200">
                  Business Marketplace
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">Business Marketplace</h1>
                <p className="mb-2 text-xs sm:text-sm font-medium text-green-200 opacity-0">
                  {/* Spacer to maintain layout consistency */}
                </p>
              </>
            )}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-green-100 leading-relaxed">
              Discover suppliers, manage orders, and streamline procurement
            </p>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <button
              onClick={handleCreateRFQ}
              className="flex-1 sm:flex-none rounded-lg sm:rounded-xl border border-white/30 bg-white/20 px-2 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm md:text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 flex items-center justify-center"
            >
              <Plus className="mr-1 sm:mr-1.5 md:mr-2 inline h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span>Create RFQ</span>
            </button>
            <button
              onClick={handleFindSuppliers}
              className={`flex-1 sm:flex-none rounded-lg sm:rounded-xl px-2 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm md:text-base font-medium shadow-lg transition-all duration-300 flex items-center justify-center ${
                theme === "dark"
                  ? "bg-gray-800 text-green-400 hover:bg-gray-700 border border-gray-700"
                  : "bg-white text-green-600 hover:bg-green-50"
              }`}
            >
              <Search className="mr-1 sm:mr-1.5 md:mr-2 inline h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span>Find Suppliers</span>
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 md:-translate-y-32 md:translate-x-32 rounded-full bg-white/5"></div>
      <div className="absolute bottom-0 left-0 h-24 w-24 sm:h-36 sm:w-36 md:h-48 md:w-48 -translate-x-12 translate-y-12 sm:-translate-x-18 sm:translate-y-18 md:-translate-x-24 md:translate-y-24 rounded-full bg-white/5"></div>
    </div>
  );
}
