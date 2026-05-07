import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  ArrowLeft,
  Dog,
  MapPin,
  Calendar,
  ChevronRight,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import RootLayout from "../../src/components/ui/layout";
import LoadingScreen from "../../src/components/ui/LoadingScreen";
import { formatCurrencySync } from "../../src/utils/formatCurrency";
import { getOrCreatePetConversation } from "../../src/services/chatService";
import { toast } from "react-hot-toast";

export default function MyAdoptions() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Auth/Login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAdoptions = async () => {
      if (status !== "authenticated") return;
      try {
        const response = await fetch("/api/queries/get-user-adoptions");
        const data = await response.json();
        setAdoptions(data.adoptions || []);
      } catch (error) {
        console.error("Error fetching adoptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdoptions();
  }, [status]);

  const handleConfirmReceipt = async (adoptionId: string, petName: string) => {
    if (!window.confirm(`Confirm that you have received ${petName}? This will finalize the adoption.`)) return;

    const toastId = (await import("react-hot-toast")).toast.loading("Confirming receipt...");
    try {
      const response = await fetch("/api/mutations/confirm-pet-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adoptionId }),
      });

      if (response.ok) {
        (await import("react-hot-toast")).toast.success("Adoption finalized! Enjoy your new friend. 🐾", { id: toastId });
        // Refresh adoptions
        const refreshResponse = await fetch("/api/queries/get-user-adoptions");
        const refreshData = await refreshResponse.json();
        setAdoptions(refreshData.adoptions || []);
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to confirm receipt");
      }
    } catch (error: any) {
      console.error("Error confirming receipt:", error);
      (await import("react-hot-toast")).toast.error(error.message || "Failed to confirm receipt", { id: toastId });
    }
  };

  const handleChatWithOwner = async (vendorUserId: string, petId: string, petName: string, petImage: string) => {
    if (!session?.user?.id) {
      router.push("/Auth/Login");
      return;
    }

    const toastId = toast.loading("Opening chat...");
    try {
      const conversationId = await getOrCreatePetConversation(
        session.user.id,
        vendorUserId,
        petId,
        petName,
        petImage
      );
      toast.dismiss(toastId);
      router.push(`/Messages?conversationId=${conversationId}&collection=business_conversations`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Redirecting...", { id: toastId });
      router.push(`/Messages/${vendorUserId}`);
    }
  };

  if (status === "loading" || isLoading) return <LoadingScreen />;

  const filteredAdoptions = adoptions.filter((adoption) => {
    const searchStr = (
      (adoption.pets?.name || "") +
      (adoption.pets?.breed || "") +
      (adoption.status || "")
    ).toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <RootLayout>
      <div className="min-h-screen bg-white pb-24 font-sans text-gray-900 transition-colors duration-200 dark:bg-[#0A0A0A] dark:text-white md:ml-20">
        {/* Hero Header */}
        <div className="relative h-[22vh] min-h-[200px] w-full overflow-hidden md:h-[30vh] md:min-h-[260px]">
          <Image
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2086&auto=format&fit=crop"
            alt="Adoptions"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20">
            {!isSearching ? (
              <>
                <button
                  onClick={() => router.push("/Pets")}
                  className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider !text-white text-white/60 hover:text-white"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Marketplace
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-outfit text-3xl font-black !text-white text-white md:text-5xl">
                      My Adoptions
                    </h1>
                    <p className="mt-1 text-xs font-medium !text-white text-white/80 md:text-base">
                      Track your pet adoptions.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSearching(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all hover:bg-white/20"
                  >
                    <Search className="h-5 w-5 !text-white text-white" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest !text-white text-white/60">
                    Search Adoptions
                  </h2>
                  <button
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery("");
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search by pet name, breed, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-medium !text-white text-white placeholder-white/40 backdrop-blur-xl transition-all focus:border-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-500/10"
                  />
                  <Search className="absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-10 md:px-8">

          {filteredAdoptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Dog className="mb-4 h-16 w-16 text-gray-200" />
              <h3 className="font-outfit text-xl font-black text-gray-400">
                {searchQuery ? "No results found" : "No adoptions yet"}
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "Try searching for something else."
                  : "Your future best friend is waiting for you in the marketplace."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/Pets")}
                  className="mt-8 rounded-full bg-green-500 px-8 py-4 font-black !text-white text-white shadow-xl shadow-green-500/20"
                >
                  Explore Pets
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAdoptions.map((adoption) => (
                <div
                  key={adoption.id}
                  className="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:border-white/5 dark:bg-white/5 md:rounded-[2.5rem] md:p-6"
                >
                  <div className="flex gap-4 md:gap-6">
                    {/* Image */}
                    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl md:w-48 md:rounded-[2rem]">
                      <Image
                        src={adoption.pets.image}
                        alt={adoption.pets.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h3 className="truncate font-outfit text-lg font-black md:text-2xl">
                            {adoption.pets.name}
                          </h3>
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-black uppercase md:px-3 md:text-[10px] ${
                              adoption.status === "PAID"
                                ? "bg-blue-500 !text-white text-white"
                                : adoption.status === "ACCEPTED"
                                ? "bg-green-500 !text-white text-white"
                                : adoption.status === "DELIVERED"
                                ? "bg-gray-500 !text-white text-white"
                                : "bg-red-500 !text-white text-white"
                            }`}
                          >
                            {adoption.status === "ACCEPTED"
                              ? "Vendor Accepted"
                              : adoption.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 md:text-sm">
                          {adoption.pets.breed} • {adoption.pets.pet_type}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-black uppercase tracking-widest text-gray-400 md:mt-4 md:text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(adoption.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {adoption.address?.split(",")[0] || "Kigali"}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Actions (Hidden on Mobile) */}
                      <div className="mt-4 hidden flex-wrap items-center gap-3 md:flex">
                        <button
                          onClick={() =>
                            router.push(`/Pets/${adoption.pets.id}`)
                          }
                          className="flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-black transition-all hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                          View Profile
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleChatWithOwner(
                              adoption.pets.pet_vendors.user_id,
                              adoption.pets.id,
                              adoption.pets.name,
                              adoption.pets.image
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-black transition-all hover:border-green-500 hover:text-green-500 dark:border-white/10"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat Owner
                        </button>

                        {adoption.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleConfirmReceipt(adoption.id, adoption.pets.name)}
                            className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-black !text-white text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Confirm Receipt
                          </button>
                        )}

                        {adoption.status === "PAID" && (
                           <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-500">
                              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                              Waiting for Vendor
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop Price (Hidden on Mobile) */}
                    <div className="hidden flex-col justify-center border-l border-gray-100 pl-8 dark:border-white/5 md:flex">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Paid Amount
                      </p>
                      <p className="font-outfit text-2xl font-black text-green-500">
                        {formatCurrencySync(adoption.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Actions and Price (Visible on Mobile) */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-white/5 md:hidden">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/Pets/${adoption.pets.id}`)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleChatWithOwner(
                            adoption.pets.pet_vendors.user_id,
                            adoption.pets.id,
                            adoption.pets.name,
                            adoption.pets.image
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 !text-white text-white shadow-lg shadow-green-500/20"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                      {adoption.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleConfirmReceipt(adoption.id, adoption.pets.name)}
                          className="flex h-10 items-center gap-2 rounded-xl bg-green-500 px-4 text-[10px] font-black uppercase tracking-widest !text-white text-white shadow-lg shadow-green-500/20"
                        >
                          Confirm Receipt
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Paid
                      </p>
                      <p className="font-outfit text-lg font-black text-green-500">
                        {formatCurrencySync(adoption.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
