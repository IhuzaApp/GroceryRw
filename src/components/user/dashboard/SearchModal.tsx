import { useState } from "react";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface SearchResult {
  id: string;
  name: string;
  type: "product" | "shop" | "recipe";
  price?: string;
  image?: string;
  shop_name?: string;
  address?: string;
  description?: string;
  shop_id?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearch: (query: string) => Promise<void>;
  searchResults: SearchResult[];
  isSearching: boolean;
}

export default function SearchModal({ isOpen, onClose, searchQuery, onSearch, searchResults, isSearching }: SearchModalProps) {

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "product") {
      window.location.href = `/shops/${result.shop_id}`;
    } else if (result.type === "shop") {
      window.location.href = `/shops/${result.id}`;
    } else if (result.type === "recipe") {
      window.location.href = `/Recipes/${result.id}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
              <p className="text-sm text-gray-600">
                {searchResults.length} results for "{searchQuery}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors duration-200 hover:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Searching...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="px-4 py-2 space-y-3">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200" style={{ display: result.image ? 'none' : 'flex' }}>
                            {result.type === "product" && <span className="text-2xl">🛍️</span>}
                            {result.type === "shop" && <span className="text-2xl">🏪</span>}
                            {result.type === "recipe" && <span className="text-2xl">📖</span>}
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900 text-base truncate group-hover:text-green-700 transition-colors">
                                {result.name}
                              </h4>
                              {/* Type Badge */}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                result.type === "product" ? "bg-blue-100 text-blue-700" :
                                result.type === "shop" ? "bg-purple-100 text-purple-700" :
                                "bg-orange-100 text-orange-700"
                              }`}>
                                {result.type === "product" && "Product"}
                                {result.type === "shop" && "Shop"}
                                {result.type === "recipe" && "Recipe"}
                              </span>
                            </div>
                            
                            {/* Location Info */}
                            {(result.shop_name || result.address) && (
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">
                                  {result.shop_name || result.address}
                                </span>
                              </div>
                            )}
                            
                            {/* Description */}
                            {result.description && (
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                {result.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Price */}
                          {result.price && (
                            <div className="flex-shrink-0 ml-4">
                              <div className="text-right">
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrencySync(result.price)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Indicator */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-400">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tap to {result.type === "product" ? "view product" : result.type === "shop" ? "visit shop" : "view recipe"}
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try searching with different keywords</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
