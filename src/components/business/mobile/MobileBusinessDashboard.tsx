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

// RFQs Section Component
function RFQsSection({ businessAccount }: { businessAccount: any }) {
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
            onClick={() => router.push(`/plasBusiness/rfqs/${rfq.id}`)}
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
  const [stats, setStats] = useState({
    totalRFQs: 0,
    activeOrders: 0,
    pendingQuotes: 0,
    walletBalance: 0,
  });
  
  // Data states for expanded sections
  const [myRFQs, setMyRFQs] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

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

  const fetchStats = async () => {
    try {
      const [rfqsRes, ordersRes, quotesRes, walletRes] = await Promise.all([
        fetch("/api/queries/business-rfqs").catch(() => null),
        fetch("/api/queries/business-product-orders").catch(() => null),
        fetch("/api/queries/business-submitted-quotes").catch(() => null),
        fetch("/api/queries/check-business-wallet").catch(() => null),
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
        walletBalance = parseFloat(data.balance || "0");
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
          // TODO: Add stores API endpoint
          setStores([]);
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
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
        {businessAccount && !expandedSection && <RFQsSection businessAccount={businessAccount} />}

        {/* Expanded Section Cards */}
        {expandedSection && (
          <ExpandedSectionCard
            sectionId={expandedSection}
            onClose={() => setExpandedSection(null)}
            data={{
              rfqs: myRFQs,
              quotes: quotes,
              orders: orders,
              services: services,
              stores: stores,
              contracts: contracts,
            }}
            loading={loadingSection === expandedSection}
            businessAccount={businessAccount}
            router={router}
          />
        )}
      </div>
    </div>
  );
}

// Expanded Section Card Component
interface ExpandedSectionCardProps {
  sectionId: string;
  onClose: () => void;
  data: {
    rfqs: any[];
    quotes: any[];
    orders: any[];
    services: any[];
    stores: any[];
    contracts: any[];
  };
  loading: boolean;
  businessAccount?: any;
  router: any;
}

function ExpandedSectionCard({
  sectionId,
  onClose,
  data,
  loading,
  businessAccount,
  router,
}: ExpandedSectionCardProps) {
  const sectionTitles: Record<string, string> = {
    rfqs: "My RFQs",
    quotes: "Quotes",
    orders: "Orders",
    services: "Services",
    stores: "Stores",
    contracts: "Contracts",
  };

  const sectionIcons: Record<string, any> = {
    rfqs: FileText,
    quotes: ShoppingCart,
    orders: Package,
    services: Briefcase,
    stores: Store,
    contracts: FileText,
  };

  const Icon = sectionIcons[sectionId] || FileText;
  const title = sectionTitles[sectionId] || "Details";
  const items = data[sectionId as keyof typeof data] || [];

  if (loading) {
    return (
      <div className="px-4 mb-6">
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading {title}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <div className="bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-white/90">{items.length} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                <Icon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                No {title.toLowerCase()} found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {sectionId === "rfqs" && "Create your first RFQ to get started"}
                {sectionId === "quotes" && "No quotes submitted yet"}
                {sectionId === "orders" && "No orders found"}
                {sectionId === "services" && "No services available"}
                {sectionId === "stores" && "No stores created yet"}
                {sectionId === "contracts" && "No contracts found"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sectionId === "rfqs" && items.map((rfq: any) => (
                <RFQCard key={rfq.id} rfq={rfq} router={router} />
              ))}
              {sectionId === "quotes" && items.map((quote: any) => (
                <QuoteCard key={quote.id} quote={quote} router={router} />
              ))}
              {sectionId === "orders" && items.map((order: any) => (
                <OrderCard key={order.id} order={order} router={router} />
              ))}
              {sectionId === "services" && items.map((service: any) => (
                <ServiceCard key={service.id} service={service} router={router} />
              ))}
              {sectionId === "stores" && items.map((store: any) => (
                <StoreCard key={store.id} store={store} router={router} />
              ))}
              {sectionId === "contracts" && items.map((contract: any) => (
                <ContractCard key={contract.id} contract={contract} router={router} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual Card Components
function RFQCard({ rfq, router }: { rfq: any; router: any }) {
  return (
    <div
      onClick={() => router.push(`/plasBusiness/rfqs/${rfq.id}`)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex-1">
          {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
        </h4>
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ml-2 ${
          rfq.open 
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
            : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
        }`}>
          {rfq.open ? "Open" : "Closed"}
        </span>
      </div>
      {rfq.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {rfq.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {rfq.category && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {rfq.category}
          </span>
        )}
        {rfq.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {rfq.location}
          </span>
        )}
        {rfq.response_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(rfq.response_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function QuoteCard({ quote, router }: { quote: any; router: any }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex-1">
          Quote for {quote.rfq?.title || `RFQ #${quote.businessRfq_id?.slice(0, 8)}`}
        </h4>
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ml-2 ${
          quote.status === "accepted"
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : quote.status === "rejected"
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
        }`}>
          {quote.status || "Pending"}
        </span>
      </div>
      {quote.qouteAmount && (
        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {quote.currency || "RF"} {quote.qouteAmount}
        </p>
      )}
      {quote.message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {quote.message}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {quote.delivery_time && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {quote.delivery_time}
          </span>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, router }: { order: any; router: any }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex-1">
          Order #{order.id?.slice(0, 8) || "N/A"}
        </h4>
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ml-2 ${
          order.status === "completed"
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : order.status === "pending"
            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
        }`}>
          {order.status || "Active"}
        </span>
      </div>
      {order.created_at && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Calendar className="h-3 w-3 inline mr-1" />
          {new Date(order.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function ServiceCard({ service, router }: { service: any; router: any }) {
  return (
    <div
      onClick={() => router.push(`/plasBusiness/services/${service.id}`)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
          <Package className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            {service.name}
          </h4>
          {service.price && (
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
              {service.price} {service.unit ? `/ ${service.unit}` : ""}
            </p>
          )}
          {service.Description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {service.Description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreCard({ store, router }: { store: any; router: any }) {
  return (
    <div
      onClick={() => router.push(`/plasBusiness/stores/${store.id}`)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
          <Store className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            {store.name || "Store"}
          </h4>
          {store.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {store.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractCard({ contract, router }: { contract: any; router: any }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex-1">
          Contract #{contract.id?.slice(0, 8) || "N/A"}
        </h4>
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ml-2 ${
          contract.status === "active"
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
        }`}>
          {contract.status || "Active"}
        </span>
      </div>
      {contract.created_at && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 inline mr-1" />
          {new Date(contract.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
