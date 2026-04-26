"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import VehicleFields, { VehicleFormData } from "../forms/VehicleForm";

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  initialData: any;
  onSubmit?: (data: any) => void;
}

export default function EditVehicleModal({ isOpen, onClose, theme, initialData, onSubmit }: EditVehicleModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating vehicle:", formData);
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
        className={`relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden sm:rounded-[2.5rem] border shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col ${
        theme === 'dark' ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div>
            <h2 className="text-3xl font-black tracking-tight font-outfit">Edit Vehicle</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Update vehicle specifications</p>
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
          <VehicleFields 
            formData={formData}
            setFormData={setFormData}
            theme={theme} 
          />
        </div>

        {/* Fixed Footer */}
        <div className={`shrink-0 border-t p-6 backdrop-blur-md ${
          theme === 'dark' ? 'bg-[#121212]/80 border-white/5' : 'bg-white/80 border-gray-100'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-2xl py-4 text-lg font-black transition-all active:scale-95 ${
                theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-[2] rounded-2xl py-4 text-lg font-black text-white transition-all active:scale-95 bg-green-500 shadow-xl shadow-green-500/30`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
