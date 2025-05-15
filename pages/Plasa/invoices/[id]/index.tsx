import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Panel, Button, Loader, Divider } from "rsuite";
import ShopperLayout from "../../../../src/components/shopper/ShopperLayout";
import { formatCurrency } from "../../../../src/lib/formatCurrency";
import {
  downloadInvoiceAsPdf,
  InvoiceData,
} from "../../../../src/lib/invoiceUtils";

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
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader size="lg" content="Loading invoice..." />
        </div>
      </ShopperLayout>
    );
  }

  if (errorMessage || !invoiceData) {
    return (
      <ShopperLayout>
        <div className="p-4">
          <Panel bordered header="Error" shaded>
            <p className="text-red-600">
              {errorMessage || "Invoice data not available"}
            </p>
            <Button appearance="primary" onClick={goBack} className="mt-4">
              Go Back
            </Button>
          </Panel>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <Button
            appearance="link"
            onClick={goBack}
            className="flex items-center text-gray-600"
          >
            <span className="mr-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </span>
            Back
          </Button>
        </div>

        {/* Invoice Card */}
        <Panel bordered shaded className="bg-white">
          {/* Invoice Header */}
          <div className="mb-6 border-b pb-4">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">Invoice</h1>
                <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Order #{invoiceData.orderNumber}</p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span className="font-semibold text-green-600">
                    {invoiceData.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Date and Order Info */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Date Created
              </h3>
              <p>{invoiceData.dateCreated}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Date Completed
              </h3>
              <p>{invoiceData.dateCompleted}</p>
            </div>
          </div>

          {/* Shop and Customer Info */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Shopped At</h3>
              <p className="font-medium">{invoiceData.shop}</p>
              <p className="text-gray-600">{invoiceData.shopAddress}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Customer</h3>
              <p className="font-medium">{invoiceData.customer}</p>
              <p className="text-gray-600">{invoiceData.customerEmail}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50 text-left">
                  <tr>
                    <th className="p-2 text-sm font-medium text-gray-600">
                      Item
                    </th>
                    <th className="p-2 text-sm font-medium text-gray-600">
                      Qty
                    </th>
                    <th className="p-2 text-sm font-medium text-gray-600">
                      Unit Price
                    </th>
                    <th className="p-2 text-right text-sm font-medium text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Service Fee</span>
              <span>{formatCurrency(invoiceData.serviceFee)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{formatCurrency(invoiceData.deliveryFee)}</span>
            </div>
            <Divider />
            <div className="flex justify-between py-1">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">
                {formatCurrency(invoiceData.total)}
              </span>
            </div>
          </div>
        </Panel>
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
