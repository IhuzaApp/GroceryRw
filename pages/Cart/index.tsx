import Image from "next/image";
import { Input, InputGroup, Button, Checkbox, Panel } from "rsuite";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/router";
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

// Skeleton loader for checkout summary - Updated for bottom bar layout
function CheckoutSkeleton() {
  const { theme } = useTheme();
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9998] flex h-24 items-center rounded-t-3xl px-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ease-in-out md:left-16 ${
        theme === "dark"
          ? "border-t border-gray-800 bg-gray-900"
          : "border-t border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-2">
            <div
              className={`h-3 w-20 animate-pulse rounded ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            />
            <div
              className={`h-8 w-32 animate-pulse rounded ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            />
          </div>
          <div
            className={`h-10 w-px ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            }`}
          />
          <div className="flex flex-col gap-2">
            <div
              className={`h-3 w-20 animate-pulse rounded ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            />
            <div
              className={`h-8 w-40 animate-pulse rounded ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-32 animate-pulse rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          />
          <div
            className={`h-14 w-60 animate-pulse rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

// Main loading skeleton for initial cart loading
function CartLoadingSkeleton() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col gap-6">
      {/* Cart Items Column Skeleton */}
      <div className="w-full">
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
  latitude?: string;
  longitude?: string;
}

export default function CartMainPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isLoggedIn, isLoading } = useAuth();
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
  const [activeShopData, setActiveShopData] = useState<ShopCart | null>(null);
  const [activeRestaurantData, setActiveRestaurantData] =
    useState<FoodCartRestaurant | null>(null);

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

  // Redirect to home if not logged in - wait for loading to finish
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

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
      if (restaurants.length > 0) {
        setSelectedRestaurantId(restaurants[0].id);
        setSelectedShopId(null);
      } else if (shopCarts.length > 0) {
        setSelectedShopId(shopCarts[0].id);
        setSelectedRestaurantId(null);
      }
    }
  }, [restaurants, shopCarts, selectedRestaurantId, selectedShopId]);

  // Update active data when selections or lists change
  useEffect(() => {
    if (selectedRestaurantId) {
      const restaurant = restaurants.find((r) => r.id === selectedRestaurantId);
      if (restaurant) {
        setActiveRestaurantData(restaurant);
      }
      // Note: If restaurant is NOT found (e.g. cleared), we KEEP the last activeRestaurantData
      // until the selection is manually changed to null or another shop.
    } else {
      setActiveRestaurantData(null);
    }
  }, [selectedRestaurantId, restaurants]);

  useEffect(() => {
    if (selectedShopId) {
      const shop = shopCarts.find((s) => s.id === selectedShopId);
      if (shop) {
        setActiveShopData(shop);
      }
      // Note: If shop is NOT found (e.g. cleared by server), we KEEP the last activeShopData
      // so the CheckoutItems component doesn't unmount prematurely.
    } else {
      setActiveShopData(null);
    }
  }, [selectedShopId, shopCarts]);

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

  // Use active data for rendering to ensure components stay mounted during finalization
  const selectedRestaurant = activeRestaurantData;
  const selectedShop = activeShopData;

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

          // If this shop was selected, clear the selection with a slight delay
          // This ensures the CheckoutItems component stays mounted until the redirect happens
          if (selectedShopId === shop_id) {
            setTimeout(() => {
              setSelectedShopId(null);
              setCurrentShopTotal(0);
              setCurrentShopUnits(0);
              currentShopTotalRef.current = 0;
              currentShopUnitsRef.current = 0;
            }, 3000); // 3 seconds delay (slightly more than the 2s redirect delay)
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

          // Clear food cart with a delay if it was a food order
          if (restaurants.length > 0) {
            setTimeout(() => {
              restaurants.forEach((restaurant) => {
                clearRestaurant(restaurant.id);
              });
            }, 3000);
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

  // Return null while redirecting
  if (!isLoggedIn) {
    return null;
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

        <div className="pb-4 pt-2 md:p-4">
          <div className="container mx-auto px-0 md:px-4">
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
              <div className="flex flex-col gap-6">
                {/* Cart Items Column - Full width now */}
                <div className="w-full pb-44 md:pb-32">
                  {/* Restaurant/Shop Selection - Polished Design */}
                  <div className="mb-8 px-2 md:mb-10 md:px-0">
                    <div className="mb-4 flex items-center justify-between">
                      <h2
                        className={`text-sm font-bold uppercase tracking-widest ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Your Active Carts
                      </h2>
                    </div>

                    <div
                      className={`scrollbar-hide flex gap-4 overflow-x-auto pb-6 pt-2`}
                    >
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
                                  className={`group relative flex flex-shrink-0 items-center gap-3 transition-all duration-300 ${
                                    isSwitchingTabs
                                      ? "cursor-not-allowed opacity-50"
                                      : ""
                                  } ${
                                    isSelected
                                      ? "scale-105"
                                      : "hover:translate-y-[-2px]"
                                  }`}
                                >
                                  <div
                                    className={`flex items-center gap-3 rounded-2xl p-2 pr-4 transition-all duration-300 ${
                                      isSelected
                                        ? "bg-green-500 text-white shadow-[0_10px_25px_-5px_rgba(34,197,94,0.4)]"
                                        : theme === "dark"
                                        ? "border border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/80"
                                        : "border border-gray-200 bg-white shadow-sm hover:border-gray-300"
                                    }`}
                                  >
                                    {/* Logo Container */}
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl shadow-inner">
                                      {restaurant.logo ? (
                                        <img
                                          src={restaurant.logo}
                                          alt={restaurant.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className={`flex h-full w-full items-center justify-center ${
                                            isSelected
                                              ? "bg-white/20"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className={
                                              isSelected
                                                ? "text-white"
                                                : "text-gray-400"
                                            }
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
                                      )}

                                      {/* Item Count Badge */}
                                      <div
                                        className={`absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-black ${
                                          isSelected
                                            ? "border-green-500 bg-white text-green-500"
                                            : "border-white bg-red-500 text-white dark:border-gray-800"
                                        }`}
                                      >
                                        {restaurant.totalItems}
                                      </div>
                                    </div>

                                    {/* Name and Info */}
                                    <div className="flex flex-col text-left">
                                      <span className="max-w-[100px] truncate text-sm font-bold leading-tight md:max-w-[140px]">
                                        {restaurant.name}
                                      </span>
                                      <span
                                        className={`text-[10px] font-medium uppercase tracking-tighter ${
                                          isSelected
                                            ? "text-white/80"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        Restaurant
                                      </span>
                                    </div>

                                    {/* Active Indicator */}
                                    {isSelected && (
                                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                    )}
                                  </div>
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
                                  className={`group relative flex flex-shrink-0 items-center gap-3 transition-all duration-300 ${
                                    isSwitchingTabs
                                      ? "cursor-not-allowed opacity-50"
                                      : ""
                                  } ${
                                    isSelected
                                      ? "scale-105"
                                      : "hover:translate-y-[-2px]"
                                  }`}
                                >
                                  <div
                                    className={`flex items-center gap-3 rounded-2xl p-2 pr-4 transition-all duration-300 ${
                                      isSelected
                                        ? "bg-green-500 text-white shadow-[0_10px_25px_-5px_rgba(34,197,94,0.4)]"
                                        : theme === "dark"
                                        ? "border border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/80"
                                        : "border border-gray-200 bg-white shadow-sm hover:border-gray-300"
                                    }`}
                                  >
                                    {/* Logo Container */}
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl shadow-inner">
                                      {shop.logo ? (
                                        <img
                                          src={shop.logo}
                                          alt={shop.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className={`flex h-full w-full items-center justify-center ${
                                            isSelected
                                              ? "bg-white/20"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className={
                                              isSelected
                                                ? "text-white"
                                                : "text-gray-400"
                                            }
                                          >
                                            <circle
                                              cx="9"
                                              cy="21"
                                              r="1"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <circle
                                              cx="20"
                                              cy="21"
                                              r="1"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <path
                                              d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </div>
                                      )}

                                      {/* Item Count Badge */}
                                      <div
                                        className={`absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-black ${
                                          isSelected
                                            ? "border-green-500 bg-white text-green-500"
                                            : "border-white bg-red-500 text-white dark:border-gray-800"
                                        }`}
                                      >
                                        {shop.count}
                                      </div>
                                    </div>

                                    {/* Name and Info */}
                                    <div className="flex flex-col text-left">
                                      <span className="max-w-[100px] truncate text-sm font-bold leading-tight md:max-w-[140px]">
                                        {shop.name}
                                      </span>
                                      <span
                                        className={`text-[10px] font-medium uppercase tracking-tighter ${
                                          isSelected
                                            ? "text-white/80"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        Shop
                                      </span>
                                    </div>

                                    {/* Active Indicator */}
                                    {isSelected && (
                                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                        </>
                      ) : (
                        // Empty state
                        <div className="flex w-full flex-col items-center justify-center px-2 py-8 md:px-0">
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
                        className={`mb-4 px-2 text-xl font-semibold md:px-0 ${
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
                        className={`mb-4 px-2 text-xl font-semibold md:px-0 ${
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
                      className={`p-4 px-2 text-center md:px-4 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Select a restaurant or shop to view items.
                    </div>
                  ) : null}
                </div>
                {/* Order Summary Component - Now handled as a floating card within CheckoutItems */}
                {((selectedRestaurantId && selectedRestaurant) ||
                  (selectedShopId && selectedShop)) && (
                  <div className="w-full">
                    {loadingItems ? (
                      <div className="hidden md:block">
                        <CheckoutSkeleton />
                      </div>
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
                            successRedirectPath="/restaurant/"
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
                                shopLat={
                                  selectedShop.latitude
                                    ? parseFloat(selectedShop.latitude)
                                    : 0
                                }
                                shopLng={
                                  selectedShop.longitude
                                    ? parseFloat(selectedShop.longitude)
                                    : 0
                                }
                                shopAlt={0}
                                isFoodCart={false}
                                successRedirectPath="/shops/"
                              />
                            );
                          })()
                        ) : null}
                      </AuthGuard>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
