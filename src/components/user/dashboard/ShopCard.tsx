import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    is_restaurant?: boolean;
  };
  dynamics: {
    distance: string;
    time: string;
    fee: string;
    open: boolean;
  };
  getShopImageUrl: (imageUrl: string | undefined) => string;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, dynamics, getShopImageUrl }) => {
  const isRestaurant = (shop as any).is_restaurant;

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
          />
          {dynamics.open ? (
            <span className="absolute right-2 top-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
              Open
            </span>
          ) : (
            <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-100">
              Closed
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
            {shop.name}
          </h3>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {shop.description?.slice(0, 80) || "No description"}
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
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
            <span className="mx-2 text-gray-300">•</span>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1 h-4 w-4"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              {dynamics.distance}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard; 