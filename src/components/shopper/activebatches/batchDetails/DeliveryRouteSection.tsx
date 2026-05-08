"use client";

import React from "react";
import { Button } from "rsuite";
import { useTheme } from "../../../../context/ThemeContext";

interface Order {
  id: string;
  OrderID?: string;
  status: string;
  address?: any;
  orderedBy?: any;
  user?: any;
  customerName?: string;
  customerAddress?: string;
  shop?: any;
  shopName?: string;
  Invoice?: any[];
  invoice?: any;
  delivery_notes?: string;
  comment?: string;
}

interface Customer {
  name: string;
  phone?: string;
}

interface DeliveryRouteSectionProps {
  ordersByCustomer: Map<string, Order[]>;
  uploadedProofs: Record<string, any>;
  handleDirectionsClick: (address: string) => void;
  handleChatClick: (customerId: string, customerName: string) => void;
  getActionButton: (order: Order) => React.ReactNode;
  onConfirmDeliveryForCustomer?: (orders: Order[]) => void;
}

export default function DeliveryRouteSection({
  ordersByCustomer,
  uploadedProofs,
  handleDirectionsClick,
  handleChatClick,
  getActionButton,
  onConfirmDeliveryForCustomer,
}: DeliveryRouteSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-8 px-4 sm:px-0">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDark
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white sm:text-lg">
          Delivery Route
        </h2>
      </div>

      <div className="space-y-6">
        {Array.from(ordersByCustomer.entries()).map(
          ([customerId, orders], index) => {
            const firstOrder = orders[0];
            const customer: Customer = (firstOrder as any).orderedBy ||
              (firstOrder as any).user || {
                name: firstOrder.customerName || "Customer",
              };

            const address =
              firstOrder.address ||
              firstOrder.orderedBy?.Addresses?.find(
                (addr: any) => addr.is_default
              ) ||
              firstOrder.orderedBy?.Addresses?.[0] ||
              firstOrder.customerAddress ||
              orders.find((o) => o.address)?.address ||
              orders.find((o) => o.orderedBy?.Addresses?.[0])?.orderedBy
                ?.Addresses?.[0];

            const isDelivered = orders.every((o) => o.status === "delivered");
            const deliveryNotes = orders.find(
              (o) => o.delivery_notes
            )?.delivery_notes;
            const customerComment = orders.find((o) => o.comment)?.comment;

            return (
              <div
                key={customerId || index}
                className={`group relative rounded-[1.25rem] border p-5 transition-all duration-500 sm:p-6 ${
                  isDelivered
                    ? "border-transparent bg-black/5 opacity-60 grayscale dark:bg-white/5"
                    : isDark
                    ? "border-white/10 bg-white/5 shadow-sm hover:border-emerald-500/50 hover:bg-white/[0.07]"
                    : "border-black/5 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md"
                }`}
                style={{
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black transition-all ${
                        isDelivered
                          ? "bg-gray-200 text-gray-400 dark:bg-gray-800"
                          : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-lg">
                        {customer.name}
                        {isDelivered && (
                          <span className="ml-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                            Arrived
                          </span>
                        )}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {orders.length} Batch Item
                          {orders.length > 1 ? "s" : ""}
                        </span>
                        {customer.phone && (
                          <>
                            <span className="font-light text-gray-300 dark:text-gray-700">
                              •
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-tight text-sky-500">
                              {customer.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isDelivered && (
                    <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                      <ActionButton
                        onClick={() =>
                          handleDirectionsClick(
                            `${
                              address?.street || firstOrder.customerAddress
                            }, ${address?.city || ""}`
                          )
                        }
                        variant="emerald"
                        icon={
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 6.75l6 3m0 0l-6 3m6-3H3.75m16.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        }
                      />
                      <ActionButton
                        onClick={() =>
                          handleChatClick(customerId, customer.name)
                        }
                        variant="purple"
                        icon={
                          <path
                            d="M8 10.5H16M8 14.5H11M21.0039 12C21.0039 16.9706 16.9745 21 12.0039 21C9.9675 21 3.00463 21 3.00463 21C3.00463 21 4.56382 17.2561 3.93982 16.0008C3.34076 14.7956 3.00391 13.4372 3.00391 12C3.00391 7.02944 7.03334 3 12.0039 3C16.9745 3 21.0039 7.02944 21.0039 12Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        }
                      />
                      {customer.phone && (
                        <ActionButton
                          onClick={() => {
                            window.location.href = `tel:${customer.phone}`;
                          }}
                          variant="blue"
                          icon={
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                            />
                          }
                        />
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`mb-6 space-y-4 rounded-[1.5rem] border p-5 sm:p-6 ${
                    isDark
                      ? "border-white/5 bg-white/5"
                      : "border-black/5 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        isDark
                          ? "bg-white/10 text-gray-400"
                          : "bg-white text-gray-500 shadow-sm"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="11" r="3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">
                        Complete Address
                      </p>
                      <p className="mt-1 text-sm font-bold leading-relaxed tracking-tight text-gray-700 dark:text-gray-200">
                        {address?.street ||
                          firstOrder.customerAddress ||
                          "Location Unknown"}
                      </p>
                      {(address?.city || address?.postal_code) && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-tighter text-gray-400">
                          {address.city}
                          {address.city && address.postal_code ? " • " : ""}
                          {address.postal_code}
                        </p>
                      )}

                      {address?.placeDetails && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(
                            address.placeDetails as Record<string, any>
                          ).map(
                            ([key, val]) =>
                              val && (
                                <span
                                  key={key}
                                  className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                    isDark
                                      ? "bg-white/10 text-gray-300"
                                      : "border border-black/5 bg-white text-gray-500"
                                  }`}
                                >
                                  {key}: {val as any}
                                </span>
                              )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(deliveryNotes || customerComment) && (
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {deliveryNotes && (
                      <NoteCard
                        label="Delivery Notes"
                        text={deliveryNotes}
                        color="amber"
                      />
                    )}
                    {customerComment && (
                      <NoteCard
                        label="Customer Comment"
                        text={customerComment}
                        color="blue"
                      />
                    )}
                  </div>
                )}

                {!isDelivered && (
                  <div className="space-y-3">
                    {(() => {
                      const allOrdersReady = orders.every((o) => {
                        const hasInv =
                          (o as any).Invoice?.length > 0 ||
                          (o as any).invoice ||
                          uploadedProofs[o.id];
                        return (
                          hasInv &&
                          (o.status === "on_the_way" ||
                            o.status === "at_customer")
                        );
                      });

                      if (allOrdersReady && orders.length > 1) {
                        return orders.map((o) => (
                          <div
                            key={o.id}
                            className={`flex items-center justify-between rounded-xl border px-5 py-3 ${
                              isDark
                                ? "border-emerald-500/10 bg-emerald-500/5"
                                : "border-emerald-100 bg-emerald-50"
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">
                              Order Locked
                            </span>
                            <span className="text-xs font-black text-emerald-600">
                              #{o.OrderID || o.id.slice(-8)}
                            </span>
                          </div>
                        ));
                      } else {
                        // Hide individual action buttons on mobile if it's a single order for a single customer
                        // (because BottomActionButton will already show the confirm delivery button)
                        // But keep them for combined orders (orders.length > 1) as requested
                        const isSingleOrderBatch =
                          ordersByCustomer.size === 1 && orders.length === 1;

                        return orders.map((o) => (
                          <div
                            key={o.id}
                            className={`[&>button]:!w-full [&>button]:!rounded-xl [&>button]:!py-3.5 [&>button]:!text-[10px] [&>button]:!font-black [&>button]:!uppercase [&>button]:!tracking-widest [&>button]:!transition-all [&>button]:active:scale-[0.99] ${
                              isSingleOrderBatch ? "hidden" : ""
                            }`}
                          >
                            {getActionButton(o)}
                          </div>
                        ));
                      }
                    })()}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  variant,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  variant: "blue" | "purple" | "emerald";
}) {
  const colors = {
    blue: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30",
    purple:
      "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30",
    emerald:
      "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30",
  };
  return (
    <button
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-all hover:scale-110 active:scale-95 sm:h-11 sm:w-11 ${colors[variant]}`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        {icon}
      </svg>
    </button>
  );
}

function NoteCard({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: "amber" | "blue";
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = {
    amber: isDark
      ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
      : "bg-amber-50 border-amber-100 text-amber-800",
    blue: isDark
      ? "bg-blue-500/10 border-blue-500/20 text-blue-200"
      : "bg-blue-50 border-blue-100 text-blue-800",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="mb-1 text-[9px] font-black uppercase tracking-widest opacity-60">
        {label}
      </p>
      <p className="text-xs font-bold leading-relaxed">{text}</p>
    </div>
  );
}
