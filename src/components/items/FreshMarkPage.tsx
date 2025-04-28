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

interface Shop {
  id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  latitude: string;
  longitude: string;
  operating_hours: any;
  is_active: boolean;
}

interface FreshMarkPageProps {
  shop: Shop;
  products?: Product[];
}

const FreshMarkPage: React.FC<FreshMarkPageProps> = ({ shop, products }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  // Merge fetched shop details with additional mock fields and products
  const shopData = {
    ...shop,
    banner: shop?.image, // fallback banner is shop image
    rating: 4.8,
    reviews: 1245,
    deliveryTime: "15-25 min",
    deliveryFee: "Free",
    distance: "1.2 mi",
    products: products || [],
  };

  // Filter products by category using shopData.products
  const filteredProducts =
    activeCategory === "all"
      ? shopData.products
      : shopData.products.filter((product) => product.category === activeCategory);

  const sanitizeSrc = (raw: string) => {
    if (raw.startsWith('/')) return raw;
    if (raw.startsWith('http')) return raw;
    return '/assets/images/shop-placeholder.jpg';
  }

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          {/* Shop Banner */}
          <div className="relative h-48 bg-gray-200">
            <Image
              src={sanitizeSrc(shopData.image)}
              alt={shopData?.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-black bg-opacity-30">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold">{shopData.name}</h1>
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-yellow-400"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="ml-1 font-medium">{shopData.rating}</span>
                    <span className="ml-1 text-sm">
                      ({shopData.reviews} reviews)
                    </span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{shopData.deliveryTime}</span>
                  <span className="mx-2">•</span>
                  <span>{shopData.deliveryFee} delivery</span>
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
            <p className="text-gray-600">{shopData?.description}</p>
          </div>
          <ItemsSection
            activeCategory={activeCategory}
            shop={shopData}
            filteredProducts={filteredProducts}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </div>
    </RootLayout>
  );
};

export default FreshMarkPage; 