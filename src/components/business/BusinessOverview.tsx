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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { RequestWithdrawModal } from "./RequestWithdrawModal";

// Helper function to format currency with abbreviations
const formatCurrencyAbbreviated = (
  amount: number,
  threshold: number = 10000
) => {
  // If below threshold, use normal formatting
  if (amount < threshold) {
    return formatCurrencySync(amount);
  }

  // Format with abbreviations
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `RF ${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
  } else if (amount >= 1000) {
    const thousands = amount / 1000;
    // Show 1 decimal if less than 100k, otherwise no decimal
    return `RF ${thousands.toFixed(thousands >= 100 ? 0 : 1)}k`;
  }

  return formatCurrencySync(amount);
};

interface BusinessOverviewProps {
  businessAccount?: any;
}

export function BusinessOverview({ businessAccount }: BusinessOverviewProps) {
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [businessWalletId, setBusinessWalletId] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [clientsByGender, setClientsByGender] = useState<
    { name: string; value: number; fill?: string }[]
  >([]);
  const [topItemsSold, setTopItemsSold] = useState<
    { name: string; quantity: number; fill?: string }[]
  >([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [orderStatusCounts, setOrderStatusCounts] = useState<{
    pending: number;
    delivered: number;
    on_the_way: number;
    accepted: number;
    [key: string]: number;
  }>({ pending: 0, delivered: 0, on_the_way: 0, accepted: 0 });
  const [deliveryTimingCounts, setDeliveryTimingCounts] = useState<{
    deliveredOnTime: number;
    deliveredLate: number;
    pendingDelayed: number;
    pendingOnTime: number;
  }>({
    deliveredOnTime: 0,
    deliveredLate: 0,
    pendingDelayed: 0,
    pendingOnTime: 0,
  });
  const [monthlyOrderCounts, setMonthlyOrderCounts] = useState<
    Record<string, number>
  >({});
  const [selectedOrdersYear, setSelectedOrdersYear] = useState<number>(
    () => new Date().getFullYear()
  );
  const [rfqResponsesByYearTrend, setRfqResponsesByYearTrend] = useState<
    { year: string; count: number }[]
  >([]);
  const [ordersByStore, setOrdersByStore] = useState<
    { store: string; count: number; fill?: string }[]
  >([]);
  const [loadingRfqTrend, setLoadingRfqTrend] = useState(true);

  useEffect(() => {
    if (businessAccount?.id) {
      fetchStats();
      fetchWalletData();
      fetchTransactions();
      fetchMonthlyRevenue();
      fetchRfqResponsesTrend();
    }
  }, [businessAccount]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const thisYearStart = new Date(now.getFullYear(), 0, 1);

      // Fetch all data in parallel (orders, RFQs, contracts for revenue)
      const [ordersRes, rfqsRes, contractsRes] = await Promise.all([
        fetch("/api/queries/business-product-orders").catch(() => null),
        fetch("/api/queries/business-rfqs").catch(() => null),
        fetch("/api/queries/business-contracts").catch(() => null),
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
            const isDelivered =
              status === "delivered" ||
              status === "completed" ||
              status === "ready for pickup";
            const hasDeliveredTime =
              order.delivered_time && new Date(order.delivered_time) <= now;
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

          // Add revenue from completed RFQ contracts (business as supplier)
          if (contractsRes?.ok) {
            try {
              const contractsData = await contractsRes.json();
              const contractsList = contractsData.contracts || [];
              const completedSupplierContracts = contractsList.filter(
                (c: any) =>
                  (c.status || "").toLowerCase() === "completed" &&
                  c.role === "supplier"
              );
              completedSupplierContracts.forEach((c: any) => {
                const val = Number(c.totalValue) || 0;
                totalRevenue += val;
                const doneAt = c.done_at || c.updated_at || c.created_at;
                if (doneAt) {
                  const d = new Date(doneAt);
                  if (d >= thisYearStart && d <= now) thisYearRevenue += val;
                  if (d >= lastMonth && d <= now) thisMonthRevenue += val;
                  if (d >= twoMonthsAgo && d < lastMonth)
                    lastMonthRevenue += val;
                }
              });
            } catch (_) {
              // ignore contract parse errors
            }
          }

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
              !order.delivered_time ||
              new Date(order.delivered_time) > now
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
              created >= lastMonth && created <= now && status === "delivered"
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
              created >= lastMonth && created <= now && status !== "delivered"
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
          value: totalRevenue, // Store as number for responsive formatting
          change: revenueChange,
          icon: DollarSign,
          color: "text-green-600",
          bgColor: "from-green-100 to-green-200",
          detailed: [
            {
              label: "This Month",
              value:
                typeof thisMonthRevenue === "number"
                  ? formatCurrencyAbbreviated(thisMonthRevenue, 10000)
                  : formatCurrencySync(thisMonthRevenue),
            },
            {
              label: "Last Month",
              value:
                typeof lastMonthRevenue === "number"
                  ? formatCurrencyAbbreviated(lastMonthRevenue, 10000)
                  : formatCurrencySync(lastMonthRevenue),
            },
            {
              label: "This Year",
              value:
                typeof thisYearRevenue === "number"
                  ? formatCurrencyAbbreviated(thisYearRevenue, 10000)
                  : formatCurrencySync(thisYearRevenue),
            },
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
          title: "Total Orders",
          value: completedOrdersCount.toString(),
          change: deliveredOrdersChange,
          icon: ShoppingCart,
          color: "text-yellow-600",
          bgColor: "from-yellow-100 to-yellow-200",
          detailed: [
            { label: "This Month", value: thisMonthDelivered.toString() },
            { label: "Last Month", value: prevMonthDelivered.toString() },
            {
              label: "Total Delivered",
              value: completedOrdersCount.toString(),
            },
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
          setBusinessWalletId(data.wallet.id || null);
        } else {
          setBusinessWalletId(null);
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
    setLoadingCharts(true);
    try {
      const [txRes, ordersRes] = await Promise.all([
        fetch(
          `/api/queries/business-transactions?business_id=${businessAccount.id}`
        ).catch(() => null),
        fetch("/api/queries/business-product-orders").catch(() => null),
      ]);

      let allOrders: any[] = [];
      if (ordersRes?.ok) {
        const ordersData = await ordersRes.json();
        allOrders = ordersData.orders || [];
      }

      let usedTxApi = false;
      // Prefer businessTransactions API when available (aligns with wallet)
      if (txRes?.ok) {
        const txData = await txRes.json();
        const txList = txData.transactions || [];
        if (txList.length > 0) {
          usedTxApi = true;
          const mapped = txList.map((t: any) => {
            const createdAt = t.created_at
              ? new Date(t.created_at)
              : new Date();
            const desc = t.description || "Credit";
            const amountMatch = desc.match(
              /Amount credited to wallet:\s*([\d,.\s]+)/i
            );
            const amount = amountMatch
              ? parseFloat(amountMatch[1].replace(/\s|,/g, "")) || 0
              : 0;
            return {
              id: t.id,
              type: t.action || "credit",
              amount,
              description: desc.split(" | ")[0] || desc,
              date: createdAt.toLocaleDateString(),
              time: createdAt.toLocaleTimeString(),
              status: t.status || "completed",
              orderId: t.related_order,
            };
          });
          setTransactions(
            mapped.sort(
              (a: any, b: any) =>
                new Date(b.date + " " + b.time).getTime() -
                new Date(a.date + " " + a.time).getTime()
            )
          );
        }
      }

      if (!usedTxApi) {
        const transactionList = allOrders.map((order: any) => {
          const total = order.value || 0;
          const serviceFee = order.service_fee || 0;
          const transportationFee = order.transportation_fee || 0;
          const netAmount = total - serviceFee - transportationFee;
          return {
            id: order.id,
            type: "payment_received",
            amount: netAmount,
            description: `Payment for order ${
              order.orderId || order.id.substring(0, 8)
            }`,
            date: new Date(order.created_at).toLocaleDateString(),
            time: new Date(order.created_at).toLocaleTimeString(),
            status: order.status || "completed",
            orderId: order.id,
          };
        });
        setTransactions(
          transactionList.sort(
            (a: any, b: any) =>
              new Date(b.date + " " + b.time).getTime() -
              new Date(a.date + " " + a.time).getTime()
          )
        );
      }

      // Clients by gender (unique orderers from delivered/any orders)
      const genderCount: Record<string, number> = {};
      const seenUsers = new Set<string>();
      allOrders.forEach((order: any) => {
        const user = order.orderedBy;
        if (!user?.id) return;
        if (seenUsers.has(user.id)) return;
        seenUsers.add(user.id);
        const g = (user.gender || "unknown").toLowerCase() || "unknown";
        genderCount[g] = (genderCount[g] || 0) + 1;
      });
      const genderColors: Record<string, string> = {
        male: "#3b82f6",
        female: "#ec4899",
        other: "#8b5cf6",
        unknown: "#6b7280",
      };
      setClientsByGender(
        Object.entries(genderCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          fill: genderColors[name] || "#6b7280",
        }))
      );

      // Top items/services sold (from allProducts across orders)
      const itemCount: Record<string, number> = {};
      allOrders.forEach((order: any) => {
        const products = Array.isArray(order.allProducts)
          ? order.allProducts
          : [];
        products.forEach((p: any) => {
          const name = p.name || "Unknown item";
          const qty = Number(p.quantity) || 1;
          itemCount[name] = (itemCount[name] || 0) + qty;
        });
      });
      const barColors = [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
      ];
      setTopItemsSold(
        Object.entries(itemCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, quantity], i) => ({
            name: name.length > 20 ? name.slice(0, 20) + "…" : name,
            quantity,
            fill: barColors[i % barColors.length],
          }))
      );

      // Plasa business orders: by status (pending, delivered, on_the_way, accepted, etc.)
      const statusCounts: Record<string, number> = {
        pending: 0,
        delivered: 0,
        on_the_way: 0,
        accepted: 0,
      };
      const now = new Date();
      allOrders.forEach((order: any) => {
        const s = (order.status || "").toLowerCase().trim().replace(/\s+/g, "_");
        if (s === "delivered") statusCounts.delivered += 1;
        else if (s === "on_the_way" || s === "on the way") statusCounts.on_the_way += 1;
        else if (s === "accepted") statusCounts.accepted += 1;
        else if (s === "pending" || s === "ready_for_pickup" || s === "in_progress" || s === "processing" || s === "shopping" || !s) statusCounts.pending += 1;
        else statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      setOrderStatusCounts(statusCounts as typeof orderStatusCounts);

      // Delivery timing: delivered on time, delivered late, pending delayed, pending on time
      let deliveredOnTime = 0;
      let deliveredLate = 0;
      let pendingDelayed = 0;
      let pendingOnTime = 0;
      allOrders.forEach((order: any) => {
        const status = (order.status || "").toLowerCase().trim();
        const isDelivered = status === "delivered";
        const expectedAt = order.delivered_time
          ? new Date(order.delivered_time)
          : (() => {
              const d = new Date(order.created_at);
              d.setDate(d.getDate() + 1);
              return d;
            })();
        if (isDelivered) {
          deliveredOnTime += 1;
        } else {
          if (expectedAt < now) pendingDelayed += 1;
          else pendingOnTime += 1;
        }
      });
      setDeliveryTimingCounts({
        deliveredOnTime,
        deliveredLate,
        pendingDelayed,
        pendingOnTime,
      });

      // Incoming orders by month (YYYY-MM) for monthly trend + year switch
      const byMonth: Record<string, number> = {};
      allOrders.forEach((order: any) => {
        const d = new Date(order.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth[key] = (byMonth[key] || 0) + 1;
      });
      setMonthlyOrderCounts(byMonth);

      // Orders per store (for bar chart)
      const storeCounts: Record<string, number> = {};
      allOrders.forEach((order: any) => {
        const store = order.store || "Unknown store";
        storeCounts[store] = (storeCounts[store] || 0) + 1;
      });
      const storeBarColors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
      setOrdersByStore(
        Object.entries(storeCounts)
          .map(([store, count], i) => ({
            store: store.length > 18 ? store.slice(0, 18) + "…" : store,
            count,
            fill: storeBarColors[i % storeBarColors.length],
          }))
          .sort((a, b) => b.count - a.count)
      );
    } catch (error) {
      // Error fetching transactions
    } finally {
      setLoadingTransactions(false);
      setLoadingCharts(false);
    }
  };

  const fetchRfqResponsesTrend = async () => {
    if (!businessAccount?.id) return;
    setLoadingRfqTrend(true);
    try {
      const rfqsRes = await fetch("/api/queries/business-rfqs").catch(() => null);
      if (!rfqsRes?.ok) {
        setRfqResponsesByYearTrend([]);
        return;
      }
      const rfqsData = await rfqsRes.json();
      const rfqs = rfqsData.rfqs || [];
      if (rfqs.length === 0) {
        setRfqResponsesByYearTrend([]);
        return;
      }
      const responsePromises = rfqs.map((rfq: any) =>
        fetch(`/api/queries/rfq-details-and-responses?rfq_id=${rfq.id}`).then((r) =>
          r.ok ? r.json() : { responses: [] }
        )
      );
      const results = await Promise.all(responsePromises);
      const yearCounts: Record<string, number> = {};
      results.forEach((data: any) => {
        const responses = data.responses || [];
        responses.forEach((r: any) => {
          if (r.created_at) {
            const y = new Date(r.created_at).getFullYear().toString();
            yearCounts[y] = (yearCounts[y] || 0) + 1;
          }
        });
      });
      setRfqResponsesByYearTrend(
        Object.entries(yearCounts)
          .map(([year, count]) => ({ year, count }))
          .sort((a, b) => a.year.localeCompare(b.year))
      );
    } catch (_) {
      setRfqResponsesByYearTrend([]);
    } finally {
      setLoadingRfqTrend(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    if (!businessAccount?.id) return;

    try {
      const [ordersRes, contractsRes] = await Promise.all([
        fetch("/api/queries/business-product-orders"),
        fetch("/api/queries/business-contracts").catch(() => null),
      ]);

      const monthlyData: { [key: string]: number } = {};

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const allOrders = ordersData.orders || [];
        const deliveredOrders = allOrders.filter((order: any) => {
          const status = (order.status || "").toLowerCase().trim();
          return status === "delivered";
        });

        deliveredOrders.forEach((order: any) => {
          const date = new Date(order.created_at);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          const total = parseFloat(order.value || 0);
          const serviceFee = parseFloat(order.service_fee || 0);
          const transportationFee = parseFloat(order.transportation_fee || 0);
          const netRevenue = total - serviceFee - transportationFee;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + netRevenue;
        });
      }

      // Add RFQ completed contracts revenue (business as supplier) by month
      if (contractsRes?.ok) {
        try {
          const contractsData = await contractsRes.json();
          const contractsList = contractsData.contracts || [];
          contractsList
            .filter(
              (c: any) =>
                (c.status || "").toLowerCase() === "completed" &&
                c.role === "supplier"
            )
            .forEach((c: any) => {
              const doneAt = c.done_at || c.updated_at || c.created_at;
              if (!doneAt) return;
              const d = new Date(doneAt);
              const monthKey = `${d.getFullYear()}-${String(
                d.getMonth() + 1
              ).padStart(2, "0")}`;
              const val = Number(c.totalValue) || 0;
              monthlyData[monthKey] = (monthlyData[monthKey] || 0) + val;
            });
        } catch (_) {}
      }

      const chartData = Object.entries(monthlyData)
        .map(([key, value]) => ({
          month: new Date(key + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          revenue: value,
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );
      setMonthlyRevenue(chartData);
    } catch (error) {
      // Error fetching monthly revenue
    }
  };

  const handleRequestWithdraw = () => {
    if (!businessAccount?.id) {
      toast.error("Business account not found");
      return;
    }
    if (!businessWalletId) {
      toast.error("Wallet not found");
      return;
    }
    if (walletBalance <= 0) {
      toast.error("No funds available to withdraw");
      return;
    }
    setShowWithdrawModal(true);
  };

  const handleSubmitWithdraw = async (payload: {
    amount: number;
    verificationImage: string;
    otp: string;
  }) => {
    if (!businessAccount?.id || !businessWalletId) {
      throw new Error("Business or wallet not found");
    }
    const response = await fetch("/api/mutations/request-withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: String(payload.amount),
        business_id: businessAccount.id,
        businessWallet_id: businessWalletId,
        phoneNumber: businessAccount.businessPhone || "",
        verification_image: payload.verificationImage,
        otp: payload.otp,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to submit request");
    }
    fetchWalletData();
  };

  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: 0, // Store as number for responsive formatting
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
      title: "Total Orders",
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                  {loadingStats ? (
                    "..."
                  ) : stat.title === "Total Revenue" ? (
                    <>
                      <span className="md:hidden">
                        {typeof stat.value === "number"
                          ? formatCurrencyAbbreviated(stat.value, 10000)
                          : stat.value}
                      </span>
                      <span className="hidden md:inline">
                        {typeof stat.value === "number"
                          ? formatCurrencyAbbreviated(stat.value, 100000)
                          : stat.value}
                      </span>
                    </>
                  ) : (
                    stat.value
                  )}
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
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 shadow-2xl"
          style={{ backgroundColor: "#000000" }}
        >
          {/* Decorative background elements */}
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent blur-2xl"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-xl"></div>

          {/* Card Content */}
          <div className="relative z-10">
            {/* Card Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 rounded bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
                <span
                  className="text-xs font-semibold tracking-wider"
                  style={{ color: "#facc15" }}
                >
                  VIP
                </span>
              </div>
              <Wallet className="h-6 w-6" style={{ color: "#facc15" }} />
            </div>

            {/* Chip */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-14 rounded-md border border-yellow-400/30 bg-gradient-to-br from-yellow-300/30 to-yellow-500/30 backdrop-blur-sm"></div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: "#ffffff" }}>
                  Available Balance
                </p>
                <p className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                  {loadingWallet ? (
                    <span style={{ color: "#ffffff" }}>Loading...</span>
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
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span className="mx-2" style={{ color: "#ffffff" }}>
                •
              </span>
              <span
                className="ml-auto font-mono text-xs"
                style={{ color: "#ffffff" }}
              >
                BUSINESS
              </span>
            </div>

            {/* Card Footer */}
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs" style={{ color: "#ffffff" }}>
                  Card Holder
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#ffffff" }}
                >
                  Business Account
                </p>
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

        <RequestWithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          walletBalance={walletBalance}
          onSubmit={handleSubmitWithdraw}
        />

        {/* Monthly Revenue Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Revenue
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Carts (delivered orders) + completed RFQ contracts · Excluding fees
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
                  tickFormatter={(value) =>
                    formatCurrencySync(value).replace(/[^\d.]/g, "")
                  }
                />
                <Tooltip
                  formatter={(value: any) => formatCurrencySync(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
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

      {/* Two cols: left = Orders by status + Delivery timing; right = Transaction History (charts hidden on mobile) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Orders by status + Delivery timing – desktop only */}
        <div className="hidden space-y-6 lg:block">
          {/* Orders by status (Plasa business orders) – chart */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Orders by status
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Plasa business orders
              </p>
            </div>
            {loadingTransactions ? (
              <div className="flex h-[220px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              </div>
            ) : (() => {
              const statusChartData = [
                { name: "Pending", value: orderStatusCounts.pending ?? 0, fill: "#f59e0b" },
                { name: "Delivered", value: orderStatusCounts.delivered ?? 0, fill: "#10b981" },
                { name: "On the way", value: orderStatusCounts.on_the_way ?? 0, fill: "#3b82f6" },
                { name: "Accepted", value: orderStatusCounts.accepted ?? 0, fill: "#059669" },
                ...Object.entries(orderStatusCounts)
                  .filter(([k]) => !["pending", "delivered", "on_the_way", "accepted"].includes(k) && (orderStatusCounts[k] ?? 0) > 0)
                  .map(([key, value]) => ({ name: key.replace(/_/g, " "), value: value as number, fill: "#6b7280" })),
              ].filter((d) => d.value > 0);
              return statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, "Orders"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-gray-500 dark:text-gray-400">
                  No orders yet
                </div>
              );
            })()}
          </div>

          {/* Delivery timing – chart */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delivery timing
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Plasa business orders · on time vs late vs delayed
              </p>
            </div>
            {loadingTransactions ? (
              <div className="flex h-[220px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              </div>
            ) : (() => {
              const timingChartData = [
                { name: "Delivered on time", value: deliveryTimingCounts.deliveredOnTime, fill: "#10b981" },
                { name: "Delivered late", value: deliveryTimingCounts.deliveredLate, fill: "#ef4444" },
                { name: "Pending delayed", value: deliveryTimingCounts.pendingDelayed, fill: "#f59e0b" },
                { name: "Pending on time", value: deliveryTimingCounts.pendingOnTime, fill: "#0ea5e9" },
              ].filter((d) => d.value > 0);
              return timingChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={timingChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {timingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, "Orders"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-gray-500 dark:text-gray-400">
                  No orders yet
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right column: Transaction History */}
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
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                  <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
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

      {/* Clients by gender & Top items/services sold – desktop only */}
      <div className="hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Clients by gender
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Unique customers who placed orders
            </p>
          </div>
          {loadingCharts ? (
            <div className="flex h-[240px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : clientsByGender.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={clientsByGender}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {clientsByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} clients`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-gray-500 dark:text-gray-400">
              No client data yet
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Items & services most sold
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Top 10 by quantity ordered
            </p>
          </div>
          {loadingCharts ? (
            <div className="flex h-[240px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : topItemsSold.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topItemsSold}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" style={{ fontSize: "12px" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="quantity" name="Quantity" radius={[0, 4, 4, 0]}>
                  {topItemsSold.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-gray-500 dark:text-gray-400">
              No items sold yet
            </div>
          )}
        </div>
      </div>

      {/* Annual trend: incoming orders + RFQ responses; Orders per store – desktop only */}
      <div className="hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-3">
        {/* Incoming orders monthly (Jan–Dec) with year switch */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Incoming orders (monthly)
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Jan–Dec for selected year
              </p>
            </div>
            <select
              value={selectedOrdersYear}
              onChange={(e) => setSelectedOrdersYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              {(() => {
                const years = Object.keys(monthlyOrderCounts)
                  .map((k) => parseInt(k.split("-")[0], 10))
                  .filter((y, i, a) => a.indexOf(y) === i)
                  .sort((a, b) => b - a);
                const currentYear = new Date().getFullYear();
                const yearSet = new Set(years);
                if (!yearSet.has(currentYear)) years.unshift(currentYear);
                if (years.length === 0) years.push(currentYear);
                return years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ));
              })()}
            </select>
          </div>
          {loadingCharts ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={(() => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return monthNames.map((name, i) => {
                    const mm = String(i + 1).padStart(2, "0");
                    const key = `${selectedOrdersYear}-${mm}`;
                    return {
                      month: name,
                      count: monthlyOrderCounts[key] ?? 0,
                    };
                  });
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Orders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quotations (responses to my RFQs) annually – line trend */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              RFQ quotations (annual)
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Responses to my RFQs by year
            </p>
          </div>
          {loadingRfqTrend ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : rfqResponsesByYearTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rfqResponsesByYearTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Quotations"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-gray-500 dark:text-gray-400">
              No quotations yet
            </div>
          )}
        </div>

        {/* Orders per store – line chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Orders per store
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Business orders by store
            </p>
          </div>
          {loadingCharts ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : ordersByStore.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={ordersByStore}
                margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="store"
                  angle={-35}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 10 }}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Orders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-gray-500 dark:text-gray-400">
              No orders yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
