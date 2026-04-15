import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import { formatCurrency } from "./formatCurrency";

export interface PosInvoiceData {
  invoiceNumber: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  planName: string;
  billingCycle: string;
  amount: number;
  features: string[];
  issuedAt: string;
  dueDate: string;
}

/**
 * Generate a PDF for a POS subscription invoice
 * @param data The invoice data
 * @returns Base64 string or ArrayBuffer of the PDF
 */
export const generatePosInvoicePdf = async (
  data: PosInvoiceData
): Promise<string> => {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Header
  try {
    const logoPath = path.join(process.cwd(), "public", "assets", "logos", "PlasLogoPNG.png");
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
      const logoDataUri = `data:image/png;base64,${logoBase64}`;
      doc.addImage(logoDataUri, "PNG", margin, yPos - 8, 35, 12);
    } else {
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(67, 175, 74); // Plas Green
      doc.text("PLAS", margin, yPos);
    }
  } catch (error) {
    console.warn("Could not load logo image for PDF:", error);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(67, 175, 74); // Plas Green
    doc.text("PLAS", margin, yPos);
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Empowering Your Business", margin, yPos + 10);

  yPos += 25;


  // Invoice Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("SUBSCRIPTION INVOICE", margin, yPos);

  yPos += 15;

  // Invoice Details Box
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, yPos, pageWidth - margin * 2, 30, "F");

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice #:", margin + 5, yPos + 10);
  doc.text("Date Issued:", margin + 5, yPos + 18);
  doc.text("Status:", margin + 5, yPos + 26);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(data.invoiceNumber, margin + 35, yPos + 10);
  doc.text(data.issuedAt, margin + 35, yPos + 18);
  doc.setTextColor(34, 197, 94); // Green for PAID/PENDING
  doc.text("PAID", margin + 35, yPos + 26);

  yPos += 45;

  // Bill To / Bill From
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("BILL FROM", margin, yPos);
  doc.text("BILL TO", pageWidth / 2, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  // From
  doc.text("PLAS Technologies Ltd", margin, yPos);
  doc.text("Kigali, Rwanda", margin, yPos + 5);
  doc.text("support@plas.rw", margin, yPos + 10);

  // To
  doc.setFont("helvetica", "bold");
  doc.text(data.businessName, pageWidth / 2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.businessAddress || "N/A", pageWidth / 2, yPos + 5);
  doc.text(data.businessEmail, pageWidth / 2, yPos + 10);
  doc.text(data.businessPhone, pageWidth / 2, yPos + 15);

  yPos += 35;

  // Items Table Header
  doc.setFillColor(34, 197, 94);
  doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 5, yPos + 7);
  doc.text("Billing Cycle", margin + 110, yPos + 7);
  doc.text("Amount", pageWidth - margin - 25, yPos + 7, { align: "right" });

  yPos += 10;

  // Item Row
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`POS Subscription - ${data.planName} Plan`, margin + 5, yPos + 10);
  doc.text(data.billingCycle.toUpperCase(), margin + 110, yPos + 10);
  doc.text(formatCurrency(data.amount), pageWidth - margin - 5, yPos + 10, {
    align: "right",
  });

  yPos += 25;

  // Summary
  const summaryX = pageWidth / 2;
  doc.setLineWidth(0.1);
  doc.line(summaryX, yPos, pageWidth - margin, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Paid:", summaryX, yPos);
  doc.setTextColor(34, 197, 94);
  doc.text(formatCurrency(data.amount), pageWidth - margin - 5, yPos, {
    align: "right",
  });

  yPos += 30;

  // Included Features
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Plan Features Highlights", margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  data.features.slice(0, 10).forEach((feature, index) => {
    doc.text(`\u2022 ${feature}`, margin + 5, yPos);
    yPos += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerY = doc.internal.pageSize.height - 20;
  doc.text(
    "This is a computer-generated invoice and doesn't require a physical signature.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text("Thank you for choosing PLAS!", pageWidth / 2, footerY + 5, {
    align: "center",
  });

  return doc.output("datauristring");
};
