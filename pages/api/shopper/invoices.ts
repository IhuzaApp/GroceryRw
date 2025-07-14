import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// GraphQL query to fetch shopper invoices for both regular and reel orders
const GET_SHOPPER_INVOICES = gql`
  query GetShopperInvoices($shopper_id: uuid!, $limit: Int!, $offset: Int!) {
    # Regular order invoices
    RegularOrderInvoices: Invoices(
      where: { 
        Order: { shopper_id: { _eq: $shopper_id }, status: { _eq: "delivered" } }
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      invoice_number
      order_id
      reel_order_id
      total_amount
      subtotal
      delivery_fee
      service_fee
      tax
      discount
      status
      created_at
      invoice_items
      customer_id
      # Customer details
      User {
        id
        name
        email
        phone
      }
      # Regular order details
      Order {
        id
        OrderID
        total
        service_fee
        delivery_fee
        created_at
        status
        delivery_time
        delivery_notes
        found
        shopper_id
        Shop {
          id
          name
          address
        }
        userByUserId {
          id
          name
          email
          phone
        }
        Address {
          street
          city
          postal_code
        }
        Order_Items_aggregate {
          aggregate {
            count
          }
        }
      }
    }
    
    # Get delivered reel orders for this shopper
    DeliveredReelOrders: reel_orders(
      where: { 
        shopper_id: { _eq: $shopper_id }
        status: { _eq: "delivered" }
      }
    ) {
      id
      OrderID
      total
      service_fee
      delivery_fee
      created_at
      status
      delivery_time
      delivery_note
      found
      shopper_id
      quantity
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
        Restaurant {
          id
          name
          location
        }
      }
      User {
        id
        name
        email
        phone
      }
      Address {
        street
        city
        postal_code
      }
    }
    
    # Count for regular order invoices
    Invoices_aggregate(
      where: { 
        Order: { shopper_id: { _eq: $shopper_id }, status: { _eq: "delivered" } }
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
    const session = (await getServerSession(req, res, authOptions as any)) as any;
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
    const data = await hasuraClient.request<{
      RegularOrderInvoices: Invoice[];
      DeliveredReelOrders: Array<{
        id: string;
        OrderID: string;
        total: string;
        service_fee: string;
        delivery_fee: string;
        created_at: string;
        status: string;
        delivery_time: string;
        delivery_note?: string;
        found: boolean;
        shopper_id: string;
        quantity: string;
        Reel: {
          id: string;
          title: string;
          description: string;
          Price: string;
          Product: string;
          type: string;
          video_url: string;
          Restaurant: {
            id: string;
            name: string;
            location: string;
          };
        };
        User: {
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

    // Transform regular order invoices
    const transformedRegularInvoices = data.RegularOrderInvoices.map((invoice) => {
      if (invoice.Order) {
        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          order_id: invoice.order_id,
          order_type: "regular" as const,
          total_amount: invoice.total_amount,
          subtotal: invoice.subtotal,
          delivery_fee: invoice.delivery_fee,
          service_fee: invoice.service_fee,
          tax: invoice.tax,
          discount: invoice.discount,
          created_at: invoice.created_at,
          status: invoice.status as "paid" | "pending" | "overdue",
          customer_name: invoice.User.name,
          customer_email: invoice.User.email,
          customer_phone: invoice.User.phone,
          customer_address: `${invoice.Order.Address.street}, ${invoice.Order.Address.city}`,
          items_count: invoice.Order.Order_Items_aggregate.aggregate.count,
          shop_name: invoice.Order.Shop.name,
          shop_address: invoice.Order.Shop.address,
          delivery_time: invoice.Order.delivery_time,
          delivery_notes: invoice.Order.delivery_notes,
          found: invoice.Order.found,
          order_status: invoice.Order.status,
        };
      }
      return null;
    }).filter(Boolean);

    // Transform reel orders to invoice format
    const transformedReelInvoices = data.DeliveredReelOrders.map((reelOrder) => {
      return {
        id: `reel-${reelOrder.id}`, // Generate a unique ID for reel orders
        invoice_number: `REEL-${reelOrder.OrderID}`,
        order_id: reelOrder.id,
        order_type: "reel" as const,
        total_amount: parseFloat(reelOrder.total),
        subtotal: parseFloat(reelOrder.total) - parseFloat(reelOrder.service_fee) - parseFloat(reelOrder.delivery_fee),
        delivery_fee: parseFloat(reelOrder.delivery_fee),
        service_fee: parseFloat(reelOrder.service_fee),
        tax: 0, // Reel orders might not have tax
        discount: 0,
        created_at: reelOrder.created_at,
        status: "paid" as const,
        customer_name: reelOrder.User.name,
        customer_email: reelOrder.User.email,
        customer_phone: reelOrder.User.phone,
        customer_address: `${reelOrder.Address.street}, ${reelOrder.Address.city}`,
        items_count: 1, // Reel orders have 1 item (the reel)
        shop_name: reelOrder.Reel.Restaurant.name,
        shop_address: reelOrder.Reel.Restaurant.location,
        delivery_time: reelOrder.delivery_time,
        delivery_notes: reelOrder.delivery_note,
        found: reelOrder.found,
        order_status: reelOrder.status,
        reel_details: {
          title: reelOrder.Reel.title,
          description: reelOrder.Reel.description,
          product: reelOrder.Reel.Product,
          quantity: reelOrder.quantity,
        },
      };
    });

    // Combine and sort all invoices by creation date
    const allInvoices = [...transformedRegularInvoices, ...transformedReelInvoices]
      .sort((a, b) => {
        if (!a || !b) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, limit); // Ensure we don't exceed the limit

    const totalCount = data.Invoices_aggregate.aggregate.count + 
                      data.DeliveredReelOrders.length;
    const totalPages = Math.ceil(totalCount / limit);

    logger.info("Invoices fetched successfully", "ShopperInvoicesAPI", {
      shopperId,
      count: allInvoices.length,
      regularCount: transformedRegularInvoices.length,
      reelCount: transformedReelInvoices.length,
      totalCount,
      page,
      totalPages,
    });

    return res.status(200).json({
      success: true,
      invoices: allInvoices,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    logger.error("Error fetching shopper invoices", "ShopperInvoicesAPI", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch invoices",
    });
  }
} 