import RootLayout from "@components/ui/layout";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import UserPendingOrders from "@components/UserCarts/orders/UserPendingOrders";

// Helper to display relative time
function timeAgo(timestamp: string) {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export default function ViewOrderDetailsPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/queries/orderDetails?orderId=${orderId}`);
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [orderId]);

  if (loading) {
    return <RootLayout><p className="p-4">Loading order details...</p></RootLayout>;
  }
  if (!order) {
    return <RootLayout><p className="p-4">Order not found.</p></RootLayout>;
  }

  const { OrderID, user, shop, Order_Items, total, service_fee, delivery_fee, status, created_at } = order;
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
    <UserPendingOrders order={order} />
        </div>
      </div>
    </RootLayout>
  );
}
