import React from "react";
import Image from "next/image";


export default function MainBanners(){
    return(
        <div className="relative z-10 -mx-4 flex hidden gap-4 overflow-x-auto px-4 pb-4 lg:flex">
        <div className="relative h-[220px] min-w-[300px] flex-1 overflow-hidden rounded-xl bg-green-800">
          <div className="max-w-[60%] p-6 text-white">
            <h2 className="text-3xl font-bold leading-tight">
              MEAL PLAN WITH GROCERY STORE
            </h2>
          </div>
          <div className="absolute bottom-0 right-0">
            <Image
              src="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
              alt="Meal plan products"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative h-[220px] min-w-[300px] flex-1 overflow-hidden rounded-xl bg-purple-800">
          <div className="max-w-[60%] p-6 text-white">
            <h2 className="text-3xl font-bold leading-tight">
              MAKING THE MOST OF YOUR GROCERY
            </h2>
          </div>
          <div className="absolute bottom-0 right-0">
            <Image
              src="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
              alt="Ice cream products"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative h-[220px] min-w-[300px] flex-1 overflow-hidden rounded-xl bg-teal-800">
          <div className="max-w-[60%] p-6 text-white">
            <h2 className="text-3xl font-bold leading-tight">
              SHOPPING WITH GROCERY STORE
            </h2>
          </div>
          <div className="absolute bottom-0 right-0">
            <Image
              src="https://png.pngtree.com/png-vector/20230905/ourmid/pngtree-composition-with-grocery-products-in-shopping-basket-diet-png-image_9948113.png"
              alt="Ice cream products"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>
      </div>

    )
}