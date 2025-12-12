"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import RootLayout from "@components/ui/layout";
import StoreProductCard from "./StoreProductCard";
import { Heart, X, ShoppingBag, Package, Clock, MapPin, CheckCircle, Store, UserCircle } from "lucide-react";
import Cookies from "js-cookie";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface Store {
  id: string;
  name: string;
  description: string;
  image: string;
  logo: string;
  latitude: string;
  longitude: string;
  operating_hours: any;
  is_active: boolean;
  businessAccount?: {
    id: string;
    account_type: string;
    business_name: string | null;
    user_id: string;
    owner?: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
}

interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: string;
  unit: string;
  measurement_unit?: string;
  category?: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  price: string;
  unit: string;
  measurement_unit?: string;
  quantity: number;
  image?: string;
}

interface StorePageProps {
  store: Store;
  products: Product[];
}

// Helper for Haversine formula
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

const StorePage: React.FC<StorePageProps> = ({ store, products }) => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicDistance, setDynamicDistance] = useState("N/A");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate distance
  useEffect(() => {
    const cookie = Cookies.get("delivery_address");
    if (!cookie || !store.latitude || !store.longitude) {
      setDynamicDistance("N/A");
      return;
    }
    try {
      const userAddr = JSON.parse(cookie);
      const userLat = parseFloat(userAddr.latitude);
      const userLng = parseFloat(userAddr.longitude);
      const storeLat = parseFloat(store.latitude);
      const storeLng = parseFloat(store.longitude);
      const distKm = getDistanceFromLatLonInKm(
        userLat,
        userLng,
        storeLat,
        storeLng
      );
      setDynamicDistance(`${Math.round(distKm * 10) / 10} km`);
    } catch (err) {
      console.error("Error computing distance:", err);
    }
  }, [store.latitude, store.longitude]);

  const handleAddProduct = (product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === product.id);
      if (existingIndex >= 0) {
        // Update quantity if product already exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + product.quantity,
        };
        return updated;
      }
      return [...prev, product];
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p))
    );
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (p) => (p.category || "General") === activeCategory
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, activeCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category || "General")));
    return ["all", ...cats];
  }, [products]);

  const totalPrice = useMemo(() => {
    return selectedProducts.reduce(
      (sum, p) => sum + parseFloat(p.price) * p.quantity,
      0
    );
  }, [selectedProducts]);

  const calculateDeliveryTime = () => {
    const distance = parseFloat(dynamicDistance.replace(" km", ""));
    if (isNaN(distance)) return "N/A";

    // Minimum 1 hour + 1 minute per km
    const baseTime = 60; // 1 hour in minutes
    const travelTime = Math.ceil(distance); // 1 minute per km
    const totalMinutes = baseTime + travelTime;

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${totalMinutes} mins`;
  };

  const calculateTransportFee = () => {
    const distance = parseFloat(dynamicDistance.replace(" km", ""));
    if (isNaN(distance)) return 0;

    // Base fee: 1000 RWF for first 3km, then 300 RWF per additional km
    if (distance <= 3) return 1000;
    return 1000 + Math.ceil((distance - 3) * 300);
  };

  const calculateServiceFee = () => {
    // Service fee is 5% of total
    return Math.ceil(totalPrice * 0.05);
  };

  // Calculate if store is currently open
  const calculateStoreStatus = () => {
    if (!store.operating_hours || typeof store.operating_hours !== 'object') {
      return { isOpen: false, statusText: 'Hours not available' };
    }

    const now = new Date();
    const dayKey = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todaysHours = (store.operating_hours as any)[dayKey];

    if (!todaysHours || todaysHours.toLowerCase() === "closed") {
      return { isOpen: false, statusText: 'Closed' };
    }

    // Parse time format like "9am - 5pm"
    const parts = todaysHours.split("-").map((s: string) => s.trim());
    if (parts.length !== 2) {
      return { isOpen: false, statusText: todaysHours };
    }

    const parseTime = (tp: string): number | null => {
      const m = tp.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
      if (!m) return null;
      let h = parseInt(m[1], 10);
      const mm = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3].toLowerCase();
      if (h === 12) h = 0;
      if (ampm === "pm") h += 12;
      return h * 60 + mm;
    };

    const openMins = parseTime(parts[0]);
    const closeMins = parseTime(parts[1]);

    if (openMins === null || closeMins === null) {
      return { isOpen: false, statusText: todaysHours };
    }

    const nowMins = now.getHours() * 60 + now.getMinutes();
    let isOpen = false;

    if (openMins < closeMins) {
      isOpen = nowMins >= openMins && nowMins <= closeMins;
    } else {
      isOpen = nowMins >= openMins || nowMins <= closeMins;
    }

    return { isOpen, statusText: isOpen ? 'Open' : 'Closed', hours: todaysHours };
  };

  const storeStatus = calculateStoreStatus();

  const handleContinue = () => {
    if (selectedProducts.length === 0) return;
    // Navigate to checkout page with store and products data
    const checkoutData = {
      storeId: store.id,
      storeName: store.name,
      products: selectedProducts,
      total: totalPrice,
      transportationFee: calculateTransportFee(),
      serviceFee: calculateServiceFee(),
    };
    localStorage.setItem("storeCheckoutData", JSON.stringify(checkoutData));
    router.push(`/stores/${store.id}/checkout`);
  };

  return (
    <RootLayout>
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 md:ml-16">
        {/* Header */}
        <div className="relative h-40 w-full overflow-hidden sm:h-48 lg:h-56">
          <Image
            src={store.image || "/images/store-placeholder.jpg"}
            alt={store.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-gray-800/90"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-5 w-5 text-gray-900 dark:text-white"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Store Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5 lg:p-6">
            <div className="flex items-end gap-3 sm:gap-4">
              {/* Store Logo/Badge */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-3 border-white bg-white shadow-xl sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                <Image
                  src={store.image || "/images/store-placeholder.jpg"}
                  alt={store.name}
                  width={64}
                  height={64}
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>

              {/* Store Details */}
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <h1 className="text-xl font-bold !text-white drop-shadow-2xl sm:text-2xl lg:text-3xl">
                    {store.name}
                  </h1>
                  {/* Status Badge */}
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold !text-white backdrop-blur-sm sm:px-2.5 sm:text-xs ${
                    store.is_active 
                      ? storeStatus.isOpen 
                        ? 'bg-green-500/90' 
                        : 'bg-orange-500/90'
                      : 'bg-red-500/90'
                  }`}>
                    {store.is_active ? (
                      <>
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{storeStatus.statusText}</span>
                      </>
                    ) : (
                      <>
                        <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                
                {store.description && (
                  <p className="mb-2 line-clamp-1 text-xs !text-white/90 sm:text-sm">
                    {store.description}
                  </p>
                )}
                
                {/* Info Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Owner - Only for personal businesses */}
                  {store.businessAccount?.account_type === "personal" && store.businessAccount.owner?.name && (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5">
                      <UserCircle className="h-3 w-3 !text-white sm:h-3.5 sm:w-3.5" />
                      <span className="text-xs font-medium !text-white sm:text-sm">
                        Owner: {store.businessAccount.owner.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Distance */}
                  {isMounted && dynamicDistance !== "N/A" && (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5">
                      <MapPin className="h-3 w-3 !text-white sm:h-3.5 sm:w-3.5" />
                      <span className="text-xs font-medium !text-white sm:text-sm">{dynamicDistance}</span>
                    </div>
                  )}
                  
                  {/* Operating Hours */}
                  {storeStatus.hours && (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5">
                      <Clock className="h-3 w-3 !text-white sm:h-3.5 sm:w-3.5" />
                      <span className="text-xs font-medium !text-white sm:text-sm">{storeStatus.hours}</span>
                    </div>
                  )}
                  
                  {/* Products Count */}
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5">
                    <Package className="h-3 w-3 !text-white sm:h-3.5 sm:w-3.5" />
                    <span className="text-xs font-medium !text-white sm:text-sm">
                      {products.length} {products.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-6 xl:p-8">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-12 py-3.5 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20 sm:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40"
                      : "bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {category === "all" ? "All Products" : category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center sm:py-16">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 sm:h-20 sm:w-20">
                  <Package className="h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                  {searchQuery
                    ? `No products match "${searchQuery}"`
                    : "This store doesn't have any products yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredProducts.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image}
                    price={product.price}
                    unit={product.unit}
                    measurement_unit={product.measurement_unit}
                    description={product.description}
                    onAdd={handleAddProduct}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Favorites/Sidebar */}
          <div className="w-full border-t border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-0 lg:h-fit lg:max-h-screen lg:w-80 lg:border-l lg:border-t-0 lg:overflow-y-auto lg:shadow-2xl xl:w-96">
            <div className="flex h-full flex-col p-4 lg:p-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 !text-white shadow-lg">
                    <ShoppingBag className="h-5 w-5 !text-white" />
                  </div>
                  <span>
                    Cart
                    {selectedProducts.length > 0 && (
                      <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-sm font-semibold !text-white">
                        {selectedProducts.length}
                      </span>
                    )}
                  </span>
                </h2>
              </div>

              {/* Cart Items */}
              {selectedProducts.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <Heart className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add products to continue
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-gray-700/50"
                      >
                        <div className="flex items-start gap-3">
                          {product.image && (
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-gray-100 dark:ring-gray-700">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1 truncate text-sm font-bold text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <p className="mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
                              {formatCurrencySync(parseFloat(product.price))} / {product.unit}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(product.id, product.quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:scale-110 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                <span className="text-sm font-bold">-</span>
                              </button>
                              <span className="min-w-[2rem] text-center text-sm font-bold text-gray-900 dark:text-white">
                                {product.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(product.id, product.quantity + 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:scale-110 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                <span className="text-sm font-bold">+</span>
                              </button>
                              <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white">
                                {formatCurrencySync(parseFloat(product.price) * product.quantity)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total and Continue Button */}
                  <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        Subtotal:
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrencySync(totalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={handleContinue}
                      disabled={selectedProducts.length === 0}
                      className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-bold !text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Continue to Checkout ({selectedProducts.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default StorePage;

