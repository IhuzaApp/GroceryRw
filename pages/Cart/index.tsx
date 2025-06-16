"use client";

import Image from "next/image";
import { Input, InputGroup, Button, Checkbox, Badge, Panel } from "rsuite";
import Link from "next/link";
import { useState, useEffect } from "react";
import RootLayout from "@components/ui/layout";
import ItemCartTable from "@components/UserCarts/cartsTable";
import CheckoutItems from "@components/UserCarts/checkout/checkoutCard";

// Skeleton loader for shop selection cards
function ShopSelectionSkeleton() {
  return (
    <div className="relative h-24 w-40 min-w-[10rem] flex-shrink-0 animate-pulse rounded-lg bg-gray-200 p-2" />
  );
}

// Skeleton loader for checkout summary
function CheckoutSkeleton() {
  return (
    <>
      {/* Mobile view skeleton */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 animate-pulse rounded-2xl bg-white p-6 shadow-2xl md:hidden" />
      {/* Desktop view skeleton */}
      <div className="hidden w-full md:block lg:w-1/3">
        <div className="sticky top-20 animate-pulse space-y-4 rounded-xl bg-white p-4 shadow-lg">
          <div className="h-8 rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-12 rounded bg-gray-200" />
        </div>
      </div>
    </>
  );
}

export default function CartMainPage() {
  // User's active shops (carts): id, name, and number of line items
  const [shops, setShops] = useState<
    {
      id: string;
      name: string;
      count?: number;
      latitude: string;
      longitude: string;
    }[]
  >([]);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartUnits, setCartUnits] = useState<number>(0);
  const [loadingShops, setLoadingShops] = useState<boolean>(true);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  // Load user's carts on mount
  useEffect(() => {
    setLoadingShops(true);
    fetch("/api/carts")
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to load carts, status:", res.status);
          // return empty carts to prevent undefined
          return { carts: [] };
        }
        return res.json();
      })
      .then(
        (data: {
          carts: Array<{
            id: string;
            name: string;
            count?: number;
            latitude: string;
            longitude: string;
          }>;
        }) => {
          setShops(data.carts);
          if (data.carts.length > 0) setSelectedCartId(data.carts[0].id);
        }
      )
      .catch((err) => {
        console.error("Failed to load carts:", err);
        setShops([]);
      })
      .finally(() => setLoadingShops(false));
  }, []);

  const handleSelectCart = (cartId: string) => setSelectedCartId(cartId);

  // Find the selected shop to pass coordinates
  const selectedShop = shops.find((s) => s.id === selectedCartId);

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          {/* Cart Selection */}
          <div className="mb-6 flex items-center">
            <Link href="/" className="flex items-center text-gray-700">
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
            <h1 className="text-2xl font-bold">My Shopping Carts</h1>
          </div>

          <div className="mb-6">
            <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
              {loadingShops
                ? Array(5)
                    .fill(0)
                    .map((_, index) => <ShopSelectionSkeleton key={index} />)
                : shops.map((shop) => (
                    <div
                      key={shop.id}
                      onClick={() => handleSelectCart(shop.id)}
                      className={`relative w-40 min-w-[10rem] flex-shrink-0 cursor-pointer rounded-lg border-2 p-2 transition-all ${
                        selectedCartId === shop.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-white">
                            <svg
                              width="94px"
                              height="94px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                              <g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></g>
                              <g id="SVGRepo_iconCarrier">
                                {" "}
                                <path
                                  d="M16.53 2H7.47C6.27 2 5.67 2 5.18 2.3C4.7 2.6 4.43 3.14 3.89 4.21L2.49 7.76C2.17 8.58 1.88 9.55 2.43 10.24C2.79 10.7 3.36 11 4 11C5.1 11 6 10.1 6 9C6 10.1 6.9 11 8 11C9.1 11 10 10.1 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 10.1 14.9 11 16 11C17.1 11 18 10.1 18 9C18 10.1 18.9 11 20 11C20.64 11 21.2 10.7 21.57 10.24C22.12 9.55 21.83 8.58 21.51 7.76L20.11 4.21C19.57 3.14 19.3 2.6 18.82 2.3C18.33 2 17.73 2 16.53 2Z"
                                  fill="#c651c8"
                                ></path>{" "}
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M20 21.25H22C22.4142 21.25 22.75 21.5858 22.75 22C22.75 22.4142 22.4142 22.75 22 22.75H2C1.58579 22.75 1.25 22.4142 1.25 22C1.25 21.5858 1.58579 21.25 2 21.25H4L4 12.5C4.74363 12.5 5.43309 12.2681 6 11.8727C6.56692 12.2681 7.25638 12.5 8 12.5C8.74363 12.5 9.43309 12.2681 10 11.8727C10.5669 12.2681 11.2564 12.5 12 12.5C12.7436 12.5 13.4331 12.2681 14 11.8727C14.5669 12.2681 15.2564 12.5 16 12.5C16.7436 12.5 17.4331 12.2681 18 11.8727C18.5669 12.2681 19.2564 12.5 20 12.5L20 21.25ZM9.5 21.25H14.5V18.5C14.5 17.5654 14.5 17.0981 14.299 16.75C14.1674 16.522 13.978 16.3326 13.75 16.2009C13.4019 16 12.9346 16 12 16C11.0654 16 10.5981 16 10.25 16.2009C10.022 16.3326 9.83261 16.522 9.70096 16.75C9.5 17.0981 9.5 17.5654 9.5 18.5V21.25Z"
                                  fill="#c651c8"
                                ></path>{" "}
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="truncate">
                          <h3 className="truncate text-sm font-medium">
                            {shop.name}
                          </h3>
                        </div>
                      </div>
                      {/* Show number of distinct items in this cart */}
                      <Badge
                        content={shop.count}
                        className="absolute -right-2 bg-green-500 text-white"
                      />
                      {selectedCartId === shop.id && (
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
                  ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Cart Items Column */}
            <div className="w-full lg:w-2/3">
              {selectedCartId ? (
                <>
                  <h2 className="mb-4 text-xl font-semibold">
                    {shops.find((s) => s.id === selectedCartId)?.name}
                  </h2>
                  <ItemCartTable
                    shopId={selectedCartId}
                    onTotalChange={setCartTotal}
                    onUnitsChange={setCartUnits}
                    onLoadingChange={setLoadingItems}
                  />
                </>
              ) : (
                <div className="p-4 text-gray-500">
                  Select a cart to view items.
                </div>
              )}
            </div>
            {/* Order Summary Column */}
            {selectedCartId && selectedShop && (
              <>
                {loadingItems ? (
                  <CheckoutSkeleton />
                ) : (
                  <CheckoutItems
                    shopId={selectedCartId!}
                    Total={cartTotal}
                    totalUnits={cartUnits}
                    shopLat={parseFloat(selectedShop.latitude)}
                    shopLng={parseFloat(selectedShop.longitude)}
                    shopAlt={parseFloat((selectedShop as any).altitude || "0")}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
