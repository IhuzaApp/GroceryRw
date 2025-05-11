import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import type { Session } from "next-auth";

// Define the Address type
interface Address {
  id: string;
  user_id: string;
  street: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
}

// GraphQL queries and mutations
const GET_ADDRESSES = gql`
  query GetAddresses($user_id: uuid!) {
    Addresses(where: { user_id: { _eq: $user_id } }) {
      id
      user_id
      street
      city
      postal_code
      is_default
      latitude
      longitude
      created_at
      updated_at
    }
  }
`;

const RESET_DEFAULT = gql`
  mutation ResetDefault($user_id: uuid!) {
    update_Addresses(
      where: { user_id: { _eq: $user_id }, is_default: { _eq: true } }
      _set: { is_default: false }
    ) {
      affected_rows
    }
  }
`;

const INSERT_ADDRESS = gql`
  mutation InsertAddress(
    $user_id: uuid!
    $street: String!
    $city: String!
    $postal_code: String!
    $is_default: Boolean!
    $latitude: String!
    $longitude: String!
  ) {
    insert_Addresses_one(
      object: {
        user_id: $user_id
        street: $street
        city: $city
        postal_code: $postal_code
        is_default: $is_default
        latitude: $latitude
        longitude: $longitude
      }
    ) {
      id
      user_id
      street
      city
      postal_code
      is_default
      latitude
      longitude
      created_at
      updated_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate
  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as Session | null;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id = session.user.id;

  if (req.method === "GET") {
    try {
      if (!hasuraClient) {
        throw new Error("Hasura client is not initialized");
      }
      const data = await hasuraClient.request<{ Addresses: Address[] }>(
        GET_ADDRESSES,
        { user_id }
      );
      return res.status(200).json({ addresses: data.Addresses });
    } catch (err) {
      console.error("Error fetching addresses:", err);
      return res.status(500).json({ error: "Failed to fetch addresses" });
    }
  }

  if (req.method === "POST") {
    const { street, city, postal_code, is_default, latitude, longitude } =
      req.body;
    if (
      !street ||
      !city ||
      !postal_code ||
      typeof is_default !== "boolean" ||
      latitude == null ||
      longitude == null
    ) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }
    try {
      if (!hasuraClient) {
        throw new Error("Hasura client is not initialized");
      }
      if (is_default) {
        await hasuraClient.request(RESET_DEFAULT, { user_id });
      }
      const inserted = await hasuraClient.request<{
        insert_Addresses_one: Address;
      }>(INSERT_ADDRESS, {
        user_id,
        street,
        city,
        postal_code,
        is_default,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
      return res.status(201).json({ address: inserted.insert_Addresses_one });
    } catch (err) {
      console.error("Error saving address:", err);
      return res.status(500).json({ error: "Failed to save address" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
