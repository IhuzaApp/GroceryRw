"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Fuel,
  Settings2,
  Star,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  X,
  Calendar,
  CreditCard,
  ChevronDown,
  Info,
  Minus,
  Plus,
  UserCheck,
  AlertCircle,
  Camera,
  Wallet,
  Phone,
  CheckCircle2,
  Loader2,
  Scan,
} from "lucide-react";
import { Car } from "../../constants/dummyCars";
import { useTheme } from "../../context/ThemeContext";
import RootLayout from "../ui/layout";
import { formatCurrencySync } from "../../utils/formatCurrency";
import CameraCapture from "../ui/CameraCapture";

export default function CarDetailsPage({ car }: { car: Car }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("car_bookings") || "[]");
    setIsBooked(bookings.some((b: any) => b.id === car.id));
  }, [car.id]);

  return (
    <RootLayout>
      <div className="min-h-screen bg-white pb-24 text-gray-900 transition-colors duration-200 dark:bg-[#0A0A0A] dark:text-white md:ml-20">
        {/* Mobile Header - Similar to Stores */}
        <div className="relative h-64 w-full md:h-80">
          <Image
            src={car.image}
            alt={car.name}
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
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-all active:scale-90">
                <Heart className="h-5 w-5 !text-white text-white" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 right-4 md:left-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-black uppercase !text-white text-white shadow-lg shadow-green-500/30">
                {car.type}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase !text-white text-white backdrop-blur-md">
                {car.year}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase !text-white text-white backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-white" />
                {car.location}
              </span>
              {car.driverOption === "offered" && (
                <span className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-black uppercase !text-white text-white shadow-lg shadow-purple-500/30">
                  <UserCheck className="h-3.5 w-3.5 !text-white" />
                  Driver Offered
                </span>
              )}
            </div>
            <h1 className="font-outfit text-3xl font-black !text-white text-white drop-shadow-2xl md:text-4xl">
              {car.name}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
          <div className="mb-10 grid grid-cols-3 gap-3 md:gap-6">
            <StatItem
              icon={<Users className="h-5 w-5 md:h-6 md:w-6" />}
              label="Capacity"
              value={`${car.passengers} Seats`}
              theme={theme}
            />
            <StatItem
              icon={<Fuel className="h-5 w-5 md:h-6 md:w-6" />}
              label="Engine"
              value={car.fuelType}
              theme={theme}
            />
            <StatItem
              icon={<Settings2 className="h-5 w-5 md:h-6 md:w-6" />}
              label="Gearbox"
              value={car.transmission}
              theme={theme}
            />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <SectionTitle title="Gallery" />
              <div className="mb-12 grid grid-cols-2 gap-3 md:gap-4">
                {car.images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative aspect-video overflow-hidden rounded-[2rem] shadow-sm transition-transform hover:scale-[1.02] ${
                      i === 0 ? "col-span-2" : ""
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

              <SectionTitle title="About this vehicle" />
              <div className="mb-12">
                <p className="font-sans text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {car.description}
                </p>
              </div>

              {car.driverOption === "offered" && (
                <div className="mb-12 flex items-center gap-5 rounded-[2.5rem] border border-purple-100 bg-purple-50/30 p-8 dark:border-white/5 dark:bg-purple-500/5 md:gap-8">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-purple-600 text-white shadow-xl shadow-purple-500/20">
                    <UserCheck className="h-8 w-8 !text-white" />
                  </div>
                  <div>
                    <h4 className="font-outfit text-lg font-black text-purple-600 dark:text-purple-400">
                      Chauffeur Services
                    </h4>
                    <p className="font-sans font-black text-gray-500 dark:text-gray-400">
                      This vehicle includes a professional private driver for
                      safety and insurance purposes. The service is already
                      included in the daily rental rate.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-12 flex items-center gap-5 rounded-[2.5rem] border border-green-100 bg-green-50/30 p-8 dark:border-white/5 dark:bg-white/5 md:gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-green-500 text-white shadow-xl shadow-green-500/20">
                  <ShieldCheck className="h-8 w-8 !text-white" />
                </div>
                <div>
                  <h4 className="font-outfit text-lg font-black text-green-600 dark:text-green-400">
                    Safety & Verification
                  </h4>
                  <p className="font-sans font-black text-gray-500 dark:text-gray-400">
                    {car.licenseInfo}
                  </p>
                </div>
              </div>

              <div className="mb-12">
                <div className="mb-8 flex items-center justify-between">
                  <SectionTitle
                    title={`Reviews (${car.reviews.length})`}
                    noMargin
                  />
                  <div className="flex items-center gap-2 rounded-2xl bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-600">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {car.rating}
                  </div>
                </div>
                <div className="space-y-6">
                  {car.reviews.length > 0 ? (
                    car.reviews.map((rev, i) => (
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
                      No reviews yet for this vehicle.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-[3rem] border border-gray-100 bg-white p-8 shadow-2xl dark:border-white/5 dark:bg-[#121212] md:p-10">
                <div className="mb-8 border-b border-gray-100 pb-8 dark:border-white/5">
                  <p className="mb-2 font-outfit text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Daily Rate
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="font-outfit text-4xl font-black md:text-5xl">
                      {formatCurrencySync(car.price)}
                    </span>
                    <span className="mb-1 font-sans text-sm font-black text-gray-500">
                      / day
                    </span>
                  </div>
                </div>

                <div className="mb-8 space-y-4">
                  {car.driverOption === "none" && (
                    <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-white/5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        Refundable Deposit
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">
                        {formatCurrencySync(car.securityDeposit)}
                      </span>
                    </div>
                  )}

                  {car.driverOption === "offered" && (
                    <div className="flex items-center justify-between rounded-2xl bg-purple-50 p-3 dark:bg-purple-500/10">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <UserCheck className="h-4 w-4 !text-purple-600 dark:!text-purple-400" />
                        Driver Offered
                      </div>
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                        Included
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-8 flex items-center justify-between rounded-3xl bg-gray-50 p-4 dark:bg-white/5 md:p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full ring-4 ring-green-500/10">
                      <Image
                        src={car.owner.image}
                        alt={car.owner.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-outfit text-[10px] font-normal uppercase tracking-widest text-gray-400">
                        Verified Host
                      </p>
                      <h4 className="font-outfit font-black">
                        {car.owner.name}
                      </h4>
                    </div>
                  </div>
                  {isBooked && (
                    <Link
                      href={`/Messages?chat=${car.owner.id}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-green-500 shadow-lg transition-transform hover:scale-110 active:scale-90 dark:bg-white/10"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Link>
                  )}
                </div>

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-5 font-outfit text-xl font-black !text-white text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] hover:shadow-green-500/40 active:scale-95 md:py-6"
                >
                  <span className="!text-white">Book This Car</span>
                  <ChevronRight className="h-6 w-6 !text-white" />
                </button>
                <div className="mt-5 flex items-center justify-center gap-2 font-sans text-[11px] font-normal text-gray-400">
                  <Info className="h-3.5 w-3.5" />
                  No payment required until collection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          car={car}
          onClose={() => setShowBookingModal(false)}
          theme={theme}
          onSuccess={() => {
            setShowBookingModal(false);
            router.push("/Cars?tab=bookings");
          }}
        />
      )}
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

function BookingModal({
  car,
  onClose,
  theme,
  onSuccess,
}: {
  car: Car;
  onClose: () => void;
  theme: string;
  onSuccess: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Payment & Verification States
  const [paymentMethod, setPaymentMethod] = useState<
    "momo" | "card" | "wallet"
  >("momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2) {
      fetchUserData();
    }
  }, [step]);

  const fetchUserData = async () => {
    setFetchingData(true);
    try {
      // 1. Fetch User Phone Number (from payment methods)
      const paymentResponse = await fetch("/api/queries/payment-methods");
      const paymentData = await paymentResponse.json();
      const momoMethod = paymentData.paymentMethods?.find(
        (m: any) => m.method.toLowerCase() === "mtn momo"
      );
      if (momoMethod?.number) {
        setPhoneNumber(momoMethod.number);
      }

      // 2. Fetch Wallet Balance
      const walletResponse = await fetch(
        "/api/queries/personal-wallet-balance"
      );
      const walletData = await walletResponse.json();
      if (walletData.wallet) {
        setWalletBalance(parseFloat(walletData.wallet.balance || "0"));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set both dates to midnight for accurate day difference calculation
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Rental is inclusive of both days (e.g., 8th to 9th is 2 days)
    return diffDays + 1;
  };

  const days = calculateDays();
  const subtotal = car.price * days;
  const serviceFee = Number((subtotal * 0.015).toFixed(2));
  const deposit = car.driverOption === "none" ? car.securityDeposit : 0;
  const totalUpfront = subtotal + serviceFee + deposit;

  const handleBooking = async () => {
    setLoading(true);
    setTimeout(() => {
      const bookings = JSON.parse(localStorage.getItem("car_bookings") || "[]");
      bookings.push({
        ...car,
        bookingId: Math.random().toString(36).substr(2, 9),
        startDate,
        endDate,
        guests,
        total: totalUpfront,
        securityDeposit: deposit,
        paymentMethod,
        phoneNumber,
        licensePhoto,
        bookedAt: new Date().toISOString(),
      });
      localStorage.setItem("car_bookings", JSON.stringify(bookings));
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 md:items-center md:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative flex h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[3rem] border border-white/5 bg-white font-sans text-gray-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] duration-300 animate-in slide-in-from-bottom-10 dark:bg-[#121212] dark:text-white md:h-auto md:rounded-[3rem] md:zoom-in-95">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-white/5 md:p-8">
          <div>
            <h2 className="font-outfit text-xl font-black md:text-2xl">
              Plan your trip
            </h2>
            <p className="mt-1 text-[10px] font-normal uppercase tracking-widest text-gray-400 md:text-xs">
              Direct booking with {car.owner.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 md:p-3"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-6 pb-32 md:p-8 md:pb-8">
          {step === 1 ? (
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 rounded-[2rem] bg-gray-50 p-4 dark:bg-white/5 md:gap-6 md:p-5">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-2xl shadow-lg md:h-24 md:w-32">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-outfit text-base font-black md:text-lg">
                    {car.name}
                  </h3>
                  <p className="mb-1 text-[10px] font-normal uppercase tracking-widest text-green-500 md:mb-2">
                    {car.type} • {car.fuelType}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] font-normal text-gray-500 md:text-xs">
                    <MapPin className="h-3 w-3 text-gray-400 md:h-3.5 md:w-3.5" />
                    {car.location}, Rwanda
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-5">
                <DateInput
                  label="Pick-up Date"
                  value={startDate}
                  onChange={setStartDate}
                  theme={theme}
                />
                <DateInput
                  label="Return Date"
                  value={endDate}
                  onChange={setEndDate}
                  theme={theme}
                />
              </div>

              <div className="flex flex-col gap-5 md:gap-6">
                <div>
                  <label className="mb-2 block text-[10px] font-normal uppercase tracking-[0.2em] text-gray-400 md:mb-3 md:text-[11px]">
                    Guests
                  </label>
                  <div
                    className={`flex items-center justify-between rounded-[1.5rem] border p-3 md:p-4 ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="text-base font-normal md:text-lg">
                      {guests}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 md:h-8 md:w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setGuests(Math.min(car.passengers, guests + 1))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 md:h-8 md:w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {car.driverOption === "offered" && (
                  <div className="flex items-center gap-3 rounded-[1.5rem] border border-purple-100 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-500/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-500/20">
                      <UserCheck className="h-5 w-5 !text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-normal text-purple-600 dark:text-purple-400">
                        Chauffeur Included
                      </p>
                      <p className="text-[10px] text-gray-500">
                        A professional driver is included in the base rate.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {days > 0 && (
                <div
                  className={`rounded-[2rem] border p-5 shadow-sm md:p-6 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-gray-100 bg-gray-50/20"
                  }`}
                >
                  <div className="mb-4 space-y-3 border-b border-gray-200 pb-4 dark:border-white/10 md:mb-5 md:space-y-4 md:pb-5">
                    <div className="flex justify-between text-xs font-normal md:text-sm">
                      <span className="text-gray-500">
                        Rental Fee ({formatCurrencySync(car.price)} x {days}d)
                      </span>
                      <span className="font-normal text-gray-900 dark:text-white">
                        {formatCurrencySync(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-normal md:text-sm">
                      <span className="text-gray-500">Service Fee (1.5%)</span>
                      <span className="font-normal text-gray-900 dark:text-white">
                        {formatCurrencySync(serviceFee)}
                      </span>
                    </div>
                    {car.driverOption === "none" && (
                      <div className="flex justify-between text-xs font-normal md:text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">
                            Security Deposit
                          </span>
                          <Info className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="font-normal text-blue-600 dark:text-blue-400">
                          + {formatCurrencySync(car.securityDeposit)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-outfit text-xl font-black md:text-2xl">
                        Total Upfront
                      </span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 md:text-[10px]">
                        Deposit refundable upon safe return
                      </p>
                    </div>
                    <span className="font-outfit text-2xl font-black text-green-500 md:text-3xl">
                      {formatCurrencySync(totalUpfront)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 duration-300 animate-in slide-in-from-right-4">
              {/* Driving License Verification Section */}
              {car.driverOption === "none" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <SectionTitle title="Verification Required" noMargin />
                    {licensePhoto && (
                      <span className="flex items-center gap-1 text-[10px] font-normal uppercase text-green-500">
                        <CheckCircle2 className="h-3 w-3" /> Captured
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => setShowCamera(true)}
                    className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[2.5rem] border-2 border-dashed p-8 transition-all ${
                      licensePhoto
                        ? "border-green-500 bg-green-50/50 dark:bg-green-500/5"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/5"
                    }`}
                  >
                    {licensePhoto ? (
                      <div className="relative h-32 w-full overflow-hidden rounded-2xl shadow-xl">
                        <img
                          src={licensePhoto}
                          alt="License"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                          <Scan className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-outfit text-sm font-normal">
                            Capture Driving License
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                            Required for self-drive rentals
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <CameraCapture
                    isOpen={showCamera}
                    onClose={() => setShowCamera(false)}
                    onCapture={(img) => setLicensePhoto(img)}
                    title="Capture Driving License"
                  />
                </div>
              )}

              {/* Payment Section */}
              <div className="space-y-4">
                <SectionTitle title="Payment Method" noMargin />
                <div className="space-y-3">
                  <PaymentOption
                    icon={<Wallet className="h-6 w-6 text-orange-500" />}
                    label="Plas Wallet"
                    sub={
                      fetchingData
                        ? "Checking balance..."
                        : `Balance: ${formatCurrencySync(walletBalance)}`
                    }
                    selected={paymentMethod === "wallet"}
                    onClick={() => setPaymentMethod("wallet")}
                    theme={theme}
                    disabled={!fetchingData && walletBalance < totalUpfront}
                  />
                  <PaymentOption
                    icon={
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffcb05] text-[10px] font-normal text-[#004f71]">
                        MTN
                      </div>
                    }
                    label="Mobile Money"
                    sub={phoneNumber ? phoneNumber : "Enter phone number"}
                    selected={paymentMethod === "momo"}
                    onClick={() => setPaymentMethod("momo")}
                    theme={theme}
                  />
                  <PaymentOption
                    icon={<CreditCard className="h-6 w-6 text-blue-500" />}
                    label="Debit / Credit Card"
                    sub="Pay with Visa or Mastercard"
                    selected={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                    theme={theme}
                  />
                </div>

                {paymentMethod === "momo" && (
                  <div className="duration-200 animate-in zoom-in-95">
                    <label className="mb-2 block font-outfit text-[10px] font-normal uppercase tracking-[0.2em] text-gray-400">
                      MoMo Phone Number
                    </label>
                    <div
                      className={`flex items-center gap-3 rounded-[1.5rem] border p-4 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Phone className="h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="078 XXX XXXX"
                        className="flex-1 bg-transparent font-normal outline-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Final Summary Card */}
              <div
                className={`space-y-4 rounded-[2rem] p-6 ${
                  theme === "dark" ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal uppercase tracking-widest text-gray-500">
                    Final Total
                  </span>
                  <span className="font-outfit text-2xl font-normal text-green-500">
                    {formatCurrencySync(totalUpfront)}
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] font-normal leading-relaxed text-gray-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
                  <p>
                    Your payment is processed securely. Funds are held in escrow
                    until the vehicle is handed over to you.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Mobile Footer */}
        <div className="sticky bottom-0 z-20 border-t border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-[#121212] md:p-8">
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!startDate || !endDate}
              className="group flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-5 font-outfit text-lg font-black !text-white text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] active:scale-95 disabled:pointer-events-none disabled:opacity-50 md:text-xl"
            >
              <span className="!text-white">Confirm Booking Details</span>
              <ChevronRight className="h-6 w-6 !text-white transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 rounded-[1.5rem] py-5 font-outfit text-sm font-normal transition-all md:text-base ${
                  theme === "dark"
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={
                  loading ||
                  (car.driverOption === "none" && !licensePhoto) ||
                  (paymentMethod === "momo" && !phoneNumber) ||
                  (paymentMethod === "wallet" && walletBalance < totalUpfront)
                }
                className="flex flex-[2] items-center justify-center gap-2 rounded-[1.5rem] bg-green-500 py-5 font-outfit text-lg font-black !text-white text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] active:scale-95 disabled:pointer-events-none disabled:opacity-50 md:gap-3 md:text-xl"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin md:h-8 md:w-8" />
                ) : (
                  <span className="!text-white">Pay & Book Trip</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange, theme }: any) {
  return (
    <div>
      <label className="mb-2 block font-outfit text-[10px] font-normal uppercase tracking-[0.2em] text-gray-400">
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-[1.25rem] border p-3 text-xs font-normal outline-none transition-all focus:ring-4 focus:ring-green-500/20 md:p-4 md:text-sm ${
            theme === "dark"
              ? "border-white/10 bg-white/5 text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        />
      </div>
    </div>
  );
}

function PaymentOption({
  icon,
  label,
  sub,
  selected,
  onClick,
  theme,
  disabled,
}: any) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`flex cursor-pointer items-center justify-between rounded-[2rem] border p-4 transition-all md:p-6 ${
        selected
          ? "border-green-500 bg-green-500/5 ring-4 ring-green-500/10"
          : disabled
          ? "cursor-not-allowed opacity-40 grayscale"
          : theme === "dark"
          ? "border-white/10 bg-white/[0.02]"
          : "border-gray-100 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 md:h-12 md:w-12">
          {icon}
        </div>
        <div>
          <h4 className="font-outfit text-sm font-normal md:text-base">
            {label}
          </h4>
          <p
            className={`text-[10px] font-normal uppercase tracking-wide md:text-xs ${
              disabled ? "text-red-400" : "text-gray-500"
            }`}
          >
            {disabled && !sub.includes("Checking")
              ? "Insufficient Balance"
              : sub}
          </p>
        </div>
      </div>
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-4 transition-colors md:h-6 md:w-6 ${
          selected
            ? "border-green-500 bg-green-500"
            : "border-gray-300 dark:border-white/20"
        }`}
      >
        {selected && (
          <div className="h-1.5 w-1.5 rounded-full bg-white md:h-2 md:w-2" />
        )}
      </div>
    </div>
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
