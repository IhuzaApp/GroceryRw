import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const INSERT_PACKAGE_DELIVERY = gql`
  mutation InsertPackageDelivery(
    $DeliveryCode: String = "", 
    $comment: String = "", 
    $deliveryMethod: String = "", 
    $delivery_fee: String = "", 
    $distance: String = "", 
    $dropoffDetails: jsonb = "", 
    $dropoffLocation: String = "", 
    $dropoff_latitude: String = "", 
    $dropoff_longitude: String = "", 
    $package_image: String = "", 
    $payment_method: String = "", 
    $pickupDetials: jsonb = "", 
    $pickupLocation: String = "", 
    $pickup_latitude: String = "", 
    $pickup_longitude: String = "", 
    $receiverName: String = "", 
    $receiverPhone: String = "", 
    $status: String = "", 
    $timeAndDate: json = "", 
    $user_id: uuid = ""
  ) {
    insert_package_delivery(objects: {
      DeliveryCode: $DeliveryCode, 
      comment: $comment, 
      deliveryMethod: $deliveryMethod, 
      delivery_fee: $delivery_fee, 
      distance: $distance, 
      dropoffDetails: $dropoffDetails, 
      dropoffLocation: $dropoffLocation, 
      dropoff_latitude: $dropoff_latitude, 
      dropoff_longitude: $dropoff_longitude, 
      package_image: $package_image, 
      payment_method: $payment_method, 
      pickupDetials: $pickupDetials, 
      pickupLocation: $pickupLocation, 
      pickup_latitude: $pickup_latitude, 
      pickup_longitude: $pickup_longitude, 
      receiverName: $receiverName, 
      receiverPhone: $receiverPhone, 
      scheduled: false, 
      status: $status, 
      timeAndDate: $timeAndDate, 
      user_id: $user_id
    }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate user
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id = session.user.id;

  const {
    DeliveryCode,
    comment,
    deliveryMethod,
    delivery_fee,
    distance,
    dropoffDetails,
    dropoffLocation,
    dropoff_latitude,
    dropoff_longitude,
    package_image,
    payment_method,
    pickupDetials,
    pickupLocation,
    pickup_latitude,
    pickup_longitude,
    receiverName,
    receiverPhone,
    status,
    timeAndDate,
  } = req.body;

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request(INSERT_PACKAGE_DELIVERY, {
      DeliveryCode,
      comment,
      deliveryMethod,
      delivery_fee,
      distance,
      dropoffDetails,
      dropoffLocation,
      dropoff_latitude,
      dropoff_longitude,
      package_image,
      payment_method,
      pickupDetials,
      pickupLocation,
      pickup_latitude,
      pickup_longitude,
      receiverName,
      receiverPhone,
      status: status || "PENDING",
      timeAndDate,
      user_id,
    });

    console.log("✅ Package delivery created:", result);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("❌ Error inserting package delivery:", err);
    return res.status(500).json({ error: err.message || "Failed to create package delivery" });
  }
}
