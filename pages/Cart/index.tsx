import RootLayout from "@components/ui/layout";
import React from "react";
import Image from "next/image"
import { Input, InputGroup, Button, Checkbox } from "rsuite"

import Link from "next/link"
import ItemCartTable from "@components/UserCarts/cartsTable";

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

<ItemCartTable />

     
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
  