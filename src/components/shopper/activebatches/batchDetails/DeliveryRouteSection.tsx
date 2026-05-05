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
                key={customerId}
                className={`group relative rounded-[2.5rem] border p-6 transition-all duration-500 sm:p-8 ${
                  isDelivered
                    ? "border-transparent bg-black/5 opacity-60 grayscale dark:bg-white/5"
                    : isDark
                    ? "border-white/10 bg-white/5 shadow-2xl shadow-emerald-500/5 hover:border-emerald-500/50 hover:bg-white/[0.07]"
                    : "border-black/5 bg-white shadow-xl hover:border-emerald-200 hover:shadow-2xl"
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
                        variant="blue"
                        icon={
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        }
                      />
                      {customer.phone && (
                        <ActionButton
                          onClick={() => {
                            window.location.href = `tel:${customer.phone}`;
                          }}
                          variant="emerald"
                          icon={
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
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
                          {Object.entries(address.placeDetails as Record<string, any>).map(
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
                        const isSingleOrderBatch = ordersByCustomer.size === 1 && orders.length === 1;
                        
                        return orders.map((o) => (
                          <div
                            key={o.id}
                            className={`[&>button]:!w-full [&>button]:!rounded-2xl [&>button]:!py-5 [&>button]:!text-xs [&>button]:!font-black [&>button]:!uppercase [&>button]:!tracking-[0.2em] [&>button]:!transition-all [&>button]:active:scale-95 ${
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
    blue: "bg-blue-500 shadow-blue-500/30",
    purple: "bg-purple-500 shadow-purple-500/30",
    emerald: "bg-emerald-500 shadow-emerald-500/30",
  };
  return (
    <button
      onClick={onClick}
      className={`flex h-14 flex-1 items-center justify-center rounded-2xl text-white shadow-lg transition-all hover:scale-105 active:scale-95 sm:h-12 sm:w-12 ${colors[variant]}`}
    >
      <svg
        className="h-6 w-6"
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
