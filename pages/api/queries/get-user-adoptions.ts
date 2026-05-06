import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_USER_ADOPTIONS = gql`
  query GetUserAdoptions($customer_id: uuid!) {
    petAdoption(
      where: { customer_id: { _eq: $customer_id } }
      order_by: { created_at: desc }
    ) {
      id
      amount
      status
      created_at
      phone
      address
      comment
      pets {
        id
        name
        pet_type
        breed
        image
        amount
        parent_images
        pet_vendors {
          fullname
          organisationName
          user_id
          User {
            image: profile_picture
          }
        }
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const customer_id = (session as any).user.id;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<any>(GET_USER_ADOPTIONS, {
      customer_id,
    });

    return res.status(200).json({
      adoptions: result.petAdoption || [],
    });
  } catch (error: any) {
    console.error("Get User Adoptions Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
