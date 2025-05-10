import { useState } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { getSession } from "next-auth/react";
import { Panel, Button, Table, Divider, Loader } from "rsuite";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import Link from "next/link";
import Image from "next/image";
import { GET_INVOICE_BY_ID } from "../../api/queries/invoices";

interface InvoiceItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  measurement_unit: string;
}

interface InvoiceType {
  id: string;
  invoice_number: string;
  created_at: string;
  total_amount: number;
  subtotal: number;
  tax: number;
  service_fee: number;
  delivery_fee: number;
  discount: number;
  status: string;
  invoice_items: InvoiceItem[];
  customer: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
  order: {
    id: string;
    OrderID: string;
    created_at: string;
    shop: {
      id: string;
      name: string;
      address: string;
    };
  };
}

interface InvoicePageProps {
  invoiceData: InvoiceType | null;
  error: string | null;
}

export default function InvoicePage({ invoiceData, error }: InvoicePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <ShopperLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader size="lg" content="Loading invoice..." />
        </div>
      </ShopperLayout>
    );
  }

  if (error) {
    return (
      <ShopperLayout>
        <div className="p-4">
          <Panel bordered header="Error" shaded>
            <p className="text-red-600">{error}</p>
            <Button appearance="primary" onClick={() => router.back()}>
              Go Back
            </Button>
          </Panel>
        </div>
      </ShopperLayout>
    );
  }

  if (!invoiceData) {
    return (
      <ShopperLayout>
        <div className="p-4">
          <Panel bordered header="Invoice Not Found" shaded>
            <p>The invoice you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button appearance="primary" onClick={() => router.back()}>
              Go Back
            </Button>
          </Panel>
        </div>
      </ShopperLayout>
    );
  }

  const { invoice_number, created_at, total_amount, subtotal, tax, service_fee, delivery_fee, discount, status, invoice_items, customer, order } = invoiceData;

  return (
    <ShopperLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Button
            appearance="link"
            onClick={() => router.back()}
            className="flex items-center text-gray-600"
          >
            <span className="mr-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </span>
            Back
          </Button>
          <Button
            appearance="primary"
            color="blue"
            onClick={() => window.print()}
            className="print:hidden"
          >
            <span className="mr-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
            </span>
            Print Invoice
          </Button>
        </div>

        <Panel bordered shaded className="print:shadow-none print:border-0">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">INVOICE</h1>
              <p className="text-gray-600">{invoice_number}</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {status.toUpperCase()}
              </div>
              <p className="mt-2 text-gray-600">Date: {new Date(created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
              <div className="flex items-center mb-2">
                {customer.profile_picture ? (
                  <Image
                    src={customer.profile_picture}
                    alt={customer.name}
                    width={40}
                    height={40}
                    className="rounded-full mr-2"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-500">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M20 21v-2a8 8 0 00-16 0v2" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Order Info:</h2>
              <p className="mb-1">
                <span className="font-medium">Order ID:</span> {order.OrderID}
              </p>
              <p className="mb-1">
                <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="mb-1">
                <span className="font-medium">Shop:</span> {order.shop.name}
              </p>
              <p className="text-sm text-gray-600">{order.shop.address}</p>
              <Link href={`/Plasa/active-batches/batch/${order.id}`}>
                <span className="text-blue-600 hover:underline text-sm">View Order Details</span>
              </Link>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-3">Items:</h2>
          <Table
            autoHeight
            data={invoice_items}
            className="mb-6"
          >
            <Table.Column width={200} flexGrow={1}>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.Cell dataKey="product_name" />
            </Table.Column>
            
            <Table.Column width={100}>
              <Table.HeaderCell>Unit Price</Table.HeaderCell>
              <Table.Cell>
                {(rowData: InvoiceItem) => formatCurrency(rowData.unit_price)}
              </Table.Cell>
            </Table.Column>
            
            <Table.Column width={100}>
              <Table.HeaderCell>Quantity</Table.HeaderCell>
              <Table.Cell>
                {(rowData: InvoiceItem) => `${rowData.quantity} ${rowData.measurement_unit}`}
              </Table.Cell>
            </Table.Column>
            
            <Table.Column width={120}>
              <Table.HeaderCell>Total</Table.HeaderCell>
              <Table.Cell>
                {(rowData: InvoiceItem) => formatCurrency(rowData.total_price)}
              </Table.Cell>
            </Table.Column>
          </Table>

          <div className="w-full md:w-1/2 ml-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (18%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Service Fee:</span>
                <span>{formatCurrency(service_fee)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee:</span>
                <span>{formatCurrency(delivery_fee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Divider />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm print:mt-20">
            <p>Thank you for shopping with us!</p>
            <p>This is an automatically generated invoice.</p>
          </div>
        </Panel>
      </div>
    </ShopperLayout>
  );
}

export const getServerSideProps: GetServerSideProps<InvoicePageProps> = async (context) => {
  const { id } = context.params || {};
  const session = await getSession(context);
  
  if (!id || typeof id !== 'string') {
    return {
      props: {
        invoiceData: null,
        error: "Invoice ID is required"
      }
    };
  }
  
  try {
    const data = await hasuraClient.request<{
      Invoices_by_pk: InvoiceType | null;
    }>(
      GET_INVOICE_BY_ID,
      { id }
    );
    
    if (!data.Invoices_by_pk) {
      return {
        props: {
          invoiceData: null,
          error: "Invoice not found"
        }
      };
    }
    
    return {
      props: {
        invoiceData: data.Invoices_by_pk,
        error: null
      }
    };
  } catch (err) {
    console.error("Error fetching invoice details:", err);
    return {
      props: {
        invoiceData: null,
        error: err instanceof Error ? err.message : 'Failed to load invoice details'
      }
    };
  }
} 