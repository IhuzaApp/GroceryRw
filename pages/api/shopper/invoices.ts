import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// GraphQL query to fetch shopper invoices - EXACT match to Invoices.graphql
const GET_SHOPPER_INVOICES = gql`
  query getInvoiceDetials($shopper_id: uuid!, $limit: Int!, $offset: Int!) {
    Invoices(
      where: {
        _or: [
          { Order: { shopper_id: { _eq: $shopper_id } } }
          { customer_id: { _eq: $shopper_id } }
        ]
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
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
    Invoices_aggregate(
      where: {
        _or: [
          { Order: { shopper_id: { _eq: $shopper_id } } }
          { customer_id: { _eq: $shopper_id } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

interface Invoice {
  id: string;
  invoice_number: string;
  order_id?: string;
  reel_order_id?: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  discount?: number;
  status: string;
  created_at: string;
  invoice_items: any;
  customer_id: string;
  Proof?: string;
  User: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  Order?: {
    id: string;
    OrderID: string;
    total: string;
    service_fee: string;
    delivery_fee: string;
    created_at: string;
    status: string;
    delivery_time: string;
    delivery_notes?: string;
    found: boolean;
    Shop: {
      id: string;
      name: string;
      address: string;
    };
    userByUserId: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    Address: {
      street: string;
      city: string;
      postal_code: string;
    };
    Order_Items_aggregate: {
      aggregate: {
        count: number;
      };
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Authenticate user
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as any;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const shopperId = session.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10; // Items per page
    const offset = (page - 1) * limit;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Fetch invoices from database
    
    // First, let's check what invoices exist in the database using EXACT Invoices.graphql structure
    const allInvoicesCheck = await hasuraClient.request(`
      query getInvoiceDetials {
        Invoices(limit: 10) {
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
    `);
    
    
    const data = await hasuraClient.request<{
      Invoices: Array<{
        id: string;
        invoice_number: string;
        order_id?: string;
        reel_order_id?: string;
        total_amount: string;
        subtotal: string;
        delivery_fee: string;
        service_fee: string;
        tax: string;
        discount: string;
        status: string;
        created_at: string;
        invoice_items: any;
        customer_id: string;
        Proof?: string;
        Order?: {
          id: string;
          OrderID: string;
          total: string;
          service_fee: string;
          delivery_fee: string;
          created_at: string;
          status: string;
          delivery_time: string;
          delivery_notes?: string;
          delivery_photo_url?: string;
          found: boolean;
          shopper_id: string;
          Shop?: {
            id: string;
            name: string;
            address: string;
          };
          userByUserId?: {
            id: string;
            name: string;
            email: string;
            phone: string;
          };
          Address?: {
            street: string;
            city: string;
            postal_code: string;
          };
          Order_Items?: Array<{
            id: string;
            quantity: number;
            price: string;
            Product?: {
              id: string;
              name?: string;
              final_price: string;
              image?: string;
              category?: string;
              ProductName?: {
                name: string;
                description?: string;
              };
            };
          }>;
        };
        User: {
          id: string;
          name: string;
          email: string;
          phone: string;
        };
      }>;
      Invoices_aggregate: {
        aggregate: {
          count: number;
        };
      };
    }>(GET_SHOPPER_INVOICES, {
      shopper_id: shopperId,
      limit,
      offset,
    });


    // Transform all invoices (both regular and reel orders)
    
    const transformedInvoices = data.Invoices.map((invoice) => {
      const isReelOrder = !!invoice.reel_order_id;
      
      if (isReelOrder) {
        // Handle reel order invoice
        return {
          id: invoice.id, // Use the actual invoice ID
          invoice_number: invoice.invoice_number,
          order_id: invoice.reel_order_id,
          order_type: "reel" as const,
          total_amount: parseFloat(invoice.total_amount),
          subtotal: parseFloat(invoice.subtotal),
          delivery_fee: parseFloat(invoice.delivery_fee),
          service_fee: parseFloat(invoice.service_fee),
          tax: parseFloat(invoice.tax),
          discount: parseFloat(invoice.discount),
          created_at: invoice.created_at,
          status: invoice.status as "paid" | "pending" | "overdue",
          customer_name: invoice.User.name,
          customer_email: invoice.User.email,
          customer_phone: invoice.User.phone,
          customer_address: "Address not available", // Reel orders might not have address in invoice
          items_count: invoice.invoice_items?.length || 1,
          shop_name: "Reel Order", // Reel orders don't have shop
          shop_address: "N/A",
          delivery_time: null,
          delivery_notes: null,
          found: false,
          order_status: "completed",
          Proof: invoice.Proof,
          delivery_photo_url: invoice.Order?.delivery_photo_url, // Add delivery photo URL for reel orders
          reel_title: invoice.invoice_items?.[0]?.description || "Reel Order",
          reel_details: {
            title: invoice.invoice_items?.[0]?.description || "Reel Order",
            description: invoice.invoice_items?.[0]?.description || "",
            product: invoice.invoice_items?.[0]?.name || "Reel",
            quantity: invoice.invoice_items?.[0]?.quantity || 1,
          },
        };
      } else {
        // Handle regular order invoice
        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          order_id: invoice.order_id,
          order_type: "regular" as const,
          total_amount: parseFloat(invoice.total_amount),
          subtotal: parseFloat(invoice.subtotal),
          delivery_fee: parseFloat(invoice.delivery_fee),
          service_fee: parseFloat(invoice.service_fee),
          tax: parseFloat(invoice.tax),
          discount: parseFloat(invoice.discount),
          created_at: invoice.created_at,
          status: invoice.status as "paid" | "pending" | "overdue",
          customer_name: invoice.User.name,
          customer_email: invoice.User.email,
          customer_phone: invoice.User.phone,
          customer_address: invoice.Order?.Address ? 
            `${invoice.Order.Address.street}, ${invoice.Order.Address.city}` : 
            "Address not available",
          items_count: invoice.Order?.Order_Items?.length || 0,
          shop_name: invoice.Order?.Shop?.name || "Shop",
          shop_address: invoice.Order?.Shop?.address || "Address not available",
          delivery_time: invoice.Order?.delivery_time,
          delivery_notes: invoice.Order?.delivery_notes,
          found: invoice.Order?.found || false,
          order_status: invoice.Order?.status || "unknown",
          Proof: invoice.Proof,
          delivery_photo_url: invoice.Order?.delivery_photo_url,
        };
      }
    });

    // Sort by creation date
    const sortedInvoices = transformedInvoices.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const totalCount = data.Invoices_aggregate.aggregate.count;
    const totalPages = Math.ceil(totalCount / limit);


    logger.info("Invoices fetched successfully", "ShopperInvoicesAPI", {
      shopperId,
      count: sortedInvoices.length,
      totalCount,
      page,
      totalPages,
    });

    return res.status(200).json({
      success: true,
      invoices: sortedInvoices,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    logger.error(
      "Error fetching shopper invoices",
      "ShopperInvoicesAPI",
      error
    );
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch invoices",
    });
  }
}
