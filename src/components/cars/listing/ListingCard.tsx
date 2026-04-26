"use client";

import React from "react";
import {
  Star,
  MapPin,
  Fuel,
  Settings2,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { Car } from "../../../constants/dummyCars";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface ListingCardProps {
  car: Car;
  onClick: () => void;
}

export default function ListingCard({ car, onClick }: ListingCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg active:scale-95 dark:border-white/5 dark:bg-[#121212]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={car.image} alt={car.name} fill className="object-cover" />
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          <div className="rounded-full bg-black/50 px-2 py-0.5 text-[7px] font-black uppercase !text-white text-white backdrop-blur-md">
            {car.type}
          </div>
          {car.driverOption !== "none" && (
            <div className="flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[7px] font-black uppercase !text-white text-white">
              <UserCheck className="h-2 w-2" />
              Driver
            </div>
          )}
        </div>
        <div className="absolute bottom-2 left-2 flex items-baseline gap-0.5">
          <span className="font-outfit text-lg font-black !text-white text-white drop-shadow-lg">
            {formatCurrencySync(car.price)}
          </span>
          <span className="text-[8px] font-black uppercase !text-white text-white/80">
            /d
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="truncate pr-2 font-outfit text-xs font-black text-gray-900 dark:text-white md:text-sm">
            {car.name}
          </h3>
          <div className="flex items-center gap-0.5 text-[9px] font-medium text-yellow-500">
            <Star className="h-2.5 w-2.5 fill-yellow-400" />
            {car.rating}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2 text-[8px] font-medium uppercase tracking-tighter text-gray-400 dark:border-white/5 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-2 w-2 text-green-500" />
            {car.location}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-200 dark:text-white/5">|</span>
            <span>{car.fuelType}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
