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
  UserCheck,
  Zap,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  ArrowLeft
} from "lucide-react";
import { DUMMY_CARS, Car } from "../../constants/dummyCars";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
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

  // Modals state for mobile
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Handle tab switching from query param - ensure router is ready
  useEffect(() => {
    if (router.isReady && router.query.tab === 'bookings') {
      setActiveMainTab('bookings');
    }
  }, [router.isReady, router.query.tab]);

  // Load bookings from localStorage + Dummy data for demo
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
            status: "Confirmed"
          },
          {
            ...DUMMY_CARS[2],
            bookingId: "bk-99210",
            startDate: "2026-05-12",
            endDate: "2026-05-15",
            total: DUMMY_CARS[2].price * 4,
            status: "Upcoming"
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
      
      {/* MOBILE HERO SECTION - Height reduced to 200px */}
      <div className="relative h-[200px] w-full md:hidden">
        <Image 
          src="/images/cars/hero.png"
          alt="Explore Rwanda"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-white dark:to-[#0A0A0A]" />
        
        {/* Top bar with Search & Filter Icons */}
        <div className="absolute top-10 left-0 right-0 px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white !text-white font-outfit">Explore</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg"
            >
              <Search className="h-4.5 w-4.5 !text-white" />
            </button>
            <button 
              onClick={() => setShowFilterModal(true)}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg"
            >
              <SlidersHorizontal className="h-4.5 w-4.5 !text-white" />
            </button>
          </div>
        </div>

        {/* Tab Switcher - Mobile Hero Bottom */}
        <div className="absolute bottom-4 left-6 right-6">
           <div className="flex p-1 bg-black/20 backdrop-blur-xl rounded-[1.25rem] border border-white/10">
              <button 
                onClick={() => setActiveMainTab('explore')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all font-outfit flex items-center justify-center gap-2 ${
                  activeMainTab === 'explore' 
                    ? 'bg-white !text-green-600 shadow-lg' 
                    : 'text-white/70'
                }`}
              >
                Explore
              </button>
              <button 
                onClick={() => setActiveMainTab('bookings')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all font-outfit flex items-center justify-center gap-2 ${
                  activeMainTab === 'bookings' 
                    ? 'bg-white !text-green-600 shadow-lg' 
                    : 'text-white/70'
                }`}
              >
                Bookings
                {bookedCars.length > 0 && <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[8px] text-white !text-white font-bold">{bookedCars.length}</span>}
              </button>
           </div>
        </div>
      </div>

      {/* DESKTOP HEADER (Simplified) */}
      <div className="hidden md:block bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-white/5 pt-16 px-8 pb-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-bold font-outfit">Car Marketplace</h1>
              <p className="text-gray-400 font-medium mt-1">Premium rentals across Rwanda</p>
           </div>
           <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
              <button 
                onClick={() => setActiveMainTab('explore')}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeMainTab === 'explore' 
                    ? 'bg-black text-white dark:bg-white dark:!text-green-600 shadow-lg' 
                    : 'text-gray-500'
                }`}
              >
                Explore
              </button>
              <button 
                onClick={() => setActiveMainTab('bookings')}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeMainTab === 'bookings' 
                    ? 'bg-black text-white dark:bg-white dark:!text-green-600 shadow-lg' 
                    : 'text-gray-500'
                }`}
              >
                My Bookings
              </button>
           </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
        {activeMainTab === 'explore' ? (
          <>
            {/* Desktop Filters */}
            <div className="hidden md:grid mb-8 grid-cols-4 gap-6 bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
              <FilterSelect label="Type" value={selectedType} options={VEHICLE_TYPES} onChange={setSelectedType} theme={theme} />
              <FilterSelect label="Fuel" value={selectedFuel} options={FUEL_TYPES} onChange={setSelectedFuel} theme={theme} />
              <FilterSelect label="Location" value={selectedLocation} options={LOCATIONS} onChange={setSelectedLocation} theme={theme} />
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

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-8 lg:grid-cols-4">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} theme={theme} onClick={() => router.push(`/Cars/${car.id}`)} />
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
          <div className="max-w-4xl mx-auto space-y-4">
            {bookedCars.map((booking) => (
              <BookingCard key={booking.bookingId} booking={booking} theme={theme} />
            ))}
          </div>
        )}
      </div>

      {/* MOBILE MODALS */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0A0A0A] animate-in slide-in-from-bottom duration-300">
           <div className="p-8 pt-16">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold font-outfit">Search</h2>
                 <button onClick={() => setShowSearchModal(false)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-full">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              <div className="flex items-center rounded-2xl border-2 border-green-500 px-5 py-4 bg-gray-50 dark:bg-white/5">
                 <Search className="h-5 w-5 text-green-500 mr-3" />
                 <input autoFocus type="text" placeholder="Enter car name..." className="flex-1 bg-transparent text-lg font-bold outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={() => setShowSearchModal(false)} className="w-full mt-8 bg-green-500 py-4.5 rounded-2xl font-bold text-white !text-white text-lg shadow-lg">Show Results</button>
           </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0A0A0A] animate-in slide-in-from-bottom duration-300 overflow-y-auto">
           <div className="p-8 pt-16">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-bold font-outfit">Filters</h2>
                 <button onClick={() => setShowFilterModal(false)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-full">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vehicle Type</label>
                    <div className="flex flex-wrap gap-2">
                       {VEHICLE_TYPES.map(type => (
                         <button key={type} onClick={() => setSelectedType(type)} className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${selectedType === type ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>{type}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fuel Type</label>
                    <div className="flex flex-wrap gap-2">
                       {FUEL_TYPES.map(fuel => (
                         <button key={fuel} onClick={() => setSelectedFuel(fuel)} className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${selectedFuel === fuel ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>{fuel}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</label>
                    <div className="grid grid-cols-2 gap-2">
                       {LOCATIONS.map(loc => (
                         <button key={loc} onClick={() => setSelectedLocation(loc)} className={`px-4 py-4 rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between ${selectedLocation === loc ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>{loc} {selectedLocation === loc && <CheckCircle2 className="h-4 w-4" />}</button>
                       ))}
                    </div>
                 </div>
              </div>

              <button onClick={() => setShowFilterModal(false)} className="w-full mt-10 bg-green-500 py-4.5 rounded-2xl font-bold text-white !text-white text-lg shadow-lg">Apply Filters</button>
           </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-outfit px-1">{label}</label>
      <div className="relative group">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-xl border px-4 py-2.5 text-xs font-bold outline-none transition-all focus:ring-4 focus:ring-green-500/10 bg-white dark:bg-white/10 border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
          {options.map((t: string) => <option key={t} value={t} className="bg-white dark:bg-black">{t}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function CarCard({ car, onClick }: { car: Car; theme: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white transition-all dark:border-white/5 dark:bg-[#121212] flex flex-col h-full shadow-sm hover:shadow-lg active:scale-95 duration-200">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={car.image} alt={car.name} fill className="object-cover" />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
           <div className="rounded-full bg-black/50 px-2 py-0.5 text-[7px] font-bold uppercase text-white !text-white backdrop-blur-md">{car.type}</div>
           {car.driverOption !== 'none' && (
             <div className="rounded-full bg-purple-600 px-2 py-0.5 text-[7px] font-bold uppercase text-white !text-white flex items-center gap-1">
               <UserCheck className="h-2 w-2" />
               Driver
             </div>
           )}
        </div>
        <div className="absolute bottom-2 left-2 flex items-baseline gap-0.5">
           <span className="text-lg font-bold text-white !text-white font-outfit drop-shadow-lg">{formatCurrencySync(car.price)}</span>
           <span className="text-[8px] font-medium text-white/80 !text-white uppercase">/d</span>
        </div>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs md:text-sm font-bold font-outfit truncate pr-2 text-gray-900 dark:text-white">{car.name}</h3>
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

function BookingCard({ booking }: { booking: any, theme: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 dark:border-white/5 dark:bg-[#121212] flex items-center gap-3">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl shadow-sm">
        <img src={booking.image} alt={booking.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
           <h4 className="text-xs font-bold font-outfit truncate text-gray-900 dark:text-white">{booking.name}</h4>
           <div className="text-[7px] font-bold uppercase text-green-500 flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded-full">
              <CheckCircle2 className="h-2 w-2" />
              {booking.status || 'Confirmed'}
           </div>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-medium text-gray-400 uppercase mb-2">
           <div className="flex items-center gap-1">
             <MapPin className="h-2 w-2 text-green-500" />
             {booking.location}
           </div>
           <div className="flex items-center gap-1">
             <Calendar className="h-2 w-2" />
             {booking.startDate}
           </div>
        </div>
        <div className="flex items-center justify-between">
           <span className="text-sm font-bold text-green-500 font-outfit">{formatCurrencySync(booking.total)}</span>
           <Link href={`/Messages?chat=${booking.owner.id}`} className="p-1.5 bg-green-500 rounded-full shadow-md">
              <MessageSquare className="h-3.5 w-3.5 !text-white" />
           </Link>
        </div>
      </div>
    </div>
  );
}
