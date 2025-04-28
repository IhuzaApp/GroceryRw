import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import RootLayout from "@components/ui/layout";
import ItemsSection from "@components/items/itemsSection";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  unit?: string;
  category: string;
  sale?: boolean;
  originalPrice?: string;
  description?: string;
}

interface FreshMarkPageProps {
  products?: Product[];
}

const FreshMarkPage: React.FC<FreshMarkPageProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock shop data
  const shop = {
    id: "freshmart",
    name: "FreshMart",
    image: "/placeholder.svg?height=200&width=200",
    banner: "/placeholder.svg?height=200&width=800",
    rating: 4.8,
    reviews: 1245,
    deliveryTime: "15-25 min",
    deliveryFee: "Free",
    distance: "1.2 mi",
    description:
      "Your one-stop shop for fresh groceries, household essentials, and more.",
    categories: [
      { id: "all", name: "All" },
      { id: "fruits", name: "Fruits & Vegetables" },
      { id: "dairy", name: "Dairy & Eggs" },
      { id: "bakery", name: "Bakery" },
      { id: "meat", name: "Meat & Seafood" },
      { id: "snacks", name: "Snacks" },
      { id: "beverages", name: "Beverages" },
      { id: "household", name: "Household" },
    ],
    products: products || [
      // ... keep the mock products here as fallback ...
    ],
  };

  // Filter products by category
  const filteredProducts =
    activeCategory === "all"
      ? shop.products
      : shop.products.filter((product) => product.category === activeCategory);

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          {/* Shop Banner */}
          <div className="relative h-48 bg-gray-200">
            <Image
              src="/assets/images/shop-placeholder.jpg"
              alt={shop.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-black bg-opacity-30">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold">{shop.name}</h1>
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-yellow-400"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="ml-1 font-medium">{shop.rating}</span>
                    <span className="ml-1 text-sm">
                      ({shop.reviews} reviews)
                    </span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{shop.deliveryTime}</span>
                  <span className="mx-2">•</span>
                  <span>{shop.deliveryFee} delivery</span>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="absolute left-4 top-4 rounded-full bg-white p-2"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

          {/* Shop Description */}
          <div className="border-b bg-white px-4 py-3">
            <p className="text-gray-600">{shop.description}</p>
          </div>
          <ItemsSection
            activeCategory={activeCategory}
            shop={shop}
            filteredProducts={filteredProducts}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </div>
    </RootLayout>
  );
};

export default FreshMarkPage; 