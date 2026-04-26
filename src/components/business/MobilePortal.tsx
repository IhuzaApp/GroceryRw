"use client";

import { useState } from "react";
import {
  BarChart3,
  Package,
  FileText,
  Star,
  DollarSign,
  Clock,
  Briefcase,
  Plus,
  ChevronRight,
  Bell,
  Wallet,
  Settings,
  MessageSquare,
  Store,
  Search,
  Truck,
} from "lucide-react";
import { ProductsBidsSection } from "./ProductsBidsSection";
import { RFQOpportunitiesSection } from "./RFQOpportunitiesSection";
import { StoresSection } from "./StoresSection";
import { ServicesSection } from "./ServicesSection";
import { OrdersSection } from "./OrdersSection";
import { BusinessOverview } from "./BusinessOverview";
import { MyRFQsSection } from "./MyRFQsSection";
import { QuotesSection } from "./QuotesSection";
import { SecondHandManagement } from "./SecondHandManagement";
import { ContractDetailDrawer } from "./ContractDetailDrawer";

interface MobilePortalProps {
  businessAccount: any;
  theme: string;
  router: any;
  setSelectedQuote: (quote: any) => void;
  setIsQuoteModalOpen: (open: boolean) => void;
  rfqCreated: boolean;
  setRfqCreated: (value: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedContractId: (id: string | null) => void;
  setIsContractDrawerOpen: (open: boolean) => void;
}

export function MobilePortal({
  businessAccount,
  theme,
  router,
  setSelectedQuote,
  setIsQuoteModalOpen,
  setIsCreateRFQOpen,
  rfqCreated,
  setRfqCreated,
  setSelectedContractId,
  setIsContractDrawerOpen,
}: MobilePortalProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const stats = [
    { 
      label: "Balance", 
      value: "RWF 1.2M", 
      icon: Wallet, 
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Active RFQs", 
      value: "8", 
      icon: FileText, 
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-500/10" 
    },
    { 
      label: "Pending", 
      value: "12", 
      icon: Clock, 
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-500/10" 
    },
  ];

  const isPersonalAccount = businessAccount?.accountType === "personal";
  const isBusinessAccount = businessAccount?.accountType === "business";

  const mainActions = [
    { id: "overview", label: "Dashboard", icon: BarChart3, desc: "Key metrics" },
    // Service Provider Specific
    ...(isBusinessAccount ? [
      { id: "products-bids", label: "Services", icon: Briefcase, desc: "Your bids" },
      { id: "rfq-opportunities", label: "Find Work", icon: Search, desc: "RFQ Market" },
      { id: "orders", label: "Orders", icon: Truck, desc: "Sales orders" },
    ] : []),
    // Personal Account Specific
    ...(isPersonalAccount ? [
      { id: "services", label: "Services", icon: Briefcase, desc: "Available pros" },
    ] : []),
    // Common sections
    { id: "stores", label: "Stores", icon: Store, desc: "Local shops" },
    { id: "second-hand", label: "Pre-owned", icon: Package, desc: "Inventory" },
    { id: "rfqs", label: "My RFQs", icon: FileText, desc: "Your requests" },
    { id: "quotes", label: "Quotes", icon: Star, desc: "Offers" },
    { id: "wallet", label: "Wallet", icon: Wallet, desc: "Transactions" },
  ];

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header with Dynamic Back Button */}
      <div className="px-6 pt-10 pb-4 sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-transparent transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {activeTab ? (
              <button 
                onClick={() => setActiveTab(null)}
                className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center transition-transform active:scale-90"
              >
                <ChevronRight className="h-6 w-6 rotate-180" />
              </button>
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/20 transform rotate-3">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black font-outfit tracking-tight">
                {activeTab ? mainActions.find(a => a.id === activeTab)?.label : "Business Portal"}
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {businessAccount?.businessName || "Pro Member"}
                </span>
              </div>
            </div>
          </div>
          {!activeTab && (
            <div className="flex gap-2">
              <button className="h-12 w-12 rounded-2xl bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 transition-transform active:scale-90">
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-32">
        {/* Menu View */}
        {!activeTab ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-3 mt-4">
            {/* Stats Summary Card (Small) */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/10 mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">Available Balance</p>
                <p className="text-2xl font-black font-outfit">RWF 1,240,000</p>
              </div>
              <Wallet className="h-10 w-10 text-green-500 opacity-20" />
            </div>

            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 ml-2">Quick Navigation</h2>
            
            <div className="space-y-3">
              {mainActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  className="group w-full flex items-center gap-4 p-4 rounded-[2rem] bg-gray-100/50 dark:bg-white/5 border border-transparent hover:border-green-500/20 active:scale-[0.98] transition-all"
                >
                  <div className="h-14 w-14 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                    <action.icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black font-outfit text-base">{action.label}</p>
                    <p className="text-xs font-medium text-gray-500">{action.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Full Page Content View */
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 pt-4">
            {activeTab === "overview" && (
              <BusinessOverview businessAccount={businessAccount} />
            )}

            {activeTab === "second-hand" && (
              <SecondHandManagement businessAccount={businessAccount} theme={theme} />
            )}

            {activeTab === "rfqs" && (
              <MyRFQsSection
                onCreateRFQ={() => setIsCreateRFQOpen(true)}
                onAssignContract={(id: any) => {
                  setSelectedContractId(id);
                  setIsContractDrawerOpen(true);
                }}
                onMessageSupplier={() => {}}
                onRFQCreated={rfqCreated}
              />
            )}

            {activeTab === "products-bids" && (
              <ProductsBidsSection businessAccount={businessAccount} />
            )}

            {activeTab === "rfq-opportunities" && (
              <RFQOpportunitiesSection onMessageCustomer={() => {}} businessAccount={businessAccount} />
            )}

            {activeTab === "stores" && (
              <StoresSection businessAccount={businessAccount} />
            )}

            {activeTab === "services" && (
              <ServicesSection onRequestQuotation={() => {}} />
            )}

            {activeTab === "orders" && (
              <OrdersSection />
            )}

            {activeTab === "quotes" && (
              <QuotesSection onViewQuoteDetails={(quote: any) => {
                setSelectedQuote(quote);
                setIsQuoteModalOpen(true);
              }} />
            )}

            {activeTab === "wallet" && (
              <div className="p-8 rounded-[2rem] bg-gray-100/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-black font-outfit text-lg mb-1">Wallet & Transactions</h3>
                <p className="text-sm text-gray-500">Transaction history and withdrawal features are coming soon to mobile.</p>
              </div>
            )}
            
            {/* Quick Back Button at the bottom */}
            <button 
              onClick={() => setActiveTab(null)}
              className="mt-12 w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/5 font-black text-gray-400 uppercase tracking-widest text-xs active:scale-95 transition-all"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
