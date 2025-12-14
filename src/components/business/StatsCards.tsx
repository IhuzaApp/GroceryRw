"use client";

import { useEffect, useState } from "react";
import { FileText, ShoppingCart, Store, Package } from "lucide-react";

interface StatData {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

interface StatsCardsProps {
  className?: string;
}

export function StatsCards({ className = "" }: StatsCardsProps) {
  const [stats, setStats] = useState<StatData[]>([
    {
      title: "Active RFQs",
      value: 0,
      change: "0",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Pending Orders",
      value: 0,
      change: "0",
      icon: ShoppingCart,
      color: "text-orange-600",
    },
    {
      title: "Total Stores",
      value: 0,
      change: "0",
      icon: Store,
      color: "text-green-600",
    },
    {
      title: "Services",
      value: 0,
      change: "0",
      icon: Package,
      color: "text-purple-600",
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [rfqsRes, ordersRes, storesRes, servicesRes] = await Promise.all([
          fetch("/api/queries/business-rfqs").catch((err) => {
            console.error("Error fetching RFQs:", err);
            return null;
          }),
          fetch("/api/queries/business-product-orders").catch((err) => {
            console.error("Error fetching orders:", err);
            return null;
          }),
          fetch("/api/queries/business-stores").catch((err) => {
            console.error("Error fetching stores:", err);
            return null;
          }),
          fetch("/api/queries/business-services").catch((err) => {
            console.error("Error fetching services:", err);
            return null;
          }),
        ]);

        // Get current time once for all calculations
        const now = new Date();
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Process Active RFQs
        let activeRFQs = 0;
        let rfqsChange = "0";
        if (rfqsRes?.ok) {
          try {
            const rfqsData = await rfqsRes.json();
            console.log("RFQs data:", rfqsData);
            const allRFQs = rfqsData.rfqs || [];
            console.log("Total RFQs found:", allRFQs.length);
            
            // Filter for active RFQs - those with response_date in the future or open field is true
            activeRFQs = allRFQs.filter((rfq: any) => {
              if (rfq.open === true) return true;
              if (rfq.open === false) return false;
              // If open field is not available, check response_date
              if (rfq.response_date) {
                const responseDate = new Date(rfq.response_date);
                return responseDate > now;
              }
              // If no response_date, consider it active
              return true;
            }).length;
            
            console.log("Active RFQs:", activeRFQs);
            
            // Calculate change from last month (RFQs created in last 30 days vs previous 30 days)
            const thisMonth = allRFQs.filter((rfq: any) => {
              const created = new Date(rfq.created_at);
              return created >= lastMonth && created <= now;
            }).length;
            
            const prevMonth = allRFQs.filter((rfq: any) => {
              const created = new Date(rfq.created_at);
              return created >= twoMonthsAgo && created < lastMonth;
            }).length;
            
            if (prevMonth > 0) {
              const diff = thisMonth - prevMonth;
              rfqsChange = diff >= 0 ? `+${diff}` : `${diff}`;
            } else if (thisMonth > 0) {
              rfqsChange = `+${thisMonth}`;
            } else {
              rfqsChange = "0";
            }
          } catch (err) {
            console.error("Error processing RFQs data:", err);
          }
        } else {
          console.warn("RFQs API response not OK:", rfqsRes?.status, rfqsRes?.statusText);
        }

        // Process Pending Orders
        let pendingOrders = 0;
        let ordersChange = "0";
        if (ordersRes?.ok) {
          try {
            const ordersData = await ordersRes.json();
            console.log("Orders data:", ordersData);
            const allOrders = ordersData.orders || [];
            console.log("Total orders found:", allOrders.length);
            
            // Filter for pending orders
            pendingOrders = allOrders.filter(
              (order: any) =>
                order.status?.toLowerCase() === "pending" ||
                order.status === null ||
                !order.delivered_time ||
                new Date(order.delivered_time) > now
            ).length;
            
            console.log("Pending orders:", pendingOrders);
            
            // Calculate change from last month
            const thisMonthPending = allOrders.filter((order: any) => {
              const created = new Date(order.created_at);
              return (
                created >= lastMonth &&
                created <= now &&
                (order.status?.toLowerCase() === "pending" ||
                  order.status === null ||
                  !order.delivered_time ||
                  new Date(order.delivered_time) > now)
              );
            }).length;
            
            const prevMonthPending = allOrders.filter((order: any) => {
              const created = new Date(order.created_at);
              return (
                created >= twoMonthsAgo &&
                created < lastMonth &&
                (order.status?.toLowerCase() === "pending" ||
                  order.status === null ||
                  !order.delivered_time ||
                  new Date(order.delivered_time) > now)
              );
            }).length;
            
            if (prevMonthPending > 0) {
              const diff = thisMonthPending - prevMonthPending;
              ordersChange = diff >= 0 ? `+${diff}` : `${diff}`;
            } else if (thisMonthPending > 0) {
              ordersChange = `+${thisMonthPending}`;
            } else {
              ordersChange = "0";
            }
          } catch (err) {
            console.error("Error processing orders data:", err);
          }
        } else {
          console.warn("Orders API response not OK:", ordersRes?.status, ordersRes?.statusText);
        }

        // Process Total Stores
        let totalStores = 0;
        let storesChange = "0";
        if (storesRes?.ok) {
          try {
            const storesData = await storesRes.json();
            console.log("Stores data:", storesData);
            totalStores = (storesData.stores || []).length;
            console.log("Total stores:", totalStores);
            
            // Calculate change from last month
            const thisMonthStores = (storesData.stores || []).filter((store: any) => {
              const created = new Date(store.created_at);
              return created >= lastMonth && created <= now;
            }).length;
            
            const prevMonthStores = (storesData.stores || []).filter((store: any) => {
              const created = new Date(store.created_at);
              return created >= twoMonthsAgo && created < lastMonth;
            }).length;
            
            if (prevMonthStores > 0) {
              const diff = thisMonthStores - prevMonthStores;
              storesChange = diff >= 0 ? `+${diff}` : `${diff}`;
            } else if (thisMonthStores > 0) {
              storesChange = `+${thisMonthStores}`;
            } else {
              storesChange = "0";
            }
          } catch (err) {
            console.error("Error processing stores data:", err);
          }
        } else {
          console.warn("Stores API response not OK:", storesRes?.status, storesRes?.statusText);
        }

        // Process Services
        let servicesCount = 0;
        let servicesChange = "0";
        if (servicesRes?.ok) {
          try {
            const servicesData = await servicesRes.json();
            console.log("Services data:", servicesData);
            servicesCount = (servicesData.services || []).length;
            console.log("Total services:", servicesCount);
            
            // Calculate change from last month
            const thisMonthServices = (servicesData.services || []).filter(
              (service: any) => {
                const created = new Date(service.created_at);
                return created >= lastMonth && created <= now;
              }
            ).length;
            
            const prevMonthServices = (servicesData.services || []).filter(
              (service: any) => {
                const created = new Date(service.created_at);
                return created >= twoMonthsAgo && created < lastMonth;
              }
            ).length;
            
            if (prevMonthServices > 0) {
              const diff = thisMonthServices - prevMonthServices;
              servicesChange = diff >= 0 ? `+${diff}` : `${diff}`;
            } else if (thisMonthServices > 0) {
              servicesChange = `+${thisMonthServices}`;
            } else {
              servicesChange = "0";
            }
          } catch (err) {
            console.error("Error processing services data:", err);
          }
        } else {
          console.warn("Services API response not OK:", servicesRes?.status, servicesRes?.statusText);
        }

        setStats([
          {
            title: "Active RFQs",
            value: activeRFQs,
            change: rfqsChange,
            icon: FileText,
            color: "text-blue-600",
          },
          {
            title: "Pending Orders",
            value: pendingOrders,
            change: ordersChange,
            icon: ShoppingCart,
            color: "text-orange-600",
          },
          {
            title: "Total Stores",
            value: totalStores,
            change: storesChange,
            icon: Store,
            color: "text-green-600",
          },
          {
            title: "Services",
            value: servicesCount,
            change: servicesChange,
            icon: Package,
            color: "text-purple-600",
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : stat.value}
              </p>
              <p className={`text-sm font-medium ${stat.color}`}>
                {stat.change === "0"
                  ? "No change from last month"
                  : `${stat.change} from last month`}
              </p>
            </div>
            <div
              className={`rounded-2xl bg-gradient-to-br p-4 ${stat.color
                .replace("text-", "from-")
                .replace("-600", "-100")} to-${stat.color
                .replace("text-", "")
                .replace(
                  "-600",
                  "-200"
                )} transition-transform duration-300 group-hover:scale-110 dark:from-gray-700 dark:to-gray-600`}
            >
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
          {/* Subtle gradient overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-700/20"></div>
        </div>
      ))}
    </div>
  );
}
