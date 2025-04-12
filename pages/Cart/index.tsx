import RootLayout from "@components/ui/layout";
import React from "react";
import Image from "next/image"
import { Input, InputGroup, Button, Checkbox } from "rsuite"

import Link from "next/link"

export default function CartMainPage(){
    return(
        <RootLayout>
       <div className="p-4 md:ml-16">
        {" "}
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
         {/* Cart Header */}
         <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Your Cart</h1>
          <span className="text-gray-500 ml-2">5 items</span>
        </div>

        {/* Cart Table Header */}
        <div className="hidden md:grid md:grid-cols-12 border-b pb-2 mb-4 text-gray-500 font-medium">
          <div className="md:col-span-6">Product</div>
          <div className="md:col-span-2 text-center">Price</div>
          <div className="md:col-span-2 text-center">Quantity</div>
          <div className="md:col-span-2 text-right">Subtotal</div>
        </div>

        {/* Cart Items */}
        <div className="space-y-6">
          <CartItem
            checked={true}
            image="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
            name="Avocado Evokaado Avakaido Persea Americana Alligator Pear Black"
            size="14oz"
            price="$12.86"
            quantity={4}
            subtotal="$51.44"
          />

          <CartItem
            checked={true}
            image="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
            name="Deliciously Ella Fruit And Nut Muesli 4x500g"
            size="500g"
            price="$20.53"
            quantity={2}
            subtotal="$41.06"
          />

          <CartItem
            checked={true}
            image="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
            name="Mixed Nuts Cashew Nuts, Walnuts, Almonds And Blanched"
            size="24 Oz"
            price="$33.45"
            quantity={1}
            subtotal="$33.45"
          />

          <CartItem
            checked={false}
            image="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
            name="Avocado Evokaado Avakaido Persea Americana Alligator Pear Black"
            size="1 Pieces"
            price="$10.99"
            quantity={1}
            subtotal="$10.99"
          />

          <CartItem
            checked={false}
            image="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
            name="Avocado Evokaado Avakaido Persea Americana Alligator Pear Black"
            size="6 Pieces"
            price="$14.11"
            quantity={2}
            subtotal="$28.22"
          />
        </div>

        {/* Promo Code */}
        <div className="mt-8 border-t pt-6">
          <p className="text-gray-600 mb-2">Do you have any promocode</p>
          <div className="flex gap-2">
            <Input value="SAVE25%" className="max-w-xs" />
            <Button appearance="primary" color="green" className="bg-green-100 text-green-600 font-medium">
              Apply
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex gap-8 mb-4 md:mb-0">
            <div>
              <p className="text-2xl font-bold">$165.16</p>
              <p className="text-gray-500">Cost of items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">-$25</p>
              <p className="text-gray-500">Promo code (SALE25)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">$123.87</p>
              <p className="text-gray-500">Total</p>
            </div>
          </div>
          <Button appearance="primary" size="lg" className="bg-green-500 text-white font-medium px-12">
            Checkout
          </Button>
        </div>
   </div>
   </div>
        </RootLayout>
    )
}

interface CartItemProps {
    checked: boolean
    image: string
    name: string
    size: string
    price: string
    quantity: number
    subtotal: string
  }
  
  function CartItem({ checked, image, name, size, price, quantity, subtotal }: CartItemProps) {
    return (
      <div className="grid grid-cols-12 gap-4 items-center border-b pb-6">
        <div className="col-span-1">
          <Checkbox checked={checked} />
        </div>
        <div className="col-span-2 md:col-span-1">
          <Image src={image || "/placeholder.svg"} alt={name} width={80} height={80} className="rounded-md" />
        </div>
        <div className="col-span-9 md:col-span-4">
          <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-500">{size}</p>
        </div>
        <div className="col-span-4 md:col-span-2 text-center">
          <p className="font-bold">{price}</p>
        </div>
        <div className="col-span-8 md:col-span-2 flex justify-center">
          <div className="flex items-center">
            <Button appearance="subtle" className="h-8 w-8 flex items-center justify-center p-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
            <span className="mx-4 font-medium w-4 text-center">{quantity}</span>
            <Button appearance="subtle" className="h-8 w-8 flex items-center justify-center p-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="col-span-12 md:col-span-2 text-right">
          <p className="font-bold">{subtotal}</p>
        </div>
      </div>
    )
  }
  