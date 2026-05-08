"use client";

import { useMemo } from "react";
import { FileText, ShoppingCart, Store, Package } from "lucide-react";
import { usePortalCache } from "../../context/PortalCacheContext";

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
  // ── Read from the shared portal cache (already fetched by PortalCacheProvider) ──
  const { rfqs, orders, stores, services } = usePortalCache();

  const loading =
    rfqs.isLoading ||
    orders.isLoading ||
    stores.isLoading ||
    services.isLoading;

  const stats: StatData[] = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // ── Active RFQs ────────────────────────────────────────────────────────
    const allRFQs = rfqs.data ?? [];
    const activeRFQs = allRFQs.filter((rfq: any) => {
      if (rfq.open === true) return true;
      if (rfq.open === false) return false;
      if (rfq.response_date) return new Date(rfq.response_date) > now;
      return true;
    }).length;
    const thisMonthRfqs = allRFQs.filter((r: any) => {
      const d = new Date(r.created_at);
      return d >= lastMonth && d <= now;
    }).length;
    const prevMonthRfqs = allRFQs.filter((r: any) => {
      const d = new Date(r.created_at);
      return d >= twoMonthsAgo && d < lastMonth;
    }).length;
    const rfqsChange =
      prevMonthRfqs > 0
        ? `${thisMonthRfqs - prevMonthRfqs >= 0 ? "+" : ""}${
            thisMonthRfqs - prevMonthRfqs
          }`
        : thisMonthRfqs > 0
        ? `+${thisMonthRfqs}`
        : "0";

    // ── Pending Orders ─────────────────────────────────────────────────────
    const allOrders = orders.data ?? [];
    const pendingOrders = allOrders.filter(
      (o: any) =>
        o.status?.toLowerCase() === "pending" ||
        o.status === null ||
        !o.delivered_time ||
        new Date(o.delivered_time) > now
    ).length;
    const thisMonthPending = allOrders.filter((o: any) => {
      const d = new Date(o.created_at);
      return (
        d >= lastMonth &&
        d <= now &&
        (o.status?.toLowerCase() === "pending" ||
          o.status === null ||
          !o.delivered_time ||
          new Date(o.delivered_time) > now)
      );
    }).length;
    const prevMonthPending = allOrders.filter((o: any) => {
      const d = new Date(o.created_at);
      return (
        d >= twoMonthsAgo &&
        d < lastMonth &&
        (o.status?.toLowerCase() === "pending" ||
          o.status === null ||
          !o.delivered_time ||
          new Date(o.delivered_time) > now)
      );
    }).length;
    const ordersChange =
      prevMonthPending > 0
        ? `${thisMonthPending - prevMonthPending >= 0 ? "+" : ""}${
            thisMonthPending - prevMonthPending
          }`
        : thisMonthPending > 0
        ? `+${thisMonthPending}`
        : "0";

    // ── Stores ─────────────────────────────────────────────────────────────
    const allStores = stores.data ?? [];
    const totalStores = allStores.length;
    const thisMonthStores = allStores.filter((s: any) => {
      const d = new Date(s.created_at);
      return d >= lastMonth && d <= now;
    }).length;
    const prevMonthStores = allStores.filter((s: any) => {
      const d = new Date(s.created_at);
      return d >= twoMonthsAgo && d < lastMonth;
    }).length;
    const storesChange =
      prevMonthStores > 0
        ? `${thisMonthStores - prevMonthStores >= 0 ? "+" : ""}${
            thisMonthStores - prevMonthStores
          }`
        : thisMonthStores > 0
        ? `+${thisMonthStores}`
        : "0";

    // ── Services ───────────────────────────────────────────────────────────
    const allServices = services.data ?? [];
    const servicesCount = allServices.length;
    const thisMonthServices = allServices.filter((s: any) => {
      const d = new Date(s.created_at);
      return d >= lastMonth && d <= now;
    }).length;
    const prevMonthServices = allServices.filter((s: any) => {
      const d = new Date(s.created_at);
      return d >= twoMonthsAgo && d < lastMonth;
    }).length;
    const servicesChange =
      prevMonthServices > 0
        ? `${thisMonthServices - prevMonthServices >= 0 ? "+" : ""}${
            thisMonthServices - prevMonthServices
          }`
        : thisMonthServices > 0
        ? `+${thisMonthServices}`
        : "0";

    return [
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
    ];
  }, [rfqs.data, orders.data, stores.data, services.data]);

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
