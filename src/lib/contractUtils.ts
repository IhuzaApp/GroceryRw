import jsPDF from "jspdf";
import QRCode from "qrcode";
import { formatCurrencySync } from "../utils/formatCurrency";

export interface ContractData {
  id: string;
  contractId: string;
  title: string;
  supplierName: string;
  supplierCompany: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  paymentSchedule: string;
  duration: string;
  paymentTerms: string;
  terminationTerms: string;
  specialConditions: string;
  deliverables: Array<{
    id?: string;
    description: string;
    dueDate: string;
    value: number;
    status?: string;
  }>;
  doneAt?: string;
  updateOn?: string;
  clientSignature?: string;
  clientPhoto?: string;
  supplierSignature?: string;
  supplierPhoto?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Add watermark to PDF page
 */
function addWatermark(doc: jsPDF, contractId: string) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Set watermark properties
  doc.setTextColor(200, 200, 200); // Light gray
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");

  // Calculate center position
  const text = "PLAS";
  const textWidth = doc.getTextWidth(text);
  const centerX = (pageWidth - textWidth) / 2;
  const centerY = pageHeight / 2;

  // Add rotated watermark
  doc.text(text, centerX, centerY, { angle: -45 });

  // Add contract ID watermark
  doc.setFontSize(16);
  doc.text(
    `Contract ID: ${contractId}`,
    centerX - textWidth / 2,
    centerY + 40,
    { angle: -45 }
  );
}

/**
 * Generate and download contract as PDF
 */
