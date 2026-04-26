import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface Order {
  id: string;
  OrderID: string | number;
  orderIDs?: Array<string | number>;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopNames?: string[];
  shopAddress: string;
  shopLat?: number;
  shopLng?: number;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?:
    | "regular"
    | "reel"
    | "restaurant"
    | "combined"
    | "business"
    | "package";
  isAvailable?: boolean;
  reel?: {
    id: string;
    title: string;
    restaurant_id?: string | null;
    user_id?: string | null;
  };
  quantity?: number;
  deliveryNote?: string | null;
}

interface BatchCardMobileProps {
  order: Order;
  currentTime: Date;
}

/* ── Configs ── */
const ORDER_TYPE_CFG = {
  regular: {
    label: "Regular",
    gradient: "from-emerald-500 to-green-600",
    dot: "#34d399",
  },
  reel: {
    label: "Reel",
    gradient: "from-violet-500 to-purple-600",
    dot: "#a78bfa",
  },
  restaurant: {
    label: "Restaurant",
    gradient: "from-orange-500 to-red-500",
    dot: "#fb923c",
  },
  combined: {
    label: "Combined",
    gradient: "from-amber-500 to-yellow-500",
    dot: "#fbbf24",
  },
  business: {
    label: "Business",
    gradient: "from-blue-500 to-indigo-600",
    dot: "#60a5fa",
  },
  package: {
    label: "Package",
    gradient: "from-pink-500 to-rose-600",
    dot: "#ec4899",
  },
} as const;

const STATUS_CFG: Record<
  string,
  { label: string; bg: string; text: string; ring: string }
> = {
  accepted: {
    label: "Accepted",
    bg: "rgba(16,185,129,0.12)",
    text: "#10b981",
    ring: "rgba(16,185,129,0.2)",
  },
  picked: {
    label: "Picked Up",
    bg: "rgba(249,115,22,0.12)",
    text: "#f97316",
    ring: "rgba(249,115,22,0.2)",
  },
  shopping: {
    label: "Shopping",
    bg: "rgba(234,179,8,0.12)",
    text: "#eab308",
    ring: "rgba(234,179,8,0.2)",
  },
  on_the_way: {
    label: "On The Way",
    bg: "rgba(168,85,247,0.12)",
    text: "#a855f7",
    ring: "rgba(168,85,247,0.2)",
  },
  at_customer: {
    label: "At Customer",
    bg: "rgba(99,102,241,0.12)",
    text: "#6366f1",
    ring: "rgba(99,102,241,0.2)",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(34,197,94,0.12)",
    text: "#22c55e",
    ring: "rgba(34,197,94,0.2)",
  },
};

/* ── Relative time helper ── */
function relativeTime(ms: number): string {
  const abs = Math.abs(ms);
  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);
  if (years >= 1) return years === 1 ? "1 year" : `${years} years`;
  if (months >= 1) return months === 1 ? "1 month" : `${months} months`;
  if (weeks >= 1) return weeks === 1 ? "1 week" : `${weeks} weeks`;
  if (days >= 1) return days === 1 ? "1 day" : `${days} days`;
  if (hours >= 1) return hours === 1 ? "1 hour" : `${hours} hours`;
  if (mins >= 1) return mins === 1 ? "1 min" : `${mins} mins`;
  return "now";
}

