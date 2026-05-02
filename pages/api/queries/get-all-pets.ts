import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ALL_PETS = gql`
  query GetAllPets {
    pets(order_by: { updated_at: desc }) {
      id
      name
      pet_type
      breed
      age
      months
      gender
      weight
      color
      amount
      free
      quantity
      quantity_sold
      story
      vaccinated
      vaccination_cert
      vaccinations
      image
      parent_images
      video
      updated_at
      vendor_id
      pet_vendors {
        id
        fullname
        organisationName
        user: Users {
          image: profile_picture
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
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ pets: any[] }>(GET_ALL_PETS);

    return res.status(200).json({
      pets: result.pets,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch pets",
      details: error.message,
    });
  }
}
