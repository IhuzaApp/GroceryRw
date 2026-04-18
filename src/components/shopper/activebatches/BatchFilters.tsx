import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "../../../context/ThemeContext";

interface BatchFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export interface FilterState {
  orderType?: string;
  status?: string;
  urgency?: string;
  dateRange?: string;
  search?: string;
}

/* ── Data ── */
const ORDER_TYPES = [
  { value: "regular",    label: "Regular",     desc: "Standard grocery order",    dot: "bg-emerald-400" },
  { value: "reel",       label: "Reel",        desc: "Reel-based order",          dot: "bg-violet-400"  },
  { value: "restaurant", label: "Restaurant",  desc: "Restaurant food order",     dot: "bg-orange-400"  },
  { value: "business",   label: "Business",    desc: "Business bulk order",       dot: "bg-blue-400"    },
  { value: "store",      label: "Store",       desc: "Store pickup order",        dot: "bg-teal-400"    },
  { value: "plasone",    label: "Plas One",    desc: "",                          dot: "bg-gray-400", disabled: true },
];

const STATUS_LIST = [
  { value: "accepted",    label: "Accepted",    desc: "Shopper accepted",       dot: "bg-emerald-400" },
  { value: "picked",      label: "Picked Up",   desc: "Items picked from store",dot: "bg-orange-400"  },
  { value: "shopping",    label: "Shopping",    desc: "Currently shopping",     dot: "bg-yellow-400"  },
  { value: "on_the_way",  label: "On The Way",  desc: "En route to customer",   dot: "bg-purple-400"  },
  { value: "at_customer", label: "At Customer", desc: "At delivery location",   dot: "bg-indigo-400"  },
  { value: "delivered",   label: "Delivered",   desc: "Order completed",        dot: "bg-green-400"   },
];

const URGENCY_LIST = [
  { value: "newly_accepted", label: "Newly Accepted", desc: "Just accepted batches",     dot: "bg-blue-400"    },
  { value: "late",           label: "Late",           desc: "Past delivery time",         dot: "bg-red-400"     },
  { value: "urgent",         label: "Urgent",         desc: "Less than 10 minutes left",  dot: "bg-orange-400"  },
  { value: "okay",           label: "On Track",       desc: "No immediate rush",          dot: "bg-emerald-400" },
];

/* ── Portal Dropdown ── */
interface DropdownItem {
  value: string;
  label: string;
  desc?: string;
  dot?: string;
  disabled?: boolean;
}

