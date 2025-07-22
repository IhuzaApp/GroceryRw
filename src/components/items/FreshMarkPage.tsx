import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import RootLayout from "@components/ui/layout";
import ItemsSection from "@components/items/itemsSection";
import Cookies from "js-cookie";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  final_price: string;
  unit?: string;
  category: string;
  sale?: boolean;
  originalPrice?: string;
  description?: string;
  measurement_unit?: string;
}

interface Shop {
  id: string;
  name: string;
  description: string;
  image: string;
  logo: string;
  address: string;
  latitude: string;
  longitude: string;
  altitude?: string;
  operating_hours: any;
  is_active: boolean;
}

interface FreshMarkPageProps {
  shop: Shop;
  products?: Product[];
}

// Add helper for Haversine formula
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const FreshMarkPage: React.FC<FreshMarkPageProps> = ({ shop, products }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  // State to hold dynamic distance/time for hydration
  const [dynamicDistance, setDynamicDistance] = useState("1.2 km");
  const [dynamicDeliveryTime, setDynamicDeliveryTime] = useState("15-25 min");
  // Track mount for hydration-safe rendering
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute dynamic distance/time on client only to avoid hydration mismatch
  useEffect(() => {
    const cookie = Cookies.get("delivery_address");
    if (!cookie || !shop.latitude || !shop.longitude) return;
    try {
      const userAddr = JSON.parse(cookie);
      const userLat = parseFloat(userAddr.latitude);
      const userLng = parseFloat(userAddr.longitude);
      const shopLat = parseFloat(shop.latitude);
      const shopLng = parseFloat(shop.longitude);
      const distKm = getDistanceFromLatLonInKm(
        userLat,
        userLng,
        shopLat,
        shopLng
      );
      const userAlt = parseFloat(userAddr.altitude || "0");
      const shopAlt = parseFloat((shop as any).altitude || "0");
      const altKm = (shopAlt - userAlt) / 1000;
      const dist3D = Math.sqrt(distKm * distKm + altKm * altKm);
      const roundedKm3D = Math.round(dist3D * 10) / 10;
      setDynamicDistance(`${roundedKm3D} km`);
      // Compute travel time (1 min per km) plus shopping time
      const travelTime = Math.ceil(dist3D); // 1 km ≈ 1 min
      const totalTime = travelTime + 40;
      let timeStr: string;
      if (totalTime >= 60) {
        const hours = Math.floor(totalTime / 60);
        const mins = totalTime % 60;
        timeStr = `${hours}h ${mins}m`;
      } else {
        timeStr = `${totalTime} mins`;
      }
      setDynamicDeliveryTime(timeStr);
    } catch (err) {
      console.error("Error computing distance/time:", err);
    }
  }, [shop.latitude, shop.longitude]);

  // Merge fetched shop details with additional mock fields and products
  const shopData = {
    ...shop,
    banner: shop?.image, // fallback banner is shop image
    rating: 4.8,
    reviews: 1245,
    deliveryTime: dynamicDeliveryTime,
    deliveryFee: "Charged", // This is where "Free" is set
    distance: dynamicDistance,
    products: products || [],
  };

  // Filter products by category using shopData.products
  const filteredProducts =
    activeCategory === "all"
      ? shopData.products
      : shopData.products.filter(
          (product) => product.category === activeCategory
        );

  const sanitizeSrc = (raw: string | null | undefined) => {
    if (raw && raw.startsWith("/")) return raw;
    if (raw && raw.startsWith("http")) return raw;
    return "/assets/images/shop-placeholder.jpg";
  };

  return (
    <RootLayout>
      <div className="p-2 sm:p-4 md:ml-16">
        <div className="container mx-auto">
          {/* Shop Banner */}
          <div className="relative h-56 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 sm:h-48">
            <Image
              src={sanitizeSrc(shopData.image)}
              alt={shopData?.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/50 to-transparent text-center sm:items-end sm:justify-start sm:text-left">
              <div className="w-full p-4 text-white sm:p-6">
                <Image
                  src={sanitizeSrc(shopData.logo)}
                  alt={`${shopData.name} logo`}
                  width={80}
                  height={80}
                  className="mx-auto mb-3 h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg sm:mx-0 sm:h-24 sm:w-24"
                />
                <h1 className="text-3xl font-bold !text-white sm:text-4xl">
                  {shopData.name}
                </h1>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <div className="flex items-center rounded-full bg-white/25 px-3 py-1 text-xs font-semibold !text-white backdrop-blur-sm">
                    <svg
                      className="-ml-1 mr-1.5 h-4 w-4 text-yellow-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="!text-white">
                      {shopData.rating} ({shopData.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center rounded-full bg-white/25 px-3 py-1 text-xs font-semibold !text-white backdrop-blur-sm">
                    <svg
                      className="-ml-1 mr-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="!text-white">
                      {isMounted ? shopData.deliveryTime : "15-25 min"}
                    </span>
                  </div>
                  <div className="flex items-center rounded-full bg-white/25 px-3 py-1 text-xs font-semibold !text-white backdrop-blur-sm">
                    <svg
                      className="-ml-1 mr-1.5 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1-1h-1a1 1 0 00-1 1v5a1 1 0 001 1h1a1 1 0 001-1V7z" />
                    </svg>
                    <span className="!text-white">
                      {shopData.deliveryFee} delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 p-1 backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
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
          <div className="border-b bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {shopData?.description}
            </p>
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
