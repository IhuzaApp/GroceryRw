import React from "react";
import Image from "next/image";
import {
  X,
  TrendingUp,
  Calendar,
  Info,
  Scale,
  MapPin,
  Wallet,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { Pet } from "../../../types/models";

interface PetDetailsModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}

export default function PetDetailsModal({
  pet,
  isOpen,
  onClose,
  theme,
}: PetDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative flex h-full w-full max-w-4xl flex-col overflow-hidden shadow-2xl duration-300 animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] sm:zoom-in-95 ${
          theme === "dark"
            ? "border border-white/5 bg-[#121212] text-white"
            : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
              <Image
                src={pet.images[0].url}
                alt={pet.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-outfit text-2xl font-black">{pet.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                {pet.type} • {pet.breed}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-3 transition-colors ${
              theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Gallery & Story */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 font-outfit text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  Media Assets
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg">
                    <Image
                      src={pet.images[0].url}
                      alt="Main"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[8px] font-black uppercase text-white">
                      Main
                    </div>
                  </div>
                  {pet.videoUrl && (
                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black">
                      <TrendingUp className="text-white opacity-20" />
                      <div className="absolute bottom-2 left-2 rounded-full bg-green-500 px-2 py-1 text-[8px] font-black uppercase text-white">
                        Video
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-outfit text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  About {pet.name}
                </h3>
                <p className="font-sans text-sm font-normal leading-relaxed text-gray-500">
                  {pet.story}
                </p>
              </div>

              {/* Parent Photos for Baby Pets */}
              {pet.parentImages && pet.parentImages.length > 0 && (
                <div>
                  <h3 className="mb-4 font-outfit text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    Meet the Parents
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {pet.parentImages.map((img: any, i: number) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5"
                      >
                        <Image
                          src={img.url}
                          alt={img.label}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-1 text-[8px] font-black uppercase text-white">
                          {img.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Specs & Health */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 font-outfit text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  Pet Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<Calendar />}
                    label="Age"
                    value={pet.age}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<Info />}
                    label="Gender"
                    value={pet.gender}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<Scale />}
                    label="Weight"
                    value={pet.weight}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<MapPin />}
                    label="Location"
                    value={pet.location ? pet.location.split(",")[0] : "Kigali"}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<Wallet />}
                    label="Price"
                    value={
                      pet.isDonation
                        ? "FREE / DONATION"
                        : `${formatCurrencySync(pet.price)}`
                    }
                    theme={theme}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-outfit text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  Health & Vaccination
                </h3>
                <div
                  className={`space-y-4 rounded-3xl p-6 ${
                    theme === "dark" ? "bg-white/5" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest text-green-500">
                        Medical Record
                      </p>
                      <p className="text-xs text-gray-500">
                        {pet.isVaccinated
                          ? "Fully Vaccinated"
                          : "Partially Vaccinated"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {pet.vaccinations.map((v, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black text-green-600"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {v}
                      </span>
                    ))}
                  </div>

                  {pet.vaccination_cert && (
                    <div className="pt-4">
                      <a
                        href={pet.vaccination_cert}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-500 hover:underline"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        View Vaccination Certificate
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Specs */}
              <div>
                <h3 className="mb-4 font-outfit text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  Additional Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<Info />}
                    label="Months"
                    value={`${pet.months} Months`}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<Info />}
                    label="Color"
                    value={pet.color}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<Scale />}
                    label="Quantity"
                    value={`${pet.quantity} Available`}
                    theme={theme}
                  />
                  <DetailItem
                    icon={<Calendar />}
                    label="Last Updated"
                    value={new Date(pet.updated_at || 0).toLocaleDateString()}
                    theme={theme}
                  />
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
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
        theme === "dark"
          ? "border-white/5 bg-white/5"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="text-green-500">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div>
        <p className="font-outfit text-[9px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p
          className={`text-xs font-black ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
