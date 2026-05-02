"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import VehicleFields, { VehicleFormData } from "../forms/VehicleForm";
import toast from "react-hot-toast";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  logisticAccountId: string;
  onSuccess?: () => void;
}

export default function AddVehicleModal({
  isOpen,
  onClose,
  theme,
  logisticAccountId,
  onSuccess,
}: AddVehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
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
    passengers: 5,
    platNumber: "",
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Listing vehicle...");

    try {
      const payload = {
        name: formData.name,
        category: formData.type,
        price: formData.price,
        location: formData.location,
        fuel_type: formData.fuelType,
        main_photo: formData.image,
        engine: formData.engine,
        transmission: formData.transmission,
        status: "active",
        exterior: formData.exteriorImage,
        interior: formData.interiorImage,
        seats: formData.seatsImage,
        drive_provided: formData.driverOption === "offered",
        refundable_amount: formData.securityDeposit || "0",
        passenger: formData.passengers?.toString() || "5",
        platNumber: formData.platNumber,
        logisticAccount_id: logisticAccountId,
      };

      const response = await fetch("/api/mutations/add-car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Vehicle listed successfully!", { id: toastId });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Failed to add vehicle");
      }
    } catch (error: any) {
      console.error("Error adding car:", error);
      toast.error(error.message || "Failed to add vehicle", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
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
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden border shadow-2xl duration-300 animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] sm:zoom-in-95 ${
          theme === "dark"
            ? "border-white/10 bg-[#121212] text-white"
            : "border-gray-100 bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-8 pb-6 dark:border-white/5">
          <div>
            <h2 className="font-outfit text-3xl font-black tracking-tight">
              Add Vehicle
            </h2>
            <p className="mt-1 text-xs font-black uppercase tracking-widest text-gray-400">
              List a new car in your fleet
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
          <VehicleFields
            formData={formData}
            setFormData={setFormData}
            theme={theme}
          />
        </div>

        {/* Fixed Footer */}
        <div
          className={`shrink-0 border-t p-6 backdrop-blur-md ${
            theme === "dark"
              ? "border-white/5 bg-[#121212]/80"
              : "border-gray-100 bg-white/80"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-2xl py-4 text-lg font-black transition-all active:scale-95 ${
                theme === "dark"
                  ? "bg-white/5 text-white hover:bg-white/10"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-[2] rounded-2xl bg-green-500 py-4 text-lg font-black text-white shadow-xl shadow-green-500/30 transition-all active:scale-95`}
            >
              Confirm Listing
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
