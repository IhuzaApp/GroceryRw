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
      bg: "bg-blue-500/10",
    },
    {
      label: "Active RFQs",
      value: "8",
      icon: FileText,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Pending",
      value: "12",
      icon: Clock,
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-500/10",
    },
  ];

  const isPersonalAccount = businessAccount?.accountType === "personal";
  const isBusinessAccount = businessAccount?.accountType === "business";

  const mainActions = [
    {
      id: "overview",
      label: "Dashboard",
      icon: BarChart3,
      desc: "Key metrics",
    },
    // Service Provider Specific
    ...(isBusinessAccount
      ? [
          {
            id: "products-bids",
            label: "Services",
            icon: Briefcase,
            desc: "Your bids",
          },
          {
            id: "rfq-opportunities",
            label: "Find Work",
            icon: Search,
            desc: "RFQ Market",
          },
          { id: "orders", label: "Orders", icon: Truck, desc: "Sales orders" },
        ]
      : []),
    // Personal Account Specific
    ...(isPersonalAccount
      ? [
          {
            id: "services",
            label: "Services",
            icon: Briefcase,
            desc: "Available pros",
          },
        ]
      : []),
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
      <div className="bg-[var(--bg-primary)]/80 sticky top-0 z-50 border-b border-transparent px-6 pb-4 pt-10 backdrop-blur-xl transition-all">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTab ? (
              <button
                onClick={() => setActiveTab(null)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 transition-transform active:scale-90 dark:bg-white/10"
              >
                <ChevronRight className="h-6 w-6 rotate-180" />
              </button>
            ) : (
              <div className="flex h-14 w-14 rotate-3 transform items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/20">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-outfit text-2xl font-black tracking-tight">
                {activeTab
                  ? mainActions.find((a) => a.id === activeTab)?.label
                  : "Business Portal"}
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {businessAccount?.businessName || "Pro Member"}
                </span>
              </div>
            </div>
          </div>
          {!activeTab && (
            <div className="flex gap-2">
              <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gray-100/50 backdrop-blur-xl transition-transform active:scale-90 dark:bg-white/5">
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-32">
        {/* Menu View */}
        {!activeTab ? (
          <div className="mt-4 space-y-3 duration-700 animate-in fade-in slide-in-from-bottom-8">
            {/* Stats Summary Card (Small) */}
            <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-green-500/10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                  Available Balance
                </p>
                <p className="font-outfit text-2xl font-black">RWF 1,240,000</p>
              </div>
              <Wallet className="h-10 w-10 text-green-500 opacity-20" />
            </div>

            <h2 className="mb-6 ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Quick Navigation
            </h2>

            <div className="space-y-3">
              {mainActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  className="group flex w-full items-center gap-4 rounded-[2rem] border border-transparent bg-gray-100/50 p-4 transition-all hover:border-green-500/20 active:scale-[0.98] dark:bg-white/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
                    <action.icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-outfit text-base font-black">
                      {action.label}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {action.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Full Page Content View */
          <div className="pt-4 duration-500 animate-in fade-in slide-in-from-right-8">
            {activeTab === "overview" && (
              <BusinessOverview businessAccount={businessAccount} />
            )}

            {activeTab === "second-hand" && (
              <SecondHandManagement
                businessAccount={businessAccount}
                theme={theme}
              />
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
              <RFQOpportunitiesSection
                onMessageCustomer={() => {}}
                businessAccount={businessAccount}
              />
            )}

            {activeTab === "stores" && (
              <StoresSection businessAccount={businessAccount} />
            )}

            {activeTab === "services" && (
              <ServicesSection onRequestQuotation={() => {}} />
            )}

            {activeTab === "orders" && <OrdersSection />}

            {activeTab === "quotes" && (
              <QuotesSection
                onViewQuoteDetails={(quote: any) => {
                  setSelectedQuote(quote);
                  setIsQuoteModalOpen(true);
                }}
              />
            )}

            {activeTab === "wallet" && (
              <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-100/50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-1 font-outfit text-lg font-black">
                  Wallet & Transactions
                </h3>
                <p className="text-sm text-gray-500">
                  Transaction history and withdrawal features are coming soon to
                  mobile.
                </p>
              </div>
            )}

            {/* Quick Back Button at the bottom */}
            <button
              onClick={() => setActiveTab(null)}
              className="mt-12 w-full rounded-2xl bg-gray-100 py-4 text-xs font-black uppercase tracking-widest text-gray-400 transition-all active:scale-95 dark:bg-white/5"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
