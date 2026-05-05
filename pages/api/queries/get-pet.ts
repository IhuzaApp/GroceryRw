import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PET_BY_ID = gql`
  query GetPetById($id: uuid!) {
    pets_by_pk(id: $id) {
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
        User {
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
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ pets_by_pk: any }>(
      GET_PET_BY_ID,
      {
        id,
      }
    );

    return res.status(200).json({
      pet: result.pets_by_pk,
    });
  } catch (error: any) {
    console.error("Error fetching pet by id:", error);
    return res.status(500).json({
      error: "Failed to fetch pet",
      details: error.message,
    });
  }
}
