import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "@components/ui/layout";
import ItemsSection from "@components/items/itemsSection";
import Cookies from "js-cookie";

interface Product {
  id: string;
  name?: string; // Keep for backward compatibility
  ProductName?: {
    id: string;
    name: string;
    description?: string;
    barcode?: string;
    sku?: string;
    image?: string;
    create_at?: string;
  };
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
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  // State to hold dynamic distance/time for hydration
  const [dynamicDistance, setDynamicDistance] = useState("1.2 km");
  const [dynamicDeliveryTime, setDynamicDeliveryTime] = useState("15-25 min");
  // Track mount for hydration-safe rendering
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle highlighting and scrolling to specific product
  useEffect(() => {
    const { highlight } = router.query;
    if (highlight && typeof highlight === 'string') {
      // Wait for products to load and then scroll to the highlighted product
      const timer = setTimeout(() => {
        const productElement = document.getElementById(`product-${highlight}`);
        if (productElement) {
          // Scroll to the product with some offset for better visibility
          const elementPosition = productElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px offset from top
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Add a temporary highlight effect with shadow
          productElement.classList.add('shadow-2xl', 'shadow-purple-500/50', 'transform', 'scale-105', 'rounded-xl');
          setTimeout(() => {
            productElement.classList.remove('shadow-2xl', 'shadow-purple-500/50', 'transform', 'scale-105', 'rounded-xl');
          }, 3000);
        }
      }, 500); // Wait 500ms for products to render
      
      return () => clearTimeout(timer);
    }
  }, [router.query, products]);

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
          (product) =>
            (product.ProductName?.name || product.name) &&
            product.category === activeCategory
        );

  const sanitizeSrc = (raw: string | null | undefined) => {
    if (raw && raw.startsWith("/")) return raw;
    if (raw && raw.startsWith("http")) return raw;
    return "/images/shop-placeholder.jpg";
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-20">
        {/* Desktop Banner - Hidden on mobile */}
        <div className="hidden sm:block relative">
          {/* Hero Banner */}
          <div className="relative h-40 overflow-hidden sm:h-48 lg:h-56">
            <Image
              src={sanitizeSrc(shopData.image)}
              alt={shopData?.name}
              fill
              className="object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/80" />
            
            {/* Back Button */}
            <Link
              href="/"
              className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105 dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800"
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

            {/* Shop Info Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
                  {/* Shop Logo */}
                  <div className="mb-4 sm:mb-0 sm:mr-6">
                    <div className="relative">
                      <Image
                        src={sanitizeSrc(shopData.logo)}
                        alt={`${shopData.name} logo`}
                        width={100}
                        height={100}
                        className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-2xl sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                      />
                      {/* Online Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500 shadow-lg"></div>
                    </div>
                  </div>

                  {/* Shop Details */}
                  <div className="flex-1 text-white">
                    <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                      {shopData.name}
                    </h1>
                    <p className="mt-2 text-sm opacity-90 sm:text-base">
                      {shopData?.description}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {/* Rating */}
                      <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <svg className="mr-1.5 h-4 w-4 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="text-sm font-semibold">
                          {shopData.rating} ({shopData.reviews})
                        </span>
                      </div>

                      {/* Delivery Time */}
                      <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold">
                          {isMounted ? shopData.deliveryTime : "15-25 min"}
                        </span>
                      </div>

                      {/* Distance */}
                      <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-semibold">
                          {shopData.distance}
                        </span>
                      </div>

                      {/* Delivery Fee */}
                      <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1-1h-1a1 1 0 00-1 1v5a1 1 0 001 1h1a1 1 0 001-1V7z" />
                        </svg>
                        <span className="text-sm font-semibold">
                          {shopData.deliveryFee} delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation & Search Section */}
          <div className="relative -mt-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800 sm:p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products in this store..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:bg-gray-600 sm:text-base"
                  />
                </div>
              </div>

              {/* Category Navigation */}
              <div className="mb-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Categories</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Array.from(new Set(shopData.products.map((p: any) => p.category))).map((category: string) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        activeCategory === category
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeCategory === "all"
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Products
                  </button>
                </div>
              </div>

              {/* Product Count & Sort */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} products available
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                  <div className="relative">
                    <select className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-green-400 dark:focus:ring-green-400/20 dark:hover:border-gray-500">
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Simple header with back button */}
        <div className="sm:hidden">
          {/* Mobile Header */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between p-4">
              {/* Back Button */}
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
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
              
              {/* Shop Name */}
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {shopData.name}
              </h1>
              
              {/* Placeholder for balance */}
              <div className="h-10 w-10"></div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:bg-gray-600"
              />
            </div>
          </div>

          {/* Mobile Categories */}
          <div className="px-4 pb-4 bg-white dark:bg-gray-800">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === "all"
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Products
              </button>
              {Array.from(new Set(shopData.products.map((p: any) => p.category))).map((category: string) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="px-4 pt-4 sm:pt-8 sm:px-6 lg:px-8">
          <ItemsSection
            activeCategory={activeCategory}
            shop={shopData}
            filteredProducts={filteredProducts}
            setActiveCategory={setActiveCategory}
            highlightProductId={router.query.highlight as string}
          />
        </div>
      </div>
    </RootLayout>
  );
};

export default FreshMarkPage;
