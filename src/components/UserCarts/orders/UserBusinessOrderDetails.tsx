import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "../../../lib/formatCurrency";

function ProductImageCell({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = src && String(src).trim();
  if (!url || failed) {
    return (
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
        <span className="text-xs">No img</span>
      </div>
    );
  }
  return (
    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return new Date(timestamp).toLocaleDateString();
}

export type SupportTicketInfo = { ticket_num: number; status: string } | null;

interface UserBusinessOrderDetailsProps {
  order: any;
  isMobile?: boolean;
  onContactSupport?: () => void;
  supportTicket?: SupportTicketInfo;
}

export default function UserBusinessOrderDetails({
  order,
  isMobile = false,
  onContactSupport,
  supportTicket,
}: UserBusinessOrderDetailsProps) {
  const products = Array.isArray(order?.allProducts) ? order.allProducts : [];
  const shop = order?.shop;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order #{formatOrderID(order?.OrderID)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Placed {timeAgo(order?.created_at || "")}
          </p>
        </div>
        <Link
          href="/CurrentPendingOrders"
          className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Pickup PIN - Desktop (mobile shows PIN in parent) */}
      {!isMobile && order?.pin && (
        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider !text-white">
                Pickup PIN
              </p>
              <p className="mt-0.5 text-[10px] !text-white/90">
                Show to Plaser
              </p>
            </div>
            <div className="rounded-lg border-2 border-dashed border-white/30 bg-white/10 px-5 py-2">
              <span className="text-2xl font-black tracking-wider !text-white">
                {order.pin}
              </span>
            </div>
          </div>
        </div>
      )}

      {shop && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            {shop.image && (
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={shop.image}
                  alt={shop.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {shop.name}
              </h2>
              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Store order
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Status
        </h3>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            (order?.status || "").toLowerCase() === "delivered"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
          }`}
        >
          {order?.status || "Pending"}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Items
        </h3>
        <ul className="space-y-3">
          {products.length === 0 ? (
            <li className="text-sm text-gray-500 dark:text-gray-400">
              No items
            </li>
          ) : (
            products.map((p: any, idx: number) => (
              <li
                key={p.id || idx}
                className="flex items-center gap-4 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700"
              >
                <ProductImageCell src={p.image ?? p.Image} alt={p.name || "Item"} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {p.name || "Item"}
                  </p>
                  {p.selectedDetails &&
                    typeof p.selectedDetails === "object" &&
                    Object.keys(p.selectedDetails).length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Object.entries(p.selectedDetails)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {p.quantity || 0} {p.unit || ""}
                  </p>
                </div>
                <p className="flex-shrink-0 font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(
                    (p.price_per_item || p.price || 0) * (p.quantity || 0)
                  )}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Order total
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>{formatCurrency(order?.subtotal ?? 0)}</span>
          </div>
          {(order?.service_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Service fee</span>
              <span>{formatCurrency(order.service_fee)}</span>
            </div>
          )}
          {(order?.transportation_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Delivery fee</span>
              <span>{formatCurrency(order.transportation_fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-gray-600 dark:text-white">
            <span>Total</span>
            <span>{formatCurrency(order?.total ?? 0)}</span>
          </div>
        </div>
      </div>

      {order?.deliveryAddress && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
            Delivery address
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.deliveryAddress}
          </p>
          {order?.timeRange && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Time: {order.timeRange}
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          Support
        </h3>
        {supportTicket && (
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Ticket #{supportTicket.ticket_num} — {supportTicket.status}
          </p>
        )}
        {onContactSupport ? (
          <button
            type="button"
            onClick={onContactSupport}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Contact support
          </button>
        ) : !supportTicket ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact support from the order list.
          </p>
        ) : null}
      </div>
    </div>
  );
}