export function BatchCardMobile({ order, currentTime }: BatchCardMobileProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const typeCfg =
    ORDER_TYPE_CFG[
      (order.orderType as keyof typeof ORDER_TYPE_CFG) ?? "regular"
    ] ?? ORDER_TYPE_CFG.regular;

  const statusCfg = STATUS_CFG[order.status] ?? {
    label: order.status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    bg: "rgba(156,163,175,0.12)",
    text: "#9ca3af",
    ring: "rgba(156,163,175,0.2)",
  };

  /* ── Delivery time ── */
  const deliveryInfo = (() => {
    if (!order.deliveryTime) {
      return order.orderType === "business"
        ? {
            label: "Within 2 hours",
            urgent: false,
            overdue: false,
            neutral: true,
          }
        : { label: "—", urgent: false, overdue: false, neutral: true };
    }
    const diff = new Date(order.deliveryTime).getTime() - currentTime.getTime();
    const mins = Math.floor(diff / 60_000);
    if (diff < 0)
      return {
        label: `${relativeTime(diff)} late`,
        urgent: false,
        overdue: true,
        neutral: false,
      };
    if (mins <= 10)
      return {
        label: `${relativeTime(diff)} left`,
        urgent: true,
        overdue: false,
        neutral: false,
      };
    return {
      label: `in ${relativeTime(diff)}`,
      urgent: false,
      overdue: false,
      neutral: true,
    };
  })();

  /* ── Avatar color ── */
  const avatarHue = ((order.customerName?.charCodeAt(0) ?? 65) * 7) % 360;

  /* ── Glass surface ── */
  const cardBg = isDark ? "rgba(23,23,23,0.88)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const labelColor = "var(--text-secondary)";
  const valueColor = "var(--text-primary)";

  return (
    <div
      className="overflow-hidden rounded-2xl transition-all duration-300 active:scale-[0.99]"
      style={{
        background: cardBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${cardBorder}`,
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset"
          : "0 4px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {/* ── Gradient accent strip at top ── */}
      <div className={`h-1 w-full bg-gradient-to-r ${typeCfg.gradient}`} />

      <div className="p-4">
        {/* ── Header row ── */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
              style={{ background: `hsl(${avatarHue},55%,50%)` }}
            >
              {(order.customerName ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <p
                className="text-sm font-bold leading-tight"
                style={{ color: valueColor }}
              >
                {order.customerName || "Customer"}
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: labelColor }}>
                {order.shopName || "Shop"}
              </p>
            </div>
          </div>

          {/* Order ID + Type pill */}
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
              style={{
                background: isDark
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(16,185,129,0.1)",
                color: isDark ? "#34d399" : "#059669",
                border: isDark
                  ? "1px solid rgba(52,211,153,0.18)"
                  : "1px solid rgba(5,150,105,0.15)",
              }}
            >
              #{order.OrderID}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${typeCfg.gradient} px-2.5 py-0.5 text-[10px] font-bold text-white`}
            >
              {typeCfg.label}
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mb-3" style={{ height: 1, background: divider }} />

        {/* ── Info grid ── */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          {/* Earnings */}
          <div
            className="rounded-xl p-3"
            style={{
              background: isDark
                ? "rgba(16,185,129,0.08)"
                : "rgba(16,185,129,0.06)",
            }}
          >
            <p
              className="mb-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ color: labelColor }}
            >
              Earnings
            </p>
            <p className="text-base font-bold text-emerald-500">
              {formatCurrencySync(order.estimatedEarnings || 0)}
            </p>
          </div>

          {/* Delivery Time */}
          <div
            className="rounded-xl p-3"
            style={{
              background: deliveryInfo.overdue
                ? isDark
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(239,68,68,0.07)"
                : deliveryInfo.urgent
                ? isDark
                  ? "rgba(249,115,22,0.1)"
                  : "rgba(249,115,22,0.07)"
                : isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.03)",
            }}
          >
            <p
              className="mb-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ color: labelColor }}
            >
              Delivery
            </p>
            <p
              className="text-sm font-bold"
              style={{
                color: order.isAvailable
                  ? "#ec4899"
                  : deliveryInfo.overdue
                  ? "#ef4444"
                  : deliveryInfo.urgent
                  ? "#f97316"
                  : isDark
                  ? "#34d399"
                  : "#059669",
              }}
            >
              {order.isAvailable ? "Available Now" : deliveryInfo.label}
              {(deliveryInfo.overdue || order.isAvailable) && (
                <span
                  className={`ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full ${
                    order.isAvailable ? "bg-pink-500" : "bg-red-500"
                  }`}
                />
              )}
            </p>
          </div>
        </div>

        {/* ── Address row ── */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 rounded-xl p-3 transition-colors"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${divider}`,
          }}
        >
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              background: isDark
                ? "rgba(16,185,129,0.15)"
                : "rgba(16,185,129,0.1)",
            }}
          >
            <svg
              className="h-3.5 w-3.5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="flex-1 truncate text-xs" style={{ color: labelColor }}>
            {order.customerAddress || "No address"}
          </p>
          <svg
            className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        {/* ── Divider ── */}
        <div className="mb-3" style={{ height: 1, background: divider }} />

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3">
          {/* Status */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1"
            style={{
              background: statusCfg.bg,
              color: statusCfg.text,
              boxShadow: `0 0 0 1px ${statusCfg.ring}`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: statusCfg.text }}
            />
            {statusCfg.label}
          </span>

          {/* View button */}
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Batch
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
