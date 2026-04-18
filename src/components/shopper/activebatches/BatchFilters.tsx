import React, { useState, useEffect, useRef } from "react";
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

/* ── Config ── */
const ORDER_TYPES = [
  { value: "regular",  label: "Regular",    color: "from-emerald-500 to-green-600",  dot: "bg-emerald-400" },
  { value: "reel",     label: "Reel",       color: "from-violet-500 to-purple-600",  dot: "bg-violet-400"  },
  { value: "restaurant",label:"Restaurant", color: "from-orange-500 to-red-500",     dot: "bg-orange-400"  },
  { value: "business", label: "Business",   color: "from-blue-500   to-indigo-600",  dot: "bg-blue-400"    },
  { value: "store",    label: "Store",      color: "from-teal-500   to-cyan-600",    dot: "bg-teal-400"    },
  { value: "plasone",  label: "Plas One",   color: "from-gray-500   to-gray-600",    dot: "bg-gray-400", disabled: true },
];

const STATUS_LIST = [
  { value: "accepted",    label: "Accepted",    desc: "Shopper accepted",        color: "text-emerald-500", bg: "bg-emerald-400/10" },
  { value: "picked",      label: "Picked Up",   desc: "Items picked from store", color: "text-orange-500",  bg: "bg-orange-400/10"  },
  { value: "shopping",    label: "Shopping",    desc: "Currently shopping",      color: "text-yellow-500",  bg: "bg-yellow-400/10"  },
  { value: "on_the_way",  label: "On The Way",  desc: "En route to customer",    color: "text-purple-500",  bg: "bg-purple-400/10"  },
  { value: "at_customer", label: "At Customer", desc: "At delivery location",    color: "text-indigo-500",  bg: "bg-indigo-400/10"  },
  { value: "delivered",   label: "Delivered",   desc: "Order completed",         color: "text-green-500",   bg: "bg-green-400/10"   },
];

const URGENCY_LIST = [
  { value: "newly_accepted", label: "Newly Accepted", desc: "Just accepted batches",       color: "text-blue-500",   bg: "bg-blue-400/10"   },
  { value: "late",           label: "Late",           desc: "Past delivery time",           color: "text-red-500",    bg: "bg-red-400/10"    },
  { value: "urgent",         label: "Urgent",         desc: "Less than 10 minutes left",    color: "text-orange-500", bg: "bg-orange-400/10" },
  { value: "okay",           label: "On Track",       desc: "No immediate rush",            color: "text-emerald-500",bg: "bg-emerald-400/10"},
];

/* ── Generic Dropdown ── */
interface DropdownItem {
  value: string;
  label: string;
  desc?: string;
  color?: string;
  bg?: string;
  dot?: string;
  disabled?: boolean;
  gradient?: string;
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeItem = items.find((i) => i.value === activeValue);
  const isActive = !!activeValue;

  const menuStyle: React.CSSProperties = {
    background: isDark ? "rgba(18,18,18,0.97)" : "rgba(255,255,255,0.98)",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
    boxShadow: isDark
      ? "0 20px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset"
      : "0 20px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
  };

  return (
    <div ref={ref} className="dropdown-container relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-px"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${accentGradient ?? "#10b981, #059669"})`
            : isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.04)",
          color: isActive ? "#fff" : "var(--text-secondary)",
          border: isActive
            ? "1px solid transparent"
            : isDark
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid rgba(0,0,0,0.07)",
          boxShadow: isActive ? "0 4px 14px rgba(16,185,129,0.3)" : "none",
        }}
      >
        <span className={`flex-shrink-0 transition-transform duration-200 ${open ? "scale-90" : ""}`}>
          {icon}
        </span>
        <span className="max-w-[90px] truncate">
          {activeItem?.label ?? label}
        </span>
        {isActive && (
          <span
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold"
            onClick={(e) => { e.stopPropagation(); onSelect(undefined); }}
          >
            ×
          </span>
        )}
        {!isActive && (
          <svg
            className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl"
          style={menuStyle}
        >
          {/* Clear */}
          {isActive && (
            <button
              onClick={() => { onSelect(undefined); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/8"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </button>
          )}

          {isActive && (
            <div
              className="mx-4"
              style={{
                height: "1px",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              }}
            />
          )}

          <div className="p-2">
            {items.map((item) => {
              const selected = activeValue === item.value;
              return (
                <button
                  key={item.value}
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      onSelect(item.value);
                      setOpen(false);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 ${
                    item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  }`}
                  style={{
                    background: selected
                      ? isDark
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(16,185,129,0.08)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected && !item.disabled)
                      (e.currentTarget as HTMLElement).style.background = isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Dot or gradient swatch */}
                  {item.dot ? (
                    <span
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${item.dot}`}
                    />
                  ) : item.color ? (
                    <span
                      className={`h-2 w-2 flex-shrink-0 rounded-full bg-current ${item.color}`}
                    />
                  ) : null}

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: selected ? "#10b981" : "var(--text-primary)" }}
                    >
                      {item.label}
                      {item.disabled && (
                        <span
                          className="ml-2 text-[10px] font-normal"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Soon
                        </span>
                      )}
                    </span>
                    {item.desc && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.desc}
                      </span>
                    )}
                  </div>

                  {selected && (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Main Export
═══════════════════════════════════════ */
export function BatchFilters({
  onFilterChange,
  onRefresh,
  isRefreshing = false,
}: BatchFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [filters, setFilters] = useState<FilterState>({});

  const updateFilter = (key: keyof FilterState, value: string | undefined) => {
    const next = { ...filters, [key]: value };
    if (!value) delete next[key];
    setFilters(next);
    onFilterChange?.(next);
  };

  const activeCount = Object.keys(filters).filter(
    (k) => k !== "search" && filters[k as keyof FilterState]
  ).length;

  const clearAll = () => {
    const cleared = filters.search ? { search: filters.search } : {};
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const surface: React.CSSProperties = {
    background: isDark ? "rgba(23,23,23,0.85)" : "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.35)"
      : "0 4px 24px rgba(0,0,0,0.06)",
  };

  return (
    <div
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all duration-300"
      style={surface}
    >
      {/* ── Left: Filter pills ── */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {/* Order Type */}
        <FilterDropdown
          label="Order Type"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          items={ORDER_TYPES.map((t) => ({ ...t, gradient: t.color }))}
          activeValue={filters.orderType}
          onSelect={(v) => updateFilter("orderType", v)}
          isDark={isDark}
          accentGradient="#10b981, #059669"
        />

        {/* Status */}
        <FilterDropdown
          label="Status"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          items={STATUS_LIST.map((s) => ({ value: s.value, label: s.label, desc: s.desc, color: s.color, dot: undefined }))}
          activeValue={filters.status}
          onSelect={(v) => updateFilter("status", v)}
          isDark={isDark}
          accentGradient="rgb(99,102,241), rgb(139,92,246)"
        />

        {/* Priority */}
        <FilterDropdown
          label="Priority"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          items={URGENCY_LIST.map((u) => ({ value: u.value, label: u.label, desc: u.desc, color: u.color, dot: undefined }))}
          activeValue={filters.urgency}
          onSelect={(v) => updateFilter("urgency", v)}
          isDark={isDark}
          accentGradient="rgb(249,115,22), rgb(234,88,12)"
        />

        {/* Active count badge + clear all */}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-500 transition-all duration-150 hover:-translate-y-px"
            style={{
              background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >
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
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-emerald-500"
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
            onChange={(e) => updateFilter("search", e.target.value || undefined)}
            className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              color: "var(--text-primary)",
            }}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", undefined)}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
