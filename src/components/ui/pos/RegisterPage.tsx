"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Loader2,
  CheckCircle,
  Store,
  Utensils,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Camera,
  Layout,
  FileText,
  Globe,
  Clock,
  Lock,
  Briefcase,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Autocomplete } from "@react-google-maps/api";
import { storage } from "../../../lib/firebase";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import {
  CREATE_RESTAURANT_ACCOUNT,
  CREATE_SHOP_ACCOUNT,
} from "../../../graphql/mutations/posRegistration";
import { usePlans, Plan } from "../../../hooks/usePlans";
import { MODULE_DESCRIPTIONS } from "../../../types/moduleDescriptions";
import { UserPrivileges, DEFAULT_PRIVILEGES } from "../../../types/privileges";
import AboutTopBar from "../landing/AboutTopBar";
import AboutHeader from "../landing/AboutHeader";
import AboutFooter from "../landing/AboutFooter";
import {
  Step1Selection,
  Step2Identity,
  Step3Branding,
  Step4Location,
  Step5Admin,
  Step6Review,
  PaymentModal,
  SuccessState,
} from "./registration";


const generatePrivileges = (plan: Plan): UserPrivileges => {
  // Use DEFAULT_PRIVILEGES as base so all modules are present with default false
  const privileges: UserPrivileges = JSON.parse(JSON.stringify(DEFAULT_PRIVILEGES));
  
  // Explicitly ensure pages access is true as it's the core navigation
  if (privileges.pages) {
    privileges.pages.access = true;
    privileges.pages.view_pages = false;
  }

  plan.modules.forEach((module) => {
    const slug = module.slug;
    const description = (MODULE_DESCRIPTIONS as any)[slug];

    if (description) {
      // Grant full access to all actions in this module
      const modulePrivs: Record<string, boolean> = { access: true };
      description.actions.forEach((action: any) => {
        modulePrivs[action.key] = true;
      });
      (privileges as any)[slug] = modulePrivs;

      // Update pages module access flags
      if (privileges.pages) {
        const pageAccessKey = `access_${slug}`;
        (privileges.pages as any)[pageAccessKey] = true;
      }
    }
  });

  return privileges;
};


