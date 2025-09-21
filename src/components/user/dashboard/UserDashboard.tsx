import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { Data } from "../../../types";
import ShopCard from "./ShopCard";
import SortDropdown from "./SortDropdown";
import { Button, Dropdown } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import LoadingScreen from "../../ui/LoadingScreen";

// Helper Components
const CategoryIcon = ({ category }: { category: string }) => {
  const icons: { [key: string]: string } = {
    "Super Market": "🛒",
    "Public Markets": "🏪",
    Bakeries: "🥖",
    Butchers: "🥩",
    Delicatessen: "🥪",
    "Organic Shops": "🌿",
    "Specialty Foods": "🍱",
    Restaurant: "🍽️",
  };

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl dark:bg-green-900">
      {icons[category] || "🏪"}
    </div>
  );
};

const MobileCategoryDropdown = ({
  categories,
  selectedCategory,
  onSelect,
  onClear,
}: {
  categories: any[];
  selectedCategory: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span>
          {selectedCategory
            ? categories.find((c) => c.id === selectedCategory)?.name
            : "Select Category"}
        </span>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {selectedCategory && (
            <button
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className="w-full border-b border-gray-200 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Clear Selection
            </button>
          )}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onSelect(category.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center space-x-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedCategory === category.id
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <CategoryIcon category={category.name} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper Functions
function getShopImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return "/images/shop-placeholder.jpg";

  // Handle relative paths (like "profile.png")
  if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
    return "/images/shop-placeholder.jpg";
  }

  // If it's a relative path starting with /, it's likely a valid local image
  if (imageUrl.startsWith("/")) {
    // Check if the image exists in the expected location
    // Handle common cases where images might be in different directories
    const commonImageMappings: { [key: string]: string } = {
      "publicMarket.jpg": "/assets/images/publicMarket.jpg",
      "backeryImage.jpg": "/assets/images/backeryImage.jpg",
      "Bakery.webp": "/assets/images/Bakery.webp",
      "Butcher.webp": "/assets/images/Butcher.webp",
      "delicatessen.jpeg": "/assets/images/delicatessen.jpeg",
      "OrganicShop.jpg": "/assets/images/OrganicShop.jpg",
      "shopping.jpg": "/assets/images/shopping.jpg",
      "shopsImage.jpg": "/assets/images/shopsImage.jpg",
      "superMarkets.jpg": "/assets/images/superMarkets.jpg",
    };

    // Check if this is a known image that might be in the assets directory
    for (const [filename, correctPath] of Object.entries(commonImageMappings)) {
      if (imageUrl.includes(filename)) {
        return correctPath;
      }
    }

    return imageUrl;
  }

  // For external URLs, check if they're valid
  if (imageUrl.startsWith("http")) {
    // Allow all external URLs except example.com
    if (imageUrl.includes("example.com")) {
      return "/images/shop-placeholder.jpg";
    }
    return imageUrl;
  }

  // Fallback to placeholder
  return "/images/shop-placeholder.jpg";
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Main Component
export default function UserDashboard({ initialData }: { initialData: Data }) {
  const { role, authReady } = useAuth();
  const [data, setData] = useState<Data>(
    initialData || {
      users: [],
      categories: [],
      shops: [],
      products: [],
      addresses: [],
      carts: [],
      cartItems: [],
      orders: [],
      orderItems: [],
      shopperAvailability: [],
      deliveryIssues: [],
      notifications: [],
      platformSettings: [],
      restaurants: [],
    }
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [shopDynamics, setShopDynamics] = useState<
    Record<
      string,
      { distance: string; time: string; fee: string; open: boolean }
    >
  >({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Fetch data if initialData is empty or missing
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we don't have shops data or if shops array is empty
      if ((!data.shops || data.shops.length === 0) && !isFetchingData) {
        setIsFetchingData(true);
        try {
          // Fetch shops and categories in parallel
          const [shopsResponse, categoriesResponse, restaurantsResponse] =
            await Promise.all([
              fetch("/api/queries/shops"),
              fetch("/api/queries/categories"),
              fetch("/api/queries/restaurants").catch(() => ({
                json: () => ({ restaurants: [] }),
              })), // Handle restaurants gracefully
            ]);

          const shopsData = await shopsResponse.json();
          const categoriesData = await categoriesResponse.json();
          const restaurantsData = await restaurantsResponse.json();

          setData((prevData) => ({
            ...prevData,
            shops: shopsData.shops || [],
            categories: categoriesData.categories || [],
            restaurants: restaurantsData.restaurants || [],
          }));
        } catch (error) {
          console.error("Error fetching data:", error);
          // Set empty arrays as fallback
          setData((prevData) => ({
            ...prevData,
            shops: prevData.shops || [],
            categories: prevData.categories || [],
            restaurants: prevData.restaurants || [],
          }));
        } finally {
          setIsFetchingData(false);
        }
      }
    };

    fetchData();
  }, [data.shops, data.categories, data.restaurants, isFetchingData]);

  useEffect(() => {
    if (authReady) {
      setDataLoaded(true);
    }
  }, [data, authReady]);

  const handleNearbyClick = async () => {
    if (isNearbyActive) {
      // Deactivate nearby filter
      setIsNearbyActive(false);
      setUserLocation(null);

      // Restore user's default address from database instead of clearing cookie
      try {
        const response = await fetch("/api/queries/addresses");
        const data = await response.json();
        const defaultAddress = (data.addresses || []).find(
          (a: any) => a.is_default
        );

        if (defaultAddress) {
          // Convert default address to the format expected by delivery calculations
          const locationData = {
            latitude: defaultAddress.latitude || "0",
            longitude: defaultAddress.longitude || "0",
            altitude: "0",
            street: defaultAddress.street,
            city: defaultAddress.city,
            postal_code: defaultAddress.postal_code,
          };
          Cookies.set("delivery_address", JSON.stringify(locationData));
        } else {
          // If no default address, remove the cookie to trigger fallback
          Cookies.remove("delivery_address");
        }

        // Trigger recomputation of shop dynamics
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("addressChanged"));
        }, 100);
      } catch (err) {
        console.error("Error restoring default address:", err);
        // Fallback: remove cookie if API call fails
        Cookies.remove("delivery_address");
      }

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // 1 minute cache
          });
        }
      );

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setIsNearbyActive(true);

      // Store location in cookie for delivery calculations
      const locationData = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        altitude: "0",
      };
      Cookies.set("delivery_address", JSON.stringify(locationData));

      // Trigger recomputation of shop dynamics
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("addressChanged"));
      }, 100);
    } catch (err) {
      console.error("Error getting location:", err);
      setError(
        "Unable to get your location. Please check location permissions."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    if (!authReady || role === "shopper" || !data) return [];

    let shops = data.shops || [];
    let restaurants = data.restaurants || [];

    // Convert restaurants to shop format for consistent rendering
    const restaurantsAsShops = restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.location || "Restaurant",
      image: restaurant.profile,
      category_id: "restaurant-category",
      latitude: restaurant.lat,
      longitude: restaurant.long,
      operating_hours: null,
      is_restaurant: true,
    }));

    if (selectedCategory) {
      // If "Restaurant" category is selected, show only restaurants
      if (selectedCategory === "restaurant-category") {
        return restaurantsAsShops;
      } else {
        // Filter shops by category
        shops = shops.filter((shop) => shop.category_id === selectedCategory);
        return shops;
      }
    }

    // When no category is selected, show both shops and restaurants
    let allShops = [...shops, ...restaurantsAsShops];

    // Filter by distance if nearby mode is active
    if (isNearbyActive && userLocation) {
      allShops = allShops.filter((shop) => {
        if (!shop.latitude || !shop.longitude) return false;

        const shopLat = parseFloat(shop.latitude);
        const shopLng = parseFloat(shop.longitude);
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          shopLat,
          shopLng
        );

        // Only show shops within 3 kilometers
        return distance <= 3;
      });
    }

    // Sort the shops based on selected criteria
    allShops.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "distance":
          const aDistance = parseFloat(
            shopDynamics[a.id]?.distance?.replace(" km", "") || "999"
          );
          const bDistance = parseFloat(
            shopDynamics[b.id]?.distance?.replace(" km", "") || "999"
          );
          return aDistance - bDistance;
        case "rating":
          // Mock rating for now - you can add real rating data later
          const aRating = 4.5; // Mock rating
          const bRating = 4.3; // Mock rating
          return bRating - aRating; // Higher rating first
        case "reviews":
          // Mock reviews count for now
          const aReviews = 1245; // Mock reviews
          const bReviews = 890; // Mock reviews
          return bReviews - aReviews; // More reviews first
        case "delivery_time":
          const aTime = shopDynamics[a.id]?.time || "N/A";
          const bTime = shopDynamics[b.id]?.time || "N/A";
          // Extract minutes from time string (e.g., "45 mins" -> 45)
          const aMinutes = parseInt(aTime.match(/(\d+)/)?.[1] || "999");
          const bMinutes = parseInt(bTime.match(/(\d+)/)?.[1] || "999");
          return aMinutes - bMinutes; // Lower time first
        default:
          return 0;
      }
    });

    return allShops;
  }, [
    authReady,
    role,
    selectedCategory,
    data.shops,
    data.restaurants,
    data.categories,
    sortBy,
    shopDynamics,
    isNearbyActive,
    userLocation,
  ]);

  // Separate useMemo for shops without dynamics to avoid circular dependency
  const shopsWithoutDynamics = useMemo(() => {
    if (!authReady || role === "shopper" || !data) return [];

    let shops = data.shops || [];
    let restaurants = data.restaurants || [];

    // Convert restaurants to shop format for consistent rendering
    const restaurantsAsShops = restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.location || "Restaurant",
      image: restaurant.profile,
      category_id: "restaurant-category",
      latitude: restaurant.lat,
      longitude: restaurant.long,
      operating_hours: null,
      is_restaurant: true,
    }));

    if (selectedCategory) {
      // If "Restaurant" category is selected, show only restaurants
      if (selectedCategory === "restaurant-category") {
        return restaurantsAsShops;
      } else {
        // Filter shops by category
        shops = shops.filter((shop) => shop.category_id === selectedCategory);
        return shops;
      }
    }

    // When no category is selected, show both shops and restaurants
    let allShops = [...shops, ...restaurantsAsShops];

    // Filter by distance if nearby mode is active
    if (isNearbyActive && userLocation) {
      allShops = allShops.filter((shop) => {
        if (!shop.latitude || !shop.longitude) return false;

        const shopLat = parseFloat(shop.latitude);
        const shopLng = parseFloat(shop.longitude);
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          shopLat,
          shopLng
        );

        // Only show shops within 3 kilometers
        return distance <= 3;
      });
    }

    return allShops;
  }, [
    authReady,
    role,
    selectedCategory,
    data.shops,
    data.restaurants,
    data.categories,
    isNearbyActive,
    userLocation,
  ]);

  useEffect(() => {
    if (!authReady || role === "shopper") return;

    const computeDynamics = () => {
      const cookie = Cookies.get("delivery_address");
      if (!cookie) {
        setShopDynamics({});
        return;
      }
      try {
        const userAddr = JSON.parse(cookie);
        const userLat = parseFloat(userAddr.latitude || "0");
        const userLng = parseFloat(userAddr.longitude || "0");
        const userAlt = parseFloat(userAddr.altitude || "0");
        const newDyn: Record<
          string,
          { distance: string; time: string; fee: string; open: boolean }
        > = {};

        shopsWithoutDynamics.forEach((shop) => {
          if (shop.latitude && shop.longitude) {
            const shopLat = parseFloat(shop.latitude);
            const shopLng = parseFloat(shop.longitude);
            const distKm = getDistanceFromLatLonInKm(
              userLat,
              userLng,
              shopLat,
              shopLng
            );
            const shopAlt = parseFloat((shop as any).altitude || "0");
            const altKm = (shopAlt - userAlt) / 1000;
            const dist3D = Math.sqrt(distKm * distKm + altKm * altKm);
            const distance = `${Math.round(dist3D * 10) / 10} km`;
            const travelTime = Math.ceil(dist3D);
            const totalTime = travelTime + 40;
            let time = `${totalTime} mins`;
            if (totalTime >= 60) {
              const hours = Math.floor(totalTime / 60);
              const mins = totalTime % 60;
              time = `${hours}h ${mins}m`;
            }
            const fee =
              distKm <= 3
                ? "1000 frw"
                : `${1000 + Math.round((distKm - 3) * 300)} frw`;

            let isOpen = false;
            const hoursObj = shop.operating_hours;
            if (hoursObj && typeof hoursObj === "object") {
              const now = new Date();
              const dayKey = now
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase();
              const todaysHours = (hoursObj as any)[dayKey];

              if (todaysHours && todaysHours.toLowerCase() !== "closed") {
                const parts = todaysHours
                  .split("-")
                  .map((s: string) => s.trim());
                if (parts.length === 2) {
                  const parseTime = (tp: string): number | null => {
                    const m = tp.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
                    if (!m) return null;
                    let h = parseInt(m[1], 10);
                    const mm = m[2] ? parseInt(m[2], 10) : 0;
                    const ampm = m[3].toLowerCase();
                    if (h === 12) h = 0;
                    if (ampm === "pm") h += 12;
                    return h * 60 + mm;
                  };
                  const openMins = parseTime(parts[0]);
                  const closeMins = parseTime(parts[1]);
                  if (openMins !== null && closeMins !== null) {
                    const nowMins = now.getHours() * 60 + now.getMinutes();
                    if (openMins < closeMins) {
                      // Normal case: shop opens and closes on the same day
                      isOpen = nowMins >= openMins && nowMins <= closeMins;
                    } else {
                      // Special case: shop opens one day and closes the next (e.g., 8pm - 2am)
                      isOpen = nowMins >= openMins || nowMins <= closeMins;
                    }
                  }
                }
              } else if (
                todaysHours &&
                todaysHours.toLowerCase() === "closed"
              ) {
                isOpen = false;
              }
            }
            newDyn[shop.id] = { distance, time, fee, open: isOpen };
          }
        });
        setShopDynamics(newDyn);
      } catch (err) {
        console.error("Error computing shop dynamics:", err);
      }
    };

    computeDynamics();
    window.addEventListener("addressChanged", computeDynamics);
    return () => window.removeEventListener("addressChanged", computeDynamics);
  }, [shopsWithoutDynamics, authReady, role]);

  const handleCategoryClick = (categoryId: string) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        setSelectedCategory(categoryId);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to filter shops. Please try again.");
        setIsLoading(false);
      }
    }, 300);
  };

  const clearFilter = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        setSelectedCategory(null);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to clear filter. Please try again.");
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleRefreshData = async () => {
    setIsFetchingData(true);
    try {
      // Fetch shops and categories in parallel
      const [shopsResponse, categoriesResponse, restaurantsResponse] =
        await Promise.all([
          fetch("/api/queries/shops"),
          fetch("/api/queries/categories"),
          fetch("/api/queries/restaurants").catch(() => ({
            json: () => ({ restaurants: [] }),
          })),
        ]);

      const shopsData = await shopsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const restaurantsData = await restaurantsResponse.json();

      setData((prevData) => ({
        ...prevData,
        shops: shopsData.shops || [],
        categories: categoriesData.categories || [],
        restaurants: restaurantsData.restaurants || [],
      }));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  // Helper function to display sort option names
  const getSortDisplayName = (key: string) => {
    switch (key) {
      case "name":
        return "Name";
      case "distance":
        return "Distance";
      case "rating":
        return "Rating";
      case "reviews":
        return "Reviews";
      case "delivery_time":
        return "Delivery Time";
      default:
        return key;
    }
  };

  if (!authReady || !dataLoaded) {
    return <LoadingScreen />;
  }

  // Show loading state only if we're fetching data and have no shops at all
  if (isFetchingData && (!data.shops || data.shops.length === 0)) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-0 md:ml-16 md:p-4">
      <div className="container mx-auto">
        {/* Shop Categories */}
        <div className="mt-0 md:mt-4">
          <div className="mb-2 flex items-center justify-between md:mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            {selectedCategory && (
              <button
                onClick={clearFilter}
                className="hidden rounded-full bg-green-600 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 md:block"
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

          {/* Mobile Dropdown */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ) : (
              <MobileCategoryDropdown
                categories={[
                  ...(data?.categories || []),
                  // Add Restaurant category if restaurants exist
                  ...(data?.restaurants && data.restaurants.length > 0
                    ? [
                        {
                          id: "restaurant-category",
                          name: "Restaurant",
                          description: "Restaurants and dining",
                          created_at: new Date().toISOString(),
                          image: "",
                          is_active: true,
                        },
                      ]
                    : []),
                ]}
                selectedCategory={selectedCategory}
                onSelect={handleCategoryClick}
                onClear={clearFilter}
              />
            )}
          </div>

          {/* Desktop Grid */}
          <div className="hidden grid-cols-3 gap-4 md:grid lg:grid-cols-8">
            {isLoading
              ? Array(7)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="mb-3 h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  ))
              : [
                  ...(data?.categories || []),
                  // Add Restaurant category if restaurants exist
                  ...(data?.restaurants && data.restaurants.length > 0
                    ? [
                        {
                          id: "restaurant-category",
                          name: "Restaurant",
                          description: "Restaurants and dining",
                          created_at: new Date().toISOString(),
                          image: "",
                          is_active: true,
                        },
                      ]
                    : []),
                ].map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`group relative flex cursor-pointer flex-col items-center rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      selectedCategory === category.id
                        ? "border-green-500 bg-green-50 shadow-md dark:border-green-400 dark:bg-green-900/20"
                        : "border-gray-200 hover:border-green-200 dark:border-gray-700 dark:hover:border-green-700"
                    }`}
                  >
                    <CategoryIcon category={category.name} />
                    <span className="mt-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                      {category.name}
                    </span>
                    {selectedCategory === category.id && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Shops */}
        <div className="mt-4 md:mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedCategory
                ? data?.categories?.find((c) => c.id === selectedCategory)
                    ?.name || "Selected Category"
                : "All Mart"}
            </h4>
            <div className="flex items-center gap-2">
              {/* Refresh Button - Hidden on mobile */}
              <button
                onClick={handleRefreshData}
                disabled={isFetchingData}
                className="hidden items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 md:flex"
              >
                <svg
                  className={`h-4 w-4 ${isFetchingData ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isFetchingData ? "Refreshing..." : "Refresh"}
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
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <ShopSkeleton key={index} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
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

// Loading screen component is now imported from @components/ui/LoadingScreen

function ShopSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border shadow-sm dark:border-gray-700">
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800"></div>
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-100 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700"></div>
        <div className="mt-2 h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}
