import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import ActiveBatches from "@components/shopper/activeBatchesCard";
import { AuthGuard } from "../../../src/components/AuthGuard";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";

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
  orderType: "regular" | "reel" | "restaurant";
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

function ActiveBatchesPage({ activeOrders, error }: ActiveBatchesPageProps) {
  return (
    <AuthGuard requireAuth={true} requireRole="shopper">
      <ShopperLayout>
        <ActiveBatches initialOrders={activeOrders} initialError={error} />
      </ShopperLayout>
    </AuthGuard>
  );
}

export const getServerSideProps: GetServerSideProps<
  ActiveBatchesPageProps
> = async (context) => {
  // Check authentication
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/Auth/Login",
        permanent: false,
      },
    };
  }

  // Check if user is a shopper
  if ((session.user as any)?.role !== "shopper") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Return empty initial data - let the client component fetch fresh data
  // This ensures we always get the latest data when navigating to the page
  return {
    props: {
      activeOrders: [],
      error: null,
    },
  };
};

export default ActiveBatchesPage;
