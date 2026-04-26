"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { DUMMY_CARS } from "../../constants/dummyCars";
import { useRouter } from "next/router";
import Image from "next/image";

const CarIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Sub-components
import ListingHero from "./listing/ListingHero";
import ListingCard from "./listing/ListingCard";
import ListingBookings from "./listing/ListingBookings";
import SearchFilterModal from "./listing/SearchFilterModal";
import FilterSelect from "./listing/FilterSelect";
import PlasDriveHeader from "./PlasDriveHeader";

const VEHICLE_TYPES = ["All", "Sedan", "SUV", "Truck", "Hatchback", "Luxury"];
const FUEL_TYPES = ["All", "Fuel", "Electric", "Hybrid", "Diesel"];
const LOCATIONS = ["All", "Kigali", "Musanze", "Rubavu", "Huye", "Rwamagana"];

export default function CarListing() {
  const router = useRouter();
  const [activeMainTab, setActiveMainTab] = useState<'explore' | 'bookings'>('explore');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [bookedCars, setBookedCars] = useState<any[]>([]);

  // Unified Modal state
  const [showSearchFilter, setShowSearchFilter] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.tab === 'bookings') {
      setActiveMainTab('bookings');
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    const loadBookings = () => {
      const saved = JSON.parse(localStorage.getItem("car_bookings") || "[]");
      if (saved.length === 0) {
        const dummyBookings = [
          {
            ...DUMMY_CARS[0],
            bookingId: "bk-82931",
            startDate: "2026-04-28",
            endDate: "2026-04-30",
            total: DUMMY_CARS[0].price * 3,
            status: "Confirmed",
            owner: DUMMY_CARS[0].owner
          },
          {
            ...DUMMY_CARS[2],
            bookingId: "bk-99210",
            startDate: "2026-05-12",
            endDate: "2026-05-15",
            total: DUMMY_CARS[2].price * 4,
            status: "Upcoming",
            owner: DUMMY_CARS[2].owner
          }
        ];
        setBookedCars(dummyBookings);
      } else {
        setBookedCars(saved);
      }
    };
    loadBookings();
    window.addEventListener('storage', loadBookings);
    return () => window.removeEventListener('storage', loadBookings);
  }, []);

  const filteredCars = useMemo(() => {
    return DUMMY_CARS.filter((car) => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "All" || car.type === selectedType;
      const matchesFuel = selectedFuel === "All" || car.fuelType === selectedFuel;
      const matchesLocation = selectedLocation === "All" || car.location === selectedLocation;
      return matchesSearch && matchesType && matchesFuel && matchesLocation && car.status === 'active';
    });
  }, [searchQuery, selectedType, selectedFuel, selectedLocation]);

  return (
    <div className="min-h-screen pb-24 md:ml-20 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-200 font-sans">
      
      <ListingHero 
        onSearchClick={() => setShowSearchFilter(true)}
        onFilterClick={() => setShowSearchFilter(true)}
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        bookingCount={bookedCars.length}
      />

      <PlasDriveHeader 
        activeTab={activeMainTab}
        onTabChange={setActiveMainTab}
        onBecomePartner={() => router.push("/Cars/become-partner")}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        {activeMainTab === 'explore' ? (
          <>
            {/* Desktop Filters */}
            <div className="hidden md:grid mb-8 grid-cols-4 gap-6 bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
              <FilterSelect label="Type" value={selectedType} options={VEHICLE_TYPES} onChange={setSelectedType} />
              <FilterSelect label="Fuel" value={selectedFuel} options={FUEL_TYPES} onChange={setSelectedFuel} />
              <FilterSelect label="Location" value={selectedLocation} options={LOCATIONS} onChange={setSelectedLocation} />
              <div className="flex flex-col">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-outfit">Search</label>
                <div className="relative flex items-center rounded-2xl border px-4 py-3 bg-white dark:bg-white/10 border-gray-100 dark:border-white/5">
                  <Search className="h-4 w-4 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search model..."
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Main Listing Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-8 lg:grid-cols-4">
              {filteredCars.map((car) => (
                <ListingCard 
                  key={car.id} 
                  car={car} 
                  onClick={() => router.push(`/Cars/${car.id}`)} 
                />
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CarIcon className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold font-outfit text-gray-400">No cars found</h3>
              </div>
            )}
          </>
        ) : (
          <ListingBookings bookings={bookedCars} />
        )}
      </div>

      {/* Unified Search & Filter Modal for Mobile */}
      <SearchFilterModal 
        isOpen={showSearchFilter}
        onClose={() => setShowSearchFilter(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedFuel={selectedFuel}
        setSelectedFuel={setSelectedFuel}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        VEHICLE_TYPES={VEHICLE_TYPES}
        FUEL_TYPES={FUEL_TYPES}
        LOCATIONS={LOCATIONS}
      />
    </div>
  );
}
