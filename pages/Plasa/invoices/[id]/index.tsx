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
        <div
          className={`min-h-screen ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-50"
          } py-8`}
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="animate-pulse">
              <div className="mb-8 h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="rounded-2xl bg-white p-12 shadow-sm dark:bg-gray-800">
                <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-8 space-y-4">
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
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
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        } py-8`}
      >
        <div className="max-w-9xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Action Buttons */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={goBack}
              className={`group flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 sm:w-auto ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 bg-white text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50 hover:shadow"
              }`}
            >
              <svg
                className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              {hasProof && (
                <button
                  onClick={() => setShowProofModal(true)}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 sm:w-auto sm:px-7"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
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
                  <span className="relative">View Proof</span>
                </button>
              )}

              <button
                onClick={handleDownload}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95 sm:w-auto sm:px-7"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
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
                <span className="relative">Download PDF</span>
              </button>
            </div>
          </div>

          {/* Invoice Card */}
          <div
            className={`rounded-2xl shadow-sm ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Date
                  </p>
                  <h1
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {invoiceData.dateCreated}
                  </h1>
                  <h2
                    className={`mt-4 text-3xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Invoice
                  </h2>
                </div>

                <div className="text-right">
                  <div className="mb-2 flex items-center justify-end gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <span className="text-xl font-bold text-white">P</span>
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        PLAS DESIGNS
                      </h3>
                    </div>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {invoiceData.shopAddress}
                  </p>
                </div>
              </div>

              {/* Greeting */}
              <div className="mb-8">
                <p
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Dear {invoiceData.customer},
                </p>
                <p
                  className={`mt-2 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Here are your order details, We thank you for your purchase.
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

              {/* Items Table */}
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-y ${
                        theme === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <th
                        className={`py-4 text-left text-xs font-semibold uppercase tracking-wide ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ITEMS
                      </th>
                      <th
                        className={`py-4 text-left text-xs font-semibold uppercase tracking-wide ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        SKU
                      </th>
                      <th
                        className={`py-4 text-center text-xs font-semibold uppercase tracking-wide ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        QTY
                      </th>
                      <th
                        className={`py-4 text-right text-xs font-semibold uppercase tracking-wide ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      theme === "dark" ? "divide-gray-700" : "divide-gray-100"
                    }`}
                  >
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <svg
                                className={`h-6 w-6 ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-400"
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
                                className={`font-medium ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {item.name}
                              </p>
                              <p
                                className={`text-sm ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                Delivery Date: {invoiceData.dateCompleted}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className={`py-4 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {String(index + 1).padStart(5, "0")}
                        </td>
                        <td
                          className={`py-4 text-center ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className={`py-4 text-right font-semibold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-8 flex justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-sm">
                    <span
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Subtotal
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(invoiceData.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Vat (0%)
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(vat)}
                    </span>
                  </div>
                  <div
                    className={`border-t pt-3 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Grand Total
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(invoiceData.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Image Modal */}
      {showProofModal && proofImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 sm:p-6 md:p-8"
          onClick={() => setShowProofModal(false)}
        >
          <div className="relative w-full max-w-full sm:max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute -top-10 right-0 z-10 rounded-full bg-white p-2 text-gray-800 shadow-lg transition-colors hover:bg-gray-200 sm:-top-12 sm:p-2.5"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image Container */}
            <div className="flex items-center justify-center">
              <img
                src={proofImageUrl}
                alt="Delivery Proof"
                className="h-auto max-h-[80vh] w-full rounded-lg object-contain shadow-2xl sm:max-h-[85vh] md:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Image Info - Mobile Only */}
            <div className="mt-4 rounded-lg bg-white bg-opacity-90 p-3 text-center sm:hidden">
              <p className="text-sm font-medium text-gray-800">
                Delivery Proof Image
              </p>
              <p className="mt-1 text-xs text-gray-600">Tap outside to close</p>
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
