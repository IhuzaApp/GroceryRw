import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { downloadInvoiceAsPdf, InvoiceData } from "../../../src/lib/invoiceUtils";
import jsPDF from "jspdf";
import fs from 'fs';
import path from 'path';

// Function to generate PDF buffer
async function generateInvoicePdf(invoiceData: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  try {
    // Debug current working directory
    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // Try multiple possible paths for the PNG logo
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'assets', 'logos', 'PlasLogoPNG.png'),
      path.join(__dirname, '..', '..', '..', 'public', 'assets', 'logos', 'PlasLogoPNG.png'),
      path.join(process.cwd(), '..', 'public', 'assets', 'logos', 'PlasLogoPNG.png'),
      '/Users/apple/Documents/Projects/grocery/public/assets/logos/PlasLogoPNG.png'
    ];
    
    let logoPath = null;
    for (const testPath of possiblePaths) {
      console.log('Testing path:', testPath);
      if (fs.existsSync(testPath)) {
        logoPath = testPath;
        console.log('Found logo at:', logoPath);
        break;
      }
    }
    
    if (logoPath) {
      const logoBuffer = fs.readFileSync(logoPath);
      console.log('Logo file size:', logoBuffer.length, 'bytes');
      
      // Convert PNG to base64 for embedding
      const base64Logo = logoBuffer.toString('base64');
      const logoDataUrl = `data:image/png;base64,${base64Logo}`;
      
      console.log('Base64 data URL length:', logoDataUrl.length);
      
      // Add the logo (resize to fit)
      doc.addImage(logoDataUrl, 'PNG', 20, 10, 60, 25);
      console.log('PNG logo added to PDF successfully');
    } else {
      console.log('PNG logo file not found in any of the tested paths, using fallback text');
      // Fallback: Add styled Plas text if logo file not found
      doc.setFontSize(24);
      doc.setTextColor(67, 175, 74); // Green color matching the logo
      doc.setFont("helvetica", "bold");
      doc.text('PLAS', 20, 30);
    }
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    // Fallback: Add styled Plas text
    doc.setFontSize(24);
    doc.setTextColor(67, 175, 74); // Green color matching the logo
    doc.setFont("helvetica", "bold");
    doc.text('PLAS', 20, 30);
  }
  
  // Add invoice title below the logo
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Black color
  doc.setFont("helvetica", "normal");
  doc.text('Invoice', 20, 45);
  
  // Add invoice number
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, 60);
  doc.text(`Date: ${invoiceData.dateCreated}`, 20, 70);
  
  // Add order type
  doc.text(`Order Type: ${invoiceData.orderType === 'reel' ? 'Reel Order' : 'Regular Order'}`, 20, 80);
  
  // Add customer info
  doc.text('Customer:', 20, 100);
  doc.text(invoiceData.customer, 20, 110);
  doc.text(invoiceData.customerEmail, 20, 120);
  
  // Add shop/order info
  if (invoiceData.orderType === 'reel') {
    doc.text('Restaurant:', 20, 140);
    doc.text(invoiceData.shop, 20, 150);
    doc.text(invoiceData.shopAddress, 20, 160);
    if (invoiceData.reel_title) {
      doc.text(`Reel: ${invoiceData.reel_title}`, 20, 170);
    }
  } else {
    doc.text('Shop:', 20, 140);
    doc.text(invoiceData.shop, 20, 150);
    doc.text(invoiceData.shopAddress, 20, 160);
  }
  
  // Add items table
  let yPosition = 190;
  doc.text('Items:', 20, yPosition);
  yPosition += 10;
  
  invoiceData.items.forEach((item: any, index: number) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (invoiceData.orderType === 'reel') {
      // For reel orders, show name and description
      doc.text(`${item.name}`, 20, yPosition);
      if (item.description) {
        doc.text(`Description: ${item.description}`, 20, yPosition + 8);
        yPosition += 8;
      }
      doc.text(`Quantity: ${item.quantity}`, 20, yPosition + 8);
      doc.text(`$${item.total.toFixed(2)}`, 150, yPosition);
      yPosition += 16;
    } else {
      // For regular orders, show product details
      doc.text(`${item.name} x${item.quantity}`, 20, yPosition);
      doc.text(`$${item.total.toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    }
  });
  
  // Add totals
  yPosition += 10;
  doc.text(`Subtotal: $${invoiceData.subtotal.toFixed(2)}`, 120, yPosition);
  yPosition += 10;
  doc.text(`Service Fee: $${invoiceData.serviceFee.toFixed(2)}`, 120, yPosition);
  yPosition += 10;
  doc.text(`Delivery Fee: $${invoiceData.deliveryFee.toFixed(2)}`, 120, yPosition);
  yPosition += 10;
  doc.setFontSize(14);
  doc.text(`Total: $${invoiceData.total.toFixed(2)}`, 120, yPosition);
  
  return Buffer.from(doc.output('arraybuffer'));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== INVOICE API CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  console.log('Request URL:', req.url);
  
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      console.log('❌ Unauthorized - no session');
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;
    console.log('🔍 Raw ID from query:', { id, type: typeof id });
    
    if (!id || typeof id !== "string") {
      console.log('❌ Invalid ID:', id);
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    // Use the invoice ID directly - no need to process prefixes
    const actualId = id;
    
    console.log('🔧 ID Processing:', {
      originalId: id,
      actualId,
      timestamp: new Date().toISOString()
    });

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
          delivery_notes
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
    
    console.log('📊 Query variables:', variables);
    console.log('🎯 Will execute getInvoiceDetials query for invoice ID:', actualId);

    if (!hasuraClient) {
      return res
        .status(500)
        .json({ message: "Database connection not available" });
    }

    // Fetch invoice using the exact getInvoiceDetials query
    console.log('🔍 FETCHING INVOICE:', { actualId, variables });
    console.log('🔍 Query:', getInvoiceDetailsQuery);
    
    const response = await hasuraClient.request(getInvoiceDetailsQuery, variables) as any;
    const invoices = response.Invoices;
    
    console.log('📦 Invoice response:', { 
      invoiceCount: invoices?.length || 0,
      responseKeys: Object.keys(response),
      fullResponse: response
    });
    
    if (!invoices || invoices.length === 0) {
      console.log('❌ Invoice not found for ID:', actualId);
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoices[0]; // Get the first (and should be only) invoice

    // Fetch reel order details if it's a reel order
    let reelOrderDetails = null;
    if (invoice.reel_order_id) {
      console.log('🔍 FETCHING REEL ORDER DETAILS:', { reel_order_id: invoice.reel_order_id });
      try {
        const reelResponse = await hasuraClient.request(getReelOrderDetailsQuery, { 
          reel_order_id: invoice.reel_order_id 
        }) as any;
        reelOrderDetails = reelResponse.reel_orders?.[0] || null;
        console.log('📦 Reel Order response:', { 
          reelOrderCount: reelResponse.reel_orders?.length || 0,
          reelOrderDetails
        });
      } catch (error) {
        console.error('❌ Error fetching reel order details:', error);
        // Continue without reel order details
      }
    }

    // Determine order type: if order_id is null, it's a reel order; if reel_order_id is null, it's a regular order
    const isReelOrder = invoice.order_id === null && invoice.reel_order_id !== null;
    const isRegularOrder = invoice.reel_order_id === null && invoice.order_id !== null;

    console.log('🔍 Order Type Detection:', {
      order_id: invoice.order_id,
      reel_order_id: invoice.reel_order_id,
      isReelOrder,
      isRegularOrder
    });

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
        items: invoice.invoice_items?.map((item: any) => ({
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
        reel_title: reelOrderDetails?.Reel?.title || invoice.invoice_items?.[0]?.description || "Reel Order",
        reel_description: reelOrderDetails?.Reel?.description || invoice.invoice_items?.[0]?.description || "",
        delivery_photo_url: reelOrderDetails?.delivery_photo_url || invoice.Order?.delivery_photo_url,
        // Restaurant details
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          location: restaurant.location,
          verified: restaurant.verified
        } : null
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
        items: invoice.Order?.Order_Items?.map((item: any) => ({
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
        delivery_photo_url: invoice.Order?.delivery_photo_url
      };
    }

    // Check if the request is for PDF download
    const isPdfRequest = req.query.pdf === 'true';
    console.log('📄 PDF Request:', isPdfRequest);
    
    if (isPdfRequest) {
      // Generate PDF and return as file
      try {
        console.log('🔄 Generating PDF...');
        const pdfBuffer = await generateInvoicePdf(transformedInvoice);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${transformedInvoice.invoiceNumber}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        console.log('✅ PDF generated successfully');
        return res.status(200).send(pdfBuffer);
      } catch (error) {
        console.error('❌ Error generating PDF:', error);
        return res.status(500).json({ error: 'Failed to generate PDF' });
      }
    }

    console.log('✅ Returning invoice data:', {
      invoiceId: transformedInvoice.id,
      invoiceNumber: transformedInvoice.invoiceNumber,
      orderType: transformedInvoice.orderType
    });

    res.status(200).json({ invoice: transformedInvoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      message: "Failed to fetch invoice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


