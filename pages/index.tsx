import { useEffect, useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import RootLayout from "@components/ui/layout";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../src/lib/hasuraClient";
import { gql } from "graphql-request";
import {
  Data,
  UsersResponse,
  CategoriesResponse,
  ShopsResponse,
  ProductsResponse,
  AddressesResponse,
  CartsResponse,
  CartItemsResponse,
  OrdersResponse,
  OrderItemsResponse,
  ShopperAvailabilityResponse,
  DeliveryIssuesResponse,
  NotificationsResponse,
  PlatformSettingsResponse,
  ShopCardProps,
} from "../src/types";

import ItemsSection from "@components/items/itemsSection";
import MainBanners from "@components/ui/banners";
import Link from "next/link";
import { Button, Panel, Loader, Progress } from "rsuite";
import { log } from "node:console";
import Cookies from "js-cookie";
import ShopperDashboard from "@components/shopper/dashboard/ShopperDashboard";

// Enhanced Loading Component
function LoadingScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // Simulate loading progress
  useEffect(() => {
    const messages = [
      "Initializing...",
      "Loading user data...",
      "Setting up your dashboard...",
      "Almost ready...",
      "Finalizing...",
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }

      setLoadingProgress(progress);

      // Update message based on progress
      const messageIndex = Math.min(
        Math.floor(progress / 25),
        messages.length - 1
      );
      setLoadingMessage(messages[messageIndex]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <div className="mb-6 flex h-24 w-24 items-center justify-center">
        <Loader size="lg" content="" speed="slow" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        Setting up your experience
      </h2>
      <p className="mb-6 text-gray-500">{loadingMessage}</p>

      <div className="w-64 px-4">
        <Progress.Line
          percent={loadingProgress}
          showInfo={false}
          strokeColor="#10b981"
          trailColor="#e5e7eb"
        />
      </div>
    </div>
  );
}

// Skeleton Loader Component
function ShopSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border shadow-sm">
      <div className="h-48 w-full bg-gray-100"></div>
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-100"></div>
        <div className="h-4 w-full rounded bg-gray-100"></div>
        <div className="mt-2 h-4 w-2/3 rounded bg-gray-100"></div>
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="h-8 animate-pulse rounded-md border bg-gray-100 p-2" />
  );
}

// Add this helper function at the top of the file
function getShopImageUrl(imageUrl: string | undefined): string {
  // List of valid image extensions
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  // Check if the URL has a valid image extension
  const hasValidExtension = validExtensions.some((ext) =>
    imageUrl?.toLowerCase().endsWith(ext)
  );

  // If the URL is invalid or doesn't have a valid extension, use the default image
  if (!imageUrl || !hasValidExtension) {
    return "/images/shop-placeholder.jpg";
  }

  // If the URL is from example.com, use the default image
  if (imageUrl.includes("example.com")) {
    return "/images/shop-placeholder.jpg";
  }

  return imageUrl;
}

// Helper for Haversine formula
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

