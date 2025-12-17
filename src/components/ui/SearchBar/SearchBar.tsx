import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/navigation";
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
        <div className="absolute z-50 mt-2 w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {/* Product/Shop Image */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={result.type === "product" ? result.image : result.logo}
                    alt={result.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/images/placeholder-product.png";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Product/Shop Name */}
                  <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {result.name}
                  </div>

                  {/* Product Details */}
                  {result.type === "product" && (
                    <div className="space-y-1">
                      {/* Supermarket Name */}
                      {result.shopName && (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 overflow-hidden rounded">
                            <img
                              src={result.shopImage}
                              alt={result.shopName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "/assets/images/placeholder-shop.png";
                              }}
                            />
                          </div>
                          <span className="truncate text-xs text-gray-600 dark:text-gray-400">
                            {result.shopName}
                          </span>
                        </div>
                      )}

                      {/* Price and Stock Status */}
                      <div className="flex items-center justify-between">
                        {result.price && (
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrencySync(result.price)}
                            {result.measurementUnit && (
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                /{result.measurementUnit}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          {result.inStock ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add to cart functionality would go here
                                console.log("Add to cart:", result.id);
                              }}
                              className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/40"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to supermarket page
                                window.open(
                                  `/shops/${result.shopId}`,
                                  "_blank"
                                );
                              }}
                              className="rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-violet-600 hover:shadow-purple-500/40"
                            >
                              Check Supermarket
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      {result.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.category}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shop/Store Details */}
                  {(result.type === "shop" || result.type === "store") && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {result.type === "store" && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Store
                          </span>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            result.isOpen
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {result.isOpen ? "Open" : "Closed"}
                        </span>
                        {result.rating && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>★</span>
                            <span>{result.rating.toFixed(1)}</span>
                            <span>({result.reviewCount})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Show more results indicator */}
          {results.length >= 10 && (
            <div className="border-t border-gray-100 px-4 py-2 text-center dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing top {results.length} results
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
