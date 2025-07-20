import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

interface MobileSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSearchModal({ open, onClose }: MobileSearchModalProps) {
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
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
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
            ? 'bg-black bg-opacity-75' 
            : 'bg-black bg-opacity-50'
        }`}
        onClick={onClose}
      />
      
      {/* Search Container */}
      <div className={`relative h-full transition-all duration-500 ${
        hasSearched && searchResults.length > 0 
          ? 'bg-white dark:bg-gray-900' 
          : 'bg-transparent'
      }`}>
        
        {/* Header - Only visible when showing results */}
        {hasSearched && (
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Search Results
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto transition-all duration-500 ${
          hasSearched && searchResults.length > 0 
            ? 'bg-white dark:bg-gray-900' 
            : 'bg-transparent'
        }`}>
          
          {/* Centered Search Input - Only when not showing results */}
          {!hasSearched && !isSearching && (
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="w-full max-w-lg">

                
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    placeholder="What are you looking for?"
                    className="w-full px-8 py-6 text-xl border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 shadow-xl"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top Search Input - When showing results */}
          {hasSearched && (
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Search..."
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400 text-lg">Searching...</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isSearching && hasSearched && searchResults.length > 0 && (
            <div className="p-4 space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800">
                  {result.type === "product" && (
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {result.image_url ? (
                          <img src={result.image_url} alt={result.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xl">🛍️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-white truncate">{result.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{result.shop_name}</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">${result.price}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleAddToCart(result.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors font-medium"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => router.push(`/shops/${result.shop_id}`)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors font-medium"
                        >
                          View Shop
                        </button>
                      </div>
                    </div>
                  )}

                  {result.type === "shop" && (
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {result.image_url ? (
                          <img src={result.image_url} alt={result.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xl">🏪</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-white truncate">{result.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{result.address}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{result.category}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/shops/${result.id}`)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors font-medium"
                      >
                        View Shop
                      </button>
                    </div>
                  )}

                  {result.type === "recipe" && (
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {result.image_url ? (
                          <img src={result.image_url} alt={result.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xl">📖</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-white truncate">{result.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{result.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cooking time: {result.cooking_time}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/Recipes/${result.id}`)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors font-medium"
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
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">No results found for</p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">"{searchQuery}"</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try different keywords or check spelling</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 