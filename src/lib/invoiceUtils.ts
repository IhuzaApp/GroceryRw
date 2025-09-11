import jsPDF from "jspdf";
import { formatCurrency } from "./formatCurrency";
import { formatCurrencySync } from "../utils/formatCurrency";

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
  orderType?: string;
}

/**
 * Generate and download invoice as PDF
 * @param invoiceData The invoice data to convert
 * @returns A promise that resolves when the download is complete
 */
export const downloadInvoiceAsPdf = async (
  invoiceData: InvoiceData
): Promise<void> => {
  try {
    // Create new PDF document
    const doc = new jsPDF();

    // Set initial position
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Add watermark function
    const addWatermark = () => {
      // Set watermark properties
      doc.setTextColor(200, 200, 200); // Light gray
      doc.setFontSize(60);
      doc.setFont("helvetica", "bold");

      // Calculate center position
      const text = "ORIGINAL";
      const textWidth = doc.getTextWidth(text);
      const centerX = (pageWidth - textWidth) / 2;
      const centerY = pageHeight / 2;

      // Add rotated watermark using text with angle
      doc.text(text, centerX, centerY, { angle: -45 });

      // Add additional security text
      doc.setFontSize(20);
      doc.text("PLAS", centerX - textWidth / 2, centerY + 40, { angle: -45 });
      doc.text(
        invoiceData.invoiceNumber,
        centerX - textWidth / 2,
        centerY + 60,
        { angle: -45 }
      );
    };

    // Add watermark to first page
    addWatermark();

    // Add company logo/header (text-based for client-side compatibility)
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(67, 175, 74); // Green color matching the logo
    doc.text("PLAS", margin, yPos);

    yPos += 15;

    // Add invoice title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", margin, yPos);

    yPos += 10;

    // Add invoice number and order number
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, margin, yPos);
    doc.text(
      `Order #: ${invoiceData.orderNumber}`,
      pageWidth - margin - 50,
      yPos
    );

    yPos += 8;

    // Add dates
    doc.text(`Date Created: ${invoiceData.dateCreated}`, margin, yPos);
    doc.text(
      `Date Completed: ${invoiceData.dateCompleted}`,
      pageWidth - margin - 70,
      yPos
    );

    yPos += 8;

    // Add status
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 197, 94); // Green for status
    doc.text(`Status: ${invoiceData.status.toUpperCase()}`, margin, yPos);

    yPos += 20;

    // Add shop and customer information
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("SHOP DETAILS", margin, yPos);
    doc.text("CUSTOMER DETAILS", pageWidth - margin - 60, yPos);

    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoiceData.shop, margin, yPos);
    doc.text(invoiceData.customer, pageWidth - margin - 60, yPos);

    yPos += 5;

    doc.text(invoiceData.shopAddress, margin, yPos);
    doc.text(invoiceData.customerEmail, pageWidth - margin - 60, yPos);

    yPos += 20;

    // Add items table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(34, 197, 94); // Green background
    doc.rect(margin, yPos - 5, contentWidth, 8, "F");

    doc.text("Item", margin + 2, yPos);
    doc.text("Qty", margin + 80, yPos);
    doc.text("Unit Price", margin + 110, yPos);
    doc.text("Total", margin + 150, yPos);

    yPos += 10;

    // Add items
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    invoiceData.items.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
        // Add watermark to new page
        addWatermark();
      }

      const bgColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255]; // Light gray alternating
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(margin, yPos - 3, contentWidth, 8, "F");

      // Item name (truncate if too long)
      const itemName =
        item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name;
      doc.text(itemName, margin + 2, yPos);

      // Quantity
      doc.text(item.quantity.toString(), margin + 80, yPos);

      // Unit price
      doc.text(formatCurrencySync(item.unitPrice), margin + 110, yPos);

      // Total
      doc.text(formatCurrencySync(item.total), margin + 150, yPos);

      yPos += 8;
    });

    yPos += 10;

    // Add summary section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    // Draw summary box
    const summaryY = yPos;
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.rect(margin, summaryY - 5, contentWidth, 40, "S");

    // Summary content
    doc.text("SUMMARY", margin + 5, summaryY);

    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Subtotal
    doc.text("Subtotal:", margin + 10, yPos);
    doc.text(
      formatCurrencySync(invoiceData.subtotal),
      pageWidth - margin - 10,
      yPos,
      { align: "right" }
    );

    yPos += 6;

    // Service Fee
    doc.text("Service Fee:", margin + 10, yPos);
    doc.text(
      formatCurrencySync(invoiceData.serviceFee),
      pageWidth - margin - 10,
      yPos,
      { align: "right" }
    );

    yPos += 6;

    // Delivery Fee
    doc.text("Delivery Fee:", margin + 10, yPos);
    doc.text(
      formatCurrencySync(invoiceData.deliveryFee),
      pageWidth - margin - 10,
      yPos,
      { align: "right" }
    );

    yPos += 8;

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text("TOTAL:", margin + 10, yPos);
    doc.text(
      formatCurrencySync(invoiceData.total),
      pageWidth - margin - 10,
      yPos,
      {
        align: "right",
      }
    );

    yPos += 20;

    // Add footer note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Note: Service fee and delivery fee were added to the shopper's available wallet balance.",
      margin,
      yPos
    );
    yPos += 4;
    doc.text(
      "The payment reflects only the value of found items.",
      margin,
      yPos
    );

    // Add security footer
    yPos += 8;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const timestamp = new Date().toISOString();
    doc.text(`Generated on: ${timestamp}`, margin, yPos);
    yPos += 3;
    doc.text(`Document ID: ${invoiceData.id}`, margin, yPos);
    yPos += 3;
    doc.text("This is an official document generated by PLAS", margin, yPos);

    // Note: QR code generation requires server-side dependencies
    // For client-side PDF generation, QR code is not included
    // Use the server-side API route for full PDF with QR code

    // Add page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 30,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    const fileName = `invoice-${invoiceData.invoiceNumber}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};
