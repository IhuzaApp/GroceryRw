import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    logo?: string;
    is_restaurant?: boolean;
    operating_hours?: any;
  };
  dynamics: {
    distance: string;
    time: string;
    fee: string;
    open: boolean;
  };
  getShopImageUrl: (imageUrl: string | undefined) => string;
}

const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  dynamics,
  getShopImageUrl,
}) => {
  const { isLoggedIn } = useAuth();
  const isRestaurant = (shop as any).is_restaurant;

  // Calculate if shop is open based on operating hours
  const calculateShopStatus = (): boolean => {
    const hoursObj = shop.operating_hours;
    if (!hoursObj || typeof hoursObj !== "object") {
      return false;
    }

    const now = new Date();
    const dayKey = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const todaysHours = (hoursObj as any)[dayKey];
    
    if (!todaysHours) {
      return false;
    }

    if (todaysHours.toLowerCase() === "closed") {
      return false;
    }

    // Parse time format like "9am - 5pm"
    const parts = todaysHours.split("-").map((s: string) => s.trim());
    if (parts.length !== 2) {
      return false;
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
      return false;
    }

    const nowMins = now.getHours() * 60 + now.getMinutes();
    let isOpen = false;

    if (openMins < closeMins) {
      // Normal case: shop opens and closes on the same day
      isOpen = nowMins >= openMins && nowMins <= closeMins;
    } else {
      // Special case: shop opens one day and closes the next (e.g., 8pm - 2am)
      isOpen = nowMins >= openMins || nowMins <= closeMins;
    }

    return isOpen;
  };

  // Use calculated status instead of dynamics.open
  const isShopOpen = calculateShopStatus();

  return (
    <Link href={isRestaurant ? `/restaurant/${shop.id}` : `/shops/${shop.id}`}>
      <div className="relative transform cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
          <Image
            src={getShopImageUrl(shop.image)}
            alt={shop.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            className="transition-transform duration-300 hover:scale-105"
            priority={false}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/shop-placeholder.jpg";
              target.onerror = null;
            }}
            onLoad={() => {}}
          />
      
          {isShopOpen ? (
            <span className="absolute right-2 top-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
              Open
            </span>
          ) : (
            <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-100">
              Closed
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="mb-1 text-base sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
            {shop.logo && shop.logo.trim() !== "" && (
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 bg-white shadow-sm overflow-hidden flex-shrink-0">
                <img
                  src={shop.logo}
                  alt={`${shop.name} logo`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={() => {}}
                />
              </div>
            )}
            <span>{shop.name}</span>
          </h3>
          <p className="hidden sm:block text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {shop.description?.slice(0, 80) || "No description"}
          </p>
          {isLoggedIn && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-1 h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {dynamics.time}
              </div>
              <div className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-1 h-4 w-4"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {dynamics.distance}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
