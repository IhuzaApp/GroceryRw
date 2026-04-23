import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";

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
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerNames?: string[];
  customerAddress: string;
  customerAddresses?: string[];
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
  invoiceUrl?: string;
  isAvailable?: boolean;
}

/* ── Helpers ── */
const formatOrderId = (order: Order): string => {
  if (order.orderType === "combined" && order.orderIDs?.length) {
    const ids = order.orderIDs.map(String);
    if (ids.length === 2) return `#${ids[0]} & #${ids[1]}`;
    return ids.map((x) => `#${x}`).join(", ");
  }
  return `#${String(order.OrderID)}`;
};

const uniqueList = (arr: (string | undefined)[]): string[] =>
  Array.from(new Set(arr.map((s) => s?.trim()).filter(Boolean))) as string[];

const renderNames = (names: string[]) =>
  names.length <= 1 ? (
    <span>{names[0]}</span>
  ) : (
    <div className="flex flex-col gap-0.5">
      {names.map((n) => (
        <span key={n} className="leading-tight">
          {n}
        </span>
      ))}
    </div>
  );

function CustomerNames({ order }: { order: Order }) {
  const names = uniqueList(
    order.customerNames?.length ? order.customerNames : [order.customerName]
  );
  return renderNames(names);
}

function ShopNames({ order }: { order: Order }) {
  const names = uniqueList(
    order.shopNames?.length ? order.shopNames : [order.shopName]
  );
  return renderNames(names);
}

function CustomerAddresses({ order }: { order: Order }) {
  const addrs = uniqueList(
    order.customerAddresses?.length
      ? order.customerAddresses
      : [order.customerAddress]
  );
  return renderNames(addrs);
}

/* ── Order Type Pill ── */
const ORDER_TYPE = {
  reel: {
    label: "Reel",
    gradient: "from-violet-500 to-purple-600",
    dot: "bg-violet-400",
  },
  restaurant: {
    label: "Restaurant",
    gradient: "from-orange-500 to-red-500",
    dot: "bg-orange-400",
  },
  business: {
    label: "Business",
    gradient: "from-blue-500 to-indigo-600",
    dot: "bg-blue-400",
  },
  combined: {
    label: "Combined",
    gradient: "from-amber-500 to-yellow-500",
    dot: "bg-amber-400",
  },
  regular: {
    label: "Regular",
    gradient: "from-emerald-500 to-green-600",
    dot: "bg-emerald-400",
  },
  package: {
    label: "Package",
    gradient: "from-pink-500 to-rose-600",
    dot: "bg-pink-400",
  },
} as const;

function OrderTypePill({ type }: { type?: string }) {
  const key = (
    type && type in ORDER_TYPE ? type : "regular"
  ) as keyof typeof ORDER_TYPE;
  const cfg = ORDER_TYPE[key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${cfg.gradient} px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} opacity-90`} />
      {cfg.label}
    </span>
  );
}

/* ── Status Badge ── */
const STATUS_CFG: Record<string, { bg: string; text: string; ring: string }> = {
  accepted: {
    bg: "bg-emerald-400/10",
    text: "text-emerald-500",
    ring: "ring-emerald-400/20",
  },
  shopping: {
    bg: "bg-yellow-400/10",
    text: "text-yellow-500",
    ring: "ring-yellow-400/20",
  },
  picked: {
    bg: "bg-orange-400/10",
    text: "text-orange-500",
    ring: "ring-orange-400/20",
  },
  on_the_way: {
    bg: "bg-purple-400/10",
    text: "text-purple-500",
    ring: "ring-purple-400/20",
  },
  at_customer: {
    bg: "bg-indigo-400/10",
    text: "text-indigo-500",
    ring: "ring-indigo-400/20",
  },
  delivered: {
    bg: "bg-green-400/10",
    text: "text-green-500",
    ring: "ring-green-400/20",
  },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? {
    bg: "bg-gray-400/10",
    text: "text-gray-500",
    ring: "ring-gray-400/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring} px-2.5 py-1 text-[11px] font-semibold`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
}

/* ── Delivery Time ── */
/* ── Human-readable relative time ── */
function relativeTime(diffMs: number): string {
  const abs = Math.abs(diffMs);
  const mins = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.4375);
  const years = Math.floor(days / 365.25);

  if (years >= 1) return years === 1 ? "1 year" : `${years} years`;
  if (months >= 1) return months === 1 ? "1 month" : `${months} months`;
  if (weeks >= 1) return weeks === 1 ? "1 week" : `${weeks} weeks`;
  if (days >= 1) return days === 1 ? "1 day" : `${days} days`;
  if (hours >= 1) return hours === 1 ? "1 hour" : `${hours} hours`;
  if (mins >= 1) return mins === 1 ? "1 min" : `${mins} mins`;
  return "now";
}

