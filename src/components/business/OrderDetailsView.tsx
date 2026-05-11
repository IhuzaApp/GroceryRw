"use client";

import {
  CheckCircle,
  Truck,
  Loader2,
  MapPin,
  X,
  Package,
  ZoomIn,
  Image as LucideImageIcon,
  Calendar,
  ChevronLeft,
  FileText,
  Send,
  Download,
  Paperclip,
  MessageSquare,
  User,
} from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { generateInvoicePDF } from "../../utils/invoiceGenerator";
import Image from "next/image";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price_per_item: number;
  quantity: number;
  unit: string;
  measurement_type?: string;
  image?: string;
  selectedDetails?: Record<string, string>;
}

interface Order {
  id: string;
  orderId: string;
  store: string;
  items: string;
  itemsCount: number;
  value: number;
  status: string;
  deliveryDate: string;
  deliveryTime: string;
  tracking: string;
  transportation_fee: number;
  service_fee: number;
  units: number;
  deliveryAddress: string;
  comment: string | null;
  created_at: string;
  store_image: string | null;
  latitude: string;
  longitude: string;
  allProducts: Product[];
  shoppers?: {
    id: string;
    full_name: string;
    profile_photo: string | null;
    phone_number: string | null;
    email: string | null;
    userId?: string | null;
  } | null;
  shopper_id?: string | null;
  orderedBy?: {
    id: string;
    name: string;
    profile_picture: string;
    phone: string;
    email: string;
  } | null;
}

interface OrderDetailsViewProps {
  order: Order;
  onBack: () => void;
  onConfirmAvailability: (orderId: string) => Promise<void>;
  updatingStatus: boolean;
  getStatusBadgeStyles: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  onMessageShopper: (
    shopperId: string,
    orderId: string,
    name: string,
    shopperUserId?: string
  ) => void;
  onMessageCustomer: (
    customerId: string, 
    orderDbId: string, 
    orderDisplayId: string, 
    name: string,
    itemName?: string,
    customerAvatar?: string
  ) => void;
}

