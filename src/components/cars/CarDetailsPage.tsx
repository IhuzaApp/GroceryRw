"use client";

import React, { useState, useEffect } from "react";
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
  Plus
} from "lucide-react";
import { Car } from "../../constants/dummyCars";
import { useTheme } from "../../context/ThemeContext";
import RootLayout from "../ui/layout";

export default function CarDetailsPage({ car }: { car: Car }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <RootLayout>
      <div className="min-h-screen pb-24 md:ml-20 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-200">
        
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
                <Share2 className="h-5 w-5 text-white" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-all active:scale-90">
                <Heart className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 right-4 md:left-8">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
               <span className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-black uppercase text-white !text-white shadow-lg shadow-green-500/30">
                 {car.type}
               </span>
               <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase text-white !text-white backdrop-blur-md">
                 {car.year}
               </span>
               <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase text-white !text-white backdrop-blur-md">
                 <MapPin className="h-3.5 w-3.5 text-white" />
                 {car.location}
               </span>
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-2xl md:text-4xl">{car.name}</h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
          <div className="mb-10 grid grid-cols-3 gap-3 md:gap-6">
             <StatItem icon={<Users className="h-5 w-5 md:h-6 md:w-6" />} label="Capacity" value={`${car.passengers} Seats`} theme={theme} />
             <StatItem icon={<Fuel className="h-5 w-5 md:h-6 md:w-6" />} label="Engine" value={car.fuelType} theme={theme} />
             <StatItem icon={<Settings2 className="h-5 w-5 md:h-6 md:w-6" />} label="Gearbox" value={car.transmission} theme={theme} />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <SectionTitle title="Gallery" />
              <div className="mb-12 grid grid-cols-2 gap-3 md:gap-4">
                {car.images.map((img, i) => (
                  <div key={i} className={`relative aspect-video overflow-hidden rounded-[2rem] shadow-sm transition-transform hover:scale-[1.02] ${i === 0 ? 'col-span-2' : ''}`}>
                    <Image src={img.url} alt={img.label} fill className="object-cover" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-lg">
                      {img.label}
                    </div>
                  </div>
                ))}
              </div>

              <SectionTitle title="About this vehicle" />
              <div className="mb-12">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {car.description}
                </p>
              </div>

              <div className="mb-12 flex items-center gap-5 rounded-[2.5rem] border border-green-100 bg-green-50/30 p-8 dark:border-white/5 dark:bg-white/5 md:gap-8">
                 <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-green-500 text-white shadow-xl shadow-green-500/20">
                    <ShieldCheck className="h-8 w-8 !text-white" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-green-600 dark:text-green-400">Safety & Verification</h4>
                    <p className="font-medium text-gray-500 dark:text-gray-400">{car.licenseInfo}</p>
                 </div>
              </div>

              <div className="mb-12">
                <div className="mb-8 flex items-center justify-between">
                  <SectionTitle title={`Reviews (${car.reviews.length})`} noMargin />
                  <div className="flex items-center gap-2 rounded-2xl bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-600">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {car.rating}
                  </div>
                </div>
                <div className="space-y-6">
                  {car.reviews.length > 0 ? car.reviews.map((rev, i) => (
                    <div key={i} className="rounded-[2rem] border border-gray-100 p-6 dark:border-white/5">
                      <div className="mb-3 flex items-center justify-between">
                         <h4 className="font-black">{rev.user}</h4>
                         <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className={`h-3 w-3 ${idx < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-white/10'}`} />
                            ))}
                         </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{rev.comment}</p>
                      <span className="mt-4 block text-[10px] font-black text-gray-400 uppercase tracking-widest">{rev.date}</span>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-gray-400 font-medium italic">No reviews yet for this vehicle.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-[3rem] border border-gray-100 bg-white p-8 shadow-2xl dark:border-white/5 dark:bg-[#121212] md:p-10">
                <div className="mb-8 border-b border-gray-100 pb-8 dark:border-white/5">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Daily Rate</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black md:text-5xl">${car.price}</span>
                    <span className="mb-1 text-sm font-bold text-gray-500">/ day</span>
                  </div>
                </div>

                <div className="mb-8 flex items-center justify-between rounded-3xl bg-gray-50 p-4 dark:bg-white/5 md:p-5">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-full ring-4 ring-green-500/10">
                         <Image src={car.owner.image} alt={car.owner.name} width={48} height={48} className="h-full w-full object-cover" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Host</p>
                         <h4 className="font-black">{car.owner.name}</h4>
                      </div>
                   </div>
                   <Link 
                     href={`/Messages?chat=${car.owner.id}`}
                     className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-green-500 shadow-lg transition-transform hover:scale-110 active:scale-90 dark:bg-white/10"
                   >
                     <MessageSquare className="h-5 w-5" />
                   </Link>
                </div>

                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-4 text-lg font-black text-white !text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] hover:shadow-green-500/40 active:scale-95 md:py-5"
                >
                   Book This Car
                   <ChevronRight className="h-6 w-6 !text-white" />
                </button>
                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400">
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

