"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  FileText,
  ShoppingCart,
  Package,
  Store,
  Briefcase,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  User,
  Plus,
  DollarSign,
  BarChart3,
  Zap,
  Target,
  Globe,
  Building2,
  Sparkles,
  Brain,
  Network,
  TrendingDown,
  Layers,
  Cpu,
  Rocket,
  Award,
  Shield,
  Users,
  PieChart,
  LineChart,
  Activity,
  Lightbulb,
  Code,
  Database,
  Cloud,
  Settings,
  CheckCircle,
  Star,
  ChevronDown,
  X,
  Calendar,
  MapPin,
  Clock,
  Eye,
} from "lucide-react";
import { ExpandedSectionModal } from "./ExpandedSectionModal";
import { ProductEditModal } from "./ProductEditModal";
import { QuoteSubmissionForm } from "../QuoteSubmissionForm";
import { SubmittedQuoteDetails } from "../SubmittedQuoteDetails";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import toast from "react-hot-toast";

// RFQs Section Component
function RFQsSection({ 
  businessAccount,
  onRFQClick 
}: { 
  businessAccount: any;
  onRFQClick?: (rfq: any) => void;
}) {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQs();
  }, [businessAccount]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/rfq-opportunities");
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (rfqs.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white">
          RFQ Opportunities
        </h3>
        <button
          onClick={() => router.push("/plasBusiness?view=list")}
          className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors px-3 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="group bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 shadow-sm"
            onClick={() => {
              if (onRFQClick) {
                onRFQClick(rfq);
              }
            }}
          >
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">
              {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {rfq.description || "RFQ description available..."}
            </p>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                rfq.open 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                  : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
              }`}>
                {rfq.open ? "Open" : "Closed"}
              </span>
              <button className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors">
                View Details
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MobileBusinessDashboardProps {
  businessAccount?: any;
  userName?: string;
  userProfilePicture?: string;
}

export function MobileBusinessDashboard({
  businessAccount,
  userName = "User",
  userProfilePicture,
}: MobileBusinessDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  // RFQ Opportunity states (different from My RFQs)
  const [selectedRFQOpportunity, setSelectedRFQOpportunity] = useState<any>(null);
  const [isRFQOpportunityModalOpen, setIsRFQOpportunityModalOpen] = useState(false);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<any>(null);
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, any>>({});
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRFQs: 0,
    activeOrders: 0,
    pendingQuotes: 0,
    walletBalance: 0,
  });
  
  // Data states for expanded sections
  const [myRFQs, setMyRFQs] = useState<any[]>([]);
  const [rfqOpportunities, setRfqOpportunities] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  
  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);


  const businessFeatures = [
    {
      id: "rfqs",
      icon: FileText,
      label: "My RFQs",
      color: "text-green-500",
      route: "/plasBusiness?tab=rfqs",
    },
    {
      id: "quotes",
      icon: ShoppingCart,
      label: "Quotes",
      color: "text-green-500",
      route: "/plasBusiness?tab=quotes",
    },
    {
      id: "orders",
      icon: Package,
      label: "Orders",
      color: "text-green-500",
      route: "/plasBusiness?tab=orders",
    },
    {
      id: "services",
      icon: Briefcase,
      label: "Services",
      color: "text-green-500",
      route: "/plasBusiness?tab=services",
    },
    {
      id: "stores",
      icon: Store,
      label: "Stores",
      color: "text-green-500",
      route: "/plasBusiness?tab=stores",
    },
    {
      id: "contracts",
      icon: FileText,
      label: "Contracts",
      color: "text-green-500",
      route: "/plasBusiness?tab=contracts",
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
      color: "text-green-500",
      route: "/Messages",
    },
    {
      id: "create-rfq",
      icon: Plus,
      label: "Create RFQ",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      action: () => router.push("/plasBusiness?createRFQ=true"),
    },
  ];

  useEffect(() => {
    if (businessAccount?.id) {
      fetchStats();
    }
  }, [businessAccount]);

  const checkExistingQuote = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/queries/user-rfq-quote?rfqId=${rfqId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.quote) {
          setSubmittedQuotes((prev) => ({ ...prev, [rfqId]: data.quote }));
        }
      }
    } catch (error) {
      console.error("Error checking existing quote:", error);
    }
  };

  const handleShareQuote = async (rfq: any) => {
    const existingQuote = submittedQuotes[rfq.id];
    if (existingQuote) {
      setSelectedRFQForQuote(rfq);
      setSelectedQuote(existingQuote);
      setIsQuoteDetailsOpen(true);
    } else {
      setSelectedRFQForQuote(rfq);
      setIsQuoteFormOpen(true);
    }
  };

  const handleQuoteSubmitted = () => {
    toast.success("Quote submitted successfully!");
    setIsQuoteFormOpen(false);
    setSelectedRFQForQuote(null);
    if (selectedRFQOpportunity) {
      checkExistingQuote(selectedRFQOpportunity.id);
    }
  };

  const fetchStats = async () => {
    if (!businessAccount?.id) return;
    
    try {
      const [rfqsRes, ordersRes, quotesRes, walletRes] = await Promise.all([
        fetch("/api/queries/business-rfqs").catch(() => null),
        fetch("/api/queries/business-product-orders").catch(() => null),
        fetch("/api/queries/business-submitted-quotes").catch(() => null),
        fetch(`/api/queries/check-business-wallet?business_id=${businessAccount.id}`).catch(() => null),
      ]);

      let totalRFQs = 0;
      let activeOrders = 0;
      let pendingQuotes = 0;
      let walletBalance = 0;

      if (rfqsRes?.ok) {
        const data = await rfqsRes.json();
        totalRFQs = data.rfqs?.length || 0;
      }

      if (ordersRes?.ok) {
        const data = await ordersRes.json();
        activeOrders = data.orders?.filter((o: any) => o.status !== "completed")?.length || 0;
      }

      if (quotesRes?.ok) {
        const data = await quotesRes.json();
        pendingQuotes = data.quotes?.filter((q: any) => q.status === "pending")?.length || 0;
      }

      if (walletRes?.ok) {
        const data = await walletRes.json();
        walletBalance = parseFloat(data.wallet?.amount || "0");
      }

      setStats({ totalRFQs, activeOrders, pendingQuotes, walletBalance });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFeatureClick = async (feature: any) => {
    // If it's the create RFQ action, navigate
    if (feature.action) {
      feature.action();
      return;
    }
    
    // If it's messages, navigate to messages page
    if (feature.id === "messages") {
      router.push(feature.route);
      return;
    }
    
    // Toggle expansion for other features
    if (expandedSection === feature.id) {
      setExpandedSection(null);
    } else {
      setExpandedSection(feature.id);
      await fetchSectionData(feature.id);
    }
  };

  const fetchSectionData = async (sectionId: string) => {
    setLoadingSection(sectionId);
    try {
      switch (sectionId) {
        case "rfqs":
          const rfqsRes = await fetch("/api/queries/business-rfqs");
          if (rfqsRes.ok) {
            const rfqsData = await rfqsRes.json();
            setMyRFQs(rfqsData.rfqs || []);
          }
          break;
        case "rfq-opportunities":
          const rfqOppsRes = await fetch("/api/queries/rfq-opportunities");
          if (rfqOppsRes.ok) {
            const rfqOppsData = await rfqOppsRes.json();
            setRfqOpportunities(rfqOppsData.rfqs || []);
          }
          break;
        case "quotes":
          const quotesRes = await fetch("/api/queries/business-submitted-quotes");
          if (quotesRes.ok) {
            const quotesData = await quotesRes.json();
            setQuotes(quotesData.quotes || []);
          }
          break;
        case "orders":
          const ordersRes = await fetch("/api/queries/business-product-orders");
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders || []);
          }
          break;
        case "services":
          const servicesRes = await fetch("/api/queries/business-services");
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            setServices(servicesData.services || []);
          }
          break;
        case "stores":
          const storesRes = await fetch("/api/queries/business-stores");
          if (storesRes.ok) {
            const storesData = await storesRes.json();
            setStores(storesData.stores || []);
          }
          break;
        case "contracts":
          // TODO: Add contracts API endpoint
          setContracts([]);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${sectionId}:`, error);
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <div className="flex flex-col h-full  overflow-hidden">
      {/* Header with Gradient */}
      <div className="flex-shrink-0 bg-gradient-to-b from-green-800 to-green-700 dark:from-green-900 dark:to-green-800 relative overflow-hidden">
        {/* Grid Overlay Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        ></div>
        
        {/* Decorative Icons - Scattered */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {/* Business Icons */}
          <Building2 className="absolute top-8 right-16 h-8 w-8 text-gray-200/20 rotate-12" />
          <Briefcase className="absolute top-20 right-8 h-6 w-6 text-gray-200/15 -rotate-12" />
          <Store className="absolute top-32 right-24 h-7 w-7 text-gray-200/20 rotate-45" />
          <Layers className="absolute top-44 right-32 h-6 w-6 text-gray-200/15 rotate-12" />
          <Users className="absolute top-52 right-20 h-5 w-5 text-gray-200/20 -rotate-45" />
          <Award className="absolute top-60 right-12 h-6 w-6 text-gray-200/15 rotate-12" />
          <Shield className="absolute top-[280px] right-28 h-5 w-5 text-gray-200/20 rotate-45" />
          
          {/* Market/Trading Icons */}
          <TrendingUp className="absolute top-12 left-12 h-6 w-6 text-gray-200/20 rotate-45" />
          <BarChart3 className="absolute top-24 left-8 h-7 w-7 text-gray-200/15 -rotate-12" />
          <TrendingDown className="absolute top-36 left-20 h-5 w-5 text-gray-200/20 rotate-12" />
          <Target className="absolute top-16 left-32 h-6 w-6 text-gray-200/15" />
          <PieChart className="absolute top-28 left-24 h-6 w-6 text-gray-200/20 rotate-45" />
          <LineChart className="absolute top-40 left-12 h-5 w-5 text-gray-200/15 -rotate-12" />
          <Activity className="absolute top-48 left-36 h-6 w-6 text-gray-200/20 rotate-12" />
          <DollarSign className="absolute top-56 left-16 h-5 w-5 text-gray-200/15 rotate-45" />
          
          {/* AI/Tech Icons */}
          <Brain className="absolute top-6 right-32 h-7 w-7 text-gray-200/20 rotate-12" />
          <Sparkles className="absolute top-28 right-40 h-6 w-6 text-gray-200/15 -rotate-45" />
          <Zap className="absolute top-40 right-12 h-5 w-5 text-gray-200/20 rotate-12" />
          <Network className="absolute top-14 left-48 h-6 w-6 text-gray-200/15 rotate-45" />
          <Globe className="absolute top-32 left-40 h-7 w-7 text-gray-200/20 -rotate-12" />
          <Cpu className="absolute top-18 right-48 h-6 w-6 text-gray-200/15 rotate-12" />
          <Rocket className="absolute top-36 right-36 h-5 w-5 text-gray-200/20 -rotate-45" />
          <Lightbulb className="absolute top-44 left-28 h-6 w-6 text-gray-200/15 rotate-45" />
          <Code className="absolute top-52 right-44 h-5 w-5 text-gray-200/20 rotate-12" />
          <Database className="absolute top-60 left-44 h-6 w-6 text-gray-200/15 -rotate-12" />
          <Cloud className="absolute top-24 right-52 h-5 w-5 text-gray-200/20 rotate-45" />
          <Settings className="absolute top-48 right-24 h-5 w-5 text-gray-200/15 rotate-12" />
          <CheckCircle className="absolute top-56 left-52 h-6 w-6 text-gray-200/20 -rotate-45" />
          <Star className="absolute top-64 right-36 h-5 w-5 text-gray-200/15 rotate-45" />
        </div>
        
        <div className="px-4 pt-12 pb-4 relative z-10">
          {/* Profile & Greeting */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden ring-2 ring-white/30 shadow-lg">
              {userProfilePicture ? (
                <img
                  src={userProfilePicture}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Hello, {userName}
              </h2>
              <p className="text-sm text-white/95 font-medium">
                {businessAccount?.businessName || "Business Dashboard"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search: services, suppliers, RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-white px-4 py-3.5 pl-4 pr-14 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-green-500 shadow-xl border-0"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 active:scale-95">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Quick Stats */}
        <div className="px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="group bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">My RFQs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRFQs}</p>
            </div>
            <div className="group bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Orders</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeOrders}</p>
            </div>
            <div className="group bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending Quotes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingQuotes}</p>
            </div>
            <div className="group bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Wallet Balance</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.walletBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Business Features Grid */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-3">
            {businessFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature)}
                  className={`group flex flex-col items-center gap-2.5 p-3.5 rounded-xl transition-all duration-200 active:scale-95 hover:scale-105 ${
                    feature.bgColor || "bg-white dark:bg-gray-700 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shadow-sm transition-all duration-200 group-hover:scale-110 ${
                    feature.bgColor || "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700"
                  }`}>
                    <Icon className={`h-6 w-6 ${feature.color} transition-transform duration-200`} />
                  </div>
                  <span className="text-xs text-center text-gray-700 dark:text-gray-300 font-semibold leading-tight">
                    {feature.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monitor RFQs Card */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 shadow-lg border border-green-200 dark:border-green-800/50 hover:shadow-xl transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                  Monitor RFQ Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Track your RFQs and view quote responses
                </p>
                <button
                  onClick={() => router.push("/plasBusiness?tab=rfqs")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-200"
                >
                  View All RFQs
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <TrendingUp className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* RFQs Section */}
        {businessAccount && !expandedSection && (
          <RFQsSection 
            businessAccount={businessAccount}
            onRFQClick={(rfq) => {
              setSelectedRFQ(rfq);
              setExpandedSection("rfq-opportunities");
            }}
          />
        )}
      </div>

      {/* Expanded Section Modal */}
      {expandedSection && (
        <ExpandedSectionModal
          sectionId={expandedSection}
          onClose={() => {
            setExpandedSection(null);
            setSelectedRFQ(null);
          }}
          data={{
            rfqs: expandedSection === "rfqs" && selectedRFQ ? [selectedRFQ, ...myRFQs] : myRFQs,
            rfqOpportunities: expandedSection === "rfq-opportunities" && selectedRFQ ? [selectedRFQ, ...rfqOpportunities] : rfqOpportunities,
            quotes: quotes,
            orders: orders,
            services: services,
            stores: stores,
            contracts: contracts,
          }}
          loading={loadingSection === expandedSection}
          businessAccount={businessAccount}
          router={router}
          initialSelectedItem={(expandedSection === "rfqs" || expandedSection === "rfq-opportunities") ? selectedRFQ : undefined}
          onEditProduct={(product, storeId) => {
            // Open edit modal while keeping expanded modal open
            setEditingProduct(product);
            setEditingStoreId(storeId);
          }}
          onMessageCustomer={(customerId) => {
            router.push(`/plasBusiness/BusinessChats?supplier=${customerId}`);
          }}
        />
      )}

      {/* RFQ Opportunity Details Modal */}
      {isRFQOpportunityModalOpen && selectedRFQOpportunity && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={() => {
            setIsRFQOpportunityModalOpen(false);
            setSelectedRFQOpportunity(null);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                RFQ Details
              </h3>
              <button
                onClick={() => {
                  setIsRFQOpportunityModalOpen(false);
                  setSelectedRFQOpportunity(null);
                }}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {selectedRFQOpportunity.title || `RFQ #${selectedRFQOpportunity.id?.slice(0, 8)}`}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedRFQOpportunity.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget:
                  </span>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedRFQOpportunity.min_budget && selectedRFQOpportunity.max_budget
                      ? `${formatCurrencySync(parseFloat(selectedRFQOpportunity.min_budget))} - ${formatCurrencySync(parseFloat(selectedRFQOpportunity.max_budget))}`
                      : selectedRFQOpportunity.min_budget
                      ? `${formatCurrencySync(parseFloat(selectedRFQOpportunity.min_budget))}+`
                      : selectedRFQOpportunity.max_budget
                      ? `Up to ${formatCurrencySync(parseFloat(selectedRFQOpportunity.max_budget))}`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location:
                  </span>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedRFQOpportunity.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Posted By:
                  </span>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedRFQOpportunity.business_account?.business_name || 
                     selectedRFQOpportunity.contact_name || 
                     "Unknown Business"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deadline:
                  </span>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedRFQOpportunity.response_date
                      ? new Date(selectedRFQOpportunity.response_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsRFQOpportunityModalOpen(false);
                    handleShareQuote(selectedRFQOpportunity);
                  }}
                  className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
                    submittedQuotes[selectedRFQOpportunity.id]
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {submittedQuotes[selectedRFQOpportunity.id]
                    ? "View Quote"
                    : "Submit Quote"}
                </button>
                <button
                  onClick={() => {
                    router.push(`/plasBusiness/BusinessChats?supplier=${selectedRFQOpportunity.business_account?.id || selectedRFQOpportunity.id}`);
                  }}
                  className="w-full rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                >
                  Message Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Submission Form */}
      {isQuoteFormOpen && selectedRFQForQuote && (
        <QuoteSubmissionForm
          isOpen={isQuoteFormOpen}
          onClose={() => {
            setIsQuoteFormOpen(false);
            setSelectedRFQForQuote(null);
          }}
          rfqId={selectedRFQForQuote.id}
          rfqTitle={selectedRFQForQuote.title}
          onSuccess={handleQuoteSubmitted}
        />
      )}

      {/* Submitted Quote Details */}
      {isQuoteDetailsOpen && selectedQuote && selectedRFQForQuote && (
        <SubmittedQuoteDetails
          isOpen={isQuoteDetailsOpen}
          onClose={() => {
            setIsQuoteDetailsOpen(false);
            setSelectedQuote(null);
            setSelectedRFQForQuote(null);
          }}
          quote={selectedQuote}
          rfqTitle={selectedRFQForQuote.title || "RFQ"}
        />
      )}

      {/* Product Edit Modal - Higher z-index so it appears on top */}
      {editingProduct && editingStoreId && (
        <ProductEditModal
          product={editingProduct}
          storeId={editingStoreId}
          onClose={() => {
            // Just close edit modal, keep expanded modal open
            setEditingProduct(null);
            setEditingStoreId(null);
            // Refresh data in expanded modal
            if (expandedSection) {
              fetchSectionData(expandedSection);
            }
          }}
          onSave={() => {
            // Refresh the section data after saving
            if (expandedSection) {
              fetchSectionData(expandedSection);
            }
            // Close edit modal, expanded modal stays open
            setEditingProduct(null);
            setEditingStoreId(null);
          }}
        />
      )}
    </div>
  );
}

