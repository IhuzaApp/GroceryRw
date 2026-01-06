"use client";

import { useState, useEffect } from "react";
import { Briefcase, CreditCard, ArrowRight, Package, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CreateBusinessAccountModal from "./CreateBusinessAccountModal";
import { ServicesSection } from "./ServicesSection";
import { RFQOpportunitiesSection } from "./RFQOpportunitiesSection";

interface PlasBusinessExplorerProps {
  onAccountCreated?: () => void;
}

export default function PlasBusinessExplorer({
  onAccountCreated,
}: PlasBusinessExplorerProps) {
  const { user, isLoggedIn } = useAuth();
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"services" | "rfqs">("services");

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

  // If user has an account, don't show explorer
  if (hasAccount) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen  from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 md:ml-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section with Two Cards */}
          <div className="mb-8">
            <div className="mb-6 text-center">
              <h1 className="mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-green-400 dark:to-emerald-400 sm:text-4xl md:text-5xl">
                Welcome to PlasBusiness
              </h1>
              <p className="text-base font-medium text-gray-600 dark:text-gray-300 sm:text-lg">
                Explore our platform or get started with an account
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              {/* Create Business Account Card */}
              <div
                onClick={() => setIsModalOpen(true)}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-5"
              >
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-green-900/10 dark:to-emerald-900/10"></div>

                {/* Decorative Elements */}
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-green-100/20 to-emerald-100/20 blur-2xl dark:from-green-800/10 dark:to-emerald-800/10"></div>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-md shadow-green-500/30 transition-all duration-300 group-hover:rotate-3 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-green-500/50"
                    style={{ color: "#ffffff" }}
                  >
                    <Briefcase
                      className="h-6 w-6"
                      style={{ color: "#ffffff" }}
                    />
                  </div>

                  {/* Content */}
                  <h2 className="mb-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400">
                    Create Business Account
                  </h2>
                  <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Start your business journey with PlasBusiness. Create RFQs,
                    find suppliers, manage contracts, and grow your business.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-3 transition-colors duration-300 group-hover:border-green-200 dark:border-gray-700 dark:group-hover:border-green-800">
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-sm font-semibold text-transparent dark:from-green-400 dark:to-emerald-400">
                    Get Started
                  </span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm shadow-green-500/30 transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-md group-hover:shadow-green-500/50"
                    style={{ color: "#ffffff" }}
                  >
                    <ArrowRight
                      className="h-4 w-4"
                      style={{ color: "#ffffff" }}
                    />
                  </div>
                </div>
              </div>

              {/* POS System Card */}
              <div className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-5">
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-900/10 dark:to-indigo-900/10"></div>

                {/* Decorative Elements */}
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20 blur-2xl dark:from-blue-800/10 dark:to-indigo-800/10"></div>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:rotate-3 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                    <CreditCard className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h2 className="mb-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    Get POS System
                  </h2>
                  <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Streamline your point of sale operations with our integrated
                    POS system. Manage transactions, inventory, and sales
                    effortlessly.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-3 transition-colors duration-300 group-hover:border-blue-200 dark:border-gray-700 dark:group-hover:border-blue-800">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-sm font-semibold text-transparent dark:from-blue-400 dark:to-indigo-400">
                    Learn More
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/30 transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-md group-hover:shadow-blue-500/50">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base ${
                    activeTab === "services"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  }`}
                  style={
                    activeTab === "services" ? { color: "#ffffff" } : undefined
                  }
                >
                  <Package
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    style={
                      activeTab === "services"
                        ? { color: "#ffffff" }
                        : undefined
                    }
                  />
                  <span>Services</span>
                </button>
                <button
                  onClick={() => setActiveTab("rfqs")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base ${
                    activeTab === "rfqs"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  }`}
                  style={
                    activeTab === "rfqs" ? { color: "#ffffff" } : undefined
                  }
                >
                  <FileText
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    style={
                      activeTab === "rfqs" ? { color: "#ffffff" } : undefined
                    }
                  />
                  <span>RFQ Opportunities</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {activeTab === "services" && (
              <div className="p-6">
                <ServicesSection
                  onRequestQuotation={(serviceId) => {
                    // Show message to create account first
                    setIsModalOpen(true);
                  }}
                />
              </div>
            )}
            {activeTab === "rfqs" && (
              <div className="p-6">
                <RFQOpportunitiesSection
                  onMessageCustomer={(customerId) => {
                    // Show message to create account first
                    setIsModalOpen(true);
                  }}
                />
              </div>
            )}
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

