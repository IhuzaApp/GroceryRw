"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import PetForm, { PetFormData } from "../forms/PetForm";
import toast from "react-hot-toast";

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  pet: any;
  onSuccess?: () => void;
}

export default function EditPetModal({
  isOpen,
  onClose,
  theme,
  pet,
  onSuccess,
}: EditPetModalProps) {
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || "",
        type: pet.pet_type || "Dog",
        breed: pet.breed || "",
        age: pet.age || "",
        ageInMonths: parseInt(pet.months) || 0,
        gender: pet.gender || "Male",
        color: pet.color || "",
        weight: pet.weight || "",
        story: pet.story || "",
        isVaccinated: pet.vaccinated || false,
        vaccinations: pet.vaccinations || [],
        price: pet.amount || "",
        isDonation: pet.free || false,
        location: pet.location || "Kigali, Rwanda",
        status: pet.status || "available",
        images: pet.images || [],
        videoUrl: pet.video || "",
        vaccinationCertificateUrl: pet.vaccination_cert || "",
        ...pet, // Spread the rest to handle quantity etc.
      });
    }
  }, [pet]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet?.id) {
      toast.error("Pet ID is missing");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Updating your pet listing...");
    try {
      const response = await fetch("/api/mutations/edit-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pet.id,
          ...formData,
          pet_type: formData.type,
          amount: formData.price.toString(),
          free: formData.isDonation,
          vaccinated: formData.isVaccinated,
          vaccination_cert: formData.vaccinationCertificateUrl,
          quantity: (formData as any).quantity?.toString() || "1",
          images: formData.images,
          age: formData.age,
          months: formData.ageInMonths.toString(),
          gender: formData.gender,
          weight: formData.weight,
          color: formData.color,
          story: formData.story,
          vaccinations: formData.vaccinations,
          videoUrl: formData.videoUrl,
        }),
      });

      if (response.ok) {
        toast.success(`${formData.name} has been updated!`, { id: toastId });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update pet");
      }
    } catch (error: any) {
      console.error("Error updating pet:", error);
      toast.error(error.message || "Failed to update pet", { id: toastId });
    } finally {
      setSubmitting(false);
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
              Edit {formData.name || "Pet"}
            </h2>
            <p className="mt-1 text-xs font-black uppercase tracking-widest text-gray-400">
              Update your listing information
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
