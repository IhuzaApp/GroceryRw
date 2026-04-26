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

export default function AddPetModal({
  isOpen,
  onClose,
  theme,
  onSubmit,
}: AddPetModalProps) {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    ageInMonths: 0,
    gender: "Male",
    color: "",
    weight: "",
    story: "",
    isVaccinated: false,
    vaccinations: [],
    price: "",
    isDonation: false,
    location: "Kigali, Rwanda",
    status: "available",
    images: [],
    videoUrl: "",
    vaccinationCertificateUrl: "",
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <form
        onSubmit={handleFormSubmit}
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden border shadow-2xl duration-300 animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] sm:zoom-in-95 ${
          theme === "dark"
            ? "border-white/10 bg-[#121212] text-white"
            : "border-gray-100 bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-8 pb-6 dark:border-white/5">
          <div>
            <h2 className="font-outfit text-3xl font-black tracking-tight">
              List New Pet
            </h2>
            <p className="mt-1 text-xs font-black uppercase tracking-widest text-gray-400">
              Find a loving home for your pet
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-2 transition-colors ${
              theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
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
