"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
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
  X
} from "lucide-react";
import { Pet } from "../../constants/dummyPets";
import { useTheme } from "../../context/ThemeContext";
import RootLayout from "../ui/layout";
import { formatCurrencySync } from "../../utils/formatCurrency";

export default function PetDetailsPage({ pet }: { pet: Pet }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>(pet.videoUrl ? 'video' : 'image');
  const [showCert, setShowCert] = useState(false);

  const isBaby = pet.ageInMonths < 6;

  return (
    <RootLayout>
      <div className="min-h-screen pb-24 md:ml-20 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-200">
        
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
                <Share2 className="h-5 w-5 text-white !text-white" />
              </button>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-white !text-white'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>


          <div className="absolute bottom-6 left-4 right-4 md:left-8">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
               <span className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-black uppercase text-white !text-white shadow-lg">
                 {pet.type}
               </span>
               <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase text-white !text-white backdrop-blur-md">
                 {pet.breed}
               </span>
               <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase text-white !text-white backdrop-blur-md">
                 <MapPin className="h-3.5 w-3.5 text-white !text-white" />
                 {pet.location.split(',')[0]}
               </span>
               {pet.status === 'sold' && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase text-white !text-white shadow-lg">
                    Sold
                  </span>
               )}
            </div>
            <h1 className="text-4xl font-black text-white !text-white drop-shadow-2xl md:text-5xl font-outfit">{pet.name}</h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
          {/* Quick Stats */}
          <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
             <StatItem icon={<Calendar className="h-5 w-5 md:h-6 md:w-6" />} label="Age" value={pet.age} theme={theme} />
             <StatItem icon={<Info className="h-5 w-5 md:h-6 md:w-6" />} label="Gender" value={pet.gender} theme={theme} />
             <StatItem icon={<Star className="h-5 w-5 md:h-6 md:w-6" />} label="Color" value={pet.color} theme={theme} />
             <StatItem icon={<Scale className="h-5 w-5 md:h-6 md:w-6" />} label="Weight" value={pet.weight} theme={theme} />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              {/* About Section */}
              <SectionTitle title="The Story" />
              <div className="mb-12">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-sans">
                  {pet.story}
                </p>
              </div>

              {/* Health Info */}
              <div className="mb-12">
                <SectionTitle title="Health & Vaccination" />
                <div className="rounded-[2.5rem] border border-green-100 bg-green-50/30 p-8 dark:border-white/5 dark:bg-white/5">
                   <div className="flex items-center gap-5 md:gap-8 mb-6">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-green-500 text-white shadow-xl shadow-green-500/20">
                         <ShieldCheck className="h-8 w-8 !text-white" />
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-green-600 dark:text-green-400 font-outfit">Wellness Status</h4>
                         <p className="font-black text-gray-500 dark:text-gray-400 font-sans">
                           {pet.isVaccinated ? "Fully Vaccinated" : "Partially Vaccinated"} • {pet.healthInfo}
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Vaccinations</h5>
                        <div className="flex flex-wrap gap-2">
                           {pet.vaccinations.map((v, i) => (
                             <span key={i} className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-[11px] font-black text-green-600 dark:text-green-400">
                               <CheckCircle2 className="h-3 w-3" />
                               {v}
                             </span>
                           ))}
                        </div>
                      </div>
                      {pet.vaccinationCertificateUrl && (
                        <div>
                          <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Documents</h5>
                          <button 
                            onClick={() => setShowCert(true)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-green-200 p-4 transition-colors hover:bg-green-50 dark:border-white/10 dark:hover:bg-white/10"
                          >
                             <FileText className="h-5 w-5 text-green-500" />
                             <span className="text-sm font-black">Vaccination Certificate</span>
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
                  <p className="mb-6 text-sm text-gray-500 font-sans">
                    Since {pet.name} is under 6 months, we provide photos of the parents for your reference.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {pet.parentImages.map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-[2rem] border border-gray-100 dark:border-white/5">
                        <Image src={img.url} alt={img.label} fill className="object-cover" />
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
                  <div className="relative aspect-video overflow-hidden rounded-[2rem] shadow-sm col-span-2">
                    <video 
                      src={pet.videoUrl} 
                      controls
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black text-white !text-white backdrop-blur-lg">
                      Video Tour
                    </div>
                  </div>
                )}
                {pet.images.map((img, i) => (
                  <div key={i} className={`relative aspect-video overflow-hidden rounded-[2rem] shadow-sm transition-transform hover:scale-[1.02] ${i === 0 && !pet.videoUrl ? 'col-span-2' : ''}`}>
                    <Image src={img.url} alt={img.label} fill className="object-cover" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black text-white !text-white backdrop-blur-lg">
                      {img.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reviews */}
              <div className="mb-12">
                <div className="mb-8 flex items-center justify-between">
                  <SectionTitle title={`Reviews (${pet.reviews.length})`} noMargin />
                  <div className="flex items-center gap-2 rounded-2xl bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-600">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {pet.rating}
                  </div>
                </div>
                <div className="space-y-6">
                  {pet.reviews.length > 0 ? pet.reviews.map((rev, i) => (
                    <div key={i} className="rounded-[2rem] border border-gray-100 p-6 dark:border-white/5">
                      <div className="mb-3 flex items-center justify-between">
                         <h4 className="font-black font-outfit">{rev.user}</h4>
                         <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className={`h-3 w-3 ${idx < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-white/10'}`} />
                            ))}
                         </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-sans">{rev.comment}</p>
                      <span className="mt-4 block text-[10px] font-normal text-gray-400 uppercase tracking-widest">{rev.date}</span>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-gray-400 font-normal italic">No reviews yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Sticky Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-[3rem] border border-gray-100 bg-white p-8 shadow-2xl dark:border-white/5 dark:bg-[#121212] md:p-10">
                <div className="mb-8 border-b border-gray-100 pb-8 dark:border-white/5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 font-outfit">
                    {pet.isDonation ? "Adoption Fee" : "Asking Price"}
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black md:text-5xl font-outfit">
                      {pet.isDonation ? "FREE" : formatCurrencySync(pet.price)}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                   <div className="mb-4 flex items-center justify-between rounded-3xl bg-gray-50 p-4 dark:bg-white/5 md:p-5">
                      <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-4 ring-green-500/10">
                            <Image src={pet.owner.image} alt={pet.owner.name} fill className="object-cover" />
                            {pet.owner.isVerified && (
                              <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-0.5">
                                <UserCheck className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-normal uppercase tracking-widest text-gray-400 font-outfit">Listed by</p>
                            <h4 className="font-black font-outfit">{pet.owner.name}</h4>
                          </div>
                      </div>
                   </div>
                   
                   <button 
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-green-500 py-4 font-black text-green-500 transition-all hover:bg-green-500 hover:text-white active:scale-95 font-outfit"
                   >
                     <MessageSquare className="h-5 w-5" />
                     Chat with Seller
                   </button>
                </div>

                <button 
                  disabled={pet.status === 'sold'}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-green-500 py-5 text-xl font-black text-white !text-white shadow-2xl shadow-green-500/30 transition-all hover:translate-y-[-2px] hover:shadow-green-500/40 active:scale-95 md:py-6 font-outfit disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                   <span className="!text-white">{pet.isDonation ? "Adopt Now" : "Buy Now"}</span>
                   <ChevronRight className="h-6 w-6 !text-white" />
                </button>
                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-normal text-gray-400 font-sans text-center">
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
              <h3 className="text-lg font-black font-outfit">Vaccination Certificate</h3>
              <p className="text-sm text-gray-500 font-sans">Official health documentation for {pet.name}</p>
            </div>
          </div>
        </div>
      )}
    </RootLayout>
  );
}

function SectionTitle({ title, noMargin }: { title: string, noMargin?: boolean }) {
  return (
    <h3 className={`font-black uppercase tracking-[0.2em] text-gray-400 text-[11px] font-outfit ${noMargin ? '' : 'mb-6'}`}>
      {title}
    </h3>
  );
}

function StatItem({ icon, label, value, theme }: any) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[2rem] border transition-all duration-300 py-6 md:py-8 ${
      theme === 'dark' ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-gray-50 border-gray-100 hover:bg-gray-100/50 shadow-sm'
    }`}>
      <div className="mb-3 text-green-500 md:mb-4">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 font-outfit">{label}</span>
      <span className="text-sm font-black md:text-base tracking-tight font-sans">{value}</span>
    </div>
  );
}
