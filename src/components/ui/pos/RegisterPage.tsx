"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  X, Loader2, CheckCircle, Store, Utensils, Building2, 
  User, Phone, Mail, MapPin, CreditCard, ShieldCheck,
  ChevronRight, ChevronLeft, Camera, Layout, FileText,
  Globe, Clock, Lock, Briefcase, Trash2, UploadCloud
} from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Autocomplete } from "@react-google-maps/api";
import { storage } from "../../../lib/firebase";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import { CREATE_RESTAURANT_ACCOUNT, CREATE_SHOP_ACCOUNT } from "../../../graphql/mutations/posRegistration";
import { usePlans, Plan } from "../../../hooks/usePlans";
import AboutTopBar from "../landing/AboutTopBar";
import AboutHeader from "../landing/AboutHeader";
import AboutFooter from "../landing/AboutFooter";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const cycle = searchParams.get("billingCycle") || "monthly";
  const { isLoaded } = useGoogleMap();
  
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<"RESTAURANT" | "SHOP">("RESTAURANT");
  const { plans, isLoading: plansLoading } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (plans.length > 0 && planId) {
      const plan = plans.find(p => p.id === planId);
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
    gender: "Male",
    dob: "1990-01-01",
    position: "Manager",
  });

  const [uploading, setUploading] = useState({ logo: false, profile: false, rdb_cert: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [momoNumber, setMomoNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [paymentReference, setPaymentReference] = useState("");

  const [createRestaurant] = useMutation(CREATE_RESTAURANT_ACCOUNT);
  const [createShop] = useMutation(CREATE_SHOP_ACCOUNT);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const address = place.formatted_address || "";

      setFormData(prev => ({
        ...prev,
        address,
        lat: lat?.toString() || prev.lat,
        long: lng?.toString() || prev.long,
      }));
    }
  };

  const sanitizeName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "unnamed-business";
  };

  const handleFileUpload = async (file: File | null, type: "logo" | "profile" | "rdb_cert") => {
    if (!file) {
      setFormData(prev => ({ ...prev, [type === "rdb_cert" ? "rdb_cert_url" : type]: "" }));
      return;
    }
    if (!storage) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    
    const businessSlug = sanitizeName(formData.name);
    const storageRef = ref(storage, `business/${businessSlug}/${type}_${Date.now()}_${file.name}`);
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
      setFormData(prev => ({ ...prev, [type === "rdb_cert" ? "rdb_cert_url" : type]: downloadURL }));
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        if (!formData.rdb_cert_url && !formData.rdb_cert) return "Please upload or provide your RDB Certificate.";
        return null;
      case 3:
        if (!formData.logo) return "Business Logo is required.";
        if (!formData.profile) return "Profile / Cover Image is required.";
        return null;
      case 4:
        if (!formData.address) return "Physical Address is required.";
        if (!formData.lat || !formData.long) return "Location coordinates are required. Please select an address from the suggestions.";
        return null;
      case 5:
        if (!formData.fullnames) return "Admin Full Name is required.";
        if (!formData.ownerEmail) return "Personal Email is required.";
        if (!formData.ownerPhone) return "Personal Phone is required.";
        if (!formData.password) return "Security Password is required.";
        if (formData.password.length < 6) return "Password must be at least 6 characters.";
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
    setStep(s => s + 1);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const performMutation = async () => {
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
            request_count: selectedPlan.ai_request_limit,
            month: new Date().toLocaleString('default', { month: 'long' }),
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
            plan_id: selectedPlan.id,
            aiUsage_id: commonIds.aiUsage_id,
            currency: "RWF",
            discount_amount: "0",
            due_date: dueDate.toISOString(),
            invoice_number: `INV-${Date.now()}`,
            issued_at: now,
            paid_at: null,
            payment_method: "UNPAID",
            plan_name: selectedPlan.name,
            plan_price: (cycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly).toString(),
            reelUsage_id: commonIds.reelUsage_id,
            shopSubscription_id: commonIds.shopSubscription_id,
            status1: "pending",
            subtotal_amount: (cycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly).toString(),
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
            roleType: "admin",
            shop_id3: "00000000-0000-0000-0000-000000000000",
            twoFactorSecrets: "",
            business_id1: businessId,
            shop_id4: "00000000-0000-0000-0000-000000000000",
            restaurant_id4: businessId,
            month1: new Date().toLocaleString('default', { month: 'long' }),
            upload_count: selectedPlan.reel_limit,
            year1: new Date().getFullYear().toString(),
          }
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
            upload_count: selectedPlan.reel_limit,
            year: new Date().getFullYear().toString(),
            billing_cycle: billingCycle,
            business_id: businessId,
            end_date: endDate.toISOString(),
            plan_id: selectedPlan.id,
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
            plan_name: selectedPlan.name,
            plan_price: (cycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly).toString(),
            reelUsage_id: commonIds.reelUsage_id,
            shopSubscription_id: commonIds.shopSubscription_id,
            status1: "pending",
            subtotal_amount: (cycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly).toString(),
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
            roleType: "admin",
            shop_id3: businessId,
            twoFactorSecrets: "",
            orgEmployeeID: commonIds.orgEmployeeID,
            privillages: { all: true },
            update_on: now,
          }
        });
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          amount: (cycle === "monthly" ? selectedPlan?.price_monthly : selectedPlan?.price_yearly),
          payerNumber: momoNumber,
          externalId: `POS-REG-${Date.now()}`,
          payerMessage: `POS Registration - ${selectedPlan?.name}`,
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
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      step >= s.id ? "border-[#022C22] bg-[#022C22] text-white" : "border-gray-200 bg-white text-gray-400"
                    }`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-bold ${step >= s.id ? "text-[#022C22]" : "text-gray-400"}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-[2px] flex-1 translate-y-[-12px] transition-all ${
                      step > s.id ? "bg-[#022C22]" : "bg-gray-200"
                    }`} />
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
                      onClick={() => setStep(s => s - 1)}
                      className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-8 font-bold text-gray-600 transition-all hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous Step
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={step === 6 ? handleCompleteSetup : handleNextStep}
                    disabled={isSubmitting || (step === 3 && (uploading.logo || uploading.profile))}
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
                  <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
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
          onClose={() => !paymentStatus.includes('pending') && setShowPaymentModal(false)}
          method={paymentMethod}
          setMethod={setPaymentMethod}
          momoNumber={momoNumber}
          setMomoNumber={setMomoNumber}
          onPay={handleMomoPayment}
          status={paymentStatus}
          plan={selectedPlan}
          price={cycle === "monthly" ? selectedPlan?.price_monthly : selectedPlan?.price_yearly}
        />
      )}
    </div>
  );
}

