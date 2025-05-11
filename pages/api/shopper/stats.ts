import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

interface ShopperStatsResponse {
  totalDeliveries: number;
  completionRate: number;
  averageRating: number;
  totalEarnings: number;
}

interface GraphQLResponse {
  Orders_aggregate: {
    aggregate: {
      count: number;
    };
  };
  CompletedOrders: {
    aggregate: {
      count: number;
    };
  };
  Ratings_aggregate: {
    aggregate: {
      avg: {
        rating: number | null;
      } | null;
      count: number;
    };
  };
  Orders: Array<{
    id: string;
    delivery_fee: string | null;
    service_fee: string | null;
    status: string;
  }>;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = session.user.id;
    console.log("Fetching stats for user:", userId);

    // GraphQL query to get shopper stats
    const query = gql`
      query GetShopperStats($shopperId: uuid!) {
        # Get total deliveries
        Orders_aggregate(where: { shopper_id: { _eq: $shopperId } }) {
          aggregate {
            count
          }
        }
        # Get completed deliveries
        CompletedOrders: Orders_aggregate(
          where: {
            shopper_id: { _eq: $shopperId }
            status: { _eq: "delivered" }
          }
        ) {
          aggregate {
            count
          }
        }
        # Get ratings
        Ratings_aggregate(where: { shopper_id: { _eq: $shopperId } }) {
          aggregate {
            avg {
              rating
            }
            count
          }
        }
        # Get earnings
        Orders(where: { shopper_id: { _eq: $shopperId } }) {
          id
          delivery_fee
          service_fee
          status
        }
      }
    `;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<GraphQLResponse>(query, {
      shopperId: userId,
    });
    console.log("Raw stats data:", JSON.stringify(data, null, 2));

    // Calculate total deliveries
    const totalDeliveries = data.Orders_aggregate.aggregate.count || 0;

    // Calculate completion rate
    const completedDeliveries = data.CompletedOrders.aggregate.count || 0;
    const completionRate =
      totalDeliveries > 0
        ? Math.round((completedDeliveries / totalDeliveries) * 100)
        : 0;

    // Calculate average rating
    const averageRating = data.Ratings_aggregate.aggregate.avg?.rating || 0;
    const ratingCount = data.Ratings_aggregate.aggregate.count || 0;

    // Calculate total earnings
    let totalEarnings = 0;
    if (data.Orders && Array.isArray(data.Orders)) {
      totalEarnings = data.Orders.reduce((sum: number, order) => {
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");
        const orderTotal = serviceFee + deliveryFee;
        console.log(
          `Order ${order.id} (${order.status}): service_fee=${serviceFee}, delivery_fee=${deliveryFee}, total=${orderTotal}`
        );
        return sum + orderTotal;
      }, 0);
    }

    console.log("Calculated stats:", {
      totalDeliveries,
      completedDeliveries,
      completionRate,
      averageRating,
      ratingCount,
      totalEarnings,
    });

    const response: ShopperStatsResponse = {
      totalDeliveries,
      completionRate,
      averageRating,
      totalEarnings,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching shopper stats:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to fetch shopper stats" });
  }
};

export default handler;
