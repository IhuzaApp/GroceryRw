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
  const [accountType, setAccountType] = useState<"personal" | "business" | null>(
    null
  );

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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="relative w-full max-w-5xl h-[95vh] sm:h-[85vh] md:h-[90vh] max-h-[95vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-hidden rounded-lg sm:rounded-2xl bg-white shadow-2xl dark:bg-gray-800 flex flex-col" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              Create PlasBusiness Account
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {step === "description" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Description */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    About PlasBusiness
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <p>
                      PlasBusiness is a comprehensive B2B marketplace platform
                      designed to connect businesses with suppliers, streamline
                      procurement processes, and manage business relationships
                      efficiently.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Key Features:
                      </h4>
                      <ul className="ml-4 sm:ml-6 list-disc space-y-1 text-sm sm:text-base">
                        <li>Create and manage Request for Quotations (RFQs)</li>
                        <li>Connect with verified suppliers</li>
                        <li>Receive and compare quotes</li>
                        <li>Manage contracts and orders</li>
                        <li>Track business transactions</li>
                        <li>Secure business communications</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Account Types:
                      </h4>
                      <ul className="ml-4 sm:ml-6 list-disc space-y-1 text-sm sm:text-base">
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
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Select Account Type
                  </h3>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                    <button
                      onClick={() => handleAccountTypeSelect("personal")}
                      className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 text-left transition-all ${
                        accountType === "personal"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center">
                        {accountType === "personal" && (
                          <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        )}
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Personal Account
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        For individual entrepreneurs and freelancers. Quick
                        verification process.
                      </p>
                    </button>

                    <button
                      onClick={() => handleAccountTypeSelect("business")}
                      className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 text-left transition-all ${
                        accountType === "business"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center">
                        {accountType === "business" && (
                          <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        )}
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Business Account
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        For registered businesses. Requires business
                        documentation.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-900">
                  <label className="flex cursor-pointer items-start space-x-2 sm:space-x-3">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 sm:mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                      disabled={!accountType}
                    />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
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

                {/* Continue Button */}
                <div className="flex justify-end pt-2 sm:pt-0">
                  <button
                    onClick={handleAcceptTerms}
                    disabled={!acceptedTerms || !accountType}
                    className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === "personal" && (
              <PersonalBusinessForm
                onBack={handleBack}
                onSuccess={handleAccountCreated}
              />
            )}

            {step === "business" && (
              <BusinessAccountForm
                onBack={handleBack}
                onSuccess={handleAccountCreated}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

