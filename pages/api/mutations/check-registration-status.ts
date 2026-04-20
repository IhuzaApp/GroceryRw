import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CHECK_SHOP = gql`
  query CheckShopStatus($name: String!) {
    Shops(where: { name: { _eq: $name } }, limit: 1) {
      id
      orgEmployees(limit: 1) {
        id
      }
      ai_usages(limit: 1) {
        id
      }
      reel_usages(limit: 1) {
        id
      }
      shop_subscriptions(limit: 1) {
        id
        subscription_invoices(limit: 1) {
          id
        }
      }
      merchant_wallets(limit: 1) {
        id
      }
    }
  }
`;

const CHECK_RESTAURANT = gql`
  query CheckRestaurantStatus($name: String!) {
    Restaurants(where: { name: { _eq: $name } }, limit: 1) {
      id
      orgEmployees(limit: 1) {
        id
      }
      ai_usages(limit: 1) {
        id
      }
      reel_usages(limit: 1) {
        id
      }
      shop_subscriptions(limit: 1) {
        id
        subscription_invoices(limit: 1) {
          id
        }
      }
      merchant_wallets(limit: 1) {
        id
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { businessName, businessType } = req.body;

    if (!hasuraClient || !businessName) {
      return res.status(200).json({ found: false });
    }

    let business: any = null;

    if (businessType === "RESTAURANT") {
      const data: any = await hasuraClient.request(CHECK_RESTAURANT, { name: businessName });
      business = data?.Restaurants?.[0] || null;
    } else {
      const data: any = await hasuraClient.request(CHECK_SHOP, { name: businessName });
      business = data?.Shops?.[0] || null;
    }

    if (!business) {
      return res.status(200).json({ found: false });
    }

    // Map what's already done in the DB into step booleans
    const completedSteps: number[] = [];

    // Step 1: Business exists
    completedSteps.push(1);

    // Step 2: Employee exists
    if (business.orgEmployees?.length > 0) completedSteps.push(2);

    // Step 3: AI usage exists
    if (business.ai_usages?.length > 0) completedSteps.push(3);

    // Step 4: Reel usage exists
    if (business.reel_usages?.length > 0) completedSteps.push(4);

    // Step 5: Subscription exists
    const subscription = business.shop_subscriptions?.[0];
    if (subscription) {
      completedSteps.push(5);

      // Step 6: Invoice exists
      if (subscription.subscription_invoices?.length > 0) completedSteps.push(6);
    }

    // Step 7: Wallet exists
    if (business.merchant_wallets?.length > 0) completedSteps.push(7);

    return res.status(200).json({
      found: true,
      actualBusinessId: business.id,
      completedSteps,
    });
  } catch (error: any) {
    console.error("[check-registration-status] Error:", error);
    return res.status(200).json({ found: false }); // Fail silently — just proceed normally
  }
}
