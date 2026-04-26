"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Briefcase,
  Search,
  Truck,
  Store,
  FileText,
  ShoppingCart,
  RotateCcw,
  Package,
} from "lucide-react";
import { BusinessHeader } from "./BusinessHeader";
import { StatsCards } from "./StatsCards";
import { BusinessOverview } from "./BusinessOverview";
import { ProductsBidsSection } from "./ProductsBidsSection";
import { RFQOpportunitiesSection } from "./RFQOpportunitiesSection";
import { StoresSection } from "./StoresSection";
import { ServicesSection } from "./ServicesSection";
import { MyRFQsSection } from "./MyRFQsSection";
import { QuotesSection } from "./QuotesSection";
import { OrdersSection } from "./OrdersSection";
import { ContractsManagement } from "./ContractsManagement";
import { SecondHandManagement } from "./SecondHandManagement";
import toast from "react-hot-toast";
import { getOrCreateBusinessConversation } from "../../services/chatService";
import { useTheme } from "../../context/ThemeContext";

interface DesktopPortalProps {
  selectedQuote: any;
  setSelectedQuote: (quote: any) => void;
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  isCreateRFQOpen: boolean;
  setIsCreateRFQOpen: (open: boolean) => void;
  rfqCreated: boolean;
  setRfqCreated: (value: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedContractId: (id: string | null) => void;
  setIsContractDrawerOpen: (open: boolean) => void;
  router: any;
  businessAccount?: any;
}

export function DesktopPortal({
  selectedQuote,
  setSelectedQuote,
  isQuoteModalOpen,
  setIsQuoteModalOpen,
  isCreateRFQOpen,
  setIsCreateRFQOpen,
  businessAccount,
  rfqCreated,
  setRfqCreated,
  setSelectedContractId,
  setIsContractDrawerOpen,
  router,
}: DesktopPortalProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const isPersonalAccount = businessAccount?.accountType === "personal";
  const isBusinessAccount = businessAccount?.accountType === "business";
  const [isServiceProvider, setIsServiceProvider] = useState(isBusinessAccount);

  useEffect(() => {
    setIsServiceProvider(isBusinessAccount);
  }, [isBusinessAccount]);

  const handleViewQuoteDetails = (quote: any) => {
    setSelectedQuote(quote);
    setIsQuoteModalOpen(true);
  };

  const handleAcceptQuote = (quoteId: string) => {
    setIsQuoteModalOpen(false);
    toast.success("Quote accepted successfully!");
  };

  const handleRejectQuote = (quoteId: string) => {
    setIsQuoteModalOpen(false);
  };

  const handleMessageQuoteSupplier = async (
    supplierId: string,
    rfqId?: string,
    title?: string
  ) => {
    if (!businessAccount?.id) {
      toast.error("Please ensure your business account is fully set up");
      return;
    }

    try {
      const conversationId = await getOrCreateBusinessConversation(
        businessAccount.id,
        supplierId,
        rfqId,
        title
      );
      router.push(
        `/Messages?conversationId=${conversationId}&collection=business_conversations`
      );
    } catch (error) {
      console.error("Error starting business conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  const handleMessageContractSupplier = async (supplierId: string) => {
    if (!businessAccount?.id) {
      toast.error("Please ensure your business account is fully set up");
      return;
    }

    try {
      const conversationId = await getOrCreateBusinessConversation(
        businessAccount.id,
        supplierId
      );
      router.push(
        `/Messages?conversationId=${conversationId}&collection=business_conversations`
      );
    } catch (error) {
      console.error("Error starting business conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  const handleCreateRFQ = () => {
    setIsCreateRFQOpen(true);
  };

  const handleRFQSubmit = async (rfqData: any) => {
    setRfqCreated((prev: boolean) => !prev);
  };

  const handleAssignContract = (contractData: any) => {
    // Contract assignment logic
  };

  const handleViewContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsContractDrawerOpen(true);
  };

  const handleEditContract = (contractId: string) => {
    // Edit contract logic
  };

  const tabs = [
    ...(isServiceProvider && isBusinessAccount
      ? [
          { id: "overview", label: "Overview", shortLabel: "Overview", icon: BarChart3 },
          { id: "products-bids", label: "Services/Bids", shortLabel: "Services", icon: Briefcase },
          { id: "rfq-opportunities", label: "RFQ Opportunities", shortLabel: "RFQ", icon: Search },
          { id: "orders", label: "Orders", shortLabel: "Orders", icon: Truck },
          { id: "stores", label: "Stores", shortLabel: "Stores", icon: Store },
        ]
      : []),
    ...(isPersonalAccount
      ? [
          { id: "overview", label: "Overview", shortLabel: "Overview", icon: BarChart3 },
          { id: "services", label: "Services", shortLabel: "Services", icon: Package },
          { id: "stores", label: "Stores", shortLabel: "Stores", icon: Store },
        ]
      : []),
    { id: "rfqs", label: "My RFQs", shortLabel: "RFQs", icon: FileText },
    { id: "quotes", label: "Quotes", shortLabel: "Quotes", icon: ShoppingCart },
    { id: "contracts", label: "Contracts", shortLabel: "Contracts", icon: FileText },
    { id: "second-hand", label: "Second Hand", shortLabel: "Pre-owned", icon: RotateCcw },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <BusinessHeader
        onCreateRFQ={handleCreateRFQ}
        onBusinessChat={() => router.push("/Messages")}
        businessName={businessAccount?.businessName}
      />

      <div className="hidden md:block">
        <StatsCards />
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--bg-secondary)] bg-[var(--bg-primary)] p-2 shadow-xl backdrop-blur-md">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 scale-105"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-white" : ""}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {activeTab === "overview" && <BusinessOverview businessAccount={businessAccount} />}
          {activeTab === "products-bids" && isServiceProvider && <ProductsBidsSection businessAccount={businessAccount} />}
          {activeTab === "rfq-opportunities" && isServiceProvider && (
            <RFQOpportunitiesSection onMessageCustomer={handleMessageQuoteSupplier} businessAccount={businessAccount} />
          )}
          {activeTab === "stores" && <StoresSection businessAccount={businessAccount} />}
          {activeTab === "services" && isPersonalAccount && (
            <ServicesSection onRequestQuotation={() => toast.success("Quotation request sent!")} />
          )}
          {activeTab === "rfqs" && (
            <MyRFQsSection
              onCreateRFQ={handleCreateRFQ}
              onAssignContract={handleAssignContract}
              onMessageSupplier={handleMessageQuoteSupplier}
              onRFQCreated={rfqCreated}
            />
          )}
          {activeTab === "quotes" && <QuotesSection onViewQuoteDetails={handleViewQuoteDetails} />}
          {activeTab === "orders" && <OrdersSection />}
          {activeTab === "contracts" && (
            <ContractsManagement
              onViewContract={handleViewContract}
              onEditContract={handleEditContract}
              onMessageSupplier={handleMessageContractSupplier}
            />
          )}
          {activeTab === "second-hand" && (
            <SecondHandManagement businessAccount={businessAccount} theme={theme} />
          )}
        </div>
      </div>

    </div>
  );
}