export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams?.get("planId");
  const cycle = searchParams?.get("billingCycle") || "monthly";
  const { isLoaded } = useGoogleMap();

  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<"RESTAURANT" | "SHOP">(
    "RESTAURANT"
  );
  const { plans, isLoading: plansLoading } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (plans.length > 0 && planId) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) setSelectedPlan(plan);
    }
  }, [plans, planId]);

  const [formData, setFormData] = useState({
    // Step 2: Identity
    name: "",
    tin: "",
    ussd: "",
    rdb_cert: "",
    rdb_cert_url: "",
    phone: "",
    email: "",
    // Step 3: Visuals
    logo: "",
    profile: "",
    // Step 4: Location
    address: "",
    lat: "-1.9441",
    long: "30.0619",
    description: "",
    operating_hours: {
      monday: "08:00 - 20:00",
      tuesday: "08:00 - 20:00",
      wednesday: "08:00 - 20:00",
      thursday: "08:00 - 20:00",
      friday: "08:00 - 20:00",
      saturday: "09:00 - 18:00",
      sunday: "Closed",
    },
    // Step 5: Admin
    fullnames: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
    dob: "1990-01-01",
    position: "Manager",
  });

  const [uploading, setUploading] = useState({
    logo: false,
    profile: false,
    rdb_cert: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [momoNumber, setMomoNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [paymentReference, setPaymentReference] = useState("");

  const [createRestaurant] = useMutation(CREATE_RESTAURANT_ACCOUNT);
  const [createShop] = useMutation(CREATE_SHOP_ACCOUNT);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const address = place.formatted_address || "";

      setFormData((prev) => ({
        ...prev,
        address,
        lat: lat?.toString() || prev.lat,
        long: lng?.toString() || prev.long,
      }));
    }
  };

  const sanitizeName = (name: string) => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "unnamed-business"
    );
  };

  const handleFileUpload = async (
    file: File | null,
    type: "logo" | "profile" | "rdb_cert"
  ) => {
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        [type === "rdb_cert" ? "rdb_cert_url" : type]: "",
      }));
      return;
    }
    if (!storage) return;
    setUploading((prev) => ({ ...prev, [type]: true }));

    const businessSlug = sanitizeName(formData.name);
    const storageRef = ref(
      storage,
      `business/${businessSlug}/${type}_${Date.now()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    try {
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          () => resolve(true)
        );
      });
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      setFormData((prev) => ({
        ...prev,
        [type === "rdb_cert" ? "rdb_cert_url" : type]: downloadURL,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!businessType) return "Please select a business category.";
        if (!selectedPlan) return "Please select a pricing plan.";
        return null;
      case 2:
        if (!formData.name) return "Legal Business Name is required.";
        if (!formData.tin) return "TIN Number is required.";
        if (!formData.phone) return "Business Phone is required.";
        if (!formData.email) return "Business Email is required.";
        if (!formData.rdb_cert_url && !formData.rdb_cert)
          return "Please upload or provide your RDB Certificate.";
        return null;
      case 3:
        if (!formData.logo) return "Business Logo is required.";
        if (!formData.profile) return "Profile / Cover Image is required.";
        return null;
      case 4:
        if (!formData.address) return "Physical Address is required.";
        if (!formData.lat || !formData.long)
          return "Location coordinates are required. Please select an address from the suggestions.";
        return null;
      case 5:
        if (!formData.fullnames) return "Admin Full Name is required.";
        if (!formData.ownerEmail) return "Personal Email is required.";
        if (!formData.ownerPhone) return "Personal Phone is required.";
        if (!formData.password) return "Security Password is required.";
        if (formData.password.length < 6)
          return "Password must be at least 6 characters.";
        if (formData.password !== formData.confirmPassword)
          return "Passwords do not match.";
        return null;
      default:
        return null;
    }
  };

  const handleNextStep = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const handleCompleteSetup = async () => {
    const validationError = validateStep(step); // Should be step 6, but validates all if needed
    if (validationError) {
      setError(validationError);
      return;
    }

    // Explicit final check for step 6 state
    if (!selectedPlan) {
      setError("Please select a valid pricing plan.");
      return;
    }
    setError(null);
    setShowPaymentModal(true);
    setMomoNumber(formData.phone);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const performMutation = async () => {
    if (!selectedPlan) {
      setError("No plan selected. Please go back and select a plan.");
      return;
    }

    const plan = selectedPlan;
    setIsSubmitting(true);
    setError(null);

    const now = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const endDate = new Date();
    if (cycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const businessId = crypto.randomUUID();
    const billingCycle = cycle;
    const commonIds = {
      aiUsage_id: crypto.randomUUID(),
      reelUsage_id: crypto.randomUUID(),
      shopSubscription_id: crypto.randomUUID(),
      employee_id: Math.floor(Math.random() * 1000000),
      orgEmployeeID: crypto.randomUUID(),
    };

    try {
      if (businessType === "RESTAURANT") {
        await createRestaurant({
          variables: {
            email: formData.email,
            lat: formData.lat,
            location: formData.address,
            logo: formData.logo,
            long: formData.long,
            name: formData.name,
            phone: formData.phone,
            profile: formData.profile,
            tin: formData.tin,
            ussd: formData.ussd,
            rdb_cert: formData.rdb_cert_url || formData.rdb_cert, // Use URL if uploaded, else text
            restaurant_id: businessId,
            request_count: plan.ai_request_limit,
            month: new Date().toLocaleString("default", { month: "long" }),
            year: new Date().getFullYear().toString(),
            shop_id: "00000000-0000-0000-0000-000000000000",
            balance: "0",
            restaurant_id1: businessId,
            shop_id1: "00000000-0000-0000-0000-000000000000",
            billing_cycle: billingCycle,
            restaurant_id2: businessId,
            shop_id2: "00000000-0000-0000-0000-000000000000",
            start_date: now,
            status: "active",
            updated_at: now,
            end_date: endDate.toISOString(),
            plan_id: plan.id,
            aiUsage_id: commonIds.aiUsage_id,
            currency: "RWF",
            discount_amount: "0",
            due_date: dueDate.toISOString(),
            invoice_number: `INV-${Date.now()}`,
            issued_at: now,
            paid_at: null,
            payment_method: "UNPAID",
            plan_name: plan.name,
            plan_price: (cycle === "monthly"
              ? plan.price_monthly
              : plan.price_yearly
            ).toString(),
            reelUsage_id: commonIds.reelUsage_id,
            shopSubscription_id: commonIds.shopSubscription_id,
            status1: "pending",
            subtotal_amount: (cycle === "monthly"
              ? plan.price_monthly
              : plan.price_yearly
            ).toString(),
            tax_amount: "0",
            Address: formData.address,
            Position: formData.position,
            dob: formData.dob,
            email1: formData.ownerEmail,
            employeeID: commonIds.employee_id,
            fullnames: formData.fullnames,
            gender: formData.gender,
            last_login: now,
            password: formData.password,
            phone1: formData.ownerPhone,
            restaurant_id3: businessId,
            roleType: "system Administrator",
            shop_id3: "00000000-0000-0000-0000-000000000000",
            twoFactorSecrets: "",
            business_id1: businessId,
            shop_id4: "00000000-0000-0000-0000-000000000000",
            restaurant_id4: businessId,
            month1: new Date().toLocaleString("default", { month: "long" }),
            upload_count: plan.reel_limit,
            year1: new Date().getFullYear().toString(),
            orgEmployeeID: commonIds.orgEmployeeID,
            privillages: generatePrivileges(plan),
            update_on: now,
          },
        });
      } else {
        await createShop({
          variables: {
            address: formData.address,
            category_id: "00000000-0000-0000-0000-000000000000",
            description: formData.description,
            image: formData.profile,
            latitude: formData.lat,
            logo: formData.logo,
            longitude: formData.long,
            name: formData.name,
            operating_hours: formData.operating_hours,
            phone: formData.phone,
            relatedTo: "NONE",
            ssd: formData.ussd,
            tin: formData.tin,
            shop_id: businessId,
            upload_count: plan.reel_limit,
            year: new Date().getFullYear().toString(),
            billing_cycle: billingCycle,
            business_id: businessId,
            end_date: endDate.toISOString(),
            plan_id: plan.id,
            shop_id1: businessId,
            restaurant_id: "00000000-0000-0000-0000-000000000000",
            start_date: now,
            status: "active",
            aiUsage_id: commonIds.aiUsage_id,
            currency: "RWF",
            discount_amount: "0",
            invoice_number: `INV-${Date.now()}`,
            due_date: dueDate.toISOString(),
            issued_at: now,
            paid_at: null,
            payment_method: "UNPAID",
            plan_name: plan.name,
            plan_price: (cycle === "monthly"
              ? plan.price_monthly
              : plan.price_yearly
            ).toString(),
            reelUsage_id: commonIds.reelUsage_id,
            shopSubscription_id: commonIds.shopSubscription_id,
            status1: "pending",
            subtotal_amount: (cycle === "monthly"
              ? plan.price_monthly
              : plan.price_yearly
            ).toString(),
            tax_amount: "0",
            balance: "0",
            shop_id2: businessId,
            restaurant_id1: "00000000-0000-0000-0000-000000000000",
            Address: formData.address,
            Position: formData.position,
            dob: formData.dob,
            email: formData.ownerEmail,
            employeeID: commonIds.employee_id,
            fullnames: formData.fullnames,
            gender: formData.gender,
            password: formData.password,
            phone1: formData.ownerPhone,
            restaurant_id2: "00000000-0000-0000-0000-000000000000",
            roleType: "system Administrator",
            shop_id3: businessId,
            twoFactorSecrets: "",
            orgEmployeeID: commonIds.orgEmployeeID,
            privillages: generatePrivileges(plan),
            update_on: now,
          },
        });
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Mutation error:", err);
      setError(err.message || "Something went wrong. Please check your data.");
      setIsSuccess(false);
      setShowPaymentModal(false); // Close if mutation fails so user can try again or see error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMomoPayment = async () => {
    if (!selectedPlan) {
      setError("No plan selected. Please go back and select a plan.");
      return;
    }
    const plan = selectedPlan;
    if (!momoNumber) {
      setError("Please enter a valid MoMo number.");
      return;
    }
    setPaymentStatus("pending");
    try {
      const response = await fetch("/api/momo/request-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:
            cycle === "monthly"
              ? plan.price_monthly
              : plan.price_yearly,
          payerNumber: momoNumber,
          externalId: `POS-REG-${Date.now()}`,
          payerMessage: `POS Registration - ${plan.name}`,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentReference(data.referenceId);
        // In a real app we'd poll here. For sandbox, we'll simulate success after a delay.
        setTimeout(async () => {
          setPaymentStatus("success");
          // TRIGGER DATABASE CREATION NOW
          await performMutation();
          setTimeout(() => {
            setShowPaymentModal(false);
          }, 2000);
        }, 3000);
      } else {
        setPaymentStatus("failed");
        setError(data.error || "MoMo payment request failed.");
      }
    } catch (err) {
      setPaymentStatus("failed");
      setError("An error occurred during payment.");
    }
  };

  const steps = [
    { id: 1, title: "Business Type", icon: Layout },
    { id: 2, title: "Identity", icon: FileText },
    { id: 3, title: "Branding", icon: Camera },
    { id: 4, title: "Location", icon: MapPin },
    { id: 5, title: "Admin", icon: ShieldCheck },
    { id: 6, title: "Review", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AboutTopBar />
      <AboutHeader activePage="pos" />

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Progress Navigator */}
          <div className="mb-12 hidden md:block">
            <div className="flex items-center justify-between">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        step >= s.id
                          ? "border-[#022C22] bg-[#022C22] text-white"
                          : "border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        step >= s.id ? "text-[#022C22]" : "text-gray-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 translate-y-[-12px] transition-all ${
                        step > s.id ? "bg-[#022C22]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl md:p-12">
            {isSuccess ? (
              <SuccessState />
            ) : (
              <div className="space-y-10">
                {/* Step Content */}
                {step === 1 && (
                  <Step1Selection
                    type={businessType}
                    setType={setBusinessType}
                    plan={selectedPlan}
                    cycle={cycle}
                  />
                )}

                {step === 2 && (
                  <Step2Identity
                    formData={formData}
                    onChange={handleInputChange}
                    handleUpload={handleFileUpload}
                    uploading={uploading}
                  />
                )}

                {step === 3 && (
                  <Step3Branding
                    formData={formData}
                    handleUpload={handleFileUpload}
                    uploading={uploading}
                  />
                )}

                {step === 4 && (
                  <Step4Location
                    formData={formData}
                    onChange={handleInputChange}
                    isLoaded={isLoaded}
                    autocompleteRef={autocompleteRef}
                    onPlaceChanged={onPlaceChanged}
                  />
                )}

                {step === 5 && (
                  <Step5Admin
                    formData={formData}
                    onChange={handleInputChange}
                  />
                )}

                {step === 6 && (
                  <Step6Review
                    formData={formData}
                    type={businessType}
                    plan={selectedPlan}
                    cycle={cycle}
                  />
                )}

                {/* Footer Actions */}
                <div className="mt-12 flex flex-col-reverse gap-4 border-t pt-10 md:flex-row md:justify-between">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-8 font-bold text-gray-600 transition-all hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous Step
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={step === 6 ? handleCompleteSetup : handleNextStep}
                    disabled={
                      isSubmitting ||
                      (step === 3 && (uploading.logo || uploading.profile))
                    }
                    className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-[#022C22] px-12 font-bold text-white shadow-lg transition-all hover:bg-[#00c596] active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Finishing...
                      </>
                    ) : (
                      <>
                        {step === 6 ? "Complete Setup" : "Continue"}
                        {step < 6 && <ChevronRight className="h-5 w-5" />}
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <AboutFooter />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() =>
            !paymentStatus.includes("pending") && setShowPaymentModal(false)
          }
          method={paymentMethod}
          setMethod={setPaymentMethod}
          momoNumber={momoNumber}
          setMomoNumber={setMomoNumber}
          onPay={handleMomoPayment}
          status={paymentStatus}
          plan={selectedPlan}
          price={
            cycle === "monthly"
              ? selectedPlan?.price_monthly
              : selectedPlan?.price_yearly
          }
        />
      )}
    </div>
  );
}
