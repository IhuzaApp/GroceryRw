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

export default function DesktopUserDashboard({
  initialData,
}: {
  initialData: Data;
}) {
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
    isLoggedIn,
    filteredShops,
    handleCategoryClick,
    clearFilter,
    handleSortChange,
    handleNearbyClick,
    handleRefreshData,
  } = useUserDashboardLogic(initialData);

  // Allow guests (non-logged-in users) to proceed without waiting for auth
  if ((!authReady && isLoggedIn) || !dataLoaded) {
    return <LoadingScreen />;
  }

  // Show loading state only if we're fetching data and have no shops at all
  if (isFetchingData && (!data.shops || data.shops.length === 0)) {
    return <LoadingScreen />;
  }

  const allCategories = getAllCategories(data);

  return (
    <div className="ml-16 p-4">
      <div className="container mx-auto">
        {/* Shop Categories */}
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Groceries
            </h2>
            {selectedCategory && (
              <button
                onClick={clearFilter}
                className="rounded-full bg-green-600 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                Clear Filter
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          {/* Horizontal Scrollable Categories */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {isLoading
                ? Array(15)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="flex min-w-[80px] flex-col items-center gap-2"
                      >
                        <div className="h-16 w-16 animate-pulse rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"></div>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    ))
                : allCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`group flex min-w-[80px] cursor-pointer flex-col items-center gap-2 transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "opacity-100"
                          : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      <div
                        className={`flex h-16 w-16 items-center justify-center bg-gray-50 dark:bg-gray-700 transition-all duration-200 overflow-visible ${
                          selectedCategory === category.id
                            ? "shadow-md scale-110"
                            : "group-hover:shadow-sm"
                        }`}
                        style={{
                          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                          clipPath: 'ellipse(55% 45% at 50% 50%)',
                        }}
                      >
                        <div className="scale-75">
                          <CategoryIcon category={category.name} />
                        </div>
                      </div>
                      <span className="text-center text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[80px] truncate">
                        {category.name}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Shops */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedCategory
                ? data?.categories?.find((c) => c.id === selectedCategory)
                    ?.name || "Selected Category"
                : "All Stores"}
            </h4>
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                disabled={isFetchingData}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-600/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg dark:from-green-600 dark:to-green-700 dark:!text-white dark:shadow-green-600/20 dark:hover:from-green-700 dark:hover:to-green-800"
              >
                <svg
                  className={`h-4 w-4 !text-white transition-transform duration-300 ${
                    isFetchingData ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="!text-white">
                  {isFetchingData ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              {/* Sort Dropdown */}
              <SortDropdown
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onNearbyClick={handleNearbyClick}
                isNearbyActive={isNearbyActive}
              />
            </div>
          </div>

          {isLoading || isFetchingData ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <ShopSkeleton key={index} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
                <div className="col-span-full mt-8 text-center text-gray-500 dark:text-gray-400">
                  {isFetchingData
                    ? "Loading shops..."
                    : "No shops found in this category"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
