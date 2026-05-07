import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Heart,
  Share2,
  ArrowLeft,
  MapPin,
  Star,
  MessageSquare,
  Info,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Dog,
  Cat,
  UserCheck,
  PlayCircle,
  FileText,
  Scale,
  X,
  Loader2,
  Phone,
  Wallet,
  CreditCard,
  Clock,
} from "lucide-react";
import { Pet } from "../../types/models";
import { useTheme } from "../../context/ThemeContext";
import RootLayout from "../ui/layout";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { toast } from "react-hot-toast";
import PaymentProcessingOverlay from "../ui/pos/registration/PaymentProcessingOverlay";
import { useHideBottomBar } from "../../context/HideBottomBarContext";
import vaccinationsData from "@/data/vaccinations.json";

const VACCINATIONS: Record<string, { id: string; name: string; isCore: boolean }[]> = vaccinationsData;

const MissingVaccinationsModal = ({
  isOpen,
  onClose,
  pet,
  vaccinationStatus,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  vaccinationStatus: any;
  theme: string;
}) => {
  if (!isOpen) return null;

  const currentAgeWeeks = pet.ageInMonths * 4.345; // Convert months to weeks

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={`relative flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[3rem] border shadow-2xl animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[85vh] sm:rounded-[3rem] ${
          theme === "dark"
            ? "border-white/10 bg-[#121212] text-white"
            : "border-gray-100 bg-white text-gray-900"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-8 pb-6 dark:border-white/5">
          <div>
            <h2 className="font-outfit text-2xl font-black tracking-tight">
              Health Roadmap
            </h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Missing Protection for {pet.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-2 transition-colors ${
              theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto p-8">
          {/* Pet Context Summary */}
          <div className="mb-8 flex items-center gap-4 rounded-3xl bg-blue-500/5 p-4 ring-1 ring-blue-500/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                Current Stats
              </p>
              <p className="text-xs font-bold opacity-70">
                {pet.age} ({Math.round(currentAgeWeeks)} weeks) • {pet.weight}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {vaccinationStatus.missingVaccs.map((v: any, i: number) => {
              const firstAge = v.recommendedAgeWeeks[0];
              const lastAge = v.recommendedAgeWeeks[v.recommendedAgeWeeks.length - 1];
              
              let status = "Upcoming";
              let statusColor = "text-blue-500 bg-blue-500/10";
              
              if (currentAgeWeeks > lastAge) {
                status = "Overdue";
                statusColor = "text-red-500 bg-red-500/10";
              } else if (currentAgeWeeks >= firstAge && currentAgeWeeks <= lastAge) {
                status = "Due Now";
                statusColor = "text-yellow-600 bg-yellow-500/10";
              }

              return (
                <div key={i} className="rounded-[2rem] border border-gray-100 p-6 dark:border-white/5">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-outfit font-black">{v.name}</h4>
                    <span className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-wider ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 text-[11px] sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="font-black uppercase tracking-widest text-gray-400">Recommended Age</p>
                      <p className="font-bold">{v.recommendedAgeWeeks.join(", ")} weeks</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-black uppercase tracking-widest text-gray-400">Booster Schedule</p>
                      <p className="font-bold">{v.frequency}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
                    <p className="text-[10px] font-bold leading-relaxed opacity-60">
                      {status === "Overdue" 
                        ? `Caution: ${pet.name} is past the ideal age for this shot. Consult a vet immediately.`
                        : status === "Due Now"
                        ? `Action Required: At ${pet.weight}, ${pet.name} is in the perfect window for this protection.`
                        : `${pet.name} will be ready for this vaccination in about ${Math.max(0, Math.round(firstAge - currentAgeWeeks))} weeks.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 p-8 dark:border-white/5">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

// Adoption Modal Component
const AdoptionModal = ({
  isOpen,
  onClose,
  pet,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  onSuccess: (isPaid: boolean) => void;
}) => {
  const { data: session } = useSession();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "wallet">("momo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [processingStep, setProcessingStep] = useState<
    "initiating_payment" | "awaiting_approval" | "success"
  >("initiating_payment");
  const [momoRef, setMomoRef] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current!,
        {
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "rw" },
        }
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        setAddress(place.name || place.formatted_address || "");
        if (place.geometry && place.geometry.location) {
          setLat(place.geometry.location.lat());
          setLng(place.geometry.location.lng());
        }
      });
      autocompleteRef.current = autocomplete;
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/queries/personal-wallet-balance");
          const data = await res.json();
          if (data.wallet) {
            setWalletBalance(parseFloat(data.wallet.balance));
          }
        } catch (err) {
          console.error("Wallet fetch error:", err);
        }
      }
    };
    if (isOpen) fetchWallet();
  }, [isOpen, session]);

  // Polling logic for MoMo status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isPolling && momoRef) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/momo/request-to-pay-status?referenceId=${momoRef}`
          );
          const data = await res.json();

          if (data.status === "SUCCESSFUL") {
            setProcessingStep("success");
            clearInterval(pollInterval);

            // Wait for success animation then close
            setTimeout(() => {
              setIsPolling(false);
              onSuccess(true);
              onClose();
              toast.success("Payment confirmed! Pet adopted.");
            }, 3000);
          } else if (data.status === "FAILED") {
            clearInterval(pollInterval);
            setIsPolling(false);
            toast.error("Payment failed or was cancelled.");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isPolling, momoRef, onClose, onSuccess]);

  const handlePaymentAndAdoption = async () => {
    if (!address || !phone) {
      toast.error("Please fill in address and phone number");
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === "wallet") {
        if (walletBalance !== null && walletBalance < pet.price) {
          toast.error("Insufficient wallet balance");
          setIsProcessing(false);
          return;
        }

        // 1. Deduct from wallet
        const walletRes = await fetch("/api/user/deduct-from-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: pet.price,
            description: `Purchase of pet ${pet.name}`,
          }),
        });
        const walletData = await walletRes.json();
        if (!walletData.success) {
          throw new Error(walletData.error || "Wallet payment failed");
        }

        // 2. Create adoption record as PAID
        const adoptRes = await fetch("/api/mutations/adopt-pet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pet_id: pet.id,
            amount: pet.price,
            address,
            phone,
            comment,
            latitude: lat?.toString(),
            longitude: lng?.toString(),
            status: "PAID",
          }),
        });
        const adoptData = await adoptRes.json();
        if (adoptData.success) {
          toast.success("Successfully adopted!");
          onSuccess(true);
          onClose();
        } else {
          throw new Error(adoptData.error || "Adoption record creation failed");
        }
      } else {
        // MoMo Payment - Following Checkout Pattern (Create Order First)

        // 1. Create adoption record as PENDING
        const adoptRes = await fetch("/api/mutations/adopt-pet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pet_id: pet.id,
            amount: pet.price,
            address,
            phone,
            comment,
            latitude: lat?.toString(),
            longitude: lng?.toString(),
            status: "PENDING",
          }),
        });
        const adoptData = await adoptRes.json();
        if (!adoptData.success) {
          throw new Error(adoptData.error || "Failed to initialize adoption");
        }

        const petAdoptionId = adoptData.id;

        // Show overlay before starting MoMo request
        setProcessingStep("initiating_payment");
        setIsPolling(true);

        // 2. Call MoMo request-to-pay with petAdoptionId
        const momoRes = await fetch("/api/momo/request-to-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: pet.price,
            payerNumber: phone,
            petAdoptionId: petAdoptionId,
            payerMessage: `Adoption: ${pet.name}`,
          }),
        });
        const momoData = await momoRes.json();

        if (momoData.status === "PENDING") {
          setMomoRef(momoData.referenceId);
          setProcessingStep("awaiting_approval");
          setIsPolling(true);
        } else {
          throw new Error(momoData.error || "MoMo payment failed");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
      setIsPolling(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {isPolling && (
        <PaymentProcessingOverlay processingStep={processingStep} />
      )}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-[#121212]">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-outfit text-2xl font-black">
              Complete Adoption
            </h2>
            <button
              onClick={onClose}
              className="rounded-full bg-gray-100 p-2 dark:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                Delivery Address or Place
              </label>
              <input
                ref={addressInputRef}
                type="text"
                placeholder="Search address or place name..."
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm focus:border-green-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="250..."
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-5 text-sm focus:border-green-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("momo")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                      paymentMethod === "momo"
                        ? "bg-yellow-400 font-bold text-black shadow-lg"
                        : "bg-gray-100 text-gray-400 dark:bg-white/5"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    MoMo
                  </button>
                  <button
                    onClick={() => setPaymentMethod("wallet")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                      paymentMethod === "wallet"
                        ? "bg-green-500 font-bold text-white shadow-lg"
                        : "bg-gray-100 text-gray-400 dark:bg-white/5"
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </button>
                </div>
              </div>
            </div>

            {paymentMethod === "wallet" && walletBalance !== null && (
              <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4 dark:bg-green-500/10">
                <span className="text-xs font-bold text-green-600">
                  Wallet Balance
                </span>
                <span className="font-outfit font-black text-green-600">
                  {formatCurrencySync(walletBalance)}
                </span>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                Comment for Seller
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any special instructions..."
                className="h-24 w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm focus:border-green-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handlePaymentAndAdoption}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-500 py-5 font-outfit text-lg font-black text-white shadow-xl shadow-green-500/30 transition-all hover:bg-green-600 active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Pay {formatCurrencySync(pet.price)}
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PetDetailsPage({ pet }: { pet: Pet }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [activeMedia, setActiveMedia] = useState<"image" | "video">(
    pet.videoUrl ? "video" : "image"
  );
  const [showCert, setShowCert] = useState(false);
  const [isAdopted, setIsAdopted] = useState(false);
  const [isCheckingAdoption, setIsCheckingAdoption] = useState(true);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [isPriceCardExpanded, setIsPriceCardExpanded] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const { setHideBottomBar } = useHideBottomBar();

  useEffect(() => {
    setHideBottomBar(true);
    return () => setHideBottomBar(false);
  }, [setHideBottomBar]);

  useEffect(() => {
    const checkAdoption = async () => {
      if (!session || !pet.id) {
        setIsCheckingAdoption(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/queries/check-pet-adoption?pet_id=${pet.id}`
        );
        const data = await res.json();
        setIsAdopted(data.isAdopted);
      } catch (err) {
        console.error("Error checking adoption:", err);
      } finally {
        setIsCheckingAdoption(false);
      }
    };
    checkAdoption();
  }, [session, pet.id]);

  const handleBuyNow = async () => {
    if (!session) {
      router.push("/Auth/Login");
      return;
    }

    setIsAdoptionModalOpen(true);
  };

  const isBaby = pet.ageInMonths < 6;

  const vaccinationStatus = useMemo(() => {
    const typeVaccs = VACCINATIONS[pet.type] || VACCINATIONS["Other"];
    const coreVaccs = typeVaccs.filter((v) => v.isCore).map((v) => v.name);
    const nonCoreVaccs = typeVaccs.filter((v) => !v.isCore).map((v) => v.name);

    const coreCount = pet.vaccinations.filter((v) => coreVaccs.includes(v)).length;
    const nonCoreCount = pet.vaccinations.filter((v) =>
      nonCoreVaccs.includes(v)
    ).length;
    const hasAllCore = coreVaccs.every((v) => pet.vaccinations.includes(v));
    const missingCoreCount = coreVaccs.filter((v) => !pet.vaccinations.includes(v)).length;
    const missingVaccs = typeVaccs.filter((v) => !pet.vaccinations.includes(v));

    let level = 0;
    if (coreCount > 0) level = 1;
    if (hasAllCore) level = 2;
    if (hasAllCore && nonCoreCount > 0) level = 3;

    return {
      hasAllCore,
      level,
      coreCount,
      totalCore: coreVaccs.length,
      missingCoreCount,
      missingVaccs,
      nonCoreCount,
      typeVaccs,
    };
  }, [pet]);

  return (
    <RootLayout>
      <div className="min-h-screen bg-white pb-[400px] text-gray-900 transition-colors duration-200 dark:bg-[#0A0A0A] dark:text-white md:ml-20 lg:pb-24">
        {/* Mobile Header Gallery - Reduced Height */}
        <div className="relative h-64 w-full md:h-[40vh]">
          <Image
            src={pet.images[0].url}
            alt={pet.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 pt-12 md:pt-6">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-all active:scale-90"
            >
              <ArrowLeft className="h-6 w-6 !text-white" />
            </button>
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-all active:scale-90">
                <Share2 className="h-5 w-5 !text-white text-white" />
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-all active:scale-90 ${
                  isLiked ? "text-red-500" : "!text-white text-white"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 right-4 md:left-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-black uppercase !text-white text-white shadow-lg">
                {pet.type}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase !text-white text-white backdrop-blur-md">
                {pet.breed}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase !text-white text-white backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 !text-white text-white" />
                {pet.location ? pet.location.split(",")[0] : "Kigali"}
              </span>
              {pet.status === "sold" && (
                <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase !text-white text-white shadow-lg">
                  Sold
                </span>
              )}
            </div>
            <h1 className="font-outfit text-4xl font-black !text-white text-white drop-shadow-2xl md:text-5xl">
              {pet.name}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
          {/* Quick Stats */}
          <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            <StatItem
              icon={<Calendar className="h-5 w-5 md:h-6 md:w-6" />}
              label="Age"
              value={pet.age}
              theme={theme}
            />
            <StatItem
              icon={<Info className="h-5 w-5 md:h-6 md:w-6" />}
              label="Gender"
              value={pet.gender}
              theme={theme}
            />
            <StatItem
              icon={<Star className="h-5 w-5 md:h-6 md:w-6" />}
              label="Color"
              value={pet.color}
              theme={theme}
            />
            <StatItem
              icon={<Scale className="h-5 w-5 md:h-6 md:w-6" />}
              label="Weight"
              value={pet.weight}
              theme={theme}
            />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              {/* About Section */}
              <SectionTitle title="The Story" />
              <div className="mb-12">
                <p className="font-sans text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {pet.story}
                </p>
              </div>

              {/* Health Info */}
              <div className="mb-12">
                <SectionTitle title="Health & Vaccination" />
                <div className="rounded-[2.5rem] border border-green-100 bg-green-50/30 p-8 dark:border-white/5 dark:bg-white/5">
                  <div className="mb-6 flex items-center gap-5 md:gap-8">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] shadow-xl transition-colors ${
                      vaccinationStatus.hasAllCore 
                        ? "bg-green-500 text-white shadow-green-500/20" 
                        : "bg-yellow-500 text-white shadow-yellow-500/20"
                    }`}>
                      <ShieldCheck className="h-8 w-8 !text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className={`font-outfit text-lg font-black ${
                          vaccinationStatus.hasAllCore ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                        }`}>
                          {vaccinationStatus.hasAllCore ? "Fully Protected" : "Partial Protection"}
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Level {vaccinationStatus.level} of 3
                        </span>
                      </div>
                      
                      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            vaccinationStatus.hasAllCore ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${(vaccinationStatus.coreCount / vaccinationStatus.totalCore) * 100}%` }}
                        />
                      </div>

                      <button 
                        onClick={() => !vaccinationStatus.hasAllCore && setShowMissingModal(true)}
                        className={`font-sans text-xs font-black transition-all hover:underline ${
                          vaccinationStatus.hasAllCore ? "text-gray-500" : "text-red-500"
                        }`}
                      >
                        {vaccinationStatus.coreCount} of {vaccinationStatus.totalCore} Core Vaccinations Completed
                        {!vaccinationStatus.hasAllCore && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px]">
                            Missing {vaccinationStatus.missingCoreCount} Core Shots • View Roadmap →
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                      <h5 className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Completed Vaccinations
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {pet.vaccinations.length > 0 ? (
                          pet.vaccinations.map((vName, i) => {
                            const vData = vaccinationStatus.typeVaccs.find((x: any) => x.name === vName);
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-[10px] font-black text-green-600 dark:text-green-400"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                {vName}
                                {vData?.isCore && <span className="ml-1 text-[8px] opacity-60">(Core)</span>}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs font-bold text-gray-400 italic">No recorded vaccinations</p>
                        )}
                      </div>
                    </div>
                    {pet.vaccinationCertificateUrl && (
                      <div>
                        <h5 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">
                          Documents
                        </h5>
                        <button
                          onClick={() => setShowCert(true)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-green-200 p-4 transition-colors hover:bg-green-50 dark:border-white/10 dark:hover:bg-white/10"
                        >
                          <FileText className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-black">
                            Vaccination Certificate
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditional: Parent Photos for Baby Pets */}
              {isBaby && pet.parentImages && pet.parentImages.length > 0 && (
                <div className="mb-12">
                  <SectionTitle title="Meet the Parents" />
                  <p className="mb-6 font-sans text-sm text-gray-500">
                    Since {pet.name} is under 6 months, we provide photos of the
                    parents for your reference.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {pet.parentImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-[2rem] border border-gray-100 dark:border-white/5"
                      >
                        <Image
                          src={img.url}
                          alt={img.label}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-lg">
                          {img.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              <SectionTitle title="Gallery" />
              <div className="mb-12 grid grid-cols-2 gap-3 md:gap-4">
                {pet.videoUrl && (
                  <div className="relative col-span-2 aspect-video overflow-hidden rounded-[2rem] shadow-sm">
                    <video
                      src={pet.videoUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black !text-white text-white backdrop-blur-lg">
                      Video Tour
                    </div>
                  </div>
                )}
                {pet.images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative aspect-video overflow-hidden rounded-[2rem] shadow-sm transition-transform hover:scale-[1.02] ${
                      i === 0 && !pet.videoUrl ? "col-span-2" : ""
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.label}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black !text-white text-white backdrop-blur-lg">
                      {img.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reviews */}
              <div className="mb-12">
                <div className="mb-8 flex items-center justify-between">
                  <SectionTitle
                    title={`Reviews (${pet.reviews.length})`}
                    noMargin
                  />
                  <div className="flex items-center gap-2 rounded-2xl bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-600">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {pet.rating}
                  </div>
                </div>
                <div className="space-y-6">
                  {pet.reviews.length > 0 ? (
                    pet.reviews.map(
                      (
                        rev: {
                          user:
                            | string
                            | number
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | React.ReactFragment
                            | React.ReactPortal
                            | null
                            | undefined;
                          rating: number;
                          comment:
                            | string
                            | number
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | React.ReactFragment
                            | React.ReactPortal
                            | null
                            | undefined;
                          date:
                            | string
                            | number
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | React.ReactFragment
                            | React.ReactPortal
                            | null
                            | undefined;
                        },
                        i: React.Key | null | undefined
                      ) => (
                        <div
                          key={i}
                          className="rounded-[2rem] border border-gray-100 p-6 dark:border-white/5"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-outfit font-black">
                              {rev.user}
                            </h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`h-3 w-3 ${
                                    idx < rev.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-200 dark:text-white/10"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="font-sans text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            {rev.comment}
                          </p>
                          <span className="mt-4 block text-[10px] font-normal uppercase tracking-widest text-gray-400">
                            {rev.date}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="py-10 text-center font-normal italic text-gray-400">
                      No reviews yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Sidebar Sticky Card - Now Fixed at bottom on mobile with Expand/Minimize */}
            <div className="lg:col-span-2">
              <div
                className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] border-t border-gray-100 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 dark:border-white/5 dark:bg-[#121212] lg:sticky lg:top-24 lg:rounded-[3rem] lg:border lg:p-8 lg:shadow-2xl ${
                  isPriceCardExpanded ? "p-6" : "p-4"
                } lg:p-8 md:p-10`}
              >
                {/* Simplified Mobile Toggle Handle - Moved further up */}
                <button
                  onClick={() => setIsPriceCardExpanded(!isPriceCardExpanded)}
                  className="absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-10 py-3.5 shadow-2xl ring-2 ring-gray-100 dark:bg-[#121212] dark:ring-white/10 lg:hidden"
                >
                  {!isPriceCardExpanded ? (
                    <span className="font-outfit text-sm font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white">
                      {pet.isDonation ? "Free" : formatCurrencySync(pet.price)}
                    </span>
                  ) : (
                    <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
                  )}
                </button>

                <div className="flex flex-col">
                  {/* Expanded Content (Big Price + Owner Info) */}
                  <div className={`${isPriceCardExpanded ? "block animate-in fade-in slide-in-from-bottom-3 duration-500" : "hidden"} lg:block`}>
                    <div className="mb-6 border-b border-gray-100 pb-6 dark:border-white/5 lg:mb-8 lg:pb-8">
                      <p className="mb-2 font-outfit text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {pet.isDonation ? "Adoption Fee" : "Asking Price"}
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="font-outfit text-3xl font-black md:text-5xl lg:text-4xl">
                          {pet.isDonation ? "FREE" : formatCurrencySync(pet.price)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6 lg:mb-8">
                      <div className="mb-4 flex items-center gap-4 rounded-3xl bg-gray-50 p-4 dark:bg-white/5 md:p-5">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full ring-4 ring-green-500/10">
                          <Image
                            src={pet.owner.image}
                            alt={pet.owner.name}
                            fill
                            className="object-cover"
                          />
                          {pet.owner.isVerified && (
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-0.5">
                              <UserCheck className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-outfit text-[10px] font-normal uppercase tracking-widest text-gray-400">
                            Listed by Vendor
                          </p>
                          <h4 className="font-outfit text-sm font-black md:text-base">
                            {pet.owner.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Action Button - Always large and full-width */}
                  <button
                    onClick={handleBuyNow}
                    disabled={pet.status === "sold"}
                    className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-4 font-outfit text-lg font-black !text-white text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none md:py-6"
                  >
                    <span className="!text-white">
                      {isAdopted
                        ? pet.isDonation
                          ? "Adopt Another"
                          : "Buy Another"
                        : pet.isDonation
                        ? "Adopt Now"
                        : "Buy Now"}
                    </span>
                    <ChevronRight className="h-5 w-5 !text-white" />
                  </button>

                  {/* Transaction Security Info (Only in expanded or desktop) */}
                  <div className={`${isPriceCardExpanded ? "block" : "hidden"} mt-4 flex items-center justify-center gap-2 text-center font-sans text-[10px] font-normal text-gray-400 lg:mt-5 lg:block lg:text-[11px]`}>
                    <div className="flex items-center justify-center gap-2">
                      <Info className="h-3 w-3" />
                      <span>Transactions are protected & pets health-checked.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Vaccination Certificate Modal */}
      {showCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowCert(false)}
          />
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-[2rem] shadow-2xl">
            <button
              onClick={() => setShowCert(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative h-[80vh] w-[90vw] max-w-2xl">
              <Image
                src={pet.vaccinationCertificateUrl!}
                alt="Vaccination Certificate"
                fill
                className="object-contain"
              />
            </div>
            <div className="bg-white p-6 dark:bg-[#121212]">
              <h3 className="font-outfit text-lg font-black">
                Vaccination Certificate
              </h3>
              <p className="font-sans text-sm text-gray-500">
                Official health documentation for {pet.name}
              </p>
            </div>
          </div>
        </div>
      )}

      <AdoptionModal
        isOpen={isAdoptionModalOpen}
        onClose={() => setIsAdoptionModalOpen(false)}
        pet={pet}
        onSuccess={(isPaid) => setIsAdopted(isPaid)}
      />
      <MissingVaccinationsModal
        isOpen={showMissingModal}
        onClose={() => setShowMissingModal(false)}
        pet={pet}
        vaccinationStatus={vaccinationStatus}
        theme={theme}
      />
    </RootLayout>
  );
}

function SectionTitle({
  title,
  noMargin,
}: {
  title: string;
  noMargin?: boolean;
}) {
  return (
    <h3
      className={`font-outfit text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ${
        noMargin ? "" : "mb-6"
      }`}
    >
      {title}
    </h3>
  );
}

function StatItem({ icon, label, value, theme }: any) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[2rem] border py-6 transition-all duration-300 md:py-8 ${
        theme === "dark"
          ? "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"
          : "border-gray-100 bg-gray-50 shadow-sm hover:bg-gray-100/50"
      }`}
    >
      <div className="mb-3 text-green-500 md:mb-4">{icon}</div>
      <span className="mb-1 font-outfit text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        {label}
      </span>
      <span className="font-sans text-sm font-black tracking-tight md:text-base">
        {value}
      </span>
    </div>
  );
}
