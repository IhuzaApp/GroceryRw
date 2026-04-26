"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  Car as CarIcon, 
  CalendarCheck, 
  TrendingUp, 
  Plus, 
  Search, 
  MoreVertical,
  Circle,
  ChevronRight,
  Clock
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { DUMMY_CARS, Car } from "../../constants/dummyCars";

export default function CarBusinessDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'fleet' | 'bookings'>('fleet');

  return (
    <div className={`min-h-screen pb-24 md:ml-20 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Dashboard Header */}
      <div className={`px-6 py-8 ${theme === 'dark' ? 'bg-gradient-to-b from-green-900/20 to-transparent' : 'bg-gradient-to-b from-green-50 to-transparent'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Partner Dashboard</h1>
              <p className="text-gray-500 font-medium">Welcome back, Elite Car Rentals</p>
            </div>
            <button className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-black text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-5 w-5" />
              Add Vehicle
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Revenue" value="$12,450" icon={<TrendingUp />} color="green" theme={theme} />
            <StatsCard label="Active Fleet" value="48" icon={<CarIcon />} color="blue" theme={theme} />
            <StatsCard label="Today's Bookings" value="12" icon={<CalendarCheck />} color="purple" theme={theme} />
            <StatsCard label="Average Rating" value="4.8" icon={<BarChart3 />} color="orange" theme={theme} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-8 border-b border-gray-200/10">
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            My Fleet
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Bookings
          </button>
        </div>

        {activeTab === 'fleet' ? (
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <div className={`flex flex-1 max-w-md items-center rounded-2xl border px-4 py-2 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <Search className="h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search fleet..." className="ml-3 flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {DUMMY_CARS.map((car) => (
                <FleetItem key={car.id} car={car} theme={theme} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <BookingItem 
              customer="John Doe" 
              car="Tesla Model 3" 
              date="Oct 24 - Oct 26" 
              amount="$160.00" 
              status="Ongoing" 
              theme={theme}
            />
            <BookingItem 
              customer="Jane Smith" 
              car="Toyota RAV4" 
              date="Oct 22 - Oct 23" 
              amount="$65.00" 
              status="Completed" 
              theme={theme}
            />
            <BookingItem 
              customer="Mike Ross" 
              car="Ford F-150" 
              date="Oct 28 - Oct 30" 
              amount="$190.00" 
              status="Upcoming" 
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color, theme }: { label: string, value: string, icon: React.ReactNode, color: string, theme: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <div className={`rounded-3xl border p-6 transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100'}`}>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-gray-500">{label}</p>
      <h3 className="text-2xl font-black">{value}</h3>
    </div>
  );
}

function FleetItem({ car, theme }: { car: Car, theme: string }) {
  return (
    <div className={`flex items-center justify-between rounded-3xl border p-4 transition-all hover:scale-[1.01] ${
      theme === 'dark' ? 'bg-[#121212] border-white/5 hover:bg-white/[0.07]' : 'bg-white border-gray-100 hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-4">
        <div className="h-16 w-24 overflow-hidden rounded-2xl">
          <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h4 className="font-black leading-tight">{car.name}</h4>
          <p className="text-xs font-bold text-gray-500 uppercase">{car.type} • {car.fuelType}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
              car.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
            }`}>
              <Circle className="h-2 w-2 fill-current" />
              {car.status}
            </div>
            <span className="text-xs font-black text-green-600">${car.price}/day</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className={`rounded-xl p-3 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function BookingItem({ customer, car, date, amount, status, theme }: any) {
  const statusColors: any = {
    Ongoing: 'text-blue-500 bg-blue-500/10',
    Completed: 'text-green-500 bg-green-500/10',
    Upcoming: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <div className={`flex items-center justify-between rounded-3xl border p-5 ${
      theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Clock className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <h4 className="font-black">{customer}</h4>
          <p className="text-sm font-bold text-gray-500">{car} • {date}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-lg font-black">{amount}</p>
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusColors[status]}`}>
            {status}
          </div>
        </div>
        <button className={`rounded-xl p-2 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