export default function Home({ initialData }: { initialData: Data }) {
  const { role, authReady } = useAuth();
  // Initialize ALL hooks at the top level, before ANY conditional returns
  const [data, setData] = useState<Data>(initialData);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Precomputed dynamics per shop to avoid SSR mismatch
  const [shopDynamics, setShopDynamics] = useState<
    Record<
      string,
      { distance: string; time: string; fee: string; open: boolean }
    >
  >({});

  // Add a state to track if all initial data is loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // Define hooks that don't have conditional dependencies first
  useEffect(() => {
    if (authReady) {
      console.log("Fetched data:", data);
      console.log("Categories:", data.categories);
      console.log("Shops:", data.shops);
      setDataLoaded(true);
    }
  }, [data, authReady]);

  // Calculate filteredShops before using it in other hooks
  const filteredShops =
    !authReady || role === "shopper"
      ? []
      : selectedCategory
      ? data.shops?.filter((shop) => {
          console.log("Shop category_id:", shop.category_id);
          console.log("Selected category:", selectedCategory);
          return shop.category_id && shop.category_id === selectedCategory;
        })
      : data.shops;

  // Compute dynamics on client after mount when filteredShops changes
  useEffect(() => {
    if (!authReady || role === "shopper") return;

    // Function to compute distance, time, and fee for shops
    const computeDynamics = () => {
      const cookie = Cookies.get("delivery_address");
      if (!cookie) {
        setShopDynamics({});
        return;
      }
      try {
        const userAddr = JSON.parse(cookie);
        const userLat = parseFloat(userAddr.latitude);
        const userLng = parseFloat(userAddr.longitude);
        const userAlt = parseFloat(userAddr.altitude || "0");
        const newDyn: Record<
          string,
          { distance: string; time: string; fee: string; open: boolean }
        > = {};
        filteredShops?.forEach((shop) => {
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
            const roundedKm = Math.round(dist3D * 10) / 10;
            const distance = `${Math.round(dist3D * 10) / 10} km`;
            const travelTime = Math.ceil(dist3D); // 1 km ≈ 1 min
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
            // Determine open/closed based on today's operating_hours object
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
                      // Overnight schedule
                      isOpen = nowMins >= openMins || nowMins <= closeMins;
                    }
                  }
                }
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
    // Initial compute
    computeDynamics();
    // Recompute on address change
    window.addEventListener("addressChanged", computeDynamics);
    // Cleanup listener on unmount/filter change
    return () => window.removeEventListener("addressChanged", computeDynamics);
  }, [filteredShops, authReady, role]);

  const handleCategoryClick = (categoryId: string) => {
    setIsLoading(true);
    setError(null);

    // Simulate loading delay for better UX
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

  // Now to the core rendering logic of the Home component
  if (!authReady || !dataLoaded) {
    return <LoadingScreen />;
  }

  if (role === "shopper") {
    return <ShopperDashboard />;
  }

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {" "}
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          {/* Banner */}
          <MainBanners />
          {/* Main Content */}

          {/* Shop Categories */}
          <div className="mt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Shop by Category
              </h2>
              {selectedCategory && (
                <button
                  onClick={clearFilter}
                  className="rounded-full bg-green-700 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-800"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => <CategorySkeleton key={index} />)
                : data.categories?.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`transform cursor-pointer rounded-md border p-2 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                        selectedCategory === category.id
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xs font-medium text-gray-800">
                        {category.name}
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Shops */}
          <div className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory
                  ? data.categories?.find((c) => c.id === selectedCategory)
                      ?.name
                  : "All Shops"}
              </h2>
              <Link
                href="#"
                className="text-gray-500 transition-colors duration-200 hover:text-gray-700"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <ShopSkeleton key={index} />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredShops?.length ? (
                  filteredShops.map((shop) => {
                    // Use precomputed dynamics, default to N/A
                    const dyn = shopDynamics[shop.id] || {
                      distance: "N/A",
                      time: "N/A",
                      fee: "N/A",
                      open: false,
                    };
                    return (
                      <Link key={shop.id} href={`/shops/${shop.id}`}>
                        <div className="relative transform cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          {/* Open/Closed badge */}

                          <div className="relative h-48 w-full bg-gray-100">
                            <Image
                              src={getShopImageUrl(shop.image)}
                              alt={shop.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              style={{ objectFit: "cover" }}
                              className="transition-transform duration-300 hover:scale-105"
                              priority={false}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/shop-placeholder.jpg";
                                target.onerror = null;
                              }}
                            />
                          </div>
                          <div className="p-5">
                            <h3 className="mb-2 text-xl font-semibold text-gray-800">
                              {shop.name}
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-500">
                              {shop.description?.slice(0, 80) ||
                                "No description"}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="mr-1 h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {dyn.time}
                              </div>
                              <span className="mx-2 text-gray-300">•</span>
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="mr-1 h-4 w-4"
                                >
                                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                </svg>
                                {dyn.distance}
                              </div>
                              {dyn.open ? (
                                <span className="absolute right-2 top-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                  Open
                                </span>
                              ) : (
                                <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                  Closed
                                </span>
                              )}
                              {/* <span className="mx-2 text-gray-300">•</span> */}
                              {/* <div className="flex items-center text-sm text-gray-600">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 h-4 w-4">
                                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                </svg>
                                {dyn.fee}
                              </div> */}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="col-span-full mt-8 text-center text-gray-500">
                    No shops found in this category
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const [
      users,
      categories,
      shops,
      products,
      addresses,
      carts,
      cartItems,
      orders,
      orderItems,
      shopperAvailability,
      deliveryIssues,
      notifications,
      platformSettings,
    ] = await Promise.all([
      hasuraClient.request<UsersResponse>(gql`
        query GetUsers {
          Users {
            id
            name
            email
            created_at
          }
        }
      `),
      hasuraClient.request<CategoriesResponse>(gql`
        query GetCategories {
          Categories {
            id
            name
            description
            created_at
            image
            is_active
          }
        }
      `),
      hasuraClient.request<ShopsResponse>(gql`
        query GetShops {
          Shops {
            id
            name
            description
            created_at
            category_id
            image
            is_active
            latitude
            longitude
            operating_hours
            updated_at
          }
        }
      `),
      hasuraClient.request<ProductsResponse>(gql`
        query GetProducts {
          Products {
            id
            name
            description
            price
            created_at
          }
        }
      `),
      hasuraClient.request<AddressesResponse>(gql`
        query GetAddresses {
          Addresses {
            id
            user_id
            street
            city
            postal_code
            created_at
          }
        }
      `),
      hasuraClient.request<CartsResponse>(gql`
        query GetCarts {
          Carts {
            id
            user_id
            created_at
          }
        }
      `),
      hasuraClient.request<CartItemsResponse>(gql`
        query GetCartItems {
          Cart_Items {
            id
            cart_id
            product_id
            quantity
            created_at
          }
        }
      `),
      hasuraClient.request<OrdersResponse>(gql`
        query GetOrders {
          Orders {
            id
            user_id
            status
            created_at
          }
        }
      `),
      hasuraClient.request<OrderItemsResponse>(gql`
        query GetOrderItems {
          Order_Items {
            id
            order_id
            product_id
            quantity
            price
            created_at
          }
        }
      `),
      hasuraClient.request<ShopperAvailabilityResponse>(gql`
        query GetShopperAvailability {
          Shopper_Availability {
            id
            user_id
            is_available
            created_at
          }
        }
      `),
      hasuraClient.request<DeliveryIssuesResponse>(gql`
        query GetDeliveryIssues {
          Delivery_Issues {
            id
            order_id
            issue_type
            description
            created_at
          }
        }
      `),
      hasuraClient.request<NotificationsResponse>(gql`
        query GetNotifications {
          Notifications {
            id
            user_id
            message
            is_read
            created_at
          }
        }
      `),
      hasuraClient.request<PlatformSettingsResponse>(gql`
        query GetPlatformSettings {
          Platform_Settings {
            id
            key
            value
            created_at
          }
        }
      `),
    ]);

    return {
      props: {
        initialData: {
          users: users?.Users || [],
          categories: categories?.Categories || [],
          shops: shops?.Shops || [],
          products: products?.Products || [],
          addresses: addresses?.Addresses || [],
          carts: carts?.Carts || [],
          cartItems: cartItems?.Cart_Items || [],
          orders: orders?.Orders || [],
          orderItems: orderItems?.Order_Items || [],
          shopperAvailability: shopperAvailability?.Shopper_Availability || [],
          deliveryIssues: deliveryIssues?.Delivery_Issues || [],
          notifications: notifications?.Notifications || [],
          platformSettings: platformSettings?.Platform_Settings || [],
        },
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        initialData: {
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
        },
      },
    };
  }
};

function ShopCategoryCard({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
        <span className="text-4xl">{icon}</span>
      </div>
      <span className="font-medium text-gray-800">{name}</span>
    </div>
  );
}

function ShopCard({
  name,
  description,
  rating = 4.5,
  deliveryTime = "15-25 min",
  deliveryFee = "Free",
  distance = "1.2 mi",
}: ShopCardProps) {
  return (
    <Panel
      shaded
      bordered
      bodyFill
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <div className="flex p-4">
        <div className="mr-4 h-[80px] w-[80px] overflow-hidden rounded-lg">
          <Image
            src="/assets/images/shopsImage.jpg?height=120&width=120"
            alt={`${name} shop image`}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-yellow-400"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="ml-1 text-sm font-medium">{rating}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-600">{distance}</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1 h-4 w-4"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {deliveryTime}
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1 h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              {deliveryFee}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
