import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL mutation to update order with delivery photo
const UPDATE_ORDER_DELIVERY_PHOTO = gql`
  mutation UpdateOrderDeliveryPhoto($orderId: uuid!, $deliveryPhoto: String!) {
    update_orders_by_pk(
      pk_columns: { id: $orderId }
      _set: { delivery_photo: $deliveryPhoto }
    ) {
      id
      delivery_photo
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
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !session.user) {
      return res.status(401).json({ error: "You must be authenticated to upload delivery photos" });
    }

    // Get the order ID and photo data from the request
    const { orderId, file } = req.body;

    if (!orderId || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert base64 to a data URL if it's not already
    const photoUrl = file.startsWith('data:') ? file : `data:image/jpeg;base64,${file}`;

    // Update the order with the delivery photo
    const data = await hasuraClient.request(UPDATE_ORDER_DELIVERY_PHOTO, {
      orderId,
      deliveryPhoto: photoUrl,
    });

    if (!data.update_orders_by_pk) {
      throw new Error("Failed to update order with delivery photo");
    }

    res.status(200).json({
      success: true,
      fileName: `delivery_photo_${orderId}`,
      photoUrl: data.update_orders_by_pk.delivery_photo,
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