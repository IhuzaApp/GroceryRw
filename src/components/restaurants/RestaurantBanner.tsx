import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RestaurantSearchBar } from './RestaurantSearchBar';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  lat: string;
  long: string;
  profile: string;
  verified: boolean;
  created_at: string;
}

interface RestaurantBannerProps {
  restaurant: Restaurant;
  onSearch: (query: string) => void;
}

export const RestaurantBanner: React.FC<RestaurantBannerProps> = React.memo(({ restaurant, onSearch }) => {
  return (
    <div className="relative">
      <div className="h-56 w-full overflow-hidden">
        <Image
          key={`restaurant-banner-${restaurant.id}`}
          src={restaurant.profile || "/assets/images/restaurantImage.webp"}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
          unoptimized={false}
          quality={85}
          onError={(e) => {
            console.log('Image failed to load, trying fallback');
            const target = e.target as HTMLImageElement;
            target.src = "/assets/images/restaurantImage.webp";
          }}
          onLoad={() => {
            console.log('Restaurant image loaded successfully');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      
      {/* Back Button */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
      >
        <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      {/* Search Bar */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md px-4">
        <RestaurantSearchBar
          placeholder="Search dishes..."
          onSearch={onSearch}
          isSticky={false}
        />
      </div>

      {/* Restaurant Info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 !text-white">
        <h1 className="text-2xl font-bold !text-white">{restaurant.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm !text-white">
          {restaurant.verified && (
            <div className="flex items-center gap-1 !text-white">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="!text-white">Verified</span>
            </div>
          )}
          <div className="flex items-center gap-1 !text-white">
            <svg className="h-4 w-4 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="!text-white">{restaurant.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

RestaurantBanner.displayName = 'RestaurantBanner';

export default RestaurantBanner;
