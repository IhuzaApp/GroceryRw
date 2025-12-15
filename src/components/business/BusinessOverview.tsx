"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Wallet,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface BusinessOverviewProps {
  businessAccount?: any;
}

export function BusinessOverview({ businessAccount }: BusinessOverviewProps) {
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (businessAccount?.id) {
      fetchStats();
      fetchWalletData();
      fetchTransactions();
      fetchMonthlyRevenue();
    }
  }, [businessAccount]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const thisYearStart = new Date(now.getFullYear(), 0, 1);

      // Fetch all data in parallel
      const [ordersRes, rfqsRes] = await Promise.all([
        fetch("/api/queries/business-product-orders").catch(() => {
          return null;
        }),
        fetch("/api/queries/business-rfqs").catch(() => {
          return null;
        }),
      ]);

      // Process Total Revenue and Active Orders
      // IMPORTANT: Parse JSON once and reuse the data (can't read response body twice)
      let ordersData: any = null;
      let allOrders: any[] = [];
      
      if (ordersRes?.ok) {
        try {
          ordersData = await ordersRes.json();
          allOrders = ordersData.orders || [];
        } catch (err) {
          // Error parsing orders JSON
        }
      }

      // Process Total Revenue
      let totalRevenue = 0;
      let thisMonthRevenue = 0;
      let lastMonthRevenue = 0;
      let thisYearRevenue = 0;
      let revenueChange = "0";

      if (allOrders.length > 0) {
        try {

        // Calculate revenue from completed/delivered orders
        // Check for various status values and also include orders that have been delivered
        const completedOrders = allOrders.filter((order: any) => {
          const status = (order.status || "").toLowerCase();
          const isDelivered = status === "delivered" || status === "completed" || status === "ready for pickup";
          const hasDeliveredTime = order.delivered_time && new Date(order.delivered_time) <= now;
          return isDelivered || hasDeliveredTime;
        });

        // Calculate net revenue (excluding service fee and transportation fee)
        totalRevenue = completedOrders.reduce((sum: number, order: any) => {
          const total = parseFloat(order.value || 0);
          const serviceFee = parseFloat(order.service_fee || 0);
          const transportationFee = parseFloat(order.transportation_fee || 0);
          const netAmount = total - serviceFee - transportationFee;
          return sum + netAmount;
        }, 0);

        // This month revenue (excluding fees)
        thisMonthRevenue = completedOrders
          .filter((order: any) => {
            const created = new Date(order.created_at);
            return created >= lastMonth && created <= now;
          })
          .reduce((sum: number, order: any) => {
            const total = order.value || 0;
            const serviceFee = order.service_fee || 0;
            const transportationFee = order.transportation_fee || 0;
            return sum + (total - serviceFee - transportationFee);
          }, 0);

        // Last month revenue (excluding fees)
        lastMonthRevenue = completedOrders
          .filter((order: any) => {
            const created = new Date(order.created_at);
            return created >= twoMonthsAgo && created < lastMonth;
          })
          .reduce((sum: number, order: any) => {
            const total = order.value || 0;
            const serviceFee = order.service_fee || 0;
            const transportationFee = order.transportation_fee || 0;
            return sum + (total - serviceFee - transportationFee);
          }, 0);

        // This year revenue (excluding fees)
        thisYearRevenue = completedOrders
          .filter((order: any) => {
            const created = new Date(order.created_at);
            return created >= thisYearStart && created <= now;
          })
          .reduce((sum: number, order: any) => {
            const total = order.value || 0;
            const serviceFee = order.service_fee || 0;
            const transportationFee = order.transportation_fee || 0;
            return sum + (total - serviceFee - transportationFee);
          }, 0);

          // Calculate percentage change
          if (lastMonthRevenue > 0) {
            const percentChange =
              ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
            revenueChange =
              percentChange >= 0
                ? `+${percentChange.toFixed(1)}%`
                : `${percentChange.toFixed(1)}%`;
          } else if (thisMonthRevenue > 0) {
            revenueChange = "+100%";
          } else {
            revenueChange = "0%";
          }
        } catch (err) {
          // Error processing orders data
        }
      }

      // Process Active Orders (using the same allOrders array from above)
      let activeOrders = 0;
      let pendingOrders = 0;
      let inProgressOrders = 0;
      let completedOrdersCount = 0;
      let ordersChange = "0";
      let thisMonthDelivered = 0;
      let prevMonthDelivered = 0;
      let deliveredOrdersChange = "0";

      if (allOrders.length > 0) {
        try {

        pendingOrders = allOrders.filter((order: any) => {
          const status = (order.status || "").toLowerCase();
          return (
            status === "pending" ||
            status === "ready for pickup" ||
            order.status === null ||
            (!order.delivered_time || new Date(order.delivered_time) > now)
          );
        }).length;

        inProgressOrders = allOrders.filter((order: any) => {
          const status = (order.status || "").toLowerCase();
          return (
            status === "in progress" ||
            status === "processing" ||
            status === "shopping" ||
            status === "on the way"
          );
        }).length;

        // Count only "delivered" orders (not "completed")
        completedOrdersCount = allOrders.filter((order: any) => {
          const status = (order.status || "").toLowerCase().trim();
          return status === "delivered";
        }).length;
        
        // Calculate month-over-month change for delivered orders
        thisMonthDelivered = allOrders.filter((order: any) => {
          const created = new Date(order.created_at);
          const status = (order.status || "").toLowerCase().trim();
          return (
            created >= lastMonth &&
            created <= now &&
            status === "delivered"
          );
        }).length;

        prevMonthDelivered = allOrders.filter((order: any) => {
          const created = new Date(order.created_at);
          const status = (order.status || "").toLowerCase().trim();
          return (
            created >= twoMonthsAgo &&
            created < lastMonth &&
            status === "delivered"
          );
        }).length;
        
        if (prevMonthDelivered > 0) {
          const diff = thisMonthDelivered - prevMonthDelivered;
          deliveredOrdersChange = diff >= 0 ? `+${diff}` : `${diff}`;
        } else if (thisMonthDelivered > 0) {
          deliveredOrdersChange = `+${thisMonthDelivered}`;
        } else {
          deliveredOrdersChange = "0";
        }
        
        // Active Orders = All orders that are NOT delivered (includes pending, in progress, ready for pickup, etc.)
        activeOrders = allOrders.filter((order: any) => {
          const status = (order.status || "").toLowerCase().trim();
          // Exclude only "delivered" orders
          return status !== "delivered";
        }).length;

        // Calculate change from last month (all non-delivered orders)
        const thisMonthActive = allOrders.filter((order: any) => {
          const created = new Date(order.created_at);
          const status = (order.status || "").toLowerCase().trim();
          // Count all orders that are not delivered
          return (
            created >= lastMonth &&
            created <= now &&
            status !== "delivered"
          );
        }).length;

        const prevMonthActive = allOrders.filter((order: any) => {
          const created = new Date(order.created_at);
          const status = (order.status || "").toLowerCase().trim();
          // Count all orders that are not delivered
          return (
            created >= twoMonthsAgo &&
            created < lastMonth &&
            status !== "delivered"
          );
        }).length;

          if (prevMonthActive > 0) {
            const diff = thisMonthActive - prevMonthActive;
            ordersChange = diff >= 0 ? `+${diff}` : `${diff}`;
          } else if (thisMonthActive > 0) {
            ordersChange = `+${thisMonthActive}`;
          } else {
            ordersChange = "0";
          }
        } catch (err) {
          // Error processing active orders
        }
      }

      // Process RFQ Responses
      let totalRFQResponses = 0;
      let pendingReview = 0;
      let accepted = 0;
      let rejected = 0;
      let rfqResponsesChange = "0";

      if (rfqsRes?.ok) {
        try {
          const rfqsData = await rfqsRes.json();
          const allRFQs = rfqsData.rfqs || [];

        // Fetch responses for each RFQ
        const responsePromises = allRFQs.map(async (rfq: any) => {
          try {
            const response = await fetch(
              `/api/queries/rfq-details-and-responses?rfq_id=${rfq.id}`
            );
            if (response.ok) {
              const data = await response.json();
              return data.responses || [];
            }
            return [];
          } catch {
            return [];
          }
        });

        const allResponses = (await Promise.all(responsePromises)).flat();

        totalRFQResponses = allResponses.length;
        pendingReview = allResponses.filter(
          (r: any) => !r.status || r.status === "pending"
        ).length;
        accepted = allResponses.filter(
          (r: any) => r.status?.toLowerCase() === "accepted"
        ).length;
        rejected = allResponses.filter(
          (r: any) => r.status?.toLowerCase() === "rejected"
        ).length;

        // Calculate change from last month
        const thisMonthResponses = allResponses.filter((r: any) => {
          const created = new Date(r.created_at);
          return created >= lastMonth && created <= now;
        }).length;

        const prevMonthResponses = allResponses.filter((r: any) => {
          const created = new Date(r.created_at);
          return created >= twoMonthsAgo && created < lastMonth;
        }).length;

          if (prevMonthResponses > 0) {
            const diff = thisMonthResponses - prevMonthResponses;
            rfqResponsesChange = diff >= 0 ? `+${diff}` : `${diff}`;
          } else if (thisMonthResponses > 0) {
            rfqResponsesChange = `+${thisMonthResponses}`;
          } else {
            rfqResponsesChange = "0";
          }
        } catch (err) {
          // Error processing RFQ responses
        }
      }

      setStats([
        {
          title: "Total Revenue",
          value: formatCurrencySync(totalRevenue),
          change: revenueChange,
          icon: DollarSign,
          color: "text-green-600",
          bgColor: "from-green-100 to-green-200",
          detailed: [
            { label: "This Month", value: formatCurrencySync(thisMonthRevenue) },
            { label: "Last Month", value: formatCurrencySync(lastMonthRevenue) },
            { label: "This Year", value: formatCurrencySync(thisYearRevenue) },
          ],
        },
        {
          title: "Active Orders",
          value: activeOrders.toString(),
          change: ordersChange,
          icon: ShoppingCart,
          color: "text-blue-600",
          bgColor: "from-blue-100 to-blue-200",
          detailed: [
            { label: "Pending", value: pendingOrders.toString() },
            { label: "In Progress", value: inProgressOrders.toString() },
            { label: "Completed", value: completedOrdersCount.toString() },
          ],
        },
        {
          title: "RFQ Responses",
          value: totalRFQResponses.toString(),
          change: rfqResponsesChange,
          icon: MessageSquare,
          color: "text-purple-600",
          bgColor: "from-purple-100 to-purple-200",
          detailed: [
            { label: "Pending Review", value: pendingReview.toString() },
            { label: "Accepted", value: accepted.toString() },
            { label: "Rejected", value: rejected.toString() },
          ],
        },
        {
          title: "Total Orders Completed",
          value: completedOrdersCount.toString(),
          change: deliveredOrdersChange,
          icon: ShoppingCart,
          color: "text-yellow-600",
          bgColor: "from-yellow-100 to-yellow-200",
          detailed: [
            { label: "This Month", value: thisMonthDelivered.toString() },
            { label: "Last Month", value: prevMonthDelivered.toString() },
            { label: "Total Delivered", value: completedOrdersCount.toString() },
          ],
        },
      ]);
    } catch (error) {
      // Error fetching stats
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchWalletData = async () => {
    if (!businessAccount?.id) return;
    
    setLoadingWallet(true);
    try {
      const response = await fetch(
        `/api/queries/check-business-wallet?business_id=${businessAccount.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.wallet) {
          setWalletBalance(parseFloat(data.wallet.amount || "0"));
        }
      }
    } catch (error) {
      // Error fetching wallet
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchTransactions = async () => {
    if (!businessAccount?.id) return;
    
    setLoadingTransactions(true);
    try {
      // Fetch orders to show as transactions
      const ordersRes = await fetch("/api/queries/business-product-orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const allOrders = ordersData.orders || [];
        
        // Transform orders into transactions
        // Calculate net amount: total minus service fee and transportation fee
        const transactionList = allOrders.map((order: any) => {
          const total = order.value || 0;
          const serviceFee = order.service_fee || 0;
          const transportationFee = order.transportation_fee || 0;
          const netAmount = total - serviceFee - transportationFee;
          
          return {
            id: order.id,
            type: "payment_received",
            amount: netAmount,
            description: `Payment for order ${order.orderId || order.id.substring(0, 8)}`,
            date: new Date(order.created_at).toLocaleDateString(),
            time: new Date(order.created_at).toLocaleTimeString(),
            status: order.status || "completed",
            orderId: order.id,
          };
        });
        
        setTransactions(transactionList.sort((a: any, b: any) => 
          new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
        ));
      }
    } catch (error) {
      // Error fetching transactions
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    if (!businessAccount?.id) return;
    
    try {
      const ordersRes = await fetch("/api/queries/business-product-orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const allOrders = ordersData.orders || [];
        
        // Filter completed/delivered orders and exclude transportation/service fees
        const completedOrders = allOrders.filter(
          (order: any) =>
            order.status?.toLowerCase() === "delivered" ||
            order.status?.toLowerCase() === "completed" ||
            (order.delivered_time && new Date(order.delivered_time) <= new Date())
        );
        
        // Group by month and calculate revenue (excluding transportation and service fees)
        const monthlyData: { [key: string]: number } = {};
        
        completedOrders.forEach((order: any) => {
          const date = new Date(order.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          
          // Revenue is the order total minus transportation and service fees
          const revenue = (order.value || 0) - (order.transportation_fee || 0) - (order.service_fee || 0);
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += revenue;
        });
        
        // Convert to array format for chart
        const chartData = Object.entries(monthlyData)
          .map(([key, value]) => ({
            month: new Date(key + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            revenue: value,
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        
        setMonthlyRevenue(chartData);
      }
    } catch (error) {
      // Error fetching monthly revenue
    }
  };

  const handleRequestWithdraw = async () => {
    if (!businessAccount?.id) {
      toast.error("Business account not found");
      return;
    }
    
    if (walletBalance <= 0) {
      toast.error("No funds available to withdraw");
      return;
    }
    
    // TODO: Implement withdraw API call
    toast.success("Withdrawal request submitted successfully");
  };

  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "0",
      change: "0%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "from-green-100 to-green-200",
      detailed: [
        { label: "This Month", value: "0" },
        { label: "Last Month", value: "0" },
        { label: "This Year", value: "0" },
      ],
    },
    {
      title: "Active Orders",
      value: "0",
      change: "0",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "from-blue-100 to-blue-200",
      detailed: [
        { label: "Pending", value: "0" },
        { label: "In Progress", value: "0" },
        { label: "Completed", value: "0" },
      ],
    },
    {
      title: "RFQ Responses",
      value: "0",
      change: "0",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "from-purple-100 to-purple-200",
      detailed: [
        { label: "Pending Review", value: "0" },
        { label: "Accepted", value: "0" },
        { label: "Rejected", value: "0" },
      ],
    },
    {
      title: "Total Orders Completed",
      value: "0",
      change: "0",
      icon: ShoppingCart,
      color: "text-yellow-600",
      bgColor: "from-yellow-100 to-yellow-200",
      detailed: [
        { label: "This Month", value: "0" },
        { label: "Last Month", value: "0" },
        { label: "Total Delivered", value: "0" },
      ],
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header with Toggle - Hidden on mobile */}
      <div className="hidden items-center justify-between md:flex">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Business Overview
        </h3>
        <button
          onClick={() => setShowDetailedStats(!showDetailedStats)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {showDetailedStats ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Hide Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>View Details</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Cards - Hidden on mobile */}
      <div className="hidden grid-cols-1 gap-4 sm:gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                  {stat.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  {loadingStats ? "..." : stat.value}
                </p>
                <p
                  className={`mt-1 text-xs font-medium sm:text-sm ${stat.color}`}
                >
                  {stat.change === "N/A"
                    ? "No previous data"
                    : stat.change === "0" || stat.change === "0%"
                    ? "No change from last month"
                    : `${stat.change} from last month`}
                </p>
              </div>
              <div
                className={`rounded-xl bg-gradient-to-br p-3 sm:rounded-2xl sm:p-4 ${stat.bgColor} transition-transform duration-300 group-hover:scale-110 dark:from-gray-700 dark:to-gray-600`}
              >
                <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
              </div>
            </div>

            {/* Detailed Stats (Collapsible) */}
            {showDetailedStats && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="space-y-2">
                  {stat.detailed.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {detail.label}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Wallet & Revenue Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Wallet Balance Card - VIP Credit Card Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 shadow-2xl" style={{ backgroundColor: '#000000' }}>
          {/* Decorative background elements */}
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent blur-2xl"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-xl"></div>
          
          {/* Card Content */}
          <div className="relative z-10">
            {/* Card Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 rounded bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
                <span className="text-xs font-semibold tracking-wider" style={{ color: '#facc15' }}>VIP</span>
              </div>
              <Wallet className="h-6 w-6" style={{ color: '#facc15' }} />
            </div>

            {/* Chip */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-14 rounded-md bg-gradient-to-br from-yellow-300/30 to-yellow-500/30 backdrop-blur-sm border border-yellow-400/30"></div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: '#ffffff' }}>Available Balance</p>
                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                  {loadingWallet ? (
                    <span style={{ color: '#ffffff' }}>Loading...</span>
                  ) : (
                    formatCurrencySync(walletBalance)
                  )}
                </p>
              </div>
            </div>

            {/* Card Number Pattern */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-yellow-400"></div>
              <div className="h-1 w-1 rounded-full bg-yellow-400"></div>
              <div className="h-1 w-1 rounded-full bg-yellow-400"></div>
              <div className="h-1 w-1 rounded-full bg-yellow-400"></div>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="mx-2" style={{ color: '#ffffff' }}>•</span>
              <span className="ml-auto text-xs font-mono" style={{ color: '#ffffff' }}>BUSINESS</span>
            </div>

            {/* Card Footer */}
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs" style={{ color: '#ffffff' }}>Card Holder</p>
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Business Account</p>
              </div>
              <button
                onClick={handleRequestWithdraw}
                disabled={walletBalance <= 0 || loadingWallet}
                className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 text-xs font-semibold text-black transition-all hover:from-yellow-400 hover:to-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-yellow-500 disabled:hover:to-yellow-600"
              >
                <ArrowUpRight className="mr-1 inline h-3 w-3" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Revenue
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Revenue by month (excluding fees)
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => formatCurrencySync(value).replace(/[^\d.]/g, "")}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrencySync(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-gray-500 dark:text-gray-400">
              No revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction History
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Payments received and products bought from your stores
          </p>
        </div>
        {loadingTransactions ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date} at {transaction.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrencySync(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No transactions yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