function DeliveryTimeCell({
  deliveryTime,
  orderType,
  currentTime,
}: {
  deliveryTime?: string;
  orderType?: string;
  currentTime: Date;
}) {
  if (!deliveryTime) {
    return (
      <span style={{ color: "var(--text-secondary)" }} className="text-xs">
        {orderType === "business" ? "Within 2h" : "—"}
      </span>
    );
  }

  const delivery = new Date(deliveryTime);
  const diff = delivery.getTime() - currentTime.getTime();
  const isOverdue = diff < 0;

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const timeLabel = relativeTime(diff);

  if (isOverdue) {
    const days = Math.floor(Math.abs(diff) / 86_400_000);

    const severity =
      days >= 7
        ? { bg: "bg-red-900/20", text: "text-red-400", ring: "ring-red-700/30" }
        : days >= 1
        ? { bg: "bg-red-600/15", text: "text-red-500", ring: "ring-red-500/25" }
        : {
            bg: "bg-red-500/10",
            text: "text-red-500",
            ring: "ring-red-400/20",
          };

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${severity.bg} ${severity.text} ${severity.ring}`}
        >
          <svg
            className="h-3 w-3 flex-shrink-0 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {timeLabel} late
        </span>
        <span
          className="whitespace-nowrap pl-1 text-[10px] tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          Due {fmt(delivery)}
        </span>
      </div>
    );
  }

  /* ── Upcoming ── */
  const minsLeft = Math.floor(diff / 60_000);
  const isUrgent = minsLeft <= 10;

  if (isUrgent) {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-orange-500 ring-1 ring-orange-400/20">
          <svg
            className="h-3 w-3 flex-shrink-0 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {timeLabel} left
        </span>
        <span
          className="whitespace-nowrap pl-1 text-[10px] tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          Due {fmt(delivery)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="whitespace-nowrap text-xs font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {fmt(delivery)}
      </span>
      <span
        className="whitespace-nowrap text-[10px]"
        style={{ color: "var(--text-secondary)" }}
      >
        in {timeLabel}
      </span>
    </div>
  );
}

/* ── Currency ── */
const fmtCurrency = (v: number | string) =>
  new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v));

/* ── Actions Dropdown ── */
function ActionsDropdown({ order, isDark }: { order: Order; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ top: 0, right: 0 });

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  const menuBg = isDark
    ? "bg-[var(--bg-secondary)] border border-white/8 shadow-[0_16px_48px_rgba(0,0,0,0.7)]"
    : "bg-[var(--bg-secondary)] border border-black/8 shadow-[0_16px_48px_rgba(0,0,0,0.12)]";

  const itemCls = isDark
    ? "text-[var(--text-primary)] hover:bg-white/5"
    : "text-[var(--text-primary)] hover:bg-black/5";

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150"
        style={{
          background: open
            ? isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)"
            : "transparent",
          color: "var(--text-secondary)",
        }}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.top,
            right: pos.right,
            zIndex: 9999,
          }}
          className={`w-52 overflow-hidden rounded-xl ${menuBg}`}
        >
          <div className="py-1">
            <Link
              href={`/Plasa/active-batches/batch/${order.id}`}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${itemCls}`}
              onClick={() => setOpen(false)}
            >
              <svg
                className="h-4 w-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Batch Details
            </Link>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${itemCls}`}
              onClick={() => setOpen(false)}
            >
              <svg
                className="h-4 w-4 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Get Directions
            </a>

            <div
              className="mx-4 my-1 border-t"
              style={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
              }}
            />

            {order.status === "accepted" &&
              order.orderType !== "reel" &&
              order.orderType !== "restaurant" &&
              order.orderType !== "business" && (
                <button
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${itemCls}`}
                  onClick={() => setOpen(false)}
                >
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Start Shopping
                </button>
              )}

            {["shopping", "on_the_way", "at_customer"].includes(
              order.status
            ) && (
              <button
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${itemCls} ${
                  !order.invoiceUrl ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={!order.invoiceUrl}
                onClick={() => setOpen(false)}
                title={!order.invoiceUrl ? "Invoice required" : undefined}
              >
                <svg
                  className="h-4 w-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Confirm Delivery
                {!order.invoiceUrl && (
                  <span className="ml-auto text-[10px] text-red-400">
                    Invoice req.
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════ */
interface BatchTableProps {
  orders: Order[];
}

export function BatchTable({ orders }: BatchTableProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const itemsPerPage = 25;

  React.useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  /* Glass surface helpers */
  const surface = {
    background: isDark ? "rgba(23,23,23,0.85)" : "rgba(245,245,245,0.85)", // bg-secondary equivalents
    border: isDark
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(0,0,0,0.06)",
  };

  const headerBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const rowOdd = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)";
  const rowHover = isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)";

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Table Card ─── */}
      <div
        className="overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          ...surface,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: isDark
            ? "0 8px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset"
            : "0 8px 40px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {/* ── Head ── */}
            <thead>
              <tr
                style={{
                  background: headerBg,
                  borderBottom: isDark
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {[
                  "Order",
                  "Type",
                  "Customer",
                  "Shop",
                  "Earnings",
                  "Delivery Time",
                  "Address",
                  "Status",
                  "Action",
                ].map((col, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {currentOrders.map((order, idx) => (
                <tr
                  key={order.id}
                  className="group/row cursor-pointer transition-colors duration-100"
                  style={{
                    background: idx % 2 !== 0 ? rowOdd : "transparent",
                    borderBottom: isDark
                      ? "1px solid rgba(255,255,255,0.035)"
                      : "1px solid rgba(0,0,0,0.035)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      rowHover)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      idx % 2 !== 0 ? rowOdd : "transparent")
                  }
                >
                  {/* Order ID */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link href={`/Plasa/active-batches/batch/${order.id}`}>
                      <span
                        className="inline-flex cursor-pointer items-center rounded-lg px-2.5 py-1 text-xs font-bold transition-all hover:shadow-md"
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
                        {formatOrderId(order)}
                      </span>
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <OrderTypePill
                      type={
                        order.orderType === "combined" &&
                        (!order.orderIDs || order.orderIDs.length <= 1)
                          ? "regular"
                          : order.orderType
                      }
                    />
                  </td>

                  {/* Customer */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{
                          background: `hsl(${
                            ((order.customerName?.charCodeAt(0) ?? 65) * 7) %
                            360
                          }, 55%, 50%)`,
                        }}
                      >
                        {(order.customerName ?? "?")[0].toUpperCase()}
                      </div>
                      <span
                        className="max-w-[130px] truncate text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <CustomerNames order={order} />
                      </span>
                    </div>
                  </td>

                  {/* Shop */}
                  <td className="px-5 py-3.5">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.shopLat},${order.shopLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm transition-colors hover:text-blue-500"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <ShopNames order={order} />
                    </a>
                  </td>

                  {/* Earnings */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className="text-sm font-bold text-emerald-500">
                      {fmtCurrency(order.estimatedEarnings)}
                    </span>
                  </td>

                  {/* Delivery Time */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <DeliveryTimeCell
                      deliveryTime={order.deliveryTime}
                      orderType={order.orderType}
                      currentTime={currentTime}
                    />
                  </td>

                  {/* Address */}
                  <td className="max-w-[180px] px-5 py-3.5">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs transition-colors hover:text-blue-500"
                      style={{ color: "var(--text-secondary)" }}
                      title={order.customerAddress}
                    >
                      <CustomerAddresses order={order} />
                    </a>
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <StatusPill status={order.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {/* Prominent View button — always visible */}
                      <Link href={`/Plasa/active-batches/batch/${order.id}`}>
                        <button
                          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                          style={{
                            background:
                              "linear-gradient(135deg,#10b981,#059669)",
                            boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
                          }}
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
                          View
                        </button>
                      </Link>
                      {/* More actions dropdown */}
                      <ActionsDropdown order={order} isDark={isDark} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {currentOrders.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--bg-secondary)" }}
            >
              <svg
                className="h-7 w-7"
                style={{ color: "var(--text-secondary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="text-center">
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                No orders to display
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Active batches will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300"
          style={{
            ...surface,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.3)"
              : "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Showing{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, orders.length)}
            </span>{" "}
            of{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {orders.length}
            </span>{" "}
            batches
          </p>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {getPageNumbers().map((page, i) =>
              page === "…" ? (
                <span
                  key={`e${i}`}
                  className="w-8 text-center text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className="flex h-8 min-w-[32px] items-center justify-center rounded-lg text-xs font-semibold transition-all hover:-translate-y-px"
                  style={
                    currentPage === page
                      ? {
                          background: "linear-gradient(135deg,#10b981,#059669)",
                          color: "#fff",
                          boxShadow: "0 4px 10px rgba(16,185,129,0.35)",
                        }
                      : {
                          background: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
