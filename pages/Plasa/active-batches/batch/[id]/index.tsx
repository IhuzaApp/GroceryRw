"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import ShopperLayout from "@components/shopper/ShopperLayout"
import BatchDetails from "@components/shopper/batchDetails"
import { GetServerSideProps } from "next"
import { hasuraClient } from "../../../../../src/lib/hasuraClient"
import { gql } from "graphql-request"
import { getSession } from "next-auth/react"

// Define interfaces for the order data
interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
    price: number
  }
}

interface OrderDetailsType {
  id: string
  OrderID: string
  placedAt: string
  estimatedDelivery: string
  deliveryNotes: string
  total: number
  serviceFee: string
  deliveryFee: string
  status: string
  deliveryPhotoUrl: string
  discount: number
  user: {
    id: string
    name: string
    email: string
    profile_picture: string
  }
  shop: {
    id: string
    name: string
    address: string
    image: string
  }
  Order_Items: OrderItem[]
  address: {
    id: string
    street: string
    city: string
    postal_code: string
    latitude: string
    longitude: string
  }
  assignedTo: {
    id: string
    name: string
    profile_picture: string
    orders: {
      aggregate: {
        count: number
      }
    }
  }
}

interface BatchDetailsPageProps {
  orderData: OrderDetailsType | null;
  error: string | null;
}

export default function BatchDetailsPage({ orderData, error }: BatchDetailsPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setLoading(true)
    try {
      const response = await fetch('/api/shopper/updateOrderStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }
      
      return await response.json()
    } catch (err) {
      console.error("Error updating order status:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }

    return (
      <ShopperLayout>
      <BatchDetails 
        orderData={orderData} 
        error={error} 
        onUpdateStatus={handleUpdateStatus}
      />
      </ShopperLayout>
    )
  }

export const getServerSideProps: GetServerSideProps<BatchDetailsPageProps> = async (context) => {
  const { id } = context.params || {};
  const session = await getSession(context);
  
  if (!id || typeof id !== 'string') {
    return {
      props: {
        orderData: null,
        error: "Order ID is required"
      }
    };
  }
  
  // GraphQL query to fetch a single order with nested details
  const GET_ORDER_DETAILS = gql`
    query GetOrderDetails($id: uuid!) {
      Orders(where: { id: { _eq: $id } }, limit: 1) {
        id
        OrderID
        placedAt: created_at
        estimatedDelivery: delivery_time
        deliveryNotes: delivery_notes
        total
        serviceFee: service_fee
        deliveryFee: delivery_fee
        status
        deliveryPhotoUrl: delivery_photo_url
        discount
        user: userByUserId {
          id
          name
          email
          profile_picture
        }
        shop: Shop {
          id
          name
          address
          image
        }
        Order_Items {
          id
          product_id
          quantity
          price
          product: Product {
            id
            name
            image
            description
            measurement_unit
            category
            quantity
            price
          }
          order_id
        }
        address: Address {
          id
          street
          city
          postal_code
          latitude
          longitude
        }
        assignedTo: User {
          id
          name
          profile_picture
          orders: Orders_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await hasuraClient.request<{ Orders: any[] }>(
      GET_ORDER_DETAILS,
      { id }
    );
    
    const order = data.Orders[0];
  if (!order) {
      return {
        props: {
          orderData: null,
          error: "Order not found"
        }
      };
    }
    
    // Format timestamps to human-readable strings
    const formattedOrder = {
      ...order,
      placedAt: new Date(order.placedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleString(
        "en-US",
        { dateStyle: "medium", timeStyle: "short" }
      ) : null,
    };
    
    return {
      props: {
        orderData: formattedOrder,
        error: null
      }
    };
  } catch (err) {
    console.error("Error fetching order details:", err);
    return {
      props: {
        orderData: null,
        error: err instanceof Error ? err.message : 'Failed to load order details'
      }
    };
  }
}
