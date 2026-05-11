import { formatCurrencySync } from "../../../utils/formatCurrency";
import { useRouter } from "next/router";

interface SearchResult {
  id: string;
  name: string;
  type:
    | "product"
    | "shop"
    | "recipe"
    | "restaurant"
    | "pet"
    | "vehicle"
    | "reel"
    | "service"
    | "rfq"
    | "business_product";
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
  const router = useRouter();

  const handleResultClick = (result: SearchResult) => {
    // If the result has a shop_id, it's a product - redirect to the shop
    if (result.shop_id && result.type === "product") {
      router.push(`/shops/${result.shop_id}`);
    } else if (result.type === "product") {
      router.push(`/shops/${result.shop_id}`);
    } else if (result.type === "shop") {
      router.push(`/shops/${result.id}`);
    } else if (result.type === "recipe") {
      router.push(`/Recipes/${result.id}`);
    } else if (result.type === "restaurant") {
      router.push(`/restaurant/${result.id}`);
    } else if (result.type === "pet") {
      router.push(`/Pets/${result.id}`);
    } else if (result.type === "vehicle") {
      router.push(`/Cars/${result.id}`);
    } else if (result.type === "reel") {
      router.push(`/reels?id=${result.id}`);
    } else if (result.type === "service") {
      router.push(`/plasBusiness/explorer?type=service&id=${result.id}`);
    } else if (result.type === "rfq") {
      router.push(`/plasBusiness/explorer?type=rfq&id=${result.id}`);
    } else if (result.type === "business_product") {
      router.push(`/plasBusiness/explorer?type=product&id=${result.id}`);
    }

    // Close the modal after navigation
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[39] bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex h-full flex-col bg-white dark:bg-[#0A0A0A]">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0A]/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Search Results
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {searchResults.length} results for "{searchQuery}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 pb-28 dark:bg-[#0A0A0A]">
          {isSearching ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500 dark:border-emerald-400"></div>
                <p className="mt-4 font-bold text-gray-500 dark:text-gray-400">
                  Searching...
                </p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl dark:border-white/5 dark:bg-[#121212] dark:hover:border-emerald-500/30 dark:hover:bg-white/[0.04]"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-white/5">
                        <img
                          src={(() => {
                            // Use image_url if available
                            if (result.image_url) return result.image_url;

                            // Handle restaurant profile field
                            if (result.profile) {
                              if (result.profile.startsWith("http"))
                                return result.profile;
                              if (result.profile.startsWith("/"))
                                return result.profile;
                              return `/images/restaurants/${result.profile}`;
                            }

                            // Fallback based on type
                            if (result.type === "restaurant") {
                              return "/images/restaurantDish.png";
                            } else if (result.type === "pet") {
                              return "/images/petPlaceholder.png";
                            } else if (result.type === "vehicle") {
                              return "/images/carPlaceholder.png";
                            } else if (result.type === "reel") {
                              return "/images/videoPlaceholder.png";
                            } else if (
                              result.type === "product" ||
                              result.type === "business_product" ||
                              result.shop_id
                            ) {
                              return "/images/groceryPlaceholder.png";
                            } else {
                              return "/images/groceryPlaceholder.png";
                            }
                          })()}
                          alt={result.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            if (
                              e.currentTarget.src.includes(
                                "groceryPlaceholder.png"
                              ) ||
                              e.currentTarget.src.includes("restaurantDish.png")
                            ) {
                              return;
                            }

                            if (result.type === "restaurant") {
                              e.currentTarget.src =
                                "/images/restaurantDish.png";
                            } else if (result.type === "pet") {
                              e.currentTarget.src =
                                "/images/petPlaceholder.png";
                            } else if (result.type === "vehicle") {
                              e.currentTarget.src =
                                "/images/carPlaceholder.png";
                            } else {
                              e.currentTarget.src =
                                "/images/groceryPlaceholder.png";
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <h4 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                              {result.name}
                            </h4>
                            {/* Type Badge */}
                            <span
                              className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                result.type === "product" || result.type === "business_product"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : result.type === "shop"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                  : result.type === "restaurant"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : result.type === "pet"
                                  ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                                  : result.type === "vehicle"
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                  : result.type === "rfq"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : result.type === "service"
                                  ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                                  : result.type === "reel"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              }`}
                            >
                              {result.type.replace("_", " ")}
                            </span>
                          </div>

                          {/* Location Info */}
                          {(result.shop_name ||
                            result.address ||
                            result.location) && (
                            <div className="mb-2 flex items-center text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              <svg
                                className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 opacity-70"
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
                            <p className="mb-2 line-clamp-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                              {result.description}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        {result.price && (
                          <div className="ml-4 flex-shrink-0">
                            <div className="text-right">
                              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrencySync(result.price)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Indicator */}
                      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/5">
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Tap to{" "}
                          {result.type === "product" || result.type === "business_product"
                            ? "view product"
                            : result.type === "shop"
                            ? "visit shop"
                            : result.type === "restaurant"
                            ? "visit restaurant"
                            : result.type === "pet"
                            ? "view pet"
                            : result.type === "vehicle"
                            ? "rent vehicle"
                            : result.type === "rfq"
                            ? "apply to rfq"
                            : result.type === "service"
                            ? "view service"
                            : result.type === "reel"
                            ? "watch reel"
                            : "view recipe"}
                        </div>
                        <svg
                          className="h-4 w-4 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-gray-600 dark:group-hover:text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-100 shadow-inner dark:bg-white/5">
                <svg
                  className="h-10 w-10 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-black tracking-tight text-gray-900 dark:text-white">
                No results found
              </h3>
              <p className="text-center font-medium text-gray-500 dark:text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
