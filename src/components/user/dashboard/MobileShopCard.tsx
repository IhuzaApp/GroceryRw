import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

interface MobileShopCardProps {
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

const MobileShopCard: React.FC<MobileShopCardProps> = ({
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
      <div className="relative mb-3 h-24 w-full transform cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getShopImageUrl(shop.image)}
            alt={shop.name}
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            className="transition-transform duration-300"
            priority={false}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/shop-placeholder.jpg";
              target.onerror = null;
            }}
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full items-center justify-between p-4">
          {/* Left side - Shop info */}
          <div className="flex flex-1 items-center space-x-3">
            {/* Shop Logo */}
            {shop.logo && shop.logo.trim() !== "" && (
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                <img
                  src={shop.logo}
                  alt={`${shop.name} logo`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            
            {/* Shop Name */}
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-lg font-bold drop-shadow-md" style={{ color: 'white' }}>
                {shop.name}
              </h3>
              
              {/* Distance and Time (if logged in) */}
              {isLoggedIn && (
                <div className="mt-1 flex items-center space-x-3 text-xs drop-shadow-sm" style={{ color: 'white' }}>
                  <div className="flex items-center" style={{ color: 'white' }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-1 h-3 w-3"
                      style={{ color: 'white' }}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {dynamics.distance}
                  </div>
                  <div className="flex items-center" style={{ color: 'white' }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-1 h-3 w-3"
                      style={{ color: 'white' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {dynamics.time}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Status badge */}
          <div className="flex-shrink-0">
            {isShopOpen ? (
              <span className="inline-flex items-center rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                Open
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MobileShopCard;
