"use client";

import React from "react";
import Image from "next/image";

const CarIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface PlasDriveHeaderProps {
  activeTab: 'explore' | 'bookings';
  onTabChange: (tab: 'explore' | 'bookings') => void;
  onBecomePartner: () => void;
}

export default function PlasDriveHeader({ 
  activeTab, 
  onTabChange, 
  onBecomePartner 
}: PlasDriveHeaderProps) {
  return (
    <div className="relative hidden md:block overflow-hidden h-[300px] w-full">
      {/* Background Image with Overlay */}
      <Image 
        src="/images/cars/hero.png" 
        alt="Plas Drive" 
        fill 
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      <div className="relative h-full mx-auto max-w-[1600px] px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <CarIcon className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white font-outfit !text-white">Plas Drive</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex p-1.5 bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/10">
            <button 
              onClick={() => onTabChange('explore')}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === 'explore' 
                  ? 'bg-white text-green-600 shadow-xl scale-[1.02]' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Explore
            </button>
            <button 
              onClick={() => onTabChange('bookings')}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === 'bookings' 
                  ? 'bg-white text-green-600 shadow-xl scale-[1.02]' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              My Bookings
            </button>
          </div>
          <button 
            onClick={onBecomePartner}
            className="rounded-[1.25rem] bg-green-500 px-8 py-4 text-sm font-black text-white shadow-2xl shadow-green-500/40 transition-all hover:scale-[1.05] active:scale-[0.98] !text-white"
          >
            Join Plas Ride
          </button>
        </div>
      </div>
    </div>
  );
}
