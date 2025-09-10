import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

interface MobileSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSearchModal({
  open,
  onClose,
}: MobileSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch(searchQuery);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Refresh cart count
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with transparency */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          hasSearched && searchResults.length > 0
            ? "bg-black bg-opacity-75"
            : "bg-black bg-opacity-50"
        }`}
        onClick={onClose}
      />

      {/* Search Container */}
      <div
        className={`relative h-full transition-all duration-500 ${
          hasSearched && searchResults.length > 0
            ? "bg-white dark:bg-gray-900"
            : "bg-transparent"
        }`}
      >
        {/* Header - Only visible when showing results */}
        {hasSearched && (
          <div className="flex items-center justify-between bg-white p-4 shadow-sm dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Search Results
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div
          className={`flex-1 overflow-y-auto transition-all duration-500 ${
            hasSearched && searchResults.length > 0
              ? "bg-white dark:bg-gray-900"
              : "bg-transparent"
          }`}
        >
          {/* Centered Search Input - Only when not showing results */}
          {!hasSearched && !isSearching && (
            <div className="flex min-h-screen items-center justify-center px-4">
              <div className="w-full max-w-lg">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchSubmit()
                    }
                    placeholder="What are you looking for?"
                    className="w-full rounded-2xl border-2 border-gray-300 bg-white px-8 py-6 text-xl text-gray-900 placeholder-gray-500 shadow-xl transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-green-500 p-4 text-white shadow-lg transition-all duration-200 hover:bg-green-600 hover:shadow-xl"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top Search Input - When showing results */}
          {hasSearched && (
            <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform rounded-full bg-green-500 p-2 text-white transition-colors hover:bg-green-600"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  Searching...
                </span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isSearching && hasSearched && searchResults.length > 0 && (
            <div className="space-y-4 p-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  {result.type === "product" && (
                    <div className="flex items-center space-x-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl text-gray-500">🛍️</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-gray-800 dark:text-white">
                          {result.name}
                        </h4>
                        <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                          {result.shop_name}
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${result.price}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleAddToCart(result.id)}
                          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/shops/${result.shop_id}`)
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          View Shop
                        </button>
                      </div>
                    </div>
                  )}

                  {result.type === "shop" && (
                    <div className="flex items-center space-x-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl text-gray-500">🏪</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-gray-800 dark:text-white">
                          {result.name}
                        </h4>
                        <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                          {result.address}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.category}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/shops/${result.id}`)}
                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                      >
                        View Shop
                      </button>
                    </div>
                  )}

                  {result.type === "recipe" && (
                    <div className="flex items-center space-x-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl text-gray-500">📖</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-gray-800 dark:text-white">
                          {result.name}
                        </h4>
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {result.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cooking time: {result.cooking_time}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/Recipes/${result.id}`)}
                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                      >
                        View Recipe
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-500"
                  >
                    <path
                      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mb-1 text-lg text-gray-500 dark:text-gray-400">
                  No results found for
                </p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  "{searchQuery}"
                </p>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Try different keywords or check spelling
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
