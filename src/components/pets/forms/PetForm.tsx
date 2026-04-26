"use client";

import React, { useState } from "react";
import { 
  Dog, 
  Cat, 
  Bird, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Video, 
  ShieldCheck, 
  CheckCircle2,
  Scale,
  MapPin,
  Calendar,
  X
} from "lucide-react";

export interface PetFormData {
  name: string;
  type: string;
  breed: string;
  age: string;
  ageInMonths: number;
  gender: 'Male' | 'Female';
  color: string;
  weight: string;
  story: string;
  isVaccinated: boolean;
  vaccinations: string[];
  price: string;
  isDonation: boolean;
  location: string;
  status: 'available' | 'sold';
  images: { url: string; label: string }[];
  videoUrl?: string;
  vaccinationCertificateUrl?: string;
}

interface PetFormProps {
  formData: PetFormData;
  setFormData: React.Dispatch<React.SetStateAction<PetFormData>>;
  theme: string;
}

export default function PetForm({ formData, setFormData, theme }: PetFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const StepIndicator = () => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Step {step} of {totalSteps}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {step === 1 && "Basic Information"}
          {step === 2 && "Physical & Story"}
          {step === 3 && "Health & Safety"}
          {step === 4 && "Media Assets"}
          {step === 5 && "Review & Pricing"}
        </span>
      </div>
      <div className="flex gap-2">
        {[...Array(totalSteps)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i + 1 <= step ? "bg-green-500" : "bg-gray-100 dark:bg-white/5"
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <StepIndicator />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 && (
          <div className="space-y-6">
            <FormSection title="The Basics" icon={<Info />} theme={theme}>
              <div className="space-y-4">
                <InputField 
                  label="Pet Name" 
                  placeholder="e.g. Buddy" 
                  value={formData.name}
                  onChange={(v) => setFormData({...formData, name: v})}
                  theme={theme}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField 
                    label="Pet Type" 
                    options={["Dog", "Cat", "Bird", "Rabbit", "Other"]}
                    value={formData.type}
                    onChange={(v) => setFormData({...formData, type: v})}
                    theme={theme}
                  />
                  <InputField 
                    label="Breed" 
                    placeholder="e.g. Golden Retriever" 
                    value={formData.breed}
                    onChange={(v) => setFormData({...formData, breed: v})}
                    theme={theme}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Age Description" 
                    placeholder="e.g. 2 years old" 
                    value={formData.age}
                    onChange={(v) => setFormData({...formData, age: v})}
                    theme={theme}
                  />
                   <InputField 
                    label="Age (Months)" 
                    type="number"
                    value={formData.ageInMonths.toString()}
                    onChange={(v) => setFormData({...formData, ageInMonths: parseInt(v) || 0})}
                    theme={theme}
                  />
                </div>
                <InputField 
                  label="Quantity for Sale" 
                  type="number"
                  placeholder="How many are you listing?"
                  value={(formData as any).quantity?.toString() || "1"}
                  onChange={(v) => setFormData({...formData, quantity: parseInt(v) || 1} as any)}
                  theme={theme}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, gender: g as any})}
                        className={`flex-1 rounded-2xl py-3 text-sm font-black transition-all ${
                          formData.gender === g 
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                            : "bg-gray-100 dark:bg-white/5 text-gray-500"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <FormSection title="Physical Details" icon={<Scale />} theme={theme}>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Color" 
                  placeholder="e.g. Golden Brown" 
                  value={formData.color}
                  onChange={(v) => setFormData({...formData, color: v})}
                  theme={theme}
                />
                <InputField 
                  label="Weight" 
                  placeholder="e.g. 12kg" 
                  value={formData.weight}
                  onChange={(v) => setFormData({...formData, weight: v})}
                  theme={theme}
                />
              </div>
            </FormSection>
            <FormSection title="Their Story" icon={<Dog />} theme={theme}>
              <textarea
                placeholder="Tell us about their personality, likes, dislikes, and why they need a new home..."
                className={`w-full min-h-[150px] rounded-[2rem] border p-6 text-sm font-bold outline-none transition-all ${
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-green-500/50" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-green-500"
                }`}
                value={formData.story}
                onChange={(e) => setFormData({...formData, story: e.target.value})}
              />
            </FormSection>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <FormSection title="Health Record" icon={<ShieldCheck />} theme={theme}>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500" />
                  <span className="text-sm font-black">Fully Vaccinated?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isVaccinated: !formData.isVaccinated})}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.isVaccinated ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isVaccinated ? "left-7" : "left-1"}`} />
                </button>
              </div>

              {formData.isVaccinated && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Vaccinations</label>
                    <div className="flex gap-2 flex-wrap">
                      {["Rabies", "Distemper", "Parvovirus", "Bordetella"].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            const exists = formData.vaccinations.includes(v);
                            setFormData({
                              ...formData, 
                              vaccinations: exists 
                                ? formData.vaccinations.filter(x => x !== v) 
                                : [...formData.vaccinations, v]
                            });
                          }}
                          className={`rounded-full px-4 py-2 text-[11px] font-black transition-all ${
                            formData.vaccinations.includes(v)
                              ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                              : "bg-gray-100 dark:bg-white/5 text-gray-500"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vaccination Certificate</label>
                    <div className={`relative h-40 w-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.vaccinationCertificateUrl 
                        ? "border-green-500 bg-green-500/5" 
                        : theme === 'dark' ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                      {formData.vaccinationCertificateUrl ? (
                        <div className="relative h-full w-full">
                           <Image src={formData.vaccinationCertificateUrl} alt="Certificate" fill className="object-cover rounded-[1.8rem]" />
                           <button 
                             onClick={() => setFormData({...formData, vaccinationCertificateUrl: ""})}
                             className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md"
                           >
                             <X className="h-4 w-4" />
                           </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="text-gray-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Upload or Capture Image</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </FormSection>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <FormSection title="Visuals" icon={<Camera />} theme={theme}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-500/5 transition-all ${theme === 'dark' ? "border-white/10" : "border-gray-200"}`}>
                  <Camera className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Main Photo</span>
                </div>
                <div className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-500/5 transition-all ${theme === 'dark' ? "border-white/10" : "border-gray-200"}`}>
                  <Video className="text-gray-400" />
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Add Video</span>
                    <span className="text-[8px] font-medium text-gray-400 block mt-1">Max 1 Min • Max 20MB</span>
                  </div>
                </div>
              </div>
            </FormSection>

            {formData.ageInMonths < 6 && (
              <FormSection title="Meet the Parents" icon={<Heart />} theme={theme}>
                <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest">Since the pet is under 6 months, please add photos of the parents.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-500/5 transition-all ${theme === 'dark' ? "border-white/10" : "border-gray-200"}`}>
                    <Camera className="text-gray-400 h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Father's Photo</span>
                  </div>
                  <div className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-500/5 transition-all ${theme === 'dark' ? "border-white/10" : "border-gray-200"}`}>
                    <Camera className="text-gray-400 h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Mother's Photo</span>
                  </div>
                </div>
              </FormSection>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <FormSection title="Listing Details" icon={<MapPin />} theme={theme}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <span className="text-sm font-black">Is this a Donation? (Free)</span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isDonation: !formData.isDonation})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isDonation ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isDonation ? "left-7" : "left-1"}`} />
                  </button>
                </div>

                {!formData.isDonation && (
                  <InputField 
                    label="Price (USD)" 
                    placeholder="e.g. 150" 
                    value={formData.price}
                    onChange={(v) => setFormData({...formData, price: v})}
                    theme={theme}
                  />
                )}

                <InputField 
                  label="Location" 
                  placeholder="e.g. Kigali, Rwanda" 
                  value={formData.location}
                  onChange={(v) => setFormData({...formData, location: v})}
                  theme={theme}
                />
              </div>
            </FormSection>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 z-50">
          <div className="max-w-2xl mx-auto flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black transition-all ${
                  theme === 'dark' ? "bg-white/5 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20"
              >
                Continue
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20"
              >
                Complete Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, icon, children, theme }: any) {
  return (
    <div className={`rounded-[2.5rem] border p-8 ${theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm"}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
          {React.cloneElement(icon, { className: "h-5 w-5" })}
        </div>
        <h3 className="text-lg font-black font-outfit uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, theme, type = "text" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all ${
          theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-green-500/50" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-green-500"
        }`}
      />
    </div>
  );
}

function SelectField({ label, options, value, onChange, theme }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all ${
          theme === 'dark' ? "bg-[#1A1A1A] border-white/10 text-white focus:border-green-500/50" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-green-500"
        }`}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
