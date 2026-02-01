"use client";

import {
  FileText,
  ShoppingCart,
  Package,
  Store,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Building,
  Truck,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { formatOperatingDays } from "../../../lib/formatters";

export function RFQCard({
  rfq,
  onView,
}: {
  rfq: any;
  onView: (item: any) => void;
}) {
  return (
    <div
      onClick={() => onView(rfq)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="flex-1 text-base font-bold text-gray-900 dark:text-white">
          {rfq.title || `RFQ #${rfq.id?.slice(0, 8)}`}
        </h4>
        <span
          className={`ml-2 rounded-md px-2.5 py-1 text-xs font-semibold ${
            rfq.open
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
          }`}
        >
          {rfq.open ? "Open" : "Closed"}
        </span>
      </div>
      {rfq.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {rfq.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
        {rfq.response_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(rfq.response_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export function QuoteCard({
  quote,
  onView,
}: {
  quote: any;
  onView: (item: any) => void;
}) {
  const attachments = [
    quote.attachement,
    quote.attachment_1,
    quote.attachment_2,
  ].filter((att) => att && att.trim() !== "");

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "RWF",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(parseFloat(amount));
    } catch {
      return `${amount} ${currency || "RWF"}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "accepted":
        return {
          icon: CheckCircle,
          className:
            "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30",
          text: "Accepted",
        };
      case "rejected":
        return {
          icon: XCircle,
          className:
            "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30",
          text: "Rejected",
        };
      default:
        return {
          icon: Clock,
          className:
            "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md shadow-yellow-500/30",
          text: "Pending",
        };
    }
  };

  const statusBadge = getStatusBadge(quote.status);
  const StatusIcon = statusBadge.icon;
  const rfqTitle =
    quote.bussines_RFQ?.title ||
    quote.rfq?.title ||
    `RFQ #${quote.businessRfq_id?.slice(0, 8)}`;
  const rfqRequesterName =
    quote.bussines_RFQ?.business_account?.business_name || "Unknown Business";

  return (
    <div
      onClick={() => onView(quote)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-5 shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.97] dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 dark:hover:border-green-600"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 transition-opacity duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-teal-900/10" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                  {rfqTitle}
                </h3>
              </div>
            </div>
            <div className="ml-12 flex items-center gap-2 rounded-lg bg-gray-100/80 px-3 py-1.5 dark:bg-gray-700/50">
              <Building className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
                {rfqRequesterName}
              </span>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${statusBadge.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusBadge.text}
            </span>
            {attachments.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/30">
                <FileText className="h-3 w-3" />
                {attachments.length}
              </span>
            )}
          </div>
        </div>
        <div className="ml-12 grid grid-cols-1 gap-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 dark:from-gray-700/30 dark:to-gray-800/30">
          {quote.delivery_time && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Delivery
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {quote.delivery_time}
                </p>
              </div>
            </div>
          )}
          {quote.quote_validity && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Valid Until
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {quote.quote_validity}
                </p>
              </div>
            </div>
          )}
          {quote.bussines_RFQ?.location && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {quote.bussines_RFQ.location}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quote.qouteAmount
                  ? formatCurrency(quote.qouteAmount, quote.currency)
                  : "N/A"}
              </p>
              {quote.currency && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {quote.currency}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {quote.created_at
                  ? formatDate(quote.created_at)
                  : "Not specified"}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(quote);
            }}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrderCard({
  order,
  onView,
}: {
  order: any;
  onView: (item: any) => void;
}) {
  const queryId = order.allProducts?.[0]?.query_id || order.query_id || null;

  return (
    <div
      onClick={() => onView(order)}
      className="group cursor-pointer rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:border-green-400 hover:shadow-xl active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-2 dark:from-blue-900/30 dark:to-indigo-900/30">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {queryId || order.OrderID || order.id?.slice(0, 8) || "N/A"}
              </h4>
              {queryId && (
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  Query ID
                </p>
              )}
            </div>
          </div>
          {order.created_at && (
            <div className="ml-10 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <span
          className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-md ${
            order.status === "completed"
              ? "bg-green-500 text-white"
              : order.status === "pending"
              ? "bg-yellow-500 text-white"
              : order.status === "cancelled"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {order.status?.toUpperCase() || "ACTIVE"}
        </span>
      </div>
      {order.total && (
        <div className="mt-3 flex items-center justify-between border-t-2 border-gray-200 pt-3 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
            Total:
          </span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrencySync(parseFloat(order.total || "0"))}
          </span>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Eye className="h-3.5 w-3.5" />
        <span className="font-medium">Tap to view details</span>
      </div>
    </div>
  );
}

export function ServiceCard({
  service,
  onView,
}: {
  service: any;
  onView: (item: any) => void;
}) {
  return (
    <div
      onClick={() => onView(service)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700">
          <Package className="h-6 w-6 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-base font-bold text-gray-900 dark:text-white">
            {service.name}
          </h4>
          {service.price && (
            <p className="mb-1 text-sm font-semibold text-green-600 dark:text-green-400">
              {service.price} {service.unit ? `/ ${service.unit}` : ""}
            </p>
          )}
          {service.Description && (
            <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
              {service.Description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StoreCard({
  store,
  onView,
}: {
  store: any;
  onView: (item: any) => void;
}) {
  const address =
    store.address ||
    (store.latitude && store.longitude
      ? `${store.latitude.substring(0, 8)}, ${store.longitude.substring(0, 8)}`
      : null);
  const operatingDays = formatOperatingDays(store.operating_hours);

  return (
    <div
      onClick={() => onView(store)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700">
          <Store className="h-6 w-6 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-base font-bold text-gray-900 dark:text-white">
            {store.name || "Store"}
          </h4>
          {store.description && (
            <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
              {store.description}
            </p>
          )}
          {address && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-500">
              {address}
            </p>
          )}
          {operatingDays && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
              {operatingDays}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContractCard({
  contract,
  onView,
}: {
  contract: any;
  onView: (item: any) => void;
}) {
  const statusColors: Record<string, string> = {
    active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    waiting_for_supplier:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    terminated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired: "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    draft: "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400",
  };

  const statusColor =
    statusColors[contract.status?.toLowerCase() || "active"] ||
    statusColors.active;

  return (
    <div
      onClick={() => onView(contract)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-bold text-gray-900 dark:text-white">
            {contract.title || `Contract #${contract.id?.slice(0, 8) || "N/A"}`}
          </h4>
          {contract.supplierCompany && (
            <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
              {contract.supplierCompany}
            </p>
          )}
        </div>
        <span
          className={`ml-2 flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${statusColor}`}
        >
          {contract.status?.replace("_", " ") || "Active"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {contract.created_at && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(contract.created_at).toLocaleDateString()}</span>
          </div>
        )}
        {contract.totalValue && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>
              {formatCurrencySync(contract.totalValue)}{" "}
              {contract.currency || "RWF"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function RFQOpportunityCard({
  rfq,
  onView,
  submittedQuotes,
}: {
  rfq: any;
  onView: (item: any) => void;
  submittedQuotes: Record<string, any>;
}) {
  const minBudget = rfq.min_budget ? parseFloat(rfq.min_budget) : 0;
  const maxBudget = rfq.max_budget ? parseFloat(rfq.max_budget) : 0;
  const budgetDisplay =
    minBudget > 0 && maxBudget > 0
      ? `${formatCurrencySync(minBudget)} - ${formatCurrencySync(maxBudget)}`
      : minBudget > 0
      ? `${formatCurrencySync(minBudget)}+`
      : maxBudget > 0
      ? `Up to ${formatCurrencySync(maxBudget)}`
      : "Not specified";

  const today = new Date();
  const deadline = rfq.response_date ? new Date(rfq.response_date) : null;
  const isUrgent =
    deadline &&
    deadline.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000 &&
    deadline > today;
  const isClosed = deadline && deadline < today;
  const status = isClosed ? "Closed" : isUrgent ? "Urgent" : "Open";

  const postedBy =
    rfq.business_account?.business_name ||
    rfq.contact_name ||
    "Unknown Business";

  const getDaysUntilDeadline = () => {
    if (!deadline) return null;
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <div
      onClick={() => onView(rfq)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-5 shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.97] dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 dark:hover:border-green-600"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 transition-opacity duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-teal-900/10" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <FileText
                  className="h-5 w-5 text-white"
                  style={{ color: "#ffffff", stroke: "#ffffff" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                  {rfq.title || `RFQ #${rfq.id?.slice(0, 8)}`}
                </h4>
              </div>
            </div>
            <div className="mb-2 ml-12 flex items-center gap-2 rounded-lg bg-gray-100/80 px-3 py-1.5 dark:bg-gray-700/50">
              <Building className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
                {postedBy}
              </span>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${
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
              {status === "Urgent" && (
                <AlertCircle className="h-3 w-3" style={{ color: "#ffffff" }} />
              )}
              {status}
            </span>
            {submittedQuotes[rfq.id] && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/30"
                style={{ color: "#ffffff" }}
              >
                <CheckCircle
                  className="h-3 w-3"
                  style={{ color: "#ffffff", stroke: "#ffffff" }}
                />
                <span style={{ color: "#ffffff" }}>Quote Sent</span>
              </span>
            )}
          </div>
        </div>
        {rfq.description && (
          <p className="ml-12 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {rfq.description}
          </p>
        )}
        <div className="ml-12 grid grid-cols-1 gap-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 dark:from-gray-700/30 dark:to-gray-800/30">
          {rfq.category && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Category
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {rfq.category}
                </p>
              </div>
            </div>
          )}
          {rfq.location && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {rfq.location}
                </p>
              </div>
            </div>
          )}
          {rfq.response_date && (
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  isUrgent
                    ? "bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30"
                    : "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30"
                }`}
              >
                <Calendar
                  className={`h-4 w-4 ${
                    isUrgent
                      ? "text-red-600 dark:text-red-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Deadline
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {new Date(rfq.response_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span
                      className={`ml-1 ${
                        isUrgent
                          ? "font-bold text-red-600 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      ({daysLeft} {daysLeft === 1 ? "day" : "days"} left)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {budgetDisplay}
              </p>
            </div>
            <p className="mt-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              Budget Range
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(rfq);
            }}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
            style={{ color: "#ffffff" }}
          >
            <Eye
              className="h-4 w-4"
              style={{ color: "#ffffff", stroke: "#ffffff" }}
            />
            <span style={{ color: "#ffffff" }}>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
