import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const ADD_PET_MUTATION = gql`
  mutation AddPet(
    $age: String = ""
    $amount: String = ""
    $breed: String = ""
    $color: String = ""
    $free: Boolean = false
    $gender: String = ""
    $months: String = ""
    $name: String = ""
    $pet_type: String = ""
    $quantity: String = ""
    $quantity_sold: String = ""
    $story: String = ""
    $updated_at: timestamptz = "now()"
    $vaccination_cert: String = ""
    $vaccinated: Boolean = false
    $vaccinations: jsonb = "[]"
    $vendor_id: uuid!
    $weight: String = ""
    $image: String = ""
    $parent_images: jsonb = "[]"
    $video: String = ""
  ) {
    insert_pets(
      objects: {
        age: $age
        amount: $amount
        breed: $breed
        color: $color
        free: $free
        gender: $gender
        months: $months
        name: $name
        pet_type: $pet_type
        quantity: $quantity
        quantity_sold: $quantity_sold
        story: $story
        updated_at: $updated_at
        vaccinated: $vaccinated
        vaccination_cert: $vaccination_cert
        vaccinations: $vaccinations
        vendor_id: $vendor_id
        weight: $weight
        image: $image
        parent_images: $parent_images
        video: $video
      }
    ) {
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      age,
      amount,
      breed,
      color,
      free,
      gender,
      months,
      name,
      pet_type,
      quantity,
      quantity_sold,
      story,
      vaccinated,
      vaccination_cert,
      vaccinations,
      vendor_id,
      weight,
      images,
      videoUrl,
    } = req.body;

    if (!vendor_id) {
      return res.status(400).json({ error: "Missing vendor_id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Map images: first is main 'image', rest are 'parent_images'
    const mainImage = images && images.length > 0 ? images[0].url : "";
    const parentImages = images && images.length > 1 ? images.slice(1) : [];

    interface AddPetResponse {
      insert_pets: {
        affected_rows: number;
        returning: Array<{ id: string }>;
      };
    }

    const result = await hasuraClient.request<AddPetResponse>(
      ADD_PET_MUTATION,
      {
        age,
        amount,
        breed,
        color,
        free: free || false,
        gender,
        months,
        name,
        pet_type,
        quantity,
        quantity_sold: quantity_sold || "0",
        story,
        vaccinated: vaccinated || false,
        vaccination_cert,
        vaccinations: vaccinations || [],
        vendor_id,
        weight,
        image: mainImage,
        parent_images: parentImages,
        video: videoUrl || "",
      }
    );

    return res.status(200).json({
      success: true,
      pet: result.insert_pets.returning[0],
    });
  } catch (error: any) {
    console.error("Error adding pet:", error);
    return res.status(500).json({ error: error.message });
  }
}
