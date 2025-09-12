import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import ActiveBatches from "@components/shopper/activeBatchesCard";
import { AuthGuard } from "../../../src/components/AuthGuard";

interface Order {
  id: string;
  OrderID: string;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  // Add order type and reel-specific fields
  orderType: "regular" | "reel";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
  };
  quantity?: number;
  deliveryNote?: string | null;
  customerPhone?: string;
}

interface ActiveBatchesPageProps {
  activeOrders: Order[];
  error: string | null;
}

function ActiveBatchesPage({
  activeOrders,
  error,
}: ActiveBatchesPageProps) {
  return (
    <ShopperLayout>
      <ActiveBatches initialOrders={activeOrders} initialError={error} />
    </ShopperLayout>
  );
}

export default ActiveBatchesPage;



