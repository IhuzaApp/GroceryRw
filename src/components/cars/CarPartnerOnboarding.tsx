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
import LoadingScreen from "../ui/LoadingScreen";

const CarIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    description: "About you or your company",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: 3,
    title: "Fleet",
    description: "Add your vehicles",
    icon: <CarIcon className="h-6 w-6" />,
  },
  {
    id: 4,
    title: "Documents",
    description: "Verify identity",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    id: 5,
    title: "Review",
    description: "Final check",
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
];

export default function CarPartnerOnboarding() {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { isLoaded } = useGoogleMap();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isChecking, setIsChecking] = useState(true);
  const [formData, setFormData] = useState({
    accountType: "business" as "business" | "personal",
    businessName: "",
    businessAddress: "",
    fullName: "",
    personalAddress: "",
    fleetSize: "",
    carTypes: [] as string[],
    documentsUploaded: false,
    nationalIdOrPassport: "",
    license: "",
    business_cert: "",
    proof_address: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      try {
        const response = await fetch("/api/queries/check-logistics-account");
        if (response.ok) {
          const data = await response.json();
          if (data.hasAccount) {
            router.push("/Cars/dashboard");
            return;
          }
        }
        setIsChecking(false);
      } catch (error) {
        console.error("Error checking logistics account:", error);
        setIsChecking(false);
      }
    };

    if (session?.user) {
      checkAccount();
    } else if (session === null) {
      setIsChecking(false);
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user && formData.accountType === "personal") {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || "",
      }));

      fetch("/api/queries/addresses")
        .then((res) => res.json())
        .then((data) => {
          const defaultAddr =
            data.addresses?.find((a: any) => a.is_default) ||
            data.addresses?.[0];
          if (defaultAddr) {
            setFormData((prev) => ({
              ...prev,
              personalAddress: prev.personalAddress || defaultAddr.street || "",
            }));
          }
        })
        .catch((err) => console.error("Error fetching address:", err));
    }
  }, [session, formData.accountType]);

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

  const handleFileUpload = async (file: File, fieldName: string) => {
    if (!session?.user?.id) return;

    const toastId = toast.loading(
      `Uploading ${fieldName.replace(/_/g, " ")}...`
    );
    try {
      const path = `verifications/cars/${session.user.id}/${fieldName}`;
      const url = await uploadToFirebase(file, path);
      setFormData((prev) => ({ ...prev, [fieldName]: url }));
      toast.success("File uploaded successfully", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file", { id: toastId });
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/mutations/register-logistics-account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address:
              formData.accountType === "business"
                ? formData.businessAddress
                : formData.personalAddress,
            businessName:
              formData.accountType === "business" ? formData.businessName : "",
            fullname: formData.fullName || formData.businessName,
            nationalIdOrPassport: formData.nationalIdOrPassport,
            license: formData.license,
            business_cert: formData.business_cert,
            proof_address: formData.proof_address,
            num_of_cars: formData.fleetSize,
            type: formData.accountType,
            status: "pending",
          }),
        }
      );

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
            {/* Desktop Hero Image */}
            <div className="relative mb-12 hidden h-[240px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl md:block">
              <Image
                src="/images/cars/hero.png"
                alt="Car Partnership"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h1 className="text-4xl font-black tracking-tight !text-white text-white">
                  Become a Car Partner
                </h1>
                <p className="text-lg font-black !text-white/80 text-white/80">
                  List your vehicles and start earning
                </p>
              </div>
            </div>

            <p className="mb-8 hidden text-xl font-black leading-relaxed text-gray-500 md:block">
              Choose how you want to list your vehicles on our platform.
            </p>

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
                } ${currentStep === 1 ? "md:bg-inherit" : ""}`}
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
                {formData.accountType === "personal" && (
                  <div className="absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-black">Personal</h3>
                <p className="text-sm font-normal text-gray-500">
                  For individual owners or small-scale providers listing their
                  own cars.
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
                {formData.accountType === "business" && (
                  <div className="absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-black">Business</h3>
                <p className="text-sm font-normal text-gray-500">
                  For registered rental companies and professional fleet
                  managers.
                </p>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-2 text-3xl font-black tracking-tight">
              {formData.accountType === "business"
                ? "Business Details"
                : "Personal Details"}
            </h2>
            <p className="mb-8 text-gray-500">
              {formData.accountType === "business"
                ? "Tell us about your rental business."
                : "Tell us about yourself."}
            </p>
            <div className="space-y-6">
              {formData.accountType === "business" ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elite Car Rentals"
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
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RDB-123456"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.business_cert}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          business_cert: e.target.value,
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
                      placeholder="e.g. John Doe"
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
                      placeholder="Enter ID number"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.nationalIdOrPassport}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nationalIdOrPassport: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Driver's License Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter license number"
                      className={`w-full rounded-2xl border p-4 text-lg font-normal outline-none transition-all focus:ring-2 focus:ring-green-500/50 ${
                        theme === "dark"
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                      value={formData.license}
                      onChange={(e) =>
                        setFormData({ ...formData, license: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-widest text-gray-400">
                      Home Address
                    </label>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) =>
                          (autocompleteRef.current = autocomplete)
                        }
                        onPlaceChanged={onPlaceChanged}
                      >
                        <input
                          type="text"
                          placeholder="Search home address..."
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
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Kimironko, Kigali"
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
            <h2 className="mb-2 text-3xl font-black tracking-tight">
              Fleet Information
            </h2>
            <p className="mb-8 text-gray-500">
              How many cars do you plan to list?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {["1-5", "6-15", "16-50", "50+"].map((range) => (
                <button
                  key={range}
                  onClick={() => setFormData({ ...formData, fleetSize: range })}
                  className={`flex items-center justify-center rounded-3xl border p-8 text-xl font-black transition-all ${
                    formData.fleetSize === range
                      ? "border-green-500 bg-green-500 text-white shadow-xl shadow-green-500/20"
                      : theme === "dark"
                      ? "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
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
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-2 text-3xl font-black tracking-tight">
              Documents
            </h2>
            <p className="mb-8 text-gray-500">
              Upload your documents for verification.
            </p>
            <div className="space-y-4">
              {(formData.accountType === "business"
                ? [
                    { label: "Business License", field: "business_cert" },
                    { label: "Trading Permit", field: "proof_address" },
                    {
                      label: "Owner ID / Passport",
                      field: "nationalIdOrPassport",
                    },
                  ]
                : [
                    {
                      label: "National ID / Passport",
                      field: "nationalIdOrPassport",
                    },
                    { label: "Driver's License", field: "license" },
                    {
                      label: "Proof of Address (from irembo.com)",
                      field: "proof_address",
                    },
                  ]
              ).map((doc) => (
                <div
                  key={doc.label}
                  className={`flex items-center justify-between rounded-3xl border p-6 ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        formData[doc.field as keyof typeof formData]
                          ? "bg-green-500 text-white"
                          : "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {formData[doc.field as keyof typeof formData] ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <FileText className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black">{doc.label}</h4>
                      <p
                        className={`text-xs font-black uppercase tracking-widest ${
                          formData[doc.field as keyof typeof formData]
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      >
                        {formData[doc.field as keyof typeof formData]
                          ? "Uploaded"
                          : "Required"}
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer rounded-xl bg-green-500/10 px-4 py-2 text-sm font-black text-green-500 hover:bg-green-500/20">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, doc.field);
                      }}
                      accept="image/*,.pdf"
                    />
                    {formData[doc.field as keyof typeof formData]
                      ? "Replace"
                      : "Upload"}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500 text-white shadow-2xl shadow-green-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-3xl font-black tracking-tight">
              Review & Submit
            </h2>
            <p className="mb-8 text-gray-500">
              Almost there! Review your details before submitting.
            </p>
            <div
              className={`space-y-4 rounded-3xl p-6 ${
                theme === "dark" ? "bg-white/5" : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between border-b border-gray-200/10 pb-4">
                <span className="text-xs font-normal uppercase text-gray-500">
                  Account
                </span>
                <span className="font-normal capitalize">
                  {formData.accountType}
                </span>
              </div>
              {formData.accountType === "business" ? (
                <>
                  <div className="flex justify-between border-b border-gray-200/10 pb-4">
                    <span className="text-xs font-normal uppercase text-gray-500">
                      Business
                    </span>
                    <span className="font-normal">
                      {formData.businessName || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/10 pb-4">
                    <span className="text-xs font-normal uppercase text-gray-500">
                      Address
                    </span>
                    <span className="font-normal">
                      {formData.businessAddress || "Not provided"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-gray-200/10 pb-4">
                    <span className="text-xs font-normal uppercase text-gray-500">
                      Name
                    </span>
                    <span className="font-normal">
                      {formData.fullName || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/10 pb-4">
                    <span className="text-xs font-normal uppercase text-gray-500">
                      Address
                    </span>
                    <span className="font-normal">
                      {formData.personalAddress || "Not provided"}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-xs font-normal uppercase text-gray-500">
                  Fleet Size
                </span>
                <span className="font-normal">
                  {formData.fleetSize || "Not provided"}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isChecking) {
    return <LoadingScreen showProgressBar={false} />;
  }

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
      {/* Mobile Background Image for Step 1 */}
      {currentStep === 1 && (
        <div className="fixed inset-0 z-0 overflow-hidden md:hidden">
          <Image
            src="/images/cars/hero.png"
            alt="Plas Drive"
            fill
            className="scale-110 object-cover opacity-40 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-32 pt-24">
        {/* Mobile Navigation Back */}
        <div className="absolute left-6 top-8 z-50 md:hidden">
          <button
            onClick={() => router.push("/Cars")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/10 text-white shadow-lg backdrop-blur-md"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>

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
        {/* Step Indicator */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-xl font-black !text-white text-white shadow-lg shadow-green-500/20">
            {currentStep}
          </div>
          <div className="flex flex-col">
            <span
              className={`text-xs font-black uppercase tracking-widest ${
                currentStep === 1 ? "text-white" : "text-green-500"
              }`}
            >
              Step {currentStep} of {STEPS.length}
            </span>
            <span
              className={`text-lg font-black ${
                currentStep === 1 ? "text-white" : ""
              }`}
            >
              {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">{renderStep()}</div>

        {/* Bottom Actions */}
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
                isLoading ? "pointer-events-none opacity-70" : ""
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
