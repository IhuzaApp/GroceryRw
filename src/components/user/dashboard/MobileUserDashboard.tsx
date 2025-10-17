import { useState } from "react";
import { useUserDashboardLogic } from "./shared/UserDashboardLogic";
import { Data } from "../../../types";
import ShopCard from "./ShopCard";
import SortDropdown from "./SortDropdown";
import LoadingScreen from "../../ui/LoadingScreen";
import {
  CategoryIcon,
  getShopImageUrl,
  ShopSkeleton,
  getAllCategories,
} from "./shared/SharedComponents";

export default function MobileUserDashboard({ initialData }: { initialData: Data }) {
  const [searchTerm, setSearchTerm] = useState("");
  
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

  if (!authReady || !dataLoaded) {
    return <LoadingScreen />;
  }

  // Show loading state only if we're fetching data and have no shops at all
  if (isFetchingData && (!data.shops || data.shops.length === 0)) {
    return <LoadingScreen />;
  }

  const allCategories = getAllCategories(data);
  
  // Filter categories based on search term
  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no category is selected, show only categories
  if (!selectedCategory) {
    return (
      <div className="p-0">
        <div className="container mx-auto">
          {/* Categories View */}
          <div className="mt-0">
            {/* Search Input */}
            <div className="mb-6">
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-700 dark:focus:ring-green-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {searchTerm ? (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors duration-200 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700"
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
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-100">
                {error}
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-4">
              {isLoading
                ? Array(6)
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
                : filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/20 dark:from-gray-800 dark:to-gray-900 dark:hover:shadow-green-400/20"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-green-900/20 dark:to-blue-900/20"></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon Container */}
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl dark:from-green-800 dark:to-green-700">
                          <CategoryIcon category={category.name} />
                        </div>
                        
                        {/* Category Name */}
                        <h3 className="mb-1 text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-green-700 dark:text-white dark:group-hover:text-green-400">
                          {category.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-300">
                          Browse shops
                        </p>
                        
                        {/* Arrow Icon */}
                        <div className="mt-3 flex justify-end">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 transition-all duration-300 group-hover:bg-green-200 group-hover:scale-110 dark:bg-green-800 dark:text-green-300 dark:group-hover:bg-green-700">
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
                      
                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-green-200 dark:group-hover:border-green-700"></div>
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
                      No categories found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try searching with different keywords
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If category is selected, show shops for that category
  return (
    <div className="p-0">
      <div className="container mx-auto">
        {/* Header with back button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilter}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <svg
                className="h-4 w-4"
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
                {data?.categories?.find((c) => c.id === selectedCategory)
                  ?.name || "Selected Category"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredShops?.length || 0} shops available
              </p>
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <SortDropdown
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onNearbyClick={handleNearbyClick}
            isNearbyActive={isNearbyActive}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        {/* Shops Grid */}
        {isLoading || isFetchingData ? (
          <div className="grid grid-cols-2 gap-3">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <ShopSkeleton key={index} />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredShops?.length ? (
              filteredShops.map((shop) => {
                const dyn = shopDynamics[shop.id] || {
                  distance: "N/A",
                  time: "N/A",
                  fee: "N/A",
                  open: false,
                };
                return (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    dynamics={dyn}
                    getShopImageUrl={getShopImageUrl}
                  />
                );
              })
            ) : (
              <div className="col-span-2 mt-8 text-center text-gray-500 dark:text-gray-400">
                {isFetchingData
                  ? "Loading shops..."
                  : "No shops found in this category"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