function SectionTitle({ title, noMargin }: { title: string, noMargin?: boolean }) {
  return (
    <h3 className={`font-black uppercase tracking-[0.2em] text-gray-400 text-[11px] ${noMargin ? '' : 'mb-6'}`}>
      {title}
    </h3>
  );
}

function BookingModal({ car, onClose, theme, onSuccess }: { car: Car, onClose: () => void, theme: string, onSuccess: () => void }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const days = calculateDays();
  const total = car.price * days;
  const serviceFee = Math.round(total * 0.05);

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
        total: total + serviceFee,
        bookedAt: new Date().toISOString()
      });
      localStorage.setItem("car_bookings", JSON.stringify(bookings));
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-[3rem] bg-white text-gray-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 dark:bg-[#121212] dark:text-white border border-white/5">
        
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div>
            <h2 className="text-2xl font-bold">Plan your trip</h2>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Direct booking with {car.owner.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors dark:bg-white/5 dark:hover:bg-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-8 custom-scrollbar">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-6 rounded-[2rem] bg-gray-50 p-5 dark:bg-white/5">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-2xl shadow-lg">
                  <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{car.name}</h3>
                  <p className="text-[11px] font-bold text-green-500 uppercase tracking-widest mb-2">{car.type} • {car.fuelType}</p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {car.location}, Rwanda
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <DateInput label="Pick-up Date" value={startDate} onChange={setStartDate} theme={theme} />
                <DateInput label="Return Date" value={endDate} onChange={setEndDate} theme={theme} />
              </div>

              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Guests / Passengers</label>
                <div className={`flex items-center justify-between rounded-[1.5rem] border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="font-bold text-lg">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setGuests(Math.min(car.passengers, guests + 1))}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[10px] font-bold text-gray-400 italic">Maximum {car.passengers} passengers allowed.</p>
              </div>

              {days > 0 && (
                <div className={`rounded-[2rem] border p-6 shadow-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-green-100 bg-green-50/20'}`}>
                  <div className="mb-4 flex justify-between text-base font-medium">
                    <span className="text-gray-500 dark:text-gray-400">${car.price} x {days} days</span>
                    <span className="font-bold">${total}</span>
                  </div>
                  <div className="mb-4 flex justify-between text-base font-medium">
                    <span className="text-gray-500 dark:text-gray-400">Service Fee</span>
                    <span className="font-bold">${serviceFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-5 dark:border-white/10">
                    <div>
                      <span className="text-2xl font-bold">Total</span>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Includes all taxes</p>
                    </div>
                    <span className="text-3xl font-bold text-green-500">${total + serviceFee}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setStep(2)}
                disabled={!startDate || !endDate}
                className="group flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-5 text-xl font-bold text-white !text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                Confirm Details
                <ChevronRight className="h-6 w-6 !text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 text-green-500">
                <CreditCard className="h-8 w-8" />
                <h3 className="text-2xl font-black">Payment Confirmation</h3>
              </div>

              <div className="space-y-4">
                <PaymentOption icon="💳" label="Visa / Mastercard" sub="Ending in •••• 4242" selected theme={theme} />
                <PaymentOption icon="📱" label="Mobile Money" sub="Direct payment via PINDO" theme={theme} />
              </div>

              <div className={`rounded-[2rem] p-6 text-sm font-medium leading-relaxed ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 shrink-0 text-blue-500" />
                  <p>By proceeding, you agree to our <span className="text-green-500 underline font-bold cursor-pointer">Rental Agreement</span> and confirm you have a valid driving license for the selected vehicle category.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className={`flex-1 rounded-[1.5rem] py-5 font-black transition-all ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Edit Trip
                </button>
                <button 
                  onClick={handleBooking}
                  className="flex-[2] flex items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-5 text-xl font-bold text-white !text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] active:scale-95"
                >
                  {loading ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  ) : (
                    <>Pay & Book Trip</>
                  )}
                </button>
              </div>
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
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{label}</label>
      <div className="relative">
        <input 
          type="date" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-[1.25rem] border p-4 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-green-500/20 ${
            theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
          }`}
        />
      </div>
    </div>
  );
}

function PaymentOption({ icon, label, sub, selected, theme }: any) {
  return (
    <div className={`flex items-center justify-between rounded-[2rem] border p-6 cursor-pointer transition-all ${
      selected 
        ? 'border-green-500 bg-green-500/5 ring-4 ring-green-500/10' 
        : theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-white shadow-sm'
    }`}>
      <div className="flex items-center gap-5">
        <span className="text-3xl filter grayscale-[0.5]">{icon}</span>
        <div>
          <h4 className="text-base font-bold">{label}</h4>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{sub}</p>
        </div>
      </div>
      <div className={`h-6 w-6 rounded-full border-4 flex items-center justify-center transition-colors ${selected ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-white/20'}`}>
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, theme }: any) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[2rem] border transition-all duration-300 py-6 md:py-8 ${
      theme === 'dark' ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-gray-50 border-gray-100 hover:bg-gray-100/50 shadow-sm'
    }`}>
      <div className="mb-3 text-green-500 md:mb-4">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</span>
      <span className="text-sm font-black md:text-base tracking-tight">{value}</span>
    </div>
  );
}
