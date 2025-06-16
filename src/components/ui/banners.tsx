import React from "react";
import Image from "next/image";

export default function MainBanners() {
  return (
    <div className="container mx-auto px-4">
      <div className="relative z-10 flex hidden gap-4 overflow-x-auto pb-4 lg:flex">
        <div className="relative h-[220px] min-w-[300px] flex-1 overflow-hidden rounded-xl bg-green-800 dark:bg-green-900">
          <div className="max-w-[60%] p-6">
            <h2 className="text-3xl font-bold leading-tight !text-white">
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

        <div className="relative h-[220px] min-w-[300px] flex-1 overflow-hidden rounded-xl bg-purple-800 dark:bg-purple-900">
          <div className="max-w-[60%] p-6">
            <h2 className="text-3xl font-bold leading-tight !text-white">
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

        <div className="relative h-[220px] min-w-[300px] flex-1 overflow-hidden rounded-xl bg-teal-800 dark:bg-teal-900">
          <div className="max-w-[60%] p-6">
            <h2 className="text-3xl font-bold leading-tight !text-white">
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
    </div>
  );
}
