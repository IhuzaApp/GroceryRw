import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { formatCurrencySync } from "./formatCurrency";

interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  subtotal: number;
  transportation: number;
  serviceFee: number;
  total: number;
  storeName: string;
  status: string;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(22, 163, 74); // green-600
  doc.text("INVOICE", margin, y);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Order ID: ${data.orderId}`, margin, y + 10);
  doc.text(`Date: ${data.date}`, margin, y + 15);

  y += 30;

  // Store & Customer Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("FROM:", margin, y);
  doc.setFontSize(10);
  doc.text(data.storeName, margin, y + 7);

  const rightCol = 120;
  doc.setFontSize(12);
  doc.text("TO:", rightCol, y);
  doc.setFontSize(10);
  doc.text(data.customerName, rightCol, y + 7);
  doc.text(data.customerEmail, rightCol, y + 12);
  doc.text(data.customerPhone, rightCol, y + 17);

  y += 30;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, 170, 10, "F");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Item", margin + 5, y + 7);
  doc.text("Qty", margin + 100, y + 7);
  doc.text("Price", margin + 120, y + 7);
  doc.text("Total", margin + 150, y + 7);

  y += 15;

  // Items
  data.items.forEach((item) => {
    doc.text(item.name, margin + 5, y);
    doc.text(`${item.quantity} ${item.unit}`, margin + 100, y);
    doc.text(formatCurrencySync(item.price), margin + 120, y);
    doc.text(formatCurrencySync(item.price * item.quantity), margin + 150, y);
    y += 10;
  });

  y += 5;
  doc.line(margin, y, 190, y);
  y += 10;

  // Summary
  const summaryX = 130;
  doc.text("Subtotal:", summaryX, y);
  doc.text(formatCurrencySync(data.subtotal), summaryX + 30, y);

  y += 7;
  doc.text("Transportation:", summaryX, y);
  doc.text(formatCurrencySync(data.transportation), summaryX + 30, y);

  y += 7;
  doc.text("Service Fee:", summaryX, y);
  doc.text(formatCurrencySync(data.serviceFee), summaryX + 30, y);

  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text("Total:", summaryX, y);
  doc.text(formatCurrencySync(data.total), summaryX + 30, y);

  // QR Code for Validation
  try {
    const validationUrl = `https://plas.business/validate/${data.orderId}`;
    const qrDataUrl = await QRCode.toDataURL(validationUrl);
    doc.addImage(qrDataUrl, "PNG", margin, y - 10, 30, 30);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Scan to validate invoice", margin, y + 25);
  } catch (err) {
    console.error("QR Code generation failed", err);
  }

  // PAID Stamp
  const normalizedStatus = data.status.toLowerCase();
  if (
    normalizedStatus.includes("delivered") ||
    normalizedStatus === "completed"
  ) {
    doc.setDrawColor(220, 38, 38); // red-600
    doc.setLineWidth(1);
    doc.roundedRect(150, 30, 40, 15, 2, 2);
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text("PAID", 170, 40, { align: "center", angle: 15 });
  }

  // Footer & Branding
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Powered by Plas", 105, 275, { align: "center" });

  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, 285, { align: "center" });

  doc.save(`Invoice_${data.orderId}.pdf`);
};
