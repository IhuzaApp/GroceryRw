"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import PersonalBusinessForm from "./PersonalBusinessForm";
import BusinessAccountForm from "./BusinessAccountForm";

interface CreateBusinessAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated?: () => void;
}

export default function CreateBusinessAccountModal({
  isOpen,
  onClose,
  onAccountCreated,
}: CreateBusinessAccountModalProps) {
  const [step, setStep] = useState<"description" | "personal" | "business">(
    "description"
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [accountType, setAccountType] = useState<
    "personal" | "business" | null
  >(null);
  const [personalFormSubmit, setPersonalFormSubmit] = useState<(() => void) | null>(null);
  const [businessFormSubmit, setBusinessFormSubmit] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAcceptTerms = () => {
    if (acceptedTerms) {
      setStep(accountType === "personal" ? "personal" : "business");
    }
  };

  const handleAccountTypeSelect = (type: "personal" | "business") => {
    setAccountType(type);
    setAcceptedTerms(false);
  };

  const handleBack = () => {
    if (step === "personal" || step === "business") {
      setStep("description");
      setAccountType(null);
      setAcceptedTerms(false);
    }
  };

  const handleAccountCreated = () => {
    if (onAccountCreated) {
      onAccountCreated();
    }
    // Reset modal state
    setStep("description");
    setAcceptedTerms(false);
    setAccountType(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black bg-opacity-50 sm:items-center sm:p-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="relative flex h-[95vh] max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-800 sm:h-[90vh] sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:rounded-2xl"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create PlasBusiness Account
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Get started with your business account
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {step === "description" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Description */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                    About PlasBusiness
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 sm:space-y-3 sm:text-base">
                    <p>
                      PlasBusiness is a comprehensive B2B marketplace platform
                      designed to connect businesses with suppliers, streamline
                      procurement processes, and manage business relationships
                      efficiently.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        Key Features:
                      </h4>
                      <ul className="ml-4 list-disc space-y-1 text-sm sm:ml-6 sm:text-base">
                        <li>Create and manage Request for Quotations (RFQs)</li>
                        <li>Connect with verified suppliers</li>
                        <li>Receive and compare quotes</li>
                        <li>Manage contracts and orders</li>
                        <li>Track business transactions</li>
                        <li>Secure business communications</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        Account Types:
                      </h4>
                      <ul className="ml-4 list-disc space-y-1 text-sm sm:ml-6 sm:text-base">
                        <li>
                          <strong>Personal:</strong> For individual
                          entrepreneurs and freelancers
                        </li>
                        <li>
                          <strong>Business:</strong> For registered businesses
                          and companies
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Account Type Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                    Select Account Type
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handleAccountTypeSelect("personal")}
                      className={`rounded-xl border-2 p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] sm:p-6 ${
                        accountType === "personal"
                          ? "border-green-500 bg-green-50 shadow-md dark:bg-green-900/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center">
                        {accountType === "personal" && (
                          <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        )}
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                          Personal Account
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For individual entrepreneurs and freelancers. Quick
                        verification process.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAccountTypeSelect("business")}
                      className={`rounded-xl border-2 p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] sm:p-6 ${
                        accountType === "business"
                          ? "border-green-500 bg-green-50 shadow-md dark:bg-green-900/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center">
                        {accountType === "business" && (
                          <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        )}
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                          Business Account
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For registered businesses. Requires business
                        documentation.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 sm:p-4">
                  <label className="flex cursor-pointer items-start space-x-2 sm:space-x-3">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 sm:mt-1 sm:h-5 sm:w-5"
                      disabled={!accountType}
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                      I accept the{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:underline dark:text-green-400"
                      >
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:underline dark:text-green-400"
                      >
                        Privacy Policy
                      </a>{" "}
                      of PlasBusiness
                    </span>
                  </label>
                </div>
              </div>
            )}

            {step === "personal" && (
              <PersonalBusinessForm
                onBack={handleBack}
                onSuccess={handleAccountCreated}
                onSubmitRef={setPersonalFormSubmit}
              />
            )}

            {step === "business" && (
              <BusinessAccountForm
                onBack={handleBack}
                onSuccess={handleAccountCreated}
                onSubmitRef={setBusinessFormSubmit}
              />
            )}
            </div>
          </div>

          {/* Footer - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            {step === "description" && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleAcceptTerms}
                  disabled={!acceptedTerms || !accountType}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  style={{ color: "#ffffff" }}
                >
                  <span style={{ color: "#ffffff" }}>Continue</span>
                </button>
              </div>
            )}
            {(step === "personal" || step === "business") && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-xl border-2 border-gray-300 bg-white px-6 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (step === "personal" && personalFormSubmit) {
                      setIsSubmitting(true);
                      try {
                        await personalFormSubmit();
                      } finally {
                        setIsSubmitting(false);
                      }
                    } else if (step === "business" && businessFormSubmit) {
                      setIsSubmitting(true);
                      try {
                        await businessFormSubmit();
                      } finally {
                        setIsSubmitting(false);
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ color: "#ffffff" }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span style={{ color: "#ffffff" }}>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" style={{ color: "#ffffff" }} />
                      <span style={{ color: "#ffffff" }}>Submit for Review</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
