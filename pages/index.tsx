import { useEffect, useState } from "react";
import RootLayout from "@components/ui/layout";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { hasuraClient } from '../src/lib/hasuraClient';
import { gql } from 'graphql-request';
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
  ShopCardProps
} from '../src/types';

import ItemsSection from "@components/items/itemsSection";
import MainBanners from "@components/ui/banners";
import Link from "next/link";
import { Button, Panel } from "rsuite";
import { log } from "node:console";

// Skeleton Loader Component
function ShopSkeleton() {
  return (
    <div className="border rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 w-full bg-gray-100"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-gray-100 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-100 rounded mt-2"></div>
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="h-8 p-2 border rounded-md bg-gray-100 animate-pulse" />
  );
}

// Add this helper function at the top of the file
function getShopImageUrl(imageUrl: string | undefined): string {
  // List of valid image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  // Check if the URL has a valid image extension
  const hasValidExtension = validExtensions.some(ext => 
    imageUrl?.toLowerCase().endsWith(ext)
  );

  // If the URL is invalid or doesn't have a valid extension, use the default image
  if (!imageUrl || !hasValidExtension) {
    return '/images/shop-placeholder.jpg';
  }

  // If the URL is from example.com, use the default image
  if (imageUrl.includes('example.com')) {
    return '/images/shop-placeholder.jpg';
  }

  return imageUrl;
}

export default function Home({ initialData }: { initialData: Data }) {
  const [data, setData] = useState<Data>(initialData);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetched data:", data);
    console.log("Categories:", data.categories);
    console.log("Shops:", data.shops);
  }, [data]);

  const filteredShops = selectedCategory
    ? data.shops?.filter((shop) => {
        console.log("Shop category_id:", shop.category_id);
        console.log("Selected category:", selectedCategory);
        return shop.category_id && shop.category_id === selectedCategory;
      })
    : data.shops;

  console.log("Filtered shops:", filteredShops);

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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              {selectedCategory && (
                <button
                  onClick={clearFilter}
                  className="text-white bg-green-700 hover:bg-green-800 px-4 py-2 rounded-full text-sm transition-colors duration-200"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <CategorySkeleton key={index} />
                ))
              ) : (
                data.categories?.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`cursor-pointer p-2 text-center border rounded-md hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 ${
                      selectedCategory === category.id 
                        ? "border-green-500 bg-green-50 shadow-md" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-medium text-gray-800">{category.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shops */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory
                  ? data.categories?.find((c) => c.id === selectedCategory)?.name
                  : "All Shops"}
              </h2>
              <Link 
                href="#" 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <ShopSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredShops?.length ? (
                  filteredShops.map((shop) => (
                    <Link key={shop.id} href={`/shops/${shop.id}`}>
                      <div className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                        <div className="h-48 w-full relative bg-gray-100">
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
                              target.src = '/images/shop-placeholder.jpg';
                              target.onerror = null; // Prevent infinite loop
                            }}
              />
            </div>
                        <div className="p-5">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">{shop.name}</h3>
                          <p className="text-gray-500 text-sm leading-relaxed">
                            {shop.description?.slice(0, 80) || "No description"}
                          </p>
                          <div className="mt-2 flex items-center">
                            <div className="flex items-center">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-yellow-400">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                              <span className="ml-1 text-sm font-medium">{shop.rating ?? 4.5}</span>
                            </div>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-600">{shop.distance ?? "1.2 mi"}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <div className="flex items-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 h-4 w-4">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {shop.deliveryTime ?? "15-25 min"}
                            </div>
                            <span className="mx-2 text-gray-300">•</span>
                            <div className="flex items-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 h-4 w-4">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                              </svg>
                              {shop.deliveryFee ?? "Free"}
                            </div>
                          </div>
                        </div>
          </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 mt-8">
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
