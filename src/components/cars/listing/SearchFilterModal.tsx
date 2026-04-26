"use client";

import React from "react";
import { Search, X, CheckCircle2 } from "lucide-react";

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedFuel: string;
  setSelectedFuel: (val: string) => void;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  VEHICLE_TYPES: string[];
  FUEL_TYPES: string[];
  LOCATIONS: string[];
}

export default function SearchFilterModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedFuel,
  setSelectedFuel,
  selectedLocation,
  setSelectedLocation,
  VEHICLE_TYPES,
  FUEL_TYPES,
  LOCATIONS,
}: SearchFilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-white duration-300 animate-in slide-in-from-bottom dark:bg-[#0A0A0A]">
      <div className="p-8 pt-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-outfit text-2xl font-black">Search & Filters</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-3 dark:bg-white/5"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-10 flex items-center rounded-2xl border-2 border-green-500 bg-gray-50 px-5 py-4 dark:bg-white/5">
          <Search className="mr-3 h-5 w-5 text-green-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search by car name..."
            className="flex-1 bg-transparent text-lg font-bold outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Vehicle Type
            </label>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                    selectedType === type
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Fuel Type
            </label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                    selectedFuel === fuel
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5"
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`flex items-center justify-between rounded-xl px-4 py-4 text-left text-sm font-bold transition-all ${
                    selectedLocation === loc
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5"
                  }`}
                >
                  {loc}
                  {selectedLocation === loc && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="py-4.5 mt-12 w-full rounded-2xl bg-green-500 text-lg font-black !text-white text-white shadow-lg"
        >
          View Listings
        </button>
      </div>
    </div>
  );
}
