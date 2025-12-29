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
  onRFQClick,
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
        let filteredRFQs = data.rfqs || [];

        // If user has a business account, filter out RFQs that belong to them
        if (businessAccount?.id) {
          filteredRFQs = filteredRFQs.filter((rfq: any) => {
            // Exclude RFQs where business_id matches the user's business account
            return rfq.business_id !== businessAccount.id;
          });
        }

        setRfqs(filteredRFQs.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 px-4">
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
    <div className="mb-6 px-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">
          RFQ Opportunities
        </h3>
        <button
          onClick={() => router.push("/plasBusiness?view=list")}
          className="rounded-lg px-3 py-1 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {rfqs.map((rfq) => {
          // Calculate urgency
          const today = new Date();
          const deadline = rfq.response_date
            ? new Date(rfq.response_date)
            : null;
          const isUrgent =
            deadline &&
            deadline.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000 &&
            deadline > today;
          const isClosed = deadline && deadline < today;
          const status = isClosed ? "Closed" : isUrgent ? "Urgent" : "Open";

          const minBudget = rfq.min_budget ? parseFloat(rfq.min_budget) : 0;
          const maxBudget = rfq.max_budget ? parseFloat(rfq.max_budget) : 0;
          const budgetDisplay =
            minBudget > 0 && maxBudget > 0
              ? `${formatCurrencySync(minBudget)} - ${formatCurrencySync(
                  maxBudget
                )}`
              : minBudget > 0
              ? `${formatCurrencySync(minBudget)}+`
              : maxBudget > 0
              ? `Up to ${formatCurrencySync(maxBudget)}`
              : "Not specified";

          return (
            <div
              key={rfq.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-4 shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.97] dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 dark:hover:border-green-600"
              onClick={() => {
                if (onRFQClick) {
                  onRFQClick(rfq);
                }
              }}
            >
              {/* Decorative gradient overlay on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 transition-opacity duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-teal-900/10"></div>

              <div className="relative">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <FileText
                        className="h-4.5 w-4.5 text-white"
                        style={{ color: "#ffffff", stroke: "#ffffff" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 dark:text-white">
                        {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
                      </h4>
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${
                      status === "Urgent"
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
                        : status === "Closed"
                        ? "bg-gray-500 text-white"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30"
                    }`}
                    style={
                      status !== "Urgent" && status !== "Closed"
                        ? { color: "#ffffff" }
                        : undefined
                    }
                  >
                    {status}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-3 ml-11 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {rfq.description || "RFQ description available..."}
                </p>

                {/* Budget */}
                <div className="mb-3 ml-11">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {budgetDisplay}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Budget Range
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
                  </div>
                  <button className="flex items-center gap-1 text-xs font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                    View Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
  const [selectedRFQOpportunity, setSelectedRFQOpportunity] =
    useState<any>(null);
  const [isRFQOpportunityModalOpen, setIsRFQOpportunityModalOpen] =
    useState(false);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<any>(null);
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, any>>(
    {}
  );
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
      const response = await fetch(
        `/api/queries/user-rfq-quote?rfqId=${rfqId}`
      );
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
        fetch(
          `/api/queries/check-business-wallet?business_id=${businessAccount.id}`
        ).catch(() => null),
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
        activeOrders =
          data.orders?.filter((o: any) => o.status !== "completed")?.length ||
          0;
      }

      if (quotesRes?.ok) {
        const data = await quotesRes.json();
        pendingQuotes =
          data.quotes?.filter((q: any) => q.status === "pending")?.length || 0;
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
            let filteredRFQs = rfqOppsData.rfqs || [];

            // If user has a business account, filter out RFQs that belong to them
            if (businessAccount?.id) {
              filteredRFQs = filteredRFQs.filter((rfq: any) => {
                // Exclude RFQs where business_id matches the user's business account
                return rfq.business_id !== businessAccount.id;
              });
            }

            setRfqOpportunities(filteredRFQs);
          }
          break;
        case "quotes":
          const quotesRes = await fetch(
            "/api/queries/business-submitted-quotes"
          );
          if (quotesRes.ok) {
            const quotesData = await quotesRes.json();
            let filteredQuotes = quotesData.quotes || [];

            // Ensure we only show quotes submitted by the current business account
            // If no business account, show empty array (quotes require business account)
            if (businessAccount?.id) {
              filteredQuotes = filteredQuotes.filter(
                (quote: any) => quote.respond_business_id === businessAccount.id
              );
            } else {
              filteredQuotes = [];
            }

            setQuotes(filteredQuotes);
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
    <div className="flex h-full flex-col  overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-b from-green-800 to-green-700 dark:from-green-900 dark:to-green-800">
        {/* Grid Overlay Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Decorative Icons - Scattered */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {/* Business Icons */}
          <Building2 className="absolute right-16 top-8 h-8 w-8 rotate-12 text-gray-200/20" />
          <Briefcase className="absolute right-8 top-20 h-6 w-6 -rotate-12 text-gray-200/15" />
          <Store className="absolute right-24 top-32 h-7 w-7 rotate-45 text-gray-200/20" />
          <Layers className="absolute right-32 top-44 h-6 w-6 rotate-12 text-gray-200/15" />
          <Users className="absolute right-20 top-52 h-5 w-5 -rotate-45 text-gray-200/20" />
          <Award className="absolute right-12 top-60 h-6 w-6 rotate-12 text-gray-200/15" />
          <Shield className="absolute right-28 top-[280px] h-5 w-5 rotate-45 text-gray-200/20" />

          {/* Market/Trading Icons */}
          <TrendingUp className="absolute left-12 top-12 h-6 w-6 rotate-45 text-gray-200/20" />
          <BarChart3 className="absolute left-8 top-24 h-7 w-7 -rotate-12 text-gray-200/15" />
          <TrendingDown className="absolute left-20 top-36 h-5 w-5 rotate-12 text-gray-200/20" />
          <Target className="absolute left-32 top-16 h-6 w-6 text-gray-200/15" />
          <PieChart className="absolute left-24 top-28 h-6 w-6 rotate-45 text-gray-200/20" />
          <LineChart className="absolute left-12 top-40 h-5 w-5 -rotate-12 text-gray-200/15" />
          <Activity className="absolute left-36 top-48 h-6 w-6 rotate-12 text-gray-200/20" />
          <DollarSign className="absolute left-16 top-56 h-5 w-5 rotate-45 text-gray-200/15" />

          {/* AI/Tech Icons */}
          <Brain className="absolute right-32 top-6 h-7 w-7 rotate-12 text-gray-200/20" />
          <Sparkles className="absolute right-40 top-28 h-6 w-6 -rotate-45 text-gray-200/15" />
          <Zap className="absolute right-12 top-40 h-5 w-5 rotate-12 text-gray-200/20" />
          <Network className="absolute left-48 top-14 h-6 w-6 rotate-45 text-gray-200/15" />
          <Globe className="absolute left-40 top-32 h-7 w-7 -rotate-12 text-gray-200/20" />
          <Cpu className="top-18 absolute right-48 h-6 w-6 rotate-12 text-gray-200/15" />
          <Rocket className="absolute right-36 top-36 h-5 w-5 -rotate-45 text-gray-200/20" />
          <Lightbulb className="absolute left-28 top-44 h-6 w-6 rotate-45 text-gray-200/15" />
          <Code className="absolute right-44 top-52 h-5 w-5 rotate-12 text-gray-200/20" />
          <Database className="absolute left-44 top-60 h-6 w-6 -rotate-12 text-gray-200/15" />
          <Cloud className="absolute right-52 top-24 h-5 w-5 rotate-45 text-gray-200/20" />
          <Settings className="absolute right-24 top-48 h-5 w-5 rotate-12 text-gray-200/15" />
          <CheckCircle className="absolute left-52 top-56 h-6 w-6 -rotate-45 text-gray-200/20" />
          <Star className="absolute right-36 top-64 h-5 w-5 rotate-45 text-gray-200/15" />
        </div>

        <div className="relative z-10 px-4 pb-4 pt-12">
          {/* Profile & Greeting */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/20 shadow-lg ring-2 ring-white/30 backdrop-blur-md">
              {userProfilePicture ? (
                <img
                  src={userProfilePicture}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User
                  className="h-7 w-7 text-white"
                  style={{ color: "#ffffff", stroke: "#ffffff" }}
                />
              )}
            </div>
            <div>
              <h2
                className="text-xl font-bold text-white drop-shadow-sm"
                style={{ color: "#ffffff" }}
              >
                Hello, {userName}
              </h2>
              <p
                className="text-sm font-medium text-white/95"
                style={{ color: "#ffffff" }}
              >
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
              className="w-full rounded-full border-0 bg-white px-4 py-3.5 pl-4 pr-14 text-sm text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-green-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-2.5 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95">
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
            <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/30">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  My RFQs
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRFQs}
              </p>
            </div>
            <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/30">
                  <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Active Orders
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeOrders}
              </p>
            </div>
            <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/30">
                  <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Pending Quotes
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingQuotes}
              </p>
            </div>
            <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/30">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Wallet Balance
                </span>
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
                  className={`group flex flex-col items-center gap-2.5 rounded-xl p-3.5 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    feature.bgColor ||
                    "border border-gray-200 bg-white shadow-sm hover:border-green-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600"
                  }`}
                >
                  <div
                    className={`rounded-xl p-2.5 shadow-sm transition-all duration-200 group-hover:scale-110 ${
                      feature.bgColor ||
                      "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${feature.color} transition-transform duration-200`}
                    />
                  </div>
                  <span className="text-center text-xs font-semibold leading-tight text-gray-700 dark:text-gray-300">
                    {feature.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monitor RFQs Card */}
        <div className="mb-6 px-4">
          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-5 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-green-800/50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Monitor RFQ Status
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Track your RFQs and view quote responses
                </p>
                <button
                  onClick={() => router.push("/plasBusiness?tab=rfqs")}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-600 shadow-sm transition-all duration-200 hover:bg-green-50 hover:shadow-md dark:bg-gray-700 dark:text-green-400 dark:hover:bg-green-900/30"
                >
                  View All RFQs
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-md dark:from-green-800/50 dark:to-emerald-800/50">
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
            rfqs:
              expandedSection === "rfqs" && selectedRFQ
                ? [selectedRFQ, ...myRFQs]
                : myRFQs,
            rfqOpportunities:
              expandedSection === "rfq-opportunities" && selectedRFQ
                ? [selectedRFQ, ...rfqOpportunities]
                : rfqOpportunities,
            quotes: quotes,
            orders: orders,
            services: services,
            stores: stores,
            contracts: contracts,
          }}
          loading={loadingSection === expandedSection}
          businessAccount={businessAccount}
          router={router}
          initialSelectedItem={
            expandedSection === "rfqs" ||
            expandedSection === "rfq-opportunities"
              ? selectedRFQ
              : undefined
          }
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
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setIsRFQOpportunityModalOpen(false);
            setSelectedRFQOpportunity(null);
          }}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                RFQ Details
              </h3>
              <button
                onClick={() => {
                  setIsRFQOpportunityModalOpen(false);
                  setSelectedRFQOpportunity(null);
                }}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {selectedRFQOpportunity.title ||
                    `RFQ #${selectedRFQOpportunity.id?.slice(0, 8)}`}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedRFQOpportunity.description ||
                    "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRFQOpportunity.min_budget &&
                    selectedRFQOpportunity.max_budget
                      ? `${formatCurrencySync(
                          parseFloat(selectedRFQOpportunity.min_budget)
                        )} - ${formatCurrencySync(
                          parseFloat(selectedRFQOpportunity.max_budget)
                        )}`
                      : selectedRFQOpportunity.min_budget
                      ? `${formatCurrencySync(
                          parseFloat(selectedRFQOpportunity.min_budget)
                        )}+`
                      : selectedRFQOpportunity.max_budget
                      ? `Up to ${formatCurrencySync(
                          parseFloat(selectedRFQOpportunity.max_budget)
                        )}`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRFQOpportunity.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Posted By:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRFQOpportunity.business_account?.business_name ||
                      selectedRFQOpportunity.contact_name ||
                      "Unknown Business"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deadline:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRFQOpportunity.response_date
                      ? new Date(
                          selectedRFQOpportunity.response_date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
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
                    router.push(
                      `/plasBusiness/BusinessChats?supplier=${
                        selectedRFQOpportunity.business_account?.id ||
                        selectedRFQOpportunity.id
                      }`
                    );
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
