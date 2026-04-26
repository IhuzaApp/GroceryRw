"use client";

import React, { useState } from "react";
import { 
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
  Plus,
  ArrowLeft,
  Calendar,
  Info,
  Scale,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { DUMMY_PETS, Pet } from "../../constants/dummyPets";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";
import PetDashboardHeader from "./PetDashboardHeader";
import Image from "next/image";
import AddPetModal from "./modals/AddPetModal";

export default function PetBusinessDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'pets' | 'interests'>('pets');
  const [pets, setPets] = useState(DUMMY_PETS);
  const [walletBalance] = useState(3450000); // 3.4M RWF
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleToggleStatus = (id: string) => {
    setPets(prev => prev.map(pet => 
      pet.id === id ? { ...pet, status: pet.status === 'available' ? 'sold' : 'available' } : pet
    ));
    toast.success("Pet status updated");
  };

  const handleViewDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailsOpen(true);
  };

  return (
    <div className={`min-h-screen pb-24 md:ml-20 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-black'}`}>
      <PetDashboardHeader 
        title="Partner Dashboard" 
        subtitle="Welcome back, Pet Haven Sanctuary"
        onAction={() => setIsAddModalOpen(true)}
        actionLabel="Add New Pet"
        theme={theme}
      />

      <div className="mx-auto max-w-[1600px] px-6 py-10">
        {/* Wallet & Stats Section */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Wallet Card */}
          <WalletBalanceCard balance={walletBalance} theme={theme} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard label="Revenue" value="RWF 1.2M" icon={<TrendingUp />} color="green" theme={theme} />
            <StatsCard label="Live Ads" value={pets.length.toString()} icon={<Dog />} color="blue" theme={theme} />
            <StatsCard label="Interested" value="48" icon={<Heart />} color="purple" theme={theme} />
            <StatsCard label="Avg Rating" value="4.9" icon={<Star />} color="orange" theme={theme} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-8 border-b border-gray-200/10 dark:border-white/5">
          <button 
            onClick={() => setActiveTab('pets')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'pets' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            My Pets Fleet
          </button>
          <button 
            onClick={() => setActiveTab('interests')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'interests' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Adoption Interests
          </button>
        </div>

        {activeTab === 'pets' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className={`flex flex-1 max-w-md items-center rounded-2xl border px-4 py-3 shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                <Search className="h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search by name or breed..." className={`ml-3 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-gray-400 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                <span>Filter by:</span>
                <select className="bg-transparent border-none outline-none text-green-500 cursor-pointer">
                  <option>All Types</option>
                  <option>Dogs</option>
                  <option>Cats</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pets.map((pet) => (
                <PetManagementItem 
                  key={pet.id} 
                  pet={pet} 
                  theme={theme} 
                  onToggleStatus={() => handleToggleStatus(pet.id)}
                  onView={() => handleViewDetails(pet)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
              <Heart className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="text-2xl font-black font-outfit mb-2">No active interests</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Interests from potential adopters will appear here. Make sure your listings are high quality!</p>
          </div>
        )}
      </div>

      {selectedPet && (
        <PetDetailsModal 
          pet={selectedPet} 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)} 
          theme={theme} 
        />
      )}

      <AddPetModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        theme={theme}
        onSubmit={(data) => {
          console.log("New pet data:", data);
          toast.success(`${data.name} has been listed successfully!`);
        }}
      />
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
    <div className={`rounded-[2.5rem] border p-6 transition-all hover:shadow-2xl hover:translate-y-[-4px] ${theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500 !text-gray-500">{label}</p>
      <h3 className={`text-2xl font-black font-outfit ${theme === 'dark' ? 'text-white !text-white' : 'text-gray-900 !text-gray-900'}`}>{value}</h3>
    </div>
  );
}

function WalletBalanceCard({ balance, theme }: { balance: number, theme: string }) {
  return (
    <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-10 shadow-2xl shadow-black/40">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-green-400/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/20" />
            <span className="text-[10px] font-black tracking-[0.2em] text-green-500 uppercase">PET PARTNER PRO</span>
          </div>
          <Wallet className="h-6 w-6 text-green-500" />
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Available Earnings</p>
          <h2 className="text-4xl font-black text-white tracking-tight">{formatCurrencySync(balance)}</h2>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1,2,3,4].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-green-500/40" />)}
            </div>
            <span className="font-mono text-xs text-gray-500 tracking-widest">ECOMMERCE PAY</span>
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-black !text-white transition-all hover:scale-[1.05] active:scale-[0.95] shadow-xl shadow-green-500/30">
            <ArrowUpRight className="h-4 w-4 !text-white" />
            <span className="!text-white">Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PetManagementItem({ pet, theme, onToggleStatus, onView }: any) {
  return (
    <div className={`flex items-center justify-between rounded-[2.5rem] border p-4 transition-all hover:shadow-xl ${
      theme === 'dark' ? 'bg-[#121212] border-white/5 hover:bg-white/[0.08]' : 'bg-white border-gray-100 shadow-sm hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-5">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/5 relative">
          <Image src={pet.images[0].url} alt={pet.name} fill className="object-cover" />
        </div>
        <div>
          <h4 className={`text-xl font-black font-outfit ${theme === 'dark' ? 'text-white !text-white' : 'text-gray-900 !text-gray-900'}`}>{pet.name}</h4>
          <p className="text-xs font-black text-gray-500 !text-gray-500 uppercase tracking-widest">{pet.breed} • {pet.age}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              pet.status === 'available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              <Circle className="h-2 w-2 fill-current" />
              {pet.status}
            </div>
            <span className="text-sm font-black text-green-600 dark:text-green-500">{pet.isDonation ? "FREE" : `$${pet.price}`}</span>
          </div>
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden items-center gap-2 pr-2 sm:flex">
        <button 
          onClick={onToggleStatus}
          className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Change Status"
        >
          <Clock className="h-5 w-5" />
        </button>
        <button className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}>
          <Edit2 className="h-5 w-5" />
        </button>
        <button 
          onClick={onView}
          className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Actions Dropdown */}
      <div className="relative sm:hidden pr-1">
        <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
        }`}>
          <MoreVertical className="h-5 w-5" />
          <select 
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'toggle') onToggleStatus();
              else if (val === 'view') onView();
              e.target.value = "";
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Actions</option>
            <option value="view">View Details</option>
            <option value="edit">Edit Pet</option>
            <option value="toggle">Toggle Availability</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PetDetailsModal({ pet, isOpen, onClose, theme }: { pet: Pet, isOpen: boolean, onClose: () => void, theme: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative flex flex-col w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden sm:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ${
        theme === 'dark' ? 'bg-[#121212] border border-white/5 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
              <Image src={pet.images[0].url} alt={pet.name} fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-outfit">{pet.name}</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{pet.type} • {pet.breed}</p>
            </div>
          </div>
          <button onClick={onClose} className={`rounded-full p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Gallery & Story */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 font-outfit">Media Assets</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg">
                    <Image src={pet.images[0].url} alt="Main" fill className="object-cover" />
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[8px] font-black text-white uppercase">Main</div>
                  </div>
                  {pet.videoUrl && (
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-black flex items-center justify-center">
                      <TrendingUp className="text-white opacity-20" />
                      <div className="absolute bottom-2 left-2 rounded-full bg-green-500 px-2 py-1 text-[8px] font-black text-white uppercase">Video</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 font-outfit">About {pet.name}</h3>
                <p className="text-sm font-normal text-gray-500 leading-relaxed font-sans">
                  {pet.story}
                </p>
              </div>
            </div>

            {/* Right: Specs & Health */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 font-outfit">Pet Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={<Calendar />} label="Age" value={pet.age} theme={theme} />
                  <DetailItem icon={<Info />} label="Gender" value={pet.gender} theme={theme} />
                  <DetailItem icon={<Scale />} label="Weight" value={pet.weight} theme={theme} />
                  <DetailItem icon={<MapPin />} label="Location" value={pet.location.split(',')[0]} theme={theme} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 font-outfit">Health & Vaccination</h3>
                <div className={`rounded-3xl p-6 space-y-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm font-black text-green-500 uppercase tracking-widest">Medical Record</p>
                      <p className="text-xs text-gray-500">{pet.isVaccinated ? "Fully Vaccinated" : "Partially Vaccinated"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {pet.vaccinations.map((v, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, theme }: any) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
      theme === 'dark' ? 'border-white/5 bg-white/5' : 'bg-white border-gray-100'
    }`}>
      <div className="text-green-500">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 font-outfit">{label}</p>
        <p className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}
