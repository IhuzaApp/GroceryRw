"use client"

import Image from "next/image"
import { Input, InputGroup, Button, Checkbox, Badge, Panel } from "rsuite"
import Link from "next/link"
import { useState, useEffect } from "react"
import RootLayout from "@components/ui/layout"
import ItemCartTable from "@components/UserCarts/cartsTable"
import CheckoutItems from "@components/UserCarts/checkout/checkoutCard"

// Skeleton loader for shop selection cards
function ShopSelectionSkeleton() {
  return (
    <div className="relative flex-shrink-0 w-40 min-w-[10rem] h-24 p-2 bg-gray-200 rounded-lg animate-pulse" />
  );
}

// Skeleton loader for checkout summary
function CheckoutSkeleton() {
  return (
    <>
      {/* Mobile view skeleton */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-2xl bg-white p-6 shadow-2xl animate-pulse md:hidden" />
      {/* Desktop view skeleton */}
      <div className="hidden md:block w-full lg:w-1/3">
        <div className="sticky top-20 p-4 space-y-4 bg-white rounded-xl shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </>
  );
}

export default function CartMainPage() {
  // User's active shops (carts): id, name, and number of line items
  const [shops, setShops] = useState<{ id: string; name: string; count?: number }[]>([])
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null)
  const [cartTotal, setCartTotal] = useState<number>(0)
  const [loadingShops, setLoadingShops] = useState<boolean>(true)
  const [loadingItems, setLoadingItems] = useState<boolean>(false)

  // Load user's carts on mount
  useEffect(() => {
    setLoadingShops(true)
    fetch('/api/carts')
      .then(async res => {
        if (!res.ok) {
          console.error('Failed to load carts, status:', res.status)
          // return empty carts to prevent undefined
          return { carts: [] }
        }
        return res.json()
      })
      .then((data: { carts: Array<{ id: string; name: string; count?: number }> }) => {
        setShops(data.carts)
        if (data.carts.length > 0) setSelectedCartId(data.carts[0].id)
      })
      .catch(err => {
        console.error('Failed to load carts:', err)
        setShops([])
      })
      .finally(() => setLoadingShops(false))
  }, [])

  const handleSelectCart = (cartId: string) => setSelectedCartId(cartId)

  return (
  <RootLayout>
    <div className="p-4 md:ml-16">
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">

        {/* Cart Selection */}
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">My Shopping Carts</h1>
        </div>

        <div className="mb-6">
  <div className="flex overflow-x-auto gap-3 mb-4 pb-2">
    {loadingShops ? (
      Array(5).fill(0).map((_, index) => (
        <ShopSelectionSkeleton key={index} />
      ))
    ) : (
      shops.map((shop) => (
        <div
          key={shop.id}
          onClick={() => handleSelectCart(shop.id)}
          className={`relative flex-shrink-0 w-40 min-w-[10rem] cursor-pointer rounded-lg border-2 p-2 transition-all ${
            selectedCartId === shop.id
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
              <svg width="94px" height="94px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.5276 2H7.47201C6.26919 2 5.66778 2 5.18448 2.2987C4.70117 2.5974 4.43221 3.13531 3.8943 4.21114L2.49068 7.75929C2.16639 8.57905 1.88266 9.54525 2.42854 10.2375C2.79476 10.7019 3.36244 11 3.99978 11C5.10435 11 5.99978 10.1046 5.99978 9C5.99978 10.1046 6.89522 11 7.99978 11C9.10435 11 9.99978 10.1046 9.99978 9C9.99978 10.1046 10.8952 11 11.9998 11C13.1044 11 13.9998 10.1046 13.9998 9C13.9998 10.1046 14.8952 11 15.9998 11C17.1044 11 17.9998 10.1046 17.9998 9C17.9998 10.1046 18.8952 11 19.9998 11C20.6371 11 21.2048 10.7019 21.5711 10.2375C22.117 9.54525 21.8333 8.57905 21.509 7.75929L20.1054 4.21114C19.5674 3.13531 19.2985 2.5974 18.8152 2.2987C18.3319 2 17.7305 2 16.5276 2Z" fill="#c651c8"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M20 21.25H22C22.4142 21.25 22.75 21.5858 22.75 22C22.75 22.4142 22.4142 22.75 22 22.75H2C1.58579 22.75 1.25 22.4142 1.25 22C1.25 21.5858 1.58579 21.25 2 21.25H4L4 12.5C4.74363 12.5 5.43309 12.2681 6 11.8727C6.56692 12.2681 7.25638 12.5 8 12.5C8.74363 12.5 9.43309 12.2681 10 11.8727C10.5669 12.2681 11.2564 12.5 12 12.5C12.7436 12.5 13.4331 12.2681 14 11.8727C14.5669 12.2681 15.2564 12.5 16 12.5C16.7436 12.5 17.4331 12.2681 18 11.8727C18.5669 12.2681 19.2564 12.5 20 12.5L20 21.25ZM9.5 21.25H14.5V18.5C14.5 17.5654 14.5 17.0981 14.299 16.75C14.1674 16.522 13.978 16.3326 13.75 16.2009C13.4019 16 12.9346 16 12 16C11.0654 16 10.5981 16 10.25 16.2009C10.022 16.3326 9.83261 16.522 9.70096 16.75C9.5 17.0981 9.5 17.5654 9.5 18.5V21.25Z" fill="#c651c8"></path> </g></svg>
              </div>
            </div>
            <div className="truncate">
              <h3 className="text-sm font-medium truncate">{shop.name}</h3>
            </div>
          </div>
          {/* Show number of distinct items in this cart */}
          <Badge content={shop.count} className="absolute -right-2 bg-green-500 text-white" />
          {selectedCartId === shop.id && (
            <div className="absolute top-1 -right-2 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      ))
    )}

  </div>
</div>


        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items Column */}
          <div className="w-full lg:w-2/3">
            {selectedCartId ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {shops.find(s => s.id === selectedCartId)?.name}
                </h2>
                <ItemCartTable
                  shopId={selectedCartId}
                  onTotalChange={setCartTotal}
                  onLoadingChange={setLoadingItems}
                />
              </>
            ) : (
              <div className="p-4 text-gray-500">Select a cart to view items.</div>
            )}
          </div>
          {/* Order Summary Column */}
          {selectedCartId && (
            <>
              {loadingItems ? <CheckoutSkeleton /> : <CheckoutItems Total={cartTotal} />}
            </>
          )}
        </div>
      </div>
                </div>
    </RootLayout>
  )
}
