"use client";

import React from "react";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/router";

const CarIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface ListingHeroProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
  activeMainTab: 'explore' | 'bookings';
  setActiveMainTab: (tab: 'explore' | 'bookings') => void;
  bookingCount: number;
}

export default function ListingHero({
  onSearchClick,
  onFilterClick,
  activeMainTab,
  setActiveMainTab,
  bookingCount
}: ListingHeroProps) {
  const router = useRouter();
  return (
    <div className="relative h-[200px] w-full md:hidden">
      <Image
        src="/images/cars/hero.png"
        alt="Explore Rwanda"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-white dark:to-[#0A0A0A]" />

      {/* Top bar with Search & Filter Icons */}
      <div className="absolute top-10 left-0 right-0 px-6 flex items-center justify-between">
        <h1 className="text-xl font-black text-white !text-white font-outfit">Explore</h1>
        <div className="flex gap-2">
          <button
            onClick={onSearchClick}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg"
          >
            <Search className="h-4.5 w-4.5 !text-white" />
          </button>
          <button
            onClick={onFilterClick}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg"
          >
            <SlidersHorizontal className="h-4.5 w-4.5 !text-white" />
          </button>
        </div>
      </div>

      {/* Tab Switcher - Mobile Hero Bottom */}
      <div className="absolute bottom-4 left-6 right-6">
        <div className="flex p-1 bg-black/20 backdrop-blur-xl rounded-[1.25rem] border border-white/10">
          <button
            onClick={() => setActiveMainTab('explore')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all font-outfit flex items-center justify-center gap-2 ${activeMainTab === 'explore'
                ? 'bg-white !text-green-600 shadow-lg'
                : 'text-white/70'
              }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveMainTab('bookings')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all font-outfit flex items-center justify-center gap-2 ${activeMainTab === 'bookings'
                ? 'bg-white !text-green-600 shadow-lg'
                : 'text-white/70'
              }`}
          >
            Bookings
            {bookingCount > 0 && <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[8px] text-white !text-white font-black">{bookingCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
