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
    deliveryFee: "Free",
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

  const sanitizeSrc = (raw: string) => {
    if (raw.startsWith("/")) return raw;
    if (raw.startsWith("http")) return raw;
    return "/assets/images/shop-placeholder.jpg";
  };

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
                  <span>{isMounted ? shopData.deliveryTime : "15-25 min"}</span>
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
