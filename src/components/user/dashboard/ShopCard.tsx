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
    rating: number;
    ratingCount: number;
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

  // Determine if this is a store
  const isStore = (shop as any).is_store === true;

  // Determine navigation path
  const getNavigationPath = () => {
    if (isRestaurant) return `/restaurant/${shop.id}`;
    if (isStore) return `/stores/${shop.id}`;
    return `/shops/${shop.id}`;
  };

  // Get image URL - for stores, use the image directly; for shops, use getShopImageUrl
  const getImageUrl = () => {
    if (isStore && shop.image) {
      // For stores, use the image directly (it's already a base64 or full URL)
      return shop.image;
    }
    return getShopImageUrl(shop.image);
  };

  // Get placeholder image
  const getPlaceholderImage = () => {
    if (isStore) {
      return "/images/store-placeholder.jpg";
    }
    return "/images/shop-placeholder.jpg";
  };

  // Format rating from dynamics (real data from database)
  // Rating is on a scale of 1-5
  const hasRating = dynamics.rating > 0 && dynamics.ratingCount > 0;
  const ratingValue = hasRating ? dynamics.rating.toFixed(1) : "New";
  const ratingCount = hasRating ? dynamics.ratingCount.toString() : "0";

  return (
    <Link href={getNavigationPath()} className="block no-underline hover:no-underline" style={{ color: 'inherit', textDecoration: 'none' }}>
      <div className="relative transform cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800">
        {/* Main Image Banner */}
        <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
          <Image
            src={getImageUrl()}
            alt={shop.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            className="transition-transform duration-300 hover:scale-105"
            priority={false}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImage();
              target.onerror = null;
            }}
            onLoad={() => {}}
          />

          {/* Shop Logo - Positioned on image */}
          {shop.logo && shop.logo.trim() !== "" && (
            <div className="absolute bottom-4 left-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-[3px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="h-full w-full overflow-hidden rounded-full bg-white">
                  <img
                    src={shop.logo}
                    alt={`${shop.name} logo`}
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    onLoad={() => {}}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Promo Badge - Top Left */}
          {isStore && (
            <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-gray-900 shadow-md">
              Promo
            </span>
          )}

          {/* Open/Closed Status - Top Right */}
          {isShopOpen ? (
            <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2 py-1 text-xs font-bold !text-white shadow-md">
              Open
            </span>
          ) : (
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold !text-white shadow-md">
              Closed
            </span>
          )}
        </div>

        {/* Shop Details */}
        <div className="bg-white p-4 dark:bg-gray-800">
          <h3 className="mb-2 text-base font-bold text-gray-900 no-underline dark:text-white">
            {shop.name}
          </h3>
          {/* Price • Delivery Time • Rating */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {dynamics.fee !== "N/A" ? dynamics.fee : "Free"}
            </span>
            <span>•</span>
            <span>{dynamics.time}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold">
              {hasRating ? (
                <>
                  <svg
                    className="h-4 w-4 fill-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {ratingValue}
                </>
              ) : (
                ratingValue
              )}{" "}
              ({ratingCount})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
