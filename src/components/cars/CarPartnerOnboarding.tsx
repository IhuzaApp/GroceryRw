"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Car, Building2, FileText, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/router";

const STEPS = [
  { id: 1, title: "Welcome", description: "Start your journey", icon: <Car className="h-6 w-6" /> },
  { id: 2, title: "Business", description: "About your company", icon: <Building2 className="h-6 w-6" /> },
  { id: 3, title: "Fleet", description: "Add your vehicles", icon: <Car className="h-6 w-6" /> },
  { id: 4, title: "Documents", description: "Verify identity", icon: <FileText className="h-6 w-6" /> },
  { id: 5, title: "Review", description: "Final check", icon: <CheckCircle2 className="h-6 w-6" /> },
];

export default function CarPartnerOnboarding() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    fleetSize: "",
    carTypes: [] as string[],
    documentsUploaded: false,
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinish = () => {
    // In a real app, we would submit to an API here
    router.push("/Cars/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500 text-white shadow-2xl shadow-green-500/20">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">Become a Car Rental Partner</h1>
            <p className="mb-8 text-xl text-gray-500 leading-relaxed">Join thousands of businesses renting out their fleet on our platform. Earn more with less effort.</p>
            <div className="space-y-6">
              {[
                "Reach thousands of active renters daily",
                "Professional dashboard to manage your fleet",
                "Secure payments and insurance coverage",
                "Easy and fast onboarding process"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-gray-600 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="mb-2 text-3xl font-black tracking-tight">Business Details</h2>
            <p className="mb-8 text-gray-500">Tell us about your rental business.</p>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-500">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elite Car Rentals"
                  className={`w-full rounded-2xl border p-4 text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-500">Business Address</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Rental St, Kigali"
                  className={`w-full rounded-2xl border p-4 text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="mb-2 text-3xl font-black tracking-tight">Fleet Information</h2>
            <p className="mb-8 text-gray-500">How many cars do you plan to list?</p>
            <div className="grid grid-cols-2 gap-4">
              {["1-5", "6-15", "16-50", "50+"].map((range) => (
                <button
                  key={range}
                  onClick={() => setFormData({ ...formData, fleetSize: range })}
                  className={`flex items-center justify-center rounded-3xl border p-8 text-xl font-black transition-all ${
                    formData.fleetSize === range
                      ? 'border-green-500 bg-green-500 text-white shadow-xl shadow-green-500/20'
                      : theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="mb-2 text-3xl font-black tracking-tight">Documents</h2>
            <p className="mb-8 text-gray-500">Upload your business license and ID.</p>
            <div className="space-y-4">
              {["Business License", "Trading Permit", "Owner ID / Passport"].map((doc) => (
                <div key={doc} className={`flex items-center justify-between rounded-3xl border p-6 ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-500/10 text-gray-500">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">{doc}</h4>
                      <p className="text-xs text-gray-500 text-green-500">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                  <button className="rounded-xl bg-green-500/10 px-4 py-2 text-sm font-bold text-green-500 hover:bg-green-500/20">
                    Upload
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500 text-white shadow-2xl shadow-green-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-3xl font-black tracking-tight">Review & Submit</h2>
            <p className="mb-8 text-gray-500">Almost there! Review your details before submitting.</p>
            <div className={`space-y-4 rounded-3xl p-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex justify-between border-b border-gray-200/10 pb-4">
                <span className="font-bold text-gray-500 uppercase text-xs">Business</span>
                <span className="font-black">{formData.businessName || "Not provided"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/10 pb-4">
                <span className="font-bold text-gray-500 uppercase text-xs">Address</span>
                <span className="font-black">{formData.businessAddress || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-500 uppercase text-xs">Fleet Size</span>
                <span className="font-black">{formData.fleetSize || "Not provided"}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-900'}`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-50 px-4 pt-6">
         <div className={`mx-auto max-w-4xl h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
            <div 
              className="h-full bg-green-500 transition-all duration-1000 ease-out" 
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
         </div>
      </div>

      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 pt-24 pb-32">
        {/* Step Indicator */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white font-black text-xl">
            {currentStep}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-green-500">Step {currentStep} of {STEPS.length}</span>
            <span className="text-lg font-bold">{STEPS[currentStep - 1].title}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {renderStep()}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 w-full p-6 backdrop-blur-xl border-t border-gray-200/10">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 rounded-2xl px-6 py-4 font-bold transition-all ${
                currentStep === 1 ? 'opacity-0 pointer-events-none' : theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
            <button
              onClick={currentStep === STEPS.length ? handleFinish : nextStep}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] sm:flex-none sm:px-12"
            >
              {currentStep === STEPS.length ? "Finish Application" : "Continue"}
              {currentStep !== STEPS.length && <ChevronRight className="h-5 w-5" />}
              {currentStep === STEPS.length && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
