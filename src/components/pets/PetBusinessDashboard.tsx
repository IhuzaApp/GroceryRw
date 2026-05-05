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
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Pet } from "../../types/models";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";
import PetDashboardHeader from "./PetDashboardHeader";
import Image from "next/image";
import AddPetModal from "./modals/AddPetModal";
import EditPetModal from "./modals/EditPetModal";
import PetDetailsModal from "./modals/PetDetailsModal";
import { useBusinessWallet } from "../../context/BusinessWalletContext";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  PendingReviewMessage,
  RejectedAccountMessage,
} from "../business/PendingReviewMessage";
import LoadingScreen from "../ui/LoadingScreen";

export default function PetBusinessDashboard() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pets" | "interests">("pets");
  const [pets, setPets] = useState<Pet[]>([]);
  const { walletBalance } = useBusinessWallet();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<any>(null);

  const [vendorData, setVendorData] = useState<any>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoadingPets, setIsLoadingPets] = useState(false);

  const fetchPets = async (vendorId: string) => {
    setIsLoadingPets(true);
    try {
      const response = await fetch(
        `/api/queries/get-vendor-pets?vendor_id=${vendorId}`
      );
      if (response.ok) {
        const data = await response.json();
        // Map DB fields to Pet interface if necessary, or update components to handle DB fields
        const mappedPets = data.pets.map((p: any) => {
          // Reconstruct images array from 'image' and 'parent_images'
          const images = [];
          if (p.image) {
            images.push({ url: p.image, label: "Main Photo" });
          }
          if (p.parent_images && Array.isArray(p.parent_images)) {
            images.push(...p.parent_images);
          }

          return {
            ...p,
            type: p.pet_type,
            price: parseFloat(p.amount) || 0,
            isDonation: p.free,
            isVaccinated: p.vaccinated,
            images:
              images.length > 0
                ? images
                : [
                    {
                      url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop",
                      label: "Default",
                    },
                  ],
            status:
              parseInt(p.quantity) > parseInt(p.quantity_sold)
                ? "available"
                : "sold",
          };
        });
        setPets(mappedPets);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setIsLoadingPets(false);
    }
  };

  useEffect(() => {
    const checkAccount = async () => {
      try {
        const response = await fetch("/api/queries/check-pet-vendor");
        if (response.ok) {
          const data = await response.json();
          setVendorData(data.account);
          if (!data.hasAccount) {
            router.push("/Pets/become-partner");
          }
        }
      } catch (error) {
        console.error("Error checking pet vendor account:", error);
      } finally {
        setIsLoadingAccount(false);
      }
    };

    if (session?.user) {
      checkAccount().then(() => {
        // We'll fetch pets inside checkAccount once we have vendorData
      });
    }
  }, [session, router]);

  useEffect(() => {
    if (vendorData?.id) {
      fetchPets(vendorData.id);
    }
  }, [vendorData?.id]);

  if (isLoadingAccount) {
    return <LoadingScreen isOverlay={true} />;
  }

  if (vendorData?.disabled) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-[#0A0A0A]" : "bg-white"
        }`}
      >
        <RejectedAccountMessage businessAccountId={vendorData?.id} />
      </div>
    );
  }

  if (vendorData?.status !== "active") {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-[#0A0A0A]" : "bg-white"
        }`}
      >
        <PendingReviewMessage
          contactEmail={vendorData?.businessEmail || session?.user?.email}
        />
      </div>
    );
  }

  const handleToggleStatus = async (pet: any) => {
    const newQuantitySold = pet.status === "available" ? pet.quantity : "0";
    const toastId = toast.loading("Updating status...");
    try {
      const response = await fetch("/api/mutations/update-pet-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pet.id,
          quantity_sold: newQuantitySold,
        }),
      });

      if (response.ok) {
        toast.success("Status updated", { id: toastId });
        if (vendorData?.id) fetchPets(vendorData.id);
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating pet status:", error);
      toast.error("Failed to update status", { id: toastId });
    }
  };

  const handleViewDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailsOpen(true);
  };

  const handleEditPet = (pet: any) => {
    setPetToEdit(pet);
    setIsEditModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen pb-24 md:ml-20 ${
        theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-[#FAFAFA] text-black"
      }`}
    >
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              label="Revenue"
              value="RWF 1.2M"
              icon={<TrendingUp />}
              color="green"
              theme={theme}
            />
            <StatsCard
              label="Live Ads"
              value={pets.length.toString()}
              icon={<Dog />}
              color="blue"
              theme={theme}
            />
            <StatsCard
              label="Interested"
              value="48"
              icon={<Heart />}
              color="purple"
              theme={theme}
            />
            <StatsCard
              label="Avg Rating"
              value="4.9"
              icon={<Star />}
              color="orange"
              theme={theme}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-8 border-b border-gray-200/10 dark:border-white/5">
          <button
            onClick={() => setActiveTab("pets")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === "pets"
                ? "border-b-2 border-green-500 text-green-500"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            My Pets Fleet
          </button>
          <button
            onClick={() => setActiveTab("interests")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === "interests"
                ? "border-b-2 border-green-500 text-green-500"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            Adoption Interests
          </button>
        </div>

        {activeTab === "pets" ? (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div
                className={`flex max-w-md flex-1 items-center rounded-2xl border px-4 py-3 shadow-sm ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5"
                    : "border-gray-100 bg-white"
                }`}
              >
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or breed..."
                  className={`ml-3 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-gray-400 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                <span>Filter by:</span>
                <select className="cursor-pointer border-none bg-transparent text-green-500 outline-none">
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
                  onToggleStatus={() => handleToggleStatus(pet)}
                  onView={() => handleViewDetails(pet)}
                  onEdit={() => handleEditPet(pet)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div
              className={`mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] ${
                theme === "dark" ? "bg-white/5" : "bg-white shadow-xl"
              }`}
            >
              <Heart className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="mb-2 font-outfit text-2xl font-black">
              No active interests
            </h3>
            <p className="mx-auto max-w-xs text-gray-500">
              Interests from potential adopters will appear here. Make sure your
              listings are high quality!
            </p>
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
        vendorId={vendorData?.id}
        onSuccess={() => fetchPets(vendorData.id)}
      />

      {petToEdit && (
        <EditPetModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setPetToEdit(null);
          }}
          theme={theme}
          pet={petToEdit}
          onSuccess={() => fetchPets(vendorData.id)}
        />
      )}
    </div>
  );
}

