import { useState, useEffect } from "react";
import { useUserDashboardLogic } from "./shared/UserDashboardLogic";
import { Data } from "../../../types";
import ShopCard from "./ShopCard";
import MobileShopCard from "./MobileShopCard";
import SortDropdown from "./SortDropdown";
import LoadingScreen from "../../ui/LoadingScreen";
import SearchModal from "./SearchModal";
import {
  CategoryIcon,
  getShopImageUrl,
  ShopSkeleton,
  getAllCategories,
} from "./shared/SharedComponents";
import { useAddress } from "../../../hooks/useAddress";
import AddressBubble from "./AddressBubble";

interface MobileUserDashboardProps {
  initialData: Data;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function MobileUserDashboard({
  initialData,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
}: MobileUserDashboardProps) {
  const [shopSearchTerm, setShopSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [topShops, setTopShops] = useState<any[]>([]);
  const [isLoadingTopShops, setIsLoadingTopShops] = useState(false);

  // Get user's default address
  const { defaultAddress } = useAddress();

  const {
    data,
    selectedCategory,
    isLoading,
    error,
    sortBy,
    isNearbyActive,
    shopDynamics,
    dataLoaded,
    isFetchingData,
    authReady,
    filteredShops,
    handleCategoryClick,
    clearFilter,
    handleSortChange,
    handleNearbyClick,
  } = useUserDashboardLogic(initialData);

  // Function to fetch top shops based on ALL users' order history
  const fetchTopShops = async (categoryId: string) => {
    if (!categoryId) return;

    setIsLoadingTopShops(true);
    try {
      // Get ALL orders from the system (not just current user)
      const ordersResponse = await fetch("/api/queries/all-orders");
      const ordersData = await ordersResponse.json();

      if (!ordersData.orders || ordersData.orders.length === 0) {
        setTopShops([]);
        return;
      }

      // Get shops in the selected category
      const categoryShops =
        data?.shops?.filter((shop) => shop.category_id === categoryId) || [];

      if (categoryShops.length === 0) {
        setTopShops([]);
        return;
      }

      // Create a map of shop IDs for quick lookup
      const categoryShopIds = new Set(categoryShops.map((shop) => shop.id));

      // Count orders per shop across ALL users
      const shopOrderCounts = new Map<string, number>();

      ordersData.orders.forEach((order: any) => {
        if (categoryShopIds.has(order.shop_id)) {
          const currentCount = shopOrderCounts.get(order.shop_id) || 0;
          shopOrderCounts.set(order.shop_id, currentCount + 1);
        }
      });

      // Sort shops by order count and get top 6
      const sortedShops = categoryShops
        .map((shop) => ({
          ...shop,
          orderCount: shopOrderCounts.get(shop.id) || 0,
        }))
        .filter((shop) => shop.orderCount > 0)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 6);

      setTopShops(sortedShops);
    } catch (error) {
      console.error("Error fetching top shops:", error);
      setTopShops([]);
    } finally {
      setIsLoadingTopShops(false);
    }
  };

  // Effect to fetch top shops when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchTopShops(selectedCategory);
    } else {
      setTopShops([]);
    }
  }, [selectedCategory, data?.shops]);

  if (!authReady || !dataLoaded) {
    return <LoadingScreen />;
  }

  // Show loading state only if we're fetching data and have no shops at all
  if (isFetchingData && (!data.shops || data.shops.length === 0)) {
    return <LoadingScreen />;
  }

  const allCategories = getAllCategories(data);

  // Safe wrapper for getShopImageUrl to handle non-string values
  const getSafeShopImageUrl = (shop: any) => {
    const imageUrl = shop.image || shop.logo;
    // Ensure we always pass a string to getShopImageUrl
    return getShopImageUrl(typeof imageUrl === "string" ? imageUrl : undefined);
  };

  // Search function for SearchModal
  const handleSearch = async (query: string) => {
    setIsSearching(true);
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
    if (searchQuery.trim()) {
      setSearchOpen(true);
      handleSearch(searchQuery);
    }
  };

  // Filter shops based on search term when in category view
  const filteredShopsBySearch =
    selectedCategory && filteredShops
      ? filteredShops.filter(
          (shop) =>
            shop.name.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
            shop.description
              ?.toLowerCase()
              .includes(shopSearchTerm.toLowerCase()) ||
            shop.address?.toLowerCase().includes(shopSearchTerm.toLowerCase())
        )
      : filteredShops;

  // If no category is selected, show only categories
  if (!selectedCategory) {
    return (
      <div className="p-0">
        {/* Mobile Header with Background */}
        <div
          className="relative mb-6 h-40 overflow-hidden rounded-b-3xl"
          style={{
            marginTop: "-44px",
            marginLeft: "-16px",
            marginRight: "-16px",
          }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/assets/images/mobileheaderbg.jpg)",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Header Content - Address Bubble and Search Input */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
            {/* Address Bubble */}
            <AddressBubble />

            {/* Search Input */}
            <div className="w-full max-w-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  className="w-full rounded-2xl border-0 bg-white/90 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-500 shadow-lg backdrop-blur-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setSearchOpen(false);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors duration-200 hover:bg-red-200"
                    >
                      <svg
                        className="h-3 w-3"
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto">
          {/* Categories View */}
          <div className="mt-0">
            {error && (
              <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-100">
                {error}
              </div>
            )}
            <h5 className="pb-2 text-lg font-bold text-gray-900 dark:text-white">
              {" "}
              Categories
            </h5>
            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-4">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-6 dark:from-gray-800 dark:to-gray-700"
                    >
                      <div className="mb-4 h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                  ))
              ) : allCategories.length > 0 ? (
                allCategories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/25 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:hover:shadow-green-400/20"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                      opacity: 0,
                      transform: "translateY(20px)",
                    }}
                  >
                    {/* Background Pattern - Enhanced for light theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-blue-50/80 opacity-100 transition-opacity duration-300 group-hover:opacity-100 dark:from-green-900/20 dark:to-blue-900/20 dark:opacity-0 dark:group-hover:opacity-100"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon Container - Enhanced for light theme */}
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:from-green-600 group-hover:to-green-700 dark:from-green-800 dark:to-green-700 dark:group-hover:from-green-700 dark:group-hover:to-green-800">
                        <CategoryIcon category={category.name} />
                      </div>

                      {/* Category Name - Enhanced contrast for light theme */}
                      <h3 className="mb-1 text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-700 dark:text-white dark:group-hover:text-green-400">
                        {category.name}
                      </h3>

                      {/* Description - Enhanced contrast for light theme */}
                      <p className="text-xs font-medium text-gray-600 transition-colors duration-300 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-300">
                        Browse shops
                      </p>

                      {/* Arrow Icon - Enhanced for light theme */}
                      <div className="mt-3 flex justify-end">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-green-600 dark:bg-green-800 dark:text-green-300 dark:group-hover:bg-green-700">
                          <svg
                            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
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

                    {/* Hover Effect Border - Enhanced for light theme */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-green-300 dark:group-hover:border-green-700"></div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 mt-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No categories available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Check back later for new categories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Modal */}
        <SearchModal
          isOpen={searchOpen}
          onClose={() => {
            setSearchOpen(false);
            setSearchResults([]);
          }}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          searchResults={searchResults}
          isSearching={isSearching}
        />
      </div>
    );
  }

  // If category is selected, show shops for that category
  const selectedCategoryData = data?.categories?.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div className="p-0">
      {/* Mobile Header with Category Name */}
      <div
        className="mb-6"
        style={{
          marginTop: "-44px",
          marginLeft: "-16px",
          marginRight: "-16px",
        }}
      >
        {/* Category Header */}
        <div className="flex items-center justify-between bg-white px-4 py-4 shadow-sm dark:bg-gray-800">
          {/* Left side - Back button and Category name */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilter}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCategoryData?.name || "Selected Category"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {shopSearchTerm
                  ? `${filteredShopsBySearch?.length || 0} shops found`
                  : `${filteredShops?.length || 0} shops available`}
              </p>
            </div>
          </div>

          {/* Right side - Icon-only Sort and Nearby buttons */}
          <div className="flex items-center gap-2">
            {/* Nearby Button */}
            <button
              onClick={handleNearbyClick}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                isNearbyActive
                  ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              title="Nearby shops"
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* Sort Button */}
            <div className="relative">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                title="Sort options"
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
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-white px-4 pb-2 dark:bg-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-gray-400"
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
            <input
              type="text"
              placeholder="Search shops..."
              value={shopSearchTerm}
              onChange={(e) => setShopSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:bg-gray-600"
            />
            {shopSearchTerm && (
              <button
                onClick={() => setShopSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg
                  className="h-4 w-4 text-gray-400 hover:text-gray-600"
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
            )}
          </div>
        </div>
      </div>

      {topShops.length > 0 && (
        <div className="mb-3  ">
          <h5 className="pb-2 text-lg font-bold text-gray-900 dark:text-white">
            Top Shops
          </h5>
          {isLoadingTopShops ? (
            <div className="flex space-x-3">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-16 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"
                  />
                ))}
            </div>
          ) : (
            <div className="flex space-x-3 overflow-x-auto">
              {topShops.map((shop, index) => (
                <div
                  key={shop.id}
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    // You can add navigation to shop details here
                    // TODO: Add navigation to shop details
                  }}
                >
                  <div className="group relative mt-2">
                    {/* Shop Logo - Only show if logo exists */}
                    {shop.logo && shop.logo.trim() !== "" && (
                      <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-green-700 bg-white shadow-sm transition-all duration-200 group-hover:border-green-500 group-hover:shadow-lg dark:border-gray-600 dark:group-hover:border-green-400">
                        <img
                          src={shop.logo}
                          alt={`${shop.name} logo`}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Order count badge */}
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                      {shop.orderCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto">
        <h5 className="pb-2 text-lg font-bold text-gray-900 dark:text-white">
          All Shops
        </h5>
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        {/* Shops List */}
        {isLoading || isFetchingData ? (
          <div className="space-y-3">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-24 w-full animate-pulse rounded-xl bg-gray-200"
                ></div>
              ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShopsBySearch?.length ? (
              filteredShopsBySearch.map((shop) => {
                const dyn = shopDynamics[shop.id] || {
                  distance: "N/A",
                  time: "N/A",
                  fee: "N/A",
                  open: false,
                };
                return (
                  <MobileShopCard
                    key={shop.id}
                    shop={shop}
                    dynamics={dyn}
                    getShopImageUrl={getShopImageUrl}
                  />
                );
              })
            ) : (
              <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
                {isFetchingData
                  ? "Loading shops..."
                  : shopSearchTerm
                  ? "No shops found matching your search"
                  : "No shops found in this category"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchResults([]);
        }}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
      />
    </div>
  );
}
