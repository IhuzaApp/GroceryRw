import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const products = Array.isArray(order?.allProducts) ? order.allProducts : [];
  const shop = order?.shop;

  // Shopper details (same shape as regular orders for "Your Plaser" panel)
  const shopper = order?.Shoppers?.shopper;
  const shopperPhone = shopper?.phone_number || order?.Shoppers?.phone;
  const shopperName = shopper?.full_name || order?.Shoppers?.name || "Plaser";
  const shopperProfilePhoto =
    shopper?.profile_photo || order?.Shoppers?.profile_picture;
  const hasShopper = order?.Shoppers && (shopper || order?.shopper_id);

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
              : (order?.status || "").toLowerCase() === "cancelled"
              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
          }`}
        >
          {order?.status || "Pending"}
        </span>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left column - Order details */}
        <div className="w-full space-y-6 md:w-2/3">
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
                    <ProductImageCell
                      src={p.image ?? p.Image}
                      alt={p.name || "Item"}
                    />
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
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98] dark:focus:ring-offset-gray-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-5 w-5 shrink-0 !text-white transition-transform [stroke:white] group-hover:scale-110"
                >
                  <path
                    d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="!text-white">Contact support</span>
              </button>
            ) : !supportTicket ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact support from the order list.
              </p>
            ) : null}
          </div>
        </div>

        {/* Right column - Your Plaser (desktop only) */}
        <div className="hidden w-full md:block md:w-1/3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="rounded-t-xl bg-gradient-to-br from-green-50 to-green-100/50 px-6 py-5 dark:from-green-900/20 dark:to-green-800/10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Plaser
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {order?.status === "delivered"
                  ? "Completed your order"
                  : "Assigned to your order"}
              </p>
            </div>

            {hasShopper ? (
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-green-600 ring-2 ring-green-100 dark:ring-green-900/30">
                    {shopperProfilePhoto ? (
                      <Image
                        src={shopperProfilePhoto}
                        alt={shopperName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <svg
                        className="h-7 w-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {shopperName}
                    </h3>
                    {shopperPhone && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {shopperPhone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (shopperPhone)
                        window.location.href = `tel:${shopperPhone}`;
                    }}
                    disabled={order?.status === "delivered" || !shopperPhone}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-green-500 to-green-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="h-4 w-4"
                    >
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Call
                  </button>
                  <button
                    type="button"
                    disabled={order?.status === "delivered"}
                    onClick={() => {
                      if (order?.id && order.status !== "delivered") {
                        router.push(`/Messages?orderId=${order.id}`);
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 border-green-500 bg-white px-3 py-2 text-xs font-semibold text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-600 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/20"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="h-4 w-4"
                    >
                      <path
                        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Message
                  </button>
                </div>

                {order?.Shoppers?.Ratings && order.Shoppers.Ratings.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Ratings &amp; Reviews
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {order.Shoppers.Ratings.length} review
                        {order.Shoppers.Ratings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                      {order.Shoppers.Ratings.map((rating: any) => (
                        <div
                          key={rating.id}
                          className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            {rating.reviewed_at && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                  rating.reviewed_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                            <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-yellow-50 px-2 py-0.5 dark:bg-yellow-900/20">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < Number(rating.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                                  }`}
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                                {Number(rating.rating || 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {rating.review && (
                            <p className="text-left text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                              {rating.review}
                            </p>
                          )}
                          {(rating.packaging_quality ||
                            rating.delivery_experience ||
                            rating.professionalism) && (
                            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                              {rating.packaging_quality && (
                                <span className="rounded bg-gray-200/80 px-1.5 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Packaging:{" "}
                                  {Number(rating.packaging_quality).toFixed(1)}
                                </span>
                              )}
                              {rating.delivery_experience && (
                                <span className="rounded bg-gray-200/80 px-1.5 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Delivery:{" "}
                                  {Number(rating.delivery_experience).toFixed(
                                    1
                                  )}
                                </span>
                              )}
                              {rating.professionalism && (
                                <span className="rounded bg-gray-200/80 px-1.5 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Professionalism:{" "}
                                  {Number(rating.professionalism).toFixed(1)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-8 w-8 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  No Plaser assigned yet
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Waiting for assignment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
