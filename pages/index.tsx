import { useEffect, useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import RootLayout from "@components/ui/layout";
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
  RestaurantsResponse,
} from "../src/types";

import ShopperDashboard from "@components/shopper/dashboard/ShopperDashboard";
import UserDashboard from "@components/user/dashboard/UserDashboard";
import MainBanners from "@components/ui/banners";

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

// Add this new component for category icons
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
      restaurants,
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
            logo
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
            ProductName {
              name
              description
            }
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
      hasuraClient.request<RestaurantsResponse>(gql`
        query GetRestaurants {
          Restaurants {
            id
            name
            email
            phone
            location
            lat
            long
            profile
            verified
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
          restaurants: restaurants?.Restaurants || [],
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
          restaurants: [],
        },
      },
    };
  }
};