export function OrderDetailsView({
  order,
  onBack,
  onConfirmAvailability,
  updatingStatus,
  getStatusBadgeStyles,
  getStatusIcon,
  onMessageShopper,
  onMessageCustomer,
}: OrderDetailsViewProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateInvoice = async () => {
    try {
      await generateInvoicePDF({
        orderId: order.orderId,
        date: new Date(order.created_at).toLocaleDateString(),
        customerName: order.orderedBy?.name || "Customer",
        customerEmail: order.orderedBy?.email || "N/A",
        customerPhone: order.orderedBy?.phone || "N/A",
        items: order.allProducts.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price_per_item,
          unit: p.unit || p.measurement_type || "",
        })),
        subtotal: order.value,
        transportation: order.transportation_fee,
        serviceFee: order.service_fee,
        total: order.value - order.transportation_fee - order.service_fee,
        storeName: order.store,
        status: order.status,
      });
      toast.success("Invoice generated successfully!");
    } catch (err) {
      toast.error("Failed to generate invoice");
      console.error(err);
    }
  };

  const handleSendToCustomer = () => {
    toast.success(`Invoice sent to ${order.orderedBy?.name || "customer"}!`);
    // Logic for sending email/message would go here
  };

  const handleAttachInvoice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Invoice "${file.name}" attached successfully!`);
      // Logic for uploading file to storage would go here
    }
  };

  const handleViewLocation = (deliveryAddress: string) => {
    const encodedAddress = encodeURIComponent(deliveryAddress);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen animate-in fade-in slide-in-from-right-8 duration-500 pb-20 bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">
              Order #{order.orderId}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(
            order.status
          )}`}
        >
          {getStatusIcon(order.status)}
          {order.status}
        </span>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content (Products) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-gray-400">
                Products Ordered
              </h3>
              <div className="space-y-4">
                {Array.isArray(order.allProducts) &&
                order.allProducts.length > 0 ? (
                  order.allProducts.map((product: Product, index: number) => (
                    <div
                      key={product.id || index}
                      className="group rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-green-200 dark:border-gray-700 dark:bg-gray-900/40"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {product.image ? (
                          <div className="flex-shrink-0">
                            <div
                              className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-all duration-300 hover:border-green-500 hover:shadow-lg dark:border-gray-600 md:h-24 md:w-24"
                              onClick={() => setExpandedImage(product.image!)}
                            >
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 md:h-24 md:w-24">
                            <LucideImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex flex-1 items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">
                              {product.name}
                            </h4>
                            {product.selectedDetails &&
                              typeof product.selectedDetails === "object" &&
                              Object.keys(product.selectedDetails).length >
                                0 && (
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                  {Object.entries(product.selectedDetails).map(
                                    ([k, v]) => (
                                      <span
                                        key={k}
                                        className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-400"
                                      >
                                        {k}: {v}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            <p className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                              Qty: {product.quantity}{" "}
                              {product.unit || product.measurement_type || ""}
                            </p>
                            <p className="mt-1 text-xs font-bold text-gray-400">
                              {formatCurrencySync(product.price_per_item)} / unit
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatCurrencySync(
                                product.price_per_item * product.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-sm font-bold text-gray-400">
                    No product details available
                  </p>
                )}
              </div>
            </div>

            {/* Order Comment */}
            {order.comment && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                  Order Comment
                </h3>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/40">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {order.comment}
                  </p>
                </div>
              </div>
            )}

            {/* Shopper Information Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                Assigned Shopper
              </h3>
              {order.shopper_id ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-green-500 bg-white dark:bg-gray-800">
                      {order.shoppers?.profile_photo ? (
                        <Image
                          src={order.shoppers.profile_photo}
                          alt={order.shoppers.full_name || "Shopper"}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {order.shoppers?.full_name || "Assigning Shopper..."}
                      </p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {order.shoppers?.phone_number || "Contact info pending"}
                      </p>
                    </div>
                  </div>
                  {order.shoppers && (
                    <button
                      onClick={() =>
                        onMessageShopper(
                          order.shopper_id!,
                          order.orderId,
                          order.shoppers?.full_name || "Shopper",
                          order.shoppers?.userId || ""
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 active:scale-95"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Shopper
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    No shopper assigned to this order yet.
                  </p>
                </div>
              )}
            </div>

            {/* Invoice Management Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                Invoice Management
              </h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={handleGenerateInvoice}
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-green-200 py-3 text-xs font-bold uppercase tracking-wider text-green-700 transition-colors hover:bg-green-50 dark:border-green-800/40 dark:text-green-300 dark:hover:bg-green-900/30"
                >
                  <FileText className="h-4 w-4" />
                  Generate Invoice
                </button>
                <div className="flex flex-1 gap-3">
                  <button
                    onClick={handleSendToCustomer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAttachInvoice}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Summary & Actions) */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrencySync(order.value)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Transportation</span>
                  <span>{formatCurrencySync(order.transportation_fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Service Fee</span>
                  <span>{formatCurrencySync(order.service_fee)}</span>
                </div>
                <div className="my-2 border-t border-dashed border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrencySync(
                      order.value -
                        order.transportation_fee -
                        order.service_fee
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                Customer Details
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    {order.orderedBy?.profile_picture ? (
                      <Image
                        src={order.orderedBy.profile_picture}
                        alt={order.orderedBy.name}
                        width={48}
                        height={48}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-base font-bold text-gray-900 dark:text-white">
                      {order.orderedBy?.name || "Anonymous Customer"}
                    </p>
                    <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                      {order.orderedBy?.email || "No email provided"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onMessageCustomer(
                      order.orderedBy?.id || "",
                      order.id,
                      order.orderId,
                      order.orderedBy?.name || "Customer",
                      order.items || order.allProducts[0]?.name,
                      order.orderedBy?.profile_picture
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 py-3 text-xs font-bold uppercase tracking-wider text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Customer
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400">
                Delivery Details
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Address
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Delivery Window
                    </p>
                    <p className="text-sm font-bold text-black dark:text-white">
                      {order.deliveryDate}
                    </p>
                    <p className="text-xs font-bold text-gray-500">
                      {order.deliveryTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewLocation(order.deliveryAddress)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-black uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <MapPin className="h-4 w-4" />
                  View Map
                </button>
              </div>
            </div>

            {/* Availability Confirmation Section */}
            {(order.status === "Pending" || order.status === "Processing") && (
              <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-sm dark:border-orange-800/40 dark:from-orange-900/20 dark:to-yellow-900/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Ready for Pickup?
                    </h3>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      Confirm all items are ready.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onConfirmAvailability(order.id)}
                  disabled={updatingStatus}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 py-4 text-sm font-black uppercase tracking-wider !text-white shadow-lg transition-all hover:from-orange-600 hover:to-yellow-600 active:scale-95 disabled:opacity-50"
                >
                  {updatingStatus ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Confirm Availability"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-gray-800">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative h-full w-full">
              <img
                src={expandedImage}
                alt="Expanded product image"
                className="max-h-[85vh] w-auto object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
