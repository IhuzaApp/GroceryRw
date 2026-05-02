"use client";

import React from "react";
import Image from "next/image";
import { Dog, Plus } from "lucide-react";

interface PetListingHeaderProps {
  onListPet: () => void;
}

export default function PetListingHeader({ onListPet }: PetListingHeaderProps) {
  return (
    <div className="relative mx-4 mt-4 hidden h-[280px] w-[calc(100%-2rem)] w-full overflow-hidden rounded-[3rem] md:block">
      {/* Background Image with Overlay */}
      <Image
        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop"
        alt="Pets Marketplace"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-between px-12">
        <div className="flex items-center gap-6">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
            <Dog className="h-10 w-10 !text-white text-white" />
          </div>
          <div>
            <h1 className="font-outfit text-5xl font-black tracking-tight !text-white text-white">
              Pet Marketplace
            </h1>
            <p className="mt-2 font-medium !text-white text-white">
              Manage your listings and reach thousands of pet lovers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onListPet}
            className="flex items-center gap-3 rounded-[1.5rem] bg-green-500 px-10 py-5 text-lg font-black !text-white text-white shadow-2xl shadow-green-500/40 transition-all hover:scale-[1.05] active:scale-[0.98]"
          >
            <Plus className="h-6 w-6" />
            <span>List Your Pet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
