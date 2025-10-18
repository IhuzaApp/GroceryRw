import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import Cookies from "js-cookie";
import { Data } from "../../../../types";

// Helper Functions
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

export function useUserDashboardLogic(initialData: Data) {
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
      if ((!data.shops || data.shops.length === 0) && !isFetchingData) {
        setIsFetchingData(true);
        try {
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
          console.error("Error fetching data:", error);
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
      setIsNearbyActive(false);
      setUserLocation(null);

      try {
        const response = await fetch("/api/queries/addresses");
        const data = await response.json();
        const defaultAddress = (data.addresses || []).find(
          (a: any) => a.is_default
        );

        if (defaultAddress) {
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
          Cookies.remove("delivery_address");
        }

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("addressChanged"));
        }, 100);
      } catch (err) {
        console.error("Error restoring default address:", err);
        Cookies.remove("delivery_address");
      }

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setIsNearbyActive(true);

      const locationData = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        altitude: "0",
      };
      Cookies.set("delivery_address", JSON.stringify(locationData));

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
      if (selectedCategory === "restaurant-category") {
        return restaurantsAsShops;
      } else {
        shops = shops.filter((shop) => shop.category_id === selectedCategory);
        return shops;
      }
    }

    let allShops = [...shops, ...restaurantsAsShops];

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

        return distance <= 3;
      });
    }

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
          const aRating = 4.5;
          const bRating = 4.3;
          return bRating - aRating;
        case "reviews":
          const aReviews = 1245;
          const bReviews = 890;
          return bReviews - aReviews;
        case "delivery_time":
          const aTime = shopDynamics[a.id]?.time || "N/A";
          const bTime = shopDynamics[b.id]?.time || "N/A";
          const aMinutes = parseInt(aTime.match(/(\d+)/)?.[1] || "999");
          const bMinutes = parseInt(bTime.match(/(\d+)/)?.[1] || "999");
          return aMinutes - bMinutes;
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

  const shopsWithoutDynamics = useMemo(() => {
    if (!authReady || role === "shopper" || !data) return [];

    let shops = data.shops || [];
    let restaurants = data.restaurants || [];

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
      if (selectedCategory === "restaurant-category") {
        return restaurantsAsShops;
      } else {
        shops = shops.filter((shop) => shop.category_id === selectedCategory);
        return shops;
      }
    }

    let allShops = [...shops, ...restaurantsAsShops];

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
                      isOpen = nowMins >= openMins && nowMins <= closeMins;
                    } else {
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

  return {
    // State
    data,
    selectedCategory,
    isLoading,
    error,
    sortBy,
    isNearbyActive,
    userLocation,
    shopDynamics,
    dataLoaded,
    isFetchingData,
    authReady,
    role,

    // Computed values
    filteredShops,

    // Actions
    handleCategoryClick,
    clearFilter,
    handleSortChange,
    handleNearbyClick,
    handleRefreshData,
  };
}
