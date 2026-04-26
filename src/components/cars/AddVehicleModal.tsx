"use client";

import React, { useState } from "react";
import { X, Camera, Car, DollarSign, MapPin, Fuel } from "lucide-react";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  initialData?: any;
  mode?: "add" | "edit";
}

export default function AddVehicleModal({ isOpen, onClose, theme, initialData, mode = "add" }: AddVehicleModalProps) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    type: "Sedan",
    price: "",
    location: "Kigali",
    fuelType: "Fuel",
    image: "",
    engine: "",
    transmission: "Automatic",
    status: "active",
    exteriorImage: "",
    interiorImage: "",
    seatsImage: "",
    driverOption: "none",
    securityDeposit: "",
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API here
    console.log("Adding vehicle:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border shadow-2xl animate-in zoom-in-95 fade-in duration-300 ${
        theme === 'dark' ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{mode === 'edit' ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <p className="text-sm font-black text-gray-500">{mode === 'edit' ? 'Update vehicle details' : 'List a new car in your fleet'}</p>
          </div>
          <button 
            onClick={onClose}
            className={`rounded-full p-2 transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          {/* Main Image Upload */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Main Vehicle Photo</label>
            <div className={`group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all hover:border-green-500/50 ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              {formData.image ? (
                <img src={formData.image} alt="Vehicle" className="h-full w-full rounded-3xl object-cover" />
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500 transition-transform group-hover:scale-110">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-sm font-normal text-gray-500">Upload main photo</p>
                </>
              )}
            </div>
          </div>

          {/* Secondary Images Gallery */}
          <div className="grid grid-cols-3 gap-4">
             <GalleryImageInput 
               label="Exterior" 
               value={formData.exteriorImage} 
               onChange={(val) => setFormData({...formData, exteriorImage: val})} 
               theme={theme} 
             />
             <GalleryImageInput 
               label="Interior" 
               value={formData.interiorImage} 
               onChange={(val) => setFormData({...formData, interiorImage: val})} 
               theme={theme} 
             />
             <GalleryImageInput 
               label="Seats" 
               value={formData.seatsImage} 
               onChange={(val) => setFormData({...formData, seatsImage: val})} 
               theme={theme} 
             />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Vehicle Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Vehicle Name</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <Car className="h-4 w-4 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="e.g. Tesla Model S"
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Daily Price */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Price / Day</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                <input
                  type="number"
                  placeholder="65"
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Category</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <select
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none appearance-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Fuel Type</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <Fuel className="h-4 w-4 text-gray-400 mr-3" />
                <select
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none appearance-none"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                >
                  <option value="Fuel">Petrol/Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Engine Details */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Engine / Power</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <input
                  type="text"
                  placeholder="e.g. 2.0L Turbo / 300HP"
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none"
                  value={formData.engine}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                />
              </div>
            </div>

            {/* Transmission */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Transmission</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <select
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none appearance-none"
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Location</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                <select
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none appearance-none"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="Kigali">Kigali</option>
                  <option value="Musanze">Musanze</option>
                  <option value="Rubavu">Rubavu</option>
                </select>
              </div>
            </div>

            {/* Driver Option */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Driver Provided?</label>
              <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <select
                  className="w-full bg-transparent py-4 text-sm font-normal outline-none appearance-none"
                  value={formData.driverOption}
                  onChange={(e) => setFormData({ ...formData, driverOption: e.target.value })}
                >
                  <option value="none">No (Self-Drive)</option>
                  <option value="offered">Yes (Chauffeur)</option>
                </select>
              </div>
            </div>

            {/* Refundable Deposit */}
            {formData.driverOption === 'none' && (
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Refundable Security Deposit</label>
                <div className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    className="w-full bg-transparent py-4 text-sm font-normal outline-none"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    required={formData.driverOption === 'none'}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className={`w-full rounded-2xl py-4 text-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                mode === 'edit' 
                  ? 'bg-green-600 text-white font-black shadow-none' 
                  : 'bg-green-500 text-white font-black shadow-xl shadow-green-500/30'
              }`}
            >
              {mode === 'edit' ? 'Save Changes' : 'Confirm Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GalleryImageInput({ label, value, onChange, theme }: { label: string, value: string, onChange: (val: string) => void, theme: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-normal uppercase tracking-[0.1em] text-gray-400 text-center">{label}</label>
      <div className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-2xl border transition-all hover:border-green-500/50 ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
      }`}>
        {value ? (
          <img src={value} alt={label} className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <Camera className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </div>
  );
}
