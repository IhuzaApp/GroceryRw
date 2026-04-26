"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  Circle,
  Clock,
  Wallet,
  ArrowUpRight,
  Edit2,
  Trash2,
  Eye,
  Star,
  Check,
  X,
  Dog,
  Heart,
  MapPin,
  MoreVertical,
  Plus
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { DUMMY_PETS, Pet } from "../../constants/dummyPets";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";

const PetIcon = ({ className }: { className?: string }) => (
  <Dog className={className} />
);

export default function PetBusinessDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'pets' | 'interests'>('pets');
  const [pets, setPets] = useState(DUMMY_PETS);
  const [walletBalance] = useState(125000);

  const handleToggleStatus = (id: string) => {
    setPets(prev => prev.map(pet => 
      pet.id === id ? { ...pet, status: pet.status === 'available' ? 'sold' : 'available' } : pet
    ));
    toast.success("Status updated");
  };

  return (
    <div className={`min-h-screen pb-24 md:ml-20 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'}`}>
      <div className="mx-auto max-w-[1600px] px-6 pt-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black font-outfit">Pet Partner Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back, Pet Haven</p>
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-black text-white shadow-xl shadow-green-500/20 hover:scale-105 transition-transform">
            <Plus className="h-5 w-5" />
            Add New Pet
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <StatsCard label="Revenue" value="$4,200" icon={<TrendingUp />} color="green" theme={theme} />
          <StatsCard label="Listings" value={pets.length.toString()} icon={<PetIcon />} color="blue" theme={theme} />
          <StatsCard label="Interests" value="28" icon={<Heart />} color="purple" theme={theme} />
          <StatsCard label="Rating" value="4.9" icon={<Star />} color="orange" theme={theme} />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-8 border-b border-gray-200/10">
          <button 
            onClick={() => setActiveTab('pets')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'pets' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            My Pets
          </button>
          <button 
            onClick={() => setActiveTab('interests')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'interests' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Interests
          </button>
        </div>

        {activeTab === 'pets' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {pets.map((pet) => (
                <PetManagementItem 
                  key={pet.id} 
                  pet={pet} 
                  theme={theme} 
                  onToggleStatus={() => handleToggleStatus(pet.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Heart className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-black font-outfit">No active interests</h3>
            <p>Interests from potential adopters will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color, theme }: any) {
  const colors: any = {
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <div className={`rounded-[2rem] border p-6 transition-all hover:shadow-xl ${theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <h3 className="text-2xl font-black font-outfit">{value}</h3>
    </div>
  );
}

function PetManagementItem({ pet, theme, onToggleStatus }: any) {
  return (
    <div className={`flex items-center justify-between rounded-[2.5rem] border p-4 transition-all hover:shadow-lg ${
      theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/5">
          <img src={pet.images[0].url} alt={pet.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h4 className="text-lg font-black font-outfit">{pet.name}</h4>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{pet.breed} • {pet.age}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              pet.status === 'available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              <Circle className="h-2 w-2 fill-current" />
              {pet.status}
            </div>
            <span className="text-sm font-black text-green-500">{pet.isDonation ? "FREE" : `$${pet.price}`}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleStatus}
          className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Toggle Availability"
        >
          <Check className="h-5 w-5" />
        </button>
        <button className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
          <Edit2 className="h-5 w-5" />
        </button>
        <button className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
