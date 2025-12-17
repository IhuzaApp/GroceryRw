import Image from "next/image";
import { Input, InputGroup, Button, Checkbox, Panel } from "rsuite";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import RootLayout from "@components/ui/layout";
import ItemCartTable from "@components/UserCarts/cartsTable";
import CheckoutItems from "@components/UserCarts/checkout/checkoutCard";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import {
  useFoodCart,
  FoodCartRestaurant,
} from "../../src/context/FoodCartContext";
import { useCart } from "../../src/context/CartContext";
import { AuthGuard } from "../../src/components/AuthGuard";

// Skeleton loader for restaurant selection cards
function RestaurantSelectionSkeleton() {
  const { theme } = useTheme();
  return (
    <div
      className={`relative h-24 w-40 min-w-[10rem] flex-shrink-0 animate-pulse rounded-lg p-2 ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      }`}
    />
  );
}

// Skeleton loader for checkout summary
function CheckoutSkeleton() {
  const { theme } = useTheme();
  return (
    <>
      {/* Mobile view skeleton */}
      <div
        className={`fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 animate-pulse rounded-2xl p-6 shadow-2xl md:hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      />
      {/* Desktop view skeleton */}
      <div className="hidden w-full md:block lg:w-1/3">
        <div
          className={`sticky top-20 animate-pulse space-y-4 rounded-xl p-4 shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div
            className={`h-8 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div
            className={`h-4 w-3/4 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div
            className={`h-4 w-1/2 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div
            className={`h-12 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
        </div>
      </div>
    </>
  );
}

// Main loading skeleton for initial cart loading
function CartLoadingSkeleton() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Cart Items Column Skeleton */}
      <div className="w-full lg:w-2/3">
        {/* Restaurant/Shop Selection Skeleton */}
        <div className="mb-6">
          <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
            {/* Show 3 skeleton cards */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`relative w-40 min-w-[10rem] flex-shrink-0 animate-pulse rounded-lg border-2 p-2 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`h-4 w-20 rounded ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div
                  className={`absolute -right-2 top-1 h-6 w-6 rounded-full ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cart Table Skeleton */}
        <div
          className={`rounded-lg border p-4 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div
            className={`mb-4 h-6 w-32 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className={`h-4 w-3/4 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-3 w-1/2 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  />
                </div>
                <div
                  className={`h-8 w-16 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary Column Skeleton */}
      <div className="w-full lg:w-1/3">
        <CheckoutSkeleton />
      </div>
    </div>
  );
}

interface ShopCart {
  id: string;
  name: string;
  logo?: string;
  count: number;
}

export default function CartMainPage() {
  const { theme } = useTheme();
  const { isLoggedIn } = useAuth();
  const { restaurants, totalItems, totalPrice, clearRestaurant } =
    useFoodCart();
  const { count: cartCount } = useCart();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopCarts, setShopCarts] = useState<ShopCart[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [loadingShops, setLoadingShops] = useState<boolean>(true);
  const [isSwitchingTabs, setIsSwitchingTabs] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Cache for cart data to prevent reloading
  const [cartDataCache, setCartDataCache] = useState<{
    [key: string]: {
      total: number;
      units: number;
      lastUpdated: number;
    };
  }>({});

  // State to track current totals for shop carts (to avoid circular dependencies)
  const [currentShopTotal, setCurrentShopTotal] = useState<number>(0);
  const [currentShopUnits, setCurrentShopUnits] = useState<number>(0);

  // Refs to avoid dependency issues in callbacks
  const currentShopTotalRef = useRef(0);
  const currentShopUnitsRef = useRef(0);

  // Fetch shop carts
  useEffect(() => {
    if (!isLoggedIn) {
      setIsInitialLoading(false);
      return;
    }

    const fetchShopCarts = async () => {
      try {
        setLoadingShops(true);
        const response = await fetch("/api/carts");
        const data = await response.json();

        if (response.ok && data.carts) {
          setShopCarts(data.carts);
        }
      } catch (error) {
        console.error("Failed to fetch shop carts:", error);
      } finally {
        setLoadingShops(false);
        // Mark initial loading as complete once shop carts are loaded
        setIsInitialLoading(false);
      }
    };

    fetchShopCarts();
  }, [isLoggedIn]);

  // Set initial selected restaurant or shop
  useEffect(() => {
    // Only set initial selection if no selection exists
    if (!selectedRestaurantId && !selectedShopId) {
      // Priority: restaurants first, then shops
      if (restaurants.length > 0) {
        setSelectedRestaurantId(restaurants[0].id);
        setSelectedShopId(null);
      } else if (shopCarts.length > 0) {
        setSelectedShopId(shopCarts[0].id);
        setSelectedRestaurantId(null);
      }
    }
  }, [restaurants, shopCarts]);

  // Get cached cart data (use callback to avoid dependency issues)
  const getCachedCartData = useCallback(
    (cartId: string) => {
      return cartDataCache[cartId] || { total: 0, units: 0, lastUpdated: 0 };
    },
    [cartDataCache]
  );

  // Update cached cart data
  const updateCachedCartData = useCallback(
    (cartId: string, total: number, units: number) => {
      setCartDataCache((prev) => ({
        ...prev,
        [cartId]: {
          total,
          units,
          lastUpdated: Date.now(),
        },
      }));
    },
    []
  );

  // Handle restaurant selection
  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedShopId(null); // Clear shop selection when selecting restaurant

    // Load cached data if available
    const cachedData = getCachedCartData(`restaurant-${restaurantId}`);
    // Don't reset to 0, use cached data instead
  };

  // Handle shop selection
  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    setSelectedRestaurantId(null); // Clear restaurant selection when selecting shop

    // Load cached data if available
    const cachedData = getCachedCartData(`shop-${shopId}`);
    // Don't reset to 0, use cached data instead
  };

  // Handle switching between any tab
  const handleTabSwitch = (type: "restaurant" | "shop", id: string) => {
    // Prevent multiple rapid clicks
    if (isSwitchingTabs) return;

    setIsSwitchingTabs(true);

    // Immediate switch since we're using cached data
    setTimeout(() => {
      if (type === "restaurant") {
        handleSelectRestaurant(id);
      } else {
        handleSelectShop(id);
      }
      setIsSwitchingTabs(false);
    }, 50); // Reduced delay since we're caching data
  };

  // Find the selected restaurant and shop (memoized)
  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId),
    [restaurants, selectedRestaurantId]
  );
  const selectedShop = useMemo(
    () => shopCarts.find((s) => s.id === selectedShopId),
    [shopCarts, selectedShopId]
  );

  // Get current cart totals (memoized)
  const getCurrentCartTotal = useCallback(() => {
    if (selectedRestaurantId) {
      // For food carts, use the actual total from food cart context
      return totalPrice;
    } else if (selectedShopId) {
      // For shop carts, use the current state
      return currentShopTotal;
    }
    return 0;
  }, [selectedRestaurantId, selectedShopId, totalPrice, currentShopTotal]);

  const getCurrentCartUnits = useCallback(() => {
    if (selectedRestaurantId) {
      // For food carts, use the actual total items from food cart context
      return totalItems;
    } else if (selectedShopId) {
      // For shop carts, use the current state
      return currentShopUnits;
    }
    return 0;
  }, [selectedRestaurantId, selectedShopId, totalItems, currentShopUnits]);

  // Initialize cache when switching to shop tabs
  useEffect(() => {
    if (selectedShopId) {
      const cacheKey = `shop-${selectedShopId}`;
      if (!cartDataCache[cacheKey]) {
        // Initialize with default values if not cached
        updateCachedCartData(cacheKey, 0, 0);
      }
    }
  }, [selectedShopId, cartDataCache, updateCachedCartData]);

  // Reset shop totals when switching shops
  useEffect(() => {
    if (selectedShopId) {
      // Load cached data if available
      const cached = getCachedCartData(`shop-${selectedShopId}`);
      setCurrentShopTotal(cached.total);
      setCurrentShopUnits(cached.units);
      currentShopTotalRef.current = cached.total;
      currentShopUnitsRef.current = cached.units;
    } else {
      // Reset when no shop is selected
      setCurrentShopTotal(0);
      setCurrentShopUnits(0);
      currentShopTotalRef.current = 0;
      currentShopUnitsRef.current = 0;
    }
  }, [selectedShopId, getCachedCartData]);

  // Function to auto-switch to next available tab after checkout
  const autoSwitchToNextTab = useCallback(
    (updatedCarts: ShopCart[]) => {
      // Get current food cart restaurants (after potential clearing)
      const currentRestaurants = restaurants.filter((r) => r.items.length > 0);

      // Priority: 1) Food carts, 2) Shop carts
      if (currentRestaurants.length > 0) {
        // Switch to first available food cart
        const firstRestaurant = currentRestaurants[0];
        setSelectedRestaurantId(firstRestaurant.id);
        setSelectedShopId(null);
      } else if (updatedCarts.length > 0) {
        // Switch to first available shop cart
        const firstShop = updatedCarts[0];
        setSelectedShopId(firstShop.id);
        setSelectedRestaurantId(null);
      } else {
        // No active carts - stay on empty state
      }
    },
    [restaurants]
  );

  // Listen for cart changed events (from checkout completion)
  useEffect(() => {
    const handleCartChanged = (event: CustomEvent) => {
      const { refetch, shop_id } = event.detail || {};

      if (refetch) {
        // If it's a specific shop checkout, remove that shop tab and clear its cache
        if (shop_id) {
          // Clear cache for this specific shop
          setCartDataCache((prev) => {
            const newCache = { ...prev };
            delete newCache[`shop-${shop_id}`];
            return newCache;
          });

          // If this shop was selected, clear the selection
          if (selectedShopId === shop_id) {
            setSelectedShopId(null);
            setCurrentShopTotal(0);
            setCurrentShopUnits(0);
            currentShopTotalRef.current = 0;
            currentShopUnitsRef.current = 0;
          }

          // Remove this shop from the shopCarts list immediately
          setShopCarts((prev) => prev.filter((shop) => shop.id !== shop_id));

          // Refetch shop carts to get updated list from server
          setLoadingShops(true);
          fetch("/api/carts")
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                const updatedCarts = data.carts || [];
                setShopCarts(updatedCarts);

                // Auto-switch to next available tab
                setTimeout(() => {
                  autoSwitchToNextTab(updatedCarts);
                }, 100);
              }
            })
            .catch((err) => console.error("Error refetching carts:", err))
            .finally(() => {
              setLoadingShops(false);
            });
        } else {
          // General refetch (for food orders or general refresh)

          // Clear current selections
          setSelectedRestaurantId(null);
          setSelectedShopId(null);

          // Clear cache
          setCartDataCache({});

          // Reset totals
          setCurrentShopTotal(0);
          setCurrentShopUnits(0);
          currentShopTotalRef.current = 0;
          currentShopUnitsRef.current = 0;

          // Refetch shop carts
          setLoadingShops(true);
          fetch("/api/carts")
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                const updatedCarts = data.carts || [];
                setShopCarts(updatedCarts);

                // Auto-switch to next available tab after food order
                setTimeout(() => {
                  autoSwitchToNextTab(updatedCarts);
                }, 100);
              }
            })
            .catch((err) => console.error("Error refetching carts:", err))
            .finally(() => {
              setLoadingShops(false);
            });

          // Clear food cart if it was a food order
          if (restaurants.length > 0) {
            restaurants.forEach((restaurant) => {
              clearRestaurant(restaurant.id);
            });
          }
        }
      }
    };

    window.addEventListener("cartChanged", handleCartChanged as EventListener);

    return () => {
      window.removeEventListener(
        "cartChanged",
        handleCartChanged as EventListener
      );
    };
  }, [restaurants, clearRestaurant]);

  // Memoized callback functions for ItemCartTable
  const handleTotalChange = useCallback(
    (total: number) => {
      if (selectedShopId) {
        setCurrentShopTotal(total);
        currentShopTotalRef.current = total;
        updateCachedCartData(
          `shop-${selectedShopId}`,
          total,
          currentShopUnitsRef.current
        );
      }
    },
    [selectedShopId, updateCachedCartData]
  );

  const handleUnitsChange = useCallback(
    (units: number) => {
      if (selectedShopId) {
        setCurrentShopUnits(units);
        currentShopUnitsRef.current = units;
        updateCachedCartData(
          `shop-${selectedShopId}`,
          currentShopTotalRef.current,
          units
        );
      }
    },
    [selectedShopId, updateCachedCartData]
  );

  // Calculate total items across all cart types (memoized)
  const totalFoodItems = useMemo(
    () => restaurants.reduce((sum, r) => sum + r.totalItems, 0),
    [restaurants]
  );
  const totalShopItems = useMemo(
    () => shopCarts.reduce((sum, s) => sum + s.count, 0),
    [shopCarts]
  );
  const hasAnyItems = useMemo(
    () => totalFoodItems > 0 || totalShopItems > 0,
    [totalFoodItems, totalShopItems]
  );

  // Show login prompt for guests
  if (!isLoggedIn) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto">
            <div className="mb-6 flex items-center">
              <Link
                href="/"
                className={`flex items-center ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-5 w-5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Cart
              </h1>
            </div>

            <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
              <div
                className={`rounded-lg p-8 shadow-lg transition-colors duration-200 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="mb-6 flex justify-center">
                  <svg
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <h2
                  className={`mb-4 text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Sign In to View Your Cart
                </h2>
                <p
                  className={`mb-6 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  You need to be logged in to view and manage your cart.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/Auth/Login"
                    className="inline-flex items-center justify-center rounded-md bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition duration-150 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-offset-gray-900"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign In
                  </Link>
                  <Link
                    href="/Auth/Register"
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="md:ml-16">
        {/* Mobile Header */}
        <div
          className="relative mb-2 h-32 overflow-hidden rounded-b-3xl sm:hidden"
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

          {/* Header Content */}
          <div className="relative z-10 flex h-full items-center justify-between px-6">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-semibold !text-white">My Cart</h1>
              <p className="text-xs !text-white/90">
                {totalFoodItems + totalShopItems} item
                {totalFoodItems + totalShopItems !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="p-4 md:p-4">
          <div className="container mx-auto">
            {/* Cart Selection - Desktop Only */}
            <div className="mb-6 hidden items-center md:flex">
              <Link
                href="/"
                className={`flex items-center ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-5 w-5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                My Cart
              </h1>
            </div>

            {/* Show loading skeleton while waiting for initial data */}
            {isInitialLoading ? (
              <CartLoadingSkeleton />
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row">
                {/* Cart Items Column - Restaurant/Shop Selection + Cart Table */}
                <div className="w-full lg:w-2/3">
                  {/* Restaurant/Shop Selection - Custom Tailwind Tabs */}
                  <div className="mb-2 md:mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {hasAnyItems ? (
                        <>
                          {/* Food Restaurants */}
                          {restaurants.length > 0 &&
                            restaurants.map((restaurant) => {
                              const isSelected =
                                selectedRestaurantId === restaurant.id;
                              return (
                                <button
                                  key={restaurant.id}
                                  onClick={() =>
                                    !isSwitchingTabs &&
                                    handleTabSwitch("restaurant", restaurant.id)
                                  }
                                  disabled={isSwitchingTabs}
                                  className={`group relative flex min-w-[56px] flex-shrink-0 items-center justify-center gap-2.5 rounded-xl p-1 transition-all duration-200 md:min-w-[140px] md:justify-start md:rounded-lg md:px-3 md:py-2.5 ${
                                    isSelected
                                      ? "text-white shadow-lg md:bg-green-500 md:shadow-md"
                                      : isSwitchingTabs
                                      ? "cursor-not-allowed opacity-50"
                                      : "bg-transparent hover:bg-gray-50 md:bg-gray-100 md:hover:bg-gray-200"
                                  }`}
                                >
                                  {/* Logo/Avatar */}
                                  <div className="relative flex-shrink-0">
                                    <div
                                      className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full ring-2 transition-all md:h-9 md:w-9 md:ring-0 ${
                                        isSelected
                                          ? "bg-white/20 ring-white ring-offset-2 ring-offset-green-500 md:ring-0 md:ring-offset-0"
                                          : "bg-gray-100 ring-gray-300 md:bg-gray-200 md:ring-0"
                                      }`}
                                    >
                                      {restaurant.logo ? (
                                        <img
                                          src={restaurant.logo}
                                          alt={`${restaurant.name} logo`}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.nextElementSibling?.classList.remove(
                                              "hidden"
                                            );
                                          }}
                                        />
                                      ) : null}
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`${
                                          restaurant.logo ? "hidden" : ""
                                        } ${
                                          isSelected
                                            ? "text-white"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        <path
                                          d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>

                                    {/* Badge bubble - positioned outside the image container */}
                                    <div
                                      className={`absolute -right-1 -top-1 z-10 flex h-6 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs font-bold leading-none shadow-lg ${
                                        isSelected
                                          ? "border-2 border-green-500 bg-white text-green-500"
                                          : "bg-green-500 text-white"
                                      }`}
                                    >
                                      {restaurant.totalItems}
                                    </div>
                                  </div>

                                  {/* Content - Hidden on mobile, shown on desktop */}
                                  <div className="hidden min-w-0 flex-1 text-left md:flex">
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className={`truncate text-sm font-semibold leading-tight ${
                                          isSelected
                                            ? "text-white"
                                            : theme === "dark"
                                            ? "text-gray-200"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {restaurant.name}
                                      </div>
                                      <div
                                        className={`mt-0.5 text-xs leading-tight ${
                                          isSelected
                                            ? "text-white/80"
                                            : theme === "dark"
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {restaurant.totalItems} item
                                        {restaurant.totalItems !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Checkmark indicator - Desktop only */}
                                  {isSelected && (
                                    <div className="hidden h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/30 md:flex">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                        className="h-3 w-3"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}

                          {/* Shop Carts */}
                          {shopCarts.length > 0 &&
                            shopCarts.map((shop) => {
                              const isSelected = selectedShopId === shop.id;
                              return (
                                <button
                                  key={shop.id}
                                  onClick={() =>
                                    !isSwitchingTabs &&
                                    handleTabSwitch("shop", shop.id)
                                  }
                                  disabled={isSwitchingTabs}
                                  className={`group relative flex min-w-[56px] flex-shrink-0 items-center justify-center gap-2.5 rounded-xl p-1 transition-all duration-200 md:min-w-[140px] md:justify-start md:rounded-lg md:px-3 md:py-2.5 ${
                                    isSelected
                                      ? "text-white shadow-lg md:bg-green-500 md:shadow-md"
                                      : isSwitchingTabs
                                      ? "cursor-not-allowed opacity-50"
                                      : "bg-transparent hover:bg-gray-50 md:bg-gray-100 md:hover:bg-gray-200"
                                  }`}
                                >
                                  {/* Logo/Avatar */}
                                  <div className="relative flex-shrink-0">
                                    <div
                                      className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full ring-2 transition-all md:h-9 md:w-9 md:ring-0 ${
                                        isSelected
                                          ? "bg-white/20 ring-white ring-offset-2 ring-offset-green-500 md:ring-0 md:ring-offset-0"
                                          : "bg-gray-100 ring-gray-300 md:bg-gray-200 md:ring-0"
                                      }`}
                                    >
                                      {shop.logo ? (
                                        <img
                                          src={shop.logo}
                                          alt={`${shop.name} logo`}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.nextElementSibling?.classList.remove(
                                              "hidden"
                                            );
                                          }}
                                        />
                                      ) : null}
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`${
                                          shop.logo ? "hidden" : ""
                                        } ${
                                          isSelected
                                            ? "text-white"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        <path
                                          d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>

                                    {/* Badge bubble - positioned outside the image container */}
                                    <div
                                      className={`absolute -right-1 -top-1 z-10 flex h-6 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs font-bold leading-none shadow-lg ${
                                        isSelected
                                          ? "border-2 border-green-500 bg-white text-green-500"
                                          : "bg-green-500 text-white"
                                      }`}
                                    >
                                      {shop.count}
                                    </div>
                                  </div>

                                  {/* Content - Hidden on mobile, shown on desktop */}
                                  <div className="hidden min-w-0 flex-1 text-left md:flex">
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className={`truncate text-sm font-semibold leading-tight ${
                                          isSelected
                                            ? "text-white"
                                            : theme === "dark"
                                            ? "text-gray-200"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {shop.name}
                                      </div>
                                      <div
                                        className={`mt-0.5 text-xs leading-tight ${
                                          isSelected
                                            ? "text-white/80"
                                            : theme === "dark"
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {shop.count} item
                                        {shop.count !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Checkmark indicator - Desktop only */}
                                  {isSelected && (
                                    <div className="hidden h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/30 md:flex">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                        className="h-3 w-3"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                        </>
                      ) : (
                        // Empty state
                        <div className="flex w-full flex-col items-center justify-center py-8">
                          {/* Empty Cart Icon */}
                          <div className="mb-4 flex justify-center">
                            <svg
                              className={`h-16 w-16 ${
                                theme === "dark"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                              />
                            </svg>
                          </div>

                          {/* Empty Text */}
                          <h3
                            className={`text-lg font-semibold ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            Your cart is empty
                          </h3>

                          <p
                            className={`mt-1 text-sm ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            Browse restaurants and shops to add items to your
                            cart!
                          </p>

                          <Link
                            href="/shops"
                            className="mt-4 inline-flex items-center justify-center rounded-md bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition duration-150 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-offset-gray-900"
                          >
                            Browse Shops
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cart Table */}
                  {isSwitchingTabs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                        <span
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Switching tab...
                        </span>
                      </div>
                    </div>
                  ) : selectedRestaurantId && selectedRestaurant ? (
                    <>
                      <h2
                        className={`mb-4 text-xl font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedRestaurant.name}
                      </h2>
                      <ItemCartTable
                        shopId={selectedRestaurantId}
                        onTotalChange={() => {}} // No need to update cache for food carts
                        onUnitsChange={() => {}} // No need to update cache for food carts
                        onLoadingChange={setLoadingItems}
                        isFoodCart={true}
                        restaurant={selectedRestaurant}
                      />
                    </>
                  ) : selectedShopId && selectedShop ? (
                    <>
                      <h2
                        className={`mb-4 text-xl font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedShop.name}
                      </h2>
                      <ItemCartTable
                        shopId={selectedShopId}
                        onTotalChange={handleTotalChange}
                        onUnitsChange={handleUnitsChange}
                        onLoadingChange={setLoadingItems}
                        isFoodCart={false}
                      />
                    </>
                  ) : hasAnyItems ? (
                    <div
                      className={`p-4 text-center ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Select a restaurant or shop to view items.
                    </div>
                  ) : null}
                </div>
                {/* Order Summary Column */}
                {((selectedRestaurantId && selectedRestaurant) ||
                  (selectedShopId && selectedShop)) && (
                  <>
                    {loadingItems ? (
                      <CheckoutSkeleton />
                    ) : (
                      <AuthGuard requireAuth={true}>
                        {selectedRestaurant ? (
                          <CheckoutItems
                            shopId={selectedRestaurantId!}
                            Total={getCurrentCartTotal()}
                            totalUnits={getCurrentCartUnits()}
                            shopLat={parseFloat(selectedRestaurant.latitude)}
                            shopLng={parseFloat(selectedRestaurant.longitude)}
                            shopAlt={0}
                            isFoodCart={true}
                            restaurant={selectedRestaurant}
                          />
                        ) : selectedShop ? (
                          (() => {
                            const total = getCurrentCartTotal();
                            const units = getCurrentCartUnits();
                            return (
                              <CheckoutItems
                                shopId={selectedShopId!}
                                Total={total}
                                totalUnits={units}
                                shopLat={0} // Will need to fetch shop coordinates from API
                                shopLng={0} // Will need to fetch shop coordinates from API
                                shopAlt={0}
                                isFoodCart={false}
                              />
                            );
                          })()
                        ) : null}
                      </AuthGuard>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
