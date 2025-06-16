import { useEffect, useState, useMemo } from "react";
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
import UserDashboard from "@components/user/dashboard/UserDashboard";

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
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="mb-6 flex h-24 w-24 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
        Setting up your experience
      </h2>
      <p className="mb-6 text-gray-500 dark:text-gray-400">{loadingMessage}</p>

      <div className="w-64">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
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

// Update the getShopImageUrl function
function getShopImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return "/images/shop-placeholder.jpg";
  
  // List of valid image extensions
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  // Check if the URL has a valid image extension
  const hasValidExtension = validExtensions.some((ext) =>
    imageUrl.toLowerCase().endsWith(ext)
  );

  // If the URL doesn't have a valid extension, use the default image
  if (!hasValidExtension) {
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

// Add this new component for category icons
const CategoryIcon = ({ category }: { category: string }) => {
  const icons: { [key: string]: string } = {
    'Super Market': '🛒',
    'Public Markets': '🏪',
    'Bakeries': '🥖',
    'Butchers': '🥩',
    'Delicatessen': '🥪',
    'Organic Shops': '🌿',
    'Specialty Foods': '🍱'
  };

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl dark:bg-green-900">
      {icons[category] || '🏪'}
    </div>
  );
};

// Add this new component for the mobile dropdown
const MobileCategoryDropdown = ({ 
  categories, 
  selectedCategory, 
  onSelect, 
  onClear 
}: { 
  categories: any[], 
  selectedCategory: string | null, 
  onSelect: (id: string) => void,
  onClear: () => void 
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
            ? categories.find(c => c.id === selectedCategory)?.name 
            : 'Select Category'}
        </span>
        <svg
          className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-200'
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

export default function Home({ initialData }: { initialData: Data }) {
  const { role, authReady } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (authReady) {
      setDataLoaded(true);
    }
  }, [authReady]);

  if (!authReady || !dataLoaded) {
    return <LoadingScreen />;
  }

  if (role === "shopper") {
    return <ShopperDashboard />;
  }

  return (
    <RootLayout>
          <MainBanners />
      <UserDashboard initialData={initialData} />
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
