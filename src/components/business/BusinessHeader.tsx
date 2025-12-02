"use client";

import { Search, Plus } from "lucide-react";
import { useEffect } from "react";

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
  // Log business name when it changes
  useEffect(() => {
    console.log("🎯 BusinessHeader - Received businessName prop:", businessName);
  }, [businessName]);

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
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl ${className}`}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            {businessName ? (
              <>
                <h1 className="mb-1 text-4xl font-bold">{businessName}</h1>
                <p className="mb-2 text-sm font-medium text-green-200">
                  Business Marketplace
                </p>
              </>
            ) : (
              <h1 className="mb-2 text-4xl font-bold">Business Marketplace</h1>
            )}
            <p className="text-lg text-green-100">
              Discover suppliers, manage orders, and streamline procurement
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCreateRFQ}
              className="rounded-xl border border-white/30 bg-white/20 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
            >
              <Plus className="mr-2 inline h-5 w-5" />
              Create RFQ
            </button>
            <button
              onClick={handleFindSuppliers}
              className="rounded-xl bg-white px-6 py-3 font-medium text-green-600 shadow-lg transition-all duration-300 hover:bg-green-50"
            >
              <Search className="mr-2 inline h-5 w-5" />
              Find Suppliers
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-white/5"></div>
      <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-white/5"></div>
    </div>
  );
}
