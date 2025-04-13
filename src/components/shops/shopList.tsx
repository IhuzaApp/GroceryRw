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
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Select a {category === "Bakery" ? "Bakery" : "Supermarket"} to start shopping
      </h3>

      {filteredShops.length === 0 ? (
        <p className="text-gray-500">No shops found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop)}
              className="bg-white cursor-pointer rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center text-center border hover:border-green-500"
            >
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-24 object-cover mb-4"
              />
              <h4 className="text-lg font-medium text-gray-800">{shop.name}</h4>
              <p className="text-sm text-gray-500">{shop.description}</p>
              <p className="text-green-500 mt-2 text-sm font-semibold">Start Shopping →</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
