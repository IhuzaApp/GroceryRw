import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { Button } from "rsuite";
import ShopperLayout from "../../../../src/components/shopper/ShopperLayout";
import { formatCurrency } from "../../../../src/lib/formatCurrency";
import { useTheme } from "../../../../src/context/ThemeContext";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
  description?: string;
}

interface InvoiceData {
  id: string;
  orderId: string;
  invoiceNumber: string;
  orderNumber: string;
  orderType?: string;
  status: string;
  dateCreated: string;
  dateCompleted: string;
  shop: string;
  shopAddress: string;
  customer: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  Proof?: string;
  delivery_photo_url?: string;
}

interface InvoicePageProps {
  initialInvoiceData: InvoiceData | null;
  error: string | null;
}

function InvoicePage({ initialInvoiceData, error }: InvoicePageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(
    initialInvoiceData
  );
  const [loading, setLoading] = useState(!initialInvoiceData);
  const [errorMessage, setErrorMessage] = useState<string | null>(error);
  const [orderType, setOrderType] = useState<string>("regular");
  const [showProofModal, setShowProofModal] = useState(false);

  useEffect(() => {
    if (initialInvoiceData?.orderType) {
      setOrderType(initialInvoiceData.orderType);
    }
  }, [initialInvoiceData]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!id || !loading) return;

      try {
        setLoading(true);
        const idString = Array.isArray(id) ? id[0] : id;
        let actualId = idString ? idString.split("#")[0] : "";
        actualId = actualId.replace(/^(reel-|order-)/, "");

        if (typeof id === "string" && id.includes("#")) {
          const hash = id.split("#")[1];
          setOrderType(hash === "reel" ? "reel" : "regular");
        }

        const response = await fetch(`/api/invoices/${actualId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch invoice: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.invoice) {
          throw new Error("No invoice data returned from API");
        }

        setInvoiceData(data.invoice);
        if (data.invoice.orderType) {
          setOrderType(data.invoice.orderType);
        }
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load invoice"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id, loading]);

  const handleDownload = async () => {
    if (!invoiceData) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceData.id}?pdf=true`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Failed to download invoice: ${error.message}`
          : "Failed to download invoice"
      );
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <ShopperLayout>
        <div className="relative min-h-screen transition-colors duration-300">
          {/* Background Decorative Gradients */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5"></div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
            <div className="animate-pulse">
              {/* Back Button Skeleton */}
              <div className="mb-8 h-12 w-48 rounded-2xl bg-gray-300/50 dark:bg-gray-700/50"></div>

              {/* Main Document Skeleton */}
              <div
                className={`overflow-hidden rounded-3xl border p-8 backdrop-blur-2xl sm:p-14 ${
                  theme === "dark"
                    ? "border-gray-700/50 bg-gray-900/40"
                    : "border-white/60 bg-white/70"
                }`}
              >
                <div className="mb-12 flex justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-32 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                    <div className="h-12 w-48 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                  </div>
                  <div className="h-20 w-20 rounded-2xl bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>

                <div className="mb-12 h-32 rounded-3xl bg-gray-300/20 dark:bg-gray-700/20"></div>

                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-gray-200/20 pb-6 dark:border-gray-700/20"
                    >
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-300/50 dark:bg-gray-700/50"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-48 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                          <div className="h-3 w-32 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                        </div>
                      </div>
                      <div className="h-6 w-24 rounded bg-gray-300/50 dark:bg-gray-700/50"></div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex justify-end">
                  <div className="h-32 w-full max-w-sm rounded-3xl bg-emerald-500/20 dark:bg-emerald-500/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  if (errorMessage || !invoiceData) {
    return (
      <ShopperLayout>
        <div className="min-h-screen p-4">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className={`mx-auto h-16 w-16 ${
                      theme === "dark" ? "text-red-400" : "text-red-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                  Error Loading Invoice
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  {errorMessage || "Invoice data not available"}
                </p>
                <Button
                  appearance="primary"
                  onClick={goBack}
                  className="rounded-lg px-6 py-2 font-medium"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  // Calculate VAT (0% for now)
  const vat = 0;

  // Get proof image URL
  const proofImageUrl = invoiceData.delivery_photo_url || invoiceData.Proof;
  const hasProof = !!proofImageUrl;

  return (
    <ShopperLayout>
      <div className="relative min-h-screen transition-colors duration-300">
        {/* Background Decorative Gradients */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-emerald-500/10 mix-blend-multiply blur-[100px] dark:bg-emerald-500/5 dark:mix-blend-lighten"></div>
          <div
            className="absolute -right-[10%] top-[30%] h-[35%] w-[35%] animate-pulse rounded-full bg-blue-500/10 mix-blend-multiply blur-[100px] dark:bg-blue-500/5 dark:mix-blend-lighten"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute -bottom-[10%] left-[20%] h-[50%] w-[50%] animate-pulse rounded-full bg-teal-500/10 mix-blend-multiply blur-[120px] dark:bg-teal-500/5 dark:mix-blend-lighten"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
          {/* Action Buttons */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={goBack}
              className={`group flex items-center justify-center gap-2.5 rounded-2xl border px-6 py-3 text-sm font-bold backdrop-blur-md transition-all duration-300 active:scale-95 ${
                theme === "dark"
                  ? "border-gray-700/50 bg-gray-800/40 text-gray-300 shadow-xl shadow-black/20 hover:border-emerald-500/30 hover:bg-gray-800/60 hover:text-emerald-400"
                  : "border-white/60 bg-white/60 text-gray-700 shadow-lg shadow-gray-200/50 hover:border-emerald-200 hover:bg-white/80 hover:text-emerald-600"
              }`}
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Invoices</span>
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {hasProof && (
                <button
                  onClick={() => setShowProofModal(true)}
                  className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 px-7 py-3.5 text-sm font-black tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                  <svg
                    className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="relative uppercase">View Proof</span>
                </button>
              )}

              <button
                onClick={handleDownload}
                className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 px-7 py-3.5 text-sm font-black tracking-widest text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                <svg
                  className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="relative uppercase">Download PDF</span>
              </button>
            </div>
          </div>

          {/* Invoice Document Widget */}
          <div
            className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-2xl transition-all duration-300 sm:rounded-3xl ${
              theme === "dark"
                ? "border-gray-700/50 bg-gray-900/40 shadow-2xl shadow-black/40"
                : "border-white/60 bg-white/70 shadow-2xl shadow-gray-200/50"
            }`}
          >
            <div className="p-6 sm:p-14">
              {/* Header */}
              <div className="mb-10 flex flex-col justify-between gap-8 sm:mb-12 sm:flex-row sm:items-start">
                <div className="space-y-1">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] sm:text-xs ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Invoice Issue Date
                  </p>
                  <h1
                    className={`text-lg font-black sm:text-xl ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {invoiceData.dateCreated}
                  </h1>
                  <div className="pt-4">
                    <h2
                      className={`text-4xl font-black tracking-tighter sm:text-5xl ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      INVOICE
                    </h2>
                    <div className="mt-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 sm:w-20"></div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-4 flex flex-col items-end">
                    <img
                      src="/assets/logos/PlasLogo.svg"
                      alt="Plas Designs Logo"
                      className={`h-20 w-auto object-contain ${
                        theme === "dark" ? "brightness-0 invert" : ""
                      }`}
                    />
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      Official Merchant
                    </p>
                  </div>
                  <p
                    className={`ml-auto max-w-[200px] text-sm font-medium leading-relaxed ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {invoiceData.shopAddress}
                  </p>
                </div>
              </div>

              {/* Greeting */}
              <div className="mb-12 rounded-3xl border border-gray-200/50 bg-gray-50/50 p-8 dark:border-gray-700/50 dark:bg-white/5">
                <p
                  className={`text-lg font-black tracking-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Dear {invoiceData.customer},
                </p>
                <p
                  className={`mt-2 text-sm font-medium leading-relaxed ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Here are your order details. We sincerely thank you for your
                  purchase and for choosing PLAS DESIGNS for your service needs.
                </p>
              </div>

              {/* Order Info Grid */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Order ID */}
                <div>
                  <p
                    className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Order ID
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #{invoiceData.orderNumber}
                  </p>
                  <div className="mt-3">
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Billing Address
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {invoiceData.customer}
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {invoiceData.customerEmail}
                    </p>
                  </div>
                </div>

                {/* Invoice ID */}
                <div>
                  <p
                    className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Invoice ID
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #{invoiceData.invoiceNumber}
                  </p>
                  <div className="mt-3">
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Shipping Address
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {invoiceData.shop}
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {invoiceData.shopAddress}
                    </p>
                  </div>
                </div>

                {/* Shipment ID */}
                <div>
                  <p
                    className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Shipment ID
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #SP-{String(invoiceData.orderNumber).slice(-6)}
                  </p>
                  <div className="mt-3">
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Shipment Date & Time
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {invoiceData.dateCompleted}
                    </p>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      12:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Section - Responsive Table/Cards */}
              <div className="mb-12 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        <th
                          className={`pb-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Description
                        </th>
                        <th
                          className={`pb-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          SKU ID
                        </th>
                        <th
                          className={`pb-4 text-center text-[10px] font-black uppercase tracking-[0.2em] ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Quantity
                        </th>
                        <th
                          className={`pb-4 text-right text-[10px] font-black uppercase tracking-[0.2em] ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Line Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, index) => (
                        <tr
                          key={index}
                          className={`group transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-white/[0.03] hover:bg-white/[0.06]"
                              : "bg-gray-50/80 hover:bg-gray-100/80"
                          }`}
                        >
                          <td className="rounded-l-2xl py-5 pl-6">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-black/5 transition-transform duration-300 group-hover:scale-110 ${
                                  theme === "dark"
                                    ? "from-gray-700 to-gray-800"
                                    : "from-gray-100 to-gray-200"
                                }`}
                              >
                                <svg
                                  className={`h-6 w-6 ${
                                    theme === "dark"
                                      ? "text-emerald-400"
                                      : "text-emerald-600"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p
                                  className={`font-black tracking-tight ${
                                    theme === "dark"
                                      ? "text-white"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.name}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                  Delivered: {invoiceData.dateCompleted}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5">
                            <span
                              className={`font-mono text-xs font-black tracking-tighter ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              #{String(index + 1).padStart(5, "0")}
                            </span>
                          </td>
                          <td className="py-5 text-center">
                            <span
                              className={`text-sm font-black ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="rounded-r-2xl py-5 pr-6 text-right">
                            <span
                              className={`text-base font-black tracking-tight ${
                                theme === "dark"
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                              }`}
                            >
                              {formatCurrency(item.total)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="space-y-4 lg:hidden">
                  <p
                    className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Itemized Order Details
                  </p>
                  {invoiceData.items.map((item, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl border p-4 backdrop-blur-md ${
                        theme === "dark"
                          ? "border-white/5 bg-white/[0.03]"
                          : "border-gray-200/50 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                              theme === "dark"
                                ? "from-gray-700 to-gray-800"
                                : "from-gray-100 to-gray-200"
                            }`}
                          >
                            <svg
                              className={`h-5 w-5 ${
                                theme === "dark"
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p
                              className={`text-sm font-black tracking-tight ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.name}
                            </p>
                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                              #{String(index + 1).padStart(5, "0")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-black ${
                              theme === "dark"
                                ? "text-emerald-400"
                                : "text-emerald-600"
                            }`}
                          >
                            {formatCurrency(item.total)}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            {item.quantity} units
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col items-end gap-6 border-t border-gray-200/50 pt-12 dark:border-gray-700/50">
                <div className="w-full max-w-sm space-y-4">
                  <div className="flex justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Subtotal Amount
                    </span>
                    <span
                      className={`text-base font-black ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(invoiceData.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Estimated VAT (0%)
                    </span>
                    <span
                      className={`text-base font-black ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(vat)}
                    </span>
                  </div>
                  <div className="pt-4">
                    <div className="flex flex-col items-center justify-between rounded-3xl bg-emerald-500 p-6 text-white shadow-2xl shadow-emerald-500/30 sm:flex-row sm:p-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
                          Final Grand Total
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tighter sm:text-3xl">
                          {formatCurrency(invoiceData.total)}
                        </p>
                      </div>
                      <div className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md sm:mt-0 sm:w-14">
                        <svg
                          className="h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Image Modal - Polished */}
      {showProofModal && proofImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl transition-all duration-500 sm:p-8"
          onClick={() => setShowProofModal(false)}
        >
          {/* Backdrop Blur Overlay */}
          <div className="absolute inset-0 bg-black/80"></div>

          <div className="relative w-full max-w-4xl scale-100 opacity-100 transition-all duration-500">
            {/* Close Button */}
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute -top-14 right-0 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-90 sm:-right-14 sm:top-0"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image Container with Glow */}
            <div className="group relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img
                src={proofImageUrl}
                alt="Delivery Proof"
                className="h-auto max-h-[80vh] w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-sm font-black uppercase tracking-widest text-white">
                  Verified Delivery Proof
                </p>
                <p className="text-xs text-white/70">
                  Image captured at completion
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ShopperLayout>
  );
}

export const getServerSideProps: GetServerSideProps<InvoicePageProps> = async (
  context
) => {
  const { id } = context.params || {};
  return { props: { initialInvoiceData: null, error: null } };
};

export default InvoicePage;
