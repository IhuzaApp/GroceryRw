import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "../../../lib/formatCurrency";

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
                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700"
              >
                <div>
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
                <p className="font-semibold text-gray-900 dark:text-white">
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
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{formatCurrency(order?.total ?? 0)}</span>
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

      {onContactSupport && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={onContactSupport}
            className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Contact support
            {supportTicket && (
              <span className="ml-2 text-gray-500">
                (Ticket #{supportTicket.ticket_num})
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
