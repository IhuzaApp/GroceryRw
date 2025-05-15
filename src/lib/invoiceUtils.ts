// This is a placeholder for PDF generation functionality
// In a real application, you would use a library like jspdf or pdfmake
// to generate actual PDF files
import { formatCurrency } from "./formatCurrency";

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
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

/**
 * Convert invoice data to a downloadable PDF format
 * @param invoiceData The invoice data to convert
 * @returns A promise that resolves when the download is complete
 */
export const downloadInvoiceAsPdf = async (
  invoiceData: InvoiceData
): Promise<void> => {
  // In a real implementation, this would generate a PDF and trigger a download
  console.log("Downloading invoice as PDF:", invoiceData);

  // For now, we'll just create a simple text representation and download it
  const invoiceText = `
INVOICE #${invoiceData.invoiceNumber}
========================================
Order #: ${invoiceData.orderNumber}
Status: ${invoiceData.status}

Date Created: ${invoiceData.dateCreated}
Date Completed: ${invoiceData.dateCompleted}

SHOP DETAILS
-----------
${invoiceData.shop}
${invoiceData.shopAddress}

CUSTOMER DETAILS
--------------
${invoiceData.customer}
${invoiceData.customerEmail}

ITEMS
-----
${invoiceData.items
  .map(
    (item) =>
      `${item.name} - ${item.quantity} ${item.unit} x ${formatCurrency(
        item.unitPrice
      )} = ${formatCurrency(item.total)}`
  )
  .join("\n")}

SUMMARY
-------
Subtotal: ${formatCurrency(invoiceData.subtotal)}
Service Fee: ${formatCurrency(invoiceData.serviceFee)}
Delivery Fee: ${formatCurrency(invoiceData.deliveryFee)}
TOTAL: ${formatCurrency(invoiceData.total)}

Note: Service fee and delivery fee were added to the shopper's available wallet balance.
The payment reflects only the value of found items.
`;

  // Create a Blob with the text content
  const blob = new Blob([invoiceText], { type: "text/plain" });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${invoiceData.invoiceNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
