import React from "react";
import { Input, InputGroup, Button, Checkbox } from "rsuite"
import Image from "next/image"

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

export default function ItemCartTable(){
return(
    <>
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

    </>
)
}