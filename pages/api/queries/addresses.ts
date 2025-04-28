import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ADDRESSES = gql`
  query GetAddresses {
    Addresses {
      id
      user_id
      street
      city
      state
      postal_code
      created_at
    }
  }
`;

interface AddressesResponse {
  Addresses: Array<{
    id: string;
    user_id: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await hasuraClient.request<AddressesResponse>(GET_ADDRESSES);
    res.status(200).json({ addresses: data.Addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
}
