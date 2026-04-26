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
  RotateCcw,
  PlusCircle,
  History
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "../../../src/components/ui/layout";
import { useAuth } from "../../../src/context/AuthContext";
import QuoteDetailsModal from "../quote-details-modal";
import { BusinessHeader } from "../../../src/components/business/BusinessHeader";
import { StatsCards } from "../../../src/components/business/StatsCards";
import { MyRFQsSection } from "../../../src/components/business/MyRFQsSection";
import { QuotesSection } from "../../../src/components/business/QuotesSection";
import { OrdersSection } from "../../../src/components/business/OrdersSection";
import { ContractsSection } from "../../../src/components/business/ContractsSection";
import { ProductsBidsSection } from "../../../src/components/business/ProductsBidsSection";
import { RFQOpportunitiesSection } from "../../../src/components/business/RFQOpportunitiesSection";
import { CreateRFQForm } from "../../../src/components/business/CreateRFQForm";
import { ContractsManagement } from "../../../src/components/business/ContractsManagement";
import PlasBusinessGuestView from "../../../src/components/business/PlasBusinessGuestView";
import { BusinessOverview } from "../../../src/components/business/BusinessOverview";
import { ServicesSection } from "../../../src/components/business/ServicesSection";
import { StoresSection } from "../../../src/components/business/StoresSection";
import { PortalSkeleton } from "../../../src/components/business/PortalSkeleton";
import { ContractDetailDrawer } from "../../../src/components/business/ContractDetailDrawer";
import toast from "react-hot-toast";
import { getOrCreateBusinessConversation } from "../../../src/services/chatService";
import { useTheme } from "../../../src/context/ThemeContext";

// Data moved to individual components

export default function PlasBusinessPage() {
  const { role, isLoggedIn, authReady } = useAuth();
  const { theme } = useTheme();
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
  if (!authReady || (isLoggedIn && checkingAccount)) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-[var(--bg-primary)] md:ml-16">
          <div className="max-w-8xl container mx-auto">
            <PortalSkeleton />
          </div>
        </div>
      </RootLayout>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    router.replace("/Auth/Login");
    return null;
  }

  // Don't render for shoppers
  if (role === "shopper") {
    return null;
  }

  // Show guest view if user doesn't have business account
  if (!hasBusinessAccount) {
    return (
      <RootLayout>
        <PlasBusinessGuestView onAccountCreated={handleAccountCreated} />
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-[var(--bg-primary)] md:ml-16">
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
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [isContractDrawerOpen, setIsContractDrawerOpen] = useState(false);
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
    // Trigger refresh of RFQs list
    setRfqCreated((prev: boolean) => !prev);
  };

  const handleAssignContract = (contractData: any) => {
    // Here you would typically send the contract data to your API
  };

  const handleViewContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsContractDrawerOpen(true);
  };

  const handleEditContract = (contractId: string) => {
    // Handle edit contract logic
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BusinessHeader
        onCreateRFQ={handleCreateRFQ}
        onBusinessChat={() => router.push("/Messages")}
        businessName={businessAccount?.businessName}
      />

      {/* Stats Cards - Hidden on mobile */}
      <div className="hidden md:block">
        <StatsCards />
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="rounded-xl border border-[var(--bg-secondary)] bg-[var(--bg-primary)] p-1.5 shadow-lg sm:rounded-2xl sm:p-2">
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
              {
                id: "second-hand",
                label: "Second Hand",
                shortLabel: "Pre-owned",
                icon: RotateCcw,
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
          activeTab === "products-bids" && (
            <ProductsBidsSection businessAccount={businessAccount} />
          )}

        {isServiceProvider &&
          isBusinessAccount &&
          activeTab === "rfq-opportunities" && (
            <RFQOpportunitiesSection
              onMessageCustomer={handleMessageQuoteSupplier}
              businessAccount={businessAccount}
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

        {activeTab === "second-hand" && (
          <SecondHandManagement 
            businessAccount={businessAccount} 
            theme={theme}
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
        businessAccount={businessAccount}
      />

      <ContractDetailDrawer
        isOpen={isContractDrawerOpen}
        onClose={() => {
          setIsContractDrawerOpen(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId}
        businessAccount={businessAccount}
      />
    </div>
  );
}

function SecondHandManagement({ businessAccount, theme }: any) {
  const [view, setView] = useState<'inventory' | 'orders'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);

  // Dummy Data
  const dummyItems = [
    { id: 1, name: "Office Desk", price: "45,000", status: "Active", stock: 2, image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=200" },
    { id: 2, name: "Dell Monitor 24\"", price: "85,000", status: "Sold", stock: 0, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200" },
    { id: 3, name: "Ergonomic Chair", price: "120,000", status: "Active", stock: 5, image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=200" },
  ];

  const dummyOrders = [
    { id: "SH-1024", customer: "John Baguma", item: "Office Desk", amount: "45,000", status: "Pending", date: "24 Oct 2026" },
    { id: "SH-1025", customer: "Sarah Keza", item: "Ergonomic Chair", amount: "240,000", status: "Delivered", date: "22 Oct 2026" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-outfit">Second Hand Items</h2>
          <p className="text-gray-500 font-medium">Manage your pre-owned assets and sales</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-black text-white shadow-xl shadow-green-500/20 hover:scale-105 transition-all"
        >
          <PlusCircle className="h-5 w-5" />
          List New Item
        </button>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-4 border-b border-gray-200/10 dark:border-white/5">
        <button 
          onClick={() => setView('inventory')}
          className={`pb-3 text-sm font-black uppercase tracking-widest transition-all ${view === 'inventory' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setView('orders')}
          className={`pb-3 text-sm font-black uppercase tracking-widest transition-all ${view === 'orders' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
        >
          Sales Orders
        </button>
      </div>

      {view === 'inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyItems.map(item => (
            <div key={item.id} className={`rounded-[2rem] border p-4 transition-all hover:shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5 relative">
                <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {item.status}
                </div>
              </div>
              <h4 className={`text-lg font-black font-outfit mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
              <p className="text-green-500 font-black text-sm mb-4">RWF {item.price}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/10 dark:border-white/5">
                <span className="text-[10px] font-black text-gray-400 uppercase">Stock: {item.stock}</span>
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-green-500 transition-colors"><FileText className="h-4 w-4" /></button>
                  <button className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-red-500 transition-colors"><PlusCircle className="h-4 w-4 rotate-45" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {dummyOrders.map(order => (
            <div key={order.id} className={`flex items-center justify-between rounded-[2rem] border p-6 transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h4 className={`font-black font-outfit text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.item}</h4>
                  <p className="text-xs font-medium text-gray-500">Ordered by {order.customer} • {order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-green-500 mb-1">RWF {order.amount}</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
