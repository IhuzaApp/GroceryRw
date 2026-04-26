"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import PetForm, { PetFormData } from "../forms/PetForm";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  onSubmit?: (data: PetFormData) => void;
}

export default function AddPetModal({ isOpen, onClose, theme, onSubmit }: AddPetModalProps) {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    ageInMonths: 0,
    gender: 'Male',
    color: "",
    weight: "",
    story: "",
    isVaccinated: false,
    vaccinations: [],
    price: "",
    isDonation: false,
    location: "Kigali, Rwanda",
    status: 'available',
    images: [],
    videoUrl: "",
    vaccinationCertificateUrl: ""
  });

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <form 
        onSubmit={handleFormSubmit}
        className={`relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden sm:rounded-[3rem] border shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col ${
        theme === 'dark' ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div>
            <h2 className="text-3xl font-black tracking-tight font-outfit">List New Pet</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Find a loving home for your pet</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className={`rounded-full p-2 transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <PetForm 
            formData={formData}
            setFormData={setFormData}
            theme={theme} 
          />
        </div>
      </form>
    </div>
  );
}
