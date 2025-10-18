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
import ResponsiveUserDashboard from "@components/user/dashboard/ResponsiveUserDashboard";
import MainBanners from "@components/ui/banners";
import LoadingScreen from "@components/ui/LoadingScreen";

// Loading screen component is now imported from @components/ui/LoadingScreen

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
  const { role, authReady, isLoggedIn } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Allow guest access - don't wait for auth to be ready
    if (authReady || !isLoggedIn) {
      setDataLoaded(true);
    }
  }, [authReady, isLoggedIn]);

  if (!dataLoaded) {
    return <LoadingScreen />;
  }

  // Show shopper dashboard only for authenticated shoppers
  if (isLoggedIn && role === "shopper") {
    return <ShopperDashboard />;
  }

  // Ensure initialData is always defined with default values
  const safeInitialData = initialData || {
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
  };

  return (
    <RootLayout>
      <MainBanners />
      <ResponsiveUserDashboard 
        initialData={safeInitialData} 
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
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
