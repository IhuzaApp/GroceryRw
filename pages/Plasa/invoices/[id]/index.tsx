import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Panel, Button, Loader, Divider } from "rsuite";
import ShopperLayout from "../../../../src/components/shopper/ShopperLayout";
import { formatCurrency } from "../../../../src/lib/formatCurrency";
import { useTheme } from "../../../../src/context/ThemeContext";
import { downloadInvoiceAsPdf } from "../../../../src/lib/invoiceUtils";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
}

interface InvoiceData {
  id: string;
  orderId: string;
  invoiceNumber: string;
  orderNumber: string;
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
}

interface InvoicePageProps {
  initialInvoiceData: InvoiceData | null;
  error: string | null;
}

export default function InvoicePage({
  initialInvoiceData,
  error,
}: InvoicePageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(
    initialInvoiceData
  );
  const [loading, setLoading] = useState(!initialInvoiceData);
  const [errorMessage, setErrorMessage] = useState<string | null>(error);

  useEffect(() => {
    // If we don't have invoice data, try to fetch it
    const fetchInvoiceData = async () => {
      if (!id || !loading) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/invoices/${id}`, {
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
        setErrorMessage(null);
      } catch (error) {
        console.error("Error fetching invoice:", error);
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
      await downloadInvoiceAsPdf(invoiceData);
    } catch (error) {
      console.error("Error downloading invoice:", error);
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
          }`}
        >
          <div className="mx-auto max-w-4xl p-4">
            {/* Header Skeleton */}
            <div className="mb-6 flex items-center justify-between">
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Main Invoice Card Skeleton */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
              {/* Invoice Header Skeleton */}
              <div className="border-b border-gray-200 p-8 dark:border-gray-700">
                <div className="flex flex-col justify-between space-y-6 lg:flex-row lg:space-y-0">
                  <div className="flex items-start space-x-4">
                    <div className="h-16 w-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-2">
                      <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                    <div className="mt-2 h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                </div>
              </div>

              {/* Invoice Details Grid Skeleton */}
              <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-2">
                {/* Dates Skeleton */}
                <div className="space-y-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                          <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                          <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shop & Customer Info Skeleton */}
                <div className="space-y-4">
                  <div className="h-6 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
                        <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </div>
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </div>
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="mt-2 h-3 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table Skeleton */}
              <div className="px-8 pb-8">
                <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[1, 2, 3].map((index) => (
                        <tr key={index} className="bg-white dark:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                              <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="mx-auto h-6 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section Skeleton */}
              <div className="border-t border-gray-200 p-8 dark:border-gray-700">
                <div className="mx-auto max-w-md">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                    <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                      <div className="flex justify-between">
                        <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                        <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </div>
                    </div>
                  </div>
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
          <div className="mx-auto max-w-2xl">
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

  return (
    <ShopperLayout>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="mx-auto max-w-4xl p-4">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              appearance="link"
              onClick={goBack}
              className={`flex items-center rounded-lg px-4 py-2 transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                className="mr-2 h-5 w-5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              Back to Invoices
            </Button>
            
            <button
              onClick={handleDownload}
              className="flex items-center rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2 h-5 w-5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download PDF
            </button>
          </div>

          {/* Main Invoice Card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            {/* Invoice Header */}
            <div
              className={`border-b p-8 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col justify-between space-y-6 lg:flex-row lg:space-y-0">
                <div className="flex items-start space-x-4">
                                     <div
                     className={`flex h-16 w-16 items-center justify-center rounded-xl ${
                       theme === "dark" ? "bg-green-600" : "bg-green-500"
                     }`}
                   >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-8 w-8 text-white"
                    >
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Invoice
                  </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                    #{invoiceData.invoiceNumber}
                  </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          theme === "dark"
                            ? "bg-green-900/20 text-green-400"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-1 h-4 w-4"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        {invoiceData.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Order Number
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      #{invoiceData.orderNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details Grid */}
            <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-2">
              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="flex items-center space-x-3">
                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                         <svg
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           className="h-5 w-5 text-green-600 dark:text-green-400"
                         >
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Created
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invoiceData.dateCreated}
                </p>
              </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5 text-green-600 dark:text-green-400"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
              <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Completed
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invoiceData.dateCompleted}
                </p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

              {/* Shop & Customer Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 text-orange-600 dark:text-orange-400"
                        >
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Shop
                      </h4>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {invoiceData.shop}
                </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invoiceData.shopAddress}
                </p>
              </div>

                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 text-purple-600 dark:text-purple-400"
                        >
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Customer
                      </h4>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {invoiceData.customer}
                </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invoiceData.customerEmail}
                </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="px-8 pb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Order Items
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead
                    className={`${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Item
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Unit Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoiceData.items.map((item, index) => (
                      <tr
                        key={index}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                          theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.unit}
                            </p>
                          </div>
                        </td>
                                                 <td className="px-6 py-4 text-center">
                           <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                             {item.quantity}
                           </span>
                         </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div
              className={`border-t p-8 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="mx-auto max-w-md">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(invoiceData.subtotal)}
                </span>
              </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Service Fee
                </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(invoiceData.serviceFee)}
                </span>
              </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Delivery Fee
                </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(invoiceData.deliveryFee)}
                </span>
              </div>
                  <div
                    className={`border-t pt-3 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Total
                </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
    </ShopperLayout>
  );
}

export const getServerSideProps: GetServerSideProps<InvoicePageProps> = async (
  context
) => {
  const { id } = context.params || {};
  const session = await getSession(context);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/signin?callbackUrl=/Plasa",
        permanent: false,
      },
    };
  }

  if (!id || typeof id !== "string") {
    return {
      props: {
        initialInvoiceData: null,
        error: "Invoice ID is required",
      },
    };
  }

  try {
    // For now, we'll just return null and let the client fetch the data
    return {
      props: {
        initialInvoiceData: null,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return {
      props: {
        initialInvoiceData: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load invoice data",
      },
    };
  }
};
