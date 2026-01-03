"use client";

import {
  Package,
  FileText,
  ShoppingCart,
  Truck,
  BarChart3,
  Briefcase,
  Search,
  DollarSign,
  MessageSquare,
  Star,
  Store,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "../../src/components/ui/layout";
import { useAuth } from "../../src/context/AuthContext";
import { isMobileDevice } from "../../src/lib/formatters";
import QuoteDetailsModal from "./quote-details-modal";
import { BusinessHeader } from "../../src/components/business/BusinessHeader";
import { StatsCards } from "../../src/components/business/StatsCards";
import { MyRFQsSection } from "../../src/components/business/MyRFQsSection";
import { QuotesSection } from "../../src/components/business/QuotesSection";
import { OrdersSection } from "../../src/components/business/OrdersSection";
import { ContractsSection } from "../../src/components/business/ContractsSection";
import { ProductsBidsSection } from "../../src/components/business/ProductsBidsSection";
import { RFQOpportunitiesSection } from "../../src/components/business/RFQOpportunitiesSection";
import { CreateRFQForm } from "../../src/components/business/CreateRFQForm";
import { ContractsManagement } from "../../src/components/business/ContractsManagement";
import PlasBusinessOnboarding from "../../src/components/business/PlasBusinessOnboarding";
import { BusinessOverview } from "../../src/components/business/BusinessOverview";
import { ServicesSection } from "../../src/components/business/ServicesSection";
import { StoresSection } from "../../src/components/business/StoresSection";
import BusinessChatDrawer from "../../src/components/business/BusinessChatDrawer";
import { MobilePlasBusinessPage } from "../../src/components/business/mobile/MobilePlasBusinessPage";
import toast from "react-hot-toast";

// Data moved to individual components

export default function PlasBusinessPage() {
  const { role, isLoggedIn, authReady } = useAuth();
  const router = useRouter();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [hasBusinessAccount, setHasBusinessAccount] = useState<boolean | null>(
    null
  );
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [businessAccount, setBusinessAccount] = useState<any>(null);
  const [rfqCreated, setRfqCreated] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Redirect shoppers away from this page
  useEffect(() => {
    if (authReady && isLoggedIn && role === "shopper") {
      router.push("/Plasa");
    }
  }, [role, isLoggedIn, authReady, router]);

  // Check if user has business account
  useEffect(() => {
    if (authReady && isLoggedIn && role !== "shopper") {
      checkBusinessAccount();
    }
  }, [authReady, isLoggedIn, role]);

  const checkBusinessAccount = async () => {
    try {
      const response = await fetch("/api/queries/check-business-account");
      if (response.ok) {
        const data = await response.json();
        setHasBusinessAccount(data.hasAccount);
        setBusinessAccount(data.account);
      } else {
        setHasBusinessAccount(false);
        setBusinessAccount(null);
      }
    } catch (error) {
      setHasBusinessAccount(false);
      setBusinessAccount(null);
    } finally {
      setCheckingAccount(false);
    }
  };

  const handleAccountCreated = () => {
    setHasBusinessAccount(true);
    // Re-fetch account details after creation to get the business name
    checkBusinessAccount();
  };

  // Show loading while auth is being determined
  if (!authReady || checkingAccount) {
    return (
      <RootLayout>
        <div className="min-h-screen via-white to-gray-100 dark:from-gray-900 md:ml-16">
          <div className="max-w-8xl container mx-auto space-y-8 p-6">
            {/* Header Skeleton */}
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-64 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-96 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mb-2 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"
                  ></div>
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="animate-pulse space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-3">
                <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Don't render for shoppers
  if (isLoggedIn && role === "shopper") {
    return null;
  }

  // On mobile, show mobile components (accessible to everyone, with or without account)
  if (isMobile) {
    return (
      <RootLayout>
        <MobilePlasBusinessPage />
      </RootLayout>
    );
  }

  // Desktop view - show onboarding if user doesn't have business account
  if (!hasBusinessAccount) {
    return (
      <RootLayout>
        <PlasBusinessOnboarding onAccountCreated={handleAccountCreated} />
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen via-white to-gray-100 dark:from-gray-900 md:ml-16">
        <div className="max-w-8xl container mx-auto">
          <BuyerDashboardContent
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            isQuoteModalOpen={isQuoteModalOpen}
            setIsQuoteModalOpen={setIsQuoteModalOpen}
            isCreateRFQOpen={isCreateRFQOpen}
            setIsCreateRFQOpen={setIsCreateRFQOpen}
            router={router}
            businessAccount={businessAccount}
            rfqCreated={rfqCreated}
            setRfqCreated={setRfqCreated}
            isChatDrawerOpen={isChatDrawerOpen}
            setIsChatDrawerOpen={setIsChatDrawerOpen}
          />
        </div>
      </div>
    </RootLayout>
  );
}

function BuyerDashboardContent({
  selectedQuote,
  setSelectedQuote,
  isQuoteModalOpen,
  setIsQuoteModalOpen,
  isCreateRFQOpen,
  setIsCreateRFQOpen,
  router,
  businessAccount,
  rfqCreated,
  setRfqCreated,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
}: {
  selectedQuote: any;
  setSelectedQuote: (quote: any) => void;
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  isCreateRFQOpen: boolean;
  setIsCreateRFQOpen: (open: boolean) => void;
  router: any;
  businessAccount?: any;
  rfqCreated: boolean;
  setRfqCreated: (value: boolean | ((prev: boolean) => boolean)) => void;
  isChatDrawerOpen: boolean;
  setIsChatDrawerOpen: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const isPersonalAccount = businessAccount?.accountType === "personal";
  const isBusinessAccount = businessAccount?.accountType === "business";
  // Service provider status should come from user data/API
  // For now, only business accounts can be service providers
  const [isServiceProvider, setIsServiceProvider] = useState(isBusinessAccount);

  useEffect(() => {
    // Only business accounts can be service providers
    setIsServiceProvider(isBusinessAccount);
  }, [isBusinessAccount]);

  const handleViewQuoteDetails = (quote: any) => {
    setSelectedQuote(quote);
    setIsQuoteModalOpen(true);
  };

  const handleAcceptQuote = (quoteId: string) => {
    setIsQuoteModalOpen(false);
  };

  const handleRejectQuote = (quoteId: string) => {
    setIsQuoteModalOpen(false);
  };

  const handleMessageQuoteSupplier = (supplierId: string) => {
    router.push(`/plasBusiness/BusinessChats?supplier=${supplierId}`);
  };

  const handleMessageContractSupplier = (supplierId: string) => {
    router.push(`/plasBusiness/BusinessChats?supplier=${supplierId}`);
  };

  const handleCreateRFQ = () => {
    setIsCreateRFQOpen(true);
  };

  const handleRFQSubmit = async (rfqData: any) => {
    // Trigger refresh of RFQs list
    setRfqCreated((prev: boolean) => !prev);
  };

  const handleAssignContract = (contractData: any) => {
    // Here you would typically send the contract data to your API
  };

  const handleViewContract = (contractId: string) => {
    // Handle view contract logic
  };

  const handleEditContract = (contractId: string) => {
    // Handle edit contract logic
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BusinessHeader
        onCreateRFQ={handleCreateRFQ}
        onBusinessChat={() => setIsChatDrawerOpen(true)}
        businessName={businessAccount?.businessName}
      />

      {/* Stats Cards - Hidden on mobile */}
      <div className="hidden md:block">
        <StatsCards />
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-2">
          <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory space-x-1.5 overflow-x-auto scroll-smooth px-1 pb-1 sm:mx-0 sm:space-x-2 sm:px-0 sm:pb-0">
            {[
              // Service Provider tabs (only visible for business accounts that are service providers)
              ...(isServiceProvider && isBusinessAccount
                ? [
                    {
                      id: "overview",
                      label: "Overview",
                      shortLabel: "Overview",
                      icon: BarChart3,
                    },
                    {
                      id: "products-bids",
                      label: "Services/Bids",
                      shortLabel: "Services",
                      icon: Briefcase,
                    },
                    {
                      id: "rfq-opportunities",
                      label: "RFQ Opportunities",
                      shortLabel: "RFQ",
                      icon: Search,
                    },
                    {
                      id: "orders",
                      label: "Orders",
                      shortLabel: "Orders",
                      icon: Truck,
                    },
                    {
                      id: "stores",
                      label: "Stores",
                      shortLabel: "Stores",
                      icon: Store,
                    },
                  ]
                : []),
              // Personal account tabs (only for personal accounts)
              ...(isPersonalAccount
                ? [
                    {
                      id: "overview",
                      label: "Overview",
                      shortLabel: "Overview",
                      icon: BarChart3,
                    },
                    {
                      id: "services",
                      label: "Services",
                      shortLabel: "Services",
                      icon: Package,
                    },
                    {
                      id: "stores",
                      label: "Stores",
                      shortLabel: "Stores",
                      icon: Store,
                    },
                  ]
                : []),
              // Regular buyer tabs (for all account types)
              {
                id: "rfqs",
                label: "My RFQs",
                shortLabel: "RFQs",
                icon: FileText,
              },
              {
                id: "quotes",
                label: "Quotes",
                shortLabel: "Quotes",
                icon: ShoppingCart,
              },
              {
                id: "contracts",
                label: "Contracts",
                shortLabel: "Contracts",
                icon: FileText,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`flex min-w-fit flex-shrink-0 touch-manipulation snap-start items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 ${
                  activeTab === tab.id
                    ? "scale-105 transform bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                }`}
                style={activeTab === tab.id ? { color: "#ffffff" } : undefined}
              >
                <tab.icon
                  className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4"
                  style={
                    activeTab === tab.id ? { color: "#ffffff" } : undefined
                  }
                />
                <span
                  className="hidden sm:inline"
                  style={
                    activeTab === tab.id ? { color: "#ffffff" } : undefined
                  }
                >
                  {tab.label}
                </span>
                <span
                  className="sm:hidden"
                  style={
                    activeTab === tab.id ? { color: "#ffffff" } : undefined
                  }
                >
                  {tab.shortLabel || tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Service Provider Tabs (Business Accounts Only) */}
        {isServiceProvider && isBusinessAccount && activeTab === "overview" && (
          <BusinessOverview businessAccount={businessAccount} />
        )}

        {isServiceProvider &&
          isBusinessAccount &&
          activeTab === "products-bids" && <ProductsBidsSection />}

        {isServiceProvider &&
          isBusinessAccount &&
          activeTab === "rfq-opportunities" && (
            <RFQOpportunitiesSection
              onMessageCustomer={handleMessageQuoteSupplier}
            />
          )}

        {isServiceProvider && isBusinessAccount && activeTab === "stores" && (
          <StoresSection businessAccount={businessAccount} />
        )}

        {/* Personal Account Tabs */}
        {isPersonalAccount && activeTab === "overview" && (
          <BusinessOverview businessAccount={businessAccount} />
        )}

        {isPersonalAccount && activeTab === "services" && (
          <ServicesSection
            onRequestQuotation={(serviceId) => {
              toast.success(
                "Quotation request sent! The service provider will contact you soon."
              );
            }}
          />
        )}

        {isPersonalAccount && activeTab === "stores" && (
          <StoresSection businessAccount={businessAccount} />
        )}

        {/* Regular Buyer Tabs */}
        {activeTab === "rfqs" && (
          <MyRFQsSection
            onCreateRFQ={handleCreateRFQ}
            onAssignContract={handleAssignContract}
            onMessageSupplier={handleMessageQuoteSupplier}
            onRFQCreated={rfqCreated}
          />
        )}

        {activeTab === "quotes" && (
          <QuotesSection onViewQuoteDetails={handleViewQuoteDetails} />
        )}

        {activeTab === "orders" && <OrdersSection />}

        {activeTab === "contracts" && (
          <ContractsManagement
            onViewContract={handleViewContract}
            onEditContract={handleEditContract}
            onMessageSupplier={handleMessageContractSupplier}
          />
        )}
      </div>

      <QuoteDetailsModal
        quote={selectedQuote}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onAccept={handleAcceptQuote}
        onReject={handleRejectQuote}
        onMessage={handleMessageQuoteSupplier}
      />

      <CreateRFQForm
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
        onSubmit={handleRFQSubmit}
      />

      {/* Business Chat Drawer */}
      <BusinessChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
      />
    </div>
  );
}