export const downloadContractAsPdf = async (
  contractData: ContractData
): Promise<void> => {
  try {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Add watermark to all pages
    const addPageWatermark = () => {
      addWatermark(doc, contractData.contractId);
    };

    // Add watermark to first page
    addPageWatermark();

    // Add Plas logo/header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(67, 175, 74); // Green color matching Plas
    doc.text("PLAS", margin, yPos);

    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Contract Management Platform", margin, yPos);

    yPos += 15;

    // Add contract title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PLAS BUSINESS SERVICES AGREEMENT", margin, yPos);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("(Supplier–Client)", margin, yPos + 6);

    yPos += 15;

    // Add effective date
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const effectiveDate = contractData.startDate
      ? formatDate(contractData.startDate)
      : "Not specified";
    doc.text(
      `This PLAS Business Services Agreement ("Agreement") is entered into and becomes effective as of ${effectiveDate} ("Effective Date"), by and between:`,
      margin,
      yPos,
      { maxWidth: contentWidth }
    );

    yPos += 15;

    // Supplier Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Supplier Information", margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Legal Name: ${
        contractData.supplierCompany ||
        contractData.supplierName ||
        "Not specified"
      }`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text(
      `Registered Address: ${contractData.supplierAddress || "Not specified"}`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text(
      `Email: ${contractData.supplierEmail || "Not specified"}`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text(
      `Phone: ${contractData.supplierPhone || "Not specified"}`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text('("Supplier")', margin + 5, yPos);

    yPos += 12;

    // Client Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Client Information", margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Legal Name: ${
        contractData.clientCompany || contractData.clientName || "Not specified"
      }`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text(
      `Business Address: ${contractData.clientAddress || "Not specified"}`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text(
      `Email: ${contractData.clientEmail || "Not specified"}`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text(
      `Phone: ${contractData.clientPhone || "Not specified"}`,
      margin + 5,
      yPos
    );
    yPos += 6;
    doc.text('("Client")', margin + 5, yPos);

    yPos += 10;
    doc.text(
      'Supplier and Client may be referred to individually as a "Party" and collectively as the "Parties."',
      margin,
      yPos,
      { maxWidth: contentWidth }
    );

    yPos += 15;

    // Contract Terms Sections
    const sections = [
      {
        title: "1. PURPOSE OF AGREEMENT",
        content: `This Agreement establishes the general terms and conditions under which Supplier will provide services to Client. Specific services, pricing, timelines, and deliverables are detailed below.`,
      },
      {
        title: "2. SCOPE OF SERVICES",
        content: `Supplier agrees to provide professional services including: ${
          contractData.title || "Services as specified"
        }.`,
      },
      {
        title: "3. TERM AND DURATION",
        content: `This Agreement shall commence on ${formatDate(
          contractData.startDate
        )} and continue until ${formatDate(contractData.endDate)}. Duration: ${
          contractData.duration || "Not specified"
        }.`,
      },
      {
        title: "4. FEES, PAYMENTS, AND TAXES",
        content: `Client agrees to pay Supplier ${formatCurrencySync(
          contractData.totalValue
        )} ${contractData.currency || "RWF"}. Payment Schedule: ${
          contractData.paymentSchedule || "Not specified"
        }. Payment Terms: ${contractData.paymentTerms || "Not specified"}.`,
      },
      {
        title: "5. TERMINATION",
        content: `Termination Terms: ${
          contractData.terminationTerms || "As per standard terms"
        }.`,
      },
    ];

    sections.forEach((section) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
        addPageWatermark();
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(section.content, contentWidth);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 8;
    });

    // Deliverables
    if (contractData.deliverables && contractData.deliverables.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
        addPageWatermark();
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("6. DELIVERABLES", margin, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      contractData.deliverables.forEach((deliverable, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
          addPageWatermark();
        }

        doc.text(
          `${index + 1}. ${deliverable.description || "Not specified"}`,
          margin + 5,
          yPos
        );
        yPos += 5;
        doc.text(
          `   Due Date: ${formatDate(
            deliverable.dueDate
          )} | Value: ${formatCurrencySync(deliverable.value)} ${
            contractData.currency || "RWF"
          }`,
          margin + 5,
          yPos
        );
        yPos += 8;
      });
    }

    // Special Conditions
    if (contractData.specialConditions) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
        addPageWatermark();
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("7. SPECIAL CONDITIONS", margin, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const specialLines = doc.splitTextToSize(
        contractData.specialConditions,
        contentWidth
      );
      doc.text(specialLines, margin + 5, yPos);
      yPos += specialLines.length * 5 + 8;
    }

    // Signatures Section
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
      addPageWatermark();
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SIGNATURES", margin, yPos);
    yPos += 15;

    // Supplier Signature
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SUPPLIER", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    if (contractData.supplierSignature) {
      try {
        doc.addImage(
          contractData.supplierSignature,
          "PNG",
          margin,
          yPos,
          40,
          15
        );
        yPos += 18;
      } catch (error) {
        doc.text("Signature: [Signed]", margin, yPos);
        yPos += 6;
      }
    } else {
      doc.text("Signature: [Not signed]", margin, yPos);
      yPos += 6;
    }
    doc.text(
      `Name: ${
        contractData.supplierCompany ||
        contractData.supplierName ||
        "Not specified"
      }`,
      margin,
      yPos
    );
    yPos += 6;
    doc.text(
      `Date: ${
        contractData.updateOn ? formatDate(contractData.updateOn) : "Not signed"
      }`,
      margin,
      yPos
    );

    yPos += 15;

    // Client Signature
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    if (contractData.clientSignature) {
      try {
        doc.addImage(contractData.clientSignature, "PNG", margin, yPos, 40, 15);
        yPos += 18;
      } catch (error) {
        doc.text("Signature: [Signed]", margin, yPos);
        yPos += 6;
      }
    } else {
      doc.text("Signature: [Not signed]", margin, yPos);
      yPos += 6;
    }
    doc.text(
      `Name: ${
        contractData.clientCompany || contractData.clientName || "Not specified"
      }`,
      margin,
      yPos
    );
    yPos += 6;
    doc.text(
      `Date: ${
        contractData.doneAt ? formatDate(contractData.doneAt) : "Not signed"
      }`,
      margin,
      yPos
    );

    // Add QR Code to last page
    try {
      const contractUrl = `https://plas.rw/contracts/${contractData.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(contractUrl, {
        width: 80,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // Position QR code at bottom right
      const qrSize = 30;
      const qrX = pageWidth - margin - qrSize;
      const qrY = pageHeight - 45;

      doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // Add QR code label
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("View Contract", qrX, qrY + qrSize + 4, {
        align: "center",
        maxWidth: qrSize,
      });
      doc.text("plas.rw", qrX, qrY + qrSize + 8, {
        align: "center",
        maxWidth: qrSize,
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }

    // Add contract tracking ID at bottom
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Contract Tracking ID: ${contractData.id}`,
      margin,
      pageHeight - 15
    );
    doc.text(
      `Generated by PLAS Platform - ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 10
    );

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 20,
        pageHeight - 10,
        { align: "right" }
      );
    }

    // Save the PDF
    doc.save(
      `contract-${contractData.contractId}-${contractData.id.slice(0, 8)}.pdf`
    );
  } catch (error) {
    console.error("Error generating contract PDF:", error);
    throw error;
  }
};
