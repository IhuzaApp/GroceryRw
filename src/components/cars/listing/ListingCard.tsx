"use client";

import React from "react";
import { Star, MapPin, Fuel, Settings2, UserCheck, ArrowRight } from "lucide-react";
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
      className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white transition-all dark:border-white/5 dark:bg-[#121212] flex flex-col h-full shadow-sm hover:shadow-lg active:scale-95 duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={car.image} alt={car.name} fill className="object-cover" />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
           <div className="rounded-full bg-black/50 px-2 py-0.5 text-[7px] font-black uppercase text-white !text-white backdrop-blur-md">{car.type}</div>
           {car.driverOption !== 'none' && (
             <div className="rounded-full bg-purple-600 px-2 py-0.5 text-[7px] font-black uppercase text-white !text-white flex items-center gap-1">
               <UserCheck className="h-2 w-2" />
               Driver
             </div>
           )}
        </div>
        <div className="absolute bottom-2 left-2 flex items-baseline gap-0.5">
           <span className="text-lg font-black text-white !text-white font-outfit drop-shadow-lg">{formatCurrencySync(car.price)}</span>
           <span className="text-[8px] font-black text-white/80 !text-white uppercase">/d</span>
        </div>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs md:text-sm font-black font-outfit truncate pr-2 text-gray-900 dark:text-white">{car.name}</h3>
          <div className="flex items-center gap-0.5 text-[9px] font-medium text-yellow-500">
            <Star className="h-2.5 w-2.5 fill-yellow-400" />
            {car.rating}
          </div>
        </div>
        
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[8px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
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
