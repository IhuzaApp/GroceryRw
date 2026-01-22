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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <svg
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
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

            // Find delivery notes from any order in the group
            const deliveryNotes = orders.find(
              (o) => o.delivery_notes
            )?.delivery_notes;

            // Find customer comments from any order in the group
            const customerComment = orders.find((o) => o.comment)?.comment;

            return (
              <div
                key={customerId}
                className={`relative rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800 ${
                  isDelivered
                    ? "opacity-60 grayscale"
                    : "border-gray-200 shadow-md dark:border-gray-700"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
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
                  <div className="flex items-center gap-2">
                    {!isDelivered && (
                      <>
                        <button
                          onClick={() =>
                            handleDirectionsClick(
                              `${
                                address?.street || firstOrder.customerAddress
                              }, ${address?.city || ""}`
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                          title="Get Directions"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleChatClick(customerId, customer.name)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-white shadow-md transition-all duration-200 hover:bg-purple-600 hover:shadow-lg"
                          title="Chat with Customer"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (customer.phone) {
                              window.location.href = `tel:${customer.phone}`;
                            }
                          }}
                          disabled={!customer.phone}
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 hover:shadow-lg ${
                            customer.phone
                              ? "bg-green-500 hover:bg-green-600"
                              : "cursor-not-allowed bg-gray-400"
                          }`}
                          title={
                            customer.phone
                              ? "Call Customer"
                              : "No phone number available"
                          }
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                    {isDelivered && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-1 h-4 w-4 text-gray-400"
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
                    <div className="flex-1 space-y-1">
                      {/* Main address line */}
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {address?.street ||
                          firstOrder.customerAddress ||
                          "No Address"}
                      </p>

                      {/* City and postal code */}
                      {(address?.city || address?.postal_code) && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {address.city || ""}
                          {address.city && address.postal_code && ", "}
                          {address.postal_code || ""}
                        </p>
                      )}

                      {/* Address type and place details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {address?.type && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {address.type.charAt(0).toUpperCase() +
                              address.type.slice(1)}
                          </span>
                        )}

                        {/* Place details */}
                        {address?.placeDetails && (
                          <div className="flex flex-wrap gap-2">
                            {address.placeDetails.gateNumber && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                                Gate {address.placeDetails.gateNumber}
                              </span>
                            )}

                            {address.placeDetails.gateColor && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                                  />
                                </svg>
                                {address.placeDetails.gateColor}
                              </span>
                            )}

                            {address.placeDetails.floor && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                Floor {address.placeDetails.floor}
                              </span>
                            )}

                            {address.placeDetails.doorNumber && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                  />
                                </svg>
                                Door {address.placeDetails.doorNumber}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Notes */}
                {deliveryNotes && (
                  <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800/50">
                    <div className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-medium text-amber-900 dark:text-amber-100">
                          Delivery Notes
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          {deliveryNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Comments */}
                {customerComment && (
                  <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800/50">
                    <div className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                          Customer Comment
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {customerComment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isDelivered && (
                  <div className="space-y-3">
                    {(() => {
                      // Check if all orders in this customer group are ready for delivery
                      // (have invoice proofs uploaded and are in on_the_way/at_customer status)
                      const allOrdersReadyForDelivery = orders.every((o) => {
                        const hasInvoice =
                          (o as any).Invoice?.length > 0 ||
                          (o as any).invoice ||
                          uploadedProofs[o.id];
                        const isInDeliveryStatus =
                          o.status === "on_the_way" ||
                          o.status === "at_customer";
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
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
