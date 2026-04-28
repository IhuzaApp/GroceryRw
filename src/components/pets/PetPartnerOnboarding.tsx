"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  User,
  Check,
  Home,
  Dog,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/router";
import Image from "next/image";
import { PendingReviewMessage } from "../business/PendingReviewMessage";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import { Autocomplete } from "@react-google-maps/api";
import { useEffect, useRef } from "react";
import { uploadToFirebase } from "../../utils/firebaseUtils";

const STEPS = [
  {
    id: 1,
    title: "Account Type",
    description: "Choose your setup",
    icon: <User className="h-6 w-6" />,
  },
  {
    id: 2,
    title: "Details",
    description: "About you or your shelter",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: 3,
    title: "Specialty",
    description: "What pets you list",
    icon: <Dog className="h-6 w-6" />,
  },
  {
    id: 4,
    title: "Verification",
    description: "Upload documents",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    id: 5,
    title: "Review",
    description: "Final check",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
];

export default function PetPartnerOnboarding() {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { isLoaded } = useGoogleMap();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: "personal" as "business" | "personal",
    businessName: "",
    businessAddress: "",
    fullName: "",
    personalAddress: "",
    nationalIdOrPassport: "",
    petTypes: [] as string[],
    documents: {
      proof_residency: "",
      rdb_certificate: "",
      sherter_permit: "",
    },
    documentsUploaded: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill user data
  useEffect(() => {
    if (session?.user && formData.accountType === "personal") {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || "",
      }));

      // Fetch default address
      fetch("/api/queries/addresses")
        .then(res => res.json())
        .then(data => {
          const defaultAddr = data.addresses?.find((a: any) => a.is_default) || data.addresses?.[0];
          if (defaultAddr) {
            setFormData(prev => ({
              ...prev,
              personalAddress: prev.personalAddress || defaultAddr.street || "",
            }));
          }
        })
        .catch(err => console.error("Error fetching address:", err));
    }
  }, [session, formData.accountType]);

  const handleFileUpload = async (file: File, docName: string) => {
    setIsLoading(true);
    try {
      const path = `verifications/pets/${session?.user?.id}/${Date.now()}_${file.name}`;
      const url = await uploadToFirebase(file, path);
      
      setFormData(prev => {
        const newDocs = { ...prev.documents };
        let nationalIdOrPassport = prev.nationalIdOrPassport;

        if (docName === "Registration Certificate") newDocs.rdb_certificate = url;
        else if (docName === "Shelter Permit") newDocs.sherter_permit = url;
        else if (docName === "Owner ID" || docName === "National ID") {
          nationalIdOrPassport = url;
        }
        else if (docName === "Proof of Residence") newDocs.proof_residency = url;

        return {
          ...prev,
          documents: newDocs,
          nationalIdOrPassport,
        };
      });
      toast.success(`${docName} uploaded successfully!`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || "";
      if (formData.accountType === "business") {
        setFormData({ ...formData, businessAddress: address });
      } else {
        setFormData({ ...formData, personalAddress: address });
      }
    }
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mutations/register-pet-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.accountType === "business" ? formData.businessAddress : formData.personalAddress,
          fullname: formData.accountType === "business" ? formData.businessName : formData.fullName,
          organisationName: formData.accountType === "business" ? formData.businessName : "",
          nationalIdOrPassport: formData.nationalIdOrPassport,
          proof_residency: formData.documents.proof_residency,
          rdb_certificate: formData.documents.rdb_certificate,
          sherter_permit: formData.documents.sherter_permit,
          specialties: formData.petTypes.join(", "),
          status: "pending",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="h-full duration-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="relative mb-12 hidden h-[240px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl md:block">
              <Image
                src="https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=2070&auto=format&fit=crop"
                alt="Pet Partnership"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h1 className="font-outfit text-4xl font-black tracking-tight !text-white text-white">
                  Become a Pet Partner
                </h1>
                <p className="text-lg font-black !text-white/80 text-white/80">
                  Help pets find homes and earn trust
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <button
                onClick={() =>
                  setFormData({ ...formData, accountType: "personal" })
                }
                className={`group relative flex flex-col items-start rounded-[2.5rem] border p-8 text-left transition-all ${
                  formData.accountType === "personal"
                    ? "border-green-500 bg-green-500/5 shadow-xl shadow-green-500/10"
                    : theme === "dark"
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${
                    formData.accountType === "personal"
                      ? "bg-green-500 text-white"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  <User className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-outfit text-2xl font-black">
                  Individual
                </h3>
                <p className="text-sm font-normal text-gray-500">
                  For pet owners listing their own pets for sale or donation.
                </p>
              </button>

              <button
                onClick={() =>
                  setFormData({ ...formData, accountType: "business" })
                }
                className={`group relative flex flex-col items-start rounded-[2.5rem] border p-8 text-left transition-all ${
                  formData.accountType === "business"
                    ? "border-green-500 bg-green-500/5 shadow-xl shadow-green-500/10"
                    : theme === "dark"
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${
                    formData.accountType === "business"
                      ? "bg-green-500 text-white"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-outfit text-2xl font-black">
                  Shelter / Organization
                </h3>
                <p className="text-sm font-normal text-gray-500">
                  For registered animal shelters, rescues, or professional
                  breeders.
                </p>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-2 font-outfit text-3xl font-black tracking-tight">
              {formData.accountType === "business"
                ? "Organization Details"
                : "Personal Details"}
            </h2>
            <div className="space-y-6">
              {formData.accountType === "business" ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Address
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.businessAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      RDB Certificate Number
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.documents.rdb_certificate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documents: { ...formData.documents, rdb_certificate: e.target.value },
                        })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      National ID / Passport
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.nationalIdOrPassport}
                      onChange={(e) =>
                        setFormData({ ...formData, nationalIdOrPassport: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Home Address
                    </label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={onPlaceChanged}
                      >
                        <input
                          type="text"
                          className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                            theme === "dark"
                              ? "border-white/10 bg-white/5 text-white"
                              : "border-gray-200 bg-gray-50 text-gray-900"
                          }`}
                          value={formData.personalAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personalAddress: e.target.value,
                            })
                          }
                          placeholder="Search home address..."
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                          theme === "dark"
                            ? "border-white/10 bg-white/5 text-white"
                            : "border-gray-200 bg-gray-50 text-gray-900"
                        }`}
                        value={formData.personalAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personalAddress: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-2 font-outfit text-3xl font-black tracking-tight">
              Pet Specialties
            </h2>
            <p className="mb-8 text-gray-500">
              Select the types of pets you typically list.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {["Dogs", "Cats", "Birds", "Small Pets"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    const newTypes = formData.petTypes.includes(type)
                      ? formData.petTypes.filter((t) => t !== type)
                      : [...formData.petTypes, type];
                    setFormData({ ...formData, petTypes: newTypes });
                  }}
                  className={`flex items-center justify-center rounded-3xl border p-8 text-xl font-black transition-all ${
                    formData.petTypes.includes(type)
                      ? "border-green-500 bg-green-500 text-white shadow-xl shadow-green-500/20"
                      : theme === "dark"
                      ? "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        const docs = formData.accountType === "business"
          ? ["Registration Certificate", "Shelter Permit", "Owner ID"]
          : ["National ID", "Proof of Residence"];
        
        return (
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-2 font-outfit text-3xl font-black tracking-tight">
              Verification
            </h2>
            <p className="mb-8 text-gray-500">
              Upload documents to verify your status.
            </p>
            <div className="space-y-4">
              {docs.map((doc) => {
                let isUploaded = false;
                if (doc === "Registration Certificate") isUploaded = !!formData.documents.rdb_certificate;
                else if (doc === "Shelter Permit") isUploaded = !!formData.documents.sherter_permit;
                else if (doc === "Owner ID" || doc === "National ID") isUploaded = !!formData.nationalIdOrPassport;
                else if (doc === "Proof of Residence") isUploaded = !!formData.documents.proof_residency;

                return (
                  <div
                    key={doc}
                    className={`flex items-center justify-between rounded-3xl border p-6 ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isUploaded ? "bg-green-500 text-white" : "bg-gray-500/10 text-gray-500"
                      }`}>
                        {isUploaded ? <Check className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-outfit font-black">{doc}</h4>
                        <p className={`text-xs font-black uppercase tracking-widest ${
                          isUploaded ? "text-green-500" : "text-gray-400"
                        }`}>
                          {isUploaded ? "Uploaded" : "Required"}
                        </p>
                      </div>
                    </div>
                    <label className="cursor-pointer rounded-xl bg-green-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-green-600">
                      {isUploaded ? "Change" : "Upload"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, doc);
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500 text-white shadow-2xl shadow-green-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mb-2 font-outfit text-3xl font-black tracking-tight">
              Ready to Submit
            </h2>
            <div
              className={`space-y-4 rounded-3xl p-6 ${
                theme === "dark" ? "bg-white/5" : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between border-b border-gray-200/10 pb-4">
                <span className="text-xs font-normal uppercase text-gray-500">
                  Account Type
                </span>
                <span className="font-normal capitalize">
                  {formData.accountType}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200/10 pb-4">
                <span className="text-xs font-normal uppercase text-gray-500">
                  Name
                </span>
                <span className="font-normal">
                  {formData.accountType === "business"
                    ? formData.businessName
                    : formData.fullName || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-normal uppercase text-gray-500">
                  Specialties
                </span>
                <span className="font-normal">
                  {formData.petTypes.join(", ") || "None selected"}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={`min-h-screen md:ml-20 ${
          theme === "dark"
            ? "bg-[#0A0A0A] text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <PendingReviewMessage />
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen flex-col md:ml-20 ${
        theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-32 pt-24">
        {/* Progress Bar */}
        <div className="relative z-10 mb-12 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-white/10" : "bg-gray-100"
            }`}
          />
          <div
            className="relative z-10 h-full bg-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-xl font-black text-white shadow-lg">
            {currentStep}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-green-500">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-lg font-black">
              {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        <div className="flex-1">{renderStep()}</div>

        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200/10 p-6 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 rounded-2xl px-6 py-4 font-black transition-all ${
                currentStep === 1
                  ? "pointer-events-none opacity-0"
                  : theme === "dark"
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
            <button
              onClick={currentStep === STEPS.length ? handleFinish : nextStep}
              disabled={isLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 font-black !text-white text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] sm:flex-none sm:px-12 ${
                isLoading ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : currentStep === STEPS.length ? (
                "Finish Application"
              ) : (
                "Continue"
              )}
              {!isLoading && currentStep !== STEPS.length && (
                <ChevronRight className="h-5 w-5" />
              )}
              {!isLoading && currentStep === STEPS.length && (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
