import { formatCurrencySync } from "../../../utils/formatCurrency";

interface SearchResult {
  id: string;
  name: string;
  type: "product" | "shop" | "recipe" | "restaurant";
  price?: string;
  image_url?: string;
  shop_name?: string;
  address?: string;
  location?: string;
  description?: string;
  shop_id?: string;
  category?: string;
  profile?: string;
  verified?: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearch: (query: string) => Promise<void>;
  searchResults: SearchResult[];
  isSearching: boolean;
}

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  onSearch,
  searchResults,
  isSearching,
}: SearchModalProps) {
  const handleResultClick = (result: SearchResult) => {
    // If the result has a shop_id, it's a product - redirect to the shop
    if (result.shop_id) {
      window.location.href = `/shops/${result.shop_id}`;
    } else if (result.type === "product") {
      window.location.href = `/shops/${result.shop_id}`;
    } else if (result.type === "shop") {
      window.location.href = `/shops/${result.id}`;
    } else if (result.type === "recipe") {
      window.location.href = `/Recipes/${result.id}`;
    } else if (result.type === "restaurant") {
      window.location.href = `/restaurant/${result.id}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Search Results
              </h3>
              <p className="text-sm text-gray-600">
                {searchResults.length} results for "{searchQuery}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors duration-200 hover:bg-gray-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {isSearching ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
                <p className="mt-4 font-medium text-gray-600">Searching...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3 px-4 py-2">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-md"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                          <img
                            src={(() => {
                              // Use image_url if available
                              if (result.image_url) return result.image_url;

                              // Handle restaurant profile field
                              if (result.profile) {
                                // If it's a full URL, use it
                                if (result.profile.startsWith("http"))
                                  return result.profile;
                                // If it's a relative path, try to construct a proper path
                                if (result.profile.startsWith("/"))
                                  return result.profile;
                                // If it's just a filename, assume it's in a restaurant images folder
                                return `/images/restaurants/${result.profile}`;
                              }

                              // Fallback based on type
                              if (result.type === "restaurant") {
                                return "/images/restaurantDish.png";
                              } else if (result.type === "product" || result.shop_id) {
                                return "/images/groceryPlaceholder.png";
                              } else {
                                return "/images/groceryPlaceholder.png";
                              }
                            })()}
                            alt={result.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              // Prevent infinite loop if placeholder also fails
                              if (e.currentTarget.src.includes("groceryPlaceholder.png") || 
                                  e.currentTarget.src.includes("restaurantDish.png")) {
                                return;
                              }
                              
                              // Set appropriate placeholder based on result type
                              if (result.type === "restaurant") {
                                e.currentTarget.src = "/images/restaurantDish.png";
                              } else if (result.type === "product" || result.shop_id) {
                                e.currentTarget.src = "/images/groceryPlaceholder.png";
                              } else {
                                e.currentTarget.src = "/images/groceryPlaceholder.png";
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center space-x-2">
                              <h4 className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-green-700">
                                {result.name}
                              </h4>
                              {/* Type Badge */}
                              <span
                                className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  result.type === "product"
                                    ? "bg-blue-100 text-blue-700"
                                    : result.type === "shop"
                                    ? "bg-purple-100 text-purple-700"
                                    : result.type === "restaurant"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {result.type === "product" && "Product"}
                                {result.type === "shop" && "Shop"}
                                {result.type === "restaurant" && "Restaurant"}
                                {result.type === "recipe" && "Recipe"}
                              </span>
                            </div>

                            {/* Location Info */}
                            {(result.shop_name ||
                              result.address ||
                              result.location) && (
                              <div className="mb-2 flex items-center text-sm text-gray-600">
                                <svg
                                  className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="truncate">
                                  {result.shop_name ||
                                    result.address ||
                                    result.location}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {result.description && (
                              <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                                {result.description}
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          {result.price && (
                            <div className="ml-4 flex-shrink-0">
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
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Tap to{" "}
                            {result.type === "product"
                              ? "view product"
                              : result.type === "shop"
                              ? "visit shop"
                              : result.type === "restaurant"
                              ? "visit restaurant"
                              : "view recipe"}
                          </div>
                          <svg
                            className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-500">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
