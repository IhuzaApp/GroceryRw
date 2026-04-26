"use client";

import React from "react";
import Image from "next/image";
import { Dog, Plus } from "lucide-react";

interface PetListingHeaderProps {
  onListPet: () => void;
}

export default function PetListingHeader({ 
  onListPet 
}: PetListingHeaderProps) {
  return (
    <div className="relative hidden md:block overflow-hidden h-[280px] w-full rounded-[3rem] mt-4 mx-4 w-[calc(100%-2rem)]">
      {/* Background Image with Overlay */}
      <Image 
        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop" 
        alt="Pets Marketplace" 
        fill 
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      <div className="relative h-full mx-auto max-w-[1600px] px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <Dog className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white font-outfit !text-white">Pet Marketplace</h1>
            <p className="text-white/60 font-medium mt-2">Manage your listings and reach thousands of pet lovers</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onListPet}
            className="flex items-center gap-3 rounded-[1.5rem] bg-green-500 px-10 py-5 text-lg font-black text-white shadow-2xl shadow-green-500/40 transition-all hover:scale-[1.05] active:scale-[0.98] !text-white"
          >
            <Plus className="h-6 w-6" />
            <span>List Your Pet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
