"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Car as CarIcon, 
  Users, 
  Fuel, 
  Settings2, 
  Star, 
  ChevronRight, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  ChevronDown,
  MapPin,
  Calendar,
  UserCheck
} from "lucide-react";
import { DUMMY_CARS, Car } from "../../constants/dummyCars";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { formatCurrencySync } from "../../utils/formatCurrency";

const VEHICLE_TYPES = ["All", "Sedan", "SUV", "Truck", "Hatchback", "Luxury"];
const FUEL_TYPES = ["All", "Fuel", "Electric", "Hybrid", "Diesel"];
const LOCATIONS = ["All", "Kigali", "Musanze", "Rubavu", "Huye", "Rwamagana"];

export default function CarListing() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeMainTab, setActiveMainTab] = useState<'explore' | 'bookings'>('explore');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [bookedCars, setBookedCars] = useState<any[]>([]);

  // Handle tab switching from query param - ensure router is ready
  useEffect(() => {
    if (router.isReady && router.query.tab === 'bookings') {
      setActiveMainTab('bookings');
    }
  }, [router.isReady, router.query.tab]);

  // Load bookings from localStorage
  useEffect(() => {
    const loadBookings = () => {
      const saved = JSON.parse(localStorage.getItem("car_bookings") || "[]");
      setBookedCars(saved);
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
    <div className="min-h-screen pb-24 md:ml-20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-200 font-sans">
      {/* Sticky Header - Mobile Only */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-2 backdrop-blur-xl md:hidden bg-white/80 dark:bg-black/40 border-b border-gray-200 dark:border-white/5">
        <div className="mb-4 flex gap-6 border-b border-gray-200/10 px-2">
          <button 
            onClick={() => setActiveMainTab('explore')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all font-outfit ${activeMainTab === 'explore' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
          >
            Explore
          </button>
          <button 
            onClick={() => setActiveMainTab('bookings')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all font-outfit ${activeMainTab === 'bookings' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
          >
            My Bookings
            {bookedCars.length > 0 && (
              <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] text-white font-bold">{bookedCars.length}</span>
            )}
          </button>
        </div>

        {activeMainTab === 'explore' && (
          <div className="relative mx-auto max-w-2xl px-2 mb-2">
            <div className="flex items-center rounded-2xl border px-4 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-green-500/50 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cars..."
                className="ml-2.5 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        {activeMainTab === 'explore' ? (
          <>
            {/* Dropdown Filters */}
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
              <FilterSelect label="Vehicle Type" value={selectedType} options={VEHICLE_TYPES} onChange={setSelectedType} theme={theme} />
              <FilterSelect label="Fuel Type" value={selectedFuel} options={FUEL_TYPES} onChange={setSelectedFuel} theme={theme} />
              <FilterSelect label="Location" value={selectedLocation} options={LOCATIONS} onChange={setSelectedLocation} theme={theme} />

              <div className="hidden lg:flex flex-col">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-outfit">Keyword Search</label>
                <div className="flex items-center rounded-[1.25rem] border px-4 py-3 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 transition-all focus-within:ring-4 focus-within:ring-green-500/10">
                  <Search className="h-4.5 w-4.5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="e.g. Tesla, SUV..."
                    className="flex-1 bg-transparent text-sm font-bold outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight md:text-2xl font-outfit">Available Vehicles in Rwanda</h2>
              <span className="rounded-full bg-gray-100 dark:bg-white/5 px-4 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest font-outfit">{filteredCars.length} results</span>
            </div>

            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} theme={theme} onClick={() => router.push(`/Cars/${car.id}`)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gray-100 dark:bg-white/5 text-gray-400">
                  <CarIcon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-outfit">No vehicles found</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Try adjusting your filters or location to see more available options.</p>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight font-outfit">Your Car Bookings</h2>
              <p className="text-gray-500 font-medium mt-1">Direct rentals from local businesses in Rwanda</p>
            </div>
            
            {bookedCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {bookedCars.map((booking) => (
                  <div key={booking.bookingId} className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-2xl dark:border-white/5 dark:bg-[#121212]">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <div className="h-32 w-full shrink-0 overflow-hidden rounded-[1.5rem] md:h-36 md:w-56 shadow-lg">
                        <img src={booking.image} alt={booking.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-2xl font-bold tracking-tight font-outfit">{booking.name}</h4>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase font-outfit">Total Paid</p>
                              <span className="text-xl font-bold text-green-500 font-outfit">{formatCurrencySync(booking.total)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-[10px] font-bold uppercase text-gray-500 font-outfit">{booking.type}</span>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                              <MapPin className="h-3.5 w-3.5 text-green-500" />
                              {booking.location}
                            </div>
                            {booking.withDriver && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 uppercase tracking-wide">
                                <UserCheck className="h-3.5 w-3.5" />
                                With Driver
                              </div>
                            )}
                          </div>
                          
                          <div className="inline-flex flex-wrap items-center gap-4 rounded-2xl bg-gray-50 dark:bg-white/5 px-5 py-2.5">
                            <div className="flex items-center gap-2 border-r border-gray-200 dark:border-white/10 pr-4">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase text-gray-400">Pick-up</span>
                                <span className="text-xs font-bold">{booking.startDate}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase text-gray-400">Return</span>
                                <span className="text-xs font-bold">{booking.endDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 text-[10px] font-bold uppercase text-green-600">
                            <ShieldCheck className="h-4 w-4" />
                            Confirmed Booking
                          </div>
                          <Link href={`/Messages?chat=${booking.owner.id}`} className="flex items-center gap-2 text-sm font-bold text-green-500 hover:gap-3 transition-all font-outfit">
                            <MessageSquare className="h-4.5 w-4.5" />
                            Message Host
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[3rem] bg-gray-100 dark:bg-white/5 text-gray-400 shadow-inner">
                   <Calendar className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-outfit">Start your journey</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">You haven't booked any vehicles yet. Explore Rwanda with our premium rental selection.</p>
                <button 
                  onClick={() => setActiveMainTab('explore')}
                  className="rounded-[1.5rem] bg-green-500 px-12 py-4.5 font-bold text-white shadow-2xl shadow-green-500/40 transition-all hover:scale-105 active:scale-95 text-lg font-outfit"
                >
                  Browse Cars
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, theme }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-outfit">{label}</label>
      <div className="relative group">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-[1.25rem] border px-4 py-3.5 pr-12 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-green-500/10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white group-hover:border-green-500/50 font-sans"
        >
          {options.map((t: string) => <option key={t} value={t} className="bg-white dark:bg-black">{t}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors" />
      </div>
    </div>
  );
}

function CarCard({ car, theme, onClick }: { car: Car; theme: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-white/5 dark:bg-[#121212]">
      <div className="relative h-52 overflow-hidden md:h-60">
        <img src={car.image} alt={car.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute right-5 top-5 flex flex-col items-end gap-2">
           <div className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black backdrop-blur-md shadow-xl font-outfit">{car.type}</div>
           {car.driverOption !== 'none' && (
             <div className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white !text-white shadow-xl font-outfit flex items-center gap-1.5 bg-purple-600">
               <UserCheck className="h-3.5 w-3.5 !text-white" />
               Driver Offered
             </div>
           )}
        </div>
        <div className="absolute bottom-5 left-5 flex items-end gap-1.5 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-3xl font-bold text-white font-outfit">{formatCurrencySync(car.price)}</span>
          <span className="mb-1 text-[11px] font-bold text-white/70 uppercase font-sans">/ day</span>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight font-outfit">{car.name}</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-bold text-yellow-600">
            <Star className="h-3.5 w-3.5 fill-yellow-400" />
            {car.rating}
          </div>
        </div>
        
        <div className="mb-5 flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[10px] tracking-widest font-outfit">
          <MapPin className="h-4 w-4 text-green-500" />
          {car.location}
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <SpecIcon icon={<Users className="h-4.5 w-4.5" />} label={`${car.passengers} Seats`} theme={theme} />
          <SpecIcon icon={<Fuel className="h-4.5 w-4.5" />} label={car.fuelType} theme={theme} />
          <SpecIcon icon={<Settings2 className="h-4.5 w-4.5" />} label={car.transmission} theme={theme} />
        </div>
        <button className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-green-600 to-emerald-600 py-5 text-base font-bold text-white !text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-green-500/20 font-outfit">
          View Details & Book
          <ChevronRight className="h-5 w-5 !text-white" />
        </button>
      </div>
    </div>
  );
}

function SpecIcon({ icon, label, theme }: { icon: React.ReactNode, label: string, theme: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] py-3.5 bg-gray-50 dark:bg-white/[0.03] transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.05]">
      <div className="mb-2 text-green-500">{icon}</div>
      <span className="text-[9px] font-bold text-gray-400 uppercase truncate px-1 tracking-wider font-outfit">{label}</span>
    </div>
  );
}
