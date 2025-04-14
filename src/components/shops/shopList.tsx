import React, { useState } from "react";

interface Shop {
  id: number;
  name: string;
  image: string;
  category: string;
  description?: string;
}

const mockShops: Shop[] = [
  {
    id: 1,
    name: "Fresh Mart",
    image: "/assets/images/shopsImage.jpg",
    category: "Super Market",
    description: "Groceries and daily needs",
  },
  {
    id: 2,
    name: "Market Place",
    image: "/assets/images/shopsImage.jpg",
    category: "Super Market",
    description: "Your daily essentials in one place",
  },
  {
    id: 3,
    name: "Golden Crust",
    image: "/assets/images/backeryImage.jpg",
    category: "Bakery",
    description: "Bread & pastries made fresh",
  },
  {
    id: 4,
    name: "Sweet Oven",
    image: "/assets/images/backeryImage.jpg",
    category: "Bakery",
    description: "Cakes, cookies, and artisan treats",
  },
];

export default function ShopList({
  category,
  onSelectShop,
}: {
  category: string;
  onSelectShop: (shop: Shop) => void;
}) {
  const filteredShops = mockShops.filter((shop) => shop.category === category);

  return (
    <div className="px-4 py-6">
      <h3 className="mb-4 text-xl font-semibold text-gray-700">
        Select a {category === "Bakery" ? "Bakery" : "Supermarket"} to start
        shopping
      </h3>

      {filteredShops.length === 0 ? (
        <p className="text-gray-500">No shops found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop)}
              className="flex cursor-pointer flex-col items-center rounded-xl border bg-white p-4 text-center shadow-md transition hover:border-green-500 hover:shadow-lg"
            >
              <img
                src={shop.image}
                alt={shop.name}
                className="mb-4 h-24 w-full object-cover"
              />
              <h4 className="text-lg font-medium text-gray-800">{shop.name}</h4>
              <p className="text-sm text-gray-500">{shop.description}</p>
              <p className="mt-2 text-sm font-semibold text-green-500">
                Start Shopping →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
