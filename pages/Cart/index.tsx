"use client"

import Image from "next/image"
import { Input, InputGroup, Button, Checkbox, Badge, Panel } from "rsuite"
import Link from "next/link"
import { useState, useEffect } from "react"
import RootLayout from "@components/ui/layout"
import ItemCartTable from "@components/UserCarts/cartsTable"
import CheckoutItems from "@components/UserCarts/checkout/checkoutCard"

export default function CartMainPage() {
  // User's active shops (carts): id, name, and number of line items
  const [shops, setShops] = useState<{ id: string; name: string; count?: number }[]>([])
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null)
  const [cartTotal, setCartTotal] = useState<number>(0)

  // Load user's carts on mount
  useEffect(() => {
    fetch('/api/carts')
      .then(res => res.json())
      .then((data: { carts: Array<{ id: string; name: string; count?: number }> }) => {
        setShops(data.carts)
        if (data.carts.length > 0) setSelectedCartId(data.carts[0].id)
      })
      .catch(err => console.error('Failed to load carts:', err))
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
    {shops.map((shop) => (
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
              <Image
                src="/placeholder.svg"
                alt={shop.name}
                width={20}
                height={20}
                className="rounded-full"
              />
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
    ))}

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
                <ItemCartTable shopId={selectedCartId} onTotalChange={setCartTotal} />
              </>
            ) : (
              <div className="p-4 text-gray-500">Select a cart to view items.</div>
            )}
          </div>
          {/* Order Summary Column */}
          {selectedCartId && (
            <>
              <CheckoutItems Total={cartTotal} />
            </>
          )}
        </div>
      </div>
                </div>
    </RootLayout>
  )
}