function StatsCard({ label, value, icon, color, theme }: any) {
  const colors: any = {
    green: "text-green-500 bg-green-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  return (
    <div
      className={`rounded-[2.5rem] border p-6 transition-all hover:translate-y-[-4px] hover:shadow-2xl ${
        theme === "dark"
          ? "border-white/5 bg-[#121212]"
          : "border-gray-100 bg-white shadow-sm"
      }`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}
      >
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest !text-gray-500 text-gray-500">
        {label}
      </p>
      <h3
        className={`font-outfit text-2xl font-black ${
          theme === "dark"
            ? "!text-white text-white"
            : "!text-gray-900 text-gray-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}

function PetManagementItem({
  pet,
  theme,
  onToggleStatus,
  onView,
  onEdit,
}: any) {
  return (
    <div
      className={`flex items-center justify-between rounded-[2.5rem] border p-4 transition-all hover:shadow-xl ${
        theme === "dark"
          ? "border-white/5 bg-[#121212] hover:bg-white/[0.08]"
          : "border-gray-100 bg-white shadow-sm hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/5">
          <Image
            src={pet.images[0].url}
            alt={pet.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4
            className={`font-outfit text-xl font-black ${
              theme === "dark"
                ? "!text-white text-white"
                : "!text-gray-900 text-gray-900"
            }`}
          >
            {pet.name}
          </h4>
          <p className="text-xs font-black uppercase tracking-widest !text-gray-500 text-gray-500">
            {pet.breed} • {pet.age}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                pet.status === "available"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              <Circle className="h-2 w-2 fill-current" />
              {pet.status}
            </div>
            <span className="text-sm font-black text-green-600 dark:text-green-500">
              {pet.isDonation ? "FREE" : formatCurrencySync(pet.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden items-center gap-2 pr-2 sm:flex">
        <button
          onClick={onToggleStatus}
          className={`rounded-xl p-3 transition-colors ${
            theme === "dark"
              ? "text-gray-400 hover:bg-white/5"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          title="Change Status"
        >
          <Clock className="h-5 w-5" />
        </button>
        <button
          onClick={onEdit}
          className={`rounded-xl p-3 transition-colors ${
            theme === "dark"
              ? "text-gray-400 hover:bg-white/5"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Edit2 className="h-5 w-5" />
        </button>
        <button
          onClick={onView}
          className={`rounded-xl p-3 transition-colors ${
            theme === "dark"
              ? "text-gray-400 hover:bg-white/5"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Actions Dropdown */}
      <div className="relative pr-1 sm:hidden">
        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            theme === "dark"
              ? "bg-white/5 text-gray-400"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <MoreVertical className="h-5 w-5" />
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "toggle") onToggleStatus();
              else if (val === "view") onView();
              else if (val === "edit") onEdit();
              e.target.value = "";
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            defaultValue=""
          >
            <option value="" disabled>
              Actions
            </option>
            <option value="view">View Details</option>
            <option value="edit">Edit Pet</option>
            <option value="toggle">Toggle Availability</option>
          </select>
        </div>
      </div>
    </div>
  );
}
