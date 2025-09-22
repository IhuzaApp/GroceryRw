"use client";

import Image from "next/image";
import { Input, InputGroup, Button, Checkbox, Badge, Panel } from "rsuite";
import Link from "next/link";
import { useState, useEffect } from "react";
import RootLayout from "@components/ui/layout";
import ItemCartTable from "@components/UserCarts/cartsTable";
import CheckoutItems from "@components/UserCarts/checkout/checkoutCard";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import { useFoodCart, FoodCartRestaurant } from "../../src/context/FoodCartContext";
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

export default function CartMainPage() {
  const { theme } = useTheme();
  const { isLoggedIn } = useAuth();
  const { restaurants, totalItems, totalPrice } = useFoodCart();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartUnits, setCartUnits] = useState<number>(0);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  // Set initial selected restaurant
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  const handleSelectRestaurant = (restaurantId: string) => setSelectedRestaurantId(restaurantId);

  // Find the selected restaurant
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

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
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          {/* Cart Selection */}
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
              My Cart
            </h1>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Cart Items Column - Restaurant Selection + Cart Table */}
            <div className="w-full lg:w-2/3">
              {/* Restaurant Selection */}
              <div className="mb-6">
                <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
                  {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        onClick={() => handleSelectRestaurant(restaurant.id)}
                        className={`relative w-40 min-w-[10rem] flex-shrink-0 cursor-pointer rounded-lg border-2 p-2 transition-all ${
                          selectedRestaurantId === restaurant.id
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : theme === "dark"
                            ? "border-gray-600 bg-gray-800 hover:border-green-400 hover:bg-gray-700"
                            : "border-gray-200 bg-white hover:border-green-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <div
                              className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border ${
                                theme === "dark"
                                  ? "border-gray-600 bg-gray-700"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {restaurant.logo ? (
                                <img
                                  src={restaurant.logo}
                                  alt={`${restaurant.name} logo`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
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
                                } h-5 w-5 text-gray-500`}
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
                          </div>
                          <div className="truncate">
                            <h3
                              className={`truncate text-sm font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {restaurant.name}
                            </h3>
                          </div>
                        </div>
                        {/* Show number of distinct items in this cart */}
                        <Badge
                          content={restaurant.totalItems}
                          className="absolute -right-2 bg-green-500 text-white"
                        />
                        {selectedRestaurantId === restaurant.id && (
                          <div className="absolute -right-2 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
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
                      </div>
                    ))
                  ) : (
                    // Empty restaurants state
                    <div className="flex w-full flex-col items-center justify-center py-8">
                      {/* Empty Cart Icon */}
                      <div className="mb-4 flex justify-center">
                        <svg
                          className={`h-16 w-16 ${
                            theme === "dark" ? "text-gray-600" : "text-gray-400"
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
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Your cart is empty
                      </h3>

                      <p
                        className={`mt-1 text-sm ${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Browse restaurants and add delicious dishes to your cart!
                      </p>

                      <Link
                        href="/shops"
                        className="mt-4 inline-flex items-center justify-center rounded-md bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition duration-150 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-offset-gray-900"
                      >
                        Browse Restaurants
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Table */}
              {selectedRestaurantId && selectedRestaurant ? (
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
                    onTotalChange={setCartTotal}
                    onUnitsChange={setCartUnits}
                    onLoadingChange={setLoadingItems}
                    isFoodCart={true}
                    restaurant={selectedRestaurant}
                  />
                </>
              ) : (
                <div
                  className={`p-4 text-center ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Select a restaurant to view items.
                </div>
              )}
            </div>
            {/* Order Summary Column */}
            {selectedRestaurantId && selectedRestaurant && (
              <>
                {loadingItems ? (
                  <CheckoutSkeleton />
                ) : (
                  <AuthGuard requireAuth={true}>
                    <CheckoutItems
                      shopId={selectedRestaurantId!}
                      Total={cartTotal}
                      totalUnits={cartUnits}
                      shopLat={parseFloat(selectedRestaurant.latitude)}
                      shopLng={parseFloat(selectedRestaurant.longitude)}
                      shopAlt={0}
                      isFoodCart={true}
                      restaurant={selectedRestaurant}
                    />
                  </AuthGuard>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}