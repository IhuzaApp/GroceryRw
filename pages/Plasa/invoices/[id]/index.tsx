import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Panel, Button, Loader, Divider } from "rsuite";
import ShopperLayout from "../../../../src/components/shopper/ShopperLayout";
import { formatCurrency } from "../../../../src/lib/formatCurrency";
import { useTheme } from "../../../../src/context/ThemeContext";
import {
  downloadInvoiceAsPdf,
} from "../../../../src/lib/invoiceUtils";

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
        <div className={`flex h-[calc(100vh-200px)] items-center justify-center ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Loader size="lg" content="Loading invoice..." />
        </div>
      </ShopperLayout>
    );
  }

  if (errorMessage || !invoiceData) {
    return (
      <ShopperLayout>
        <div className={`p-4 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Panel 
            bordered 
            header="Error" 
            shaded
            className={theme === 'dark' ? 'bg-gray-800' : ''}
          >
            <p className="text-red-600">
              {errorMessage || "Invoice data not available"}
            </p>
            <Button 
              appearance="primary" 
              onClick={goBack} 
              className={`mt-4 ${theme === 'dark' ? 'rs-btn-dark' : ''}`}
            >
              Go Back
            </Button>
          </Panel>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <Button
            appearance="link"
            onClick={goBack}
              className={`flex items-center ${
                theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
              }`}
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
          <Panel 
            bordered 
            shaded 
            className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          >
          {/* Invoice Header */}
            <div className={`mb-6 border-b pb-4 ${
              theme === 'dark' ? 'border-gray-700' : ''
            }`}>
            <div className="flex justify-between">
              <div>
                  <h1 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Invoice
                  </h1>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    #{invoiceData.invoiceNumber}
                  </p>
              </div>
              <div className="text-right">
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Order #{invoiceData.orderNumber}
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Status:{" "}
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                    {invoiceData.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Date and Order Info */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
                <h3 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Date Created
              </h3>
                <p className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {invoiceData.dateCreated}
                </p>
            </div>
            <div>
                <h3 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Date Completed
              </h3>
                <p className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {invoiceData.dateCompleted}
                </p>
            </div>
          </div>

          {/* Shop and Customer Info */}
            <div className={`mb-6 grid grid-cols-2 gap-4 rounded-md p-4 ${
              theme === 'dark' 
                ? 'bg-gray-700/50' 
                : 'bg-gray-50'
            }`}>
            <div>
                <h3 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Shopped At
                </h3>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {invoiceData.shop}
                </p>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {invoiceData.shopAddress}
                </p>
            </div>
            <div>
                <h3 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Customer
                </h3>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {invoiceData.customer}
                </p>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {invoiceData.customerEmail}
                </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
              <h3 className={`mb-2 text-sm font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Items
              </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className={`border-b text-left ${
                    theme === 'dark' 
                      ? 'border-gray-700 bg-gray-700/50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                  <tr>
                      <th className={`p-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Item
                    </th>
                      <th className={`p-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Qty
                    </th>
                      <th className={`p-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Price
                    </th>
                      <th className={`p-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Total
                    </th>
                  </tr>
                </thead>
                  <tbody className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {invoiceData.items.map((item, index) => (
                      <tr key={index} className={
                        theme === 'dark'
                          ? index % 2 === 0 
                            ? 'bg-gray-800' 
                            : 'bg-gray-700/50'
                          : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-gray-50'
                      }>
                      <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-2">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
            <div className={`mt-6 rounded-md p-4 ${
              theme === 'dark' 
                ? 'bg-gray-700/50' 
                : 'bg-gray-50'
            }`}>
              <div className="flex justify-between">
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Subtotal:
                </span>
                <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {formatCurrency(invoiceData.subtotal)}
                </span>
            </div>
              <div className="mt-2 flex justify-between">
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Service Fee:
                </span>
                <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {formatCurrency(invoiceData.serviceFee)}
                </span>
            </div>
              <div className="mt-2 flex justify-between">
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Delivery Fee:
                </span>
                <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {formatCurrency(invoiceData.deliveryFee)}
                </span>
            </div>
              <Divider className={theme === 'dark' ? 'border-gray-600' : ''} />
              <div className="flex justify-between">
                <span className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Total:
                </span>
                <span className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                {formatCurrency(invoiceData.total)}
              </span>
            </div>
          </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
              <Button
                appearance="primary"
                onClick={handleDownload}
                className={theme === 'dark' ? 'rs-btn-dark' : ''}
              >
                Download PDF
              </Button>
            </div>
        </Panel>
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
