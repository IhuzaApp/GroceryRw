"use client";

import { useState, useEffect } from "react";
import { Briefcase, ArrowRight, Package, FileText, Search } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import CreateBusinessAccountModal from "../CreateBusinessAccountModal";
import { MobileServiceList } from "./MobileServiceList";
import { ExpandedSectionModal } from "./ExpandedSectionModal";

interface MobilePlasBusinessExplorerProps {
  onAccountCreated?: () => void;
}

export function MobilePlasBusinessExplorer({
  onAccountCreated,
}: MobilePlasBusinessExplorerProps) {
  const { user, isLoggedIn } = useAuth();
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"services" | "rfqs">("services");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loadingRFQs, setLoadingRFQs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      checkBusinessAccount();
    } else {
      setHasAccount(false);
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (activeTab === "rfqs" && !loadingRFQs) {
      fetchRFQs();
    }
  }, [activeTab]);

  const checkBusinessAccount = async () => {
    try {
      const response = await fetch("/api/queries/check-business-account");
      if (response.ok) {
        const data = await response.json();
        setHasAccount(data.hasAccount);
      } else {
        setHasAccount(false);
      }
    } catch (error) {
      console.error("Error checking business account:", error);
      setHasAccount(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchRFQs = async () => {
    try {
      setLoadingRFQs(true);
      const response = await fetch("/api/queries/rfq-opportunities");
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      } else {
        setRfqs([]);
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      setRfqs([]);
    } finally {
      setLoadingRFQs(false);
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
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has an account, don't show explorer
  if (hasAccount) {
    return null;
  }

  // Filter RFQs based on search term
  const filteredRFQs = rfqs.filter((rfq) => {
    const title = rfq.title || "";
    const description = rfq.description || "";
    const category = rfq.category || "";
    const location = rfq.location || "";

    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      title.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      category.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Fixed Search Bar at Top */}
        <div className="sticky top-0 z-20 flex-shrink-0 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4 py-3 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services, products, or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pl-4 pr-14 text-sm text-gray-900 placeholder-gray-500 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-offset-gray-800"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-2.5 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Create Business Account Card */}
        <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div
            onClick={() => setIsModalOpen(true)}
            className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-3 shadow-lg ring-2 ring-green-300/50 ring-offset-2 transition-all duration-300 hover:border-green-500 hover:shadow-xl hover:ring-green-400/70 active:scale-[0.98] dark:border-green-500 dark:from-green-900/20 dark:to-emerald-900/20 dark:ring-green-600/50"
            style={{
              animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            {/* Animated Highlight Shimmer Effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{
                transform: "translateX(-100%)",
                animation: "shimmer 3s ease-in-out infinite",
              }}
            ></div>

            {/* Pulsing Glow Ring */}
            <div
              className="absolute -inset-1 rounded-lg bg-gradient-to-r from-green-400/30 to-emerald-400/30 blur-sm"
              style={{
                animation:
                  "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            ></div>

            {/* Icon Container */}
            <div
              className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-md shadow-green-500/50 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/70"
              style={{
                color: "#ffffff",
              }}
            >
              <Briefcase className="h-5 w-5" style={{ color: "#ffffff" }} />
            </div>

            {/* Content */}
            <div className="relative z-10 min-w-0 flex-1">
              <h2 className="mb-0.5 text-sm font-bold text-gray-900 transition-colors duration-200 group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400">
                Create Business Account
              </h2>
              <p className="line-clamp-1 text-xs text-gray-600 dark:text-gray-300">
                Start your business journey with PlasBusiness
              </p>
            </div>

            {/* CTA Arrow with Pulse */}
            <div
              className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/50 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/70"
              style={{
                color: "#ffffff",
                animation: "arrow-pulse 1.5s ease-in-out infinite",
              }}
            >
              <ArrowRight
                className="h-3.5 w-3.5"
                style={{ color: "#ffffff" }}
              />
            </div>
          </div>
        </div>

        {/* Add CSS animations via style tag */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes pulse-ring {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4), 0 0 0 0 rgba(16, 185, 129, 0.4);
              }
              50% {
                box-shadow: 0 0 0 6px rgba(34, 197, 94, 0), 0 0 0 10px rgba(16, 185, 129, 0);
              }
            }

            @keyframes pulse-glow {
              0%, 100% {
                opacity: 0.3;
                transform: scale(1);
              }
              50% {
                opacity: 0.6;
                transform: scale(1.05);
              }
            }

            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(200%);
              }
            }

            @keyframes arrow-pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.15);
              }
            }
          `,
          }}
        />

        {/* Tabs Section */}
        <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("services")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === "services"
                  ? "scale-105 transform bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-600"
              }`}
              style={
                activeTab === "services" ? { color: "#ffffff" } : undefined
              }
            >
              <Package
                className="h-4 w-4"
                style={
                  activeTab === "services" ? { color: "#ffffff" } : undefined
                }
              />
              <span>Services</span>
            </button>
            <button
              onClick={() => setActiveTab("rfqs")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === "rfqs"
                  ? "scale-105 transform bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-600"
              }`}
              style={activeTab === "rfqs" ? { color: "#ffffff" } : undefined}
            >
              <FileText
                className="h-4 w-4"
                style={activeTab === "rfqs" ? { color: "#ffffff" } : undefined}
              />
              <span>RFQ Opportunities</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {activeTab === "services" && (
            <MobileServiceList
              onServiceClick={(serviceId) => {
                // Show message to create account first
                setIsModalOpen(true);
              }}
              hasBusinessAccount={false}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === "rfqs" && (
            <div className="px-4 py-4">
              {loadingRFQs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                </div>
              ) : filteredRFQs.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="mb-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
                    No RFQ opportunities found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Check back later for new opportunities
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRFQs.map((rfq) => {
                    const minBudget = rfq.min_budget
                      ? parseFloat(rfq.min_budget)
                      : 0;
                    const maxBudget = rfq.max_budget
                      ? parseFloat(rfq.max_budget)
                      : 0;
                    const budgetDisplay =
                      minBudget > 0 && maxBudget > 0
                        ? `$${minBudget.toLocaleString()} - $${maxBudget.toLocaleString()}`
                        : minBudget > 0
                        ? `$${minBudget.toLocaleString()}+`
                        : maxBudget > 0
                        ? `Up to $${maxBudget.toLocaleString()}`
                        : "Budget not specified";

                    return (
                      <div
                        key={rfq.id}
                        onClick={() => {
                          setSelectedRFQ(rfq);
                          setExpandedSection("rfq-opportunities");
                        }}
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                            {rfq.title || "Untitled RFQ"}
                          </h3>
                          <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {rfq.category || "General"}
                          </span>
                        </div>
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {rfq.description || "No description available"}
                        </p>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {rfq.location && (
                              <span className="flex items-center gap-1">
                                <span>📍</span>
                                {rfq.location}
                              </span>
                            )}
                            {rfq.response_date && (
                              <span className="flex items-center gap-1">
                                <span>📅</span>
                                {new Date(
                                  rfq.response_date
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            <span>💰</span>
                            {budgetDisplay}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Section Modal for RFQ Details */}
      {expandedSection === "rfq-opportunities" && (
        <ExpandedSectionModal
          sectionId="rfq-opportunities"
          onClose={() => {
            setExpandedSection(null);
            setSelectedRFQ(null);
          }}
          data={{
            rfqs: rfqs,
            "rfq-opportunities": rfqs,
          }}
          loading={loadingRFQs}
          businessAccount={null}
          router={null as any}
          initialSelectedItem={selectedRFQ}
          onMessageCustomer={() => {
            setIsModalOpen(true);
          }}
          onSubmitQuote={() => {
            setIsModalOpen(true);
          }}
        />
      )}

      <CreateBusinessAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </>
  );
}
