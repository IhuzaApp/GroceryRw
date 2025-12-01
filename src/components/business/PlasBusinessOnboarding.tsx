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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to PlasBusiness
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose how you want to get started
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Create Business Account Card */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="group cursor-pointer rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-green-500 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white transition-transform duration-300 group-hover:scale-110">
                <Briefcase className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Create Business Account
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Start your business journey with PlasBusiness. Create RFQs, find
                suppliers, manage contracts, and grow your business.
              </p>
              <div className="flex items-center text-green-600 transition-transform duration-300 group-hover:translate-x-2">
                <span className="font-semibold">Get Started</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>

            {/* POS System Card */}
            <div className="group cursor-pointer rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-blue-500 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white transition-transform duration-300 group-hover:scale-110">
                <CreditCard className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Get POS System
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Streamline your point of sale operations with our integrated POS
                system. Manage transactions, inventory, and sales effortlessly.
              </p>
              <div className="flex items-center text-blue-600 transition-transform duration-300 group-hover:translate-x-2">
                <span className="font-semibold">Learn More</span>
                <ArrowRight className="ml-2 h-5 w-5" />
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

