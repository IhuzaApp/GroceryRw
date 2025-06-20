import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  type: "product" | "shop";
  image?: string;
  logo?: string;
  price?: number;
  description?: string;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  deliveryFee?: number;
  minimumOrder?: number;
}

export default function SearchBar() {
  const { theme } = useTheme();
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
      router.push(`/product/${result.id}`);
    } else {
      router.push(`/shop/${result.id}`);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search products and shops..."
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm transition-all duration-200 placeholder:text-gray-500 focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 dark:text-gray-300">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full">
                <img
                  src={result.type === "product" ? result.image : result.logo}
                  alt={result.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {result.type === "product" ? "Product" : "Shop"}
                  </div>
                  {result.rating && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>★</span>
                      <span>{result.rating.toFixed(1)}</span>
                      <span>({result.reviewCount})</span>
                    </div>
                  )}
                </div>
                {result.type === "product" && result.price && (
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    ${result.price.toFixed(2)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
