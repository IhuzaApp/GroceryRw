"use client";

import { useState, useEffect } from "react";
import { Briefcase, CreditCard, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CreateBusinessAccountModal from "./CreateBusinessAccountModal";

interface PlasBusinessOnboardingProps {
  onAccountCreated?: () => void;
}

export default function PlasBusinessOnboarding({
  onAccountCreated,
}: PlasBusinessOnboardingProps) {
  const { user, isLoggedIn } = useAuth();
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      checkBusinessAccount();
    }
  }, [isLoggedIn, user]);

  const checkBusinessAccount = async () => {
    try {
      const response = await fetch("/api/queries/check-business-account");
      if (response.ok) {
        const data = await response.json();
        setHasAccount(data.hasAccount);
      } else {
        console.error("Failed to check business account");
        setHasAccount(false);
      }
    } catch (error) {
      console.error("Error checking business account:", error);
      setHasAccount(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountCreated = () => {
    setHasAccount(true);
    setIsModalOpen(false);
    if (onAccountCreated) {
      onAccountCreated();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has an account, don't show onboarding
  if (hasAccount) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto flex h-screen w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-6">
          <div className="mb-4 text-center sm:mb-6">
            <h1 className="mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-2xl font-extrabold text-transparent dark:from-green-400 dark:to-emerald-400 sm:text-3xl md:text-4xl">
              Welcome to PlasBusiness
            </h1>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:text-base">
              Choose how you want to get started
            </p>
          </div>

          <div
            className="grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            {/* Create Business Account Card */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="group relative flex h-full max-h-[50vh] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:p-6 md:p-7"
            >
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-green-900/10 dark:to-emerald-900/10"></div>

              {/* Decorative Elements */}
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-green-100/20 to-emerald-100/20 blur-3xl dark:from-green-800/10 dark:to-emerald-800/10"></div>

              <div className="relative z-10">
                {/* Icon Container */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/50 sm:h-16 sm:w-16 md:h-20 md:w-20">
                  <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                </div>

                {/* Content */}
                <h2 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400 sm:text-2xl md:text-2xl">
                  Create Business Account
                </h2>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                  Start your business journey with PlasBusiness. Create RFQs,
                  find suppliers, manage contracts, and grow your business.
                </p>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-4 transition-colors duration-300 group-hover:border-green-200 dark:border-gray-700 dark:group-hover:border-green-800">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-sm font-semibold text-transparent dark:from-green-400 dark:to-emerald-400 sm:text-base">
                  Get Started
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30 transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-lg group-hover:shadow-green-500/50 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>

            {/* POS System Card */}
            <div className="group relative flex h-full max-h-[50vh] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:p-6 md:p-7">
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-900/10 dark:to-indigo-900/10"></div>

              {/* Decorative Elements */}
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20 blur-3xl dark:from-blue-800/10 dark:to-indigo-800/10"></div>

              <div className="relative z-10">
                {/* Icon Container */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/50 sm:h-16 sm:w-16 md:h-20 md:w-20">
                  <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                </div>

                {/* Content */}
                <h2 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-2xl md:text-2xl">
                  Get POS System
                </h2>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                  Streamline your point of sale operations with our integrated
                  POS system. Manage transactions, inventory, and sales
                  effortlessly.
                </p>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-4 transition-colors duration-300 group-hover:border-blue-200 dark:border-gray-700 dark:group-hover:border-blue-800">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-sm font-semibold text-transparent dark:from-blue-400 dark:to-indigo-400 sm:text-base">
                  Learn More
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-lg group-hover:shadow-blue-500/50 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateBusinessAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </>
  );
}
