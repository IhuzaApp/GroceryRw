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
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0A0A0A] animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      <div className="p-8 pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-outfit">Search & Filters</h2>
          <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-white/5 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center rounded-2xl border-2 border-green-500 px-5 py-4 bg-gray-50 dark:bg-white/5 mb-10">
          <Search className="h-5 w-5 text-green-500 mr-3" />
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">Vehicle Type</label>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map(type => (
                <button 
                  key={type} 
                  onClick={() => setSelectedType(type)} 
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${selectedType === type ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">Fuel Type</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map(fuel => (
                <button 
                  key={fuel} 
                  onClick={() => setSelectedFuel(fuel)} 
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${selectedFuel === fuel ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                >
                  {fuel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">Location</label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATIONS.map(loc => (
                <button 
                  key={loc} 
                  onClick={() => setSelectedLocation(loc)} 
                  className={`px-4 py-4 rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between ${selectedLocation === loc ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                >
                  {loc} 
                  {selectedLocation === loc && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-12 bg-green-500 py-4.5 rounded-2xl font-bold text-white !text-white text-lg shadow-lg"
        >
          View Listings
        </button>
      </div>
    </div>
  );
}
