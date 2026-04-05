import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

const GET_SYSTEM_CONFIG = gql`
  query getSystemConfiguration {
    System_configuratioins {
      allowScheduledDeliveries
      baseDeliveryFee
      cappedDistanceFee
      currency
      deliveryCommissionPercentage
      discounts
      distanceSurcharge
      enableRush
      extraUnits
      id
      productCommissionPercentage
      rushHourSurcharge
      rushHours
      serviceFee
      shoppingTime
      suggestedMinimumTip
      tax
      unitsSurcharge
      withDrawCharges
      deliveryModes
    }
  }
`;

interface SystemConfigResponse {
  System_configuratioins: Array<{
    allowScheduledDeliveries: boolean;
    baseDeliveryFee: string;
    cappedDistanceFee: string;
    currency: string;
    deliveryCommissionPercentage: string;
    discounts: any;
    distanceSurcharge: string;
    enableRush: boolean;
    extraUnits: string;
    id: string;
    productCommissionPercentage: string;
    rushHourSurcharge: string;
    rushHours: any;
    serviceFee: string;
    shoppingTime: string;
    suggestedMinimumTip: string;
    tax: string;
    unitsSurcharge: string;
    withDrawCharges: string;
    deliveryModes: any;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await hasuraClient.request<SystemConfigResponse>(
      GET_SYSTEM_CONFIG
    );

    const config = data.System_configuratioins[0] || null;

    return res.status(200).json({ config });
  } catch (error: any) {
    console.error("Error fetching system configuration:", error);
    return res.status(500).json({
      error: "Failed to fetch system configuration",
      details: error.message,
    });
  }
}