function FilterDropdown({
  label,
  icon,
  items,
  activeValue,
  onSelect,
  isDark,
  accentGradient,
}: {
  label: string;
  icon: React.ReactNode;
  items: DropdownItem[];
  activeValue?: string;
  onSelect: (v: string | undefined) => void;
  isDark: boolean;
  accentGradient?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        btnRef.current && !btnRef.current.contains(t)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Keep rect fresh while open */
  useEffect(() => {
    if (!open) return;
    const update = () => btnRef.current && setRect(btnRef.current.getBoundingClientRect());
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const toggle = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  };

  const activeItem = items.find((i) => i.value === activeValue);
  const isActive = !!activeValue;

  /* ── Portal menu ── */
  const portalMenu =
    open && rect
      ? ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: rect.bottom + 8,
              left: rect.left,
              minWidth: Math.max(rect.width, 230),
              zIndex: 2147483647, // max z-index — escapes every stacking context
              borderRadius: 16,
              overflow: "hidden",
              background: isDark ? "rgba(15,15,15,0.97)" : "rgba(255,255,255,0.98)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.08)",
              boxShadow: isDark
                ? "0 24px 64px rgba(0,0,0,0.7)"
                : "0 24px 64px rgba(0,0,0,0.14)",
            }}
          >
            {/* Clear row */}
            {isActive && (
              <>
                <button
                  onClick={() => { onSelect(undefined); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filter
                </button>
                <div style={{ height: 1, margin: "0 16px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
              </>
            )}

            {/* Items */}
            <div style={{ padding: 8 }}>
              {items.map((item) => {
                const selected = activeValue === item.value;
                return (
                  <button
                    key={item.value}
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) { onSelect(item.value); setOpen(false); }
                    }}
                    className={`flex w-full items-center gap-3 text-left transition-colors duration-100 ${
                      item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                    }`}
                    style={{
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: selected
                        ? isDark ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.09)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected && !item.disabled)
                        (e.currentTarget as HTMLElement).style.background = isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!selected)
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${item.dot ?? "bg-gray-400"}`}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: selected ? "#10b981" : "var(--text-primary)" }}
                      >
                        {item.label}
                        {item.disabled && (
                          <span className="ml-2 text-[10px] font-normal" style={{ color: "var(--text-secondary)" }}>
                            Soon
                          </span>
                        )}
                      </span>
                      {item.desc && (
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {item.desc}
                        </span>
                      )}
                    </div>
                    {selected && (
                      <svg className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-px"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${accentGradient ?? "#10b981,#059669"})`
            : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          color: isActive ? "#fff" : "var(--text-secondary)",
          border: isActive
            ? "1px solid transparent"
            : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          boxShadow: isActive ? "0 4px 14px rgba(16,185,129,0.3)" : "none",
        }}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="max-w-[90px] truncate">{activeItem?.label ?? label}</span>
        {isActive ? (
          <span
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold leading-none"
            onClick={(e) => { e.stopPropagation(); onSelect(undefined); }}
          >
            ×
          </span>
        ) : (
          <svg
            className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {portalMenu}
    </div>
  );
}

/* ════════════════════════════════════════
   Main Component
═══════════════════════════════════════ */
export function BatchFilters({
  onFilterChange,
  onRefresh,
  isRefreshing = false,
}: BatchFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [filters, setFilters] = useState<FilterState>({});

  const update = (key: keyof FilterState, value: string | undefined) => {
    const next = { ...filters, [key]: value };
    if (!value) delete next[key];
    setFilters(next);
    onFilterChange?.(next);
  };

  const activeCount = (Object.keys(filters) as (keyof FilterState)[]).filter(
    (k) => k !== "search" && !!filters[k]
  ).length;

  const clearAll = () => {
    const cleared: FilterState = filters.search ? { search: filters.search } : {};
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const surface: React.CSSProperties = {
    background: isDark ? "rgba(23,23,23,0.85)" : "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.35)" : "0 4px 24px rgba(0,0,0,0.06)",
  };

  return (
    <div
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
      style={surface}
    >
      {/* ── Left: filters ── */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <FilterDropdown
          label="Order Type"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          items={ORDER_TYPES}
          activeValue={filters.orderType}
          onSelect={(v) => update("orderType", v)}
          isDark={isDark}
          accentGradient="#10b981,#059669"
        />

        <FilterDropdown
          label="Status"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          items={STATUS_LIST}
          activeValue={filters.status}
          onSelect={(v) => update("status", v)}
          isDark={isDark}
          accentGradient="rgb(99,102,241),rgb(139,92,246)"
        />

        <FilterDropdown
          label="Priority"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          items={URGENCY_LIST}
          activeValue={filters.urgency}
          onSelect={(v) => update("urgency", v)}
          isDark={isDark}
          accentGradient="rgb(249,115,22),rgb(234,88,12)"
        />

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-500 transition-all duration-150 hover:-translate-y-px"
            style={{
              background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
            Clear all
          </button>
        )}
      </div>

      {/* ── Right: Search + Refresh ── */}
      <div className="flex flex-1 items-center gap-2 sm:min-w-[220px] sm:max-w-sm">
        {/* Search */}
        <div className="group relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search batches…"
            value={filters.search ?? ""}
            onChange={(e) => update("search", e.target.value || undefined)}
            className="w-full rounded-xl py-2.5 pl-10 pr-9 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              color: "var(--text-primary)",
            }}
          />
          {filters.search && (
            <button
              onClick={() => update("search", undefined)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-red-400 opacity-70 transition-opacity hover:opacity-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh batches"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-px hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              color: isRefreshing ? "#10b981" : "var(--text-secondary)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
