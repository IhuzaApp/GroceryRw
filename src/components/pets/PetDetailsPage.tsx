import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { Pet } from "../../constants/dummyPets";
import { useTheme } from "../../context/ThemeContext";
import RootLayout from "../ui/layout";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { toast } from "react-hot-toast";
import PaymentProcessingOverlay from "../ui/pos/registration/PaymentProcessingOverlay";

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

    if (isAdopted) {
      toast.success("You have already adopted this pet!");
      return;
    }

    setIsAdoptionModalOpen(true);
  };

  const isBaby = pet.ageInMonths < 6;

  return (
    <RootLayout>
      <div className="min-h-screen bg-white pb-24 text-gray-900 transition-colors duration-200 dark:bg-[#0A0A0A] dark:text-white md:ml-20">
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
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-green-500 text-white shadow-xl shadow-green-500/20">
                      <ShieldCheck className="h-8 w-8 !text-white" />
                    </div>
                    <div>
                      <h4 className="font-outfit text-lg font-black text-green-600 dark:text-green-400">
                        Wellness Status
                      </h4>
                      <p className="font-sans font-black text-gray-500 dark:text-gray-400">
                        {pet.isVaccinated
                          ? "Fully Vaccinated"
                          : "Partially Vaccinated"}{" "}
                        • {pet.healthInfo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h5 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">
                        Vaccinations
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {pet.vaccinations.map((v, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-[11px] font-black text-green-600 dark:text-green-400"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {v}
                          </span>
                        ))}
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
                    pet.reviews.map((rev, i) => (
                      <div
                        key={i}
                        className="rounded-[2rem] border border-gray-100 p-6 dark:border-white/5"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-outfit font-black">{rev.user}</h4>
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
                    ))
                  ) : (
                    <p className="py-10 text-center font-normal italic text-gray-400">
                      No reviews yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Sticky Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-[3rem] border border-gray-100 bg-white p-8 shadow-2xl dark:border-white/5 dark:bg-[#121212] md:p-10">
                <div className="mb-8 border-b border-gray-100 pb-8 dark:border-white/5">
                  <p className="mb-2 font-outfit text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {pet.isDonation ? "Adoption Fee" : "Asking Price"}
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="font-outfit text-4xl font-black md:text-5xl">
                      {pet.isDonation ? "FREE" : formatCurrencySync(pet.price)}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-4 flex items-center justify-between rounded-3xl bg-gray-50 p-4 dark:bg-white/5 md:p-5">
                    <div className="flex items-center gap-4">
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
                          Listed by
                        </p>
                        <h4 className="font-outfit font-black">
                          {pet.owner.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {isAdopted && (
                    <button
                      onClick={() => router.push(`/Messages/${pet.owner.id}`)}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-green-500 py-4 font-outfit font-black text-green-500 transition-all hover:bg-green-500 hover:text-white active:scale-95"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Chat with Seller
                    </button>
                  )}
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={pet.status === "sold"}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-5 font-outfit text-xl font-black !text-white text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none md:py-6"
                >
                  <span className="!text-white">
                    {isAdopted
                      ? pet.isDonation
                        ? "Adopt Another One"
                        : "Buy Another One"
                      : pet.isDonation
                      ? "Adopt Now"
                      : "Buy Now"}
                  </span>
                  <ChevronRight className="h-6 w-6 !text-white" />
                </button>
                <div className="mt-5 flex items-center justify-center gap-2 text-center font-sans text-[11px] font-normal text-gray-400">
                  <Info className="h-3.5 w-3.5" />
                  All transactions are protected and pets are health-checked.
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

      {/* Adoption Modal */}
      <AdoptionModal
        isOpen={isAdoptionModalOpen}
        onClose={() => setIsAdoptionModalOpen(false)}
        pet={pet}
        onSuccess={(isPaid) => setIsAdopted(isPaid)}
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
