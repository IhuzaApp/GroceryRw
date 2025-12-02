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
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="relative flex h-[95vh] max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800 sm:h-[85vh] sm:max-h-[85vh] sm:rounded-2xl md:h-[90vh] md:max-h-[90vh]"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
            <h2 className="text-lg font-bold text-white sm:text-2xl">
              Create PlasBusiness Account
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                      onClick={() => handleAccountTypeSelect("personal")}
                      className={`rounded-lg border-2 p-4 text-left transition-all sm:rounded-xl sm:p-6 ${
                        accountType === "personal"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center">
                        {accountType === "personal" && (
                          <Check className="mr-2 h-4 w-4 flex-shrink-0 text-green-500 sm:h-5 sm:w-5" />
                        )}
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                          Personal Account
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        For individual entrepreneurs and freelancers. Quick
                        verification process.
                      </p>
                    </button>

                    <button
                      onClick={() => handleAccountTypeSelect("business")}
                      className={`rounded-lg border-2 p-4 text-left transition-all sm:rounded-xl sm:p-6 ${
                        accountType === "business"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="mb-2 flex items-center">
                        {accountType === "business" && (
                          <Check className="mr-2 h-4 w-4 flex-shrink-0 text-green-500 sm:h-5 sm:w-5" />
                        )}
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                          Business Account
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
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

                {/* Continue Button */}
                <div className="flex justify-end pt-2 sm:pt-0">
                  <button
                    onClick={handleAcceptTerms}
                    disabled={!acceptedTerms || !accountType}
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8 sm:py-3 sm:text-base"
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
