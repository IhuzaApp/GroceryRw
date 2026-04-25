"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Car as CarIcon, Users, Fuel, Settings2, Star, ChevronRight } from "lucide-react";
import { DUMMY_CARS, Car } from "../../constants/dummyCars";
import { useTheme } from "../../context/ThemeContext";

const VEHICLE_TYPES = ["All", "Sedan", "SUV", "Truck", "Hatchback", "Luxury"];
const FUEL_TYPES = ["All", "Fuel", "Electric", "Hybrid", "Diesel"];

export default function CarListing() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");

  const filteredCars = useMemo(() => {
    return DUMMY_CARS.filter((car) => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "All" || car.type === selectedType;
      const matchesFuel = selectedFuel === "All" || car.fuelType === selectedFuel;
      return matchesSearch && matchesType && matchesFuel && car.status === 'active';
    });
  }, [searchQuery, selectedType, selectedFuel]);

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sticky Header with Search - Mobile Only */}
      <div className={`sticky top-0 z-30 px-4 py-4 backdrop-blur-xl md:hidden ${theme === 'dark' ? 'bg-black/40 border-b border-white/5' : 'bg-white/70 border-b border-gray-200'}`}>
        <div className="relative mx-auto max-w-2xl">
          <div className={`flex items-center rounded-2xl border px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your dream car..."
              className="ml-3 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className={`ml-2 rounded-xl p-2 transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <Filter className="h-5 w-5 text-green-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        {/* Type Filters */}
        <div className="mb-6 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-2">
            {VEHICLE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel Filters */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Fuel Type</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {FUEL_TYPES.map((fuel) => (
              <button
                key={fuel}
                onClick={() => setSelectedFuel(fuel)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                  selectedFuel === fuel
                    ? 'border-green-500 bg-green-500/10 text-green-500'
                    : theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${selectedFuel === fuel ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {fuel}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">Available Vehicles</h2>
          <span className="text-sm font-bold text-gray-500">{filteredCars.length} results</span>
        </div>

        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} theme={theme} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
              <CarIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold">No cars found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CarCard({ car, theme }: { car: Car; theme: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
      theme === 'dark' ? 'bg-[#121212] border-white/5 hover:border-white/10 hover:shadow-green-500/5' : 'bg-white border-gray-100 hover:shadow-gray-200'
    }`}>
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Badge */}
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black backdrop-blur-md shadow-xl">
          {car.type}
        </div>
        
        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 flex items-end gap-1">
          <span className="text-2xl font-black text-white shadow-sm">${car.price}</span>
          <span className="mb-1 text-xs font-bold text-white/80">/ day</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight">{car.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold">{car.rating}</span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2">
          <div className={`flex flex-col items-center justify-center rounded-2xl py-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Users className="mb-1 h-4 w-4 text-green-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">{car.passengers} Seats</span>
          </div>
          <div className={`flex flex-col items-center justify-center rounded-2xl py-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Fuel className="mb-1 h-4 w-4 text-green-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">{car.fuelType}</span>
          </div>
          <div className={`flex flex-col items-center justify-center rounded-2xl py-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Settings2 className="mb-1 h-4 w-4 text-green-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase truncate px-1">{car.transmission}</span>
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20">
          Book Now
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
