import React from "react";
import { Button } from "rsuite";

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
}

export default function DeliveryRouteSection({
  ordersByCustomer,
  uploadedProofs,
  handleDirectionsClick,
  handleChatClick,
  getActionButton,
}: DeliveryRouteSectionProps) {
  return (
    <div className="space-y-6 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Delivery Route
        </h2>
      </div>

      <div className="space-y-4">
        {Array.from(ordersByCustomer.entries()).map(
          ([customerId, orders], index) => {
            const firstOrder = orders[0];
            const customer: Customer = (firstOrder as any).orderedBy ||
              (firstOrder as any).user || {
                name: firstOrder.customerName || "Customer",
              };

            // Get address from multiple possible sources (order.address, orderedBy.Addresses, customerAddress, etc.)
            const address =
              firstOrder.address ||
              firstOrder.orderedBy?.Addresses?.find(
                (addr: any) => addr.is_default
              ) ||
              firstOrder.orderedBy?.Addresses?.[0] ||
              firstOrder.customerAddress ||
              // For combined orders, try to find address from other orders in the group
              orders.find((o) => o.address)?.address ||
              orders.find((o) => o.orderedBy?.Addresses?.[0])?.orderedBy
                ?.Addresses?.[0];

            const isDelivered = orders.every((o) => o.status === "delivered");

            return (
              <div
                key={customerId}
                className={`relative rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800 ${
                  isDelivered
                    ? "opacity-60 grayscale"
                    : "border-blue-200 shadow-md dark:border-blue-900"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {customer.name}
                        {customer.phone && (
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            • {customer.phone}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {orders.length} Order{orders.length > 1 ? "s" : ""} to
                        deliver
                      </p>
                    </div>
                  </div>
                  {isDelivered && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Completed
                    </span>
                  )}
                </div>

                <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-1 h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {address?.street ||
                        firstOrder.customerAddress ||
                        "No Address"}
                      , {address?.city || ""}
                    </p>
                  </div>
                </div>

                {!isDelivered && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        appearance="primary"
                        color="blue"
                        block
                        onClick={() =>
                          handleDirectionsClick(
                            `${
                              address?.street || firstOrder.customerAddress
                            }, ${address?.city || ""}`
                          )
                        }
                      >
                        Directions
                      </Button>
                      <Button
                        appearance="ghost"
                        color="violet"
                        block
                        onClick={() =>
                          handleChatClick(customerId, customer.name)
                        }
                      >
                        Chat
                      </Button>
                    </div>

                    <div className="space-y-3 pt-2">
                      {(() => {
                        // Check if all orders in this customer group are ready for delivery
                        // (have invoice proofs uploaded and are in on_the_way/at_customer status)
                        const allOrdersReadyForDelivery = orders.every((o) => {
                          const hasInvoice =
                            (o as any).Invoice?.length > 0 ||
                            (o as any).invoice ||
                            uploadedProofs[o.id];
                          const isInDeliveryStatus =
                            o.status === "on_the_way" || o.status === "at_customer";
                          return hasInvoice && isInDeliveryStatus;
                        });

                        // If all orders are ready for delivery, show order cards without buttons
                        // The bottom button will handle unified delivery confirmation
                        if (allOrdersReadyForDelivery && orders.length > 1) {
                          return orders.map((o) => {
                            const hasInvoice =
                              (o as any).Invoice?.length > 0 ||
                              (o as any).invoice ||
                              uploadedProofs[o.id];

                            return (
                              <div
                                key={o.id}
                                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                              >
                                {/* No individual button - bottom button handles unified delivery */}
                                <div className="text-center text-xs text-slate-500">
                                  Ready for delivery
                                </div>
                              </div>
                            );
                          });
                        } else {
                          // Show individual buttons for each order
                          return orders.map((o) => {
                            const hasInvoice =
                              (o as any).Invoice?.length > 0 ||
                              (o as any).invoice ||
                              uploadedProofs[o.id];

                            return (
                              <div
                                key={o.id}
                                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                              >
                                {/* Hidden: Order ID, Invoice status, and Shop name section */}
                                {/* <div className="mb-3 flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    #{o.OrderID || o.id.slice(-8)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {hasInvoice && (
                                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[9px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        <svg
                                          className="h-3 w-3"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        Invoice
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-500">
                                      {(o as any).shop?.name || o.shopName}
                                    </span>
                                  </div>
                                </div> */}
                                {getActionButton(o)}
                              </div>
                            );
                          });
                        }
                      })()}
                    </div>
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