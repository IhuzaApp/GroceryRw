import React, { useState } from "react";
import RootLayout from "@components/ui/layout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import ShopperRegistrationForm from "@components/shopper/ShopperRegistrationForm";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

// Mobile Component - Clean, minimal design
const MobileBecomeShopper = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Form - Full page, no card styling */}
      <div className="h-full">
        <MobileShopperRegistrationForm />
      </div>
    </div>
  );
};

// Mobile-specific form component with simplified navigation
const MobileShopperRegistrationForm = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { theme } = useTheme();
  const [formValue, setFormValue] = useState<Record<string, string>>({
    full_name: "",
    address: "",
    phone_number: "",
    national_id: "",
    transport_mode: "on_foot",
    driving_license: "",
    guarantor: "",
    guarantorPhone: "",
    guarantorRelationship: "",
    mutual_status: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const steps = [
    { title: "Personal Info", description: "Basic information" },
    { title: "Contact Details", description: "Phone & Telegram" },
    { title: "Address & Location", description: "Residence details" },
    { title: "Guarantor Info", description: "Reference person" },
    { title: "Documents", description: "Required documents" },
    { title: "Review & Submit", description: "Final review" },
  ];

  // Simple validation function
  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.replace('_', ' ')} is required`;
    }
    return "";
  };

  // Next step function
  const nextStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Personal Info
        ["full_name", "national_id", "transport_mode"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
      case 1: // Contact Details
        ["phone_number"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
      case 2: // Address
        ["address"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
      case 3: // Guarantor
        ["guarantor", "guarantorPhone", "guarantorRelationship"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step function
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    // Add your submission logic here
    setTimeout(() => {
      setLoading(false);
      router.push('/Plasa');
    }, 2000);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formValue.full_name}
                onChange={(e) => setFormValue({...formValue, full_name: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                National ID *
              </label>
              <input
                type="text"
                value={formValue.national_id}
                onChange={(e) => setFormValue({...formValue, national_id: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your national ID"
              />
              {errors.national_id && <p className="text-red-500 text-sm mt-1">{errors.national_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transport Mode *
              </label>
              <select
                value={formValue.transport_mode}
                onChange={(e) => setFormValue({...formValue, transport_mode: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="on_foot">On Foot</option>
                <option value="bicycle">Bicycle</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="car">Car</option>
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formValue.phone_number}
                onChange={(e) => setFormValue({...formValue, phone_number: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your phone number"
              />
              {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <textarea
                value={formValue.address}
                onChange={(e) => setFormValue({...formValue, address: e.target.value})}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guarantor Name *
              </label>
              <input
                type="text"
                value={formValue.guarantor}
                onChange={(e) => setFormValue({...formValue, guarantor: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter guarantor's full name"
              />
              {errors.guarantor && <p className="text-red-500 text-sm mt-1">{errors.guarantor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Guarantor Phone *
              </label>
              <input
                type="tel"
                value={formValue.guarantorPhone}
                onChange={(e) => setFormValue({...formValue, guarantorPhone: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter guarantor's phone number"
              />
              {errors.guarantorPhone && <p className="text-red-500 text-sm mt-1">{errors.guarantorPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Relationship *
              </label>
              <select
                value={formValue.guarantorRelationship}
                onChange={(e) => setFormValue({...formValue, guarantorRelationship: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select relationship</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="other">Other</option>
              </select>
              {errors.guarantorRelationship && <p className="text-red-500 text-sm mt-1">{errors.guarantorRelationship}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Document upload functionality will be implemented here.
                For now, you can proceed to the next step.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Review Your Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {formValue.full_name}</p>
                <p><span className="font-medium">Phone:</span> {formValue.phone_number}</p>
                <p><span className="font-medium">Address:</span> {formValue.address}</p>
                <p><span className="font-medium">Transport:</span> {formValue.transport_mode}</p>
                <p><span className="font-medium">Guarantor:</span> {formValue.guarantor}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`p-2 rounded-lg transition-colors ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {currentStep + 1} of {steps.length}
            </p>
          </div>
          
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="flex-1 px-4 py-6">
        {renderStepContent()}
      </div>

      {/* Mobile Footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={Object.keys(errors).length > 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              Object.keys(errors).length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
};

// Desktop Component - Original design
const DesktopBecomeShopper = () => {
  const { theme } = useTheme();

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="ml-16 p-4">
        <div className="mx-auto max-w-6xl">
          {/* Desktop Header */}
            <div className="mb-8 text-center">
              <div
                className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full ${
                  theme === "dark"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-green-100 text-green-600"
                }`}
              >
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1
                className={`mb-4 text-4xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Become a Plasa
              </h1>
              <p
                className={`mx-auto max-w-2xl text-lg ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Join our community of delivery partners and start earning money
                by delivering orders to customers in your area.
              </p>
            </div>

          {/* Desktop Benefits Section */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div
                className={`rounded-xl border p-6 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800/50"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                    theme === "dark" ? "bg-green-600/20" : "bg-green-100"
                  }`}
                >
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3
                  className={`mb-2 font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Earn Money
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Get paid for each delivery you complete. The more you deliver,
                  the more you earn.
                </p>
              </div>

              <div
                className={`rounded-xl border p-6 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800/50"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                    theme === "dark" ? "bg-green-600/20" : "bg-green-100"
                  }`}
                >
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3
                  className={`mb-2 font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Flexible Schedule
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Work when you want. Choose your own hours and accept
                  deliveries that fit your schedule.
                </p>
              </div>

              <div
                className={`rounded-xl border p-6 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800/50"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                    theme === "dark" ? "bg-purple-600/20" : "bg-purple-100"
                  }`}
                >
                  <svg
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3
                  className={`mb-2 font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Easy Application
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Simple step-by-step application process. Get approved quickly
                  and start delivering.
                </p>
              </div>
            </div>

          {/* Desktop Registration Form */}
            <div
              className={`rounded-2xl border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-white shadow-lg"
              }`}
            >
              <ShopperRegistrationForm />
            </div>
          </div>
        </div>
    </div>
  );
};

export default function BecomeShopperPage() {
  return (
    <RootLayout>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileBecomeShopper />
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <DesktopBecomeShopper />
      </div>
    </RootLayout>
  );
}

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} };

  // Original authentication code (disabled for testing)
  // const session = await getServerSession(
  //   context.req,
  //   context.res,
  //   authOptions as any
  // );
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: "/Auth/Login?callbackUrl=/Myprofile/become-shopper",
  //       permanent: false,
  //     },
  //   };
  // }
  // return { props: {} };
};
