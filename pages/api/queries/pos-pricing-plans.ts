import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PRICING_DATA = gql`
  query GetPricingData {
    plans {
      ai_request_limit
      created_at
      description
      id
      name
      price_monthly
      price_yearly
      reel_limit
      plan_modules {
        id
        module_id
        plan_id
        module {
          created_at
          group_name
          id
          name
          slug
        }
      }
    }
  }
`;

interface PlansResponse {
  plans: Array<{
    ai_request_limit: number;
    created_at: string;
    description: string;
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
    reel_limit: number;
    plan_modules: Array<{
      id: string;
      module_id: string;
      plan_id: string;
      module: {
        created_at: string;
        group_name: string;
        id: string;
        name: string;
        slug: string;
      };
    }>;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<PlansResponse>(GET_PRICING_DATA);

    // Simplify the structure for the frontend
    const enrichedPlans = data.plans.map((plan) => ({
      ai_request_limit: parseInt(plan.ai_request_limit as any),
      created_at: plan.created_at,
      description: plan.description,
      id: plan.id,
      name: plan.name,
      price_monthly: parseFloat(plan.price_monthly as any),
      price_yearly: parseFloat(plan.price_yearly as any),
      reel_limit: parseInt(plan.reel_limit as any),
      modules: plan.plan_modules.map((pm) => ({
        id: pm.module.id,
        name: pm.module.name,
        slug: pm.module.slug,
        group_name: pm.module.group_name,
        created_at: pm.module.created_at,
      })),
    }));

    res.status(200).json({
      plans: enrichedPlans,
    });
  } catch (error: any) {
    console.error("Error fetching POS pricing data:", error);
    res.status(500).json({
      error: "Failed to fetch pricing data",
      message: error.message,
    });
  }
}
