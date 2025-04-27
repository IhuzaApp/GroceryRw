import { useEffect, useState } from "react";
import RootLayout from "@components/ui/layout";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { hasuraClient } from '../src/lib/hasuraClient';
import { gql } from 'graphql-request';

import ItemsSection from "@components/items/itemsSection";
import MainBanners from "@components/ui/banners";
import Link from "next/link";
import { Button, Panel } from "rsuite";
import { log } from "node:console";

interface Data {
  users?: any[];
  categories?: any[];
  shops?: any[];
  products?: any[];
  addresses?: any[];
  carts?: any[];
  cartItems?: any[];
  orders?: any[];
  orderItems?: any[];
  shopperAvailability?: any[];
  deliveryIssues?: any[];
  notifications?: any[];
  platformSettings?: any[];
}

interface UsersResponse {
  Users: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
  }>;
}

interface CategoriesResponse {
  Categories: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
  }>;
}

interface ShopsResponse {
  Shops: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
  }>;
}

interface ProductsResponse {
  Products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    created_at: string;
  }>;
}

interface AddressesResponse {
  Addresses: Array<{
    id: string;
    user_id: string;
    street: string;
    city: string;
    postal_code: string;
    created_at: string;
  }>;
}

interface CartsResponse {
  Carts: Array<{
    id: string;
    user_id: string;
    created_at: string;
  }>;
}

interface CartItemsResponse {
  Cart_Items: Array<{
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
  }>;
}

interface OrdersResponse {
  Orders: Array<{
    id: string;
    user_id: string;
    status: string;
    created_at: string;
  }>;
}

interface OrderItemsResponse {
  Order_Items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: string;
    created_at: string;
  }>;
}

interface ShopperAvailabilityResponse {
  Shopper_Availability: Array<{
    id: string;
    user_id: string;
    is_available: boolean;
    created_at: string;
  }>;
}

interface DeliveryIssuesResponse {
  Delivery_Issues: Array<{
    id: string;
    order_id: string;
    issue_type: string;
    description: string;
    created_at: string;
  }>;
}

interface NotificationsResponse {
  Notifications: Array<{
    id: string;
    user_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
}

interface PlatformSettingsResponse {
  Platform_Settings: Array<{
    id: string;
    key: string;
    value: string;
    created_at: string;
  }>;
}

export default function Home({ initialData }: { initialData: Data }) {
  const [data, setData] = useState<Data>(initialData);

  useEffect(() => {
    console.log("Fetched data:", data);
  }, [data]);
  console.log();

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
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Shop By Category
              </h2>
              <a href="#" className="text-gray-500">
                View All
              </a>
            </div>

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4">
              <ShopCategoryCard icon="🏪" name="Supermarkets" />
              <ShopCategoryCard icon="🛒" name="Public Markets" />
              <ShopCategoryCard icon="🥖" name="Bakeries" />
              <ShopCategoryCard icon="🥩" name="Butchers" />
              <ShopCategoryCard icon="🧀" name="Delicatessen" />
              <ShopCategoryCard icon="🍷" name="Liquor Stores" />
              <ShopCategoryCard icon="🥬" name="Organic Shops" />
              <ShopCategoryCard icon="🍦" name="Specialty Foods" />
            </div>
          </div>

          {/* Featured Supermarkets */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Featured Supermarkets
              </h2>
              <a href="#" className="text-gray-500">
                View All
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/shops/freshmart">
                <ShopCard
                  name="FreshMart"
                  image="/assets/images/shopsImage.jpg?height=120&width=120"
                  rating={4.8}
                  deliveryTime="15-25 min"
                  deliveryFee="Free"
                  distance="1.2 mi"
                />
              </Link>
              <ShopCard
                name="GreenGrocer"
                image="/assets/images/shopsImage.jpg?height=120&width=120"
                rating={4.6}
                deliveryTime="20-30 min"
                deliveryFee="$1.99"
                distance="2.5 mi"
              />
              <ShopCard
                name="Value Foods"
                image="/assets/images/shopsImage.jpg?height=120&width=120"
                rating={4.5}
                deliveryTime="25-35 min"
                deliveryFee="Free"
                distance="3.1 mi"
              />
            </div>
          </div>

          {/* Public Markets */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Public Markets
              </h2>
              <a href="#" className="text-gray-500">
                View All
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ShopCard
                name="Farmers Market"
                image="/assets/images/shopsImage.jpg?height=120&width=120"
                rating={4.9}
                deliveryTime="20-30 min"
                deliveryFee="$2.99"
                distance="2.8 mi"
              />
              <ShopCard
                name="City Market"
                image="/assets/images/shopsImage.jpg?height=120&width=120"
                rating={4.7}
                deliveryTime="25-40 min"
                deliveryFee="$1.50"
                distance="3.5 mi"
              />
              <ShopCard
                name="Local Harvest"
                image="/assets/images/shopsImage.jpg?height=120&width=120"
                rating={4.8}
                deliveryTime="30-45 min"
                deliveryFee="Free"
                distance="4.2 mi"
              />
            </div>
          </div>

          {/* Bakeries */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Bakeries</h2>
              <a href="#" className="text-gray-500">
                View All
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ShopCard
                name="Artisan Bread Co."
                image="/assets/images/backeryImage.jpg?height=120&width=120"
                rating={4.9}
                deliveryTime="15-25 min"
                deliveryFee="$1.99"
                distance="1.5 mi"
              />
              <ShopCard
                name="Sweet Delights"
                image="/assets/images/backeryImage.jpg?height=120&width=120"
                rating={4.7}
                deliveryTime="20-30 min"
                deliveryFee="$2.50"
                distance="2.3 mi"
              />
              <ShopCard
                name="Morning Bake"
                image="/assets/images/backeryImage.jpg?height=120&width=120"
                rating={4.6}
                deliveryTime="25-35 min"
                deliveryFee="Free"
                distance="3.0 mi"
              />
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
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
    console.error('Error fetching data:', error);
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

interface ShopCardProps {
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  distance: string;
}

function ShopCard({
  name,
  image,
  rating,
  deliveryTime,
  deliveryFee,
  distance,
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
            src={image || "/placeholder.svg"}
            alt={name}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{name}</h3>
          <div className="mt-1 flex items-center">
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
