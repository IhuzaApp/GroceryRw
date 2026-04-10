import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/router";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface SearchResult {
  id: string;
  name: string;
  type: "product" | "shop" | "store";
  image?: string;
  logo?: string;
  price?: number;
  description?: string;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  deliveryFee?: number;
  minimumOrder?: number;
  // Product-specific fields
  shopName?: string;
  shopImage?: string;
  category?: string;
  inStock?: boolean;
  quantity?: number;
  measurementUnit?: string;
  shopId?: string;
}

export default function SearchBar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchItems = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/queries/search?term=${encodeURIComponent(term)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debounced search
    searchTimeout.current = setTimeout(() => {
      searchItems(value);
      setShowResults(true);
    }, 300); // 300ms debounce
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchTerm("");
    if (result.type === "product") {
      // Redirect to the shop page for the product with product ID as query parameter
      router.push(`/shops/${result.shopId}?highlight=${result.id}`);
    } else if (result.type === "store") {
      // Redirect to the store page
      router.push(`/stores/${result.id}`);
    } else {
      router.push(`/shops/${result.id}`);
    }
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <div className="relative group">
        <div className={`relative flex items-center gap-3 rounded-2xl border transition-all duration-500 p-2 pl-5 pr-2 backdrop-blur-xl ${
          isDark 
            ? "border-white/10 bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] focus-within:border-emerald-500/50 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_40px_-12px_rgba(16,185,129,0.3)]" 
            : "border-black/5 bg-gray-100/50 shadow-sm focus-within:border-emerald-500/40 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-emerald-500/10"
        } focus-within:scale-[1.02]`}>
          <svg className={`h-5 w-5 transition-colors duration-300 ${isDark ? "text-white/30 group-focus-within:text-emerald-400" : "text-gray-400 group-focus-within:text-emerald-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products and shops..."
            className={`flex-1 bg-transparent border-none outline-none p-0 text-sm transition-all placeholder:transition-opacity ${
              isDark ? "text-white placeholder:text-white/30" : "text-gray-900 placeholder:text-gray-400"
            }`}
          />
          <div className="flex shrink-0 items-center justify-center w-8 h-8">
            {isLoading && (
              <div className="relative flex h-5 w-5 items-center justify-center">
                <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-500 opacity-20"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className={`absolute z-50 mt-4 w-full overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-500 ${
          isDark 
            ? "border-white/10 bg-[#0A0A0A] backdrop-blur-3xl" 
            : "border-gray-200 bg-white"
        }`}>
          <div className="max-h-[32rem] overflow-y-auto p-4 custom-scrollbar">
            <div className="mb-2 px-4 py-2">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/30" : "text-gray-400"}`}>
                Top results
              </p>
            </div>
            
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`group relative flex w-full cursor-pointer items-center gap-4 rounded-3xl p-3 transition-all duration-300 ${
                    isDark 
                      ? "hover:bg-white/5 active:bg-white/10" 
                      : "hover:bg-gray-100/50 active:bg-gray-200/50"
                  }`}
                >
                  {/* Product/Shop Image */}
                  <div className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border transition-transform duration-500 group-hover:scale-105 ${
                    isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"
                  }`}>
                    <img
                      src={
                        result.type === "product"
                          ? result.image || "/images/groceryPlaceholder.png"
                          : result.logo || "/images/groceryPlaceholder.png"
                      }
                      alt={result.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                       <span className={`truncate text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                        {result.name}
                      </span>
                      {result.type === "store" && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-500 border border-blue-500/20">
                          Store
                        </span>
                      )}
                    </div>

                    {result.type === "product" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={result.shopImage || "/images/groceryPlaceholder.png"} 
                            className="h-4 w-4 rounded-full border border-white/10" 
                            alt={result.shopName} 
                          />
                          <span className={`truncate text-[10px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {result.shopName}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-black text-emerald-500">
                             {formatCurrencySync(result.price || 0)}
                             <span className="ml-1 text-[10px] font-medium opacity-50">/{result.measurementUnit}</span>
                          </p>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Add to cart:", result.id);
                            }}
                            className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                              result.inStock 
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:translate-y-[-1px] active:scale-95" 
                                : "bg-white/10 text-gray-400 border border-white/10"
                            }`}
                          >
                            {result.inStock ? "Add" : "Check Shop"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1">
                            <span className="text-[10px] text-amber-400">★</span>
                            <span className={`text-[10px] font-bold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              {result.rating?.toFixed(1) || "N/A"}
                            </span>
                         </div>
                         <span className={`h-1 w-1 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                         <span className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {result.isOpen ? "Open now" : "Closed"}
                         </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Show more results indicator */}
          {results.length >= 10 && (
            <div className={`border-t px-6 py-3 text-center ${isDark ? "border-white/5" : "border-gray-100"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest opacity-30`}>
                Showing top {results.length} results
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
