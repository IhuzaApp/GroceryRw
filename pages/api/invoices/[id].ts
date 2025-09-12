import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import {
  downloadInvoiceAsPdf,
  InvoiceData,
} from "../../../src/lib/invoiceUtils";
import {
  formatCurrencySync,
  getCurrencySymbol,
} from "../../../src/utils/formatCurrency";
import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

// Function to load image as base64
async function loadImageAsBase64(imagePath: string): Promise<string> {
  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64 = imageBuffer.toString("base64");
    const mimeType = imagePath.endsWith(".png")
      ? "image/png"
      : imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg")
      ? "image/jpeg"
      : imagePath.endsWith(".svg")
      ? "image/svg+xml"
      : "image/png";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    throw error;
  }
}

// Function to generate PDF buffer
async function generateInvoicePdf(invoiceData: any): Promise<Buffer> {
  const doc = new jsPDF();

  // Set initial position and page dimensions
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
    doc.text(invoiceData.invoiceNumber, centerX - textWidth / 2, centerY + 60, {
      angle: -45,
    });
  };

  // Add watermark to first page
  addWatermark();

  // Load and add the actual logo image
  try {
    const logoBase64 = await loadImageAsBase64("assets/logos/PlasLogoPNG.png");

    // Add logo to PDF (positioned at top left)
    doc.addImage(logoBase64, "PNG", margin, yPos - 10, 40, 20);
  } catch (error) {
    // Fallback: Add styled Plas text
    doc.setFontSize(24);
    doc.setTextColor(67, 175, 74); // Green color matching the logo
    doc.setFont("helvetica", "bold");
    doc.text("PLAS", margin, yPos);
  }

  yPos += 15;

  // Add invoice title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, yPos);

  yPos += 10;

  // Add invoice number and order number
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, margin, yPos);
  doc.text(
    `Order #: ${
      invoiceData.orderType === "reel"
        ? `REEL-${invoiceData.invoiceNumber}`
        : invoiceData.orderNumber || `INV-${invoiceData.invoiceNumber}`
    }`,
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
  doc.setTextColor(67, 175, 74); // Green for status
  doc.text(`Status: ${invoiceData.status.toUpperCase()}`, margin, yPos);

  yPos += 20;

  // Add shop and customer information
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(
    invoiceData.orderType === "reel" ? "RESTAURANT DETAILS" : "SHOP DETAILS",
    margin,
    yPos
  );
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
  doc.setFillColor(67, 175, 74); // Green background
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

  invoiceData.items.forEach((item: any, index: number) => {
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

    if (invoiceData.orderType === "reel") {
      // For reel orders, show name and description
      const itemName =
        item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name;
      doc.text(itemName, margin + 2, yPos);

      if (item.description) {
        doc.setFontSize(8);
        doc.text(
          `Desc: ${item.description.substring(0, 40)}${
            item.description.length > 40 ? "..." : ""
          }`,
          margin + 2,
          yPos + 3
        );
        doc.setFontSize(10);
      }

      // Quantity
      doc.text(item.quantity.toString(), margin + 80, yPos);

      // Unit price
      doc.text(formatCurrencySync(item.unitPrice), margin + 110, yPos);

      // Total
      doc.text(formatCurrencySync(item.total), margin + 150, yPos);

      yPos += 12;
    } else {
      // For regular orders, show product details
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
    }
  });

  yPos += 10;

  // Add summary section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  // Draw summary box
  const summaryY = yPos;
  doc.setDrawColor(67, 175, 74);
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
  doc.setTextColor(67, 175, 94);
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
  doc.text("The payment reflects only the value of found items.", margin, yPos);

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

  // Add QR Code to the last page
  try {
    // Generate QR code data with required information:
    // - created_at (date)
    // - product names
    // - total amount excluding service fee and delivery fee
    const productNames = invoiceData.items
      .map((item: any) => item.name)
      .join(", ");
    const subtotalAmount = invoiceData.subtotal; // This is the amount excluding service and delivery fees

    // Get the system currency
    const currency = getCurrencySymbol();

    // Create a more readable QR code data structure
    const qrData = JSON.stringify({
      invoice: {
        id: invoiceData.id,
        number: invoiceData.invoiceNumber,
        created_at: invoiceData.dateCreated,
        products: productNames,
        subtotal: subtotalAmount,
        currency: currency, // Use system configured currency
        type: invoiceData.orderType,
      },
      // Add a human-readable summary for easy scanning
      summary: `Invoice ${
        invoiceData.invoiceNumber
      } - ${productNames} - ${formatCurrencySync(subtotalAmount)} - ${
        invoiceData.dateCreated
      }`,
    });

    // Generate QR code as base64
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 100,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Calculate position for QR code (bottom right)
    const pageHeight = doc.internal.pageSize.height;
    const qrSize = 30;
    const qrX = pageWidth - margin - qrSize;
    const qrY = pageHeight - 50; // Position near bottom of page

    // Add QR code to PDF (positioned at bottom right)
    doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Add QR code label
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text("Invoice QR Code", qrX, qrY + qrSize + 5);
  } catch (error) {
    // Continue without QR code if there's an error
  }

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

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return buffer;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    // Use the invoice ID directly - no need to process prefixes
    const actualId = id;

    // GraphQL query to fetch invoice details - EXACT match to Invoices.graphql
    const getInvoiceDetailsQuery = `
      query getInvoiceDetials($id: uuid!) {
        Invoices(where: { id: { _eq: $id } }) {
          created_at
          customer_id
          delivery_fee
          discount
          id
          invoice_items
          invoice_number
          Proof
          order_id
          reel_order_id
          service_fee
          status
          subtotal
          tax
          total_amount
          Order {
            combined_order_id
            created_at
            delivery_address_id
            delivery_fee
            delivery_notes
            delivery_photo_url
            delivery_time
            discount
            found
            id
            service_fee
            shop_id
            shopper_id
            status
            total
            updated_at
            user_id
            voucher_code
            Order_Items {
              created_at
              id
              order_id
              price
              product_id
              quantity
              Product {
                category
                created_at
                final_price
                id
                image
                is_active
                measurement_unit
                price
                quantity
                reorder_point
                shop_id
                sku
                supplier
                updated_at
                productName_id
                ProductName {
                  barcode
                  create_at
                  description
                  id
                  image
                  name
                  sku
                }
              }
            }
            OrderID
          }
          User {
            created_at
            email
            gender
            id
            is_active
            name
            password_hash
            phone
            profile_picture
            role
            updated_at
          }
        }
      }
    `;

    // Additional query to fetch reel order details with restaurant info
    const getReelOrderDetailsQuery = `
      query getReelOrderDetails($reel_order_id: uuid!) {
        reel_orders(where: { id: { _eq: $reel_order_id } }) {
          id
          OrderID
          status
          created_at
          total
          service_fee
          delivery_fee
          delivery_time
          delivery_photo_url
          Reel {
            id
            title
            description
            Price
            Product
            type
            video_url
            restaurant_id
            Restaurant {
              id
              name
              email
              phone
              location
              profile
              verified
            }
          }
        }
      }
    `;

    const variables = { id: actualId };

    if (!hasuraClient) {
      return res
        .status(500)
        .json({ message: "Database connection not available" });
    }

    // Fetch invoice using the exact getInvoiceDetials query

    const response = (await hasuraClient.request(
      getInvoiceDetailsQuery,
      variables
    )) as any;
    const invoices = response.Invoices;

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoices[0]; // Get the first (and should be only) invoice

    // Fetch reel order details if it's a reel order
    let reelOrderDetails = null;
    if (invoice.reel_order_id) {
      try {
        const reelResponse = (await hasuraClient.request(
          getReelOrderDetailsQuery,
          {
            reel_order_id: invoice.reel_order_id,
          }
        )) as any;
        reelOrderDetails = reelResponse.reel_orders?.[0] || null;
      } catch (error) {
        // Continue without reel order details
      }
    }

    // Determine order type: if order_id is null, it's a reel order; if reel_order_id is null, it's a regular order
    const isReelOrder =
      invoice.order_id === null && invoice.reel_order_id !== null;
    const isRegularOrder =
      invoice.reel_order_id === null && invoice.order_id !== null;

    // Transform the data based on order type
    let transformedInvoice;

    if (isReelOrder) {
      // Handle reel order invoice
      const restaurant = reelOrderDetails?.Reel?.Restaurant;
      transformedInvoice = {
        id: invoice.id,
        orderId: invoice.reel_order_id,
        invoiceNumber: invoice.invoice_number,
        orderNumber: `REEL-${invoice.invoice_number}`,
        orderType: "reel",
        status: invoice.status,
        dateCreated: new Date(invoice.created_at).toLocaleDateString(),
        dateCompleted: new Date(invoice.created_at).toLocaleDateString(),
        shop: restaurant?.name || "Restaurant",
        shopAddress: restaurant?.location || "Location not available",
        customer: invoice.User?.name || "Unknown Customer",
        customerEmail: invoice.User?.email || "Email not available",
        // For reel orders, use invoice_items instead of Order_Items
        items:
          invoice.invoice_items?.map((item: any) => ({
            name: item.name || "Reel Item",
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.unit_price) || 0,
            unit: item.unit || "item",
            total: parseFloat(item.total) || 0,
          })) || [],
        subtotal: parseFloat(invoice.subtotal) || 0,
        serviceFee: parseFloat(invoice.service_fee) || 0,
        deliveryFee: parseFloat(invoice.delivery_fee) || 0,
        total: parseFloat(invoice.total_amount) || 0,

        // Include ALL exact fields from Invoices.graphql structure
        created_at: invoice.created_at,
        customer_id: invoice.customer_id,
        delivery_fee: invoice.delivery_fee,
        discount: invoice.discount,
        invoice_items: invoice.invoice_items,
        Proof: invoice.Proof,
        order_id: invoice.order_id,
        reel_order_id: invoice.reel_order_id,
        service_fee: invoice.service_fee,
        tax: invoice.tax,
        total_amount: invoice.total_amount,
        Order: invoice.Order,
        User: invoice.User,
        // Reel-specific fields
        reel_title:
          reelOrderDetails?.Reel?.title ||
          invoice.invoice_items?.[0]?.description ||
          "Reel Order",
        reel_description:
          reelOrderDetails?.Reel?.description ||
          invoice.invoice_items?.[0]?.description ||
          "",
        delivery_photo_url:
          reelOrderDetails?.delivery_photo_url ||
          invoice.Order?.delivery_photo_url,
        // Restaurant details
        restaurant: restaurant
          ? {
              id: restaurant.id,
              name: restaurant.name,
              email: restaurant.email,
              phone: restaurant.phone,
              location: restaurant.location,
              verified: restaurant.verified,
            }
          : null,
      };
    } else {
      // Handle regular order invoice
      transformedInvoice = {
        id: invoice.id,
        orderId: invoice.order_id,
        invoiceNumber: invoice.invoice_number,
        orderNumber: invoice.Order?.OrderID || `INV-${invoice.invoice_number}`,
        orderType: "regular",
        status: invoice.status,
        dateCreated: new Date(invoice.created_at).toLocaleDateString(),
        dateCompleted: invoice.Order?.updated_at
          ? new Date(invoice.Order.updated_at).toLocaleDateString()
          : new Date(invoice.created_at).toLocaleDateString(),
        shop: invoice.Order?.Shop?.name || "Unknown Shop",
        shopAddress: invoice.Order?.Shop?.address || "Address not available",
        customer: invoice.User?.name || "Unknown Customer",
        customerEmail: invoice.User?.email || "Email not available",
        // For regular orders, use Order_Items
        items:
          invoice.Order?.Order_Items?.map((item: any) => ({
            name: item.Product?.ProductName?.name || "Unknown Product",
            quantity: item.quantity,
            unitPrice: parseFloat(item.price) || 0,
            unit: item.Product?.measurement_unit || "unit",
            total: (parseFloat(item.price) || 0) * (item.quantity || 0),
          })) || [],
        subtotal: parseFloat(invoice.subtotal) || 0,
        serviceFee: parseFloat(invoice.service_fee) || 0,
        deliveryFee: parseFloat(invoice.delivery_fee) || 0,
        total: parseFloat(invoice.total_amount) || 0,

        // Include ALL exact fields from Invoices.graphql structure
        created_at: invoice.created_at,
        customer_id: invoice.customer_id,
        delivery_fee: invoice.delivery_fee,
        discount: invoice.discount,
        invoice_items: invoice.invoice_items,
        Proof: invoice.Proof,
        order_id: invoice.order_id,
        reel_order_id: invoice.reel_order_id,
        service_fee: invoice.service_fee,
        tax: invoice.tax,
        total_amount: invoice.total_amount,
        Order: invoice.Order,
        User: invoice.User,
        delivery_photo_url: invoice.Order?.delivery_photo_url,
      };
    }

    // Check if the request is for PDF download
    const isPdfRequest = req.query.pdf === "true";

    if (isPdfRequest) {
      // Generate PDF and return as file
      try {
        const pdfBuffer = await generateInvoicePdf(transformedInvoice);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="invoice-${transformedInvoice.invoiceNumber}.pdf"`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.status(200).send(pdfBuffer);
      } catch (error) {
        return res.status(500).json({
          error: "Failed to generate PDF",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(200).json({ invoice: transformedInvoice });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
