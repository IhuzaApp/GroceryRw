import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL mutation to update order with delivery photo and updated_at
const UPDATE_ORDER_DELIVERY_PHOTO = gql`
  mutation UpdateOrderDeliveryPhoto($order_id: uuid!, $delivery_photo_url: String!, $updated_at: timestamptz!) {
    update_Orders(where: {id: {_eq: $order_id}}, _set: {delivery_photo_url: $delivery_photo_url, updated_at: $updated_at}) {
      affected_rows
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify the user is authenticated
    const session = await getServerSession(req, res, authOptions as any) as { user?: any };
    if (!session || !session.user) {
      return res.status(401).json({ error: "You must be authenticated to upload delivery photos" });
    }

    // Get the order ID, photo data, and updated_at from the request
    const { orderId, file, updatedAt } = req.body;

    if (!orderId || !file || !updatedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert base64 to a data URL if it's not already
    const photoUrl = file.startsWith('data:') ? file : `data:image/jpeg;base64,${file}`;

    // Check hasuraClient is not null
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Update the order with the delivery photo and updated_at
    type UpdateOrderDeliveryPhotoResponse = {
      update_Orders: {
        affected_rows: number;
      };
    };
    const data = await hasuraClient.request<UpdateOrderDeliveryPhotoResponse>(UPDATE_ORDER_DELIVERY_PHOTO, {
      order_id: orderId,
      delivery_photo_url: photoUrl,
      updated_at: updatedAt,
    });

    if (!data.update_Orders || data.update_Orders.affected_rows === 0) {
      throw new Error("Failed to update order with delivery photo");
    }

    res.status(200).json({
      success: true,
      fileName: `delivery_photo_${orderId}`,
      photoUrl: photoUrl,
    });
  } catch (error: any) {
    console.error("Error uploading delivery photo:", error);
    res.status(500).json({
      error: "Failed to upload delivery photo",
      message: error.message,
      details: error.response?.errors || "No additional details available",
    });
  }
} 