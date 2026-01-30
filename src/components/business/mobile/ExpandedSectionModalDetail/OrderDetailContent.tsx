"use client";

import {
  ShoppingCart,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Truck,
  Store,
} from "lucide-react";
import { formatCurrencySync } from "../../../../utils/formatCurrency";

interface OrderDetailContentProps {
  loadingOrderDetails: boolean;
  orderDetails: any;
}

export function OrderDetailContent({
  loadingOrderDetails,
  orderDetails,
}: OrderDetailContentProps) {
  if (loadingOrderDetails) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 p-5 dark:from-gray-700 dark:to-gray-800">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-6 w-32 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-4 w-40 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="h-8 w-24 rounded-xl bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
              >
                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-600" />
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50"
              >
                <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-600" />
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
              >
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            ))}
            <div className="mt-4 border-t-2 border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex items-center justify-between rounded-xl bg-gray-200 p-4 dark:bg-gray-700">
                <div className="h-5 w-28 rounded bg-gray-300 dark:bg-gray-600" />
                <div className="h-6 w-32 rounded bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Order details not found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unable to load order details
        </p>
      </div>
    );
  }

  const order = orderDetails;

  return (
    <>
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 p-5 shadow-xl dark:from-green-900 dark:via-green-800 dark:to-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-24 w-24 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                  <ShoppingCart
                    className="h-6 w-6 text-white"
                    style={{ color: "#ffffff" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#ffffff" }}
                  >
                    Order ID
                  </p>
                  <h4
                    className="mt-1 font-mono text-2xl font-bold"
                    style={{ color: "#ffffff" }}
                  >
                    {order.allProducts?.[0]?.query_id ||
                      order.query_id ||
                      order.orderId ||
                      order.id?.slice(0, 8) ||
                      "N/A"}
                  </h4>
                </div>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "#ffffff" }}
              >
                <Calendar className="h-4 w-4" style={{ color: "#ffffff" }} />
                <span>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : "Date not available"}
                </span>
              </div>
            </div>
            <span
              className={`rounded-xl px-4 py-2 text-xs font-bold shadow-lg ${
                order.status === "completed" || order.status === "Delivered"
                  ? "bg-green-500"
                  : order.status === "pending" || order.status === "Pending"
                  ? "bg-yellow-500"
                  : order.status === "cancelled" || order.status === "Cancelled"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{ color: "#ffffff" }}
            >
              {order.status?.toUpperCase() || "ACTIVE"}
            </span>
          </div>
        </div>
      </div>

      {order.orderedBy && (
        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3 dark:from-blue-900/30 dark:to-indigo-900/30">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
              Customer Information
            </h5>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <div className="rounded-lg bg-white p-2 dark:bg-gray-600">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Name
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                  {order.orderedBy.name || "N/A"}
                </p>
              </div>
            </div>
            {order.orderedBy.email && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <div className="rounded-lg bg-white p-2 dark:bg-gray-600">
                  <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {order.orderedBy.email}
                  </p>
                </div>
              </div>
            )}
            {order.orderedBy.phone && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <div className="rounded-lg bg-white p-2 dark:bg-gray-600">
                  <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                    {order.orderedBy.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {order.Order_Items && order.Order_Items.length > 0 && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h5 className="mb-3 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Order Items ({order.Order_Items.length})
          </h5>
          <div className="space-y-3">
            {order.Order_Items.map((item: any, index: number) => (
              <div
                key={item.id || index}
                className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50"
              >
                {item.product?.image || item.product?.ProductName?.image ? (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600">
                    <img
                      src={
                        item.product.image || item.product.ProductName?.image
                      }
                      alt={item.product?.ProductName?.name || "Product"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                    <Package className="hidden h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h6 className="mb-1 font-semibold text-gray-900 dark:text-white">
                    {item.product?.ProductName?.name ||
                      item.product?.name ||
                      "Product"}
                  </h6>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {item.price || item.product?.price || "0"} RF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.deliveryAddress && (
        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-red-100 to-pink-100 p-3 dark:from-red-900/30 dark:to-pink-900/30">
              <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
              Delivery Address
            </h5>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
            <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-white">
              {order.deliveryAddress}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3 shadow-md dark:from-green-900/30 dark:to-emerald-900/30">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h5 className="text-lg font-bold text-gray-900 dark:text-white">
            Order Summary
          </h5>
        </div>
        <div className="space-y-3">
          {order.service_fee && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 shadow-sm dark:bg-gray-700/50">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Service Fee
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrencySync(parseFloat(order.service_fee.toString()))}
              </span>
            </div>
          )}
          {order.transportation_fee && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 shadow-sm dark:bg-gray-700/50">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Transportation Fee
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrencySync(
                  parseFloat(order.transportation_fee.toString())
                )}
              </span>
            </div>
          )}
          <div className="mt-4 border-t-2 border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 shadow-lg">
              <span
                className="text-base font-bold"
                style={{ color: "#ffffff" }}
              >
                Total Amount
              </span>
              <span className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                {order.value
                  ? formatCurrencySync(parseFloat(order.value.toString()))
                  : formatCurrencySync(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {(order.deliveryDate || order.deliveryTime || order.comment) && (
        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 p-3 dark:from-orange-900/30 dark:to-amber-900/30">
              <Truck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
              Delivery Information
            </h5>
          </div>
          <div className="space-y-3">
            {order.deliveryDate && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <Calendar className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Delivery Date
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                    {order.deliveryDate}
                  </p>
                </div>
              </div>
            )}
            {order.deliveryTime && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <Clock className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Delivery Time
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                    {order.deliveryTime}
                  </p>
                </div>
              </div>
            )}
            {order.comment && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Order Comment
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {order.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {order.store && (
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-3 dark:from-purple-900/30 dark:to-pink-900/30">
              <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
              Store Information
            </h5>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Store Name
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {order.store}
              </p>
            </div>
            {order.store_image && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <img
                  src={order.store_image}
                  alt={order.store}
                  className="h-32 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {order.shopper && (
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 p-3 dark:from-cyan-900/30 dark:to-blue-900/30">
              <Truck className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
              Assigned Shopper
            </h5>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Shopper Name
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {order.shopper.name || "Not assigned"}
              </p>
            </div>
            {order.shopper.phone && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <Phone className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <div className="flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {order.shopper.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
