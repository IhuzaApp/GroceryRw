"use client";

import React, { useState } from "react";
import {
  Camera,
  Car,
  DollarSign,
  MapPin,
  Fuel,
  UserCheck,
  Settings2,
  Users,
  Loader2,
} from "lucide-react";
import { uploadToFirebase } from "../../../lib/firebase";

export interface VehicleFormData {
  name: string;
  type: string;
  price: string;
  location: string;
  fuelType: string;
  image: string;
  engine: string;
  transmission: string;
  status: string;
  exteriorImage: string;
  interiorImage: string;
  seatsImage: string;
  driverOption: string;
  securityDeposit: string;
  passengers?: number;
  platNumber: string;
}

interface VehicleFieldsProps {
  formData: VehicleFormData;
  setFormData: (data: VehicleFormData) => void;
  theme: string;
}

export default function VehicleFields({
  formData,
  setFormData,
  theme,
}: VehicleFieldsProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "exterior" | "interior" | "seats"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      const path = `cars/${Date.now()}-${type}-${file.name}`;
      const url = await uploadToFirebase(file, path);

      if (type === "main") {
        setFormData({ ...formData, image: url });
      } else if (type === "exterior") {
        setFormData({ ...formData, exteriorImage: url });
      } else if (type === "interior") {
        setFormData({ ...formData, interiorImage: url });
      } else if (type === "seats") {
        setFormData({ ...formData, seatsImage: url });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Image Upload */}
      <div className="space-y-4">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          Main Vehicle Photo
        </label>
        <div
          className={`group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-all hover:border-green-500/50 ${
            theme === "dark"
              ? "border-white/10 bg-white/5"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            onChange={(e) => handleFileUpload(e, "main")}
            accept="image/*"
            disabled={uploading !== null}
          />
          {uploading === "main" ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <p className="mt-2 text-sm font-medium text-gray-500">Uploading...</p>
            </div>
          ) : formData.image ? (
            <img
              src={formData.image}
              alt="Vehicle"
              className="h-full w-full rounded-[2.5rem] object-cover"
            />
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-500 transition-transform group-hover:scale-110">
                <Camera className="h-7 w-7" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-500">
                Upload main photo
              </p>
            </>
          )}
        </div>
      </div>

      {/* Secondary Images Gallery */}
      <div className="grid grid-cols-3 gap-4">
        <GalleryImageInput
          label="Exterior"
          value={formData.exteriorImage}
          uploading={uploading === "exterior"}
          onChange={(e) => handleFileUpload(e, "exterior")}
          theme={theme}
        />
        <GalleryImageInput
          label="Interior"
          value={formData.interiorImage}
          uploading={uploading === "interior"}
          onChange={(e) => handleFileUpload(e, "interior")}
          theme={theme}
        />
        <GalleryImageInput
          label="Seats"
          value={formData.seatsImage}
          uploading={uploading === "seats"}
          onChange={(e) => handleFileUpload(e, "seats")}
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Vehicle Name */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Vehicle Name
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <Car className="mr-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Tesla Model S"
              className="w-full bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Plate Number */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Plate Number
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <span className="mr-3 text-xs font-black text-gray-400">ABC</span>
            <input
              type="text"
              placeholder="e.g. RAC 123A"
              className="w-full bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.platNumber}
              onChange={(e) =>
                setFormData({ ...formData, platNumber: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Daily Price */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Price / Day
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <DollarSign className="mr-3 h-4 w-4 text-gray-400" />
            <input
              type="number"
              placeholder="65"
              className="w-full bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Category
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <select
              className="w-full appearance-none bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
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
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Fuel Type
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <Fuel className="mr-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full appearance-none bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.fuelType}
              onChange={(e) =>
                setFormData({ ...formData, fuelType: e.target.value })
              }
            >
              <option value="Fuel">Petrol/Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Engine Details */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Engine / Power
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <Settings2 className="mr-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. 2.0L Turbo"
              className="w-full bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.engine}
              onChange={(e) =>
                setFormData({ ...formData, engine: e.target.value })
              }
            />
          </div>
        </div>

        {/* Transmission */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Transmission
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <select
              className="w-full appearance-none bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.transmission}
              onChange={(e) =>
                setFormData({ ...formData, transmission: e.target.value })
              }
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Passengers
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <Users className="mr-3 h-4 w-4 text-gray-400" />
            <input
              type="number"
              placeholder="5"
              className="w-full bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.passengers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passengers: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Location
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <MapPin className="mr-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full appearance-none bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            >
              <option value="Kigali">Kigali</option>
              <option value="Musanze">Musanze</option>
              <option value="Rubavu">Rubavu</option>
            </select>
          </div>
        </div>

        {/* Driver Option */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Driver Provided?
          </label>
          <div
            className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <UserCheck className="mr-3 h-4 w-4 text-gray-400" />
            <select
              className="w-full appearance-none bg-transparent py-4 text-sm font-medium outline-none"
              value={formData.driverOption}
              onChange={(e) =>
                setFormData({ ...formData, driverOption: e.target.value })
              }
            >
              <option value="none">No (Self-Drive)</option>
              <option value="offered">Yes (Chauffeur)</option>
            </select>
          </div>
        </div>

        {/* Refundable Deposit */}
        {formData.driverOption === "none" && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Refundable Security Deposit
            </label>
            <div
              className={`relative flex items-center rounded-2xl border px-4 transition-all focus-within:ring-2 focus-within:ring-green-500/50 ${
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <DollarSign className="mr-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                placeholder="e.g. 500000"
                className="w-full bg-transparent py-4 text-sm font-medium outline-none"
                value={formData.securityDeposit}
                onChange={(e) =>
                  setFormData({ ...formData, securityDeposit: e.target.value })
                }
                required={formData.driverOption === "none"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryImageInput({
  label,
  value,
  uploading,
  onChange,
  theme,
}: {
  label: string;
  value: string;
  uploading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  theme: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-center text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
        {label}
      </label>
      <div
        className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border transition-all hover:border-green-500/50 ${
          theme === "dark"
            ? "border-white/10 bg-white/5"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <input
          type="file"
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={onChange}
          accept="image/*"
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
        ) : value ? (
          <img
            src={value}
            alt={label}
            className="h-full w-full rounded-[1.5rem] object-cover"
          />
        ) : (
          <Camera className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </div>
  );
}
