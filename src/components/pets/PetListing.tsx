"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Heart,
  MapPin,
  Filter,
  Dog,
  Cat,
  Bird,
  Info,
} from "lucide-react";
import { DUMMY_PETS, Pet } from "../../constants/dummyPets";
import { useRouter } from "next/router";
import Image from "next/image";
import PetListingHeader from "./PetListingHeader";

const PetIcon = ({ className }: { className?: string }) => (
  <Dog className={className} />
);

// Sub-components (Inline for now, can be extracted later)
const PetHero = ({
  onSearchClick,
  onFilterClick,
  activeTab,
  onTabChange,
}: any) => {
  return (
    <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2086&auto=format&fit=crop"
        alt="Pets"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20">
        <h1 className="mb-4 font-outfit text-4xl font-black !text-white text-white md:text-6xl">
          Find Your New
          <br />
          Best Friend
        </h1>
        <p className="mb-8 max-w-md text-lg font-medium !text-white text-white/80 md:text-xl">
          Adopt or buy pets from verified owners and shelters in your area.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-black !text-white text-white shadow-lg shadow-green-500/20 transition-transform hover:scale-105"
          >
            <Search className="h-5 w-5 !text-white text-white" />
            Find Pets
          </button>
        </div>
      </div>
    </div>
  );
};

const PetCard = ({ pet, onClick }: { pet: Pet; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-xl dark:border-white/5 dark:bg-white/5"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={pet.images[0].url}
          alt={pet.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute right-4 top-4 z-10">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-red-500">
            <Heart className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 z-10 flex gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase !text-white text-white backdrop-blur-md">
            {pet.type}
          </span>
          {pet.status === "sold" && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase !text-white text-white shadow-lg">
              Sold
            </span>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="mb-2 flex items-center justify-between gap-1">
          <h3 className="truncate font-outfit text-base font-black md:text-xl">
            {pet.name}
          </h3>
          <span className="whitespace-nowrap text-sm font-black text-green-500 md:text-lg">
            {pet.isDonation ? "FREE" : `$${pet.price}`}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            {pet.age}
          </span>
          <span className="flex items-center gap-1">
            {pet.gender === "Male" ? "♂" : "♀"} {pet.gender}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {pet.location.split(",")[0]}
          </span>
        </div>

        <p className="line-clamp-2 font-sans text-sm text-gray-500 dark:text-gray-400">
          {pet.story}
        </p>
      </div>
    </div>
  );
};

const PET_TYPES = ["All", "Dog", "Cat", "Bird", "Rabbit", "Other"];
const STATUS_OPTIONS = ["All", "Available", "Sold"];

export default function PetListing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredPets = useMemo(() => {
    return DUMMY_PETS.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "All" || pet.type === selectedType;
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Available" && pet.status === "available") ||
        (selectedStatus === "Sold" && pet.status === "sold");
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900 transition-colors duration-200 dark:bg-[#0A0A0A] dark:text-white md:ml-20">
      <div className="md:hidden">
        <PetHero
          onSearchClick={() => document.getElementById("pet-search")?.focus()}
        />
      </div>

      <PetListingHeader onListPet={() => router.push("/Pets/become-partner")} />

      <div className="mx-auto max-w-[1600px] px-4 pt-8 md:px-8">
        {/* Filters */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-3">
            {PET_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-6 py-2 text-sm font-black transition-all ${
                  selectedType === type
                    ? "bg-green-500 !text-white text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative flex w-full max-w-md items-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/20 dark:bg-white">
            <Search className="mr-3 h-4 w-4 text-gray-400" />
            <input
              id="pet-search"
              type="text"
              placeholder="Search by name or breed..."
              className="flex-1 bg-transparent text-sm font-bold text-black outline-none placeholder:text-gray-400 dark:text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onClick={() => router.push(`/Pets/${pet.id}`)}
            />
          ))}
        </div>

        {filteredPets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PetIcon className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="font-outfit text-lg font-black text-gray-400">
              No pets found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>

      {/* Become a Partner CTA (Mobile Only) */}
      <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 md:hidden">
        <button
          onClick={() => router.push("/Pets/become-partner")}
          className="flex items-center gap-3 rounded-full bg-black px-8 py-4 font-black !text-white text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:!text-black dark:text-black"
        >
          <Dog className="h-6 w-6" />
          <span>List Your Pet</span>
        </button>
      </div>
    </div>
  );
}