function PaymentModal({ isOpen, onClose, method, setMethod, momoNumber, setMomoNumber, onPay, status, plan, price }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#022C22]/10 text-[#022C22]">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">Complete Payment</h3>
            <p className="mt-2 text-gray-500">Securely finalize your {plan?.name} subscription</p>
          </div>

          <div className="mb-8 flex items-center justify-between rounded-2xl bg-gray-50 p-6">
            <div className="font-bold text-gray-600">Initial Total</div>
            <div className="text-2xl font-bold text-[#022C22]">
              {price?.toLocaleString()} <span className="text-sm opacity-60">RWF</span>
            </div>
          </div>

          {/* Method Selection */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => setMethod("momo")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                method === "momo" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-100 bg-white"
              }`}
            >
              <div className="font-bold text-black">MTN MoMo</div>
              <div className="text-[10px] uppercase tracking-widest text-black/50">Mobile Money</div>
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                method === "card" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-100 bg-white"
              }`}
            >
              <div className="font-bold text-black">Credit Card</div>
              <div className="text-[10px] uppercase tracking-widest text-black/50">Visa / Master</div>
            </button>
          </div>

          {method === "momo" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">MoMo Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white text-lg font-medium"
                    placeholder="078..."
                  />
                </div>
              </div>

              <button
                onClick={onPay}
                disabled={status === "pending" || status === "success"}
                className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#022C22] font-bold text-white transition-all hover:bg-[#00c596] disabled:opacity-70"
              >
                {status === "pending" ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : status === "success" ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <span>Success!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Pay & Finish Setup</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400">
                You will receive a prompt on your phone to approve the transaction.
              </p>
            </div>
          ) : (
            <div className="space-y-6 rounded-3xl border-2 border-dashed border-gray-100 p-8 text-center bg-gray-50/50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-gray-700">Card Payments coming soon</h4>
              <p className="text-sm text-gray-500">
                We are currently integrating with local card processors. Please use MTN MoMo for now.
              </p>
              
              <div className="flex justify-center gap-3 opacity-30 grayscale">
                <div className="h-8 w-12 bg-gray-300 rounded" />
                <div className="h-8 w-12 bg-gray-300 rounded" />
                <div className="h-8 w-12 bg-gray-300 rounded" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner structure
function Step1Selection({ type, setType, plan, cycle }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Select Business Category</h2>
        <p className="mt-3 text-lg text-gray-500">How should we categorize your enterprise on the platform?</p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          onClick={() => setType("RESTAURANT")}
          className={`flex flex-col items-center gap-6 rounded-[2rem] border-4 p-10 transition-all ${
            type === "RESTAURANT" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
          }`}
        >
          <div className="rounded-2xl bg-[#022C22]/10 p-5 text-[#022C22]">
            <Utensils className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Restaurant</h3>
            <p className="mt-2 text-sm text-gray-500">For food services, cafes, and dining establishments.</p>
          </div>
        </button>

        <button
          onClick={() => setType("SHOP")}
          className={`flex flex-col items-center gap-6 rounded-[2rem] border-4 p-10 transition-all ${
            type === "SHOP" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
          }`}
        >
          <div className="rounded-2xl bg-[#022C22]/10 p-5 text-[#022C22]">
            <Store className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Shop / Store</h3>
            <p className="mt-2 text-sm text-gray-500">For retail, boutiques, markets, and pharmacies.</p>
          </div>
        </button>
      </div>

      {plan && (
        <div className="rounded-2xl bg-[#022C22] p-8 text-white shadow-xl shadow-[#022C22]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#00A67E]">Selected Plan</p>
              <h4 className="mt-1 text-2xl font-bold">{plan.name}</h4>
              <p className="mt-1 text-emerald-400 font-medium">Billed {cycle}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {(cycle === "monthly" ? plan.price_monthly : plan.price_yearly).toLocaleString()}
              </span>
              <span className="ml-2 font-bold opacity-70">RWF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2Identity({ formData, onChange, handleUpload, uploading }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Business Identity</h2>
        <p className="mt-2 text-gray-500">Let&apos;s get the core details of your business.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Legal Business Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="name"
              value={formData.name}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="e.g. Plas Technologies Ltd"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">TIN Number</label>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="tin"
              value={formData.tin}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="123456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Business USSD / SSD Code</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              name="ussd"
              value={formData.ussd}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="e.g. *123#"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Business Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="078..."
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-600">RDB Certificate Attachment</label>
          <div className="relative">
            {formData.rdb_cert_url ? (
              <div className="flex h-14 items-center justify-between rounded-xl border-2 border-[#022C22]/20 bg-[#022C22]/5 px-4 text-[#022C22]">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle className="h-5 w-5" />
                  Certificate Uploaded
                </div>
                <button
                  onClick={() => handleUpload(null, 'rdb_cert')}
                  className="text-sm font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 text-gray-400 transition-all hover:border-[#022C22]/30 hover:bg-[#022C22]/5 hover:text-[#022C22]">
                {uploading.rdb_cert ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-5 w-5" />
                    <span className="font-bold">Upload RDB Certificate (PDF/Image)</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => e.target.files && handleUpload(e.target.files[0], 'rdb_cert')}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-600">Business Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="contact@business.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Branding({ formData, handleUpload, uploading }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Visual Branding</h2>
        <p className="mt-2 text-gray-500">Upload high-quality images to represent your business.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="text-lg font-bold text-gray-700">Business Logo</label>
          <div className="relative aspect-square w-full">
            {formData.logo ? (
              <div className="group relative h-full w-full overflow-hidden rounded-[2rem]">
                <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                <button
                  onClick={() => handleUpload(null, 'logo')}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-10 w-10 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-4 border-dashed border-gray-100 bg-gray-50 transition-all hover:border-[#022C22]/30 hover:bg-[#022C22]/5">
                {uploading.logo ? (
                  <Loader2 className="h-12 w-12 animate-spin text-[#022C22]" />
                ) : (
                  <>
                    <Camera className="h-16 w-16 text-gray-300" />
                    <span className="mt-4 font-bold text-gray-400">Click to upload logo</span>
                    <span className="mt-1 text-xs text-gray-300">PNG, JPG, SVG up to 5MB</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => e.target.files && handleUpload(e.target.files[0], 'logo')}
                />
              </label>
            )}
          </div>
        </div>

        {/* Profile Image */}
        <div className="space-y-4">
          <label className="text-lg font-bold text-gray-700">Cover / Profile Image</label>
          <div className="relative aspect-square w-full">
            {formData.profile ? (
              <div className="group relative h-full w-full overflow-hidden rounded-[2rem]">
                <Image src={formData.profile} alt="Profile" fill className="object-cover" />
                <button
                  onClick={() => handleUpload(null, 'profile')}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-10 w-10 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-4 border-dashed border-gray-100 bg-gray-50 transition-all hover:border-[#022C22]/30 hover:bg-[#022C22]/5">
                {uploading.profile ? (
                  <Loader2 className="h-12 w-12 animate-spin text-[#022C22]" />
                ) : (
                  <>
                    <Layout className="h-16 w-16 text-gray-300" />
                    <span className="mt-4 font-bold text-gray-400">Main profile photo</span>
                    <span className="mt-1 text-xs text-gray-300">Exterior or interior shot</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => e.target.files && handleUpload(e.target.files[0], 'profile')}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Location({ formData, onChange, isLoaded, autocompleteRef, onPlaceChanged }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Operational Details</h2>
        <p className="mt-2 text-gray-500">Set where you are located and when you serve customers.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Physical Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10" />
            {isLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={onChange}
                  className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                  placeholder="Start typing your address..."
                />
              </Autocomplete>
            ) : (
              <input
                required
                name="address"
                value={formData.address}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="e.g. KN 78 St, Kigali, Rwanda"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Latitude</label>
            <input
              name="lat"
              value={formData.lat}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Longitude</label>
            <input
              name="long"
              value={formData.long}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Business Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={4}
            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            placeholder="Tell us about your business specialty..."
          />
        </div>
      </div>
    </div>
  );
}

function Step5Admin({ formData, onChange }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Admin Account Setup</h2>
        <p className="mt-2 text-gray-500">The primary user who will manage the business POS.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Admin Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="fullnames"
              value={formData.fullnames}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Admin Position</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              name="position"
              value={formData.position}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            >
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
              <option value="Owner">Owner</option>
              <option value="Operator">Operator</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Personal Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="johndoe@personal.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Personal Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="078..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step6Review({ formData, type, plan, cycle }: any) {
  const SummaryItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-6 transition-all hover:bg-emerald-50/50">
      <div className="rounded-xl bg-white p-3 shadow-sm text-[#022C22]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-lg font-bold text-[#1A1A1A]">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Final Review</h2>
        <p className="mt-2 text-gray-500">Please confirm all information is accurate before finalizing.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SummaryItem label="Business Name" value={formData.name} icon={Building2} />
        <SummaryItem label="Business Type" value={type} icon={type === "RESTAURANT" ? Utensils : Store} />
        <SummaryItem label="TIN / SSD" value={`${formData.tin} / ${formData.ussd}`} icon={ShieldCheck} />
        <SummaryItem label="Location" value={formData.address} icon={MapPin} />
        <SummaryItem label="Admin User" value={formData.fullnames} icon={User} />
        <SummaryItem label="Subscription" value={`${plan?.name} (${cycle})`} icon={CreditCard} />
      </div>

      <div className="rounded-2xl border-2 border-[#022C22]/10 bg-emerald-50/30 p-8">
        <div className="flex items-center gap-4">
          <Info className="h-6 w-6 text-[#022C22]" />
          <p className="text-sm font-medium text-gray-600">
            By clicking confirm, you agree to setup {formData.name} on the Plas ecosystem. An invoice for the first billing period will be generated automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
      <div className="relative mb-10 h-32 w-32">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75"></div>
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl">
          <CheckCircle className="h-20 w-20" />
        </div>
      </div>
      <h2 className="text-4xl font-extrabold text-[#1A1A1A]">Business Created!</h2>
      <p className="mx-auto mt-6 max-w-sm text-lg text-gray-500">
        Congratulations! Your account is ready. Redirecting you to your POS dashboard...
      </p>
    </div>
  );
}

function Info(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
