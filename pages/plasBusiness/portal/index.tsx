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
  History,
  X,
  Cpu,
  Sparkles,
  Settings,
  Camera
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
  const { theme } = useTheme();
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dummy Data with Categories
  const dummyItems = [
    { 
      id: 1, 
      name: "Office Desk", 
      price: "45,000", 
      status: "Active", 
      stock: 2, 
      category: "Interior",
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=200",
      images: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=600",
        "https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=600",
        "https://images.unsplash.com/photo-1493932484597-07b41a59d99a?q=80&w=600"
      ],
      details: {
        material: "Oak Wood",
        dimensions: "120x60x75 cm",
        roomType: "Office",
        condition: "Gently Used"
      },
      description: "A solid oak wood office desk in excellent condition. Perfect for home offices."
    },
    { 
      id: 2, 
      name: "Dell Monitor 24\"", 
      price: "85,000", 
      status: "Sold", 
      stock: 0, 
      category: "Electronic",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600",
        "https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=600",
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?q=80&w=600"
      ],
      details: {
        brand: "Dell",
        model: "U2419H",
        specs: "IPS, 1080p, 60Hz",
        condition: "Used - Like New"
      },
      description: "Professional grade monitor with ultra-thin bezels and accurate color representation."
    },
    { 
      id: 3, 
      name: "Fender Stratocaster", 
      price: "450,000", 
      status: "Active", 
      stock: 1, 
      category: "Instrument",
      image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=200",
      images: [
        "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=600",
        "https://images.unsplash.com/photo-1516924911020-87448282000e?q=80&w=600",
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600"
      ],
      details: {
        type: "Electric Guitar",
        brand: "Fender",
        yearsUsed: "5 years",
        condition: "Excellent"
      },
      description: "Original Fender Stratocaster, Made in Mexico. Classic tone and smooth playability."
    },
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
            <div 
              key={item.id} 
              onClick={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
              className={`group cursor-pointer rounded-[2rem] border p-4 transition-all hover:shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5 relative">
                <img src={item.image} alt={item.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                   <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black text-xs">View Details</div>
                </div>
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {item.status}
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {item.category === 'Electronic' && <Cpu className="h-4 w-4 text-white drop-shadow-md" />}
                  {item.category === 'Instrument' && <Sparkles className="h-4 w-4 text-white drop-shadow-md" />}
                  {item.category === 'Interior' && <Package className="h-4 w-4 text-white drop-shadow-md" />}
                  {item.category === 'Equipment' && <Settings className="h-4 w-4 text-white drop-shadow-md" />}
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
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} theme={theme} />
      )}

      {showDetailModal && selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }} 
          theme={theme} 
        />
      )}
    </div>
  );
}

function DetailModal({ item, onClose, theme }: any) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#121212] border border-white/10' : 'bg-white'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors">
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="p-8">
            <div className="aspect-square rounded-3xl overflow-hidden mb-4 border border-gray-100 dark:border-white/5">
              <img src={item.images[activeImage]} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {item.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-green-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:pl-0">
             <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest">{item.category}</span>
               <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">{item.status}</span>
             </div>
             <h2 className="text-3xl font-black font-outfit mb-2 leading-tight">{item.name}</h2>
             <p className="text-2xl font-black text-green-500 mb-6">RWF {item.price}</p>
             
             <div className="space-y-6">
               <div>
                 <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{item.description}</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 {Object.entries(item.details).map(([key, value]: any) => (
                   <div key={key} className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{key}</p>
                     <p className="text-sm font-bold truncate">{value}</p>
                   </div>
                 ))}
               </div>

               <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                 <button className="flex-1 rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20 hover:scale-[1.02] transition-all">Edit Listing</button>
                 <button className="rounded-2xl bg-red-500/10 px-6 py-4 font-black text-red-500 hover:bg-red-500/20 transition-all">Delete</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, theme }: any) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<any>(null);
  
  const categories = [
    { id: 'Electronic', name: 'Electronic', icon: Cpu, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'Interior', name: 'Interior', icon: Package, color: 'text-orange-500 bg-orange-500/10' },
    { id: 'Instrument', name: 'Instruments', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'Equipment', name: 'Equipment', icon: Settings, color: 'text-green-500 bg-green-500/10' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 ${theme === 'dark' ? 'bg-[#121212] border border-white/10' : 'bg-white'}`}>
        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-outfit">List New Item</h2>
            <p className="text-xs font-medium text-gray-500">Step {step} of 3 • {step === 1 ? 'Select Category' : step === 2 ? 'Details' : 'Upload Images'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setStep(2);
                  }}
                  className={`flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all hover:scale-105 ${category === cat.id ? 'border-green-500 bg-green-500/5' : 'border-gray-100 dark:border-white/5 bg-transparent'}`}
                >
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <span className="font-black font-outfit uppercase tracking-widest text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Item Name</label>
                   <input type="text" placeholder="e.g. iPhone 13 Pro" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Price (RWF)</label>
                   <input type="text" placeholder="500,000" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm text-green-500" />
                 </div>
               </div>

               {category === 'Electronic' && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Brand</label>
                     <input type="text" placeholder="Apple" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Condition</label>
                     <select className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm appearance-none">
                       <option>Brand New</option>
                       <option>Used - Like New</option>
                       <option>Used - Good</option>
                     </select>
                   </div>
                 </div>
               )}

               {category === 'Instrument' && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Instrument Type</label>
                     <input type="text" placeholder="e.g. Acoustic Guitar" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Years of Use</label>
                     <input type="text" placeholder="e.g. 3 years" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                 </div>
               )}

               {category === 'Equipment' && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Tool/Device Type</label>
                     <input type="text" placeholder="e.g. Drill or Printer" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Years of Use</label>
                     <input type="text" placeholder="e.g. 1.5 years" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                 </div>
               )}

               {category === 'Interior' && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Material</label>
                     <input type="text" placeholder="Wood / Metal" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Dimensions</label>
                     <input type="text" placeholder="120x80 cm" className="w-full rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm" />
                   </div>
                 </div>
               )}

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Description</label>
                 <textarea placeholder="Tell us more about the item..." className="w-full h-32 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-4 py-3 outline-none focus:border-green-500 transition-all font-bold text-sm resize-none"></textarea>
               </div>

               <div className="flex gap-4 pt-4">
                 <button onClick={() => setStep(1)} className="flex-1 rounded-2xl bg-gray-100 dark:bg-white/5 py-4 font-black uppercase tracking-widest text-xs">Back</button>
                 <button onClick={() => setStep(3)} className="flex-[2] rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20 uppercase tracking-widest text-xs">Next: Upload Media</button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <button key={i} className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-500/5 transition-all text-gray-400 hover:text-green-500">
                    <Camera className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Photo {i}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs font-medium text-blue-600">Great photos increase your chances of selling by 70%. Ensure your items are well-lit!</p>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setStep(2)} className="flex-1 rounded-2xl bg-gray-100 dark:bg-white/5 py-4 font-black uppercase tracking-widest text-xs">Back</button>
                 <button onClick={onClose} className="flex-[2] rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20 uppercase tracking-widest text-xs">Complete Listing</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
