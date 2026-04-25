import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../lib/formatCurrency";

interface Invoice {
  id: string;
  invoice_number: string;
  plan_name: string;
  plan_price: string;
  subtotal_amount: string;
  tax_amount: string;
  currency: string;
  status: "paid" | "pending" | "failed" | "cancelled";
  issued_at: string;
  due_date: string;
  payment_method: string;
  is_overdue: boolean;
  month: string;
  year: string;
}

interface AIUsageData {
  invoices: Invoice[];
  usageCount: number;
  limit: number;
  isSubscribed: boolean;
  currentMonth: string;
  currentYear: string;
}

const statusConfig: Record<
  string,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  paid: {
    label: "Paid",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-800 dark:text-green-300",
    dotClass: "bg-green-500",
  },
  pending: {
    label: "Pending",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-800 dark:text-yellow-300",
    dotClass: "bg-yellow-500",
  },
  failed: {
    label: "Failed",
    bgClass: "bg-red-100 dark:bg-red-900/30",
    textClass: "text-red-800 dark:text-red-300",
    dotClass: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    bgClass: "bg-gray-100 dark:bg-gray-700",
    textClass: "text-gray-600 dark:text-gray-400",
    dotClass: "bg-gray-400",
  },
};

function UsageMeter({ count, limit }: { count: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min((count / limit) * 100, 100);
  const isNearLimit = !unlimited && pct >= 80;
  const isAtLimit = !unlimited && pct >= 100;

  const barColor = isAtLimit
    ? "from-red-500 to-red-600"
    : isNearLimit
    ? "from-orange-400 to-orange-500"
    : "from-violet-500 to-purple-600";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Requests used
        </span>
        <span
          className={`text-sm font-bold ${
            isAtLimit
              ? "text-red-600 dark:text-red-400"
              : isNearLimit
              ? "text-orange-500 dark:text-orange-400"
              : "text-violet-600 dark:text-violet-400"
          }`}
        >
          {unlimited ? `${count} / ∞` : `${count} / ${limit}`}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {unlimited ? (
          <div className="h-full w-full bg-gradient-to-r from-violet-500 to-purple-600 opacity-40" />
        ) : (
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      {!unlimited && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {isAtLimit
            ? "You've reached your request limit for this month."
            : isNearLimit
            ? `Only ${limit - count} requests remaining.`
            : `${limit - count} requests remaining this month.`}
        </p>
      )}
    </div>
  );
}

export default function UserAISubscriptions() {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/ai/invoices")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setError("Could not load subscription data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        {/* Usage skeleton */}
        <div className="animate-pulse rounded-2xl bg-gray-100 p-6 dark:bg-gray-700/40">
          <div className="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-600" />
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-600" />
        </div>
        {/* Invoice skeletons */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-gray-100 p-4 dark:bg-gray-700/40"
          >
            <div className="mb-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  const invoices = data?.invoices || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          AI Subscriptions & Usage
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Track your AI assistant usage and subscription invoices.
        </p>
      </div>

      {/* Usage Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-lg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <span className="font-semibold">
                {data?.currentMonth} {data?.currentYear}
              </span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                data?.isSubscribed
                  ? "bg-green-400/20 text-green-100 ring-1 ring-green-300/40"
                  : "bg-white/10 text-white/70 ring-1 ring-white/20"
              }`}
            >
              {data?.isSubscribed ? "✓ Subscribed" : "Free Tier"}
            </span>
          </div>

          {/* Usage bar on dark background */}
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-white/80">Requests used</span>
            <span className="font-bold text-white">
              {data?.limit === -1
                ? `${data?.usageCount} / ∞`
                : `${data?.usageCount} / ${data?.limit}`}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            {data?.limit !== -1 && (
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{
                  width: `${Math.min(
                    ((data?.usageCount || 0) / (data?.limit || 1)) * 100,
                    100
                  )}%`,
                }}
              />
            )}
          </div>
          {data?.limit !== -1 && (
            <p className="mt-1.5 text-xs text-white/60">
              {(data?.limit || 0) - (data?.usageCount || 0) > 0
                ? `${
                    (data?.limit || 0) - (data?.usageCount || 0)
                  } requests remaining`
                : "Limit reached — subscribe now to continue"}
            </p>
          )}
        </div>
      </div>

      {/* Invoices Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Subscription Invoices
          </h3>
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {invoices.length} total
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-14 dark:border-gray-600">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <svg
                className="h-7 w-7 text-violet-500 dark:text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No invoices yet
            </p>
            <p className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
              Subscribe to the AI assistant to see your invoices here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const cfg = statusConfig[inv.status] || statusConfig["cancelled"];
              const issuedDate = new Date(inv.issued_at).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              );
              const dueDate = new Date(inv.due_date).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              );
              const total = parseFloat(inv.plan_price) || 0;
              const subtotal = parseFloat(inv.subtotal_amount) || 0;
              const tax = parseFloat(inv.tax_amount) || 0;

              return (
                <div
                  key={inv.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Invoice header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <svg
                          className="h-4 w-4 text-violet-600 dark:text-violet-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {inv.invoice_number}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {inv.month} {inv.year}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bgClass} ${cfg.textClass}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`}
                      />
                      {cfg.label}
                      {inv.is_overdue && inv.status !== "paid" && (
                        <span className="ml-1 text-red-500">(Overdue)</span>
                      )}
                    </span>
                  </div>

                  {/* Invoice body */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {inv.plan_name}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (18%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-1 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice footer */}
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 dark:bg-gray-800/50">
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Issued: {issuedDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Due: {dueDate}</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {inv.payment_method}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
